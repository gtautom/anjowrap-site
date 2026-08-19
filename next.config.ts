import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Existe um package-lock.json na raiz do MazyOS. Sem isso o Next elege
  // aquela pasta como workspace root e traceia arquivos de fora do site.
  outputFileTracingRoot: __dirname,
  images: { formats: ["image/avif", "image/webp"] as const },
};

export default nextConfig;
