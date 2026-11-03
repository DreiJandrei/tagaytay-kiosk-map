-- ============================================================
-- PAGBABAGO NG NOBYEMBRE 2026
-- Patakbuhin sa Supabase → SQL Editor → New query → Run.
-- Ligtas itong ulitin.
--
--   1. Mga kwartong wala pa sa database, kasama ang Info Desk at Guard
--      Post — ito ang dahilan ng "Database error" sa pag-edit sa kanila.
--   2. Hanay para sa iskedyul ng video/larawan at ng status.
--   3. Paglilinis ng pangalan at detalye ayon sa bagong mapa.
--
-- Walang binubura. Ang mga kwartong wala na sa mapa (bldg-official sa 2nd
-- Floor) ay naiiwan sa table pero hindi na lumalabas sa kiosk.
-- ============================================================

-- ── 1. Mga bagong kwarto ───────────────────────────────────
insert into public.offices (office_key, floor, title, location, css_class, search_count) values
  ('info-desk',    1, 'INFORMATION DESK', '1st Floor - Main Lobby (Left of Entrance)',  'theme-blue',   0),
  ('guard',        1, 'GUARD POST',       '1st Floor - Main Entrance (Right Side)',     'theme-indigo', 0),
  ('control-unit', 1, 'CONTROL UNIT',     '1st Floor - East Wing Utilities',            'theme-cyan',   0),
  ('zoning',       2, 'ZONING OFFICE',    '2nd Floor - East',                           '',             0),
  ('waiting-area', 7, 'WAITING AREA',     '7th Floor',                                  '',             0)
on conflict (office_key) do nothing;

-- Hindi pinapalitan ang nailagay na ng admin — kung saan wala pa lang.
insert into public.office_information (office_key, head, hours, status, requirements, description, phone, "local") values
  ('info-desk', 'Mr. Jun D. Dolot', '8:00 AM - 5:00 PM (Mon-Fri)', 'Available', '{}',
   'The Information Desk is the first stop for visitors entering City Hall. Staff here direct the public to the correct office or floor, answer general questions about city services and requirements, maintain the visitor logbook, and assist senior citizens, persons with disabilities, and first-time visitors.',
   '(046) 483-9372', '100'),
  ('guard', 'Civil Security Unit', 'Open 24/7', 'Available', '{}',
   'The Guard Post at the main entrance is where visitors are received and logged before entering City Hall. The guards on duty check identification, issue visitor passes, give basic directions, and keep watch over the entrance around the clock.',
   '', ''),
  ('control-unit', '', '8:00 AM - 5:00 PM', 'Available', '{}', '', '', ''),
  ('zoning', 'Ms. Celsa Manalo', '8:00 AM - 5:00 PM', 'Available', '{}', '', '(046) 483-9373', ''),
  ('waiting-area', '', '8:00 AM - 5:00 PM', 'Available', '{}', '', '', '')
on conflict (office_key) do nothing;

-- ── 2. Hanay ng iskedyul ───────────────────────────────────
alter table public.announcement_media
  add column if not exists starts_at timestamptz,
  add column if not exists ends_at   timestamptz;

alter table public.office_information
  add column if not exists status_from  timestamptz,
  add column if not exists status_until timestamptz,
  -- Walang Tagalog na paliwanag na isinasama rito (nasa office_about_tl.sql
  -- iyon). Kailangan lang ang hanay para hindi magbabala ang bawat pag-save.
  add column if not exists description_tl text;

-- ── 3. Paglilinis ──────────────────────────────────────────
update public.offices set title = 'UNDER CONSTRUCTION' where title like '%UNDER CONSTRUCTION%';
update public.offices set title = 'CITY TREASURER OFFICE' where title = 'CITY TREASURE OFFICE';

-- Character's Office na ang kwarto sa kanluran ng 3rd Floor. Dating sa Building
-- Official ang key na ito, kaya mali na ang natirang detalye para rito.
update public.offices set title = 'CHARACTER''S OFFICE' where office_key = 'building-official';
update public.office_information
   set head = '', description = ''
 where office_key = 'building-official' and head = 'Building Official';

notify pgrst, 'reload schema';

-- ── 4. Pagsusuri ───────────────────────────────────────────
-- Dapat limang row, lahat ay may head na hindi NULL.
select o.office_key, o.floor, o.title, d.head
from public.offices o
left join public.office_information d using (office_key)
where o.office_key in ('info-desk', 'guard', 'control-unit', 'zoning', 'waiting-area')
order by o.floor, o.office_key;

-- Dapat apat na hanay ang lumabas.
select table_name, column_name
from information_schema.columns
where table_schema = 'public'
  and column_name in ('starts_at', 'ends_at', 'status_from', 'status_until');
