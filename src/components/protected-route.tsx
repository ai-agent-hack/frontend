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

  const publicRoutes = ["/", "/auth"];
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    if (!user && !loading && !initializing && !isPublicRoute) {
      router.push("/auth");
    }
  }, [user, loading, initializing, router, isPublicRoute]);

  if (loading && !isPublicRoute) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (!user && !isPublicRoute) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return <Box>{children}</Box>;
}
