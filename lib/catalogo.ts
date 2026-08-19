/**
 * Catálogo transacional — a tabela de preços do PDF do cliente
 * (`identidade/Catalago Estética ANJOWRAP (1).pdf`, capturado em 18/08/2026).
 *
 * Separado de lib/servicos.ts de propósito: aquele é narrativo (6 serviços,
 * copy de consequência, alimenta as abas da home). Este é a tabela: preço por
 * porte e lista do que entra. Granularidades diferentes — "Polimento" lá vira
 * 4 itens aqui.
 *
 * Preços tendem a ficar desatualizados. Antes de confiar neles, confirmar
 * com a Anjo se a tabela do PDF ainda vale.
 */

/** Os 3 portes da tabela do cliente. A ordem é a ordem do PDF. */
export const PORTES = ["Hatch", "Sedan", "Pick-up / SUV"] as const;
export type Porte = (typeof PORTES)[number];

export const CATEGORIAS_CATALOGO = [
  "Lavagem",
  "Polimento",
  "Proteção",
  "Higienização",
  "Película",
] as const;
export type CategoriaCatalogo = (typeof CATEGORIAS_CATALOGO)[number];

/**
 * Três formas de preço no catálogo:
 *  porte   — valor por porte de veículo (12 dos 15 serviços)
 *  unico   — o porte não muda o valor (polimento de faróis)
 *  aPartirDe — piso; o fechado sai no orçamento (PPF e as duas películas)
 */
export type Preco =
  | { tipo: "porte"; valores: Record<Porte, number> }
  | { tipo: "unico"; valor: number }
  | { tipo: "aPartirDe"; valor: number };

/**
 * Bloco de itens inclusos. O título varia por serviço no PDF — lavagem usa
 * Externa/Interna/Proteção, polimento usa Limpeza/Processos/Proteção, o PPF
 * usa Limpeza/Processos/dois kits de proteção. Por isso é string livre, não
 * enum.
 */
export type BlocoInclusao = { titulo: string; itens: string[] };

export type ItemCatalogo = {
  id: string;
  categoria: CategoriaCatalogo;
  nome: string;
  /** Uma linha. Regra 01 do kit: o que muda pro dono do carro. Escrita por
   *  nós — o PDF lista tarefa de oficina, não consequência. */
  resumo: string;
  preco: Preco;
  inclui: BlocoInclusao[];
  /** Tonalidades — só as duas películas. */
  opcoes?: { titulo: string; valores: readonly string[] };
  imagem: string;
  imagemAlt: string;
  /** Dimensões reais do arquivo — o next/image precisa delas pra não causar CLS. */
  largura: number;
  altura: number;
};

function porPorte(hatch: number, sedan: number, pickup: number): Preco {
  return { tipo: "porte", valores: { Hatch: hatch, Sedan: sedan, "Pick-up / SUV": pickup } };
}

