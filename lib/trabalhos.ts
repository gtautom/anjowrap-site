import { CATALOGO } from "@/lib/catalogo";

export const CATEGORIAS = [
  "PPF",
  "Envelopamento",
  "Polimento",
  "Teto black piano",
  "Martelinho de ouro",
  "Motos",
  "Lavagem",
  "Vitrificação",
  "Higienização",
  "Insulfilm",
] as const;
export type Categoria = (typeof CATEGORIAS)[number];

export type Trabalho = {
  id: string;
  categoria: Categoria;
  /** Carro fotografado. Entra no alt e na legenda. */
  modelo: string;
  /** Servico executado. Entra no alt e na legenda. */
  servico: string;
  src: string;
  largura: number;
  altura: number;
  /** Alt pronto, usado no lugar do formato padrao — itens vindos do catalogo. */
  alt?: string;
};

/**
 * Categorias do catalogo sem foto propria da oficina no acervo. Imagem vem
 * do catalogo — fotos de terceiros, ver pendencia registrada em briefing.md.
 * Derivado de CATALOGO (nao copiado a mao) pra herdar largura/altura reais
 * e o alt ja escrito, sem risco de divergir do dado fonte.
 */
const DO_CATALOGO: { id: string; categoria: Categoria }[] = [
  { id: "limpeza-nivel-1", categoria: "Lavagem" },
  { id: "limpeza-nivel-2", categoria: "Lavagem" },
  { id: "limpeza-nivel-3", categoria: "Lavagem" },
  { id: "polimento-farois", categoria: "Polimento" },
  { id: "polimento-vidros", categoria: "Polimento" },
  { id: "vitrificacao-1-ano", categoria: "Vitrificação" },
  { id: "vitrificacao-3-anos", categoria: "Vitrificação" },
  { id: "vitrificacao-5-anos", categoria: "Vitrificação" },
  { id: "higienizacao-interna", categoria: "Higienização" },
  { id: "higienizacao-profunda", categoria: "Higienização" },
  { id: "insulfilm-carbono", categoria: "Insulfilm" },
  { id: "insulfilm-ceramico", categoria: "Insulfilm" },
];

function trabalhosDoCatalogo(): Trabalho[] {
  return DO_CATALOGO.map(({ id, categoria }) => {
    const item = CATALOGO.find((i) => i.id === id);
    if (!item) throw new Error(`lib/trabalhos.ts: item "${id}" não existe em lib/catalogo.ts`);
    return {
      id: `cat-${item.id}`,
      categoria,
      modelo: item.nome,
      servico: categoria,
      src: item.imagem,
      largura: item.largura,
      altura: item.altura,
      alt: item.imagemAlt,
    };
  });
}

/**
 * Fotos reais da oficina, importadas do acervo do cliente em 13/08/2026.
 * Agrupadas por servico porque e o que da pra identificar com seguranca na
 * foto — e e o que o visitante procura. Para trocar uma foto, sobrescrever o
 * arquivo em public/trabalhos/<categoria>/ mantendo o nome.
 *
 * A partir do 17º item entram entradas derivadas de lib/catalogo.ts, pras
 * categorias que o acervo real ainda nao cobre (ver trabalhosDoCatalogo).
 */
