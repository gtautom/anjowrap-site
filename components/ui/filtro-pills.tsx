"use client";

import { cn } from "@/lib/utils";

export type FiltroPillsProps<T extends string> = {
  opcoes: readonly T[];
  valor: T;
  aoMudar: (v: T) => void;
  rotuloGrupo: string;
  className?: string;
};

/**
 * Barra de filtro com alvo fixo — nada cresce nem desloca no hover.
 * Substitui o Dock com magnificacao (components/ui/dock.tsx), que empurrava
 * a grade abaixo ao animar a altura do container e fazia o botao fugir do
 * cursor ao animar a largura de cada item.
 */
export function FiltroPills<T extends string>({
  opcoes,
  valor,
  aoMudar,
  rotuloGrupo,
  className,
}: FiltroPillsProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={rotuloGrupo}
      className={cn("flex flex-wrap gap-2", className)}
    >
      {opcoes.map((opcao) => {
        const ativo = opcao === valor;
        return (
          <button
            key={opcao}
            type="button"
            role="radio"
            aria-checked={ativo}
            onClick={() => aoMudar(opcao)}
            className={cn(
              "h-10 rounded-full border px-5 font-mono text-legenda uppercase tracking-[0.1em] transition-colors",
              ativo
                ? "border-ambar text-ambar"
                : "border-borda text-prata hover:border-borda-forte",
            )}
          >
            {opcao}
          </button>
        );
      })}
    </div>
  );
}
