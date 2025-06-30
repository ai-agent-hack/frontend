import { Box } from "@chakra-ui/react";
import type { Metadata } from "next";
import ProtectedRoute from "@/components/protected-route";
import { Provider } from "@/components/ui/provider";
import { AuthProvider } from "@/contexts/auth/auth-context";

export const metadata: Metadata = {
  title: "Vibe Planning",
  description: "Let's create your next trip plan with AI agent!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning lang="en">
      <body>
        <AuthProvider>
          <Provider>
            <ProtectedRoute>
              <Box minH={"100vh"} w={"100vw"} top={0}>
                {children}
              </Box>
            </ProtectedRoute>
          </Provider>
        </AuthProvider>
      </body>
    </html>
  );
}
