import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    "https://ef9c-151-27-71-76.ngrok-free.app",
    "ef9c-151-27-71-76.ngrok-free.app",
    "https://rps-api.cashcall.pro",
    "http://localhost:3001"
  ],
  experimental: {
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3dux5rwcu.ufs.sh',
        pathname: '/f/**', // allow all images under /f/
      },
    ],
  },
};

export default nextConfig;
