import { mastra } from '../../../../mastra';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const agent = mastra.getAgent('weatherAgent');
  
  try {
    const stream = await agent.stream(messages);
    return stream.toDataStreamResponse();
  } catch (error) {
    console.error('Error in chat API:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}