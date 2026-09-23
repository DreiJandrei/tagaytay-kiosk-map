-- ============================================================
-- WELCOME SCREEN VIDEOS AT LARAWAN
-- Patakbuhin ito nang isang beses sa Supabase → SQL Editor → New query.
-- Ligtas itong ulitin: gumagamit ng IF NOT EXISTS / DROP POLICY IF EXISTS.
-- ============================================================

create table if not exists public.kiosk_videos (
  id               bigint generated always as identity primary key,
  title            text        not null default '',
  caption          text        not null default '',
  source_url       text        not null,
  -- 'facebook' | 'youtube' | 'file' | 'image'
  video_type       text        not null default 'facebook',
  -- Ilang segundo bago lumipat sa susunod. Hindi ginagamit sa 'file' —
  -- hinihintay doon ang tunay na dulo ng video. Sa 'image', ito mismo
  -- ang tagal ng larawan sa screen: wala itong sariling dulo.
  duration_seconds integer     not null default 45,
  sort_order       integer     not null default 0,
  is_active        boolean     not null default true,
  -- Patayo ang Reels at TikTok-style na video (9:16). Kung 16:9 ang
  -- kahon, puro itim na gilid ang lalabas sa kiosk.
  orientation      text        not null default 'landscape',
  -- Gusto bang may tunog. Tahimik pa rin hangga't walang unang pindot
  -- sa screen — patakaran ito ng browser, hindi kaya nitong laktawan.
  has_sound        boolean     not null default false,
  created_at       timestamptz not null default now(),

  constraint kiosk_videos_type_check
    check (video_type in ('facebook', 'youtube', 'file', 'image')),
  constraint kiosk_videos_duration_check
    check (duration_seconds between 5 and 600),
  constraint kiosk_videos_orientation_check
    check (orientation in ('landscape', 'portrait'))
);

-- Para sa table na nagawa na bago naidagdag ang mga column na ito.
alter table public.kiosk_videos
  add column if not exists orientation text not null default 'landscape';

-- Ang lumang check ay tatlong uri lang ang kilala, kaya tatanggihan nito
-- ang unang larawan na ise-save ng admin. Ibinabagsak muna ang luma bago
-- ilagay ang bagong bersyon — hindi kasi puwedeng baguhin ang isang
-- check constraint nang hindi ito inaalis.
alter table public.kiosk_videos
  drop constraint if exists kiosk_videos_type_check;

alter table public.kiosk_videos
  add constraint kiosk_videos_type_check
  check (video_type in ('facebook', 'youtube', 'file', 'image'));

-- Hinaharangan ng browser ang tunog hangga't walang pumipindot sa screen,
-- kaya laging nagsisimulang tahimik ang video. Senyas lang ito ng gusto
-- ng admin — hindi garantiya na may tunog agad.
alter table public.kiosk_videos
  add column if not exists has_sound boolean not null default false;

do $$
begin
  alter table public.kiosk_videos
    add constraint kiosk_videos_orientation_check
    check (orientation in ('landscape', 'portrait'));
exception
  when duplicate_object then null;
end $$;

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
