import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export function respostaErro(mensagem: string, status = 400): Response {
  return new Response(JSON.stringify({ erro: mensagem }), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

export function respostaOk(corpo: unknown): Response {
  return new Response(JSON.stringify(corpo), {
    status: 200,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

/** Cliente com privilégio total — só usado depois de validar quem está chamando. */
export function clienteAdmin(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

export type MembroEquipe = { id: string; nome: string; papel: "funcionario" | "admin"; ativo: boolean };

/**
 * Identifica quem está chamando pelo Authorization header (o supabase-js do
 * browser manda o JWT da própria sessão) e confere que é membro ativo da
 * equipe. Nunca confia em id mandado no corpo da requisição — sempre deriva
 * do token.
 */
export async function exigirEquipe(
  req: Request,
  admin: SupabaseClient,
  papelMinimo: "funcionario" | "admin" = "funcionario",
): Promise<{ membro: MembroEquipe } | { erro: Response }> {
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return { erro: respostaErro("Não autenticado.", 401) };

  const { data: userData, error: userErro } = await admin.auth.getUser(token);
  if (userErro || !userData.user) return { erro: respostaErro("Sessão inválida.", 401) };

  const { data: membro, error: equipeErro } = await admin
    .from("equipe")
    .select("id, nome, papel, ativo")
    .eq("id", userData.user.id)
    .eq("ativo", true)
    .maybeSingle();

  if (equipeErro || !membro) return { erro: respostaErro("Sem acesso à equipe.", 403) };
  if (papelMinimo === "admin" && membro.papel !== "admin") {
    return { erro: respostaErro("Só administradores podem fazer isso.", 403) };
  }

  return { membro: membro as MembroEquipe };
}

/** 10 caracteres, sem 0/O/1/l/I — pra não dar confusão quando a equipe dita por telefone/WhatsApp. */
export function gerarSenhaTemporaria(): string {
  const alfabeto = "23456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz";
  let senha = "";
  const aleatorios = new Uint32Array(10);
  crypto.getRandomValues(aleatorios);
  for (let i = 0; i < 10; i++) senha += alfabeto[aleatorios[i] % alfabeto.length];
  return senha;
}
