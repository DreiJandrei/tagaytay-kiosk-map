-- ════════════════════════════════════════════════════════════════
-- CONTACT PERSON AT TELEPONO — BUONG LISTAHAN SA ISANG TAKBO
-- ════════════════════════════════════════════════════════════════
-- Pinagmulan: office-info.pdf (direktoryo ng tanggapan kada palapag),
-- ibinigay 2026-10-05. Ito ang kapalit ng manu-manong pag-type sa
-- admin panel: isang takbo rito at pareho na ang kiosk at ang PDF.
--
-- Patakbuhin sa Supabase → SQL Editor → New query → Run. Ligtas itong
-- ulit-ulitin — `head`, `phone` at `local` lang ang ginagalaw, at bawat
-- linya ay nakatali sa office_key.
--
-- KAILANGAN MUNANG NAPATAKBO ANG office_phones.sql — doon idinadagdag
-- ang mga hanay na `phone` at `local`. Kapag hindi pa, babagsak ito.
--
--
-- ⚠️  BINABAWI NITO ANG office_contacts_charter.sql
-- ────────────────────────────────────────────────────────────────
-- Labintatlong tanggapan ang pinalitan noon ng (046) 888-9500 + local
-- mula sa Citizen's Charter 2025. Ang PDF ay 483-93xx — ang dating
-- numero ng kiosk. Ang PDF ang sinusunod dito; napagpasyahan ito
-- 2026-10-05. Kaya nakasulat ang `local` sa BAWAT linya sa ibaba,
-- pati ang mga NULL: ang local ng charter (307, 312, 105 …) ay kasama
-- ng 888-9500, kaya mali itong isabay sa 483-93xx. Ang pagsulat ng
-- NULL ang naglilinis sa kanila.
--
-- Kapag muling ang charter ang napagtibay, ang office_contacts_charter.sql
-- ang patakbuhin — hindi ito.
--
--
-- HINDI KASAMA, WALANG SILID SA MAPA
-- ────────────────────────────────────────────────────────────────
--   Zoning Office    — Ms. Celsa Manalo, (046) 483-9373, ika-2 palapag
--   Character Office — walang contact sa PDF, ika-3 palapag
-- Walang office_key at walang coordinates ang dalawang ito, kaya walang
-- maituturong silid ang kiosk para sa kanila. Kailangan munang maipuwesto
-- sa mapa bago sila bigyan ng contact card.
--
-- Walang contact sa PDF ang Tolentino Hall, Cultural Hall, Conference
-- Hall at Wedding Hall — paliwanag lang ang mayroon sila, at nasa
-- office_heads.sql na iyon. Hindi sila ginagalaw dito.
-- ════════════════════════════════════════════════════════════════


-- ── Ground floor ────────────────────────────────────────────────
update office_details set head = 'Mr. Jun D. Dolot',      phone = '(046) 483-9372', "local" = '100'  where office_key = 'info-desk';
update office_details set head = 'Ms. Sonia S. Mendoza',  phone = '(046) 483-9372', "local" = '106'  where office_key = 'pio-1';
update office_details set head = 'Staff',                 phone = '(046) 483-9372', "local" = '106'  where office_key = 'pio-2';
update office_details set head = 'Ms. Faith Maranan',     phone = '(046) 483-9372', "local" = null   where office_key = 'tourism-office';
update office_details set head = 'Mr. Edwin Borja',       phone = '(046) 483-9372', "local" = null   where office_key = 'barangay-affairs';
update office_details set head = 'Mr. Jimmy M. Quito',    phone = '(046) 483-9370', "local" = null   where office_key = 'csu-office';

-- ── Ika-2 palapag ───────────────────────────────────────────────
update office_details set                                 phone = '(046) 483-9373', "local" = null   where office_key = 'planning';
update office_details set                                 phone = '(046) 483-9374', "local" = null   where office_key = 'city-eng';
update office_details set head = 'Ms. Mabel Perea',       phone = '(046) 483-9370', "local" = '207'  where office_key = 'housing';
update office_details set head = 'Staff',                 phone = '(046) 483-9376', "local" = '206'  where office_key = 'bac';

-- Hindi ko ginalaw ang pangalan sa dalawang tanggapan sa itaas. Ganito
-- sila ngayon sa database, mula sa charter:
--
--     planning   Engr. Emilma U. Pello     (sa PDF: Engr. Emma Pello)
--     city-eng   Engr. Noel C. Baybay      (sa PDF: Mr. Noel Baybay)
--
-- IISANG TAO LANG SILA sa magkabila — buo lang ang pangalan at titulo
-- sa charter, kaya pag-urong sa mas kulang na baybay ang pagbabalik.
-- Alisin ang dalawang gitling sa ibaba kung ang PDF talaga ang gusto.
-- update office_details set head = 'Engr. Emma Pello' where office_key = 'planning';
-- update office_details set head = 'Mr. Noel Baybay'  where office_key = 'city-eng';

-- ── Ika-3 palapag ───────────────────────────────────────────────
update office_details set head = 'Ms. Rhea Amon',         phone = '(046) 483-9376', "local" = '300'  where office_key = 'accounting-office';
update office_details set head = 'Ms. Merly Hernando',    phone = '(046) 483-9375', "local" = null   where office_key = 'budget-office';
update office_details set head = 'Ms. Sylvia Constante',  phone = '(046) 483-9375', "local" = null   where office_key = 'internal-audit';
update office_details set head = 'Ms. Josephine Caraan',  phone = '(046) 483-9377', "local" = null   where office_key = 'treasure-office';

-- ── Ika-5 palapag ───────────────────────────────────────────────
update office_details set head = 'Ms. Alma A. Malabanan', phone = '(046) 483-9371', "local" = null   where office_key = 'admin-office';
update office_details set head = 'Ms. Mariza Agustin',    phone = '(046) 483-9370', "local" = '506'  where office_key = 'hr-office';
update office_details set head = 'Ms. Marilyn Aala',      phone = '(046) 483-9370', "local" = null   where office_key = 'legal-office';

-- ── Ika-7 palapag ───────────────────────────────────────────────
update office_details set head = 'Ms. Jovie A. Maguinao', phone = '(046) 483-9378', "local" = null   where office_key = 'mayor-receiving';
update office_details set head = 'Analus Angcaya',        phone = '(046) 483-9379', "local" = '702'  where office_key = 'mayor-main';


-- ── Pagpapaalam sa API ──────────────────────────────────────────
-- May tinatandaang listahan ng hanay ang PostgREST, at may pagkakataóng
-- naiiwan itong luma. Ito ang pumipilit magbago.
notify pgrst, 'reload schema';


-- ── Pagtingin kung tumama ───────────────────────────────────────
-- Labinsiyam ang inaasahan. Kulang kung may tanggapang wala pang hanay
-- sa office_details — hindi iyon sira: sa defaultOfficeData.js kinukuha
-- ang laman nila hanggang may mag-save sa kanila mula sa admin panel
-- (tingnan ang getAllOffices sa src/lib/api.js). Pareho naman ang nasa
-- code at ang nasa PDF, kaya tama pa rin ang lumalabas sa kiosk.
--
-- select office_key, head, phone, "local" from office_details
--  where office_key in ('info-desk','pio-1','pio-2','tourism-office',
--    'barangay-affairs','csu-office','planning','city-eng','housing','bac',
--    'accounting-office','budget-office','internal-audit','treasure-office',
--    'admin-office','hr-office','legal-office','mayor-receiving','mayor-main')
--  order by office_key;
