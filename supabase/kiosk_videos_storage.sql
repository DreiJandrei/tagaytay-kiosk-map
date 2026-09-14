-- ============================================================
-- STORAGE PARA SA NA-UPLOAD NA VIDEO FILE
-- Patakbuhin sa Supabase → SQL Editor → New query.
-- Ligtas itong ulitin.
--
-- Ito ang kailangan kapag gusto mong mag-upload ng .mp4 mismo
-- imbes na mag-paste ng link — halimbawa kapag ayaw mag-embed
-- ng isang Facebook Reel.
-- ============================================================

-- Bukas sa publiko ang pagbasa dahil anonymous ang kiosk. Nakatakda
-- din ang limitasyon sa laki at uri ng file dito mismo, para hindi
-- makapag-upload ng maling bagay kahit magkamali ang admin.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'kiosk-videos',
  'kiosk-videos',
  true,
  52428800, -- 50 MB
  array['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
)
on conflict (id) do update set
  public             = excluded.public,
  file_size_limit    = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ── Sino ang may pahintulot ────────────────────────────────
-- Nakakabasa ang lahat (kailangan ito ng kiosk na walang login).
drop policy if exists "kiosk_videos_files_read" on storage.objects;
create policy "kiosk_videos_files_read"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'kiosk-videos');

-- Ang naka-login na admin lang ang makakapag-upload at makakabura.
drop policy if exists "kiosk_videos_files_insert" on storage.objects;
create policy "kiosk_videos_files_insert"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'kiosk-videos');

drop policy if exists "kiosk_videos_files_delete" on storage.objects;
create policy "kiosk_videos_files_delete"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'kiosk-videos');
