"use client";

import { Heading, HStack } from "@chakra-ui/react";

const Header: React.FC = () => {
  return (
    <HStack w={"100%"} justify="space-between" mb={4}>
      <Heading size="lg">
        <a href="/">Vibe Planning</a>
      </Heading>
    </HStack>
  );
};

export default Header;
