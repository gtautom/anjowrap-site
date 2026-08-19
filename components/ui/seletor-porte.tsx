"use client";

import { cn } from "@/lib/utils";
import { PORTES, type Porte } from "@/lib/catalogo";

export type SeletorPorteProps = {
  valor: Porte;
  aoMudar: (porte: Porte) => void;
  className?: string;
};

/**
 * Radiogroup de 3 botões — nunca um <select>. No celular, select nativo
 * abre um modal pra uma escolha de três; um segmented control resolve no
 * mesmo toque.
 */
export function SeletorPorte({ valor, aoMudar, className }: SeletorPorteProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Porte do veículo"
      className={cn(
        "grid grid-cols-3 gap-2 rounded-2xl border border-border bg-card p-1.5",
        className,
      )}
    >
      {PORTES.map((porte) => {
        const ativo = porte === valor;
        return (
          <button
            key={porte}
            type="button"
            role="radio"
            aria-checked={ativo}
            onClick={() => aoMudar(porte)}
            className={cn(
              "h-10 rounded-xl px-2 font-mono text-legenda uppercase tracking-[0.08em] transition-colors",
              ativo
                ? "border border-ambar text-ambar"
                : "border border-transparent text-prata hover:text-offwhite",
            )}
          >
            {porte}
          </button>
        );
      })}
    </div>
  );
}
