-- ════════════════════════════════════════════════════════════════
-- PANGALAN NG NAKATALAGA SA BAWAT TANGGAPAN
-- ════════════════════════════════════════════════════════════════
-- Ang defaultOfficeData.js ay seed lang: kapag may laman na ang
-- database, iyon ang nananaig (tingnan ang mergeOfficeData). Kaya
-- para makita ang mga pangalang ito sa buhay na kiosk, patakbuhin
-- ang script na ito sa Supabase → SQL Editor → New query → Run.
--
-- Ligtas itong ulit-ulitin: ang `head` lang ang ginagalaw, at ang
-- bawat linya ay nakatali sa office_key, hindi sa pangalan.
--
-- Pinagmulan: super-griffin-13ae1b.netlify.app (mga floor page),
-- kinuha noong 2026-09-21. "Contact Person" ang tawag doon sa
-- pangalan; "Head" ang tawag dito sa kiosk.
--
-- Hindi kasama (walang pangalang nakalagay sa pinagmulan):
--   pio-2, bac, building-official (F3), at lahat ng CR, hall,
--   canteen, guard post, at UNDER CONSTRUCTION na espasyo.
-- ════════════════════════════════════════════════════════════════

-- ── Ground floor ────────────────────────────────────────────────
update office_details set head = 'Mr. Jun D. Dolot'       where office_key = 'info-desk';
update office_details set head = 'Ms. Sonia S. Mendoza'   where office_key = 'pio-1';
update office_details set head = 'Ms. Faith Maranan'      where office_key = 'tourism-office';
update office_details set head = 'Mr. Edwin Borja'        where office_key = 'barangay-affairs';
update office_details set head = 'Mr. Jimmy M. Quito'     where office_key = 'csu-office';

-- ── Ika-2 palapag ───────────────────────────────────────────────
update office_details set head = 'Engr. Emma Pello'       where office_key = 'planning';
update office_details set head = 'Mr. Noel Baybay'        where office_key = 'city-eng';
update office_details set head = 'Ms. Mabel Perea'        where office_key = 'housing';

-- ── Ika-3 palapag ───────────────────────────────────────────────
update office_details set head = 'Ms. Rhea Amon'          where office_key = 'accounting-office';
update office_details set head = 'Ms. Merly Hernando'     where office_key = 'budget-office';
update office_details set head = 'Ms. Sylvia Constante'   where office_key = 'internal-audit';
update office_details set head = 'Ms. Josephine Caraan'   where office_key = 'treasure-office';

-- ── Ika-5 palapag ───────────────────────────────────────────────
update office_details set head = 'Ms. Alma A. Malabanan'  where office_key = 'admin-office';
update office_details set head = 'Ms. Mariza Agustin'     where office_key = 'hr-office';
update office_details set head = 'Ms. Marilyn Aala'       where office_key = 'legal-office';

-- ── Ika-7 palapag ───────────────────────────────────────────────
update office_details set head = 'Analus Angcaya'         where office_key = 'mayor-main';
update office_details set head = 'Ms. Jovie A. Maguinao'  where office_key = 'mayor-receiving';

-- Pagkatapos: tingnan kung tumama lahat (17 na hanay ang inaasahan).
-- select office_key, head from office_details
--  where office_key in ('info-desk','pio-1','tourism-office','barangay-affairs',
--    'csu-office','planning','city-eng','housing','accounting-office','budget-office',
--    'internal-audit','treasure-office','admin-office','hr-office','legal-office',
--    'mayor-main','mayor-receiving')
--  order by office_key;
