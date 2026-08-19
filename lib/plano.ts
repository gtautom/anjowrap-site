import { CATALOGO } from "@/lib/catalogo";

/**
 * Plano de lavagem semanal — assinatura recorrente cobrada via Asaas.
 *
 * Nível assumido por instrução do cliente em 18/08/2026: Limpeza nível II —
 * confirmar com a Anjo antes de publicar em produção. A conta fecha: R$ 400
 * ÷ 4 semanas = R$ 100/lavagem, exatamente o preço da Limpeza nível II Hatch
 * em lib/catalogo.ts. `inclui` é derivado do próprio item do catálogo pra
 * nunca divergir da tabela de preços.
 */
const NIVEL_ID = "limpeza-nivel-2";
const nivel = CATALOGO.find((item) => item.id === NIVEL_ID);
if (!nivel) throw new Error(`lib/plano.ts: item "${NIVEL_ID}" não existe em lib/catalogo.ts`);

export const PLANO = {
  nome: "Plano de lavagem semanal",
  nivel: nivel.nome,
  valorMensal: 400,
  frequencia: "Uma lavagem por semana",
  /** Presencial — não é o mesmo alcance nacional dos demais serviços. */
  praca: "Belém",
  inclui: nivel.inclui.flatMap((bloco) => bloco.itens),
} as const;

/**
 * Liga o formulário de assinatura em /servicos. Desligada (padrão), o bloco
 * do plano cai no CTA de WhatsApp em vez de renderizar um formulário que
 * chamaria uma rota sem ASAAS_API_KEY configurada. Ligar só depois que a
 * chave de produção estiver no painel do Netlify.
 */
export function planoAtivo(): boolean {
  return process.env.NEXT_PUBLIC_PLANO_ATIVO === "1";
}
