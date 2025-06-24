"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import {
  Box,
  Button,
  Flex,
  HStack,
  Input,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import type { RecommendedSpots } from "@/types/mastra";
import { outputSchema } from "../../../mastra/schema/output";

type Message = {
  role: "user" | "assistant";
  content: string;
};

interface ChatPaneProps {
  onRecommendSpotUpdate?: (recommendSpotObject: RecommendedSpots) => void;
}

export default function ChatPane({ onRecommendSpotUpdate }: ChatPaneProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/noUnusedVariables: tmp
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

  useEffect(() => {
    if (object?.recommendSpotObject && onRecommendSpotUpdate) {
      onRecommendSpotUpdate(object.recommendSpotObject as RecommendedSpots);
    }
  }, [object?.recommendSpotObject, onRecommendSpotUpdate]);

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
    <VStack height="100%" width="100%" p={4} gap={4}>
      <Box flex="1" height="100%" width="100%" overflowY="auto" p={3}>
        <VStack gap={2} align="stretch" height="100%">
          {messages.map((m, index) => (
            <Flex
              key={`${m.content}-${index}`}
              justify={m.role === "user" ? "flex-end" : "flex-start"}
            >
              <Box
                maxW="80%"
                bg={m.role === "user" ? "blue.100" : "purple.100"}
                borderRadius="lg"
                px={3}
                py={2}
                fontSize="sm"
              >
                <Text fontWeight="medium" color="gray.600" fontSize="xs">
                  {m.role === "user" ? "ユーザー" : "AI"}
                </Text>
                <Text color="gray.600">{m.content}</Text>
              </Box>
            </Flex>
          ))}

          {isLoading && (
            <Flex justify="flex-start">
              <Box
                maxW="80%"
                bg="purple.100"
                borderRadius="lg"
                px={3}
                py={2}
                fontSize="sm"
                color="gray.600"
              >
                <HStack gap={2}>
                  <Spinner size="sm" />
                  <Text color="gray.600">…</Text>
                </HStack>
              </Box>
            </Flex>
          )}
          <div ref={endRef} />
        </VStack>
      </Box>

      <Box as="form" onSubmit={handleSubmit} width="100%">
        <HStack gap={2}>
          <Input
            placeholder="気になる場所を聞いてみよう…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            size="sm"
            flex="1"
          />
          <Button
            type="submit"
            colorScheme="blue"
            size="sm"
            loading={isLoading}
            disabled={isLoading}
          >
            送信
          </Button>
        </HStack>
      </Box>
    </VStack>
  );
}
