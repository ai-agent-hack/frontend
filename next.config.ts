import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: false,
    output: "standalone",
    experimental: {
        optimizePackageImports: ["@chakra-ui/react"],
    },
    serverExternalPackages: ["@mastra/*"],
    async rewrites() {
        return [
            {
                source: "/api/v1/:path*",
                destination: "http://localhost:8000/api/v1/:path*",
            },
        ];
    },
};

export default nextConfig;
