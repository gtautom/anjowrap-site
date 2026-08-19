import { HORARIO } from "@/lib/servicos";

/**
 * Duração de cada horário de lavagem. Não foi informado o tempo real de um
 * ciclo — fica isolado aqui, num lugar só, fácil de ajustar depois.
 */
export const DURACAO_MINUTOS = 60;

function paraMinutos(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function paraHHMM(minutos: number): string {
  const h = Math.floor(minutos / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutos % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

/** "2026-08-24" (local, sem fuso) — mesma convenção usada nas colunas `date` do banco. */
export function paraDataISO(data: Date): string {
  const ano = data.getFullYear();
  const mes = (data.getMonth() + 1).toString().padStart(2, "0");
  const dia = data.getDate().toString().padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

/**
 * Todos os horários possíveis do dia (sem considerar o que já está
 * bloqueado ou ocupado) — deriva de HORARIO.blocos, a mesma fonte de
 * verdade usada no rodapé e no JSON-LD. Dia sem bloco cadastrado (ex.:
 * domingo) devolve lista vazia.
 */
export function gerarHorariosDoDia(data: Date): string[] {
  const diaSemana = data.toLocaleDateString("en-US", { weekday: "long" });
  const bloco = HORARIO.blocos.find((b) => (b.dias as readonly string[]).includes(diaSemana));
  if (!bloco) return [];

  const inicio = paraMinutos(bloco.abre);
  const fim = paraMinutos(bloco.fecha);
  const horarios: string[] = [];
  for (let m = inicio; m + DURACAO_MINUTOS <= fim; m += DURACAO_MINUTOS) {
    horarios.push(paraHHMM(m));
  }
  return horarios;
}

/** "08:00" (banco, com segundos) → "08:00" (exibição). Tolerante a ambos os formatos. */
export function formatarHora(hora: string): string {
  return hora.slice(0, 5);
}
