-- ============================================================
-- DAGDAG NA HARANG SA DATABASE
-- Patakbuhin sa Supabase → SQL Editor → New query → Run,
-- PAGKATAPOS ng admin_only_writes.sql. Ligtas itong ulitin.
--
-- Hindi nito binabago kung sino ang nakakabasa o nakakapag-edit —
-- iyon pa rin ang nasa admin_only_writes.sql. Ang tinatakpan nito ay
-- ang mga butas sa paligid niyon:
--
--   1. Bawat table sa `public` ay may RLS, pati ang mga gagawin pa o
--      ginawa noon sa Dashboard na hindi natin alam. Ang table na
--      walang RLS ay bukas sa kahit sinong may anon key.
--   2. Walang karapatang magsulat ang anon kahit saan, at hindi na
--      awtomatikong ibibigay iyon sa mga table na gagawin pa.
--   3. Https lang ang tinatanggap na link ng video/larawan.
--   4. Nakapako ang search_path ng is_kiosk_admin().
--
-- Sa dulo, may pagsusuri: dapat WALANG row ang unang dalawang resulta.
-- ============================================================

-- ── 1 at 2. RLS at karapatan sa bawat table ─────────────────
-- Ang table na walang policy pagkatapos nito ay sarado sa lahat
-- (maliban sa Dashboard). Apat lang ang ginagamit ng app — offices,
-- office_details, kiosks_announcements, kiosk_videos — at may policy
-- na ang mga iyon mula sa admin_only_writes.sql.
do $$
declare
  r record;
begin
  for r in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', r.tablename);
    execute format(
      'revoke insert, update, delete, truncate, references, trigger on public.%I from anon', r.tablename);
    -- Hindi dumadaan sa RLS ang TRUNCATE. Walang gamit iyon sa app.
    execute format(
      'revoke truncate, references, trigger on public.%I from authenticated', r.tablename);
  end loop;
end $$;

revoke usage, update on all sequences in schema public from anon;

-- Para sa mga table na gagawin pa: hindi na sila isisilang na
-- puwedeng sulatan ng anon.
alter default privileges in schema public
  revoke insert, update, delete, truncate, references, trigger on tables from anon;
alter default privileges in schema public
  revoke truncate, references, trigger on tables from authenticated;
alter default privileges in schema public
  revoke usage, update on sequences from anon;

-- ── 3. Https lang sa link ng video at larawan ──────────────
-- NOT VALID: hindi sinusuri ang mga nakatala na; ang bagong pag-save
-- lang. Ganito rin ang tsek sa Admin Panel (validateVideoUrl).
do $$
begin
  if to_regclass('public.kiosk_videos') is not null then
    alter table public.kiosk_videos drop constraint if exists kiosk_videos_source_url_https;
    alter table public.kiosk_videos
      add constraint kiosk_videos_source_url_https
      check (source_url ~* '^https://') not valid;
  end if;
end $$;

-- ── 4. is_kiosk_admin() na may nakapakong search_path ───────
-- Parehong laman ng nasa admin_only_writes.sql. Walang tinatawag na
-- table dito, kaya puwedeng blangko ang search_path.
create or replace function public.is_kiosk_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce(lower(auth.jwt() ->> 'email'), '') = 'tagaytaykiosk@gmail.com';
$$;

notify pgrst, 'reload schema';

-- ── 5. Pagsusuri ───────────────────────────────────────────
-- A. Mga table na WALANG RLS. Dapat walang lumabas.
select 'WALANG RLS' as problema, c.relname as table_name
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind in ('r', 'p') and not c.relrowsecurity;

-- B. Mga table na kayang sulatan ng anon. Dapat walang lumabas.
select 'ANON PUWEDENG MAGSULAT' as problema, table_name, privilege_type
from information_schema.role_table_grants
where table_schema = 'public' and grantee = 'anon'
  and privilege_type in ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE');

-- C. Lahat ng policy sa storage. Para sa bucket na kiosk-videos, dapat
--    `kiosk_videos_files_read` (select), `_insert` at `_delete` lang —
--    may is_kiosk_admin() ang huling dalawa. Kapag may UPDATE na policy
--    para sa bucket na iyon, burahin sa Dashboard → Storage → Policies.
select policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'storage' and tablename = 'objects'
order by policyname;
