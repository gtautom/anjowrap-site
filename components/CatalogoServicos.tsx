"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FiltroPills } from "@/components/ui/filtro-pills";
import { SeletorPorte } from "@/components/ui/seletor-porte";
import { CardServico } from "@/components/CardServico";
import { CATALOGO, CATEGORIAS_CATALOGO, type CategoriaCatalogo, type Porte } from "@/lib/catalogo";

type Filtro = CategoriaCatalogo | "Todos";

const OPCOES: Filtro[] = ["Todos", ...CATEGORIAS_CATALOGO];

function filtroDaUrl(valor: string | null): Filtro {
  return valor && (OPCOES as string[]).includes(valor) ? (valor as Filtro) : "Todos";
}

export function CatalogoServicos() {
  const searchParams = useSearchParams();
  const [filtro, setFiltro] = useState<Filtro>(() => filtroDaUrl(searchParams.get("categoria")));
  const [porte, setPorte] = useState<Porte>("Sedan");

  useEffect(() => {
    setFiltro(filtroDaUrl(searchParams.get("categoria")));
  }, [searchParams]);

  const visiveis =
    filtro === "Todos" ? CATALOGO : CATALOGO.filter((item) => item.categoria === filtro);

  return (
    <section className="border-t border-border px-6 py-16 md:px-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        {/* Sticky: o porte precisa continuar alcançável rolando 15 cards no celular.
            top-16 pra ficar logo abaixo do header fixo (h-16). */}
        <div className="sticky top-16 z-30 -mx-6 border-b border-border bg-preto/95 px-6 py-4 backdrop-blur md:-mx-16 md:px-16">
          <div className="mx-auto max-w-6xl">
            <p className="rotulo mb-3">Porte do veículo</p>
            <SeletorPorte valor={porte} aoMudar={setPorte} className="max-w-md" />
          </div>
        </div>

        <FiltroPills
          className="mt-10"
          rotuloGrupo="Filtro de categorias"
          opcoes={OPCOES}
          valor={filtro}
          aoMudar={setFiltro}
        />

        <ul className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visiveis.map((item) => (
            // self-start: as listas variam de 3 a 25 itens, e o stretch
            // padrao do grid faria um card grande inflar a linha inteira.
            <li key={item.id} className="self-start">
              <CardServico item={item} porte={porte} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
