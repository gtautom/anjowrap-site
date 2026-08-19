"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Droplets, CheckCircle2, Undo2, Archive, ArchiveRestore } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PainelAdesao, type FiltroAdesao } from "@/components/portal/PainelAdesao";
import { supabase } from "@/lib/supabase/client";
import { normalizarTelefoneBR } from "@/lib/supabase/telefone";
import { useSessaoPortal } from "@/lib/supabase/useSessaoPortal";
import { LAVAGENS_POR_CICLO, estadoDoPlano, type ClientePlano, type EstadoPlano } from "@/lib/supabase/tipos";

function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

// "pendente" é status de cliente (nunca contratou); os demais vêm de EstadoPlano,
// derivado de data_expiracao — não existe um "status" solto pra isso no banco.
const PESO_ORDENACAO: Record<"pendente" | EstadoPlano, number> = {
  pendente: 0,
  expirado: 1,
  "sem-plano": 1,
  ativo: 2,
};

function pesoOrdenacao(cliente: ClientePlano): number {
  if (cliente.status === "pendente") return PESO_ORDENACAO.pendente;
  return PESO_ORDENACAO[estadoDoPlano(cliente)];
}

function Emblema({ cliente }: { cliente: ClientePlano }) {
  if (cliente.status === "pendente") {
    return (
      <span className="w-fit rounded-full border border-borda-forte px-3 py-1 font-mono text-rotulo uppercase tracking-[0.18em] text-prata">
        Pendente
      </span>
    );
  }
  const estado = estadoDoPlano(cliente);
  return (
    <span
      className={`w-fit rounded-full border px-3 py-1 font-mono text-rotulo uppercase tracking-[0.18em] ${
        estado === "ativo" ? "border-ambar/40 text-ambar" : "border-borda-forte text-prata"
      }`}
    >
      {estado === "ativo" ? "Ativo" : "Expirado"}
    </span>
  );
}

