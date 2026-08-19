"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Loader2, Lock, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { CalendarioMes, type MarcadorDia } from "@/components/portal/CalendarioMes";
import { supabase } from "@/lib/supabase/client";
import { useSessaoPortal } from "@/lib/supabase/useSessaoPortal";
import { gerarHorariosDoDia, formatarHora, paraDataISO } from "@/lib/agendamento";
import type { Agendamento, HorarioBloqueado, ClientePlano } from "@/lib/supabase/tipos";

function formatarDataExibicao(iso: string): string {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

export default function AgendaEquipe() {
  const sessao = useSessaoPortal();
  const [mes, setMes] = useState(() => new Date());
  const [diaSelecionado, setDiaSelecionado] = useState<string | null>(null);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [bloqueados, setBloqueados] = useState<HorarioBloqueado[]>([]);
  const [clientesPorId, setClientesPorId] = useState<Record<string, ClientePlano>>({});
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState<string | null>(null);
  const [modoEdicao, setModoEdicao] = useState(false);

  const carregarMes = useCallback(async (mesRef: Date) => {
    setCarregando(true);
    const inicio = paraDataISO(new Date(mesRef.getFullYear(), mesRef.getMonth(), 1));
    const fim = paraDataISO(new Date(mesRef.getFullYear(), mesRef.getMonth() + 1, 0));

    const [{ data: ag }, { data: bloq }, { data: clientes }] = await Promise.all([
      supabase.from("agendamentos").select("*").gte("data", inicio).lte("data", fim),
      supabase.from("horarios_bloqueados").select("*").gte("data", inicio).lte("data", fim),
      supabase.from("clientes_plano").select("*"),
    ]);

    setAgendamentos((ag as Agendamento[]) ?? []);
    setBloqueados((bloq as HorarioBloqueado[]) ?? []);
    const mapa: Record<string, ClientePlano> = {};
    ((clientes as ClientePlano[]) ?? []).forEach((c) => (mapa[c.id] = c));
    setClientesPorId(mapa);
    setCarregando(false);
  }, []);

  useEffect(() => {
    if (sessao.carregando || !sessao.logado || sessao.tipo !== "equipe") return;
    carregarMes(mes);
  }, [sessao, mes, carregarMes]);

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
      const ocupadosNoDia = agendamentos.filter((a) => a.data === dataISO).length;
      const bloqueadosNoDia = bloqueados.filter((b) => b.data === dataISO).length;
      mapa[dataISO] = ocupadosNoDia + bloqueadosNoDia >= todos.length ? "lotado" : "livre";
    }
    return mapa;
  }, [mes, agendamentos, bloqueados]);

  if (sessao.carregando || !sessao.logado || sessao.tipo !== "equipe") {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-prata" />
      </main>
    );
  }

  const { equipe } = sessao;
  const ehAdmin = equipe.papel === "admin";

  async function bloquear(dataISO: string, hora: string) {
    setProcessando(`${dataISO}-${hora}`);
    await supabase.from("horarios_bloqueados").insert({ data: dataISO, hora, criado_por: equipe.id });
    await carregarMes(mes);
    setProcessando(null);
  }

  async function desbloquear(id: string) {
    setProcessando(id);
    await supabase.from("horarios_bloqueados").delete().eq("id", id);
    await carregarMes(mes);
    setProcessando(null);
  }

  async function cancelarAgendamento(id: string, nomeCliente: string) {
    const seguir = window.confirm(`Cancelar o agendamento de ${nomeCliente}?`);
    if (!seguir) return;
    setProcessando(id);
    await supabase.from("agendamentos").delete().eq("id", id);
    await carregarMes(mes);
    setProcessando(null);
  }

  async function bloquearDiaInteiro(dataISO: string) {
    const data = new Date(`${dataISO}T00:00:00`);
    const todos = gerarHorariosDoDia(data);
    const ocupados = new Set(agendamentos.filter((a) => a.data === dataISO).map((a) => a.hora.slice(0, 5)));
    const jaBloqueados = new Set(bloqueados.filter((b) => b.data === dataISO).map((b) => b.hora.slice(0, 5)));
    const livres = todos.filter((h) => !ocupados.has(h) && !jaBloqueados.has(h));
    if (livres.length === 0) return;

    setProcessando(dataISO);
    await supabase
      .from("horarios_bloqueados")
      .insert(livres.map((hora) => ({ data: dataISO, hora, criado_por: equipe.id })));
    await carregarMes(mes);
    setProcessando(null);
  }

  const horariosDoDia = diaSelecionado ? gerarHorariosDoDia(new Date(`${diaSelecionado}T00:00:00`)) : [];
  const agendamentosDoDia = diaSelecionado ? agendamentos.filter((a) => a.data === diaSelecionado) : [];
  const bloqueadosDoDia = diaSelecionado ? bloqueados.filter((b) => b.data === diaSelecionado) : [];

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <p className="rotulo mb-2">Equipe</p>
      <h1 className="mb-8 font-display text-h2 font-semibold uppercase leading-none tracking-[0.02em]">Agenda</h1>

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
            <p className="text-corpo text-prata">Selecione um dia no calendário pra ver os horários.</p>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="font-display text-lg font-semibold uppercase tracking-[0.02em] text-offwhite">
                  {formatarDataExibicao(diaSelecionado)}
                </p>
                {ehAdmin && (
                  <div className="flex gap-2">
                    {modoEdicao && (
                      <Button size="sm" variant="outline" onClick={() => bloquearDiaInteiro(diaSelecionado)}>
                        <Lock className="mr-2 h-4 w-4" strokeWidth={1.75} />
                        Bloquear o dia
                      </Button>
                    )}
                    <Button size="sm" variant={modoEdicao ? "default" : "outline"} onClick={() => setModoEdicao((v) => !v)}>
                      <Pencil className="mr-2 h-4 w-4" strokeWidth={1.75} />
                      {modoEdicao ? "Concluir edição" : "Editar horários"}
                    </Button>
                  </div>
                )}
              </div>

              {horariosDoDia.length === 0 ? (
                <p className="text-corpo text-prata">Sem expediente nesse dia.</p>
              ) : (
                <ul className="grid gap-2">
                  {horariosDoDia.map((hora) => {
                    const agendamento = agendamentosDoDia.find((a) => a.hora.slice(0, 5) === hora);
                    const bloqueio = bloqueadosDoDia.find((b) => b.hora.slice(0, 5) === hora);
                    const cliente = agendamento ? clientesPorId[agendamento.cliente_id] : null;
                    const chave = `${diaSelecionado}-${hora}`;
                    const editavel = ehAdmin && modoEdicao && !agendamento;

                    return (
                      <li
                        key={hora}
                        className="flex items-center justify-between rounded-lg border border-borda px-4 py-3"
                      >
                        <div>
                          <p className="font-mono text-legenda uppercase tracking-[0.1em] text-offwhite">
                            {formatarHora(hora)}
                          </p>
                          {cliente && <p className="text-legenda text-prata">{cliente.nome}</p>}
                          {bloqueio && !editavel && (
                            <p className="text-legenda text-prata">Bloqueado{bloqueio.motivo ? ` — ${bloqueio.motivo}` : ""}</p>
                          )}
                          {!bloqueio && !cliente && !editavel && <p className="text-legenda text-prata">Livre</p>}
                        </div>

                        {agendamento && cliente ? (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={processando === agendamento.id}
                            onClick={() => cancelarAgendamento(agendamento.id, cliente.nome)}
                          >
                            <X className="h-4 w-4" strokeWidth={1.75} />
                          </Button>
                        ) : editavel ? (
                          <ToggleSwitch
                            checked={!bloqueio}
                            disabled={processando === chave || processando === bloqueio?.id}
                            onChange={(ativo) => (ativo ? bloqueio && desbloquear(bloqueio.id) : bloquear(diaSelecionado, hora))}
                          />
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          )}
        </Card>
      </div>
    </main>
  );
}
