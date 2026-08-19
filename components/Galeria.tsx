"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { FiltroPills } from "@/components/ui/filtro-pills";
import { TRABALHOS, CATEGORIAS, altDoTrabalho, type Categoria } from "@/lib/trabalhos";

type Filtro = Categoria | "Todos";

const OPCOES: Filtro[] = ["Todos", ...CATEGORIAS];

function filtroDaUrl(valor: string | null): Filtro {
  return valor && (OPCOES as string[]).includes(valor) ? (valor as Filtro) : "Todos";
}

export default function Galeria() {
  const searchParams = useSearchParams();
  const [filtro, setFiltro] = useState<Filtro>(() => filtroDaUrl(searchParams.get("categoria")));
  const [aberto, setAberto] = useState<number | null>(null);

  useEffect(() => {
    setFiltro(filtroDaUrl(searchParams.get("categoria")));
  }, [searchParams]);

  const visiveis =
    filtro === "Todos"
      ? TRABALHOS
      : TRABALHOS.filter((t) => t.categoria === filtro);

  const fechar = useCallback(() => setAberto(null), []);

  const navegar = useCallback(
    (passo: number) => {
      setAberto((atual) =>
        atual === null ? null : (atual + passo + visiveis.length) % visiveis.length,
      );
    },
    [visiveis.length],
  );

  useEffect(() => {
    if (aberto === null) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") fechar();
      if (e.key === "ArrowRight") navegar(1);
      if (e.key === "ArrowLeft") navegar(-1);
    };
    document.addEventListener("keydown", aoTeclar);
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = anterior;
    };
  }, [aberto, fechar, navegar]);

  const trabalhoAberto = aberto === null ? null : visiveis[aberto];

  return (
    <section
      id="galeria"
      className="border-t border-border px-6 py-20 md:px-16 md:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <p className="rotulo mb-4">Trabalhos</p>
        <h2 className="text-[2rem] font-semibold leading-[1.05] tracking-[0.02em] md:text-h2">
          O que sai da oficina
        </h2>

        <FiltroPills
          className="mt-10"
          rotuloGrupo="Filtro de trabalhos"
          opcoes={OPCOES}
          valor={filtro}
          aoMudar={(v) => {
            setFiltro(v);
            setAberto(null);
          }}
        />

        <ul className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          {visiveis.map((trabalho, i) => (
            <li key={trabalho.id}>
              <button
                type="button"
                onClick={() => setAberto(i)}
                className="group relative block w-full overflow-hidden rounded-2xl border border-border transition-colors hover:border-ambar"
              >
                <Image
                  src={trabalho.src}
                  alt={altDoTrabalho(trabalho)}
                  width={trabalho.largura}
                  height={trabalho.altura}
                  loading="lazy"
                  sizes="(max-width: 768px) 50vw, 33vw"
                  // Quadrado: o acervo mistura vertical (9:16) e quadrado.
                  // 4:3 cortava mais da metade da altura das verticais.
                  className="aspect-square w-full object-cover"
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-preto to-transparent p-3 text-left font-mono text-rotulo uppercase tracking-[0.14em] text-prata">
                  {trabalho.modelo}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {trabalhoAberto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={altDoTrabalho(trabalhoAberto)}
          onClick={fechar}
          className="fixed inset-0 z-50 flex items-center justify-center bg-preto/95 p-4"
        >
          <button
            type="button"
            onClick={fechar}
            aria-label="Fechar"
            className="absolute right-5 top-5 h-11 w-11 rounded-full border border-border font-mono text-legenda text-prata transition-colors hover:border-ambar hover:text-ambar"
          >
            ✕
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navegar(-1);
            }}
            aria-label="Anterior"
            className="absolute left-3 h-11 w-11 rounded-full border border-border font-mono text-prata transition-colors hover:border-ambar hover:text-ambar md:left-8"
          >
            ‹
          </button>

          <figure
            onClick={(e) => e.stopPropagation()}
            className="max-h-full w-full max-w-4xl"
          >
            <Image
              src={trabalhoAberto.src}
              alt={altDoTrabalho(trabalhoAberto)}
              width={trabalhoAberto.largura}
              height={trabalhoAberto.altura}
              sizes="(max-width: 896px) 100vw, 896px"
              className="h-auto max-h-[75vh] w-full rounded-2xl object-contain"
            />
            <figcaption className="mt-4 text-center font-mono text-legenda uppercase tracking-[0.1em] text-prata">
              {trabalhoAberto.modelo} · {trabalhoAberto.servico}
            </figcaption>
          </figure>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navegar(1);
            }}
            aria-label="Próximo"
            className="absolute right-3 h-11 w-11 rounded-full border border-border font-mono text-prata transition-colors hover:border-ambar hover:text-ambar md:right-8"
          >
            ›
          </button>
        </div>
      )}
    </section>
  );
}
