"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, UserCircle2, Eye, EyeOff, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PortalCabecalho } from "@/components/portal/PortalCabecalho";
import { supabase } from "@/lib/supabase/client";
import { enviarFoto } from "@/lib/supabase/storage";
import { useSessaoPortal } from "@/lib/supabase/useSessaoPortal";

export default function MeuUsuario() {
  const router = useRouter();
  const sessao = useSessaoPortal();
  const inputFotoRef = useRef<HTMLInputElement>(null);
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [visivelClientes, setVisivelClientes] = useState(false);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [erroFoto, setErroFoto] = useState<string | null>(null);

  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [salvandoSenha, setSalvandoSenha] = useState(false);
  const [mensagemSenha, setMensagemSenha] = useState<string | null>(null);
  const [erroSenha, setErroSenha] = useState<string | null>(null);

  useEffect(() => {
    if (sessao.carregando) return;
    if (!sessao.logado || sessao.tipo === "sem-acesso") { router.replace("/portal/login"); return; }
    if (sessao.tipo === "cliente") setFotoUrl(sessao.cliente.foto_url);
    if (sessao.tipo === "equipe") {
      setFotoUrl(sessao.equipe.foto_url);
      setVisivelClientes(sessao.equipe.foto_visivel_clientes);
    }
  }, [sessao, router]);

  if (sessao.carregando || !sessao.logado || sessao.tipo === "sem-acesso") {
    return (
      <>
        <PortalCabecalho mostrarSair={sessao.logado} />
        <main className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-prata" />
        </main>
      </>
    );
  }

  const ehCliente = sessao.tipo === "cliente";
  const nome = ehCliente ? sessao.cliente.nome : sessao.equipe.nome;
  const userId = ehCliente ? sessao.cliente.user_id : sessao.equipe.id;

  async function selecionarFoto(arquivo: File) {
    if (!userId) return;
    setErroFoto(null);
    if (arquivo.size > 5 * 1024 * 1024) {
      setErroFoto("A foto precisa ter até 5MB.");
      return;
    }
    setEnviandoFoto(true);
    try {
      const url = await enviarFoto(arquivo, userId);
      if (ehCliente) {
        await supabase.rpc("atualizar_minha_foto_cliente", { p_foto_url: url });
      } else {
        await supabase.rpc("atualizar_meu_perfil_equipe", { p_foto_url: url, p_visivel: visivelClientes });
      }
      setFotoUrl(url);
    } catch {
      setErroFoto("Não foi possível enviar a foto.");
    }
    setEnviandoFoto(false);
  }

  async function alternarVisibilidade() {
    const novoValor = !visivelClientes;
    setVisivelClientes(novoValor);
    await supabase.rpc("atualizar_meu_perfil_equipe", { p_foto_url: fotoUrl, p_visivel: novoValor });
  }

  async function trocarSenha() {
    setErroSenha(null);
    setMensagemSenha(null);
    if (novaSenha.length < 6) return setErroSenha("A senha precisa ter pelo menos 6 caracteres.");
    if (novaSenha !== confirmarSenha) return setErroSenha("As senhas não coincidem.");

    setSalvandoSenha(true);
    const { error } = await supabase.auth.updateUser({ password: novaSenha });
    setSalvandoSenha(false);

    if (error) {
      setErroSenha("Não foi possível trocar a senha.");
      return;
    }
    setMensagemSenha("Senha atualizada.");
    setNovaSenha("");
    setConfirmarSenha("");
  }

  return (
    <>
      <PortalCabecalho mostrarSair />
      <main className="mx-auto max-w-2xl px-6 py-16">
        <p className="rotulo mb-2">Minha conta</p>
        <h1 className="mb-8 font-display text-h2 font-semibold uppercase leading-none tracking-[0.02em]">
          {nome.split(" ")[0]}
        </h1>

        <Card className="mb-6 p-6">
          <p className="rotulo mb-4">Foto de perfil</p>
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-borda bg-card">
              {fotoUrl ? (
                <Image src={fotoUrl} alt={nome} width={80} height={80} className="h-full w-full object-cover" />
              ) : (
                <UserCircle2 className="h-10 w-10 text-terciario" strokeWidth={1.5} />
              )}
            </div>
            <div>
              <input
                ref={inputFotoRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && selecionarFoto(e.target.files[0])}
              />
              <Button
                size="sm"
                variant="outline"
                disabled={enviandoFoto}
                onClick={() => inputFotoRef.current?.click()}
              >
                {enviandoFoto ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Camera className="mr-2 h-4 w-4" strokeWidth={1.75} />
                    Trocar foto
                  </>
                )}
              </Button>
              {erroFoto && (
                <p className="mt-2 font-mono text-legenda text-ambar" role="alert">
                  {erroFoto}
                </p>
              )}
            </div>
          </div>

          {sessao.tipo === "equipe" && (
            <button
              type="button"
              onClick={alternarVisibilidade}
              className="mt-5 flex items-center gap-2 border-t border-border pt-5 font-mono text-legenda uppercase tracking-[0.1em] text-prata transition-colors hover:text-offwhite"
            >
              {visivelClientes ? (
                <>
                  <Eye className="h-4 w-4 text-ambar" strokeWidth={1.75} />
                  Meu perfil aparece pros clientes
                </>
              ) : (
                <>
                  <EyeOff className="h-4 w-4" strokeWidth={1.75} />
                  Meu perfil não aparece pros clientes
                </>
              )}
            </button>
          )}
        </Card>

        <Card className="p-6">
          <p className="rotulo mb-4">Trocar senha</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="nova-senha" className="mb-2 block">
                Nova senha
              </Label>
              <Input
                id="nova-senha"
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div>
              <Label htmlFor="confirmar-senha" className="mb-2 block">
                Confirmar senha
              </Label>
              <Input
                id="confirmar-senha"
                type="password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                autoComplete="new-password"
              />
            </div>
          </div>
          {erroSenha && (
            <p className="mt-3 font-mono text-legenda text-ambar" role="alert">
              {erroSenha}
            </p>
          )}
          {mensagemSenha && <p className="mt-3 font-mono text-legenda text-ambar">{mensagemSenha}</p>}
          <Button onClick={trocarSenha} disabled={salvandoSenha} className="mt-4">
            {salvandoSenha ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar senha"}
          </Button>
        </Card>
      </main>
    </>
  );
}
