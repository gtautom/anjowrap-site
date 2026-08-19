/**
 * Plano de lavagem semanal — oferta própria, separada dos níveis I/II/III
 * do catálogo (não é uma variação deles, mesmo que o valor bata com algum
 * preço da tabela). Confirmado pela Jade em 19/08/2026.
 *
 * Pagamento por link avulso do Asaas (não é assinatura recorrente): o
 * cliente paga um mês por vez e clica em "Renovar" quando quiser continuar.
 * Sem cadastro de cartão, sem cobrança automática.
 */
export const PLANO = {
  nome: "Plano de lavagem semanal",
  valorMensal: 400,
  duracao: "Um mês",
  frequencia: "Uma lavagem por semana",
  /** Presencial — não é o mesmo alcance nacional dos demais serviços. */
  praca: "Belém",
} as const;

/**
 * Link de pagamento avulso do Asaas — reaproveitado ou renovado manualmente
 * pela Jade a cada ciclo, ligado ao botão "Renovar" do site. Enquanto não
 * configurado, o botão cai no WhatsApp. NEXT_PUBLIC_ porque é só um link de
 * pagamento (não uma chave), precisa estar disponível no browser.
 */
export function linkRenovarPlano(): string | null {
  return process.env.NEXT_PUBLIC_ASAAS_LINK_PLANO || null;
}
