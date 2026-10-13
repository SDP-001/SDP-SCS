import type { NextConfig } from "next";
import os from "os";

// Detect all local IPv4 network interfaces dynamically
function getLocalOrigins(): string[] {
  const origins = [
    "localhost",
    "localhost:3000",
    "127.0.0.1",
    "127.0.0.1:3000",
    "10.20.105.39",
    "10.20.105.39:3000",
    "192.168.137.1",
    "192.168.137.1:3000",
    "172.24.11.39",
    "172.24.11.39:3000",
    "*.app.github.dev",
  ];
  try {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const net of interfaces[name] || []) {
        if (net.family === "IPv4" && !net.internal) {
          if (!origins.includes(net.address)) origins.push(net.address);
          const withPort = `${net.address}:3000`;
          if (!origins.includes(withPort)) origins.push(withPort);
        }
      }
    }
  } catch {
    // Fallback to static list
  }
  return origins;
}

const localOrigins = getLocalOrigins();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb",
      allowedOrigins: localOrigins,
    },
  },
  // Allow mobile browsers on LAN during development
  ...(process.env.NODE_ENV !== "production"
    ? {
        allowedDevOrigins: localOrigins,
      }
    : {}),
};

export default nextConfig;
