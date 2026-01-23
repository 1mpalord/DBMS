import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent bundling of transformer libraries that use native bindings (onnxruntime, sharp)
  serverExternalPackages: ['@xenova/transformers', 'onnxruntime-node'],

  // ts-expect-error - Valid Next.js config for Vercel tracing
  outputFileTracingIncludes: {
    '/api/**/*': ['./node_modules/onnxruntime-node/bin/napi-v3/linux/x64/libonnxruntime.so*'],
  },

  experimental: {},
};

export default nextConfig;
