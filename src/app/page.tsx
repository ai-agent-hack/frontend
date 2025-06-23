"use client";

import { VStack } from "@chakra-ui/react";

export default function Home() {
  return (
    <VStack gap={4}>
      <a href="/auth">Auth</a>
      <a href="/register">Register</a>
      <a href="/planning">Planning</a>
    </VStack>
  );
}
