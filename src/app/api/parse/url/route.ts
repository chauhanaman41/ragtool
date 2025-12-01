import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
        }

        // Use Jina AI Reader API to extract content from any URL
        // This handles JavaScript-rendered pages and returns clean article text
        const jinaUrl = `https://r.jina.ai/${url}`;

        const response = await fetch(jinaUrl, {
            headers: {
                'Accept': 'text/plain',
                'X-Return-Format': 'markdown',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch URL: ${response.statusText}`);
        }

        // Jina returns the content as plain text/markdown
        const text = await response.text();

        console.log('URL parsed via Jina AI, text length:', text.length);

        if (!text || text.trim().length < 100) {
            return NextResponse.json({
                error: 'Could not extract sufficient text from URL. The page might be behind a paywall or require login.'
            }, { status: 400 });
        }

        // Limit text length to avoid token limits
        const truncatedText = text.slice(0, 20000);
        console.log('Truncated text length:', truncatedText.length);
        console.log('First 200 chars:', truncatedText.substring(0, 200));

        return NextResponse.json({ text: truncatedText });
    } catch (error: any) {
        console.error('Error parsing URL:', error);
        return NextResponse.json(
            { error: `Failed to parse URL: ${error.message}` },
            { status: 500 }
        );
    }
}
