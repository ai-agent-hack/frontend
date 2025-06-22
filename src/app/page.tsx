"use client";

import { Box, Heading, HStack, VStack } from "@chakra-ui/react";
import ProtectedRoute from "@/components/ProtectedRoute";
import UserMenu from "@/components/UserMenu";
import { useAuth } from "@/contexts/auth/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <Box p={8}>
        <HStack justify="space-between" mb={8}>
          <Heading size="lg">Welcome to the App</Heading>
          {user && <UserMenu />}
        </HStack>
        <VStack gap={4}>
          <a href="/premise">Premise</a>
          <a href="/planning">Planning</a>
        </VStack>
      </Box>
    </ProtectedRoute>
  );
}
