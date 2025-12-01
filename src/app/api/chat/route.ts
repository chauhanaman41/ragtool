import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { messages, context } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
        }

        const lastMessage = messages[messages.length - 1];
        const userQuestion = lastMessage.content.toLowerCase();

        // Simulate AI delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        let answer = "I'm not sure about that based on the content provided.";

        if (context) {
            if (userQuestion.includes('summary') || userQuestion.includes('summarize')) {
                answer = "Based on the content, here is a summary: The article discusses the importance of content repurposing to maximize reach and efficiency. It highlights strategies like creating micro-content and visual transformations.";
            } else if (userQuestion.includes('tone')) {
                answer = "The tone of the content appears to be professional, informative, and encouraging.";
            } else if (userQuestion.includes('platform')) {
                answer = "The content mentions LinkedIn, Twitter, and Blogs as key platforms for repurposing.";
            } else {
                answer = `That's a great question about "${userQuestion}". Based on the text, I can tell you that effective repurposing involves adapting the message for each specific channel rather than just copying it.`;
            }
        } else {
            answer = "Please generate content first so I have some context to answer your questions!";
        }

        return NextResponse.json({ role: 'assistant', content: answer });
    } catch (error) {
        console.error('Error in chat:', error);
        return NextResponse.json(
            { error: 'Failed to generate chat response' },
            { status: 500 }
        );
    }
}
