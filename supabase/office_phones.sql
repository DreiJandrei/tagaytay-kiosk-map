-- ════════════════════════════════════════════════════════════════
-- TELEPONO NG BAWAT TANGGAPAN — NAILILIPAT SA DATABASE
-- ════════════════════════════════════════════════════════════════
-- Dati, sa defaultOfficeData.js lang nakatira ang `phone` at `local`,
-- at sinasabi mismo ng office_heads.sql na walang hanay para doon sa
-- office_details. Kaya hindi ito mapalitan ng admin: kailangan pang
-- may humawak ng code tuwing may bagong numero ang isang tanggapan.
--
-- Ito ang nagbubukas niyon. Patakbuhin sa Supabase → SQL Editor →
-- New query → Run. Ligtas itong ulit-ulitin.
--
-- Pagkatapos nito, ang admin panel na ang paraan ng pagpapalit ng
-- numero — hindi na kailangang galawin ang code.
-- ════════════════════════════════════════════════════════════════

-- ── 1. Ang dalawang bagong hanay ────────────────────────────────
-- Teksto, hindi numero: may panaklong, gitling at puwang ang mga
-- numero rito — "(046) 483-9372" — at ang local ay pantukoy, hindi
-- bilang na pinag-aaritmetika.
alter table public.office_details add column if not exists phone text;
alter table public.office_details add column if not exists "local" text;

-- ── 2. Ang mga numerong kasalukuyang nasa defaultOfficeData.js ──
-- Inilipat dito para ang database na ang pinagmumulan. Ang NULL ang
-- ibig sabihing "hindi pa nagagalaw" — doon, ang nasa code pa rin ang
-- lumalabas sa kiosk (tingnan ang getAllOffices sa src/lib/api.js).
-- Kaya kailangang tumpak ang paglilipat na ito: kapag may nakaligtaan,
-- hindi ito mawawala sa kiosk — mananatili lang itong nasa code.

-- Ground floor
update office_details set phone = '(046) 483-9372', "local" = '106'  where office_key = 'pio-1';
update office_details set phone = '(046) 483-9372', "local" = '106'  where office_key = 'pio-2';
update office_details set phone = '(046) 483-9370'                   where office_key = 'csu-office';
update office_details set phone = '(046) 483-9372'                   where office_key = 'barangay-affairs';
update office_details set phone = '(046) 483-9372'                   where office_key = 'tourism-office';
update office_details set phone = '(046) 483-9372', "local" = '100'  where office_key = 'info-desk';

-- Ika-2 palapag
update office_details set phone = '(046) 483-9374'                   where office_key = 'city-eng';
update office_details set phone = '(046) 483-9370', "local" = '207'  where office_key = 'housing';
update office_details set phone = '(046) 483-9376', "local" = '206'  where office_key = 'bac';
update office_details set phone = '(046) 483-9373'                   where office_key = 'planning';

-- Ika-3 palapag
update office_details set phone = '(046) 483-9375'                   where office_key = 'budget-office';
update office_details set phone = '(046) 483-9375'                   where office_key = 'internal-audit';
update office_details set phone = '(046) 483-9377'                   where office_key = 'treasure-office';
update office_details set phone = '(046) 483-9376', "local" = '300'  where office_key = 'accounting-office';

-- Ika-5 palapag
update office_details set phone = '(046) 483-9370'                   where office_key = 'legal-office';
update office_details set phone = '(046) 483-9370', "local" = '506'  where office_key = 'hr-office';
update office_details set phone = '(046) 483-9371'                   where office_key = 'admin-office';

-- Ika-7 palapag
update office_details set phone = '(046) 483-9379', "local" = '702'  where office_key = 'mayor-main';
update office_details set phone = '(046) 483-9378'                   where office_key = 'mayor-receiving';

-- ── 3. Pagtingin kung tumama ────────────────────────────────────
-- Labing-siyam ang inaasahan. Kulang kung wala pang hanay sa
-- office_details ang ilang tanggapan (hal. info-desk) — hindi iyon
-- sira: sa code pa rin kinukuha ang numero nila hanggang may mag-save
-- sa kanila mula sa admin panel.
-- select office_key, phone, "local" from office_details
--  where phone is not null order by office_key;
