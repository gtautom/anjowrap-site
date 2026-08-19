"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PLANO } from "@/lib/plano";

type DadosPlano = {
  nome: string;
  cpf: string;
  whatsapp: string;
  email: string;
  modelo: string;
  cidade: string;
};

type Campo = keyof DadosPlano;
type Erros = Partial<Record<Campo, string>>;

const VAZIO: DadosPlano = {
  nome: "",
  cpf: "",
  whatsapp: "",
  email: "",
  modelo: "",
  cidade: "",
};

/** Mesma validação manual do FormOrcamento — sem biblioteca de formulário. */
function validar(dados: DadosPlano): Erros {
  const erros: Erros = {};
  if (dados.nome.trim().length < 2) erros.nome = "Informe seu nome.";
  if (dados.cpf.replace(/\D/g, "").length !== 11) erros.cpf = "CPF com 11 dígitos.";
  const digitos = dados.whatsapp.replace(/\D/g, "");
  if (digitos.length < 10 || digitos.length > 11)
    erros.whatsapp = "WhatsApp com DDD, 10 ou 11 dígitos.";
  if (!dados.email.includes("@")) erros.email = "E-mail inválido.";
  if (dados.modelo.trim().length < 2) erros.modelo = "Informe o modelo do carro.";
  if (dados.cidade.trim().length < 2) erros.cidade = "Informe sua cidade.";
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

export function FormPlano() {
  const [dados, setDados] = useState<DadosPlano>(VAZIO);
  const [erros, setErros] = useState<Erros>({});
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);

  const alterar = (campo: Campo, valor: string) => {
    setDados((d) => ({ ...d, [campo]: valor }));
    setErros((e) => ({ ...e, [campo]: undefined }));
    setErroEnvio(null);
  };

  const enviar = async () => {
    const encontrados = validar(dados);
    setErros(encontrados);
    if (Object.keys(encontrados).length > 0) {
      document.getElementById(Object.keys(encontrados)[0])?.focus();
      return;
    }

    setEnviando(true);
    setErroEnvio(null);
    try {
      const resposta = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });
      const corpo: { url?: string; erro?: string } = await resposta.json();
      if (!resposta.ok || !corpo.url) {
        setErroEnvio(corpo.erro ?? "Não foi possível iniciar a assinatura agora.");
        return;
      }
      window.location.href = corpo.url;
    } catch {
      setErroEnvio("Falha de conexão. Tente de novo em instantes.");
    } finally {
      setEnviando(false);
    }
  };

  const borda = (campo: Campo) => (erros[campo] ? "border-ambar" : "");

  return (
    <div className="mt-8 border-t border-border pt-8">
      <p className="mb-6 max-w-leitura text-corpo text-prata">
        O plano é presencial: a lavagem semanal acontece na oficina, em {PLANO.praca}.
        Confirme seus dados e o carro — a assinatura é mensal, no cartão.
      </p>

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
          <Label htmlFor="cpf" className="mb-2 block">
            CPF
          </Label>
          <Input
            id="cpf"
            inputMode="numeric"
            placeholder="000.000.000-00"
            value={dados.cpf}
            onChange={(e) => alterar("cpf", e.target.value)}
            aria-invalid={Boolean(erros.cpf)}
            className={borda("cpf")}
          />
          <Erro texto={erros.cpf} />
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
          <Label htmlFor="email" className="mb-2 block">
            E-mail
          </Label>
          <Input
            id="email"
            type="email"
            value={dados.email}
            onChange={(e) => alterar("email", e.target.value)}
            aria-invalid={Boolean(erros.email)}
            className={borda("email")}
          />
          <Erro texto={erros.email} />
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

        <div className="sm:col-span-2">
          <Label htmlFor="cidade" className="mb-2 block">
            Cidade
          </Label>
          <Input
            id="cidade"
            placeholder="Belém"
            value={dados.cidade}
            onChange={(e) => alterar("cidade", e.target.value)}
            aria-invalid={Boolean(erros.cidade)}
            className={borda("cidade")}
          />
          <Erro texto={erros.cidade} />
        </div>
      </div>

      {erroEnvio && (
        <p className="mt-4 font-mono text-legenda text-ambar" role="alert">
          {erroEnvio}
        </p>
      )}

      <Button type="button" onClick={enviar} disabled={enviando} className="mt-6 w-full">
        {enviando ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" strokeWidth={1.75} />
        ) : (
          <Send className="mr-2 h-4 w-4" strokeWidth={1.75} />
        )}
        {enviando ? "Abrindo assinatura…" : "Assinar o plano"}
      </Button>
    </div>
  );
}
