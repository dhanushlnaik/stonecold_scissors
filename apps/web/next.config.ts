import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client"],
  transpilePackages: ["@stonecold/db", "@stonecold/game-engine", "@stonecold/types"],
};

export default nextConfig;
