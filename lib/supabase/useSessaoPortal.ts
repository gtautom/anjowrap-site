"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { MembroEquipe, ClientePlano } from "@/lib/supabase/tipos";

export type SessaoPortal =
  | { carregando: true; logado: false }
  | { carregando: false; logado: false }
  | { carregando: false; logado: true; tipo: "equipe"; equipe: MembroEquipe }
  | { carregando: false; logado: true; tipo: "cliente"; cliente: ClientePlano }
  // Autenticado no Supabase mas sem linha em equipe nem em clientes_plano —
  // não deveria acontecer no fluxo normal (login só existe via Edge
  // Function, que sempre cria a linha junto), mas cobre o caso.
  | { carregando: false; logado: true; tipo: "sem-acesso" };

/**
 * Única fonte da sessão do portal — decide equipe vs cliente consultando
 * as duas tabelas (RLS já garante que cada um só vê a própria linha).
 * Reage a login/logout via onAuthStateChange, então as páginas não
 * precisam se preocupar com isso.
 */
export function useSessaoPortal(): SessaoPortal {
  const [sessao, setSessao] = useState<SessaoPortal>({ carregando: true, logado: false });

  useEffect(() => {
    let cancelado = false;

    async function carregarPerfil(userId: string) {
      const [equipeResp, clienteResp] = await Promise.all([
        supabase.from("equipe").select("*").eq("id", userId).maybeSingle(),
        supabase.from("clientes_plano").select("*").eq("user_id", userId).maybeSingle(),
      ]);

      if (cancelado) return;

      if (equipeResp.data) {
        setSessao({ carregando: false, logado: true, tipo: "equipe", equipe: equipeResp.data as MembroEquipe });
      } else if (clienteResp.data) {
        setSessao({ carregando: false, logado: true, tipo: "cliente", cliente: clienteResp.data as ClientePlano });
      } else {
        setSessao({ carregando: false, logado: true, tipo: "sem-acesso" });
      }
    }

    supabase.auth.getSession().then(({ data }) => {
      if (cancelado) return;
      if (data.session?.user) carregarPerfil(data.session.user.id);
      else setSessao({ carregando: false, logado: false });
    });

    const { data: assinatura } = supabase.auth.onAuthStateChange((_evento, session) => {
      if (session?.user) carregarPerfil(session.user.id);
      else setSessao({ carregando: false, logado: false });
    });

    return () => {
      cancelado = true;
      assinatura.subscription.unsubscribe();
    };
  }, []);

  return sessao;
}
