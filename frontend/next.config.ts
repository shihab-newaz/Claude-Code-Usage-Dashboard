import type { NextConfig } from "next";

// GITHUB_PAGES=true → static export for GitHub Pages deployment.
// Default (unset) → full Next.js server for Docker / local dev.
const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  ...(isGitHubPages && {
    output: "export",
    basePath: "/claude-usage-dashboard",
  }),
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "",
  },
};

export default nextConfig;
