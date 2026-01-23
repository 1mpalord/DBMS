import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent bundling of transformer libraries that use native bindings (onnxruntime, sharp)
  serverExternalPackages: ['@xenova/transformers', 'onnxruntime-node'],
};

export default nextConfig;
