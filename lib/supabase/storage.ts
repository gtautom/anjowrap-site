import { supabase } from "@/lib/supabase/client";

/** Bucket público — a foto em si não é dado sensível, só o upload é restrito ao dono. */
const BUCKET = "avatars";

/**
 * Envia a foto de perfil pro bucket `avatars`, sempre no mesmo path
 * (`{userId}/foto.<ext>`) — reenviar substitui a anterior (upsert). As
 * policies de storage restringem escrita a `auth.uid()` == primeira pasta
 * do path, então `userId` só pode ser a própria sessão.
 */
export async function enviarFoto(arquivo: File, userId: string): Promise<string> {
  const extensao = arquivo.name.split(".").pop()?.toLowerCase() || "jpg";
  const caminho = `${userId}/foto.${extensao}`;

  const { error } = await supabase.storage.from(BUCKET).upload(caminho, arquivo, {
    upsert: true,
    cacheControl: "3600",
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(caminho);
  // Cache-bust: mesmo path, arquivo novo — sem isso o navegador mostra a foto antiga.
  return `${data.publicUrl}?v=${Date.now()}`;
}
