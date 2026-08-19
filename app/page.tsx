import { Suspense } from "react";
import Cabecalho from "@/components/Cabecalho";
import Hero from "@/components/Hero";
import Credencial from "@/components/Credencial";
import SobrePPF from "@/components/SobrePPF";
import Galeria from "@/components/Galeria";
import Servicos from "@/components/Servicos";
import { PlanoLavagem } from "@/components/PlanoLavagem";
import AreaAtendimento from "@/components/AreaAtendimento";
import FormOrcamento from "@/components/FormOrcamento";
import Footer from "@/components/Footer";
import BotaoFlutuanteWhatsApp from "@/components/BotaoFlutuanteWhatsApp";

export default function Home() {
  return (
    <>
      <Cabecalho />
      <main>
        <Hero />
        <Credencial />
        <SobrePPF />
        <PlanoLavagem variante="teaser" />
        <Suspense fallback={null}>
          <Galeria />
        </Suspense>
        <Servicos />
        <AreaAtendimento />
        <FormOrcamento />
      </main>
      <Footer />
      <BotaoFlutuanteWhatsApp />
    </>
  );
}
