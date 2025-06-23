"use client";

import { VStack } from "@chakra-ui/react";
import Header from "@/components/header";

export default function Home() {
  return (
    <VStack minH="100%" w="100%" gap={0} p={4}>
      <Header />
      <VStack gap={4}>
        <a href="/auth">Auth</a>
        <a href="/register">Register</a>
        <a href="/planning">Planning</a>
      </VStack>
    </VStack>
  );
}
