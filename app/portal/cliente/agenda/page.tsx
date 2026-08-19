"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PortalCabecalho } from "@/components/portal/PortalCabecalho";
import { CalendarioMes, type MarcadorDia } from "@/components/portal/CalendarioMes";
import { supabase } from "@/lib/supabase/client";
import { useSessaoPortal } from "@/lib/supabase/useSessaoPortal";
import { gerarHorariosDoDia, formatarHora, paraDataISO } from "@/lib/agendamento";
import { estadoDoPlano, type Agendamento, type HorarioOcupado, type HorarioBloqueado } from "@/lib/supabase/tipos";

function formatarDataExibicao(iso: string): string {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

export default function AgendaCliente() {
  const router = useRouter();
  const sessao = useSessaoPortal();
  const [mes, setMes] = useState(() => new Date());
  const [diaSelecionado, setDiaSelecionado] = useState<string | null>(null);
  const [ocupados, setOcupados] = useState<HorarioOcupado[]>([]);
  const [bloqueados, setBloqueados] = useState<HorarioBloqueado[]>([]);
  const [meusAgendamentos, setMeusAgendamentos] = useState<Agendamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [agendando, setAgendando] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const carregarMes = useCallback(
    async (mesRef: Date, clienteId: string) => {
      setCarregando(true);
      const inicio = paraDataISO(new Date(mesRef.getFullYear(), mesRef.getMonth(), 1));
      const fim = paraDataISO(new Date(mesRef.getFullYear(), mesRef.getMonth() + 1, 0));

      const [{ data: ocup }, { data: bloq }, { data: meus }] = await Promise.all([
        supabase.from("horarios_ocupados").select("*").gte("data", inicio).lte("data", fim),
        supabase.from("horarios_bloqueados").select("*").gte("data", inicio).lte("data", fim),
        supabase.from("agendamentos").select("*").eq("cliente_id", clienteId).gte("data", paraDataISO(new Date())),
      ]);

      setOcupados((ocup as HorarioOcupado[]) ?? []);
      setBloqueados((bloq as HorarioBloqueado[]) ?? []);
      setMeusAgendamentos(((meus as Agendamento[]) ?? []).sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora)));
      setCarregando(false);
    },
    [],
  );

  useEffect(() => {
    if (sessao.carregando) return;
    if (!sessao.logado) { router.replace("/portal/login"); return; }
    if (sessao.tipo === "equipe") { router.replace("/portal/equipe"); return; }
    if (sessao.tipo === "cliente") carregarMes(mes, sessao.cliente.id);
  }, [sessao, mes, carregarMes, router]);

  const marcadores = useMemo(() => {
    const mapa: Record<string, MarcadorDia> = {};
    const totalDias = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();
    for (let dia = 1; dia <= totalDias; dia++) {
      const data = new Date(mes.getFullYear(), mes.getMonth(), dia);
      const dataISO = paraDataISO(data);
      const todos = gerarHorariosDoDia(data);
      if (todos.length === 0) {
        mapa[dataISO] = "fechado";
        continue;
      }
      const ocupadosNoDia = new Set([
        ...ocupados.filter((o) => o.data === dataISO).map((o) => o.hora.slice(0, 5)),
        ...bloqueados.filter((b) => b.data === dataISO).map((b) => b.hora.slice(0, 5)),
      ]);
      mapa[dataISO] = todos.some((h) => !ocupadosNoDia.has(h)) ? "livre" : "lotado";
    }
    return mapa;
  }, [mes, ocupados, bloqueados]);

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
  const podeAgendar = estadoDoPlano(cliente) === "ativo";

  const ocupadosDoDia = diaSelecionado
    ? new Set([
        ...ocupados.filter((o) => o.data === diaSelecionado).map((o) => o.hora.slice(0, 5)),
        ...bloqueados.filter((b) => b.data === diaSelecionado).map((b) => b.hora.slice(0, 5)),
      ])
    : new Set<string>();
  const horariosLivres = diaSelecionado
    ? gerarHorariosDoDia(new Date(`${diaSelecionado}T00:00:00`)).filter((h) => !ocupadosDoDia.has(h))
    : [];

  async function agendar(hora: string) {
    if (!diaSelecionado) return;
    setErro(null);
    setAgendando(hora);
    const { error } = await supabase
      .from("agendamentos")
      .insert({ cliente_id: cliente.id, data: diaSelecionado, hora });
    setAgendando(null);

    if (error) {
      setErro(error.code === "23505" ? "Esse horário acabou de ser ocupado — escolha outro." : "Não foi possível agendar.");
      return;
    }
    carregarMes(mes, cliente.id);
  }

  async function desmarcar(id: string) {
    const seguir = window.confirm("Desmarcar esse agendamento?");
    if (!seguir) return;
    await supabase.from("agendamentos").delete().eq("id", id);
    carregarMes(mes, cliente.id);
  }

  return (
    <>
      <PortalCabecalho mostrarSair />
      <main className="mx-auto max-w-4xl px-6 py-16">
        <Link
          href="/portal/cliente"
          className="mb-6 flex w-fit items-center gap-2 font-mono text-legenda uppercase tracking-[0.1em] text-prata transition-colors hover:text-offwhite"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          Meu plano
        </Link>

        <p className="rotulo mb-2">Plano de lavagem</p>
        <h1 className="mb-8 font-display text-h2 font-semibold uppercase leading-none tracking-[0.02em]">Agendar</h1>

        {!podeAgendar ? (
          <Card className="p-6">
            <p className="text-corpo text-prata">Seu plano precisa estar ativo pra agendar um horário.</p>
          </Card>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            <Card className="p-6">
              {carregando ? (
                <div className="flex h-64 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-prata" />
                </div>
              ) : (
                <CalendarioMes
                  mes={mes}
                  onMudarMes={(delta) => setMes((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1))}
                  marcadores={marcadores}
                  selecionado={diaSelecionado}
                  onSelecionarDia={setDiaSelecionado}
                />
              )}
            </Card>

            <Card className="p-6">
              {!diaSelecionado ? (
                <p className="text-corpo text-prata">Selecione um dia livre no calendário.</p>
              ) : horariosLivres.length === 0 ? (
                <p className="text-corpo text-prata">Sem horários livres nesse dia.</p>
              ) : (
                <>
                  <p className="mb-4 font-display text-lg font-semibold uppercase tracking-[0.02em] text-offwhite">
                    {formatarDataExibicao(diaSelecionado)}
                  </p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {horariosLivres.map((hora) => (
                      <button
                        key={hora}
                        type="button"
                        disabled={agendando === hora}
                        onClick={() => agendar(hora)}
                        className="rounded-lg border border-ambar/40 py-3 text-center font-mono text-legenda text-ambar transition-colors hover:bg-ambar/10 disabled:opacity-50"
                      >
                        {agendando === hora ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : hora}
                      </button>
                    ))}
                  </div>
                  {erro && (
                    <p className="mt-3 font-mono text-legenda text-ambar" role="alert">
                      {erro}
                    </p>
                  )}
                </>
              )}
            </Card>
          </div>
        )}

        <div className="mt-10">
          <p className="rotulo mb-4">Meus agendamentos</p>
          {meusAgendamentos.length === 0 ? (
            <p className="text-corpo text-prata">Nenhum horário marcado.</p>
          ) : (
            <ul className="grid gap-2">
              {meusAgendamentos.map((a) => (
                <li key={a.id}>
                  <Card className="flex items-center justify-between p-4">
                    <p className="font-mono text-legenda uppercase tracking-[0.1em] text-offwhite">
                      {formatarDataExibicao(a.data)} · {formatarHora(a.hora)}
                    </p>
                    <button
                      type="button"
                      onClick={() => desmarcar(a.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-borda text-prata transition-colors hover:border-borda-forte hover:text-offwhite"
                      aria-label="Desmarcar"
                    >
                      <X className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}
