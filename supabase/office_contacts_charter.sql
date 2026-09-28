-- ════════════════════════════════════════════════════════════════
-- TELEPONO AT CONTACT PERSON MULA SA CITIZEN'S CHARTER 2025
-- ════════════════════════════════════════════════════════════════
-- Pinagmulan: "Citizen's Charter 2025_1st Edition", Google Slides ng
-- City Government of Tagaytay. Ang direktoryo ng tanggapan ay nasa
-- slides 385-387; ang mga pangalan ay hango sa mga slide ng serbisyo
-- kung saan nakalagda ang may hawak ng tanggapan. Kinuha 2026-09-28.
--
-- ANG NASA KIOSK LANG ANG GINAGALAW. Maraming tanggapan sa charter na
-- wala sa mapa (BPLO, City Assessor's, Civil Registry, Cooperative,
-- PESO, City Health, CSWDO, CENRO, CDRRMO, Agriculture) — hindi sila
-- idinagdag dito: walang silid ang maituturo ng kiosk para sa kanila.
--
-- KAILANGAN MUNANG NAPATAKBO ANG office_phones.sql — doon idinadagdag
-- ang mga hanay na `phone` at `local`. Kapag hindi pa, babagsak ito.
--
-- Patakbuhin sa Supabase → SQL Editor → New query → Run. Ligtas itong
-- ulit-ulitin.
-- ════════════════════════════════════════════════════════════════


-- ════════════════════════════════════════════════════════════════
-- ⚠️  BASAHIN MUNA ITO BAGO PATAKBUHIN
-- ════════════════════════════════════════════════════════════════
-- IBANG-IBA ANG NUMERO SA DATING NASA KIOSK:
--
--     Charter 2025   (046) 888-9500  + 3 digit na local
--     Dating kiosk   (046) 483-9370 … 9379
--
-- Ibig sabihin, kung tama ang charter, MALI ang labinsiyam na numerong
-- nakalagay noon. Ang charter ang sinusunod dito dahil ito ang opisyal
-- at pinakabagong papel ng lungsod — pero hindi pa ito napagtitibay sa
-- City Hall. Kapag may mag-reklamong hindi tumatawag ang numero, dito
-- ang unang tingnan.
--
-- HINDI GINALAW ANG PALAPAG. Hindi tugma ang charter at ang mapa: ayon
-- sa charter, nasa 1st-3rd floor lang ang lahat, samantalang F1-F7 ang
-- nasa kiosk (hal. City Engineer's — 3rd sa charter, F2 sa kiosk).
-- Ang palapag ang nagtatakda ng iginuguhit na ruta, at ang mismong
-- gusali ang sinurvey para sa mapa — kaya ang mapa ang pinanigan.
-- ════════════════════════════════════════════════════════════════


-- ── 1. TELEPONO ─────────────────────────────────────────────────
-- Labintatlong hanay: ang labing-isang tanggapan sa charter na may
-- katapat sa kiosk, at dalawa pang pinagsasaluhan ng dalawang silid
-- (ang PIO at ang tanggapan ng Mayor).

-- Ground floor sa kiosk
update office_details set phone = '(046) 888-9500', "local" = '307'      where office_key = 'pio-1';
update office_details set phone = '(046) 888-9500', "local" = '307'      where office_key = 'pio-2';
update office_details set phone = '(046) 888-9500', "local" = '312'      where office_key = 'tourism-office';

-- Ika-2 palapag sa kiosk
update office_details set phone = '(046) 888-9500', "local" = '105'      where office_key = 'city-eng';
update office_details set phone = '(046) 888-9500', "local" = '324'      where office_key = 'planning';

-- Ika-3 palapag sa kiosk
update office_details set phone = '(046) 888-9500', "local" = '208'      where office_key = 'budget-office';
update office_details set phone = '(046) 888-9500', "local" = '217'      where office_key = 'accounting-office';
update office_details set phone = '(046) 888-9500', "local" = '203'      where office_key = 'treasure-office';

-- Ika-5 palapag sa kiosk
update office_details set phone = '(046) 888-9500', "local" = '308'      where office_key = 'legal-office';
update office_details set phone = '(046) 888-9500', "local" = '305'      where office_key = 'hr-office';
update office_details set phone = '(046) 888-9500', "local" = '211'      where office_key = 'admin-office';

-- Ika-7 palapag sa kiosk
update office_details set phone = '(046) 888-9500', "local" = '318-320'  where office_key = 'mayor-main';
update office_details set phone = '(046) 888-9500', "local" = '318-320'  where office_key = 'mayor-receiving';


-- ── 2. CONTACT PERSON ───────────────────────────────────────────
-- Dalawa lang ang tiyak. Hindi listahan ng pinuno ang charter: ang
-- hanay nitong "PERSON RESPONSIBLE" ay puro tungkulin ("Engineer II",
-- "Architect I", "Frontliner CEO Staff"), hindi pangalan. Ang mga
-- pangalan sa ibaba ay galing sa lagda sa dulo ng bawat serbisyo,
-- kung saan may kasamang opisyal na titulo.
--
-- Pareho itong PAGWAWASTO sa pangalang nakalagay na, hindi pagpapalit
-- ng tao — kaya ligtas silang patakbuhin.

-- Dating "Mr. Noel Baybay" — tama ang tao, kulang ang titulo at inisyal.
update office_details set head = 'Engr. Noel C. Baybay'
  where office_key = 'city-eng';

-- Dating "Engr. Emma Pello" — "Emilma U. Pello" ang buong pangalan.
-- Ang CPDC ay City Planning & Development Coordinator.
update office_details set head = 'Engr. Emilma U. Pello'
  where office_key = 'planning';


-- ── 3. HINDI KO ITO PINATAKBO — IKAW ANG BAHALA ─────────────────
-- Dalawang tanggapan kung saan MAGKAIBANG TAO ang nasa charter at ang
-- nasa kiosk. Hindi ito pagwawasto ng baybay — pagpapalit ito ng
-- pangalan sa isang screen na binabasa ng publiko, kaya hindi ako ang
-- dapat magpasya. Alisin ang dalawang gitling kung tama ang charter.
--
-- LEGAL OFFICE
--   Kiosk:    Ms. Marilyn Aala
--   Charter:  Atty. Edwin Alden V. Uy, City Legal Officer
--             (may "Atty. Ronald M. Aala, Attorney V" din — kapangalan
--              ng nasa kiosk, pero hindi siya ang puno ng tanggapan)
-- update office_details set head = 'Atty. Edwin Alden V. Uy' where office_key = 'legal-office';
--
-- MAYOR'S OFFICE
--   Kiosk:    Analus Angcaya
--   Charter:  Hon. Abraham N. Tolentino, City Mayor
--   Tandaan: "Contact Person" ang tawag dito sa kiosk — maaaring tama
--   ang kawani at hindi ang Mayor mismo ang dapat makausap dito.
-- update office_details set head = 'Hon. Abraham N. Tolentino' where office_key = 'mayor-main';


-- ── 4. Pagpapaalam sa API ───────────────────────────────────────
notify pgrst, 'reload schema';

-- ── 5. Pagtingin kung tumama ────────────────────────────────────
-- Labintatlong hanay ang inaasahan sa telepono.
-- select office_key, head, phone, "local" from office_details
--  where office_key in ('pio-1','pio-2','tourism-office','city-eng','planning',
--    'budget-office','accounting-office','treasure-office','legal-office',
--    'hr-office','admin-office','mayor-main','mayor-receiving')
--  order by office_key;
