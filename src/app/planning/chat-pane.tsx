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
import { useCallback, useEffect, useRef, useState } from "react";
import { FaRobot, FaUser } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { RecommendedSpots } from "@/types/mastra";
import { outputSchema } from "../../../mastra/schema/output";

type Message = {
  role: "user" | "assistant";
  content: string;
};

interface ChatPaneProps {
  onRecommendSpotUpdate?: (recommendSpotObject: RecommendedSpots) => void;
  onCoordinatesUpdate?: (
    coordinates: Array<{ lat: number; lng: number }>,
  ) => void;
  initialMessage?: string;
  recommendedSpots?: RecommendedSpots | null;
  planId?: string;
  triggerMessage?: string | null;
  onTriggerMessageHandled?: () => void;
}

export default function ChatPane({
  onRecommendSpotUpdate,
  onCoordinatesUpdate,
  initialMessage,
  recommendedSpots,
  planId,
  triggerMessage,
  onTriggerMessageHandled,
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

            // Variable typing speed (faster)
            let nextDelay = 8; // base speed (reduced from 13)
            const currentChar = initialMessage[currentIndex - 1];
            const nextChar = initialMessage[currentIndex];

            // Add delays for more natural typing
            if (
              currentChar === "。" ||
              currentChar === "！" ||
              currentChar === "？"
            ) {
              nextDelay = 100 + Math.random() * 100; // Pause after sentence (reduced from 200-400)
            } else if (currentChar === "、" || currentChar === ":") {
              nextDelay = 50 + Math.random() * 50; // Small pause after comma (reduced from 100-200)
            } else if (currentChar === "\n") {
              nextDelay = 75 + Math.random() * 75; // Pause at line breaks (reduced from 150-300)
            } else if (nextChar === " " || currentChar === " ") {
              nextDelay = 25 + Math.random() * 15; // Quick for spaces (reduced from 50-80)
            } else {
              // Random variation for normal characters
              nextDelay = 8 + Math.random() * 20; // (reduced from 15-55)
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

        // Variable typing speed for more natural effect (faster)
        let nextDelay = 10; // base speed (reduced from 20)
        const currentChar = targetMessage[currentIndex - 1];

        if (
          currentChar === "。" ||
          currentChar === "！" ||
          currentChar === "？"
        ) {
          nextDelay = 75 + Math.random() * 50; // (reduced from 150-250)
        } else if (currentChar === "、" || currentChar === "，") {
          nextDelay = 40 + Math.random() * 25; // (reduced from 80-130)
        } else if (currentChar === "\n") {
          nextDelay = 50 + Math.random() * 25; // (reduced from 100-150)
        } else {
          nextDelay = 8 + Math.random() * 12; // (reduced from 15-40)
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

  useEffect(() => {
    if (object?.coordinates && onCoordinatesUpdate) {
      onCoordinatesUpdate(
        object.coordinates as Array<{ lat: number; lng: number }>,
      );
    }
  }, [object?.coordinates, onCoordinatesUpdate]);

  const submitMessage = useCallback(
    (messageContent: string) => {
      if (!messageContent || !messageContent.trim()) return;

      const userMsg: Message = {
        role: "user",
        content: messageContent.trim(),
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
    },
    [messages, planId, recommendedSpots, submit],
  );

  useEffect(() => {
    if (triggerMessage?.trim()) {
      submitMessage(triggerMessage);
      if (onTriggerMessageHandled) {
        onTriggerMessageHandled();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerMessage, onTriggerMessageHandled, submitMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    submitMessage(input);
  };

  return (
    <VStack height="100%" width="100%" gap={0}>
      <Box flex="1" width="100%" overflowY="auto" p={4}>
        <VStack gap={4} align="stretch">
          {messages.map((m, index) => (
            <Flex
              key={`${m.content}-${index}`}
              justify={m.role === "user" ? "flex-end" : "flex-start"}
              gap={2}
              mb={index < messages.length - 1 ? 2 : 0}
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
                boxShadow="0 0 15px rgba(0, 0, 0, 0.1)"
                border="1px solid"
                borderColor={m.role === "user" ? "blue.100" : "border"}
              >
                {m.role === "assistant" ? (
                  <Box
                    css={{
                      "& > *:first-of-type": {
                        marginTop: 0,
                      },
                      "& > *:last-child": {
                        marginBottom: 0,
                      },
                      "& p": {
                        margin: 0,
                        marginBottom: "0.5em",
                        lineHeight: "1.6",
                        display: "block",
                      },
                      "& p:last-child": {
                        marginBottom: 0,
                      },
                      "& ul, & ol": {
                        marginLeft: "1.5em",
                        marginTop: "0.5em",
                        marginBottom: "0.5em",
                      },
                      "& li": {
                        marginBottom: "0.25em",
                      },
                      "& strong": {
                        fontWeight: "bold",
                        color: m.role === "assistant" ? "gray.800" : "inherit",
                      },
                      "& code": {
                        backgroundColor: "bg.subtle",
                        borderRadius: "3px",
                        padding: "0.1em 0.3em",
                        fontSize: "0.9em",
                        fontFamily: "monospace",
                      },
                      "& pre": {
                        backgroundColor: "bg.subtle",
                        borderRadius: "6px",
                        padding: "0.75em",
                        overflowX: "auto",
                        marginTop: "0.5em",
                        marginBottom: "0.5em",
                      },
                      "& pre code": {
                        backgroundColor: "transparent",
                        padding: 0,
                      },
                      "& h1, & h2, & h3": {
                        fontWeight: "bold",
                        marginTop: "0.5em",
                        marginBottom: "0.25em",
                      },
                      "& h1": { fontSize: "1.3em" },
                      "& h2": { fontSize: "1.2em" },
                      "& h3": { fontSize: "1.1em" },
                      "& a": {
                        color: "blue.600",
                        textDecoration: "underline",
                        cursor: "pointer",
                        _hover: {
                          textDecoration: "underline",
                          color: "blue.700",
                        },
                      },
                      "& blockquote": {
                        borderLeft: "3px solid",
                        borderColor: "border",
                        paddingLeft: "0.75em",
                        marginLeft: "0",
                        fontStyle: "italic",
                        color: "gray.600",
                      },
                      "& table": {
                        borderCollapse: "collapse",
                        marginTop: "0.5em",
                        marginBottom: "0.5em",
                        width: "100%",
                      },
                      "& th, & td": {
                        border: "1px solid",
                        borderColor: "border",
                        padding: "0.5em",
                        textAlign: "left",
                      },
                      "& th": {
                        backgroundColor: "bg.subtle",
                        fontWeight: "bold",
                      },
                      "& tr:nth-of-type(even)": {
                        backgroundColor: "bg.subtle",
                      },
                    }}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        a: ({ href, children }) => (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: "#3182ce",
                              textDecoration: "underline",
                              cursor: "pointer",
                              display: "inline-block",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = "#2c5282";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = "#3182ce";
                            }}
                          >
                            {children}
                          </a>
                        ),
                      }}
                    >
                      {m.content}
                    </ReactMarkdown>
                  </Box>
                ) : (
                  <Text whiteSpace="pre-line" lineHeight="1.6">
                    {m.content}
                  </Text>
                )}
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
                borderRadius="xl"
                px={6}
                py={4}
                boxShadow="0 0 15px rgba(0, 0, 0, 0.1)"
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
                borderRadius="xl"
                px={6}
                py={4}
                boxShadow="0 0 15px rgba(0, 0, 0, 0.1)"
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

      <Box width="100%" p={4}>
        {(() => {
          // 最後の「旅行ルート作成を開始して」のインデックスを見つける
          let lastRouteRequestIndex = -1;
          for (let i = messages.length - 1; i >= 0; i--) {
            if (
              messages[i].role === "user" &&
              messages[i].content.includes("旅行ルート作成を開始して")
            ) {
              lastRouteRequestIndex = i;
              break;
            }
          }

          // 最後の「旅行ルート作成を開始して」以降に「はい、お願いします 👍」があるかチェック
          if (lastRouteRequestIndex === -1) return false;

          for (let i = lastRouteRequestIndex + 1; i < messages.length; i++) {
            if (
              messages[i].role === "user" &&
              messages[i].content === "はい、お願いします 👍"
            ) {
              return false;
            }
          }

          return true;
        })() && (
          <VStack mb={3} align="stretch" gap={2}>
            <Button
              size="sm"
              onClick={() => submitMessage("はい、お願いします 👍")}
              disabled={isLoading || isTyping || streamingMessageId !== null}
              bg="blue.50"
              color="blue.700"
              border="1px solid"
              borderColor="blue.200"
              _hover={{
                bg: "blue.100",
                transform: "translateY(-1px)",
              }}
              _active={{
                bg: "blue.200",
                transform: "translateY(0)",
              }}
              transition="all 0.2s"
              fontSize="sm"
              px={4}
              py={2}
              borderRadius="lg"
              width="fit-content"
            >
              はい、お願いします 👍
            </Button>
            <Text fontSize="xs" color="gray.500">
              条件を追加したい場合は、下のチャットに入力してください
            </Text>
          </VStack>
        )}

        {/* 推奨スポットがある場合に提案ボタンを表示 */}
        {recommendedSpots &&
          !isLoading &&
          !isTyping &&
          streamingMessageId === null && (
            <VStack mb={3} align="stretch" gap={2}>
              <HStack gap={2} flexWrap="wrap">
                <Button
                  size="sm"
                  onClick={() => submitMessage("旅行期間の天気は大丈夫？")}
                  disabled={
                    isLoading || isTyping || streamingMessageId !== null
                  }
                  bg="blue.50"
                  color="blue.700"
                  border="1px solid"
                  borderColor="blue.200"
                  _hover={{
                    bg: "blue.100",
                    transform: "translateY(-1px)",
                  }}
                  _active={{
                    bg: "blue.200",
                    transform: "translateY(0)",
                  }}
                  transition="all 0.2s"
                  fontSize="sm"
                  px={4}
                  py={2}
                  borderRadius="lg"
                  width="fit-content"
                >
                  旅行期間の天気は大丈夫？
                </Button>
                <Button
                  size="sm"
                  onClick={() => submitMessage("リラックスできる温泉を教えて")}
                  disabled={
                    isLoading || isTyping || streamingMessageId !== null
                  }
                  bg="blue.50"
                  color="blue.700"
                  border="1px solid"
                  borderColor="blue.200"
                  _hover={{
                    bg: "blue.100",
                    transform: "translateY(-1px)",
                  }}
                  _active={{
                    bg: "blue.200",
                    transform: "translateY(0)",
                  }}
                  transition="all 0.2s"
                  fontSize="sm"
                  px={4}
                  py={2}
                  borderRadius="lg"
                  width="fit-content"
                >
                  リラックスできる温泉を教えて
                </Button>
                <Button
                  size="sm"
                  onClick={() => submitMessage("おすすめのレストランを教えて")}
                  disabled={
                    isLoading || isTyping || streamingMessageId !== null
                  }
                  bg="blue.50"
                  color="blue.700"
                  border="1px solid"
                  borderColor="blue.200"
                  _hover={{
                    bg: "blue.100",
                    transform: "translateY(-1px)",
                  }}
                  _active={{
                    bg: "blue.200",
                    transform: "translateY(0)",
                  }}
                  transition="all 0.2s"
                  fontSize="sm"
                  px={4}
                  py={2}
                  borderRadius="lg"
                  width="fit-content"
                >
                  おすすめのレストランを教えて
                </Button>
              </HStack>
            </VStack>
          )}
        <Box as="form" onSubmit={handleSubmit} width="100%">
          <HStack gap={2}>
            <Input
              placeholder="気になる場所を聞いてみよう…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              size="sm"
              flex="1"
              borderRadius="full"
              border="1px solid"
              borderColor="border"
              _focus={{
                borderColor: "blue.400",
              }}
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
              borderRadius="full"
              px={6}
            >
              送信
            </Button>
          </HStack>
        </Box>
      </Box>
    </VStack>
  );
}
