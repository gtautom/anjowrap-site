"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type ContadorProps = {
  /** Aceita prefixo/sufixo: "+500" conta ate 500 e mantem o "+". */
  valor: string;
  /** Duracao da contagem em ms. @default 1600 */
  duracao?: number;
  className?: string;
};

/** Desacelera no fim, para o numero "assentar" em vez de travar seco. */
function suavizar(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function Contador({ valor, duracao = 1600, className }: ContadorProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const alvo = Number(valor.replace(/\D/g, "")) || 0;
  const prefixo = valor.slice(0, valor.search(/\d/) === -1 ? 0 : valor.search(/\d/));
  const sufixo = valor.slice(valor.search(/\d(?!.*\d)/) + 1);

  // Comeca no alvo: se o JS nao rodar, o numero certo ja esta na tela.
  const [atual, setAtual] = useState(alvo);
  const jaRodou = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || jaRodou.current) return;

    const semMovimento = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (semMovimento) return;

    setAtual(0);

    const observer = new IntersectionObserver(
      (entradas) => {
        const visivel = entradas[0]?.isIntersecting;
        if (!visivel || jaRodou.current) return;
        jaRodou.current = true;
        observer.disconnect();

        const inicio = performance.now();
        const passo = (agora: number) => {
          const t = Math.min((agora - inicio) / duracao, 1);
          setAtual(Math.round(alvo * suavizar(t)));
          if (t < 1) requestAnimationFrame(passo);
        };
        requestAnimationFrame(passo);
      },
      { threshold: 0.6 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [alvo, duracao]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {prefixo}
      {atual.toLocaleString("pt-BR")}
      {sufixo}
    </span>
  );
}

export default Contador;
