/** @type {import('next').NextConfig} */

// GitHub Pages serves project sites from a sub-path:
//   https://<owner>.github.io/<repo>/
// The deploy workflow sets NEXT_PUBLIC_BASE_PATH=/buddy so assets and links
// resolve correctly. Locally the variable is empty, so the app runs at "/".
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig = {
  // Emit a fully static site into ./out — required for GitHub Pages,
  // which cannot run a Node server.
  output: "export",
  // next/image optimisation needs a server; disable it for the static export.
  images: { unoptimized: true },
  // Sub-path handling for GitHub Pages (no-ops when basePath is empty).
  basePath: basePath || undefined,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  // Pages routing is friendlier with directory-style URLs (/path/index.html).
  trailingSlash: true,
  // Expose the resolved base path to the client (e.g. for asset URLs).
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

module.exports = nextConfig;
