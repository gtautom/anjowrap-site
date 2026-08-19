/**
 * Sempre com DDI 55, só dígitos — mesmo formato de NEXT_PUBLIC_WHATSAPP.
 * Precisa ser consistente entre o cadastro do cliente (equipe digita) e o
 * login (cliente digita), senão o telefone salvo não bate com o auth.users.phone
 * criado pela Edge Function confirmar-pagamento.
 */
export function normalizarTelefoneBR(valor: string): string {
  const digitos = valor.replace(/\D/g, "");
  if (digitos.startsWith("55") && digitos.length >= 12) return digitos;
  return `55${digitos}`;
}
