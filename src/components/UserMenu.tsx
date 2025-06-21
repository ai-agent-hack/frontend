"use client";

import { Button, HStack, Text, VStack } from "@chakra-ui/react";
import { useAuth } from "@/contexts/auth/AuthContext";

export default function UserMenu() {
  const { user, signOut } = useAuth();

  if (!user) return null;

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <HStack gap={4}>
      <VStack align="start" gap={0}>
        <Text fontSize="sm" fontWeight="medium">
          {user.username || "未登録"}さん
        </Text>
      </VStack>
      <Button
        onClick={handleSignOut}
        variant="outline"
        size="sm"
        colorScheme="red"
      >
        ログアウト
      </Button>
    </HStack>
  );
}
