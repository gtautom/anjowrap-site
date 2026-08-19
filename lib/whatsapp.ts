export type DadosOrcamento = {
  nome: string;
  whatsapp: string;
  modelo: string;
  ano: string;
  servico: string;
  observacoes: string;
};

export type PedidoAgendamento = {
  /** Nome do serviço exatamente como está no catálogo. */
  servico: string;
  /** Porte escolhido no seletor da página. */
  porte: string;
  /** Preço já formatado — "R$ 1.200", "a partir de R$ 10.000". */
  preco: string;
};

const NUMERO = process.env.NEXT_PUBLIC_WHATSAPP ?? "";

function montarLink(linhas: (string | null | false)[]): string {
  const destino = NUMERO.replace(/\D/g, "");
  const mensagem = linhas.filter(Boolean).join("\n");
  return `https://wa.me/${destino}?text=${encodeURIComponent(mensagem)}`;
}

export function montarLinkWhatsApp(dados: DadosOrcamento): string {
  return montarLink([
    "Olá, tudo bem?",
    "Pedido de orçamento pelo site.",
    `Nome: ${dados.nome}`,
    `Carro: ${dados.modelo} ${dados.ano}`,
    `Serviço: ${dados.servico}`,
    `Observações: ${dados.observacoes}`,
  ]);
}

/** Link direto, sem dados de formulario — botao flutuante e rodape. */
export function linkWhatsAppDireto(): string {
  return montarLink(["Olá, tudo bem? Vim pelo site e queria um orçamento."]);
}

/**
 * Agendamento disparado por um card do catálogo. Leva o preço já formatado
 * de propósito: a Anjo vê exatamente o que o cliente leu, então tabela
 * desatualizada nunca vira discussão de preço no WhatsApp.
 */
export function linkAgendamento(pedido: PedidoAgendamento): string {
  return montarLink([
    "Olá, tudo bem?",
    "Vim pela tabela de serviços do site.",
    `Serviço: ${pedido.servico}`,
    `Porte do veículo: ${pedido.porte}`,
    `Valor na tabela: ${pedido.preco}`,
    "Queria agendar.",
  ]);
}

/** Plano de lavagem — usado enquanto o link de pagamento do Asaas não está configurado. */
export function linkPlanoLavagem(): string {
  return montarLink([
    "Olá, tudo bem?",
    "Vim pelo site.",
    "Queria contratar o plano de lavagem semanal.",
  ]);
}
