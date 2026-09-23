-- ============================================================
-- STORAGE PARA SA NA-UPLOAD NA VIDEO AT LARAWAN
--
-- ℹ️ Kung may bucket ka nang gawa noong video pa lang ang tinatanggap,
-- patakbuhin ulit ito: ang `on conflict do update` sa ibaba ang
-- magdaragdag ng mga uri ng larawan sa dati mong bucket.
--
-- ⚠️ BASAHIN MUNA: isang transaction ang buong query sa SQL Editor.
-- Kapag may isang statement na nabigo, binabawi ang LAHAT — pati ang
-- paggawa ng bucket. Kaya nakahiwalay ang policies sa ibaba sa loob ng
-- DO block na may exception handler: kahit tanggihan ang policies,
-- mananatili pa rin ang bucket.
--
-- Kung mabigo pa rin: gawin na lang sa Dashboard (Storage → New bucket).
-- Hindi lahat ng proyekto ay may pahintulot na baguhin ang
-- storage.objects mula sa SQL Editor.
-- ============================================================

-- ── 1. Ang bucket ──────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'kiosk-videos',
  'kiosk-videos',
  true,
  52428800, -- 50 MB
  -- Kasama ang larawan dito: iisang kahon lang sa welcome screen ang
  -- pinagsasaluhan ng video at ng larawan, kaya iisa rin ang bucket.
  -- Ang 10MB na hangganan ng larawan ay nasa admin — mas mahigpit iyon
  -- kaysa sa 50MB dito, at iyon ang unang makikita ng staff.
  array[
    'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
    'image/jpeg', 'image/png', 'image/webp'
  ]
)
on conflict (id) do update set
  public             = excluded.public,
  file_size_limit    = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ── 2. Sino ang may pahintulot ─────────────────────────────
-- Nakabalot sa DO block para hindi maapektuhan ang bucket sa itaas
-- kapag walang sapat na karapatan ang account sa storage.objects.
do $outer$
begin
  -- Nakakabasa ang lahat (kailangan ito ng kiosk na walang login).
  execute $p$ drop policy if exists "kiosk_videos_files_read" on storage.objects $p$;
  execute $p$
    create policy "kiosk_videos_files_read" on storage.objects
      for select to anon, authenticated
      using (bucket_id = 'kiosk-videos')
  $p$;

  -- Ang naka-login na admin lang ang makakapag-upload at makakabura.
  execute $p$ drop policy if exists "kiosk_videos_files_insert" on storage.objects $p$;
  execute $p$
    create policy "kiosk_videos_files_insert" on storage.objects
      for insert to authenticated
      with check (bucket_id = 'kiosk-videos')
  $p$;

  execute $p$ drop policy if exists "kiosk_videos_files_delete" on storage.objects $p$;
  execute $p$
    create policy "kiosk_videos_files_delete" on storage.objects
      for delete to authenticated
      using (bucket_id = 'kiosk-videos')
  $p$;

  raise notice 'OK: nagawa ang bucket at ang tatlong policy.';
exception when others then
  raise notice 'Nagawa ang bucket, PERO hindi ang policies (%). Gawin ang policies sa Dashboard → Storage → Policies.', sqlerrm;
end $outer$;

-- ── 3. Pagsusuri ───────────────────────────────────────────
-- Dapat may isang row na lumabas dito. Kung wala, hindi nagawa ang bucket.
select id, public, file_size_limit
from storage.buckets
where id = 'kiosk-videos';
