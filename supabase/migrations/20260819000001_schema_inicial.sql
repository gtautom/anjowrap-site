-- Painel do Plano Mensal de Lavagem — schema inicial.
--
-- Modelo de provisionamento: o cliente NÃO se cadastra sozinho. A equipe
-- cria o registro (nome+telefone) quando ele contrata pelo WhatsApp, e só
-- depois de confirmar manualmente o pagamento (o link do Asaas é único e
-- compartilhado entre todos os clientes — não dá pra saber quem pagou por
-- webhook) é que o acesso de login é criado, via Edge Function com
-- service_role (nunca pelo navegador do cliente).
--
-- Dois papéis de equipe: funcionario (vê clientes, registra lavagem) e
-- admin (tudo isso + cria acesso de outros membros da equipe).

-- ── equipe ──────────────────────────────────────────────────────────────
-- 1:1 com auth.users — só existe linha aqui pra quem tem acesso ao painel
-- interno. Criada exclusivamente pela Edge Function "criar-acesso-equipe"
-- (admin-only), nunca por insert direto do cliente.
create table public.equipe (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null,
  papel text not null check (papel in ('funcionario', 'admin')),
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

comment on table public.equipe is 'Membros da equipe com acesso ao painel interno. papel admin pode criar outros acessos.';

-- ── clientes_plano ──────────────────────────────────────────────────────
create table public.clientes_plano (
  id uuid primary key default gen_random_uuid(),
  -- Nulo até a equipe confirmar o pagamento e criar o acesso de login.
  user_id uuid references auth.users (id) on delete set null,
  nome text not null,
  telefone text not null unique,
  email text,
  -- pendente: cadastrado, aguardando confirmação do 1º pagamento.
  -- contratado: já teve pelo menos um ciclo confirmado (ativo ou expirado
  -- se depender só de status — o estado "ativo vs expirado" na prática é
  -- derivado de data_expiracao nas telas, não fica solto num campo que
  -- pode ficar desatualizado sem um job rodando).
  status text not null default 'pendente' check (status in ('pendente', 'contratado')),
  data_inicio date,
  data_expiracao date,
  lavagens_usadas int not null default 0,
  criado_por uuid references public.equipe (id),
  confirmado_por uuid references public.equipe (id),
  confirmado_em timestamptz,
  criado_em timestamptz not null default now()
);

comment on table public.clientes_plano is 'Clientes do Plano Mensal de Lavagem. Estado ativo/expirado é derivado de data_expiracao nas consultas, não armazenado.';
comment on column public.clientes_plano.status is 'pendente = cadastrado, aguardando 1a confirmação de pagamento. contratado = já teve pelo menos um ciclo confirmado.';

-- ── lavagens ────────────────────────────────────────────────────────────
-- Histórico imutável — sem policy de update/delete de propósito.
create table public.lavagens (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes_plano (id) on delete cascade,
  data timestamptz not null default now(),
  registrado_por uuid not null references public.equipe (id)
);

comment on table public.lavagens is 'Histórico de lavagens registradas pela equipe. Append-only.';

create index lavagens_cliente_id_idx on public.lavagens (cliente_id);
create index clientes_plano_user_id_idx on public.clientes_plano (user_id);

-- ── helpers de RLS ──────────────────────────────────────────────────────
-- security definer: consultam public.equipe ignorando a RLS da própria
-- tabela equipe, senão a policy de equipe entraria em recursão consigo
-- mesma ao ser avaliada.
create or replace function public.is_staff()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.equipe
    where id = auth.uid() and ativo = true
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.equipe
    where id = auth.uid() and ativo = true and papel = 'admin'
  );
$$;

-- ── reset automático de lavagens na renovação ──────────────────────────
-- Toda vez que data_inicio muda (equipe confirma um novo ciclo, seja a
-- 1a contratação ou uma renovação), lavagens_usadas volta a 0 dentro da
-- mesma transação — não depende de nenhuma tela lembrar de fazer isso.
create or replace function public.resetar_lavagens_na_renovacao()
returns trigger
language plpgsql
as $$
begin
  if new.data_inicio is distinct from old.data_inicio then
    new.lavagens_usadas := 0;
  end if;
  return new;
end;
$$;

create trigger trg_resetar_lavagens
  before update on public.clientes_plano
  for each row
  execute function public.resetar_lavagens_na_renovacao();

-- ── RLS ─────────────────────────────────────────────────────────────────
alter table public.equipe enable row level security;
alter table public.clientes_plano enable row level security;
alter table public.lavagens enable row level security;

-- equipe: cada um vê a própria linha (pra saber o próprio papel);
-- admin vê todo mundo. Update só admin (ativar/desativar, trocar papel).
-- Sem policy de insert: só a Edge Function (service_role) cria linha aqui.
create policy "equipe_ve_propria_linha" on public.equipe
  for select using (auth.uid() = id);

create policy "equipe_admin_ve_tudo" on public.equipe
  for select using (public.is_admin());

create policy "equipe_admin_atualiza" on public.equipe
  for update using (public.is_admin());

-- clientes_plano: cliente vê só a própria linha; equipe (qualquer papel)
-- vê, cria e atualiza qualquer cliente. Sem policy de delete — cliente
-- não some do histórico, o máximo é ficar com o ciclo expirado.
create policy "clientes_cliente_ve_propria_linha" on public.clientes_plano
  for select using (auth.uid() = user_id);

create policy "clientes_equipe_ve_tudo" on public.clientes_plano
  for select using (public.is_staff());

create policy "clientes_equipe_insere" on public.clientes_plano
  for insert with check (public.is_staff());

create policy "clientes_equipe_atualiza" on public.clientes_plano
  for update using (public.is_staff());

-- lavagens: cliente vê as próprias (via join em clientes_plano); equipe
-- vê tudo e insere (registrar lavagem). Sem update/delete — histórico
-- imutável por desenho.
create policy "lavagens_cliente_ve_proprias" on public.lavagens
  for select using (
    exists (
      select 1 from public.clientes_plano cp
      where cp.id = lavagens.cliente_id and cp.user_id = auth.uid()
    )
  );

create policy "lavagens_equipe_ve_tudo" on public.lavagens
  for select using (public.is_staff());

create policy "lavagens_equipe_insere" on public.lavagens
  for insert with check (public.is_staff() and registrado_por = auth.uid());
