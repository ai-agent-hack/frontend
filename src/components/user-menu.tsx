"use client";

import { Button, HStack, Text, VStack } from "@chakra-ui/react";
import { useAuth } from "@/contexts/auth/auth-context";

export default function UserMenu() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <HStack gap={4}>
      <VStack align="start" gap={0}>
        <Text fontSize="sm" fontWeight="medium">
          {user.username ?? "未登録"}さん
        </Text>
      </VStack>
      <Button
        onClick={handleLogout}
        variant="outline"
        size="sm"
        colorScheme="red"
        borderRadius="xl"
      >
        ログアウト
      </Button>
    </HStack>
  );
}
