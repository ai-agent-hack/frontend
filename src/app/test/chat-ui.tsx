"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import { useState, useEffect, useRef } from "react";
import { outputSchema, recommendSpotInputSchema } from "../../../common/type";

type Message = {
  role: "user" | "assistant";
  content: string;
};

// ---------------------------------------------------------
// 2. Chat UI コンポーネント
// ---------------------------------------------------------
export default function ChatUI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  // --- Mastra へのストリーム接続 -----------------------------------
  const { object, submit, isLoading, error } = useObject({
    api: "/api/chat", // エンドポイントは適宜変更
    schema: outputSchema,
  });

  // スクロールを常に最下部へ
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ストリーミングで message が更新されるたびに表示を反映
  useEffect(() => {
    if (!object?.message) return; // message が undefined の時は何もしない

    setMessages((prev): Message[] => {
      const last = prev[prev.length - 1];

      // 直前の assistant バブルをインクリメンタルに更新
      if (last && last.role === "assistant") {
        return [
          ...prev.slice(0, -1),
          { ...last, content: object.message! }, // ここで ! で undefined 排除
        ];
      }

      // 新規 assistant バブルを追加
      const assistantMsg: Message = {
        role: "assistant",
        content: object.message!, // 同じく !
      };
      return [...prev, assistantMsg];
    });
  }, [object?.message]);

  //-------------------------------------------------------------------
  // フォーム送信
  //-------------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = {
      role: "user",
      content: input.trim(),
    };

    // 1) 画面に即時反映
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");

    const requestData = recommendSpotInputSchema.parse({
      messages: nextMessages.map(({ role, content }) => ({ role, content })),
      recommendSpotObject: object?.recommendSpotObject,
    });

    // 2) Mastra に送信
    try {
      await submit(requestData);
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------------------------------------------------
  // 3. 画面描画
  // ---------------------------------------------------------
  return (
    <div className="mx-auto max-w-xl space-y-4 p-4">
      {/* チャットログ */}
      <div className="h-96 overflow-y-auto rounded border bg-gray-50 p-3">
        {messages.map((m) => (
          <div
            key={m.content}
            className={`mb-2 w-fit max-w-[80%] rounded-lg px-3 py-2 text-sm ${
              m.role === "user" ? "ml-auto bg-blue-200" : "mr-auto bg-purple-200"
            }`}
          >
            {m.role === "user" ? "ユーザー: " : "AI: "}
            {m.content}
          </div>
        ))}

        {/* 送信中インジケータ */}
        {isLoading && (
          <div className="mr-auto mb-2 w-fit max-w-[80%] animate-pulse rounded-lg bg-purple-200 px-3 py-2 text-sm">
            …
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* スポットカード */}
      {object?.recommendSpotObject && (
        <div className="rounded-lg border p-4 shadow">
          <h3 className="mb-2 text-lg font-semibold">
            {object.recommendSpotObject.name}
          </h3>
          <p className="mb-1 text-sm text-gray-600">
            ベストタイム: {object.recommendSpotObject.bestTime}
          </p>
          <p className="mb-2 text-sm text-gray-700">
            {object.recommendSpotObject.description}
          </p>
          <p className="text-sm text-gray-500">
            理由: {object.recommendSpotObject.reason}
          </p>
          <p className="mt-2 text-xs text-gray-400">
            ({object.recommendSpotObject.lat}, {object.recommendSpotObject.lng})
          </p>
        </div>
      )}

      {/* 入力フォーム */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          className="flex-1 rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="気になる場所を聞いてみよう…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          disabled={isLoading}
        >
          送信
        </button>
      </form>

      {error && <p className="text-sm text-red-500">{String(error)}</p>}
    </div>
  );
}
