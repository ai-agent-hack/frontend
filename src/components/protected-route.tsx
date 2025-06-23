"use client";

import { Box, Center, Spinner } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/auth/auth-context";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, initializing } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user && !initializing) {
      router.push("/auth");
    }
  }, [user, loading, initializing, router]);

  if (loading || initializing) {
    return (
      <Center h="100%">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (!user) {
    return (
      <Center h="100%">
        <Spinner size="xl" />
      </Center>
    );
  }

  return <Box>{children}</Box>;
}
