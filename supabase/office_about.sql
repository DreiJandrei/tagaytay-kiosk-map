-- ════════════════════════════════════════════════════════════════
-- "ABOUT THIS OFFICE" — PALIWANAG NG BAWAT TANGGAPAN
-- ════════════════════════════════════════════════════════════════
-- Ito ang lumalabas sa ilalim ng pangalan ng tanggapan sa kiosk, bago
-- pa ang oras at contact person — ang unang tanong kasi ng bisita ay
-- "ano ang ginagawa dito?" (tingnan ang .office-about sa src/App.jsx).
-- Nakatago ang bahaging ito kapag walang laman ang `description`, kaya
-- hanggang ngayon, apat na hall lang ang may ganito.
--
-- Patakbuhin sa Supabase → SQL Editor → New query → Run. Ligtas itong
-- ulit-ulitin. Ang `description` lang ang ginagalaw.
--
--
-- ⚠️  WALA ITONG OPISYAL NA PINAGMULAN
-- ────────────────────────────────────────────────────────────────
-- Hindi ito hango sa papel ng lungsod. Isinulat ito batay sa karaniwang
-- tungkulin ng ganitong tanggapan sa isang LGU — hiniling na "gawa-gawa"
-- noong 2026-10-05. Kaya sinadyang PANGKALAHATAN ang bawat isa: ano ang
-- hawak ng tanggapan, wala nang higit pa. Walang nakasulat na bayad,
-- bilang ng araw, o pangalan ng serbisyo — doon mas madaling magkamali,
-- at binabasa ito ng publiko bilang opisyal na sabi ng City Hall.
--
-- Kapag may mag-abot ng tunay na paliwanag mula sa mismong tanggapan,
-- iyon ang dapat manaig — puwede nang i-type sa Admin Panel, o palitan
-- ang linya rito.
--
--
-- HINDI KASAMA
-- ────────────────────────────────────────────────────────────────
--   Tolentino Hall, Cultural Hall, Conference Hall, Wedding Hall
--     — may paliwanag na sila, nasa office_heads.sql. Hindi ginalaw.
--   Lahat ng Comfort Room, at ang apat na UNDER CONSTRUCTION sa ika-4
--   palapag at ang isa sa ika-5
--     — hindi sila tanggapan. "About this Office" ang nakasulat na
--       pamagat sa kiosk, kaya mali itong basahin sa isang CR. Mas
--       malinis na manatiling nakatago ang bahaging iyon para sa kanila.
-- ════════════════════════════════════════════════════════════════


-- ── Ground floor ────────────────────────────────────────────────

update office_details set description = 'The Information Desk is the first stop for visitors entering City Hall. Staff here direct the public to the correct office or floor, answer general questions about city services and requirements, maintain the visitor logbook, and assist senior citizens, persons with disabilities, and first-time visitors.'
  where office_key = 'info-desk';

update office_details set description = 'The Public Information Office handles the city government''s communication with the public and the press. It issues official announcements, releases, and advisories, assists media practitioners with accreditation and interview requests, and acts on requests for publicly available city information.'
  where office_key = 'pio-1';

update office_details set description = 'This department of the Public Information Office supports the city''s publication and documentation work. It covers official city events, keeps the photo and video records of government activities, and attends to walk-in requests for information materials and public advisories.'
  where office_key = 'pio-2';

update office_details set description = 'The Tourism and Cultural Development Office promotes Tagaytay as a destination and supports the city''s cultural programs. It assists tourists with information on attractions, accommodations, and events, processes the accreditation of tourism establishments and guides, and organizes festivals and heritage activities through the year.'
  where office_key = 'tourism-office';

update office_details set description = 'The Barangay Affairs Office is the link between the city government and the barangays of Tagaytay. It assists barangay officials with endorsements and the coordination of programs and resolutions, and takes up concerns raised by barangay councils that need action at the city level.'
  where office_key = 'barangay-affairs';

update office_details set description = 'The Civil Security Unit is responsible for the safety and order of Tagaytay City Hall and its grounds. It manages the guard posts and visitor screening, responds to incidents inside the building, and receives reports and complaints concerning security, lost items, and public safety.'
  where office_key = 'csu-office';

update office_details set description = 'The Breastfeeding Room is a private, clean, and comfortable space set aside for mothers who need to nurse or express milk while at City Hall. It is open to both employees and visitors, in support of the city''s maternal and child health programs.'
  where office_key = 'breastfeeding-room';

update office_details set description = 'The Canteen serves affordable meals, snacks, and refreshments to City Hall employees and to the public transacting in the building. It is also a place to sit and rest during long transactions, with seating available through the day.'
  where office_key = 'canteen';

update office_details set description = 'The Guard Post at the main entrance is where visitors are received and logged before entering City Hall. The guards on duty check identification, issue visitor passes, give basic directions, and keep watch over the entrance around the clock.'
  where office_key = 'guard';


-- ── Ika-2 palapag ───────────────────────────────────────────────

update office_details set description = 'The City Planning and Development Office prepares the city''s comprehensive land use and development plans, and reviews projects for consistency with them. It issues locational and zoning clearances, keeps the socio-economic data of Tagaytay, and coordinates the programming of development projects across offices.'
  where office_key = 'planning';

