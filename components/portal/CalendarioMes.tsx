"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { paraDataISO } from "@/lib/agendamento";

const DIAS_SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"];
const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export type MarcadorDia = "livre" | "lotado" | "fechado";

type CalendarioMesProps = {
  mes: Date;
  onMudarMes: (delta: number) => void;
  marcadores?: Record<string, MarcadorDia>;
  selecionado?: string | null;
  onSelecionarDia: (dataISO: string) => void;
};

const CLASSE_MARCADOR: Record<MarcadorDia, string> = {
  livre: "border-ambar/40 text-ambar hover:border-ambar",
  lotado: "border-borda text-prata hover:border-borda-forte",
  fechado: "border-transparent text-terciario",
};

/**
 * Grid de mês genérico — reaproveitado pela agenda do cliente (marca livre/
 * lotado) e da equipe (marca ocupação). Sem lib externa: o projeto não tem
 * date-picker e a regra é não adicionar dependência sem perguntar antes.
 */
export function CalendarioMes({ mes, onMudarMes, marcadores = {}, selecionado, onSelecionarDia }: CalendarioMesProps) {
  const ano = mes.getFullYear();
  const mesIndice = mes.getMonth();
  const primeiroDia = new Date(ano, mesIndice, 1);
  const totalDias = new Date(ano, mesIndice + 1, 0).getDate();
  const offset = primeiroDia.getDay();
  const hojeISO = paraDataISO(new Date());

  const celulas: (string | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: totalDias }, (_, i) => paraDataISO(new Date(ano, mesIndice, i + 1))),
  ];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onMudarMes(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-borda text-prata transition-colors hover:border-borda-forte hover:text-offwhite"
          aria-label="Mês anterior"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
        </button>
        <p className="font-display text-lg font-semibold uppercase tracking-[0.08em] text-offwhite">
          {MESES[mesIndice]} {ano}
        </p>
        <button
          type="button"
          onClick={() => onMudarMes(1)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-borda text-prata transition-colors hover:border-borda-forte hover:text-offwhite"
          aria-label="Próximo mês"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {DIAS_SEMANA.map((d, i) => (
          <div key={i} className="pb-1 text-center font-mono text-rotulo uppercase tracking-[0.1em] text-terciario">
            {d}
          </div>
        ))}

        {celulas.map((dataISO, i) => {
          if (!dataISO) return <div key={`vazio-${i}`} />;

          const passado = dataISO < hojeISO;
          const marcador = marcadores[dataISO];
          const clickavel = !passado && marcador !== undefined && marcador !== "fechado";

          return (
            <button
              key={dataISO}
              type="button"
              disabled={!clickavel}
              onClick={() => onSelecionarDia(dataISO)}
              className={`aspect-square rounded-lg border font-mono text-legenda transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
                selecionado === dataISO
                  ? "border-ambar bg-ambar/10 text-ambar"
                  : passado
                    ? "border-transparent text-terciario"
                    : marcador
                      ? CLASSE_MARCADOR[marcador]
                      : "border-transparent text-terciario"
              }`}
            >
              {Number(dataISO.slice(-2))}
            </button>
          );
        })}
      </div>
    </div>
  );
}
