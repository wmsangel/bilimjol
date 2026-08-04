import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Пакет @izn-study/shared отдаёт исходный TypeScript — Next должен его транспилировать.
  transpilePackages: ["@izn-study/shared"],
};

export default nextConfig;
