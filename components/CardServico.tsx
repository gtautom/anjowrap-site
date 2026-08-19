import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { precoEmTexto, precoNoPorte, type ItemCatalogo, type Porte } from "@/lib/catalogo";
import { linkAgendamento } from "@/lib/whatsapp";

export type CardServicoProps = {
  item: ItemCatalogo;
  porte: Porte;
};

export function CardServico({ item, porte }: CardServicoProps) {
  const preco = precoNoPorte(item.preco, porte);
  const totalItens = item.inclui.reduce((soma, bloco) => soma + bloco.itens.length, 0);

  return (
    <Card className="overflow-hidden transition-colors hover:border-ambar">
      <div className="relative aspect-[4/3] overflow-hidden border-b border-border">
        <Image
          src={item.imagem}
          alt={item.imagemAlt}
          width={item.largura}
          height={item.altura}
          loading="lazy"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="h-full w-full object-cover object-center"
        />
      </div>

      <CardContent className="p-6">
        <p className="rotulo mb-2">{item.categoria}</p>
        <h3 className="font-display text-2xl font-semibold uppercase leading-none tracking-[0.02em] text-foreground">
          {item.nome}
        </h3>
        <p className="mt-3 text-corpo text-prata">{item.resumo}</p>

        <div className="mt-5 flex items-baseline gap-2">
          {preco.prefixo && (
            <span className="font-mono text-legenda uppercase tracking-[0.1em] text-terciario">
              {preco.prefixo}
            </span>
          )}
          <span className="font-display text-[2rem] font-semibold leading-none text-offwhite">
            {preco.valor}
          </span>
          {preco.nota && (
            <span className="font-mono text-legenda text-terciario">{preco.nota}</span>
          )}
        </div>

        {item.opcoes && (
          <div className="mt-4">
            <p className="font-mono text-legenda uppercase tracking-[0.1em] text-terciario">
              {item.opcoes.titulo}
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {item.opcoes.valores.map((valor) => (
                <li
                  key={valor}
                  className="rounded-full border border-borda px-3 py-1 font-mono text-legenda uppercase tracking-[0.08em] text-prata"
                >
                  {valor}
                </li>
              ))}
            </ul>
          </div>
        )}

        <details className="group mt-5 border-t border-borda pt-4">
          <summary className="flex cursor-pointer list-none items-center justify-between font-mono text-legenda uppercase tracking-[0.1em] text-prata">
            O que entra ({totalItens} itens)
            <ChevronDown
              className="h-4 w-4 text-terciario transition-transform group-open:rotate-180"
              strokeWidth={1.75}
            />
          </summary>
          <div className="mt-4 space-y-4">
            {item.inclui.map((bloco) => (
              <div key={bloco.titulo}>
                <p className="rotulo mb-2">{bloco.titulo}</p>
                <ul className="space-y-1.5 text-corpo text-prata">
                  {bloco.itens.map((texto) => (
                    <li key={texto}>{texto}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </details>

        {/* Outline, nao preenchido: 15 botoes solidos em ambar estourariam
            o teto de 5% do kit. O amber fica reservado pro plano. */}
        <Button asChild variant="outline" className="mt-6 w-full">
          <a
            href={linkAgendamento({
              servico: item.nome,
              porte,
              preco: precoEmTexto(item.preco, porte),
            })}
            target="_blank"
            rel="noopener noreferrer"
          >
            Agendar no WhatsApp
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
