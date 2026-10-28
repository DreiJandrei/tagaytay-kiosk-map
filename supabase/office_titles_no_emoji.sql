-- ============================================================
-- PANGALAN NG TANGGAPAN NANG WALANG EMOJI
-- Patakbuhin sa Supabase → SQL Editor → New query → Run.
-- Ligtas itong ulitin.
--
-- Ang limang "🚧 UNDER CONSTRUCTION" na espasyo ay nasa database na,
-- kaya hindi sila naaabot ng pagbabago sa defaultOfficeData.js — ang
-- database ang nananaig sa kiosk.
-- ============================================================

update public.offices
   set title = 'UNDER CONSTRUCTION'
 where title = '🚧 UNDER CONSTRUCTION';

-- Dapat walang lumabas.
select office_key, title from public.offices where title like '%🚧%';
