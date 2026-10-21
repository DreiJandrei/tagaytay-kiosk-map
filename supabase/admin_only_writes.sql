-- ============================================================
-- ADMIN LANG ANG MAKAKAPAG-EDIT
-- Patakbuhin sa Supabase → SQL Editor → New query → Run.
-- Ligtas itong ulitin.
--
-- BAKIT: Ang anon key ay nasa JavaScript ng website — nababasa ng
-- kahit sino. Kaya hindi ang login screen ang tunay na kandado, kundi
-- ang mga patakaran dito sa database. Bago ito, nagsusulat ang kiosk sa
-- `offices` nang walang login (para sa search count), kaya bukas ang
-- table na iyon sa pagbabago ng kahit sinong may anon key.
--
-- PAGKATAPOS NITO:
--   • Pagbasa — lahat (kiosk, telepono ng bisita). Walang nagbago.
--   • Pagsulat — ang tagaytaykiosk@gmail.com LANG. Hindi kasama ang
--     tagaytaykiosk+device@gmail.com (ang login ng kiosk mismo), at
--     hindi rin ang kahit sinong ibang naka-login.
--   • Search count — +1 lang, sa pamamagitan ng function sa ibaba, at
--     ang naka-login na kiosk o admin lang ang makakatawag.
--
-- ⚠️ BINUBURA nito ang LAHAT ng dating policy sa apat na table sa ibaba
-- at pinapalitan ng nasa file na ito. Kung patatakbuhin ulit ang
-- kiosk_videos.sql o kiosk_videos_storage.sql, patakbuhin ULIT ito
-- pagkatapos — ibinabalik ng mga iyon ang lumang "kahit sinong
-- naka-login" na policy.
-- ============================================================

-- ── 1. Sino ang admin ──────────────────────────────────────
-- Ang email sa token ng naka-login. Hindi ito kayang pekein: pinirmahan
-- ng Supabase ang token.
create or replace function public.is_kiosk_admin()
returns boolean
language sql
stable
as $$
  select coalesce(lower(auth.jwt() ->> 'email'), '') = 'tagaytaykiosk@gmail.com';
$$;

-- ── 2. +1 sa search count ──────────────────────────────────
-- `security definer`: tumatakbo ito bilang may-ari ng function, kaya
-- kaya nitong baguhin ang `offices` kahit sarado na iyon sa kiosk. Pero
-- isang bagay lang ang kaya nito: magdagdag ng isa.
create or replace function public.increment_search_count(p_office_key text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(lower(auth.jwt() ->> 'email'), '') not in (
    'tagaytaykiosk+device@gmail.com',
    'tagaytaykiosk@gmail.com'
  ) then
    raise exception 'Hindi pinapayagan' using errcode = '42501';
  end if;

  update public.offices
     set search_count = coalesce(search_count, 0) + 1
   where office_key = p_office_key;
end;
$$;

revoke all on function public.increment_search_count(text) from public, anon;
grant execute on function public.increment_search_count(text) to authenticated;

-- ── 3. Ang mga table ───────────────────────────────────────
do $$
declare
  t text;
  p record;
begin
  foreach t in array array['offices', 'office_details', 'kiosks_announcements', 'kiosk_videos'] loop
    if to_regclass('public.' || t) is null then
      raise notice 'Walang table na %, nilaktawan.', t;
      continue;
    end if;

    execute format('alter table public.%I enable row level security', t);

    -- Burahin ang lahat ng dati — hindi natin alam kung ano ang mga
    -- ginawa noon sa Dashboard. Ang nasa ibaba lang ang matitira.
    for p in
      select policyname from pg_policies where schemaname = 'public' and tablename = t
    loop
      execute format('drop policy %I on public.%I', p.policyname, t);
    end loop;

    -- Pagbasa: lahat. Sa video, ang naka-off ay sa admin lang.
    if t = 'kiosk_videos' then
      execute format(
        'create policy "public_read" on public.%I for select to anon, authenticated '
        'using (is_active = true or public.is_kiosk_admin())', t);
    else
      execute format(
        'create policy "public_read" on public.%I for select to anon, authenticated using (true)', t);
    end if;

    -- Pagsulat: admin lang.
    execute format(
      'create policy "admin_insert" on public.%I for insert to authenticated '
      'with check (public.is_kiosk_admin())', t);
    execute format(
      'create policy "admin_update" on public.%I for update to authenticated '
      'using (public.is_kiosk_admin()) with check (public.is_kiosk_admin())', t);
    execute format(
      'create policy "admin_delete" on public.%I for delete to authenticated '
      'using (public.is_kiosk_admin())', t);

    -- Pangalawang harang: wala nang karapatang magsulat ang anon kahit
    -- may magkamali sa policy balang araw.
    execute format('revoke insert, update, delete on public.%I from anon', t);
  end loop;
end $$;

-- ── 4. Storage (na-upload na video at larawan) ─────────────
do $outer$
begin
  execute $p$ drop policy if exists "kiosk_videos_files_insert" on storage.objects $p$;
  execute $p$
    create policy "kiosk_videos_files_insert" on storage.objects
      for insert to authenticated
      with check (bucket_id = 'kiosk-videos' and public.is_kiosk_admin())
  $p$;

  execute $p$ drop policy if exists "kiosk_videos_files_delete" on storage.objects $p$;
  execute $p$
    create policy "kiosk_videos_files_delete" on storage.objects
      for delete to authenticated
      using (bucket_id = 'kiosk-videos' and public.is_kiosk_admin())
  $p$;

  raise notice 'OK: admin lang ang makakapag-upload at makakabura ng file.';
exception when others then
  raise notice 'HINDI nabago ang storage policies (%). Gawin sa Dashboard → Storage → Policies.', sqlerrm;
end $outer$;

notify pgrst, 'reload schema';

-- ── 5. Pagsusuri ───────────────────────────────────────────
-- Dapat apat na policy bawat table: public_read, admin_insert,
-- admin_update, admin_delete.
select tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public'
  and tablename in ('offices', 'office_details', 'kiosks_announcements', 'kiosk_videos')
order by tablename, policyname;
