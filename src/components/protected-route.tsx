"use client";

import { Box, Center, Spinner } from "@chakra-ui/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/auth/auth-context";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, initializing } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!user && !loading && !initializing) {
      router.push("/auth");
    }
  }, [user, loading, initializing, router]);

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (!user && pathname !== "/auth") {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return <Box>{children}</Box>;
}