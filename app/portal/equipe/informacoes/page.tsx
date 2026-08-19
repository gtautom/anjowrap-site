"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { PainelAdesao, type FiltroAdesao } from "@/components/portal/PainelAdesao";
import { supabase } from "@/lib/supabase/client";
import { useSessaoPortal } from "@/lib/supabase/useSessaoPortal";
import type { ClientePlano } from "@/lib/supabase/tipos";

/**
 * Visão geral do plano — separada da lista de clientes (que fica em
 * /portal/equipe). Clicar num card leva pra lista já filtrada lá.
 */
export default function InformacoesGerais() {
  const router = useRouter();
  const sessao = useSessaoPortal();
  const [clientes, setClientes] = useState<ClientePlano[] | null>(null);

  const carregar = useCallback(async () => {
    const { data } = await supabase.from("clientes_plano").select("*").eq("arquivado", false);
    setClientes((data as ClientePlano[]) ?? []);
  }, []);

  useEffect(() => {
    if (sessao.carregando || !sessao.logado || sessao.tipo !== "equipe") return;
    carregar();
  }, [sessao, carregar]);

  if (sessao.carregando || !sessao.logado || sessao.tipo !== "equipe" || !clientes) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-prata" />
      </main>
    );
  }

  function irParaLista(filtro: FiltroAdesao) {
    router.push(`/portal/equipe?filtro=${filtro}`);
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <p className="rotulo mb-2">Equipe</p>
      <h1 className="mb-8 font-display text-h2 font-semibold uppercase leading-none tracking-[0.02em]">
        Informações gerais
      </h1>

      <PainelAdesao clientes={clientes} filtro="todos" onFiltrar={irParaLista} />
    </main>
  );
}
