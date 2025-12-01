import { NextRequest, NextResponse } from 'next/server';
import PDFParser from 'pdf2json';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const mammoth = require('mammoth');

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let text = '';

    if (file.type === 'application/pdf') {
      // Use pdf2json to parse PDF
      const pdfParser = new PDFParser();

      // Create a promise to handle the async parsing
      text = await new Promise<string>((resolve, reject) => {
        pdfParser.on('pdfParser_dataError', (errData: any) => {
          reject(new Error(errData.parserError));
        });

        pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
          // Extract text from parsed PDF data
          console.log('PDF parsed, has Pages:', !!pdfData?.Pages);
          console.log('Number of pages:', pdfData?.Pages?.length);

          const textParts: string[] = [];

          if (pdfData && pdfData.Pages) {
            pdfData.Pages.forEach((page: any, pageIndex: number) => {
              console.log(`Page ${pageIndex} has Texts:`, !!page.Texts, 'count:', page.Texts?.length);
              if (page.Texts) {
                page.Texts.forEach((text: any) => {
                  if (text.R) {
                    text.R.forEach((r: any) => {
                      if (r.T) {
                        // Decode URI component as pdf2json encodes text
                        try {
                          textParts.push(decodeURIComponent(r.T));
                        } catch (e) {
                          // If decoding fails, use the raw text
                          textParts.push(r.T);
                        }
                      }
                    });
                  }
                });
              }
            });
          }

          console.log('Total text parts collected:', textParts.length);
          resolve(textParts.join(' '));
        });

        // Parse the PDF buffer
        pdfParser.parseBuffer(buffer);
      });
    } else if (
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload PDF or DOCX.' },
        { status: 400 }
      );
    }

    console.log('Extracted text length:', text.length);
    console.log('First 200 chars:', text.substring(0, 200));

    return NextResponse.json({ text });
  } catch (error) {
    console.error('Error parsing document:', error);
    return NextResponse.json(
      { error: 'Failed to parse document' },
      { status: 500 }
    );
  }
}
