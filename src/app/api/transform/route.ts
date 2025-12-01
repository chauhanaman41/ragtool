import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
    try {
        const { text } = await req.json();

        console.log('Transform endpoint received text:', !!text);
        console.log('Text length:', text?.length || 0);
        console.log('Text type:', typeof text);
        console.log('First 100 chars:', text?.substring(0, 100));

        if (!text) {
            return NextResponse.json({ error: 'No text provided' }, { status: 400 });
        }

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
        }

        const openai = new OpenAI({
            apiKey: apiKey,
        });

        // Truncate text if too long
        const maxLength = 12000; // GPT has token limits
        const truncatedText = text.length > maxLength ? text.substring(0, maxLength) + '...' : text;

        // Generate LinkedIn post
        const linkedinPrompt = `Based on the following content, create a professional LinkedIn post (150-200 words) that highlights key insights and encourages engagement. Use emojis sparingly and include 3-5 relevant hashtags at the end.

Content: ${truncatedText}

LinkedIn Post:`;

        const linkedinResponse = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: linkedinPrompt }],
            temperature: 0.7,
            max_tokens: 500,
        });
        const linkedin = linkedinResponse.choices[0].message.content || '';

        // Generate Twitter thread
        const twitterPrompt = `Based on the following content, create a Twitter/X thread of 4-6 tweets. Each tweet should be under 280 characters. The first tweet should be a hook, and the last should include a call to action with 2-3 hashtags.

Content: ${truncatedText}

Twitter Thread (return each tweet on a new line, numbered 1-6):`;

        const twitterResponse = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: twitterPrompt }],
            temperature: 0.7,
            max_tokens: 800,
        });
        const twitterText = twitterResponse.choices[0].message.content || '';
        // Split into array of tweets and clean up
        const twitter = twitterText
            .split('\n')
            .filter(t => t.trim().length > 0)
            .map(t => t.replace(/^\d+[\.\)]\s*/, '').trim()); // Remove numbers like "1." or "1)"

        // Generate blog post
        const blogPrompt = `Based on the following content, create a short blog post (400-500 words) with:
- An engaging title with ##
- Clear introduction
- 3-4 key points with subheadings (###)
- A conclusion with call to action

Use markdown formatting.

Content: ${truncatedText}

Blog Post:`;

        const blogResponse = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: blogPrompt }],
            temperature: 0.7,
            max_tokens: 1500,
        });
        const blog = blogResponse.choices[0].message.content || '';

        // Generate YouTube description
        const youtubePrompt = `Based on the following content, create a YouTube video description (200-300 words) with:
- A compelling hook in the first 2 lines
- Key points covered in the video
- Relevant hashtags (5-8)
- Call to action (subscribe, like, comment)
- Timestamps placeholder if applicable

Content: ${truncatedText}

YouTube Description:`;

        const youtubeResponse = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: youtubePrompt }],
            temperature: 0.7,
            max_tokens: 600,
        });
        const youtube = youtubeResponse.choices[0].message.content || '';

        // Generate Email draft
        const emailPrompt = `Based on the following content, create a professional email draft with:
- Catchy subject line
- Friendly greeting
- Brief introduction
- 3-4 key points from the content
- Clear call to action
- Professional signature placeholder

Format as a complete email.

Content: ${truncatedText}

Email Draft:`;

        const emailResponse = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: emailPrompt }],
            temperature: 0.7,
            max_tokens: 800,
        });
        const email = emailResponse.choices[0].message.content || '';

        // Generate Instagram caption
        const instagramPrompt = `Based on the following content, create an engaging Instagram caption with:
- Attention-grabbing opening line
- 3-5 short paragraphs with emojis
- Question to encourage engagement
- 10-15 relevant hashtags at the end
- Keep it under 2200 characters

Content: ${truncatedText}

Instagram Caption:`;

        const instagramResponse = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: instagramPrompt }],
            temperature: 0.7,
            max_tokens: 600,
        });
        const instagram = instagramResponse.choices[0].message.content || '';

        return NextResponse.json({
            linkedin,
            twitter,
            blog,
            youtube,
            email,
            instagram,
        });
    } catch (error: any) {
        console.error('Error transforming content:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to transform content' },
            { status: 500 }
        );
    }
}
