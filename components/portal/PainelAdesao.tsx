import { Card } from "@/components/ui/card";
import { PLANO } from "@/lib/plano";
import { estadoDoPlano, type ClientePlano } from "@/lib/supabase/tipos";

export type FiltroAdesao = "todos" | "ativos" | "aguardando" | "pendentes";

function formatarReal(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

/**
 * Estatísticas calculadas em cima da lista de clientes já carregada em
 * /portal/equipe — sem query nova. Clicar num card define o filtro da
 * lista abaixo (estado vive no componente pai).
 */
export function PainelAdesao({
  clientes,
  filtro,
  onFiltrar,
}: {
  clientes: ClientePlano[];
  filtro: FiltroAdesao;
  onFiltrar: (filtro: FiltroAdesao) => void;
}) {
  const ativos = clientes.filter((c) => c.status === "contratado" && estadoDoPlano(c) === "ativo");
  const aguardando = clientes.filter((c) => c.status === "contratado" && estadoDoPlano(c) === "expirado");
  const pendentes = clientes.filter((c) => c.status === "pendente");
  const receitaMensalEstimada = ativos.length * PLANO.valorMensal;

  const cards: { chave: FiltroAdesao; rotulo: string; valor: string }[] = [
    { chave: "todos", rotulo: "Total de clientes", valor: String(clientes.length) },
    { chave: "ativos", rotulo: "Plano ativo", valor: String(ativos.length) },
    { chave: "aguardando", rotulo: "Aguardando renovação", valor: String(aguardando.length) },
    { chave: "pendentes", rotulo: "Pendentes", valor: String(pendentes.length) },
  ];

  return (
    <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => (
        <button key={card.chave} type="button" onClick={() => onFiltrar(card.chave)} className="text-left">
          <Card
            className={`h-full p-5 transition-colors ${
              filtro === card.chave ? "border-ambar/50 bg-ambar/5" : "hover:border-borda-forte"
            }`}
          >
            <p className="font-mono text-rotulo uppercase tracking-[0.14em] text-prata">{card.rotulo}</p>
            <p className="mt-2 font-display text-h2 font-semibold leading-none text-offwhite">{card.valor}</p>
          </Card>
        </button>
      ))}
      <Card className="h-full p-5">
        <p className="font-mono text-rotulo uppercase tracking-[0.14em] text-prata">Receita mensal estimada</p>
        <p className="mt-2 font-display text-h2 font-semibold leading-none text-ambar">
          {formatarReal(receitaMensalEstimada)}
        </p>
      </Card>
    </div>
  );
}
