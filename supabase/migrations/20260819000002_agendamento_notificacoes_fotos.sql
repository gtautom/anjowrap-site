-- Agendamento, notificações de "esqueci a senha", fotos de perfil e
-- botões de gestão (desmarcar lavagem, arquivar cliente).
--
-- Decisões confirmadas com o cliente em 19/08/2026:
--  - Agendamento parte do horário de funcionamento (HORARIO em
--    lib/servicos.ts) como grade padrão; a equipe só bloqueia exceções
--    (feriado, agenda cheia) em vez de liberar cada horário manualmente.
--  - 1 carro por horário — reforçado por unique index, não só pela UI.
--  - "Esqueci a senha" vira notificação dentro do painel (não WhatsApp).
--  - "Excluir cliente" virou "arquivar" (soft-delete) — mantém o
--    histórico de lavagens imutável, dá pra reverter.

-- ── colunas novas ───────────────────────────────────────────────────────
alter table public.clientes_plano add column foto_url text;
alter table public.clientes_plano add column arquivado boolean not null default false;
alter table public.clientes_plano add column arquivado_em timestamptz;

alter table public.equipe add column foto_url text;
alter table public.equipe add column foto_visivel_clientes boolean not null default false;

comment on column public.clientes_plano.arquivado is 'Soft-delete: some das listas ativas e do painel de adesão, mas o histórico de lavagens continua intacto.';
comment on column public.equipe.foto_visivel_clientes is 'Cada membro opta por aparecer (ou não) na seção "Nossa equipe" da área do cliente.';

-- ── horarios_bloqueados ─────────────────────────────────────────────────
-- Exceção ao horário padrão de funcionamento. A grade em si é calculada no
-- front-end a partir de HORARIO.blocos (lib/servicos.ts) + lib/agendamento.ts;
-- essa tabela só registra o que foi tirado de cima dessa grade.
create table public.horarios_bloqueados (
  id uuid primary key default gen_random_uuid(),
  data date not null,
  hora time not null,
  motivo text,
  criado_por uuid references public.equipe (id),
  criado_em timestamptz not null default now(),
  unique (data, hora)
);

comment on table public.horarios_bloqueados is 'Exceções ao horário padrão de funcionamento — equipe bloqueia horários específicos (feriado, agenda cheia etc).';

-- ── agendamentos ────────────────────────────────────────────────────────
create table public.agendamentos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes_plano (id) on delete cascade,
  data date not null,
  hora time not null,
  -- nulo quando o próprio cliente agenda pelo site; preenchido quando a
  -- equipe agenda em nome de quem ligou/mandou mensagem.
  criado_por uuid references public.equipe (id),
  criado_em timestamptz not null default now()
);

comment on table public.agendamentos is 'Marcação de horário de lavagem. Cancelar = deletar a linha (não é histórico de propósito, diferente de lavagens).';

-- Garante 1 carro por horário no nível do banco — evita corrida de dois
-- clientes clicando o mesmo horário ao mesmo tempo.
create unique index agendamentos_slot_unico on public.agendamentos (data, hora);
create index agendamentos_cliente_id_idx on public.agendamentos (cliente_id);

-- ── notificacoes ────────────────────────────────────────────────────────
create table public.notificacoes (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('senha')),
  cliente_id uuid references public.clientes_plano (id) on delete cascade,
  mensagem text not null,
  lida boolean not null default false,
  lida_por uuid references public.equipe (id),
  lida_em timestamptz,
  criado_em timestamptz not null default now()
);

comment on table public.notificacoes is 'Avisos internos pra equipe — hoje só tipo "senha" (cliente esqueceu a senha no login). Escrita só via RPC security definer.';

create index notificacoes_nao_lidas_idx on public.notificacoes (lida) where lida = false;

-- Realtime: o sino da equipe assina essa tabela pra atualizar sozinho.
alter publication supabase_realtime add table public.notificacoes;

-- ── RPCs (security definer) ────────────────────────────────────────────
-- Evitam abrir policy de UPDATE genérica em clientes_plano/equipe só pra
-- permitir trocar a própria foto — colunas sensíveis (datas do plano,
-- lavagens_usadas, papel) continuam fora do alcance do cliente/funcionário.

