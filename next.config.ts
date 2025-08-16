import type { NextConfig } from "next";

const withPWA = require("next-pwa")({
  dest: "public", // Destination directory for the PWA files
  register: true, // Register the service worker
  skipWaiting: true, // Skip waiting for service worker activation
  disable: process.env.NODE_ENV === "development", // Disable PWA in development
});

const nextConfig: NextConfig = {
  /* config options here */
};

export default withPWA(nextConfig);
