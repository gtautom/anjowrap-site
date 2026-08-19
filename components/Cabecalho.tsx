"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { DropdownNavigation } from "@/components/ui/dropdown-navigation";
import { Button } from "@/components/ui/button";
import { NAV_ITEMS } from "@/lib/navegacao";

/**
 * Header das duas paginas. Sticky pra dar acesso a Trabalhos/Servicos/Plano
 * sem rolar — a maior parte do trafego vem do Instagram no celular, por isso
 * o painel mobile existe (o DropdownNavigation e hover-only, nao serve la).
 */
export default function Cabecalho() {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-borda bg-preto/90 backdrop-blur">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6 md:px-16">
        <Link href="/" className="shrink-0" onClick={() => setMenuAberto(false)}>
          <Image
            src="/brand/anjowrap-offwhite.png"
            alt="ANJOWRAP"
            width={1588}
            height={693}
            className="h-auto w-[120px]"
            priority
          />
        </Link>

        <div className="hidden items-center gap-4 md:flex">
          <DropdownNavigation navItems={NAV_ITEMS.slice(0, 3)} />
          <Button asChild variant="outline" size="sm">
            <Link href="/portal/login">Entrar</Link>
          </Button>
          <Button asChild size="sm">
            <a href="/#orcamento">Orçamento</a>
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setMenuAberto((v) => !v)}
          aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuAberto}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-borda text-prata transition-colors hover:border-borda-forte hover:text-offwhite md:hidden"
        >
          {menuAberto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuAberto && (
        <div className="border-t border-borda bg-preto px-6 py-6 md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-6">
            {NAV_ITEMS.map((item) =>
              item.subMenus ? (
                <div key={item.label}>
                  <p className="rotulo mb-3">{item.label}</p>
                  <ul className="flex flex-wrap gap-2">
                    {item.subMenus.flatMap((sub) => sub.items).map((sub_item) => (
                      <li key={sub_item.label}>
                        <a
                          href={sub_item.href}
                          onClick={() => setMenuAberto(false)}
                          className="block rounded-full border border-borda px-4 py-2 font-mono text-legenda uppercase tracking-[0.1em] text-prata transition-colors hover:border-borda-forte hover:text-offwhite"
                        >
                          {sub_item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <a
                  key={item.label}
                  href={item.link}
                  onClick={() => setMenuAberto(false)}
                  className="font-mono text-legenda uppercase tracking-[0.1em] text-offwhite"
                >
                  {item.label}
                </a>
              ),
            )}
            <Link
              href="/portal/login"
              onClick={() => setMenuAberto(false)}
              className="font-mono text-legenda uppercase tracking-[0.1em] text-ambar"
            >
              Entrar no portal
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
