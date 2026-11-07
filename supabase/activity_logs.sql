-- ============================================================
-- ACTIVITY LOGS — talaan ng bawat pagbabago sa Admin Panel
-- Patakbuhin sa Supabase → SQL Editor → New query → Run.
-- Ligtas itong ulitin.
--
-- Ang admin lang ang nakakabasa at nakakasulat. Walang UPDATE o DELETE
-- na policy: hindi na mabubura o mababago ang naitala na, kahit ng admin
-- mula sa website. (Sa Supabase dashboard lang ito puwedeng linisin.)
--
-- Ang database mismo ang naglalagay ng oras at ng email ng nag-edit
-- (trigger sa ibaba), hindi ang website — kaya hindi ito mapepeke.
-- ============================================================

create table if not exists public.activity_logs (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  actor_email text,
  action      text not null,   -- hal. 'office.update', 'lift.update', 'video.delete'
  target      text,            -- ang pangalang makikita ng tao, hal. 'CITY TREASURER OFFICE'
  details     jsonb not null default '{}'::jsonb
);

create index if not exists activity_logs_created_at_idx
  on public.activity_logs (created_at desc);

-- ── Oras at email: galing sa database, hindi sa website ────
create or replace function public.activity_logs_stamp()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.created_at := now();
  new.actor_email := auth.jwt() ->> 'email';
  return new;
end;
$$;

drop trigger if exists activity_logs_stamp on public.activity_logs;
create trigger activity_logs_stamp
  before insert on public.activity_logs
  for each row execute function public.activity_logs_stamp();

-- ── RLS: admin lang ────────────────────────────────────────
alter table public.activity_logs enable row level security;
revoke all on public.activity_logs from anon;
revoke update, delete, truncate on public.activity_logs from authenticated;
grant select, insert on public.activity_logs to authenticated;

drop policy if exists "admin_read" on public.activity_logs;
create policy "admin_read" on public.activity_logs
  for select to authenticated using (public.is_kiosk_admin());

drop policy if exists "admin_insert" on public.activity_logs;
create policy "admin_insert" on public.activity_logs
  for insert to authenticated with check (public.is_kiosk_admin());

notify pgrst, 'reload schema';

-- ── Pagsusuri ──────────────────────────────────────────────
-- Dapat dalawang policy ang lumabas: admin_read at admin_insert.
select policyname, cmd
from pg_policies
where schemaname = 'public' and tablename = 'activity_logs'
order by policyname;
