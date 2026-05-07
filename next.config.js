const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Pin the tracing root to this project so Next doesn't pick up a stray
    // lockfile higher up on the filesystem and warn about it.
    outputFileTracingRoot: path.join(__dirname),
    // Evolution SDK + its `effect` dep ship ESM only; whitelist them so Next's
    // pages-router webpack pipeline bundles them through the same loader as
    // our own source.
    transpilePackages: ["@evolution-sdk/evolution", "effect"],
};

module.exports = nextConfig;
