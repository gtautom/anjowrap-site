"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase/client";
import { useSessaoPortal } from "@/lib/supabase/useSessaoPortal";
import type { MembroEquipe, PapelEquipe } from "@/lib/supabase/tipos";

export default function GerenciarEquipe() {
  const router = useRouter();
  const sessao = useSessaoPortal();
  const [membros, setMembros] = useState<MembroEquipe[] | null>(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [papel, setPapel] = useState<PapelEquipe>("funcionario");
  const [erro, setErro] = useState<string | null>(null);
  const [criando, setCriando] = useState(false);

  const carregarMembros = useCallback(async () => {
    const { data } = await supabase.from("equipe").select("*").order("criado_em", { ascending: true });
    setMembros((data as MembroEquipe[]) ?? []);
  }, []);

  useEffect(() => {
    if (sessao.carregando || !sessao.logado || sessao.tipo !== "equipe") return;
    if (sessao.equipe.papel !== "admin") {
      router.replace("/portal/equipe");
      return;
    }
    carregarMembros();
  }, [sessao, router, carregarMembros]);

  if (sessao.carregando || !sessao.logado || sessao.tipo !== "equipe" || sessao.equipe.papel !== "admin" || !membros) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-prata" />
      </main>
    );
  }

  async function criarAcesso() {
    setErro(null);
    if (nome.trim().length < 2) return setErro("Informe o nome.");
    if (!email.includes("@")) return setErro("E-mail inválido.");

    setCriando(true);
    const { data, error } = await supabase.functions.invoke("criar-acesso-equipe", {
      body: { nome: nome.trim(), email: email.trim().toLowerCase(), papel },
    });
    setCriando(false);

    if (error) {
      setErro("Não foi possível criar o acesso — confira o e-mail.");
      return;
    }
    window.alert(
      `Acesso criado pra ${nome}.\n\nE-mail: ${data.email}\nSenha temporária: ${data.senhaTemporaria}\n\nRepasse — a pessoa troca depois de entrar.`,
    );
    setNome("");
    setEmail("");
    setPapel("funcionario");
    carregarMembros();
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
        <p className="rotulo mb-2">Administração</p>
        <h1 className="mb-8 font-display text-h2 font-semibold uppercase leading-none tracking-[0.02em]">
          Equipe
        </h1>

        <Card className="mb-8 p-6">
          <p className="rotulo mb-4">Novo acesso</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="eq-nome" className="mb-2 block">
                Nome
              </Label>
              <Input id="eq-nome" value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="eq-email" className="mb-2 block">
                E-mail
              </Label>
              <Input id="eq-email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="eq-papel" className="mb-2 block">
                Papel
              </Label>
              <Select value={papel} onValueChange={(v) => setPapel(v as PapelEquipe)}>
                <SelectTrigger id="eq-papel">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="funcionario">Funcionário</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {erro && (
            <p className="mt-3 font-mono text-legenda text-ambar" role="alert">
              {erro}
            </p>
          )}
          <Button onClick={criarAcesso} disabled={criando} className="mt-4">
            {criando ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" strokeWidth={1.75} />
                Criar acesso
              </>
            )}
          </Button>
        </Card>

        <ul className="grid gap-3">
          {membros.map((membro) => (
            <li key={membro.id}>
              <Card className="flex items-center justify-between p-4">
                <div>
                  <p className="font-display text-lg font-semibold uppercase tracking-[0.02em] text-offwhite">
                    {membro.nome}
                  </p>
                  <p className="font-mono text-legenda uppercase tracking-[0.1em] text-prata">
                    {membro.papel === "admin" ? "Admin" : "Funcionário"}
                    {!membro.ativo && " · Inativo"}
                  </p>
                </div>
              </Card>
            </li>
          ))}
        </ul>
    </main>
  );
}
