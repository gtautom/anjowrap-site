import { VerticalTabs, type TabItem } from "@/components/ui/vertical-tabs";
import { Button } from "@/components/ui/button";
import { SERVICOS } from "@/lib/servicos";

/** PPF primeiro: e o servico principal e abre a rotacao automatica. */
const ITENS: TabItem[] = SERVICOS.map((s, i) => ({
  id: String(i + 1).padStart(2, "0"),
  title: s.nome,
  description: s.descricao,
  image: s.imagem,
  alt: s.imagemAlt,
  href: s.categoriaCatalogo
    ? `/servicos?categoria=${encodeURIComponent(s.categoriaCatalogo)}`
    : undefined,
}));

export default function Servicos() {
  return (
    <div className="border-t border-border">
      <VerticalTabs
        items={ITENS}
        heading="O principal e o resto"
        eyebrow="Serviços"
        autoPlay={5000}
      />
      <div className="border-t border-border px-6 py-6 md:px-16">
        <Button asChild variant="outline" size="sm">
          <a href="/servicos">Ver a tabela de preços completa</a>
        </Button>
      </div>
    </div>
  );
}
