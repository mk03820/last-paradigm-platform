import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile @react-pdf packages
  transpilePackages: ['@react-pdf/renderer', '@react-pdf/layout', '@react-pdf/pdfkit'],
  // Empty turbopack config to silence warning
  turbopack: {},
};

export default nextConfig;
