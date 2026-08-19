import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Supabase não configurado — faltam NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY.",
  );
}

/**
 * Cliente único do browser. Autenticação e RLS resolvem tudo — o site
 * continua estático, sem servidor próprio; a chave é pública de propósito,
 * a segurança real está nas políticas do banco (ver supabase/migrations).
 *
 * `persistSession`/`autoRefreshToken` já são o padrão do supabase-js, mas
 * ficam explícitos aqui de propósito — a sessão só deve sumir quando o
 * usuário clicar em "Sair" (supabase.auth.signOut()), nunca sozinha ao
 * recarregar a página.
 */
export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