export const TRABALHOS: Trabalho[] = [
  {
    id: "ppf-01",
    categoria: "PPF",
    modelo: "Chevrolet Silverado",
    servico: "Proteção de pintura PPF",
    src: "/trabalhos/ppf/ppf-01.jpg",
    largura: 900,
    altura: 1600,
  },
  {
    id: "ppf-02",
    categoria: "PPF",
    modelo: "Porsche Cayenne",
    servico: "Proteção de pintura PPF",
    src: "/trabalhos/ppf/ppf-02.jpg",
    largura: 1200,
    altura: 1600,
  },
  {
    id: "envelopamento-01",
    categoria: "Envelopamento",
    modelo: "MINI Cooper Countryman",
    servico: "Faixas em envelopamento",
    src: "/trabalhos/envelopamento/envelopamento-01.jpg",
    largura: 900,
    altura: 1600,
  },
  {
    id: "envelopamento-02",
    categoria: "Envelopamento",
    modelo: "Audi Q5",
    servico: "Envelopamento de capô",
    src: "/trabalhos/envelopamento/envelopamento-02.jpg",
    largura: 900,
    altura: 1600,
  },
  {
    id: "envelopamento-03",
    categoria: "Envelopamento",
    modelo: "Ford Ranger",
    servico: "Envelopamento verde militar",
    src: "/trabalhos/envelopamento/envelopamento-03.jpg",
    largura: 1440,
    altura: 1440,
  },
  {
    id: "envelopamento-04",
    categoria: "Envelopamento",
    modelo: "Haval Tank 300",
    servico: "Envelopamento em cinza fosco",
    src: "/trabalhos/envelopamento/envelopamento-04.jpg",
    largura: 1440,
    altura: 1440,
  },
  {
    id: "envelopamento-05",
    categoria: "Envelopamento",
    modelo: "Troller T4",
    servico: "Envelopamento azul",
    src: "/trabalhos/envelopamento/envelopamento-05.jpg",
    largura: 1296,
    altura: 1296,
  },
  {
    id: "polimento-01",
    categoria: "Polimento",
    modelo: "Mercedes-Benz CLA",
    servico: "Polimento e revestimento cerâmico",
    src: "/trabalhos/polimento/polimento-01.jpg",
    largura: 900,
    altura: 1600,
  },
  {
    id: "polimento-02",
    categoria: "Polimento",
    modelo: "Mercedes-Benz CLA",
    servico: "Polimento e revestimento cerâmico",
    src: "/trabalhos/polimento/polimento-02.jpg",
    largura: 1440,
    altura: 1440,
  },
  {
    id: "polimento-03",
    categoria: "Polimento",
    modelo: "Chevrolet Camaro",
    servico: "Polimento e revestimento cerâmico",
    src: "/trabalhos/polimento/polimento-03.jpg",
    largura: 1600,
    altura: 1600,
  },
  {
    id: "teto-01",
    categoria: "Teto black piano",
    modelo: "Toyota Corolla Cross",
    servico: "Kit teto em black piano",
    src: "/trabalhos/teto-black-piano/teto-01.jpg",
    largura: 900,
    altura: 1600,
  },
  {
    id: "teto-02",
    categoria: "Teto black piano",
    modelo: "SUV compacto",
    servico: "Aplicação de teto black piano",
    src: "/trabalhos/teto-black-piano/teto-02.jpg",
    largura: 900,
    altura: 1600,
  },
  {
    id: "teto-03",
    categoria: "Teto black piano",
    modelo: "SUV coupé branco",
    servico: "Teto black piano e capô protegido",
    src: "/trabalhos/teto-black-piano/teto-03.jpg",
    largura: 1600,
    altura: 1600,
  },
  {
    // Frame extraido de glwzz7.mp4, o unico registro de martelinho do acervo.
    id: "martelinho-01",
    categoria: "Martelinho de ouro",
    modelo: "Sedã cinza",
    servico: "Martelinho de ouro em porta",
    src: "/trabalhos/martelinho/martelinho-01.jpg",
    largura: 720,
    altura: 1280,
  },
  {
    id: "moto-01",
    categoria: "Motos",
    modelo: "BMW R 1250 GS",
    servico: "Proteção de pintura PPF em moto",
    src: "/trabalhos/motos/moto-01.jpg",
    largura: 1296,
    altura: 1296,
  },
  ...trabalhosDoCatalogo(),
];

/** Alt descritivo: carro e servico. Sem cidade — a marca atende o Brasil todo. */
export function altDoTrabalho(t: Trabalho): string {
  return t.alt ?? `${t.modelo} — ${t.servico.toLowerCase()} na ANJOWRAP`;
}
