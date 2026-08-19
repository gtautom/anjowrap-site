"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Loader2, UserCircle2, Eye, EyeOff } from "lucide-react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";
import { useSessaoPortal } from "@/lib/supabase/useSessaoPortal";
import type { MembroEquipe } from "@/lib/supabase/tipos";

export default function Funcionarios() {
  const sessao = useSessaoPortal();
  const [membros, setMembros] = useState<MembroEquipe[] | null>(null);

  const carregar = useCallback(async () => {
    const { data } = await supabase.from("equipe").select("*").order("nome", { ascending: true });
    setMembros((data as MembroEquipe[]) ?? []);
  }, []);

  useEffect(() => {
    if (sessao.carregando || !sessao.logado || sessao.tipo !== "equipe") return;
    carregar();
  }, [sessao, carregar]);

  if (sessao.carregando || !sessao.logado || sessao.tipo !== "equipe" || !membros) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-prata" />
      </main>
    );
  }

  const visiveis = sessao.equipe.papel === "admin" ? membros : membros.filter((m) => m.ativo);

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <p className="rotulo mb-2">Equipe</p>
      <h1 className="mb-8 font-display text-h2 font-semibold uppercase leading-none tracking-[0.02em]">
        Funcionários
      </h1>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visiveis.map((membro) => (
          <li key={membro.id}>
            <Card className="p-5">
              <div className="mb-3 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-borda bg-card">
                {membro.foto_url ? (
                  <Image src={membro.foto_url} alt={membro.nome} width={80} height={80} className="h-full w-full object-cover" />
                ) : (
                  <UserCircle2 className="h-10 w-10 text-terciario" strokeWidth={1.5} />
                )}
              </div>
              <p className="font-display text-lg font-semibold uppercase tracking-[0.02em] text-offwhite">
                {membro.nome}
              </p>
              <p className="font-mono text-legenda uppercase tracking-[0.1em] text-prata">
                {membro.papel === "admin" ? "Admin" : "Funcionário"}
                {!membro.ativo && " · Inativo"}
              </p>
              <p className="mt-2 flex items-center gap-2 font-mono text-rotulo uppercase tracking-[0.1em] text-terciario">
                {membro.foto_visivel_clientes ? (
                  <>
                    <Eye className="h-3.5 w-3.5" strokeWidth={1.75} />
                    Visível pros clientes
                  </>
                ) : (
                  <>
                    <EyeOff className="h-3.5 w-3.5" strokeWidth={1.75} />
                    Não aparece pros clientes
                  </>
                )}
              </p>
            </Card>
          </li>
        ))}
      </ul>
    </main>
  );
}
