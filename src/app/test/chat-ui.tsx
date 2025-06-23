"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import { outputSchema } from "../../../mastra/schema/output";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatUI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const { object, submit, isLoading, error } = useObject({
    api: "/api/chat",
    schema: outputSchema,
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll to bottom on messages updated
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setMessages((prev): Message[] => {
      if (!object?.message) return prev;
      const last = prev[prev.length - 1];

      if (last && last.role === "assistant") {
        return [
          ...prev.slice(0, -1),
          { ...last, content: object?.message ?? "" },
        ];
      }

      const assistantMsg: Message = {
        role: "assistant",
        content: object?.message ?? "",
      };
      return [...prev, assistantMsg];
    });
  }, [object?.message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = {
      role: "user",
      content: input.trim(),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");

    const requestData = {
      messages: nextMessages.map(({ role, content }) => ({ role, content })),
      ...(object?.recommendSpotObject && {
        recommendSpotObject: object.recommendSpotObject,
      }),
    };

    try {
      submit(requestData);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-4 p-4">
      <div className="h-96 overflow-y-auto rounded border bg-gray-50 p-3">
        {messages.map((m) => (
          <div
            key={m.content}
            className={`mb-2 w-fit max-w-[80%] rounded-lg px-3 py-2 text-sm ${
              m.role === "user"
                ? "ml-auto bg-blue-200"
                : "mr-auto bg-purple-200"
            }`}
          >
            {m.role === "user" ? "ユーザー: " : "AI: "}
            {m.content}
          </div>
        ))}

        {isLoading && (
          <div className="mr-auto mb-2 w-fit max-w-[80%] animate-pulse rounded-lg bg-purple-200 px-3 py-2 text-sm">
            …
          </div>
        )}
        <div ref={endRef} />
      </div>

      <br />

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

      <br />

      <div>
        <h2>おすすめスポットオブジェクト</h2>
      </div>

      {object?.recommendSpotObject && (
        <div className="rounded-lg border p-4 shadow">
          <h3 className="mb-3 text-lg font-semibold">
            推薦ID: {object.recommendSpotObject.recommend_spot_id}
          </h3>
          {object.recommendSpotObject.recommend_spots?.map((timeSlot) => (
            <div key={timeSlot?.time_slot} className="mb-4">
              <h4 className="mb-2 text-md font-medium text-blue-600">
                {timeSlot?.time_slot}
              </h4>
              {timeSlot?.spots?.map((spot) => (
                <div
                  key={spot?.spot_id}
                  className="mb-2 ml-4 border-l-2 border-gray-300 pl-3"
                >
                  <p className="font-semibold">{spot?.details?.name}</p>
                  <p className="text-sm text-gray-600">
                    料金: ¥{spot?.details?.price?.toLocaleString() || "0"}
                  </p>
                  <p className="text-sm text-gray-700">
                    {spot?.recommendation_reason}
                  </p>
                  <p className="text-xs text-gray-400">
                    ({spot?.latitude}, {spot?.longitude})
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
