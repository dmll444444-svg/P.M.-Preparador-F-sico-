-- Programa Preparador Físico · Supabase schema v1
-- Ejecuta este SQL en Supabase > SQL Editor.

create table if not exists public.app_state (
  key text primary key,
  value jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.app_state enable row level security;

-- POLÍTICAS ABIERTAS PARA PRUEBAS.
-- Importante: esto permite leer y escribir el estado de la app con la anon key.
-- Úsalo solo para pruebas. Para producción hay que implementar Supabase Auth + RLS por usuario/rol.

drop policy if exists "ppf_app_state_select_test" on public.app_state;
drop policy if exists "ppf_app_state_insert_test" on public.app_state;
drop policy if exists "ppf_app_state_update_test" on public.app_state;
drop policy if exists "ppf_app_state_delete_test" on public.app_state;

create policy "ppf_app_state_select_test"
on public.app_state
for select
to anon
using (true);

create policy "ppf_app_state_insert_test"
on public.app_state
for insert
to anon
with check (true);

create policy "ppf_app_state_update_test"
on public.app_state
for update
to anon
using (true)
with check (true);

create policy "ppf_app_state_delete_test"
on public.app_state
for delete
to anon
using (true);
