import { NextResponse } from "next/server";
import { PLANO } from "@/lib/plano";

/**
 * Cria a assinatura do plano de lavagem no Asaas e devolve o link do
 * checkout hospedado. O cartão nunca passa por aqui — essa rota só manda
 * identidade (nome, CPF, contato, modelo do carro) pro Asaas, que gera a
 * tela de pagamento. ASAAS_API_KEY é env de servidor, nunca NEXT_PUBLIC_:
 * prefixo público inlina a chave no bundle do browser.
 */

type PedidoPlano = {
  nome: string;
  cpf: string;
  whatsapp: string;
  email: string;
  modelo: string;
  cidade: string;
};

function gerarProtocolo(): string {
  const hoje = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const sufixo = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `AW-${hoje}-${sufixo}`;
}

function validar(corpo: Partial<PedidoPlano>): string | null {
  if (!corpo.nome || corpo.nome.trim().length < 2) return "Informe seu nome.";
  if ((corpo.cpf ?? "").replace(/\D/g, "").length !== 11) return "CPF inválido.";
  const digitosWhats = (corpo.whatsapp ?? "").replace(/\D/g, "");
  if (digitosWhats.length < 10 || digitosWhats.length > 11) return "WhatsApp inválido.";
  if (!corpo.email || !corpo.email.includes("@")) return "E-mail inválido.";
  if (!corpo.modelo || corpo.modelo.trim().length < 2) return "Informe o modelo do carro.";
  if (!corpo.cidade || corpo.cidade.trim().length < 2) return "Informe a cidade.";
  return null;
}

/** ASAAS_ENV=production troca pra base real; sandbox é o padrão até a chave
 *  de produção estar confirmada no painel do Netlify. */
const BASE_URL =
  process.env.ASAAS_ENV === "production"
    ? "https://api.asaas.com"
    : "https://api-sandbox.asaas.com";

const MENSAGEM_ERRO_GENERICA =
  "Não foi possível iniciar a assinatura agora. Tente de novo em instantes ou fale no WhatsApp.";

export async function POST(request: Request) {
  const chave = process.env.ASAAS_API_KEY;
  if (!chave) {
    return NextResponse.json(
      { erro: "Assinatura online indisponível no momento." },
      { status: 503 },
    );
  }

  let corpo: Partial<PedidoPlano>;
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: "Requisição inválida." }, { status: 400 });
  }

  const erroValidacao = validar(corpo);
  if (erroValidacao) {
    return NextResponse.json({ erro: erroValidacao }, { status: 400 });
  }
  const { nome, cpf, whatsapp, email, modelo, cidade } = corpo as PedidoPlano;

  const protocolo = gerarProtocolo();
  const amanha = new Date();
  amanha.setDate(amanha.getDate() + 1);
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://anjowrap.com.br";

  try {
    const resposta = await fetch(`${BASE_URL}/v3/checkouts`, {
      method: "POST",
      headers: { "Content-Type": "application/json", access_token: chave },
      body: JSON.stringify({
        billingTypes: ["CREDIT_CARD"],
        chargeTypes: ["RECURRENT"],
        minutesToExpire: 60,
        callback: {
          successUrl: `${site}/servicos?assinatura=sucesso`,
          cancelUrl: `${site}/servicos?assinatura=cancelada`,
          expiredUrl: `${site}/servicos?assinatura=expirada`,
        },
        items: [
          {
            name: PLANO.nome,
            description: PLANO.frequencia,
            quantity: 1,
            value: PLANO.valorMensal,
          },
        ],
        customerData: {
          name: nome,
          cpfCnpj: cpf.replace(/\D/g, ""),
          email,
          phone: whatsapp.replace(/\D/g, ""),
        },
        // Não existe campo de veículo no checkout do Asaas — o modelo e a
        // cidade sobrevivem aqui, junto do protocolo, e aparecem na cobrança
        // no painel dela.
        externalReference: `${protocolo} · ${modelo} · ${cidade}`,
        subscription: {
          cycle: "MONTHLY",
          nextDueDate: amanha.toISOString().slice(0, 10),
        },
      }),
    });

    if (!resposta.ok) {
      console.error("Asaas checkout falhou", resposta.status, await resposta.text());
      return NextResponse.json({ erro: MENSAGEM_ERRO_GENERICA }, { status: 502 });
    }

    const dados: { link?: string } = await resposta.json();
    if (!dados.link) {
      console.error("Asaas checkout sem link na resposta", dados);
      return NextResponse.json({ erro: MENSAGEM_ERRO_GENERICA }, { status: 502 });
    }

    return NextResponse.json({ url: dados.link, protocolo });
  } catch (erro) {
    console.error("Asaas checkout — erro de rede", erro);
    return NextResponse.json({ erro: MENSAGEM_ERRO_GENERICA }, { status: 502 });
  }
}
