import type { NextConfig } from "next";

// GitHub Pages basePath/assetPrefix support
const isGithubActions = process.env.GITHUB_ACTIONS === "true";
const repoSlug = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const isUserOrOrgSite = repoSlug.endsWith(".github.io");
const repoBasePath = isGithubActions && !isUserOrOrgSite && repoSlug ? `/${repoSlug}` : "";

const nextConfig: NextConfig = {
  // Enable static HTML export
  output: "export",
  images: {
    // Required for `next/image` when using static export
    unoptimized: true,
  },
  // Ensure directory-style URLs for GitHub Pages hosting
  trailingSlash: true,
  // Apply basePath/assetPrefix when building in GitHub Actions for project pages
  basePath: repoBasePath || undefined,
  assetPrefix: repoBasePath ? `${repoBasePath}/` : undefined,
};

export default nextConfig;
