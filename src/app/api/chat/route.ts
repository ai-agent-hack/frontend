import { mastra } from '../../../../mastra';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = await req.json();

  try {
    const workflow = mastra.getWorkflow('recommendSpotWorkflow');
    const run      = workflow.createRun();
    const result  = await run.start({ inputData: { messages } });

    const text =
      (result as any)?.result?.text ??
      (result as any)?.text ??
      'No response';


    // TODO // textの取得返却はできているが チャット画面での表示ができていない（useChatの形にあっていないため）
    console.log(text);

    // ---------- DataStream を生成してレスポンス ----------
    return new Response(JSON.stringify({ text }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    console.error('chat API error:', err);
    // エラーストリームを即返却
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
