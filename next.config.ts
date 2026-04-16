import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.scdn.co" },
      { protocol: "https", hostname: "mosaic.scdn.co" },
      { protocol: "https", hostname: "*.clerk.com" },
      { protocol: "https", hostname: "img.clerk.com" },
    ],
  },
};

module.exports = {
  allowedDevOrigins: ['127.0.0.1'],
}

export default nextConfig;
