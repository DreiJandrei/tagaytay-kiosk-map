-- ════════════════════════════════════════════════════════════════
-- TAGALOG NA "TUNGKOL SA OPISINA"
-- ════════════════════════════════════════════════════════════════
-- Nagdadagdag ng hanay para sa Tagalog na paliwanag ng bawat tanggapan.
-- Ito ang lumalabas sa kiosk kapag naka-Tagalog, at ito ang ine-edit sa
-- Admin Panel → Direktoryo ng Tanggapan kapag Tagalog ang panel.
--
-- Patakbuhin sa Supabase → SQL Editor → New query → Run. Ligtas itong
-- ulit-ulitin.
--
-- NULL ang lahat pagkatapos nito — sinasadya. Ang ibig sabihin ng NULL
-- ay "wala pang na-edit", kaya ang salin na nasa defaultOfficeData.js
-- (`descriptionTl`) ang lumalabas sa kiosk. Pagka-save ng admin ng isang
-- tanggapan, ang na-save na ang mananaig.
--
-- Hangga't hindi ito napapatakbo, gumagana pa rin ang kiosk (lumalabas
-- ang salin sa code) at nakakapag-save pa rin ang admin ng lahat ng iba;
-- ang Tagalog na paliwanag lang ang hindi maiimbak, at sasabihan ang
-- nag-save.
-- ════════════════════════════════════════════════════════════════

alter table office_details add column if not exists description_tl text;

-- ── Pagpapaalam sa API ──────────────────────────────────────────
notify pgrst, 'reload schema';
