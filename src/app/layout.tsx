import { Box } from "@chakra-ui/react";
import type { Metadata } from "next";
import { Provider } from "@/components/ui/provider";

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
        <Provider>
          <Box minH={"100vh"} w={"100vw"} top={0}>
            {children}
          </Box>
        </Provider>
      </body>
    </html>
  );
}
