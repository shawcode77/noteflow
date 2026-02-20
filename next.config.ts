import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/noteflow",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