export const CATALOGO: ItemCatalogo[] = [
  {
    id: "limpeza-nivel-1",
    categoria: "Lavagem",
    nome: "Limpeza nível I",
    resumo: "Remove a poeira e o resíduo do dia a dia sem desgastar a cera aplicada.",
    preco: porPorte(90, 100, 120),
    inclui: [
      {
        titulo: "Externa",
        itens: [
          "Lavagem externa com snow foam",
          "Limpeza dos plásticos externos",
          "Limpeza das rodas (externa)",
          "Limpeza de vidros externos",
          "Limpeza da caixa de rodas",
        ],
      },
      {
        titulo: "Interna",
        itens: [
          "Aspiração e limpeza dos tapetes, carpetes e bancos",
          "Limpeza do painel, forros de portas e console",
          "Limpeza dos vidros internos",
          "Limpeza dos plásticos internos",
        ],
      },
      {
        titulo: "Proteção",
        itens: [
          "Cera em pasta — 2 semanas de proteção",
          "Revitalizador de plásticos externos",
          "Pretiador nos pneus",
        ],
      },
    ],
    imagem: "/catalogo/lavagem/limpeza-nivel-1.jpg",
    imagemAlt: "Lavagem externa com snow foam em carro escuro",
    largura: 736,
    altura: 920,
  },
  {
    id: "limpeza-nivel-2",
    categoria: "Lavagem",
    nome: "Limpeza nível II",
    resumo: "Renova a cera por um mês: a sujeira leve sai com menos atrito na lataria.",
    preco: porPorte(100, 140, 180),
    inclui: [
      {
        titulo: "Externa",
        itens: [
          "Revitalização dos plásticos externos",
          "Lavagem externa com snow foam",
          "Limpeza dos plásticos externos",
          "Limpeza dos emblemas e grades",
          "Limpeza das rodas",
          "Limpeza de vidros externos",
          "Limpeza da caixa de rodas",
        ],
      },
      {
        titulo: "Interna",
        itens: [
          "Aspiração e limpeza dos tapetes, carpetes e bancos",
          "Limpeza do painel, forros de portas e console",
          "Limpeza dos plásticos internos",
          "Limpeza dos vidros internos",
        ],
      },
      {
        titulo: "Proteção",
        itens: [
          "Revitalizador de plásticos externos",
          "Revitalizador de plásticos internos",
          "Cera em pasta — 1 mês de proteção",
          "Selante nos pneus",
        ],
      },
    ],
    imagem: "/catalogo/lavagem/limpeza-nivel-2.jpg",
    imagemAlt: "Traseira de Porsche coberta de espuma na lavagem nível II",
    largura: 736,
    altura: 1104,
  },
  {
    id: "limpeza-nivel-3",
    categoria: "Lavagem",
    nome: "Limpeza nível III",
    resumo: "Descontamina a pintura e renova a proteção por três meses, por dentro e por fora.",
    preco: porPorte(200, 250, 300),
    inclui: [
      {
        titulo: "Externa",
        itens: [
          "Descontaminação de pintura",
          "Revitalização dos plásticos externos",
          "Lavagem externa com snow foam",
          "Limpeza das canaletas de porta",
          "Limpeza dos plásticos externos",
          "Limpeza dos emblemas e grades",
          "Limpeza das rodas",
          "Limpeza de vidros externos",
          "Limpeza da caixa de rodas",
          "Limpeza da churrasqueira",
          "Limpeza dos pneus",
          "Limpeza do escape",
        ],
      },
      {
        titulo: "Interna",
        itens: [
          "Aspiração e limpeza dos tapetes, carpetes e bancos",
          "Limpeza do painel, forros de portas e console",
          "Limpeza do volante e chave de seta",
          "Limpeza dos plásticos internos",
          "Limpeza dos vidros internos",
          "Limpeza dos pedais",
        ],
      },
      {
        titulo: "Proteção",
        itens: [
          "Revitalizador de plásticos externos",
          "Revitalizador de plásticos internos",
          "Impermeabilizador dos espelhos",
          "Cera em pasta — 3 meses de proteção",
          "Impermeabilizador do parabrisa",
          "Impermeabilizador dos vidros",
          "Selante nos pneus",
          "Aplicação de verniz na caixa de rodas",
        ],
      },
    ],
    imagem: "/catalogo/lavagem/limpeza-nivel-3.jpg",
    imagemAlt: "Lavagem externa com snow foam em box escuro, limpeza nível III",
    largura: 736,
    altura: 541,
  },
  {
    id: "polimento-comercial",
    categoria: "Polimento",
    nome: "Polimento comercial",
    resumo: "Corrige a maior parte dos riscos superficiais e devolve profundidade ao brilho.",
    preco: porPorte(500, 600, 700),
    inclui: [
      { titulo: "Limpeza", itens: ["Limpeza nível II"] },
      {
        titulo: "Processos",
        itens: [
          "Descontaminação de pintura",
          "Isolamento de áreas sensíveis",
          "Correção e nivelamento do verniz",
          "Remoção de 70% dos riscos profundos",
          "Remoção de 90% dos riscos superficiais",
          "Regeneração de brilho intenso e gloss",
        ],
      },
      {
        titulo: "Proteção",
        itens: [
          "Revitalizador de plásticos externos",
          "Revitalizador de plásticos internos",
          "Cera em pasta — 6 meses de proteção",
          "Impermeabilizador do parabrisa",
          "Impermeabilizador dos vidros",
          "Selante nos pneus",
        ],
      },
    ],
    imagem: "/catalogo/polimento/polimento-comercial.jpg",
    imagemAlt: "Politriz em ação sobre lataria escura no polimento comercial",
    largura: 1200,
    altura: 1600,
  },
  {
    id: "polimento-tecnico",
    categoria: "Polimento",
    nome: "Polimento técnico",
    resumo: "Remove quase todo o risco, inclusive o profundo, com o verniz nivelado de fábrica.",
    preco: porPorte(800, 900, 1000),
    inclui: [
      { titulo: "Limpeza", itens: ["Limpeza nível III"] },
      {
        titulo: "Processos",
        itens: [
          "Descontaminação de pintura",
          "Isolamento de áreas sensíveis",
          "Correção e nivelamento do verniz",
          "Remoção de 99% dos riscos profundos",
          "Remoção de 99% dos riscos superficiais",
          "Regeneração de brilho intenso e gloss",
        ],
      },
      {
        titulo: "Proteção",
        itens: [
          "Revitalizador de plásticos externos",
          "Revitalizador de plásticos internos",
          "Cera em pasta — 1 ano de proteção",
          "Impermeabilizador do parabrisa",
          "Impermeabilizador dos vidros",
          "Selante nos pneus",
        ],
      },
    ],
    imagem: "/catalogo/polimento/polimento-tecnico.jpg",
    imagemAlt: "Técnico com politriz corrigindo o verniz no polimento técnico",
    largura: 1200,
    altura: 1600,
  },
  {
    id: "polimento-farois",
    categoria: "Polimento",
    nome: "Polimento dos faróis",
    resumo: "Devolve a transparência da lente e a luz volta a projetar como nova.",
    preco: { tipo: "unico", valor: 400 },
    inclui: [
      { titulo: "Limpeza", itens: ["Limpeza nível I"] },
      {
        titulo: "Processos",
        itens: [
          "Isolamento de áreas sensíveis",
          "Correção e nivelamento do farol",
          "Escala de lixa apropriada",
          "Remoção de 99% dos riscos profundos",
          "Remoção de 99% dos riscos superficiais",
          "Regeneração de brilho intenso e gloss",
          "Aplicação de polímero",
        ],
      },
      { titulo: "Proteção", itens: ["Garantia de 1 ano"] },
    ],
    imagem: "/catalogo/polimento/polimento-farois.jpg",
    imagemAlt: "Farol de carro esportivo após o polimento, lente transparente",
    largura: 474,
    altura: 640,
  },
  {
    id: "polimento-vidros",
    categoria: "Polimento",
    nome: "Polimento de vidros",
    resumo: "O risco do limpador some e a chuva escorre sem embaçar a visão.",
    preco: porPorte(400, 500, 600),
    inclui: [
      { titulo: "Limpeza", itens: ["Limpeza nível II"] },
      {
        titulo: "Processos",
        itens: [
          "Descontaminação dos vidros",
          "Isolamento de áreas sensíveis",
          "Correção e nivelamento do vidro",
          "Remoção de 90% dos riscos profundos",
          "Remoção de 99% dos riscos superficiais",
          "Regeneração de brilho intenso e gloss",
        ],
      },
      { titulo: "Proteção", itens: ["Impermeabilizante", "Hidrorrepelência ativa"] },
    ],
    imagem: "/catalogo/polimento/polimento-vidros.jpg",
    imagemAlt: "Coluna e vidro lateral de carro escuro após o polimento de vidros",
    largura: 736,
    altura: 1104,
  },
  {
    id: "vitrificacao-1-ano",
    categoria: "Proteção",
    nome: "Vitrificação 1 ano",
    resumo: "Sela o polimento por um ano: a sujeira sai só com água.",
    preco: porPorte(1200, 1400, 1600),
    inclui: [
      { titulo: "Limpeza", itens: ["Limpeza nível II"] },
      {
        titulo: "Processos",
        itens: [
          "Descontaminação de pintura",
          "Polimento comercial",
          "Revitalizador de plásticos externos",
          "Revitalizador de plásticos internos",
          "Vitrificador — 1 ano de proteção",
        ],
      },
      {
        titulo: "Proteção",
        itens: [
          "Impermeabilizador do parabrisa",
          "Impermeabilizador dos vidros",
          "Selante nos pneus",
        ],
      },
    ],
    imagem: "/catalogo/protecao/vitrificacao-1-ano.jpg",
    imagemAlt: "Para-choque traseiro de carro escuro após a vitrificação de 1 ano",
    largura: 736,
    altura: 915,
  },
  {
    id: "vitrificacao-3-anos",
    categoria: "Proteção",
    nome: "Vitrificação 3 anos",
    resumo: "Proteção de três anos sobre pintura corrigida a fundo — menos lavagem, mais brilho.",
    preco: porPorte(1500, 1800, 2200),
    inclui: [
      { titulo: "Limpeza", itens: ["Limpeza nível III"] },
      {
        titulo: "Processos",
        itens: [
          "Descontaminação de pintura",
          "Polimento técnico",
          "Revitalizador de plásticos externos",
          "Revitalizador de plásticos internos",
          "Impermeabilizador dos espelhos",
          "Vitrificador — 3 anos de proteção",
        ],
      },
      {
        titulo: "Proteção",
        itens: [
          "Impermeabilizador do parabrisa",
          "Impermeabilizador dos vidros",
          "Selante nos pneus",
          "Aplicação de verniz na caixa de rodas",
        ],
      },
    ],
    imagem: "/catalogo/protecao/vitrificacao-3-anos.jpg",
    imagemAlt: "Mão com luva aplicando produto na tampa de combustível durante a vitrificação",
    largura: 447,
    altura: 668,
  },
  {
    id: "vitrificacao-5-anos",
    categoria: "Proteção",
    nome: "Vitrificação 5 anos",
    resumo: "O maior prazo de proteção do catálogo, sobre pintura levada ao polimento técnico.",
    preco: porPorte(2400, 2600, 3000),
    inclui: [
      { titulo: "Limpeza", itens: ["Limpeza nível III"] },
      {
        titulo: "Processos",
        itens: [
          "Descontaminação de pintura",
          "Polimento técnico",
          "Revitalizador de plásticos externos",
          "Revitalizador de plásticos internos",
          "Impermeabilizador dos espelhos",
          "Vitrificador — 5 anos de proteção",
        ],
      },
      {
        titulo: "Proteção",
        itens: [
          "Impermeabilizador do parabrisa",
          "Impermeabilizador dos vidros",
          "Selante nos pneus",
        ],
      },
    ],
    imagem: "/catalogo/protecao/vitrificacao-5-anos.jpg",
    imagemAlt: "Pilar e vidro lateral de carro escuro após a vitrificação de 5 anos",
    largura: 736,
    altura: 1104,
  },
  {
    id: "ppf",
    categoria: "Proteção",
    nome: "Aplicação de PPF",
    resumo: "A película absorve pedrisco e arranhão de lavagem sem alterar a cor do carro.",
    preco: { tipo: "aPartirDe", valor: 10000 },
    inclui: [
      { titulo: "Limpeza", itens: ["Limpeza nível III"] },
      {
        titulo: "Processos",
        itens: [
          "Descontaminação de pintura",
          "Polimento técnico",
          "Revitalizador de plásticos externos",
          "Revitalizador de plásticos internos",
          "Impermeabilizador dos espelhos",
          "Impermeabilizador do parabrisa",
          "Impermeabilizador dos vidros",
          "Selante nos pneus",
        ],
      },
      // O PDF do cliente numera dois kits como "02" e "03", sem um "01" com
      // itens próprios — provável rótulo de aba reaproveitado no layout
      // original. Renumerados aqui como 1 e 2 pra não parecer erro de
      // digitação no site. Confirmar com a Anjo se a cobertura é essa mesma.
      {
        titulo: "Kit de proteção 1",
        itens: [
          "Concha de maçaneta",
          "Quina da porta",
          "Soleira",
          "Capô",
          "Para-choque dianteiro",
          "Paralamas dianteiros",
          "Faróis dianteiros",
          "Retrovisores",
        ],
      },
      {
        titulo: "Kit de proteção 2",
        itens: ["Multimídia (telas)", "Black piano (internos)", "Console", "PPF full"],
      },
    ],
    imagem: "/catalogo/protecao/ppf.jpg",
    imagemAlt: "Aplicação de película de proteção de pintura em carro escuro",
    largura: 675,
    altura: 1200,
  },
  {
    id: "higienizacao-interna",
    categoria: "Higienização",
    nome: "Higienização interna",
    resumo: "Remove odor e mancha do banco sem desmontar o interior.",
    preco: porPorte(400, 450, 500),
    inclui: [
      {
        titulo: "Externa",
        itens: [
          "Revitalização dos plásticos externos",
          "Lavagem externa com snow foam",
          "Limpeza das canaletas de porta",
          "Limpeza dos plásticos externos",
          "Limpeza dos emblemas e grades",
          "Limpeza das rodas",
          "Limpeza de vidros externos",
          "Limpeza da caixa de rodas",
          "Limpeza da churrasqueira",
          "Limpeza dos pneus",
          "Limpeza do escape",
        ],
      },
      {
        titulo: "Interna",
        itens: [
          "Aspiração e limpeza dos tapetes, carpetes e bancos",
          "Extração dos carpetes com antibactericida",
          "Extração dos bancos com antibactericida",
          "Limpeza do quebra-sol, colunas e console",
          "Remoção de manchas dos bancos",
          "Limpeza dos plásticos internos",
          "Remoção de odores internos",
          "Limpeza dos vidros internos",
          "Painel e forros de portas",
          "Limpeza das borrachas",
          "Limpeza do teto",
        ],
      },
      {
        titulo: "Proteção",
        itens: [
          "Revitalizador de plásticos externos",
          "Revitalizador de plásticos internos",
          "Impermeabilizador dos espelhos",
          "Cera em pasta — 3 meses de proteção",
          "Impermeabilizador do parabrisa",
          "Impermeabilizador dos vidros",
          "Selante nos pneus",
        ],
      },
    ],
    imagem: "/catalogo/higienizacao/higienizacao-interna.jpg",
    imagemAlt: "Interior de carro esportivo com fumaça de higienização",
    largura: 736,
    altura: 1104,
  },
  {
    id: "higienizacao-profunda",
    categoria: "Higienização",
    nome: "Higienização profunda",
    resumo: "Bancos e carpetes saem do carro para uma limpeza que a aspiração comum não alcança.",
    preco: porPorte(700, 1000, 1300),
    inclui: [
      {
        titulo: "Interna",
        itens: [
          "Aspiração e limpeza dos tapetes, carpetes e bancos",
          "Desmontagem e remoção completa do carpete",
          "Desmontagem e remoção completa dos bancos",
          "Extração dos carpetes com antibactericida",
          "Extração dos bancos com antibactericida",
          "Limpeza do quebra-sol, colunas e console",
          "Remoção de manchas dos bancos",
          "Limpeza dos plásticos internos",
          "Remoção de odores internos",
          "Limpeza dos vidros internos",
          "Painel e forros de portas",
          "Limpeza das borrachas",
          "Limpeza do teto",
          "Lavagem do motor",
        ],
      },
      {
        titulo: "Externa",
        itens: [
          "Revitalização dos plásticos externos",
          "Lavagem externa com snow foam",
          "Limpeza das canaletas de porta",
          "Limpeza dos plásticos externos",
          "Limpeza dos emblemas e grades",
          "Limpeza das rodas",
          "Limpeza de vidros externos",
          "Limpeza da caixa de rodas",
          "Limpeza da churrasqueira",
          "Limpeza dos pneus",
          "Limpeza do escape",
          "Descontaminação de pintura",
        ],
      },
      {
        titulo: "Proteção",
        itens: [
          "Revitalizador de plásticos externos",
          "Revitalizador de plásticos internos",
          "Impermeabilizador dos espelhos",
          "Cera — 6 meses de proteção",
          "Impermeabilizador do parabrisa",
          "Impermeabilizador dos vidros",
          "Selante nos pneus",
          "Aplicação de verniz na caixa de rodas",
        ],
      },
    ],
    imagem: "/catalogo/higienizacao/higienizacao-profunda.jpg",
    imagemAlt: "Interior de carro esportivo com volante multifuncional, higienização profunda",
    largura: 736,
    altura: 1237,
  },
  {
    id: "insulfilm-carbono",
    categoria: "Película",
    nome: "Insulfilm carbono",
    resumo: "Barra até 80% do calor solar sem escurecer a cabine além do permitido.",
    preco: { tipo: "aPartirDe", valor: 500 },
    inclui: [
      { titulo: "Limpeza", itens: ["Limpeza nível I"] },
      { titulo: "Processos", itens: ["Descontaminação de vidros", "Remoção de cola"] },
      {
        titulo: "Proteção",
        itens: [
          "70% de proteção contra raios UV e IV",
          "80% de proteção contra raios IR (calor)",
          "Protege contra descoloração",
          "Protege contra a deterioração",
          "5 anos de garantia",
        ],
      },
    ],
    opcoes: { titulo: "Tonalidade", valores: ["G50", "G35", "G20", "G5"] },
    imagem: "/catalogo/pelicula/insulfilm-carbono.jpg",
    imagemAlt: "Pilar e vidro lateral de carro escuro com insulfilm aplicado",
    largura: 1301,
    altura: 1600,
  },
  {
    id: "insulfilm-ceramico",
    categoria: "Película",
    nome: "Insulfilm cerâmico",
    resumo:
      "Dez vezes mais proteção contra raios UV do que a película comum, com garantia vitalícia contra desbotamento.",
    preco: { tipo: "aPartirDe", valor: 999 },
    inclui: [
      { titulo: "Limpeza", itens: ["Limpeza nível I"] },
      { titulo: "Processos", itens: ["Descontaminação de vidros", "Remoção de cola"] },
      {
        titulo: "Proteção",
        itens: [
          "10x mais proteção que a película comum",
          "Protege até 90% contra raios IV",
          "Protege mais de 99% contra raios UV",
          "Garantia vitalícia contra desbotamento",
          "Redução de temperatura sentida imediatamente",
        ],
      },
    ],
    opcoes: { titulo: "Tonalidade", valores: ["G50", "G35", "G20", "G5"] },
    imagem: "/catalogo/pelicula/insulfilm-ceramico.jpg",
    imagemAlt: "Pilar e vidro lateral de carro escuro com insulfilm cerâmico aplicado",
    largura: 1395,
    altura: 1600,
  },
];

