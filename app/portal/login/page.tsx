"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PortalCabecalho } from "@/components/portal/PortalCabecalho";
import { supabase } from "@/lib/supabase/client";
import { normalizarTelefoneBR } from "@/lib/supabase/telefone";
import { useSessaoPortal } from "@/lib/supabase/useSessaoPortal";

export default function LoginPortal() {
  const router = useRouter();
  const sessao = useSessaoPortal();
  const [identificador, setIdentificador] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (sessao.carregando || !sessao.logado) return;
    if (sessao.tipo === "equipe") router.replace("/portal/equipe");
    else if (sessao.tipo === "cliente") router.replace("/portal/cliente");
  }, [sessao, router]);

  async function entrar() {
    setErro(null);
    if (!identificador.trim() || !senha) {
      setErro("Preencha telefone ou e-mail e a senha.");
      return;
    }
    setEnviando(true);

    const ehEmail = identificador.includes("@");
    const { error } = ehEmail
      ? await supabase.auth.signInWithPassword({ email: identificador.trim().toLowerCase(), password: senha })
      : await supabase.auth.signInWithPassword({ phone: normalizarTelefoneBR(identificador), password: senha });

    setEnviando(false);
    if (error) setErro("Telefone/e-mail ou senha incorretos.");
  }

  if (sessao.carregando || (sessao.logado && sessao.tipo !== "sem-acesso")) {
    return (
      <>
        <PortalCabecalho />
        <main className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-prata" />
        </main>
      </>
    );
  }

  return (
    <>
      <PortalCabecalho />
      <main className="flex min-h-[70vh] items-center justify-center px-6 py-16">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <p className="rotulo mb-2">Plano de lavagem</p>
            <h1 className="mb-6 font-display text-h2 font-semibold uppercase leading-none tracking-[0.02em]">
              Entrar
            </h1>

            <div className="grid gap-5">
              <div>
                <Label htmlFor="identificador" className="mb-2 block">
                  Telefone ou e-mail
                </Label>
                <Input
                  id="identificador"
                  value={identificador}
                  onChange={(e) => setIdentificador(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && entrar()}
                  placeholder="(91) 90000-0000"
                  autoComplete="username"
                />
              </div>
              <div>
                <Label htmlFor="senha" className="mb-2 block">
                  Senha
                </Label>
                <Input
                  id="senha"
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && entrar()}
                  autoComplete="current-password"
                />
              </div>

              {erro && (
                <p className="font-mono text-legenda text-ambar" role="alert">
                  {erro}
                </p>
              )}
              {sessao.logado && sessao.tipo === "sem-acesso" && (
                <p className="font-mono text-legenda text-ambar" role="alert">
                  Essa conta não tem acesso ao portal. Fale com a ANJOWRAP.
                </p>
              )}

              <Button type="button" onClick={entrar} disabled={enviando} className="mt-2 w-full">
                {enviando ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" strokeWidth={1.75} />
                    Entrar
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
