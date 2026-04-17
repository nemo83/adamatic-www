const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Pin the tracing root to this project so Next doesn't pick up a stray
  // lockfile higher up on the filesystem and warn about it.
  outputFileTracingRoot: path.join(__dirname),
  // Evolution SDK and its effect-ts deps ship ESM only; whitelist them so
  // Next's pages-router webpack pipeline bundles them correctly.
  transpilePackages: ["@evolution-sdk/evolution", "effect"],
  webpack: function (config, options) {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };
    return config;
  },
};
module.exports = nextConfig;
