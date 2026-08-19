import Image from "next/image";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatarPreco } from "@/lib/catalogo";
import { PLANO, planoAtivo } from "@/lib/plano";
import { linkPlanoLavagem } from "@/lib/whatsapp";
import { FormPlano } from "@/components/FormPlano";

export type VariantePlano = "teaser" | "completa";

const IMAGEM_NIVEL = "/catalogo/lavagem/limpeza-nivel-2.jpg";

/**
 * Único card com fundo âmbar/40 no fio da borda — o destaque comercial que
 * o CLAUDE.md do projeto reserva pro preenchimento sólido do Button. Nada
 * de área âmbar grande: fio + preço + pill + checks + botão ficam bem
 * abaixo do teto de 5% de tela.
 */
export function PlanoLavagem({ variante = "completa" }: { variante?: VariantePlano }) {
  const preco = formatarPreco(PLANO.valorMensal);
  const completa = variante === "completa";
  const itensVisiveis = completa ? PLANO.inclui : PLANO.inclui.slice(0, 5);
  const restantes = PLANO.inclui.length - itensVisiveis.length;

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
                Assinatura mensal · {PLANO.praca}
              </span>

              <h2 className="mt-5 text-[2rem] font-semibold leading-[1.05] tracking-[0.02em] md:text-h2">
                Uma lavagem por semana
              </h2>

              <p className="mt-4 max-w-leitura text-corpo text-prata">
                {completa
                  ? "Quatro a cinco lavagens por mês por um valor fechado. A cobrança é mensal no cartão, renovada automaticamente."
                  : `Valor fechado por mês para manter o carro limpo sem pensar nisso — ${PLANO.nivel.toLowerCase()}, na oficina, em ${PLANO.praca}.`}
              </p>

              <p className="mt-6 flex items-baseline gap-2 font-display leading-none text-ambar">
                <span className="text-[3rem] font-bold md:text-[3.5rem]">{preco}</span>
                <span className="font-sans text-corpo font-normal text-prata">/mês</span>
              </p>

              <ul className="mt-6 space-y-2">
                {itensVisiveis.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-corpo text-prata">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-ambar" strokeWidth={2} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              {!completa && restantes > 0 && (
                <p className="mt-2 font-mono text-legenda uppercase tracking-[0.1em] text-prata">
                  e mais {restantes} {restantes === 1 ? "item" : "itens"}
                </p>
              )}

              {completa && (
                <p className="mt-6 max-w-leitura text-corpo text-prata">
                  O plano é executado na oficina, em {PLANO.praca}. PPF, envelopamento e as
                  demais aplicações a gente atende para todo o Brasil — a lavagem semanal exige
                  o carro aqui.
                </p>
              )}

              {completa ? (
                planoAtivo() ? (
                  <FormPlano />
                ) : (
                  <div className="mt-8 border-t border-border pt-8">
                    <Button asChild className="w-full sm:w-auto">
                      <a href={linkPlanoLavagem()} target="_blank" rel="noopener noreferrer">
                        Falar sobre o plano
                      </a>
                    </Button>
                  </div>
                )
              ) : (
                <Button asChild className="mt-8 w-full sm:w-auto">
                  <a href="/servicos#plano">Ver o que inclui</a>
                </Button>
              )}
            </div>

            <div className="relative min-h-[240px] md:min-h-full">
              <Image
                src={IMAGEM_NIVEL}
                alt="Lavagem com snow foam do plano de assinatura da ANJOWRAP"
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
