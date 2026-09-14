-- ============================================================
-- WELCOME SCREEN VIDEOS
-- Patakbuhin ito nang isang beses sa Supabase → SQL Editor → New query.
-- Ligtas itong ulitin: gumagamit ng IF NOT EXISTS / DROP POLICY IF EXISTS.
-- ============================================================

create table if not exists public.kiosk_videos (
  id               bigint generated always as identity primary key,
  title            text        not null default '',
  caption          text        not null default '',
  source_url       text        not null,
  -- 'facebook' | 'youtube' | 'file'
  video_type       text        not null default 'facebook',
  -- Ilang segundo bago lumipat sa susunod na video. Hindi ginagamit sa
  -- 'file' — hinihintay doon ang tunay na dulo ng video.
  duration_seconds integer     not null default 45,
  sort_order       integer     not null default 0,
  is_active        boolean     not null default true,
  created_at       timestamptz not null default now(),

  constraint kiosk_videos_type_check
    check (video_type in ('facebook', 'youtube', 'file')),
  constraint kiosk_videos_duration_check
    check (duration_seconds between 5 and 600)
);

-- Ito ang eksaktong pagkakasunod-sunod na hinihingi ng welcome screen.
create index if not exists kiosk_videos_order_idx
  on public.kiosk_videos (is_active, sort_order, id);

-- ── Row Level Security ─────────────────────────────────────
alter table public.kiosk_videos enable row level security;

-- Nakabukas ang pagbasa: anonymous ang kiosk, walang naka-login doon.
drop policy if exists "kiosk_videos_public_read" on public.kiosk_videos;
create policy "kiosk_videos_public_read"
  on public.kiosk_videos
  for select
  to anon, authenticated
  using (is_active = true);

-- Nakikita ng naka-login na admin pati ang naka-off na video.
drop policy if exists "kiosk_videos_admin_read_all" on public.kiosk_videos;
create policy "kiosk_videos_admin_read_all"
  on public.kiosk_videos
  for select
  to authenticated
  using (true);

-- Ang naka-login na admin lang ang makakapagbago.
drop policy if exists "kiosk_videos_admin_insert" on public.kiosk_videos;
create policy "kiosk_videos_admin_insert"
  on public.kiosk_videos
  for insert
  to authenticated
  with check (true);

drop policy if exists "kiosk_videos_admin_update" on public.kiosk_videos;
create policy "kiosk_videos_admin_update"
  on public.kiosk_videos
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "kiosk_videos_admin_delete" on public.kiosk_videos;
create policy "kiosk_videos_admin_delete"
  on public.kiosk_videos
  for delete
  to authenticated
  using (true);
