import type { CategoriaCatalogo } from "@/lib/catalogo";

export type Servico = {
  id: string;
  nome: string;
  /** Uma linha. Regra 01 do kit: o serviço vira consequência pro dono do carro. */
  descricao: string;
  /** Card de largura dupla. Só o PPF. */
  destaque?: boolean;
  /**
   * Imagem exibida na aba do serviço.
   * TODO: hoje aponta pro placeholder da galeria. Trocar por foto do serviço
   * real quando o material chegar — basta editar o caminho.
   */
  imagem: string;
  /** Alt descritivo da imagem acima. Exigência de SEO. */
  imagemAlt: string;
  /**
   * Categoria correspondente em lib/catalogo.ts, quando existir — alimenta o
   * CTA "Ver na tabela de preços" da aba. Envelopamento, teto black piano e
   * martelinho de ouro não têm item precificado no catálogo, por isso ficam
   * sem esse campo.
   */
  categoriaCatalogo?: CategoriaCatalogo;
};

export const SERVICOS: Servico[] = [
  {
    id: "ppf",
    nome: "PPF",
    descricao:
      "A película absorve pedrisco, arranhão de lavagem e marca de inseto sem alterar a cor do carro.",
    imagem: "/trabalhos/ppf/ppf-02.jpg",
    imagemAlt: "Porsche Cayenne com pelicula de protecao de pintura PPF aplicada pela ANJOWRAP",
    destaque: true,
    categoriaCatalogo: "Proteção",
  },
  {
    id: "envelopamento",
    nome: "Envelopamento",
    descricao:
      "Troca a cor do carro sem tocar na pintura de fábrica — e volta atrás quando você quiser.",
    imagem: "/trabalhos/envelopamento/envelopamento-03.jpg",
    imagemAlt: "Ford Ranger envelopada em verde militar pela ANJOWRAP",
  },
  {
    id: "polimento",
    nome: "Polimento",
    descricao:
      "Corrige risco e marca de holograma no verniz, devolvendo a profundidade que a pintura tinha.",
    imagem: "/trabalhos/polimento/polimento-03.jpg",
    imagemAlt: "Chevrolet Camaro apos polimento e revestimento ceramico na ANJOWRAP",
    categoriaCatalogo: "Polimento",
  },
  {
    id: "vitrificacao",
    nome: "Vitrificação",
    descricao:
      "Sela o verniz corrigido: a sujeira sai com um passe de água e a lavagem para de desgastar.",
    imagem: "/trabalhos/polimento/polimento-02.jpg",
    imagemAlt: "Mercedes-Benz CLA apos vitrificação na ANJOWRAP",
    categoriaCatalogo: "Proteção",
  },
  {
    id: "teto-black-piano",
    nome: "Teto black piano",
    descricao:
      "O teto ganha acabamento espelhado contínuo, sem emenda aparente com a coluna.",
    imagem: "/trabalhos/teto-black-piano/teto-01.jpg",
    imagemAlt: "Toyota Corolla Cross com kit teto em black piano aplicado pela ANJOWRAP",
  },
  {
    id: "martelinho-de-ouro",
    nome: "Martelinho de ouro",
    descricao:
      "Remove amassado sem massa e sem repintura — a pintura original do carro continua ali.",
    imagem: "/trabalhos/martelinho/martelinho-01.jpg",
    imagemAlt: "Tecnico da ANJOWRAP removendo amassado com martelinho de ouro na porta de um seda",
  },
  {
    id: "lavagem",
    nome: "Lavagem",
    descricao:
      "Sujeira do dia a dia sai sem desgastar a proteção que já está no carro.",
    imagem: "/catalogo/lavagem/limpeza-nivel-2.jpg",
    imagemAlt: "Traseira de Porsche coberta de espuma na lavagem nível II",
    categoriaCatalogo: "Lavagem",
  },
  {
    id: "higienizacao",
    nome: "Higienização",
    descricao:
      "Remove odor, mancha e resíduo de estofado e forro — sem trocar o cheiro do carro pelo de produto.",
    imagem: "/catalogo/higienizacao/higienizacao-interna.jpg",
    imagemAlt: "Interior de carro em processo de higienização",
    categoriaCatalogo: "Higienização",
  },
  {
    id: "insulfilm",
    nome: "Insulfilm",
    descricao:
      "Bloqueia calor e reduz visibilidade do interior, dentro do limite que a lei permite.",
    imagem: "/catalogo/pelicula/insulfilm-ceramico.jpg",
    imagemAlt: "Vidro traseiro com insulfilm cerâmico aplicado",
    categoriaCatalogo: "Película",
  },
];

/** Alimenta o select do formulário de orçamento. */
export const NOMES_SERVICOS = SERVICOS.map((s) => s.nome);

/**
 * Faixa da Credencial. Indicadores numéricos, editáveis.
 * O prefixo pode ser qualquer símbolo — a animação de contagem lê só os dígitos.
 */
export const INDICADORES: { valor: string; rotulo: string }[] = [
  { valor: "+200", rotulo: "carros protegidos" }, // confirmado pela Jade em 19/08/2026
  { valor: "12", rotulo: "anos de oficina" },
];

/** Credencial principal — verificada no brandkit. */
export const CREDENCIAL = {
  posicao: "6º lugar",
  evento: "Campeonato Sul-Americano de Envelopamento Automotivo",
};

/** Endereço físico da oficina. Alimenta o PostalAddress do JSON-LD. */
export const PRACA = { cidade: "Belém", estado: "PA", pais: "BR" } as const;

/**
 * Horário de funcionamento — confirmado pela Jade em 19/08/2026 (sábado
 * chegou depois, num segundo print — 08h30, não 08h, diferente do que a
 * gente tinha suposto antes de confirmar).
 * Fonte única: alimenta o rodapé (visível pro visitante) e o
 * openingHoursSpecification do JSON-LD, um bloco por linha.
 */
export const HORARIO = {
  rotulo: "Segunda a sexta, 08h às 18h · Sábado, 08h30 às 12h",
  blocos: [
    {
      dias: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      abre: "08:00",
      fecha: "18:00",
    },
    {
      dias: ["Saturday"],
      abre: "08:30",
      fecha: "12:00",
    },
  ],
} as const;

/**
 * O que a marca atende e onde. Dois registros porque a realidade é dupla:
 * aplicação viaja o Brasil todo, lavagem não sai de Belém.
 */
export const ATENDIMENTO = [
  { rotulo: "Todo o Brasil", detalhe: "PPF, envelopamento e aplicações" },
  { rotulo: "Belém — PA", detalhe: "oficina, lavagem e plano" },
] as const;

/** Praça do plano de lavagem — presencial, semanal. */
export const CIDADES_PRESENCIAL = ["Belém", "Ananindeua", "Castanhal"] as const;
