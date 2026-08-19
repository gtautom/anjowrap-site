import type { Metadata, Viewport } from "next";
import { Saira_Condensed, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { PRACA } from "@/lib/servicos";
import "./globals.css";

const saira = Saira_Condensed({
  subsets: ["latin"],
  weight: ["300", "500", "600", "700"],
  variable: "--font-saira",
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-plex-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://anjowrap.com.br";
const DESCRICAO =
  "Película de proteção de pintura (PPF), envelopamento, polimento e vitrificação. Aplicação para todo o Brasil, oficina em Belém do Pará.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "PPF e Estética Automotiva no Brasil | ANJOWRAP",
  description: DESCRICAO,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: SITE,
    siteName: "ANJOWRAP",
    title: "PPF e Estética Automotiva no Brasil | ANJOWRAP",
    description: DESCRICAO,
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "ANJOWRAP — proteção de pintura PPF",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PPF e Estética Automotiva no Brasil | ANJOWRAP",
    description: DESCRICAO,
    images: ["/og.jpg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0B0C0E",
};

/**
 * TODO: horario de funcionamento nao foi informado pelo cliente, abaixo e
 * suposicao — confirmar antes de publicar.
 *
 * address e areaServed sao ortogonais no schema.org: endereco fisico em
 * Belem + areaServed de pais e a codificacao correta de "oficina aqui,
 * servico em todo lugar". @type AutomotiveBusiness porque AutoDetailing nao
 * existe no vocabulario oficial (verificado — so ha AutoBodyShop, AutoDealer,
 * AutoPartsStore, AutoRental, AutoRepair, AutoWash, GasStation,
 * MotorcycleDealer, MotorcycleRepair como subtipos).
 */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "AutomotiveBusiness",
  "@id": `${SITE}/#anjowrap`,
  name: "ANJOWRAP",
  description: DESCRICAO,
  url: SITE,
  image: `${SITE}/og.jpg`,
  telephone: process.env.NEXT_PUBLIC_WHATSAPP
    ? `+${process.env.NEXT_PUBLIC_WHATSAPP.replace(/\D/g, "")}`
    : undefined,
  address: {
    "@type": "PostalAddress",
    addressLocality: PRACA.cidade,
    addressRegion: PRACA.estado,
    addressCountry: PRACA.pais,
  },
  areaServed: { "@type": "Country", name: "Brasil" },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
      ],
      opens: "08:00",
      closes: "18:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "08:00",
      closes: "12:00",
    },
  ],
  sameAs: ["https://www.instagram.com/anjowrap"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${saira.variable} ${plexSans.variable} ${plexMono.variable}`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
