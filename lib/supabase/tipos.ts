export type PapelEquipe = "funcionario" | "admin";
export type StatusCliente = "pendente" | "contratado";

export type MembroEquipe = {
  id: string;
  nome: string;
  papel: PapelEquipe;
  ativo: boolean;
  criado_em: string;
};

export type ClientePlano = {
  id: string;
  user_id: string | null;
  nome: string;
  telefone: string;
  email: string | null;
  status: StatusCliente;
  data_inicio: string | null;
  data_expiracao: string | null;
  lavagens_usadas: number;
  criado_por: string | null;
  confirmado_por: string | null;
  confirmado_em: string | null;
  criado_em: string;
};

export type Lavagem = {
  id: string;
  cliente_id: string;
  data: string;
  registrado_por: string;
};

/** 4 lavagens por ciclo — mesmo número confirmado pela Jade em lib/plano.ts (PLANO.lavagensPorMes). */
export const LAVAGENS_POR_CICLO = 4;

export type EstadoPlano = "sem-plano" | "ativo" | "expirado";

/**
 * Deriva o estado real na hora da consulta em vez de confiar num campo
 * status que precisaria de um job pra ficar sempre certo — data_expiracao
 * é a única fonte de verdade pra ativo/expirado.
 */
export function estadoDoPlano(cliente: Pick<ClientePlano, "status" | "data_expiracao">): EstadoPlano {
  if (cliente.status === "pendente" || !cliente.data_expiracao) return "sem-plano";
  const hoje = new Date().toISOString().slice(0, 10);
  return cliente.data_expiracao >= hoje ? "ativo" : "expirado";
}
