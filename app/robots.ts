import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://anjowrap.com.br";

// Nao depende de dado de requisicao — gera uma vez no build mesmo com a
// rota de checkout tornando o resto do app dinamico.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE}/sitemap.xml`,
  };
}
