"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Loader2, Users2, CalendarDays, UserSquare2, ShieldCheck } from "lucide-react";
import { PortalCabecalho } from "@/components/portal/PortalCabecalho";
import { SinoNotificacoes } from "@/components/portal/SinoNotificacoes";
import { useSessaoPortal } from "@/lib/supabase/useSessaoPortal";

const ABAS = [
  { href: "/portal/equipe", rotulo: "Clientes", icone: Users2 },
  { href: "/portal/equipe/agenda", rotulo: "Agenda", icone: CalendarDays },
  { href: "/portal/equipe/funcionarios", rotulo: "Funcionários", icone: UserSquare2 },
];

/**
 * Layout compartilhado das rotas de equipe: cuida do redirect de sessão
 * numa vez só (as páginas filhas não precisam mais repetir esse bloco),
 * cabeçalho com sino de notificações e navegação por abas.
 */
export default function LayoutEquipe({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const sessao = useSessaoPortal();

  useEffect(() => {
    if (sessao.carregando) return;
    if (!sessao.logado || sessao.tipo === "sem-acesso") {
      router.replace("/portal/login");
      return;
    }
    if (sessao.tipo === "cliente") router.replace("/portal/cliente");
  }, [sessao, router]);

  if (sessao.carregando || !sessao.logado || sessao.tipo !== "equipe") {
    return (
      <>
        <PortalCabecalho mostrarSair={sessao.logado} />
        <main className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-prata" />
        </main>
      </>
    );
  }

  const abas =
    sessao.equipe.papel === "admin"
      ? [...ABAS, { href: "/portal/equipe/nova-equipe", rotulo: "Equipe", icone: ShieldCheck }]
      : ABAS;

  return (
    <>
      <PortalCabecalho mostrarSair extra={<SinoNotificacoes />} />
      <nav className="border-b border-borda px-6 md:px-16">
        <div className="mx-auto flex max-w-4xl gap-1 overflow-x-auto">
          {abas.map((aba) => {
            const ativo = pathname === aba.href;
            const Icone = aba.icone;
            return (
              <Link
                key={aba.href}
                href={aba.href}
                className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 font-mono text-legenda uppercase tracking-[0.1em] transition-colors ${
                  ativo ? "border-ambar text-ambar" : "border-transparent text-prata hover:text-offwhite"
                }`}
              >
                <Icone className="h-4 w-4" strokeWidth={1.75} />
                {aba.rotulo}
              </Link>
            );
          })}
        </div>
      </nav>
      {children}
    </>
  );
}
