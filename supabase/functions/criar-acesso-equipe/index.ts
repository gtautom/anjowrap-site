import {
  CORS_HEADERS,
  clienteAdmin,
  exigirEquipe,
  gerarSenhaTemporaria,
  respostaErro,
  respostaOk,
} from "../_shared/equipe.ts";

/**
 * Só admin chama. Cria o login (e-mail + senha temporária) e a linha em
 * public.equipe na mesma operação — por isso precisa de service_role,
 * nunca roda no navegador.
 */
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "POST") return respostaErro("Método não permitido.", 405);

  const admin = clienteAdmin();

  const identidade = await exigirEquipe(req, admin, "admin");
  if ("erro" in identidade) return identidade.erro;

  let corpo: { nome?: string; email?: string; papel?: string };
  try {
    corpo = await req.json();
  } catch {
    return respostaErro("Requisição inválida.");
  }

  const nome = corpo.nome?.trim();
  const email = corpo.email?.trim().toLowerCase();
  const papel = corpo.papel;

  if (!nome || nome.length < 2) return respostaErro("Informe o nome.");
  if (!email || !email.includes("@")) return respostaErro("E-mail inválido.");
  if (papel !== "funcionario" && papel !== "admin") return respostaErro("Papel inválido.");

  const senhaTemporaria = gerarSenhaTemporaria();

  const { data: novoUsuario, error: erroCriacao } = await admin.auth.admin.createUser({
    email,
    password: senhaTemporaria,
    email_confirm: true,
  });

  if (erroCriacao || !novoUsuario.user) {
    const jaExiste = erroCriacao?.message?.toLowerCase().includes("already been registered");
    return respostaErro(
      jaExiste ? "Já existe uma conta com esse e-mail." : "Não foi possível criar o acesso.",
      jaExiste ? 409 : 500,
    );
  }

  const { error: erroEquipe } = await admin.from("equipe").insert({
    id: novoUsuario.user.id,
    nome,
    papel,
  });

  if (erroEquipe) {
    // Reverte o auth.users criado — senão fica um login orfão sem linha em equipe.
    await admin.auth.admin.deleteUser(novoUsuario.user.id);
    return respostaErro("Não foi possível registrar o acesso na equipe.", 500);
  }

  return respostaOk({ email, senhaTemporaria });
});