/** Alimenta o select do formulário do plano — não usado pelo orçamento da home. */
export const NOMES_CATALOGO = CATALOGO.map((s) => s.nome);

/**
 * Formatação de preço à mão, sem `Intl`. O export estático renderiza no
 * Node do build e hidrata no browser; se o Node não tiver full-icu, pt-BR
 * sai "10,000" no servidor e "10.000" no cliente — mismatch de hidratação.
 * Os valores do catálogo são todos inteiros, então agrupar milhar resolve.
 */
export function formatarPreco(valor: number): string {
  return `R$ ${String(valor).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

/** Preço já resolvido pro porte ativo, pronto pra renderizar em pedaços. */
export type PrecoExibido = { prefixo?: string; valor: string; nota?: string };

export function precoNoPorte(preco: Preco, porte: Porte): PrecoExibido {
  if (preco.tipo === "porte") return { valor: formatarPreco(preco.valores[porte]) };
  if (preco.tipo === "unico") return { valor: formatarPreco(preco.valor), nota: "preço único" };
  return { prefixo: "a partir de", valor: formatarPreco(preco.valor) };
}

/** Linha única — vai pra mensagem do WhatsApp. */
export function precoEmTexto(preco: Preco, porte: Porte): string {
  const p = precoNoPorte(preco, porte);
  return [p.prefixo, p.valor, p.nota && `(${p.nota})`].filter(Boolean).join(" ");
}

/** Converte pro shape de Offer/PriceSpecification do schema.org. */
export function precoParaJsonLd(preco: Preco): Record<string, unknown> {
  if (preco.tipo === "porte") {
    return {
      priceSpecification: PORTES.map((porte) => ({
        "@type": "UnitPriceSpecification",
        name: porte,
        price: preco.valores[porte],
        priceCurrency: "BRL",
      })),
    };
  }
  if (preco.tipo === "unico") {
    return { price: preco.valor, priceCurrency: "BRL" };
  }
  return {
    priceSpecification: {
      "@type": "PriceSpecification",
      minPrice: preco.valor,
      priceCurrency: "BRL",
    },
  };
}
