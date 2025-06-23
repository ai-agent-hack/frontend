"use client";

import {
  Alert,
  Box,
  Button,
  Card,
  Center,
  Heading,
  HStack,
  Input,
  Spinner,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/header";
import { useAuth } from "@/contexts/auth/auth-context";

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { user, login, signup, initializing } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !initializing) {
      router.push("/");
    }
  }, [user, initializing, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isSignUp && password !== confirmPassword) {
      setError("パスワードが一致しません");
      return;
    }

    if (password.length < 6) {
      setError("パスワードは6文字以上で入力してください");
      return;
    }

    if (isSignUp && username.trim().length < 3) {
      setError("ユーザー名は3文字以上で入力してください");
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        await signup(email, password, username);
      } else {
        await login(email, password);
      }
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "不明なエラーが発生しました",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (initializing) {
    return (
      <Center h="100%">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (user) {
    return (
      <Center h="100%">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <VStack h="100%" gap={0}>
      <Header />
      <Center p={4}>
        <Card.Root maxW="md" w="full" p={8}>
          <VStack gap={6}>
            <VStack gap={2}>
              <Heading size="lg" textAlign="center">
                {isSignUp ? "アカウント作成" : "サインイン"}
              </Heading>
              <Text color="gray.600" textAlign="center">
                {isSignUp
                  ? "アカウント作成をして始めましょう"
                  : "サインインしてアカウントにアクセス"}
              </Text>
            </VStack>

            {error && (
              <Alert.Root status="error" w="full">
                <Alert.Description>{error}</Alert.Description>
              </Alert.Root>
            )}

            <Box as="form" onSubmit={handleSubmit} w="full">
              <Stack gap={4}>
                {isSignUp && (
                  <Input
                    type="text"
                    placeholder="ユーザー名"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    size="lg"
                  />
                )}

                <Input
                  type="email"
                  placeholder="メールアドレス"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  size="lg"
                />

                <Input
                  type="password"
                  placeholder="パスワード"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  size="lg"
                />

                {isSignUp && (
                  <Input
                    type="password"
                    placeholder="パスワードを確認"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    size="lg"
                  />
                )}

                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  loading={isLoading}
                  w="full"
                >
                  {isSignUp ? "アカウント作成" : "サインイン"}
                </Button>
              </Stack>
            </Box>

            <HStack>
              <Text color="gray.600">
                {isSignUp
                  ? "アカウントをお持ちですか?"
                  : "アカウントをお持ちでないですか?"}
              </Text>
              <Button
                variant="ghost"
                colorScheme="blue"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError("");
                  setEmail("");
                  setPassword("");
                  setConfirmPassword("");
                  setUsername("");
                }}
                size="sm"
              >
                {isSignUp ? "サインイン" : "サインアップ"}
              </Button>
            </HStack>
          </VStack>
        </Card.Root>
      </Center>
    </VStack>
  );
}
