import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const CLASSE_BASE =
  "group relative w-full cursor-pointer overflow-hidden rounded-xl border border-borda-forte bg-transparent px-8 py-3 text-center font-display text-h3 font-semibold uppercase tracking-[0.14em] text-foreground transition-colors sm:w-auto";

function Conteudo({ text }: { text: string }) {
  return (
    <>
      <span className="inline-block translate-x-1 transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
        {text}
      </span>
      <div className="absolute inset-0 z-10 flex translate-x-12 items-center justify-center gap-2 text-primary-foreground opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
        <span>{text}</span>
        <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
      </div>
      <div className="absolute left-[20%] top-1/2 h-2 w-2 -translate-y-1/2 rounded-lg bg-primary transition-all duration-300 group-hover:left-0 group-hover:top-0 group-hover:h-full group-hover:w-full group-hover:translate-y-0" />
    </>
  );
}

export interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
}

/**
 * CTA único com efeito hover (ponto âmbar expande e engole o botão). Usar
 * só em ações singulares, não em grid repetido — o preenchimento sólido em
 * âmbar no fim da animação estoura o teto de 5% da marca se repetido
 * lado a lado (ver clientes/AnjoWrap/CLAUDE.md).
 */
const InteractiveHoverButton = React.forwardRef<HTMLButtonElement, InteractiveHoverButtonProps>(
  ({ text = "Continuar", className, ...props }, ref) => (
    <button ref={ref} className={cn(CLASSE_BASE, className)} {...props}>
      <Conteudo text={text} />
    </button>
  ),
);
InteractiveHoverButton.displayName = "InteractiveHoverButton";

export interface InteractiveHoverLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  text?: string;
  href: string;
}

/** Mesmo botão, como link — usa `next/link` em vez de `<button>` (ex.: navegar pra agenda). */
const InteractiveHoverLink = React.forwardRef<HTMLAnchorElement, InteractiveHoverLinkProps>(
  ({ text = "Continuar", className, href, ...props }, ref) => (
    <Link ref={ref} href={href} className={cn(CLASSE_BASE, className)} {...props}>
      <Conteudo text={text} />
    </Link>
  ),
);
InteractiveHoverLink.displayName = "InteractiveHoverLink";

export { InteractiveHoverButton, InteractiveHoverLink };
