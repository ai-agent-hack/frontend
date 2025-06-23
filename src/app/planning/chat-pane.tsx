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
import { outputSchema } from "../../../mastra/schema/output";

type Message = {
  role: "user" | "assistant";
  content: string;
};

interface ChatPaneProps {
  onRecommendSpotUpdate?: (recommendSpotObject: unknown) => void;
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
      onRecommendSpotUpdate(object.recommendSpotObject);
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
      <Text fontWeight="bold" fontSize="2xl">
        Chat
      </Text>

      <Box flex="1" height="100%" width="100%" overflowY="auto" p={3}>
        <VStack gap={2} align="stretch">
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

      {/* {error && (
        <Box
          width="100%"
          bg="red.50"
          border="1px solid"
          borderColor="red.200"
          borderRadius="md"
          p={3}
        >
          <Text fontSize="sm" color="red.600">
            {String(error)}
          </Text>
        </Box>
      )}

      {object?.recommendSpotObject && (
        <Box
          width="100%"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="lg"
          p={4}
          bg="white"
          boxShadow="sm"
          maxH="200px"
          overflowY="auto"
        >
          <Text fontSize="md" fontWeight="semibold" mb={3}>
            推薦ID: {object.recommendSpotObject.recommend_spot_id}
          </Text>
          <VStack gap={3} align="stretch">
            {object.recommendSpotObject.recommend_spots?.map((timeSlot) => (
              <Box key={timeSlot?.time_slot}>
                <Text fontSize="sm" fontWeight="medium" color="blue.600" mb={2}>
                  {timeSlot?.time_slot}
                </Text>
                <VStack gap={2} align="stretch" pl={4}>
                  {timeSlot?.spots?.map((spot) => (
                    <Box
                      key={spot?.spot_id}
                      borderLeft="2px solid"
                      borderColor="gray.300"
                      pl={3}
                    >
                      <Text fontSize="sm" fontWeight="semibold">
                        {spot?.details?.name}
                      </Text>
                      <Text fontSize="xs" color="gray.600">
                        料金: ¥{spot?.details?.price?.toLocaleString() || "0"}
                      </Text>
                      <Text fontSize="xs" color="gray.700">
                        {spot?.recommendation_reason}
                      </Text>
                      <Text fontSize="xs" color="gray.400">
                        ({spot?.latitude}, {spot?.longitude})
                      </Text>
                    </Box>
                  ))}
                </VStack>
              </Box>
            ))}
          </VStack>
        </Box>
      )} */}
    </VStack>
  );
}
