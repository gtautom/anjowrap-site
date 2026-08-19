"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Check, Droplets, Loader2, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InteractiveHoverLink } from "@/components/ui/interactive-hover-button";
import { Card } from "@/components/ui/card";
import { PortalCabecalho } from "@/components/portal/PortalCabecalho";
import { supabase } from "@/lib/supabase/client";
import { useSessaoPortal } from "@/lib/supabase/useSessaoPortal";
import { LAVAGENS_POR_CICLO, estadoDoPlano, type Agendamento, type MembroEquipe } from "@/lib/supabase/tipos";
import { linkRenovarPlano } from "@/lib/plano";
import { linkPlanoLavagem } from "@/lib/whatsapp";
import { formatarHora, paraDataISO } from "@/lib/agendamento";

function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

export default function AreaCliente() {
  const router = useRouter();
  const sessao = useSessaoPortal();
  const [proximosAgendamentos, setProximosAgendamentos] = useState<Agendamento[]>([]);
  const [equipeVisivel, setEquipeVisivel] = useState<MembroEquipe[]>([]);

  const carregarExtras = useCallback(async (clienteId: string) => {
    const [{ data: ag }, { data: eq }] = await Promise.all([
      supabase
        .from("agendamentos")
        .select("*")
        .eq("cliente_id", clienteId)
        .gte("data", paraDataISO(new Date()))
        .order("data", { ascending: true })
        .order("hora", { ascending: true })
        .limit(3),
      supabase.from("equipe").select("*").eq("foto_visivel_clientes", true).eq("ativo", true),
    ]);
    setProximosAgendamentos((ag as Agendamento[]) ?? []);
    setEquipeVisivel((eq as MembroEquipe[]) ?? []);
  }, []);

  useEffect(() => {
    if (sessao.carregando) return;
    if (!sessao.logado) { router.replace("/portal/login"); return; }
    if (sessao.tipo === "equipe") { router.replace("/portal/equipe"); return; }
    if (sessao.tipo === "cliente") carregarExtras(sessao.cliente.id);
  }, [sessao, router, carregarExtras]);

  if (sessao.carregando || !sessao.logado || sessao.tipo !== "cliente") {
    return (
      <>
        <PortalCabecalho mostrarSair={sessao.logado} />
        <main className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-prata" />
        </main>
      </>
    );
  }

  const { cliente } = sessao;
  const estado = estadoDoPlano(cliente);
  const linkRenovar = linkRenovarPlano() ?? linkPlanoLavagem();
  const restantes = Math.max(0, LAVAGENS_POR_CICLO - cliente.lavagens_usadas);

  return (
    <>
      <PortalCabecalho mostrarSair />
      <main className="mx-auto max-w-2xl px-6 py-16">
        <p className="rotulo mb-2">Plano de lavagem</p>
        <h1 className="mb-8 font-display text-h2 font-semibold uppercase leading-none tracking-[0.02em]">
          Olá, {cliente.nome.split(" ")[0]}
        </h1>

        <Card className="overflow-hidden border-ambar/40">
          <div className="p-6 md:p-10">
            <span
              className={`w-fit rounded-full border px-3 py-1 font-mono text-rotulo uppercase tracking-[0.18em] ${
                estado === "ativo"
                  ? "border-ambar/40 text-ambar"
                  : "border-borda-forte text-prata"
              }`}
            >
              {estado === "ativo" && "Plano ativo"}
              {estado === "expirado" && "Plano expirado"}
              {estado === "sem-plano" && "Sem plano ativo"}
            </span>

            {estado !== "sem-plano" && (
              <>
                <div className="mt-8 flex items-center gap-3">
                  {Array.from({ length: LAVAGENS_POR_CICLO }, (_, i) => {
                    const usada = i < cliente.lavagens_usadas;
                    return (
                      <div
                        key={i}
                        className={`flex h-12 w-12 items-center justify-center rounded-xl border ${
                          usada ? "border-ambar bg-ambar/10" : "border-borda"
                        }`}
                      >
                        {usada ? (
                          <Check className="h-5 w-5 text-ambar" strokeWidth={2} />
                        ) : (
                          <Droplets className="h-5 w-5 text-terciario" strokeWidth={1.5} />
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="mt-4 font-mono text-legenda uppercase tracking-[0.1em] text-prata">
                  {cliente.lavagens_usadas} de {LAVAGENS_POR_CICLO} lavagens usadas
                  {restantes > 0 && ` · ${restantes} ${restantes === 1 ? "restante" : "restantes"}`}
                </p>

                {cliente.data_expiracao && (
                  <p className="mt-6 text-corpo text-prata">
                    {estado === "ativo" ? "Vale até " : "Venceu em "}
                    <span className="text-offwhite">{formatarData(cliente.data_expiracao)}</span>.
                  </p>
                )}
              </>
            )}

            {estado === "sem-plano" && (
              <p className="mt-6 max-w-leitura text-corpo text-prata">
                Ainda não identificamos um plano ativo pra você. Se já contratou, fale com a gente.
              </p>
            )}

            <div className="mt-8 flex flex-wrap gap-3 border-t border-border pt-8">
              <Button asChild className="w-full sm:w-auto">
                <a href={linkRenovar} target="_blank" rel="noopener noreferrer">
                  {estado === "ativo" ? "Renovar antecipado" : "Renovar"}
                </a>
              </Button>
              {estado === "ativo" && <InteractiveHoverLink href="/portal/cliente/agenda" text="Agendar lavagem" />}
            </div>
          </div>
        </Card>

        {proximosAgendamentos.length > 0 && (
          <div className="mt-10">
            <p className="rotulo mb-4">Próximos agendamentos</p>
            <ul className="grid gap-2">
              {proximosAgendamentos.map((a) => (
                <li key={a.id}>
                  <Card className="p-4">
                    <p className="font-mono text-legenda uppercase tracking-[0.1em] text-offwhite">
                      {formatarData(a.data)} · {formatarHora(a.hora)}
                    </p>
                  </Card>
                </li>
              ))}
            </ul>
            <Link
              href="/portal/cliente/agenda"
              className="mt-3 inline-block font-mono text-legenda uppercase tracking-[0.1em] text-prata underline-offset-4 hover:text-offwhite hover:underline"
            >
              Ver agenda completa
            </Link>
          </div>
        )}

        {equipeVisivel.length > 0 && (
          <div className="mt-10">
            <p className="rotulo mb-4">Nossa equipe</p>
            <ul className="grid grid-cols-3 gap-4 sm:grid-cols-4">
              {equipeVisivel.map((membro) => (
                <li key={membro.id} className="text-center">
                  <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-borda bg-card">
                    {membro.foto_url ? (
                      <Image
                        src={membro.foto_url}
                        alt={membro.nome}
                        width={64}
                        height={64}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserCircle2 className="h-8 w-8 text-terciario" strokeWidth={1.5} />
                    )}
                  </div>
                  <p className="font-mono text-legenda text-prata">{membro.nome.split(" ")[0]}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </>
  );
}
