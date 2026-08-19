"use client";

import { useState } from "react";
import { MessageSquareText, Send, Globe, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NOMES_SERVICOS, ATENDIMENTO } from "@/lib/servicos";
import {
  montarLinkWhatsApp,
  linkWhatsAppDireto,
  type DadosOrcamento,
} from "@/lib/whatsapp";

type Campo = keyof DadosOrcamento;
type Erros = Partial<Record<Campo, string>>;

const VAZIO: DadosOrcamento = {
  nome: "",
  whatsapp: "",
  modelo: "",
  ano: "",
  servico: "",
  observacoes: "",
};

/** Validacao client-side sem biblioteca externa. */
function validar(dados: DadosOrcamento): Erros {
  const erros: Erros = {};
  const anoAtual = new Date().getFullYear();

  if (dados.nome.trim().length < 2) erros.nome = "Informe seu nome.";

  const digitos = dados.whatsapp.replace(/\D/g, "");
  if (digitos.length < 10 || digitos.length > 11)
    erros.whatsapp = "WhatsApp com DDD, 10 ou 11 dígitos.";

  if (dados.modelo.trim().length < 2)
    erros.modelo = "Informe o modelo do carro.";

  const ano = Number(dados.ano);
  if (!/^\d{4}$/.test(dados.ano) || ano < 1950 || ano > anoAtual + 1)
    erros.ano = `Ano entre 1950 e ${anoAtual + 1}.`;

  if (!dados.servico) erros.servico = "Escolha um serviço.";

  return erros;
}

function Erro({ texto }: { texto?: string }) {
  if (!texto) return null;
  return (
    <p className="mt-2 font-mono text-legenda text-ambar" role="alert">
      {texto}
    </p>
  );
}

export default function FormOrcamento() {
  const [dados, setDados] = useState<DadosOrcamento>(VAZIO);
  const [erros, setErros] = useState<Erros>({});

  const alterar = (campo: Campo, valor: string) => {
    setDados((d) => ({ ...d, [campo]: valor }));
    setErros((e) => ({ ...e, [campo]: undefined }));
  };

  const enviar = () => {
    const encontrados = validar(dados);
    setErros(encontrados);
    if (Object.keys(encontrados).length > 0) {
      document.getElementById(Object.keys(encontrados)[0])?.focus();
      return;
    }
    window.open(montarLinkWhatsApp(dados), "_blank", "noopener,noreferrer");
  };

  const borda = (campo: Campo) => (erros[campo] ? "border-ambar" : "");

  return (
    <section
      id="orcamento"
      className="border-t border-border bg-background px-4 py-20 md:px-8 md:py-28"
    >
      <div className="mx-auto flex max-w-2xl items-center justify-center">
        <Card className="w-full">
          <CardContent className="p-6 sm:p-8 lg:p-10">
            {/* Cabecalho: bloco de icone + titulo + descricao */}
            <div className="mb-8 flex gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-ambar">
                <MessageSquareText
                  className="h-6 w-6 text-preto"
                  strokeWidth={1.75}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="rotulo mb-2">Orçamento</p>
                <h2 className="mb-2 font-display text-2xl font-semibold uppercase leading-none tracking-[0.02em] text-foreground sm:text-3xl">
                  Conte do carro
                </h2>
                <p className="max-w-leitura text-corpo leading-relaxed text-muted-foreground">
                  Preencha e o pedido abre direto no WhatsApp, já escrito. Você
                  confere antes de enviar.
                </p>
              </div>
            </div>

            {/* Sem <form>: o envio abre o WhatsApp, nao faz submit nativo. */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="nome" className="mb-2 block">
                  Nome
                </Label>
                <Input
                  id="nome"
                  value={dados.nome}
                  onChange={(e) => alterar("nome", e.target.value)}
                  aria-invalid={Boolean(erros.nome)}
                  className={borda("nome")}
                />
                <Erro texto={erros.nome} />
              </div>

              <div>
                <Label htmlFor="whatsapp" className="mb-2 block">
                  WhatsApp
                </Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  inputMode="numeric"
                  placeholder="(00) 90000-0000"
                  value={dados.whatsapp}
                  onChange={(e) => alterar("whatsapp", e.target.value)}
                  aria-invalid={Boolean(erros.whatsapp)}
                  className={borda("whatsapp")}
                />
                <Erro texto={erros.whatsapp} />
              </div>

              <div>
                <Label htmlFor="servico" className="mb-2 block">
                  Serviço
                </Label>
                <Select
                  value={dados.servico}
                  onValueChange={(v) => alterar("servico", v)}
                >
                  <SelectTrigger
                    id="servico"
                    aria-invalid={Boolean(erros.servico)}
                    className={borda("servico")}
                  >
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {NOMES_SERVICOS.map((nome) => (
                      <SelectItem key={nome} value={nome}>
                        {nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Erro texto={erros.servico} />
              </div>

              <div>
                <Label htmlFor="modelo" className="mb-2 block">
                  Modelo do carro
                </Label>
                <Input
                  id="modelo"
                  placeholder="Porsche 911"
                  value={dados.modelo}
                  onChange={(e) => alterar("modelo", e.target.value)}
                  aria-invalid={Boolean(erros.modelo)}
                  className={borda("modelo")}
                />
                <Erro texto={erros.modelo} />
              </div>

              <div>
                <Label htmlFor="ano" className="mb-2 block">
                  Ano
                </Label>
                <Input
                  id="ano"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="2024"
                  value={dados.ano}
                  onChange={(e) => alterar("ano", e.target.value)}
                  aria-invalid={Boolean(erros.ano)}
                  className={borda("ano")}
                />
                <Erro texto={erros.ano} />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="observacoes" className="mb-2 block">
                  Observações
                </Label>
                <Textarea
                  id="observacoes"
                  rows={4}
                  placeholder="Alguma coisa que a gente precisa saber antes."
                  value={dados.observacoes}
                  onChange={(e) => alterar("observacoes", e.target.value)}
                />
              </div>
            </div>

            {/* Abrangencia declarada, no mesmo padrao de chip do modal */}
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {ATENDIMENTO.map((item, i) => {
                const Icone = i === 0 ? Globe : MapPin;
                return (
                  <div
                    key={item.rotulo}
                    className="flex items-center gap-2 rounded-xl border border-border bg-background p-3"
                  >
                    <Icone
                      className="h-4 w-4 flex-shrink-0 text-ambar"
                      strokeWidth={1.5}
                    />
                    <span className="truncate font-mono text-legenda uppercase tracking-[0.1em] text-muted-foreground">
                      {item.rotulo}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex flex-col justify-end gap-3 border-t border-border pt-6 sm:flex-row sm:gap-4">
              <Button
                asChild
                variant="outline"
                className="order-2 sm:order-1"
                size="default"
              >
                <a
                  href={linkWhatsAppDireto()}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Falar direto
                </a>
              </Button>
              <Button
                type="button"
                onClick={enviar}
                className="order-1 sm:order-2"
              >
                <Send className="mr-2 h-4 w-4" strokeWidth={1.75} />
                Enviar no WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
