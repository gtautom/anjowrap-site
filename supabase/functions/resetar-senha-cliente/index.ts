import {
  CORS_HEADERS,
  clienteAdmin,
  exigirEquipe,
  gerarSenhaTemporaria,
  respostaErro,
  respostaOk,
} from "../_shared/equipe.ts";

/**
 * Equipe chama a partir do sino de notificações ("Cliente X esqueceu a
 * senha"). Gera senha temporária nova pro login do cliente — precisa de
 * service_role porque trocar a senha de outro usuário não é uma operação
 * que o próprio cliente pode fazer sem estar logado.
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
    .select("id, nome, user_id")
    .eq("id", clienteId)
    .maybeSingle();

  if (erroBusca || !cliente) return respostaErro("Cliente não encontrado.", 404);
  if (!cliente.user_id) return respostaErro("Esse cliente ainda não tem acesso criado.", 409);

  const senhaTemporaria = gerarSenhaTemporaria();
  const { error: erroSenha } = await admin.auth.admin.updateUserById(cliente.user_id, {
    password: senhaTemporaria,
  });

  if (erroSenha) return respostaErro("Não foi possível redefinir a senha.", 500);

  await admin
    .from("notificacoes")
    .update({ lida: true, lida_por: identidade.membro.id, lida_em: new Date().toISOString() })
    .eq("cliente_id", clienteId)
    .eq("tipo", "senha")
    .eq("lida", false);

  return respostaOk({ senhaTemporaria });
});
