import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Existe um package-lock.json na raiz do MazyOS. Sem isso o Next elege
  // aquela pasta como workspace root e traceia arquivos de fora do site.
  outputFileTracingRoot: __dirname,
  images: {
    formats: ["image/avif", "image/webp"] as const,
    // Fotos de perfil do portal (bucket "avatars", Supabase Storage).
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" }],
  },
};

export default nextConfig;
