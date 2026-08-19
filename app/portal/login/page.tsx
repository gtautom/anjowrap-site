"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, Loader2, Eye, EyeOff } from "lucide-react";
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
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const [esqueciAberto, setEsqueciAberto] = useState(false);
  const [telefoneEsqueci, setTelefoneEsqueci] = useState("");
  const [enviandoEsqueci, setEnviandoEsqueci] = useState(false);
  const [mensagemEsqueci, setMensagemEsqueci] = useState<string | null>(null);

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

  async function solicitarRedefinicao() {
    setMensagemEsqueci(null);
    const telefone = normalizarTelefoneBR(telefoneEsqueci);
    if (telefone.replace(/\D/g, "").length < 12) {
      setMensagemEsqueci("Informe o telefone completo, com DDD.");
      return;
    }
    setEnviandoEsqueci(true);
    await supabase.rpc("solicitar_redefinicao_senha", { p_telefone: telefone });
    setEnviandoEsqueci(false);
    setMensagemEsqueci("Se esse telefone estiver cadastrado, a equipe vai te procurar em breve.");
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
                <div className="relative">
                  <Input
                    id="senha"
                    type={mostrarSenha ? "text" : "password"}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && entrar()}
                    autoComplete="current-password"
                    className="pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-terciario transition-colors hover:text-prata"
                    aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {mostrarSenha ? (
                      <EyeOff className="h-4 w-4" strokeWidth={1.75} />
                    ) : (
                      <Eye className="h-4 w-4" strokeWidth={1.75} />
                    )}
                  </button>
                </div>
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

              {!esqueciAberto ? (
                <button
                  type="button"
                  onClick={() => setEsqueciAberto(true)}
                  className="text-center font-mono text-legenda uppercase tracking-[0.1em] text-prata underline-offset-4 hover:text-offwhite hover:underline"
                >
                  Esqueci a senha
                </button>
              ) : (
                <div className="border-t border-border pt-5">
                  <Label htmlFor="telefone-esqueci" className="mb-2 block">
                    Telefone cadastrado
                  </Label>
                  <Input
                    id="telefone-esqueci"
                    value={telefoneEsqueci}
                    onChange={(e) => setTelefoneEsqueci(e.target.value)}
                    placeholder="(91) 90000-0000"
                  />
                  {mensagemEsqueci ? (
                    <p className="mt-3 font-mono text-legenda text-ambar">{mensagemEsqueci}</p>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={solicitarRedefinicao}
                      disabled={enviandoEsqueci}
                      className="mt-3 w-full"
                    >
                      {enviandoEsqueci ? <Loader2 className="h-4 w-4 animate-spin" /> : "Avisar a equipe"}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
