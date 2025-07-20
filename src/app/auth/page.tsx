"use client";

import {
  Alert,
  Box,
  Button,
  Center,
  Heading,
  HStack,
  Input,
  Spinner,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/header";
import { useAuth } from "@/contexts/auth/auth-context";

export default function AuthPage() {
  enum AuthMode {
    LogIn = "login",
    SignUp = "signup",
  }

  const searchParams = useSearchParams();
  const [mode, setMode] = useState(AuthMode.LogIn);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { user, login, signup, initializing } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "signup") {
      setMode(AuthMode.SignUp);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user && !initializing) {
      router.push("/");
    }
  }, [user, initializing, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === AuthMode.SignUp && password !== confirmPassword) {
      setError("パスワードが一致しません");
      return;
    }

    if (password.length < 6) {
      setError("パスワードは6文字以上で入力してください");
      return;
    }

    if (mode === AuthMode.SignUp && username.trim().length < 3) {
      setError("ユーザー名は3文字以上で入力してください");
      return;
    }

    setIsLoading(true);

    try {
      if (mode === AuthMode.SignUp) {
        await signup(email, password, username);
        return;
      }
      await login(email, password);
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
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (user) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <VStack h="100%" gap={0} p={4}>
      <Header />
      <Center p={4} w={"100%"} maxW={"400px"}>
        <VStack gap={6} w={"100%"}>
          <VStack gap={2} w={"100%"}>
            <Heading size="lg" textAlign="center">
              {mode === AuthMode.SignUp ? "アカウント作成" : "ログイン"}
            </Heading>
            <Text color="gray.600" textAlign="center">
              {mode === AuthMode.SignUp
                ? "アカウント作成をして始めましょう"
                : "ログインしてアカウントにアクセス"}
            </Text>
          </VStack>

          {error && (
            <Alert.Root status="error" w={"100%"}>
              <Alert.Description>{error}</Alert.Description>
            </Alert.Root>
          )}

          <Box as="form" onSubmit={handleSubmit} w={"100%"}>
            <Stack gap={4}>
              {mode === AuthMode.SignUp && (
                <Input
                  type="text"
                  placeholder="ユーザー名"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  size="lg"
                  borderRadius="xl"
                />
              )}

              <Input
                type="email"
                placeholder="メールアドレス"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                size="lg"
                borderRadius="xl"
              />

              <Input
                type="password"
                placeholder="パスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                size="lg"
                borderRadius="xl"
              />

              {mode === AuthMode.SignUp && (
                <Input
                  type="password"
                  placeholder="パスワードを確認"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  size="lg"
                  borderRadius="xl"
                />
              )}

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                loading={isLoading}
                w="full"
                borderRadius="xl"
              >
                {mode === AuthMode.SignUp ? "アカウント作成" : "ログイン"}
              </Button>
            </Stack>
          </Box>

          <HStack>
            <Text color="gray.600">
              {mode === AuthMode.SignUp
                ? "アカウントをお持ちですか?"
                : "アカウントをお持ちでないですか?"}
            </Text>
            <Button
              variant="ghost"
              colorScheme="blue"
              borderRadius="xl"
              onClick={() => {
                setMode(
                  mode === AuthMode.SignUp ? AuthMode.LogIn : AuthMode.SignUp,
                );
                setError("");
                setEmail("");
                setPassword("");
                setConfirmPassword("");
                setUsername("");
              }}
              size="sm"
            >
              {mode === AuthMode.SignUp ? "ログイン" : "アカウント作成"}
            </Button>
          </HStack>
        </VStack>
      </Center>
    </VStack>
  );
}
