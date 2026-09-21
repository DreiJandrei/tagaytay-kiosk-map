-- ════════════════════════════════════════════════════════════════
-- CONTACT PERSON AT PALIWANAG NG BAWAT TANGGAPAN
-- ════════════════════════════════════════════════════════════════
-- Ang defaultOfficeData.js ay seed lang: kapag may laman na ang
-- database, iyon ang nananaig (tingnan ang mergeOfficeData). Kaya
-- para makita ang mga ito sa buhay na kiosk, patakbuhin ang script
-- na ito sa Supabase → SQL Editor → New query → Run.
--
-- Ligtas itong ulit-ulitin: ang `head` at `description` lang ang
-- ginagalaw, at bawat linya ay nakatali sa office_key.
--
-- WALA DITO ANG TELEPONO: walang hanay para doon sa office_details,
-- kaya sa defaultOfficeData.js (`phone`, `local`) ito nakatira —
-- hindi ito nabubura ng database dahil hindi ito hanay nito.
--
-- Pinagmulan: super-griffin-13ae1b.netlify.app (mga floor page),
-- kinuha noong 2026-09-21. "Contact Person" din ang tawag dito sa
-- kiosk, gaya ng pinagmulan.
--
-- Naipasok na ito sa database noong 2026-09-21 — nandito ito bilang
-- talaan, at para maibalik kapag na-reset o nalinis ang database.
--
-- Hindi kasama (wala sa pinagmulan): building-official (F3) at
--   lahat ng CR, hall, canteen, library, guard post, at UNDER
--   CONSTRUCTION na espasyo — nanatili ang dating nakalagay doon.
-- ════════════════════════════════════════════════════════════════

-- ── Ground floor ────────────────────────────────────────────────
update office_details set head = 'Mr. Jun D. Dolot'       where office_key = 'info-desk';
update office_details set head = 'Ms. Sonia S. Mendoza'   where office_key = 'pio-1';
update office_details set head = 'Staff'                  where office_key = 'pio-2';
update office_details set head = 'Ms. Faith Maranan'      where office_key = 'tourism-office';
update office_details set head = 'Mr. Edwin Borja'        where office_key = 'barangay-affairs';
update office_details set head = 'Mr. Jimmy M. Quito'     where office_key = 'csu-office';

-- ── Ika-2 palapag ───────────────────────────────────────────────
update office_details set head = 'Engr. Emma Pello'       where office_key = 'planning';
update office_details set head = 'Mr. Noel Baybay'        where office_key = 'city-eng';
update office_details set head = 'Ms. Mabel Perea'        where office_key = 'housing';
update office_details set head = 'Staff'                  where office_key = 'bac';

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


-- ── Paliwanag ng mga bulwagan (About this Office) ──────────────
-- Ito lang ang may nakasulat na paliwanag sa pinagmulan; walang
-- ganitong teksto ang ibang tanggapan doon.

update office_details set description = 'Tolentino Hall is the main multi-purpose civic hall of Tagaytay City Hall, named in honor of a distinguished public servant. It serves as the primary venue for official city government functions, public assemblies, community hearings, orientations, and large-scale events — making it a central hub for democratic participation and public engagement.'
  where office_key = 'tolentino-hall';

update office_details set description = 'The Cultural Hall is a dedicated venue celebrating the rich arts, heritage, and traditions of Tagaytay City. It hosts cultural presentations, exhibits, performances, and community gatherings that promote local identity and civic pride. The hall provides a space for residents and visitors to appreciate the city''s vibrant cultural life and diverse community programs.'
  where office_key = 'cultural-hall';

update office_details set description = 'The Conference Hall on the 6th floor is a fully equipped venue designed for official meetings, seminars, training sessions, and government forums. It accommodates delegations, inter-agency conferences, and large-scale official gatherings, providing a professional environment that supports the administrative and governance functions of Tagaytay City Hall.'
  where office_key = 'conference-hall';

update office_details set description = 'The Wedding Hall is an elegant venue available for civil wedding ceremonies and receptions within Tagaytay City Hall. It offers a dignified and memorable setting for couples celebrating their union, reflecting the city''s reputation as one of the Philippines'' most sought-after wedding destinations. The hall can be reserved through the appropriate city government office.'
  where office_key = 'wedding-hall';

-- Pagkatapos: tingnan kung tumama lahat (18 na hanay ang inaasahan —
-- walang hanay ang info-desk sa database, sa defaultOfficeData.js ito
-- kinukuha, kaya 17 ang ibabalik nito).
-- select office_key, head from office_details
--  where office_key in ('pio-1','pio-2','tourism-office','barangay-affairs',
--    'csu-office','planning','city-eng','housing','bac','accounting-office',
--    'budget-office','internal-audit','treasure-office','admin-office','hr-office',
--    'legal-office','mayor-main','mayor-receiving')
--  order by office_key;
