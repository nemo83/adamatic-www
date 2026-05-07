const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Pin the tracing root to this project so Next doesn't pick up a stray
    // lockfile higher up on the filesystem and warn about it.
    outputFileTracingRoot: path.join(__dirname),
    webpack(config) {
        // Required by Mesh's CSL WASM bundle. Removed in Phase D when @meshsdk/* drops.
        config.experiments = {
            ...config.experiments,
            asyncWebAssembly: true,
            layers: true,
        };
        return config;
    },
};

module.exports = nextConfig;
