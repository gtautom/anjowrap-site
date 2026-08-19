import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatarPreco } from "@/lib/catalogo";
import { PLANO, linkRenovarPlano } from "@/lib/plano";
import { linkPlanoLavagem } from "@/lib/whatsapp";

export type VariantePlano = "teaser" | "completa";

const IMAGEM_NIVEL = "/catalogo/lavagem/limpeza-nivel-2.jpg";

/**
 * Único card com fundo âmbar/40 no fio da borda — o destaque comercial que
 * o CLAUDE.md do projeto reserva pro preenchimento sólido do Button. Nada
 * de área âmbar grande: fio + preço + pill + botão ficam bem abaixo do
 * teto de 5% de tela.
 *
 * Oferta própria, separada dos níveis I/II/III do catálogo — não citar
 * nível nenhum aqui (decisão da Jade, 19/08/2026). Pagamento por link
 * avulso do Asaas, sem cartão cadastrado e sem cobrança automática: o
 * cliente clica em "Renovar" quando quiser continuar no mês seguinte.
 */
export function PlanoLavagem({ variante = "completa" }: { variante?: VariantePlano }) {
  const preco = formatarPreco(PLANO.valorMensal);
  const completa = variante === "completa";
  const linkRenovar = linkRenovarPlano() ?? linkPlanoLavagem();

  return (
    <section
      id={completa ? "plano" : undefined}
      className="border-t border-border px-6 py-16 md:px-16 md:py-20"
    >
      <div className="mx-auto max-w-6xl">
        <p className="rotulo mb-4">Plano</p>
        <Card className="overflow-hidden border-ambar/40">
          <div className="grid md:grid-cols-[1.1fr_0.9fr]">
            <div className="flex flex-col justify-center p-6 md:p-10">
              <span className="w-fit rounded-full border border-ambar/40 px-3 py-1 font-mono text-rotulo uppercase tracking-[0.18em] text-ambar">
                Plano mensal · {PLANO.praca}
              </span>

              <h2 className="mt-5 text-[2rem] font-semibold leading-[1.05] tracking-[0.02em] md:text-h2">
                Uma lavagem por semana
              </h2>

              <p className="mt-4 max-w-leitura text-corpo text-prata">
                {completa
                  ? "Quatro a cinco lavagens em um mês, por um valor fechado. Pra continuar no mês seguinte é só renovar — sem cartão cadastrado, sem cobrança automática."
                  : `Um mês de lavagem semanal, valor fechado, na oficina, em ${PLANO.praca}. Sem cartão cadastrado, sem cobrança automática.`}
              </p>

              <p className="mt-6 flex items-baseline gap-2 font-display leading-none text-ambar">
                <span className="text-[3rem] font-bold md:text-[3.5rem]">{preco}</span>
                <span className="font-sans text-corpo font-normal text-prata">
                  / {PLANO.duracao.toLowerCase()}
                </span>
              </p>

              {completa && (
                <p className="mt-6 max-w-leitura text-corpo text-prata">
                  O plano é executado na oficina, em {PLANO.praca}. PPF, envelopamento e as
                  demais aplicações a gente atende para todo o Brasil — a lavagem semanal exige
                  o carro aqui.
                </p>
              )}

              {completa ? (
                <div className="mt-8 border-t border-border pt-8">
                  <Button asChild className="w-full sm:w-auto">
                    <a href={linkRenovar} target="_blank" rel="noopener noreferrer">
                      Renovar
                    </a>
                  </Button>
                </div>
              ) : (
                <Button asChild className="mt-8 w-full sm:w-auto">
                  <a href="/servicos#plano">Ver o plano</a>
                </Button>
              )}
            </div>

            <div className="relative min-h-[240px] md:min-h-full">
              <Image
                src={IMAGEM_NIVEL}
                alt="Lavagem com snow foam do plano semanal da ANJOWRAP"
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