-- Chamada sem sessão (tela de login não tem auth.uid()) — por isso
-- "anon" precisa de grant explícito. Não revela se o telefone existe:
-- insere notificação genérica mesmo quando não acha o cliente.
create or replace function public.solicitar_redefinicao_senha(p_telefone text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cliente record;
begin
  select id, nome into v_cliente from public.clientes_plano where telefone = p_telefone limit 1;

  insert into public.notificacoes (tipo, cliente_id, mensagem)
  values (
    'senha',
    v_cliente.id,
    case
      when v_cliente.id is not null then v_cliente.nome || ' esqueceu a senha (' || p_telefone || ').'
      else 'Pedido de redefinição de senha pro telefone ' || p_telefone || ' — nenhum cliente encontrado com esse número.'
    end
  );
end;
$$;

revoke all on function public.solicitar_redefinicao_senha(text) from public;
grant execute on function public.solicitar_redefinicao_senha(text) to anon, authenticated;

create or replace function public.atualizar_minha_foto_cliente(p_foto_url text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.clientes_plano set foto_url = p_foto_url where user_id = auth.uid();
end;
$$;

revoke all on function public.atualizar_minha_foto_cliente(text) from public;
grant execute on function public.atualizar_minha_foto_cliente(text) to authenticated;

create or replace function public.atualizar_meu_perfil_equipe(p_foto_url text, p_visivel boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.equipe
  set foto_url = coalesce(p_foto_url, foto_url),
      foto_visivel_clientes = p_visivel
  where id = auth.uid();
end;
$$;

revoke all on function public.atualizar_meu_perfil_equipe(text, boolean) from public;
grant execute on function public.atualizar_meu_perfil_equipe(text, boolean) to authenticated;

-- ── RLS ─────────────────────────────────────────────────────────────────
alter table public.horarios_bloqueados enable row level security;
alter table public.agendamentos enable row level security;
alter table public.notificacoes enable row level security;

-- horarios_bloqueados: qualquer autenticado vê (cliente precisa saber o
-- que está bloqueado pra calcular horário livre); só equipe gerencia.
create policy "horarios_bloqueados_autenticado_ve" on public.horarios_bloqueados
  for select using (auth.role() = 'authenticated');

create policy "horarios_bloqueados_equipe_insere" on public.horarios_bloqueados
  for insert with check (public.is_staff());

create policy "horarios_bloqueados_equipe_remove" on public.horarios_bloqueados
  for delete using (public.is_staff());

-- agendamentos: cliente vê/agenda/cancela os próprios; equipe faz tudo em
-- nome de qualquer cliente (quem liga pra marcar por telefone).
create policy "agendamentos_ve" on public.agendamentos
  for select using (
    public.is_staff()
    or exists (
      select 1 from public.clientes_plano cp
      where cp.id = agendamentos.cliente_id and cp.user_id = auth.uid()
    )
  );

create policy "agendamentos_insere" on public.agendamentos
  for insert with check (
    public.is_staff()
    or exists (
      select 1 from public.clientes_plano cp
      where cp.id = agendamentos.cliente_id and cp.user_id = auth.uid()
    )
  );

create policy "agendamentos_remove" on public.agendamentos
  for delete using (
    public.is_staff()
    or exists (
      select 1 from public.clientes_plano cp
      where cp.id = agendamentos.cliente_id and cp.user_id = auth.uid()
    )
  );

-- notificacoes: só equipe lê e marca como lida. Sem policy de insert —
-- só a RPC security definer escreve (ignora RLS por desenho).
create policy "notificacoes_equipe_ve" on public.notificacoes
  for select using (public.is_staff());

create policy "notificacoes_equipe_atualiza" on public.notificacoes
  for update using (public.is_staff());

-- lavagens: nova policy de delete — reverte de propósito a decisão "sem
-- delete" da migration inicial, a pedido explícito do cliente pra cobrir
-- lavagem registrada por engano ("Desmarcar lavagem").
create policy "lavagens_equipe_remove" on public.lavagens
  for delete using (public.is_staff());

-- equipe: cliente autenticado vê só quem optou por aparecer (nome, foto,
-- papel — nenhum dado sensível). Fica em paralelo às policies existentes
-- (equipe_ve_propria_linha, equipe_admin_ve_tudo), combinadas via OR.
create policy "equipe_clientes_veem_visiveis" on public.equipe
  for select using (foto_visivel_clientes = true and ativo = true);

-- ── storage: bucket de fotos de perfil ─────────────────────────────────
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatars_leitura_publica" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "avatars_dono_envia" on storage.objects
  for insert with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars_dono_atualiza" on storage.objects
  for update using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars_dono_remove" on storage.objects
  for delete using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
