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
import { FaRobot, FaUser } from "react-icons/fa";
import type { RecommendedSpots } from "@/types/mastra";
import { outputSchema } from "../../../mastra/schema/output";

type Message = {
  role: "user" | "assistant";
  content: string;
};

interface ChatPaneProps {
  onRecommendSpotUpdate?: (recommendSpotObject: RecommendedSpots) => void;
  initialMessage?: string;
  recommendedSpots?: RecommendedSpots | null;
  planId?: string;
}

export default function ChatPane({
  onRecommendSpotUpdate,
  initialMessage,
  recommendedSpots,
  planId,
}: ChatPaneProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<number | null>(
    null,
  );
  const endRef = useRef<HTMLDivElement>(null);

  const { object, submit, isLoading } = useObject({
    api: "/api/chat",
    schema: outputSchema,
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll to bottom on messages updated
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: tmp
  useEffect(() => {
    if (initialMessage && messages.length === 0) {
      setIsTyping(true);
      setMessages([
        {
          role: "assistant",
          content: "",
        },
      ]);

      // Wait 0.5 seconds before starting typewriter effect
      const delayTimeout = setTimeout(() => {
        // Typewriter effect with variable speed
        let currentIndex = 0;

        const typeNextChar = () => {
          if (currentIndex < initialMessage.length) {
            setMessages((prev) => {
              const newMessages = [...prev];
              if (newMessages[0]) {
                newMessages[0].content = initialMessage.slice(
                  0,
                  currentIndex + 1,
                );
              }
              return newMessages;
            });
            currentIndex++;

            // Variable typing speed
            let nextDelay = 13; // base speed
            const currentChar = initialMessage[currentIndex - 1];
            const nextChar = initialMessage[currentIndex];

            // Add delays for more natural typing
            if (
              currentChar === "。" ||
              currentChar === "！" ||
              currentChar === "？"
            ) {
              nextDelay = 200 + Math.random() * 200; // Pause after sentence
            } else if (currentChar === "、" || currentChar === ":") {
              nextDelay = 100 + Math.random() * 100; // Small pause after comma
            } else if (currentChar === "\n") {
              nextDelay = 150 + Math.random() * 150; // Pause at line breaks
            } else if (nextChar === " " || currentChar === " ") {
              nextDelay = 50 + Math.random() * 30; // Quick for spaces
            } else {
              // Random variation for normal characters
              nextDelay = 15 + Math.random() * 40;
            }

            setTimeout(typeNextChar, nextDelay);
          } else {
            setIsTyping(false);
          }
        };

        typeNextChar();
      }, 500); // 0.5 second delay

      return () => {
        clearTimeout(delayTimeout);
        setIsTyping(false);
      };
    }
  }, [initialMessage]);

  useEffect(() => {
    if (!object?.message) return;

    setMessages((prev): Message[] => {
      const last = prev[prev.length - 1];

      // If this is a new message, add it
      if (
        !last ||
        last.role !== "assistant" ||
        last.content === object.message
      ) {
        const newMessage: Message = {
          role: "assistant",
          content: "",
        };
        setStreamingMessageId(prev.length);
        return [...prev, newMessage];
      }

      return prev;
    });
  }, [object?.message]);

  // Streaming effect for AI responses
  useEffect(() => {
    if (streamingMessageId === null || !object?.message) return;

    const targetMessage = object.message;
    let currentIndex = 0;

    const streamNextChar = () => {
      if (currentIndex < targetMessage.length) {
        setMessages((prev) => {
          const newMessages = [...prev];
          if (newMessages[streamingMessageId]) {
            newMessages[streamingMessageId].content = targetMessage.slice(
              0,
              currentIndex + 1,
            );
          }
          return newMessages;
        });
        currentIndex++;

        // Variable typing speed for more natural effect
        let nextDelay = 20; // base speed
        const currentChar = targetMessage[currentIndex - 1];

        if (
          currentChar === "。" ||
          currentChar === "！" ||
          currentChar === "？"
        ) {
          nextDelay = 150 + Math.random() * 100;
        } else if (currentChar === "、" || currentChar === "，") {
          nextDelay = 80 + Math.random() * 50;
        } else if (currentChar === "\n") {
          nextDelay = 100 + Math.random() * 50;
        } else {
          nextDelay = 15 + Math.random() * 25;
        }

        setTimeout(streamNextChar, nextDelay);
      } else {
        setStreamingMessageId(null);
      }
    };

    streamNextChar();
  }, [streamingMessageId, object?.message]);

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
      planId: planId,
      messages: nextMessages.map(({ role, content }) => ({ role, content })),
      ...(recommendedSpots && {
        recommendSpotObject: recommendedSpots,
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
              gap={2}
            >
              {m.role === "assistant" && (
                <Box
                  flexShrink={0}
                  w={8}
                  h={8}
                  bg="purple.100"
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  color="purple.600"
                >
                  <FaRobot size={16} />
                </Box>
              )}
              <Box
                maxW="70%"
                bg={m.role === "user" ? "blue.50" : "gray.50"}
                color={m.role === "user" ? "blue.900" : "gray.700"}
                borderRadius="2xl"
                borderTopLeftRadius={m.role === "assistant" ? "sm" : "2xl"}
                borderTopRightRadius={m.role === "user" ? "sm" : "2xl"}
                px={4}
                py={2.5}
                fontSize="sm"
                boxShadow="sm"
                border="1px solid"
                borderColor={m.role === "user" ? "blue.100" : "gray.200"}
              >
                <Text whiteSpace="pre-line" lineHeight="1.6">
                  {m.content}
                </Text>
              </Box>
              {m.role === "user" && (
                <Box
                  flexShrink={0}
                  w={8}
                  h={8}
                  bg="blue.100"
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  color="blue.600"
                >
                  <FaUser size={14} />
                </Box>
              )}
            </Flex>
          ))}

          {isLoading && streamingMessageId === null && (
            <Flex justify="center" pt={3}>
              <Box
                bg="white"
                borderRadius="xl"
                px={6}
                py={4}
                boxShadow="lg"
                border="1px solid"
                borderColor="purple.200"
                position="relative"
                _before={{
                  content: '""',
                  position: "absolute",
                  top: "-8px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 0,
                  height: 0,
                  borderLeft: "8px solid transparent",
                  borderRight: "8px solid transparent",
                  borderBottom: "8px solid",
                  borderBottomColor: "purple.200",
                }}
                _after={{
                  content: '""',
                  position: "absolute",
                  top: "-6px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 0,
                  height: 0,
                  borderLeft: "6px solid transparent",
                  borderRight: "6px solid transparent",
                  borderBottom: "6px solid white",
                }}
              >
                <VStack gap={2}>
                  <HStack gap={2}>
                    <Spinner size="sm" color="purple.400" />
                    <Text color="purple.600" fontWeight="bold" fontSize="sm">
                      AIが考えています...
                    </Text>
                  </HStack>
                  <Text color="gray.600" fontSize="xs">
                    あなたにぴったりのスポットを探しています
                  </Text>
                </VStack>
              </Box>
            </Flex>
          )}

          {!recommendedSpots && !isTyping && (
            <Flex justify="center" pt={4}>
              <Box
                bg="white"
                borderRadius="xl"
                px={6}
                py={4}
                boxShadow="lg"
                border="1px solid"
                borderColor="orange.200"
                position="relative"
                _before={{
                  content: '""',
                  position: "absolute",
                  top: "-8px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 0,
                  height: 0,
                  borderLeft: "8px solid transparent",
                  borderRight: "8px solid transparent",
                  borderBottom: "8px solid",
                  borderBottomColor: "orange.200",
                }}
                _after={{
                  content: '""',
                  position: "absolute",
                  top: "-6px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 0,
                  height: 0,
                  borderLeft: "6px solid transparent",
                  borderRight: "6px solid transparent",
                  borderBottom: "6px solid white",
                }}
              >
                <VStack gap={2}>
                  <HStack gap={2}>
                    <Spinner size="sm" color="orange.400" />
                    <Text color="orange.600" fontWeight="bold" fontSize="sm">
                      AIが分析しています...
                    </Text>
                  </HStack>
                  <Text color="gray.600" fontSize="xs" textAlign="center">
                    あなたの希望をもとに
                    <br />
                    最適なスポットを選定中です!
                  </Text>
                </VStack>
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
            disabled={
              isLoading ||
              isTyping ||
              !recommendedSpots ||
              streamingMessageId !== null
            }
          >
            送信
          </Button>
        </HStack>
      </Box>
    </VStack>
  );
}
