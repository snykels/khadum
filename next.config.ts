import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  serverExternalPackages: ["postgres"],
  allowedDevOrigins: ["*.replit.dev", "*.sisko.replit.dev", "*.replit.app"],
  webpack: (config) => {
    const traverseRules = (rules: unknown[]): void => {
      for (const rule of rules) {
        if (!rule || typeof rule !== "object") continue;
        const r = rule as Record<string, unknown>;
        if (Array.isArray(r.rules)) traverseRules(r.rules as unknown[]);
        if (Array.isArray(r.oneOf)) traverseRules(r.oneOf as unknown[]);
        if (Array.isArray(r.use)) {
          for (const use of r.use as unknown[]) {
            if (!use || typeof use !== "object") continue;
            const u = use as Record<string, unknown>;
            if (
              typeof u.loader === "string" &&
              u.loader.includes("css-loader") &&
              u.options &&
              typeof u.options === "object"
            ) {
              const opts = u.options as Record<string, unknown>;
              opts.url = false;
            }
          }
        }
      }
    };
    traverseRules(config.module.rules as unknown[]);
    return config;
  },
};

export default nextConfig;
