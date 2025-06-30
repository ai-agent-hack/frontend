"use client";

import {
  Badge,
  Box,
  Button,
  Center,
  Container,
  Heading,
  HStack,
  Icon,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import Link from "next/link";
import { useRef } from "react";
import {
  FaArrowUp,
  FaCalendarAlt,
  FaCamera,
  FaChartLine,
  FaComments,
  FaMagic,
  FaPassport,
  FaPlane,
  FaRobot,
  FaRoute,
  FaStar,
  FaUsers,
  FaUserTie,
} from "react-icons/fa";
import Header from "@/components/header";

export default function Home() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const userPersonas = [
    {
      id: "business-person",
      icon: FaUserTie,
      title: "時間に追われるビジネスパーソン",
      description: "限られた時間を最大限楽しみたい",
    },
    {
      id: "group-organizer",
      icon: FaUsers,
      title: "家族・友人旅行の幹事",
      description: "全員満足の旅程を組みたい",
    },
    {
      id: "experience-seeker",
      icon: FaCamera,
      title: "体験重視のミレニアル・Z世代",
      description: "映えと新鮮さを両立したい",
    },
    {
      id: "inbound-traveler",
      icon: FaPassport,
      title: "土地勘のないインバウンド旅行者",
      description: "言語の壁を越えたい",
    },
  ];

  const features = [
    {
      id: "natural-language",
      icon: FaMagic,
      title: "自然言語で希望を入力",
      description: "「静かな湖でカヤックがしたい」など、ひと言でOK",
    },
    {
      id: "realtime-route",
      icon: FaRobot,
      title: "リアルタイム最適ルート",
      description: "Google TrendsとMapsを統合して今最適なルートを生成",
    },
    {
      id: "easy-recalc",
      icon: FaRoute,
      title: "簡単な操作で再計算",
      description: "チャットやカードの簡単操作でルートを再構築",
    },
    {
      id: "vibe-planning",
      icon: FaStar,
      title: "Vibe Planning",
      description: "感情・雰囲気まで含めたストーリー性のある行程",
    },
  ];

  const problems = [
    {
      id: "info-overload",
      icon: FaChartLine,
      text: "情報の洪水：ブログ・SNS・口コミサイトが多すぎて比較が困難",
    },
    {
      id: "realtime-ignore",
      icon: FaCalendarAlt,
      text: "リアルタイム変動の無視：混雑・天候・イベント中止などを反映できない",
    },
    {
      id: "combination-explosion",
      icon: FaRoute,
      text: "組合せ爆発：移動時間×予算×体験価値の同時最適化が手作業ではほぼ不可能",
    },
    {
      id: "vague-needs",
      icon: FaComments,
      text: "曖昧ニーズの翻訳コスト：「のんびり」「映え重視」などを具体的スポットに落とし込む作業が重い",
    },
  ];

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <VStack h="100vh" w="100%" gap={0} align="stretch">
      <Box px={4} pt={4} shadow="sm" position="sticky" top={0} zIndex={10}>
        <Header />
      </Box>

      <Box ref={scrollContainerRef} flex={1} overflow="auto">
        {/* Hero Section */}
        <Box py={{ base: 16, md: 24 }} position="relative" overflow="hidden">
          <Container maxW="container.xl">
            <VStack gap={8} position="relative" zIndex={1}>
              <VStack gap={6} maxW="800px" mx="auto">
                <Badge px={4} py={2} fontSize="lg">
                  AI旅行プランナー
                </Badge>
                <Heading
                  as="h1"
                  size={{ base: "2xl", md: "3xl" }}
                  textAlign="center"
                  fontWeight="bold"
                  lineHeight="1.2"
                >
                  「静かな湖でカヤックがしたい」
                  <br />
                  ひと言で理想の旅程が立ち上がる
                </Heading>
                <Text
                  fontSize={{ base: "lg", md: "xl" }}
                  textAlign="center"
                  maxW="700px"
                  color="fg.subtle"
                >
                  リアルタイムの混雑・口コミデータを横断的に解析し、
                  曖昧な「こんな旅がしたい」という想いを最適ルートに変える
                  <Text as="span" fontWeight="bold" color="purple.600">
                    {" "}
                    AI旅行プランナー
                  </Text>
                </Text>
                <Text
                  fontSize={{ base: "md", md: "lg" }}
                  textAlign="center"
                  maxW="600px"
                  color="fg.subtle"
                >
                  気づかないところに眠る、もっと心地よく、
                  もっと効率的で、もっとワクワクする旅程を発見します
                </Text>
              </VStack>
              <Link href="/register" passHref>
                <Button
                  as="a"
                  size="lg"
                  px={12}
                  py={8}
                  fontSize="xl"
                  fontWeight="bold"
                  bgGradient="linear(to-r, purple.500, pink.500)"
                  color="fg.inverted"
                  borderRadius="full"
                  _hover={{
                    transform: "scale(1.05)",
                    bgGradient: "linear(to-r, purple.600, pink.600)",
                  }}
                  transition="all 0.2s"
                  shadow="xl"
                >
                  <HStack gap={3}>
                    <Icon as={FaStar} />
                    <Text>旅のプロローグを始める</Text>
                  </HStack>
                </Button>
              </Link>
            </VStack>
          </Container>

          {/* Background decoration */}
          <Box
            position="absolute"
            top="-20%"
            right="-10%"
            opacity={0.05}
            transform="rotate(15deg)"
          >
            <Icon as={FaPlane} boxSize={400} color="purple.500" />
          </Box>
        </Box>

        {/* User Personas Section */}
        <Box py={20} bg="gray.subtle">
          <Container maxW="container.xl">
            <VStack gap={12}>
              <VStack gap={4}>
                <Heading size="xl" textAlign="center">
                  こんな方々の旅をサポート
                </Heading>
              </VStack>

              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6} w="full">
                {userPersonas.map((persona) => (
                  <VStack
                    key={persona.id}
                    bg="bg.emphasized"
                    p={6}
                    borderRadius="xl"
                    shadow={"0px 0px 15px rgba(0, 0, 0, 0.2)"}
                    align="start"
                    gap={4}
                  >
                    <Icon as={persona.icon} boxSize={10} color="purple.500" />
                    <Text fontWeight="bold" fontSize="lg">
                      {persona.title}
                    </Text>
                    <Text color="fg.subtle" fontSize="sm">
                      {persona.description}
                    </Text>
                  </VStack>
                ))}
              </SimpleGrid>
            </VStack>
          </Container>
        </Box>

        {/* Problems Section */}
        <Box py={20}>
          <Container maxW="container.xl">
            <VStack gap={12}>
              <VStack gap={4}>
                <Heading size="xl" textAlign="center">
                  旅行計画の4つの課題
                </Heading>
                <Text
                  fontSize="lg"
                  color="fg.subtle"
                  textAlign="center"
                  maxW="700px"
                >
                  従来の旅行計画では解決できなかった課題を、AIが解決します
                </Text>
              </VStack>

              <VStack gap={4} w="full" maxW="800px" mx="auto">
                {problems.map((problem) => (
                  <HStack
                    key={problem.id}
                    w="full"
                    p={6}
                    bg="red.50"
                    borderRadius="xl"
                    align="start"
                    gap={4}
                  >
                    <Icon
                      as={problem.icon}
                      boxSize={6}
                      color="red.500"
                      flexShrink={0}
                      mt={1}
                    />
                    <Text color="gray.700">{problem.text}</Text>
                  </HStack>
                ))}
              </VStack>
            </VStack>
          </Container>
        </Box>

        {/* Features Section */}
        <Box bg="purple.100" py={20}>
          <Container maxW="container.xl">
            <VStack gap={12}>
              <VStack gap={4}>
                <Badge px={4} py={2} fontSize="lg">
                  宣言型の体験
                </Badge>
                <Heading color={"black"} size="xl" textAlign="center">
                  手続型から宣言型へ
                </Heading>
                <Text
                  fontSize="lg"
                  color="gray.600"
                  textAlign="center"
                  maxW="700px"
                >
                  従来の「検索→比較→取捨選択」という手続きを、
                  「やりたいことを宣言するだけ」のシンプルな体験に置き換えます
                </Text>
              </VStack>

              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={8} w="full">
                {features.map((feature) => (
                  <VStack
                    key={feature.id}
                    bg="white"
                    p={6}
                    borderRadius="xl"
                    shadow={"0px 0px 15px rgba(0, 0, 0, 0.2)"}
                    gap={4}
                  >
                    <Center w={16} h={16} bg="purple.500" borderRadius="full">
                      <Icon as={feature.icon} boxSize={8} color="white" />
                    </Center>
                    <Text color="black" fontWeight="bold" fontSize="lg">
                      {feature.title}
                    </Text>
                    <Text color="gray.600" textAlign="center" fontSize="sm">
                      {feature.description}
                    </Text>
                  </VStack>
                ))}
              </SimpleGrid>
            </VStack>
          </Container>
        </Box>

        {/* Scroll to Top Section */}
        <Box py={12}>
          <Center>
            <Button
              onClick={scrollToTop}
              size="lg"
              variant="outline"
              colorScheme="purple"
              borderRadius="full"
              px={8}
              _hover={{
                transform: "translateY(-2px)",
                shadow: "md",
              }}
              transition="all 0.2s"
            >
              <HStack gap={2}>
                <Icon as={FaArrowUp} />
                <Text>トップへ戻る</Text>
              </HStack>
            </Button>
          </Center>
        </Box>
      </Box>
    </VStack>
  );
}
