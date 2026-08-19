import type { Metadata } from "next";
import { Suspense } from "react";
import Cabecalho from "@/components/Cabecalho";
import { CatalogoServicos } from "@/components/CatalogoServicos";
import { PlanoLavagem } from "@/components/PlanoLavagem";
import Footer from "@/components/Footer";
import BotaoFlutuanteWhatsApp from "@/components/BotaoFlutuanteWhatsApp";
import { CATALOGO, precoParaJsonLd } from "@/lib/catalogo";
import { PLANO } from "@/lib/plano";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://anjowrap.com.br";
const DESCRICAO =
  "Preço por porte de veículo para lavagem, polimento, vitrificação, higienização, insulfilm e PPF. Agendamento pelo WhatsApp.";

export const metadata: Metadata = {
  title: "Tabela de serviços e preços | ANJOWRAP",
  description: DESCRICAO,
  alternates: { canonical: "/servicos" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: `${SITE}/servicos`,
    siteName: "ANJOWRAP",
    title: "Tabela de serviços e preços | ANJOWRAP",
    description: DESCRICAO,
    images: [
      { url: "/og.jpg", width: 1200, height: 630, alt: "ANJOWRAP — tabela de serviços" },
    ],
  },
};

const catalogoJsonLd = {
  "@context": "https://schema.org",
  "@type": "OfferCatalog",
  name: "Tabela de serviços ANJOWRAP",
  url: `${SITE}/servicos`,
  itemListElement: [
    ...CATALOGO.map((item, i) => ({
      "@type": "Offer",
      position: i + 1,
      itemOffered: {
        "@type": "Service",
        name: item.nome,
        serviceType: item.categoria,
        provider: { "@id": `${SITE}/#anjowrap` },
        areaServed: { "@type": "Country", name: "Brasil" },
      },
      priceCurrency: "BRL",
      ...precoParaJsonLd(item.preco),
    })),
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: PLANO.nome,
        provider: { "@id": `${SITE}/#anjowrap` },
        // Presencial — o único lugar do site onde a cobertura é City, não Country.
        areaServed: { "@type": "City", name: PLANO.praca },
      },
      priceCurrency: "BRL",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: PLANO.valorMensal,
        priceCurrency: "BRL",
        billingDuration: 1,
        billingIncrement: 1,
        unitText: "MONTH",
      },
    },
  ],
};

export default function ServicosPage() {
  return (
    <>
      <Cabecalho />
      <main>
        <section className="border-b border-borda px-6 py-14 md:px-16 md:py-20">
          <div className="mx-auto max-w-6xl">
            <p className="rotulo mb-4">Catálogo</p>
            <h1 className="text-[2.5rem] font-bold uppercase leading-[0.95] tracking-[0.01em] md:text-h1">
              Serviços e preços
            </h1>
            <p className="mt-5 max-w-leitura text-corpo text-prata">
              Valor por porte de veículo. Escolha o porte do seu carro e a tabela toda
              se ajusta. O agendamento abre no WhatsApp já escrito.
            </p>
          </div>
        </section>
        <Suspense fallback={null}>
          <CatalogoServicos />
        </Suspense>
        <PlanoLavagem variante="completa" />
      </main>
      <Footer />
      <BotaoFlutuanteWhatsApp />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(catalogoJsonLd) }}
      />
    </>
  );
}
