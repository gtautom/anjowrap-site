import {
  CORS_HEADERS,
  clienteAdmin,
  exigirEquipe,
  gerarSenhaTemporaria,
  respostaErro,
  respostaOk,
} from "../_shared/equipe.ts";

const DURACAO_DIAS = 30;

/**
 * Equipe (qualquer papel) chama depois de ver o pagamento confirmado no
 * painel do Asaas — o link é único e compartilhado entre todos os
 * clientes, então essa confirmação é sempre uma ação humana, não um
 * webhook automático.
 *
 * 1ª confirmação: cria o login do cliente (telefone + senha temporária) e
 * devolve a senha pra equipe repassar por WhatsApp. Renovação (já tem
 * login): só atualiza as datas — o reset de lavagens_usadas é automático,
 * cuidado pelo trigger do banco quando data_inicio muda.
 */
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "POST") return respostaErro("Método não permitido.", 405);

  const admin = clienteAdmin();

  const identidade = await exigirEquipe(req, admin, "funcionario");
  if ("erro" in identidade) return identidade.erro;

  let corpo: { clienteId?: string };
  try {
    corpo = await req.json();
  } catch {
    return respostaErro("Requisição inválida.");
  }

  const clienteId = corpo.clienteId;
  if (!clienteId) return respostaErro("Informe o cliente.");

  const { data: cliente, error: erroBusca } = await admin
    .from("clientes_plano")
    .select("id, nome, telefone, email, user_id")
    .eq("id", clienteId)
    .maybeSingle();

  if (erroBusca || !cliente) return respostaErro("Cliente não encontrado.", 404);

  let senhaTemporaria: string | null = null;

  if (!cliente.user_id) {
    senhaTemporaria = gerarSenhaTemporaria();
    const telefoneDigitos = cliente.telefone.replace(/\D/g, "");

    const { data: novoUsuario, error: erroCriacao } = await admin.auth.admin.createUser({
      phone: telefoneDigitos,
      password: senhaTemporaria,
      phone_confirm: true,
      email: cliente.email ?? undefined,
      email_confirm: cliente.email ? true : undefined,
    });

    if (erroCriacao || !novoUsuario.user) {
      const jaExiste = erroCriacao?.message?.toLowerCase().includes("already been registered");
      return respostaErro(
        jaExiste
          ? "Já existe uma conta com esse telefone — verifique se o cliente não está duplicado."
          : "Não foi possível criar o acesso do cliente.",
        jaExiste ? 409 : 500,
      );
    }

    const { error: erroVincular } = await admin
      .from("clientes_plano")
      .update({ user_id: novoUsuario.user.id })
      .eq("id", clienteId);

    if (erroVincular) {
      await admin.auth.admin.deleteUser(novoUsuario.user.id);
      return respostaErro("Não foi possível vincular o acesso ao cliente.", 500);
    }
  }

  const hoje = new Date();
  const expiracao = new Date(hoje);
  expiracao.setDate(expiracao.getDate() + DURACAO_DIAS);
  const paraISO = (d: Date) => d.toISOString().slice(0, 10);

  const { error: erroAtualizar } = await admin
    .from("clientes_plano")
    .update({
      status: "contratado",
      data_inicio: paraISO(hoje),
      data_expiracao: paraISO(expiracao),
      confirmado_por: identidade.membro.id,
      confirmado_em: new Date().toISOString(),
    })
    .eq("id", clienteId);

  if (erroAtualizar) return respostaErro("Não foi possível confirmar o pagamento.", 500);

  return respostaOk({
    dataInicio: paraISO(hoje),
    dataExpiracao: paraISO(expiracao),
    senhaTemporaria,
    primeiraAtivacao: senhaTemporaria !== null,
  });
});
