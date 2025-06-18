import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	experimental: {
		optimizePackageImports: ["@chakra-ui/react"],
	},
	serverExternalPackages: ["@mastra/*"],
};

export default nextConfig;
