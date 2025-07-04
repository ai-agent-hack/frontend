"use client";

import { Heading, HStack } from "@chakra-ui/react";
import { useAuth } from "@/contexts/auth/auth-context";
import UserMenu from "./user-menu";

const Header: React.FC = () => {
  const { user } = useAuth();

  return (
    <HStack w={"100%"} justify="space-between" mb={4}>
      <Heading size="lg">
        <a href="/">Vibe Planning</a>
      </Heading>
      {user && <UserMenu />}
    </HStack>
  );
};

export default Header;
