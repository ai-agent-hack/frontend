import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { mastra } from '../../../../mastra';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const agent = mastra.getAgent('weatherAgent');
  
  // Use the Mastra agent for the latest message
  const lastMessage = messages[messages.length - 1];
  
  try {
    const result = await agent.generate(lastMessage.content);
    
    // Return streaming response using AI SDK
    const stream = streamText({
      model: openai('gpt-4o-mini'),
      messages: [
        ...messages.slice(0, -1),
        { role: 'assistant', content: result.text }
      ],
    });

    return stream.toDataStreamResponse();
  } catch (error) {
    // Fallback to direct OpenAI if Mastra agent fails
    const stream = streamText({
      model: openai('gpt-4o-mini'),
      messages,
    });

    return stream.toDataStreamResponse();
  }
}