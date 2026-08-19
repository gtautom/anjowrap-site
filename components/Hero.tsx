import Image from "next/image";
import { ImageStreamHero } from "@/components/ui/image-stream-hero";
import { TRABALHOS, altDoTrabalho } from "@/lib/trabalhos";

/** O corredor roda os proprios trabalhos, nao imagem de banco. */
const IMAGENS = TRABALHOS.map((t) => ({
  src: t.src,
  alt: altDoTrabalho(t),
}));

export default function Hero() {
  return (
    <ImageStreamHero
      images={IMAGENS}
      cards={9}
      speed={20}
      axis={52}
      // cqw, nao px: o raio acompanha a escala do card ao longo do corredor
      path={{ cardRadius: 1.1 }}
      className="h-[100dvh] w-full bg-background md:h-[90vh]"
    >
      {/*
        Veu escuro: o kit proibe texto direto sobre foto. A direcao muda com o
        breakpoint porque o texto muda de lugar. No mobile ele fica embaixo,
        entao o veu desce de baixo e deixa o topo limpo pro corredor. No
        desktop o texto vai pra esquerda e o veu vira horizontal.
      */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-preto via-preto/75 to-transparent md:hidden"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-preto via-preto/70 to-transparent md:block"
        aria-hidden
      />

      <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-14 md:justify-center md:px-16 md:pb-0">
        <Image
          src="/brand/anjowrap-offwhite.png"
          alt="ANJOWRAP"
          width={1588}
          height={693}
          priority
          className="mb-8 h-auto w-[170px] md:w-[230px]"
        />

        <h1 className="max-w-[18ch] text-balance font-display text-[2.5rem] font-bold uppercase leading-[0.95] tracking-[0.01em] text-foreground sm:text-[2.75rem] md:text-h1">
          Proteção de pintura PPF para todo o Brasil
        </h1>

        <p className="mt-5 max-w-leitura text-corpo text-texto-claro">
          A película absorve o desgaste do dia a dia sem alterar a cor do seu
          carro.
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <a
            href="#orcamento"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-ambar px-8 font-display text-h3 font-semibold uppercase tracking-[0.14em] text-preto transition-colors hover:bg-ambar-claro"
          >
            Pedir orçamento
          </a>
          <a
            href="#galeria"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-borda-forte px-8 font-display text-h3 font-semibold uppercase tracking-[0.14em] text-offwhite backdrop-blur-sm transition-colors hover:border-offwhite"
          >
            Ver trabalhos
          </a>
        </div>
      </div>
    </ImageStreamHero>
  );
}
