import { CATEGORIAS, type Categoria } from "@/lib/trabalhos";
import { CATEGORIAS_CATALOGO, type CategoriaCatalogo } from "@/lib/catalogo";

export type SubItemNav = {
  label: string;
  href: string;
};

export type ItemNav = {
  id: number;
  label: string;
  link?: string;
  subMenus?: {
    title: string;
    items: SubItemNav[];
  }[];
};

/**
 * Fonte única do header — dropdown desktop e painel mobile leem daqui.
 * Trabalhos filtra a galeria da home; Serviços leva pra tabela de preços
 * já filtrada pela categoria do catálogo.
 */
export const NAV_ITEMS: ItemNav[] = [
  {
    id: 1,
    label: "Trabalhos",
    subMenus: [
      {
        title: "Categorias",
        items: (CATEGORIAS as readonly Categoria[]).map((categoria) => ({
          label: categoria,
          href: `/?categoria=${encodeURIComponent(categoria)}#galeria`,
        })),
      },
    ],
  },
  {
    id: 2,
    label: "Serviços",
    subMenus: [
      {
        title: "Categorias",
        items: (CATEGORIAS_CATALOGO as readonly CategoriaCatalogo[]).map((categoria) => ({
          label: categoria,
          href: `/servicos?categoria=${encodeURIComponent(categoria)}`,
        })),
      },
    ],
  },
  {
    id: 3,
    label: "Plano",
    link: "/servicos#plano",
  },
  {
    id: 4,
    label: "Orçamento",
    link: "/#orcamento",
  },
];