update office_details set description = 'The City Engineering Office plans, carries out, and supervises the city''s public infrastructure — roads, drainage, bridges, and government buildings. It prepares project designs and cost estimates, oversees contractors and ongoing works, and attends to reports of damaged public facilities.'
  where office_key = 'city-eng';

update office_details set description = 'The Tagaytay Housing Office handles the city''s socialized housing and resettlement programs. It accepts and evaluates applications from qualified beneficiaries, keeps the records of housing awards and amortization, and assists residents with concerns on land tenure and relocation.'
  where office_key = 'housing';

update office_details set description = 'The Bids and Awards Committee conducts the procurement of goods, infrastructure projects, and consulting services for the city government. It issues bidding documents, holds pre-bid conferences and public bid openings, and evaluates offers under the Government Procurement Reform Act.'
  where office_key = 'bac';

update office_details set description = 'The Small Library is a quiet reading area inside City Hall, holding reference materials, local publications, and records on the history and governance of Tagaytay. It is open to students, researchers, and residents who wish to read or study on site.'
  where office_key = 'library';

update office_details set description = 'The Back Extension Office holds administrative support units and additional workspace for staff assigned to this floor. Visitors are usually directed here by the office already handling their transaction.'
  where office_key = 'back-ext';

-- Dalawa ang Office of the Building Official sa mapa — isa rito sa ika-2
-- palapag, isa sa ika-3. Iisang tanggapan lang sila, kaya magkapareho
-- ang paliwanag; hindi ko hinuhulaan kung alin ang tunay na pwesto.
update office_details set description = 'The Office of the Building Official reviews and approves building, electrical, plumbing, and occupancy permits within Tagaytay City. It inspects ongoing construction for compliance with the National Building Code and city ordinances, and acts on reports of unsafe or unauthorized structures.'
  where office_key = 'bldg-official';


-- ── Ika-3 palapag ───────────────────────────────────────────────

update office_details set description = 'The Office of the Building Official reviews and approves building, electrical, plumbing, and occupancy permits within Tagaytay City. It inspects ongoing construction for compliance with the National Building Code and city ordinances, and acts on reports of unsafe or unauthorized structures.'
  where office_key = 'building-official';

update office_details set description = 'The City Accounting Office keeps the financial records of the city government. It processes disbursement vouchers, payroll, and the claims of suppliers and employees, maintains the books of accounts, and prepares the financial statements required of the city.'
  where office_key = 'accounting-office';

update office_details set description = 'The City Budget Office prepares and manages the annual budget of the city government. It reviews the funding proposals of every office, certifies that appropriations are available before spending, and monitors expenditures against the approved budget through the year.'
  where office_key = 'budget-office';

update office_details set description = 'The Internal Audit Services Office independently reviews the operations, controls, and transactions of the city government. It examines compliance with laws and internal policies, evaluates how public funds and property are safeguarded, and recommends improvements to management.'
  where office_key = 'internal-audit';

update office_details set description = 'The City Treasurer''s Office collects the revenues of the city — real property taxes, business taxes, fees, and other charges — and keeps custody of city funds. Payments are made and official receipts issued here, and the office also attends to tax clearances and billing inquiries.'
  where office_key = 'treasure-office';


-- ── Ika-5 palapag ───────────────────────────────────────────────

update office_details set description = 'The City Administrator''s Office oversees the day-to-day operations of the city government and coordinates the work of all departments. It carries out the policies and directives of the Mayor, supervises administrative and support services, and acts on matters that cut across several offices.'
  where office_key = 'admin-office';

update office_details set description = 'The Human Resources Management Office handles the recruitment, appointment, and records of city government personnel. It processes applications and job openings, manages employee benefits, leave, and training, and issues service records and certificates of employment.'
  where office_key = 'hr-office';

update office_details set description = 'The City Legal Office is the legal counsel of the city government. It drafts and reviews contracts, ordinances, and legal opinions, represents the city in cases and administrative proceedings, and gives legal guidance to the city offices.'
  where office_key = 'legal-office';


-- ── Ika-7 palapag ───────────────────────────────────────────────

update office_details set description = 'The Office of the Mayor is the seat of the city''s executive leadership, where the policies, programs, and official decisions for Tagaytay are made. It handles appointments with the Mayor, the signing of official documents, and matters raised from the other city offices.'
  where office_key = 'mayor-main';

update office_details set description = 'The Receiving Unit of the Mayor''s Office accepts the letters, requests, invitations, and documents addressed to the Mayor. Staff here log incoming communications, set appointments, and endorse concerns to the proper office for action.'
  where office_key = 'mayor-receiving';


-- ── Pagpapaalam sa API ──────────────────────────────────────────
notify pgrst, 'reload schema';


-- ── Pagtingin kung tumama ───────────────────────────────────────
-- Dalawampu't anim ang inaasahan. Kulang kung may tanggapang wala pang
-- hanay sa office_details — hindi iyon sira: sa defaultOfficeData.js
-- kinukuha ang laman nila, at nandoon din ang mga paliwanag na ito.
--
-- select office_key, left(description, 60) from office_details
--  where description is not null and description <> '' order by office_key;
