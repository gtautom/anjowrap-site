-- A policy de select de `agendamentos` só deixa cada cliente ver os
-- próprios horários (por desenho — não deveria dar pra ver o nome de quem
-- marcou onde). Só que pra montar o calendário o cliente precisa saber
-- QUAIS horários já estão ocupados, mesmo sem saber por quem.
--
-- View sem cliente_id, sem RLS própria — dona é o mesmo role que já tem
-- acesso irrestrito à tabela por trás (comportamento padrão de view no
-- Postgres 15+: roda com o privilégio de quem criou, não de quem consulta).
create view public.horarios_ocupados as
select data, hora from public.agendamentos;

grant select on public.horarios_ocupados to authenticated;
