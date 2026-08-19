"use client";

import { useEffect, useState } from "react";
import { Bell, KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import type { Notificacao } from "@/lib/supabase/tipos";

/**
 * Sino de avisos internos da equipe — hoje só "cliente esqueceu a senha".
 * Assina a tabela notificacoes via Realtime pra atualizar sozinho, sem
 * precisar recarregar a página quando um cliente pede redefinição.
 */
export function SinoNotificacoes() {
  const [aberto, setAberto] = useState(false);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [processando, setProcessando] = useState<string | null>(null);

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase
        .from("notificacoes")
        .select("*")
        .eq("lida", false)
        .order("criado_em", { ascending: false });
      setNotificacoes((data as Notificacao[]) ?? []);
    }
    carregar();

    const canal = supabase
      .channel("notificacoes-equipe")
      .on("postgres_changes", { event: "*", schema: "public", table: "notificacoes" }, carregar)
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, []);

  async function gerarNovaSenha(notificacao: Notificacao) {
    if (!notificacao.cliente_id) return;
    setProcessando(notificacao.id);
    const { data, error } = await supabase.functions.invoke("resetar-senha-cliente", {
      body: { clienteId: notificacao.cliente_id },
    });
    setProcessando(null);

    if (error) {
      window.alert("Não foi possível gerar a senha. Tente de novo.");
      return;
    }
    window.alert(`Nova senha temporária: ${data.senhaTemporaria}\n\nRepasse pro cliente.`);
    setNotificacoes((atual) => atual.filter((n) => n.cliente_id !== notificacao.cliente_id));
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-borda text-prata transition-colors hover:border-borda-forte hover:text-offwhite"
        aria-label="Notificações"
      >
        <Bell className="h-4 w-4" strokeWidth={1.75} />
        {notificacoes.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-ambar font-mono text-[10px] font-semibold text-primary-foreground">
            {notificacoes.length}
          </span>
        )}
      </button>

      {aberto && (
        <div className="absolute right-0 top-12 z-20 w-80 rounded-xl border border-borda bg-card p-3 shadow-xl">
          {notificacoes.length === 0 ? (
            <p className="p-3 text-center font-mono text-legenda text-prata">Nenhum aviso pendente.</p>
          ) : (
            <ul className="grid gap-2">
              {notificacoes.map((n) => (
                <li key={n.id} className="rounded-lg border border-borda p-3">
                  <p className="text-legenda text-offwhite">{n.mensagem}</p>
                  {n.cliente_id && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={processando === n.id}
                      onClick={() => gerarNovaSenha(n)}
                      className="mt-2 w-full"
                    >
                      {processando === n.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <KeyRound className="mr-2 h-4 w-4" strokeWidth={1.75} />
                          Gerar nova senha
                        </>
                      )}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