export default function PainelEquipe() {
  const sessao = useSessaoPortal();
  const [clientes, setClientes] = useState<ClientePlano[] | null>(null);
  const [formAberto, setFormAberto] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novoTelefone, setNovoTelefone] = useState("");
  const [novoEmail, setNovoEmail] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState<string | null>(null);
  const [processando, setProcessando] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<FiltroAdesao>("todos");
  const [verArquivados, setVerArquivados] = useState(false);

  const carregarClientes = useCallback(async () => {
    const { data } = await supabase.from("clientes_plano").select("*").order("nome", { ascending: true });
    setClientes((data as ClientePlano[]) ?? []);
  }, []);

  useEffect(() => {
    if (sessao.carregando || !sessao.logado || sessao.tipo !== "equipe") return;
    carregarClientes();
  }, [sessao, carregarClientes]);

  if (sessao.carregando || !sessao.logado || sessao.tipo !== "equipe" || !clientes) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-prata" />
      </main>
    );
  }

  const { equipe } = sessao;
  const visiveis = clientes.filter((c) => (verArquivados ? c.arquivado : !c.arquivado));
  const filtrados = visiveis.filter((c) => {
    if (filtro === "ativos") return c.status === "contratado" && estadoDoPlano(c) === "ativo";
    if (filtro === "aguardando") return c.status === "contratado" && estadoDoPlano(c) === "expirado";
    if (filtro === "pendentes") return c.status === "pendente";
    return true;
  });
  const ordenados = [...filtrados].sort((a, b) => pesoOrdenacao(a) - pesoOrdenacao(b) || a.nome.localeCompare(b.nome));

  async function cadastrarCliente() {
    setErroForm(null);
    if (novoNome.trim().length < 2) return setErroForm("Informe o nome.");
    const telefone = normalizarTelefoneBR(novoTelefone);
    if (telefone.replace(/\D/g, "").length < 12) return setErroForm("Telefone incompleto — inclua o DDD.");

    setSalvando(true);
    const { error } = await supabase.from("clientes_plano").insert({
      nome: novoNome.trim(),
      telefone,
      email: novoEmail.trim() || null,
      criado_por: equipe.id,
    });
    setSalvando(false);

    if (error) {
      setErroForm(error.code === "23505" ? "Já existe um cliente com esse telefone." : "Não foi possível cadastrar.");
      return;
    }
    setNovoNome("");
    setNovoTelefone("");
    setNovoEmail("");
    setFormAberto(false);
    carregarClientes();
  }

  async function registrarLavagem(cliente: ClientePlano) {
    if (cliente.lavagens_usadas >= LAVAGENS_POR_CICLO) {
      const seguir = window.confirm(
        `${cliente.nome} já usou as ${LAVAGENS_POR_CICLO} lavagens deste ciclo. Registrar mais uma mesmo assim?`,
      );
      if (!seguir) return;
    }

    setProcessando(cliente.id);
    const { error: erroLavagem } = await supabase
      .from("lavagens")
      .insert({ cliente_id: cliente.id, registrado_por: equipe.id });

    if (!erroLavagem) {
      await supabase
        .from("clientes_plano")
        .update({ lavagens_usadas: cliente.lavagens_usadas + 1 })
        .eq("id", cliente.id);
    }
    setProcessando(null);
    carregarClientes();
  }

  async function desmarcarLavagem(cliente: ClientePlano) {
    if (cliente.lavagens_usadas === 0) return;
    const seguir = window.confirm(`Desmarcar a última lavagem registrada de ${cliente.nome}?`);
    if (!seguir) return;

    setProcessando(cliente.id);
    const { data: ultima } = await supabase
      .from("lavagens")
      .select("id")
      .eq("cliente_id", cliente.id)
      .order("data", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (ultima) {
      await supabase.from("lavagens").delete().eq("id", ultima.id);
      await supabase
        .from("clientes_plano")
        .update({ lavagens_usadas: Math.max(0, cliente.lavagens_usadas - 1) })
        .eq("id", cliente.id);
    }
    setProcessando(null);
    carregarClientes();
  }

  async function alternarArquivado(cliente: ClientePlano) {
    const arquivando = !cliente.arquivado;
    if (arquivando) {
      const seguir = window.confirm(`Arquivar ${cliente.nome}? Some das listas ativas, mas o histórico é mantido.`);
      if (!seguir) return;
    }

    setProcessando(cliente.id);
    await supabase
      .from("clientes_plano")
      .update({ arquivado: arquivando, arquivado_em: arquivando ? new Date().toISOString() : null })
      .eq("id", cliente.id);
    setProcessando(null);
    carregarClientes();
  }

  async function confirmarPagamento(cliente: ClientePlano) {
    const renovando = cliente.status === "contratado";
    const seguir = window.confirm(
      renovando
        ? `Confirmar pagamento e renovar o plano de ${cliente.nome} por mais 30 dias?`
        : `Confirmar o pagamento de ${cliente.nome} e ativar o plano?`,
    );
    if (!seguir) return;

    setProcessando(cliente.id);
    const { data, error } = await supabase.functions.invoke("confirmar-pagamento", {
      body: { clienteId: cliente.id },
    });
    setProcessando(null);

    if (error) {
      window.alert("Não foi possível confirmar o pagamento. Tente de novo.");
      return;
    }
    if (data.senhaTemporaria) {
      window.alert(
        `Acesso criado pra ${cliente.nome}.\n\nTelefone: ${cliente.telefone}\nSenha temporária: ${data.senhaTemporaria}\n\nRepasse pro cliente — ele troca depois de entrar.`,
      );
    } else {
      window.alert(`Plano renovado até ${formatarData(data.dataExpiracao)}.`);
    }
    carregarClientes();
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="rotulo mb-2">Equipe · {equipe.papel === "admin" ? "Admin" : "Funcionário"}</p>
          <h1 className="font-display text-h2 font-semibold uppercase leading-none tracking-[0.02em]">
            Clientes do plano
          </h1>
        </div>
        <InteractiveHoverButton
          type="button"
          text={formAberto ? "Fechar" : "Novo cliente"}
          onClick={() => setFormAberto((v) => !v)}
        />
      </div>

      <PainelAdesao clientes={visiveis} filtro={filtro} onFiltrar={setFiltro} />

      {formAberto && (
        <Card className="mb-8 p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="novo-nome" className="mb-2 block">
                Nome
              </Label>
              <Input id="novo-nome" value={novoNome} onChange={(e) => setNovoNome(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="novo-telefone" className="mb-2 block">
                Telefone
              </Label>
              <Input
                id="novo-telefone"
                value={novoTelefone}
                onChange={(e) => setNovoTelefone(e.target.value)}
                placeholder="(91) 90000-0000"
              />
            </div>
            <div>
              <Label htmlFor="novo-email" className="mb-2 block">
                E-mail (opcional)
              </Label>
              <Input id="novo-email" value={novoEmail} onChange={(e) => setNovoEmail(e.target.value)} />
            </div>
          </div>
          {erroForm && (
            <p className="mt-3 font-mono text-legenda text-ambar" role="alert">
              {erroForm}
            </p>
          )}
          <Button onClick={cadastrarCliente} disabled={salvando} className="mt-4">
            {salvando ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cadastrar"}
          </Button>
        </Card>
      )}

      <div className="mb-4 flex items-center justify-between">
        <p className="font-mono text-legenda uppercase tracking-[0.1em] text-prata">
          {ordenados.length} {ordenados.length === 1 ? "cliente" : "clientes"}
        </p>
        <button
          type="button"
          onClick={() => setVerArquivados((v) => !v)}
          className="font-mono text-legenda uppercase tracking-[0.1em] text-prata underline-offset-4 hover:text-offwhite hover:underline"
        >
          {verArquivados ? "Ver ativos" : "Ver arquivados"}
        </button>
      </div>

      {ordenados.length === 0 ? (
        <p className="text-corpo text-prata">Nenhum cliente encontrado.</p>
      ) : (
        <ul className="grid gap-3">
          {ordenados.map((cliente) => (
            <li key={cliente.id}>
              <Card className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap gap-2">
                      <Emblema cliente={cliente} />
                      {cliente.arquivado && (
                        <span className="w-fit rounded-full border border-borda-forte px-3 py-1 font-mono text-rotulo uppercase tracking-[0.18em] text-prata">
                          Arquivado
                        </span>
                      )}
                    </div>
                    <p className="font-display text-lg font-semibold uppercase tracking-[0.02em] text-offwhite">
                      {cliente.nome}
                    </p>
                    <p className="font-mono text-legenda text-prata">{cliente.telefone}</p>
                    {cliente.status === "contratado" && (
                      <p className="mt-1 font-mono text-legenda uppercase tracking-[0.1em] text-prata">
                        {cliente.lavagens_usadas}/{LAVAGENS_POR_CICLO} lavagens
                        {cliente.data_expiracao && ` · até ${formatarData(cliente.data_expiracao)}`}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {!cliente.arquivado && cliente.status === "contratado" && estadoDoPlano(cliente) === "ativo" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={processando === cliente.id}
                          onClick={() => registrarLavagem(cliente)}
                        >
                          <Droplets className="mr-2 h-4 w-4" strokeWidth={1.75} />
                          Registrar lavagem
                        </Button>
                        {cliente.lavagens_usadas > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={processando === cliente.id}
                            onClick={() => desmarcarLavagem(cliente)}
                          >
                            <Undo2 className="mr-2 h-4 w-4" strokeWidth={1.75} />
                            Desmarcar lavagem
                          </Button>
                        )}
                      </>
                    )}
                    {!cliente.arquivado && (
                      <Button
                        size="sm"
                        disabled={processando === cliente.id}
                        onClick={() => confirmarPagamento(cliente)}
                      >
                        {processando === cliente.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" strokeWidth={1.75} />
                            {cliente.status === "pendente" ? "Confirmar pagamento" : "Renovar"}
                          </>
                        )}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={processando === cliente.id}
                      onClick={() => alternarArquivado(cliente)}
                    >
                      {cliente.arquivado ? (
                        <>
                          <ArchiveRestore className="mr-2 h-4 w-4" strokeWidth={1.75} />
                          Reativar
                        </>
                      ) : (
                        <>
                          <Archive className="mr-2 h-4 w-4" strokeWidth={1.75} />
                          Arquivar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
