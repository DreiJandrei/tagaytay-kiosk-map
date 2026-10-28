// Default office data for database initialization
// This contains only the text fields that administrators can update
// Coordinate data stays secure in coordinateMapping.js
//
// descriptionTl — Tagalog na salin ng `description`, para sa kiosk na
// naka-Tagalog. Ang nasa database (office_details.description_tl) ang
// mananaig kapag na-edit na ito sa Admin Panel; ito ang lumalabas hangga't
// hindi pa. Tingnan ang supabase/office_about_tl.sql.

export const defaultOfficeData = {
  1: {
    "tolentino-hall": {
      title: "Tolentino Hall",
      badge: "1st Floor - Rear Grand Concourse",
      hours: "8:00 AM - 5:00 PM (Event Dependent)",
      head: "General Services Office (GSO)",
      description: "Tolentino Hall is the main multi-purpose civic hall of Tagaytay City Hall, named in honor of a distinguished public servant. It serves as the primary venue for official city government functions, public assemblies, community hearings, orientations, and large-scale events — making it a central hub for democratic participation and public engagement.",
      descriptionTl: "Ang Tolentino Hall ang pangunahing bulwagang pansibiko ng Tagaytay City Hall, na ipinangalan bilang parangal sa isang kilalang lingkod-bayan. Dito ginaganap ang mga opisyal na gawain ng pamahalaang lungsod, mga pampublikong pagtitipon, mga pagdinig ng komunidad, mga oryentasyon, at malalaking kaganapan — kaya ito ang sentro ng pakikilahok ng mamamayan sa pamamahala.",
      requirements: ["Approved Event Booking Clearance", "Valid Government ID Pass"]
    },
    "cultural-hall": {
      title: "Cultural Hall",
      badge: "1st Floor - West Wing Complex",
      hours: "8:00 AM - 5:00 PM",
      head: "Tourism & Cultural Development Division",
      description: "The Cultural Hall is a dedicated venue celebrating the rich arts, heritage, and traditions of Tagaytay City. It hosts cultural presentations, exhibits, performances, and community gatherings that promote local identity and civic pride. The hall provides a space for residents and visitors to appreciate the city's vibrant cultural life and diverse community programs.",
      descriptionTl: "Ang Cultural Hall ay lugar na nakalaan sa pagdiriwang ng mayamang sining, pamana, at tradisyon ng Lungsod ng Tagaytay. Dito ginaganap ang mga pagtatanghal pangkultura, eksibit, palabas, at pagtitipon ng komunidad na nagpapalakas ng pagkakakilanlan at pagmamalaki ng lungsod. Bukas ito sa mga residente at bisita upang makilala ang masiglang kultura at iba't ibang programang pangkomunidad ng lungsod.",
      requirements: ["Venue Reservation Authorization", "Valid ID"]
    },
    "canteen": {
      title: "Canteen",
      badge: "1st Floor - Left Courtyard Wing",
      hours: "7:00 AM - 5:00 PM",
      head: "Dietary & Food Services",
      description: "The Canteen serves affordable meals, snacks, and refreshments to City Hall employees and to the public transacting in the building. It is also a place to sit and rest during long transactions, with seating available through the day.",
      descriptionTl: "Nag-aalok ang Canteen ng abot-kayang pagkain, meryenda, at inumin para sa mga empleyado ng City Hall at sa publikong may transaksyon sa gusali. Puwede rin itong pahingahan habang naghihintay sa mahahabang transaksyon, at may mauupuan dito buong araw.",
      requirements: ["Cash or Digital Wallet (Gcash) Payment"]
    },
    "pio-1": {
      title: "Public Information Office (Dept A)",
      badge: "1st Floor - West Wing Corridor",
      hours: "8:00 AM - 5:00 PM (Mon-Fri)",
      phone: "(046) 483-9372",
      local: "106",
      head: "Ms. Sonia S. Mendoza",
      description: "The Public Information Office handles the city government's communication with the public and the press. It issues official announcements, releases, and advisories, assists media practitioners with accreditation and interview requests, and acts on requests for publicly available city information.",
      descriptionTl: "Ang Public Information Office ang humahawak sa pakikipag-ugnayan ng pamahalaang lungsod sa publiko at sa media. Naglalabas ito ng mga opisyal na anunsyo, press release, at abiso; tumutulong sa mga mamamahayag sa akreditasyon at sa paghiling ng panayam; at tumutugon sa mga kahilingan para sa pampublikong impormasyon ng lungsod.",
      requirements: ["Press Credentials", "Document Request Form"]
    },
    "pio-2": {
      title: "Public Information Office (Dept B)",
      badge: "1st Floor - West Wing Corridor",
      hours: "8:00 AM - 5:00 PM (Mon-Fri)",
      phone: "(046) 483-9372",
      local: "106",
      head: "Staff",
      description: "This department of the Public Information Office supports the city's publication and documentation work. It covers official city events, keeps the photo and video records of government activities, and attends to walk-in requests for information materials and public advisories.",
      descriptionTl: "Ang departamentong ito ng Public Information Office ay tumutulong sa mga publikasyon at dokumentasyon ng lungsod. Kinukunan nito ang mga opisyal na kaganapan ng lungsod, iniingatan ang mga larawan at video ng mga gawain ng pamahalaan, at tinutugunan ang mga walk-in na humihingi ng mga babasahin at pampublikong abiso.",
      requirements: ["Press Credentials", "Document Request Form"]
    },
    "csu-office": {
      title: "Civil Security Unit Office",
      badge: "1st Floor - Central Concourse Wall",
      hours: "24/7 Safety Dispatch Window",
      phone: "(046) 483-9370",
      head: "Mr. Jimmy M. Quito",
      description: "The Civil Security Unit is responsible for the safety and order of Tagaytay City Hall and its grounds. It manages the guard posts and visitor screening, responds to incidents inside the building, and receives reports and complaints concerning security, lost items, and public safety.",
      descriptionTl: "Ang Civil Security Unit ang may pananagutan sa kaligtasan at kaayusan ng Tagaytay City Hall at ng bakuran nito. Pinamamahalaan nito ang mga guard post at ang pagsusuri sa mga bisita, rumeresponde sa mga insidente sa loob ng gusali, at tumatanggap ng mga ulat at reklamo tungkol sa seguridad, mga nawawalang gamit, at kaligtasan ng publiko.",
      requirements: ["Incident Lodging Form Registry", "Valid ID"]
    },
    "barangay-affairs": {
      title: "Barangay Affairs Office",
      badge: "1st Floor - Central Concourse Wall",
      hours: "8:00 AM - 5:00 PM (Mon-Fri)",
      phone: "(046) 483-9372",
      head: "Mr. Edwin Borja",
      description: "The Barangay Affairs Office is the link between the city government and the barangays of Tagaytay. It assists barangay officials with endorsements and the coordination of programs and resolutions, and takes up concerns raised by barangay councils that need action at the city level.",
      descriptionTl: "Ang Barangay Affairs Office ang tulay ng pamahalaang lungsod at ng mga barangay ng Tagaytay. Tinutulungan nito ang mga opisyal ng barangay sa mga endorsement at sa pag-uugnay ng mga programa at resolusyon, at inaasikaso ang mga hinaing ng mga konseho ng barangay na kailangang aksyunan sa antas ng lungsod.",
      requirements: ["Barangay Council Endorsement Letter", "Community Tax Certificate"]
    },
    "tourism-office": {
      title: "Tourism & Cultural Development",
      badge: "1st Floor - Central Concourse Gate",
      hours: "8:00 AM - 5:00 PM (Mon-Sat)",
      phone: "(046) 483-9372",
      head: "Ms. Faith Maranan",
      description: "The Tourism and Cultural Development Office promotes Tagaytay as a destination and supports the city's cultural programs. It assists tourists with information on attractions, accommodations, and events, processes the accreditation of tourism establishments and guides, and organizes festivals and heritage activities through the year.",
      descriptionTl: "Itinataguyod ng Tourism and Cultural Development Office ang Tagaytay bilang destinasyon at sinusuportahan ang mga programang pangkultura ng lungsod. Nagbibigay ito ng impormasyon sa mga turista tungkol sa mga pasyalan, matutuluyan, at kaganapan; pinoproseso ang akreditasyon ng mga establisimyentong pang-turismo at mga tour guide; at nag-oorganisa ng mga pista at gawaing pamanang-kultura sa buong taon.",
      requirements: ["Accreditation Documents Pack", "Valid State ID"]
    },
    "breastfeeding-room": {
      title: "Breastfeeding Room",
      badge: "1st Floor - East Wing Utilities",
      hours: "8:00 AM - 5:00 PM",
      head: "City Health Office Division",
      description: "The Breastfeeding Room is a private, clean, and comfortable space set aside for mothers who need to nurse or express milk while at City Hall. It is open to both employees and visitors, in support of the city's maternal and child health programs.",
      descriptionTl: "Ang Breastfeeding Room ay pribado, malinis, at komportableng silid para sa mga inang kailangang magpasuso o maglabas ng gatas habang nasa City Hall. Bukas ito sa mga empleyado at bisita, bilang suporta sa mga programa ng lungsod para sa kalusugan ng ina at sanggol.",
      requirements: ["Registration at Concourse Desk Required"]
    },
    "restroom-cr": {
      title: "Restroom (CR)",
      badge: "1st Floor - Utilities Section",
      hours: "Open 24/7",
      head: "Public Utilities Unit",
      requirements: []
    },
    "info-desk": {
      title: "Info Desk",
      badge: "1st Floor - Main Lobby (Left of Entrance)",
      hours: "8:00 AM - 5:00 PM (Mon-Fri)",
      phone: "(046) 483-9372",
      local: "100",
      head: "Mr. Jun D. Dolot",
      description: "The Information Desk is the first stop for visitors entering City Hall. Staff here direct the public to the correct office or floor, answer general questions about city services and requirements, maintain the visitor logbook, and assist senior citizens, persons with disabilities, and first-time visitors.",
      descriptionTl: "Ang Information Desk ang unang hintuan ng mga bisitang pumapasok sa City Hall. Itinuturo ng mga kawani rito ang tamang tanggapan o palapag, sinasagot ang mga pangkalahatang tanong tungkol sa mga serbisyo at requirements ng lungsod, iniingatan ang logbook ng mga bisita, at tinutulungan ang mga senior citizen, mga taong may kapansanan, at mga unang beses na bumibisita.",
      requirements: ["Valid ID for Visitor Logbook"]
    },
    "guard": {
      title: "Guard Post",
      badge: "1st Floor - Main Entrance (Right Side)",
      hours: "Open 24/7",
      head: "Civil Security Unit",
      description: "The Guard Post at the main entrance is where visitors are received and logged before entering City Hall. The guards on duty check identification, issue visitor passes, give basic directions, and keep watch over the entrance around the clock.",
      descriptionTl: "Sa Guard Post sa pangunahing pasukan tinatanggap at itinatala ang mga bisita bago pumasok sa City Hall. Sinusuri ng mga guwardiyang naka-duty ang pagkakakilanlan, nagbibigay ng visitor pass, nagtuturo ng direksyon, at nagbabantay sa pasukan araw at gabi.",
      requirements: ["Valid ID", "Visitor Pass Registration"]
    }
  },
  2: {
    "bldg-official": {
      title: "Office of the Building Official",
      badge: "2nd Floor - West",
      hours: "8:00 AM - 5:00 PM",
      head: "Building Official",
      description: "The Office of the Building Official reviews and approves building, electrical, plumbing, and occupancy permits within Tagaytay City. It inspects ongoing construction for compliance with the National Building Code and city ordinances, and acts on reports of unsafe or unauthorized structures.",
      descriptionTl: "Sinusuri at inaaprubahan ng Office of the Building Official ang mga building, electrical, plumbing, at occupancy permit sa Lungsod ng Tagaytay. Ini-inspeksyon nito ang mga ginagawang konstruksyon kung sumusunod sa National Building Code at sa mga ordinansa ng lungsod, at inaaksyunan ang mga ulat tungkol sa mga mapanganib o walang pahintulot na istruktura.",
      requirements: ["Permit Forms", "Valid ID"]
    },
    "city-eng": {
      title: "City Engineering Office",
      badge: "2nd Floor - West",
      hours: "8:00 AM - 5:00 PM",
      phone: "(046) 483-9374",
      head: "Mr. Noel Baybay",
      description: "The City Engineering Office plans, carries out, and supervises the city's public infrastructure — roads, drainage, bridges, and government buildings. It prepares project designs and cost estimates, oversees contractors and ongoing works, and attends to reports of damaged public facilities.",
      descriptionTl: "Ang City Engineering Office ang nagpaplano, nagsasagawa, at nangangasiwa sa mga pampublikong imprastruktura ng lungsod — mga kalsada, kanal, tulay, at gusali ng pamahalaan. Inihahanda nito ang disenyo at tantiyang gastos ng mga proyekto, binabantayan ang mga kontratista at mga kasalukuyang gawain, at inaasikaso ang mga ulat ng sirang pampublikong pasilidad.",
      requirements: ["Project Plans"]
    },
    "housing": {
      title: "Tagaytay Housing Office",
      badge: "2nd Floor - West",
      hours: "8:00 AM - 5:00 PM",
      phone: "(046) 483-9370",
      local: "207",
      head: "Ms. Mabel Perea",
      description: "The Tagaytay Housing Office handles the city's socialized housing and resettlement programs. It accepts and evaluates applications from qualified beneficiaries, keeps the records of housing awards and amortization, and assists residents with concerns on land tenure and relocation.",
      descriptionTl: "Hinahawakan ng Tagaytay Housing Office ang mga programa ng lungsod para sa socialized housing at relokasyon. Tumatanggap at sumusuri ito ng mga aplikasyon ng mga kwalipikadong benepisyaryo, iniingatan ang mga talaan ng mga iginawad na pabahay at hulog, at tinutulungan ang mga residente sa mga usapin ng karapatan sa lupa at relokasyon.",
      requirements: ["Application Form"]
    },
    "bac": {
      title: "Bids and Awards Committee",
      badge: "2nd Floor - Center",
      hours: "8:00 AM - 5:00 PM",
      phone: "(046) 483-9376",
      local: "206",
      head: "Staff",
      description: "The Bids and Awards Committee conducts the procurement of goods, infrastructure projects, and consulting services for the city government. It issues bidding documents, holds pre-bid conferences and public bid openings, and evaluates offers under the Government Procurement Reform Act.",
      descriptionTl: "Ang Bids and Awards Committee ang nagsasagawa ng pagbili ng mga kagamitan, proyektong pang-imprastruktura, at serbisyong pagkonsulta para sa pamahalaang lungsod. Naglalabas ito ng mga bidding document, nagdaraos ng mga pre-bid conference at pampublikong pagbubukas ng bid, at sinusuri ang mga alok alinsunod sa Government Procurement Reform Act.",
      requirements: ["Bidding Documents"]
    },
    "planning": {
      title: "City Planning and Development Office",
      badge: "2nd Floor - East",
      hours: "8:00 AM - 5:00 PM",
      phone: "(046) 483-9373",
      head: "Engr. Emma Pello",
      description: "The City Planning and Development Office prepares the city's comprehensive land use and development plans, and reviews projects for consistency with them. It issues locational and zoning clearances, keeps the socio-economic data of Tagaytay, and coordinates the programming of development projects across offices.",
      descriptionTl: "Inihahanda ng City Planning and Development Office ang komprehensibong plano ng lungsod sa paggamit ng lupa at pag-unlad, at sinusuri kung naaayon dito ang mga proyekto. Naglalabas ito ng locational at zoning clearance, iniingatan ang socio-economic na datos ng Tagaytay, at pinag-uugnay ang pagpaplano ng mga proyektong pangkaunlaran ng iba't ibang tanggapan.",
      requirements: ["Clearance"]
    },
    "back-ext": {
      title: "Back Extension Office",
      badge: "2nd Floor - East",
      hours: "8:00 AM - 5:00 PM",
      head: "Admin Officer",
      description: "The Back Extension Office holds administrative support units and additional workspace for staff assigned to this floor. Visitors are usually directed here by the office already handling their transaction.",
      descriptionTl: "Nasa Back Extension Office ang mga yunit na pang-administratibong suporta at karagdagang lugar-trabaho ng mga kawaning nakatalaga sa palapag na ito. Kadalasan, dito itinuturo ang mga bisita ng tanggapang humahawak na sa kanilang transaksyon.",
      requirements: []
    },
    "restroom-cr-2": {
      title: "Comfort Room",
      badge: "2nd Floor - Utilities",
      hours: "Open 24/7",
      head: "Public Utilities Unit",
      requirements: []
    },
    "library": {
      title: "Small Library",
      badge: "2nd Floor - South",
      hours: "8:00 AM - 5:00 PM",
      head: "City Librarian",
      description: "The Small Library is a quiet reading area inside City Hall, holding reference materials, local publications, and records on the history and governance of Tagaytay. It is open to students, researchers, and residents who wish to read or study on site.",
      descriptionTl: "Ang Small Library ay tahimik na babasahan sa loob ng City Hall, na may mga sangguniang aklat, lokal na publikasyon, at mga talaan tungkol sa kasaysayan at pamamahala ng Tagaytay. Bukas ito sa mga estudyante, mananaliksik, at residenteng nais magbasa o mag-aral dito.",
      requirements: ["Library Card"]
    }
  },
  3: {
    "building-official": {
      title: "OFFICE OF THE BUILDING OFFICIAL",
      badge: "3rd Floor - West",
      hours: "8:00 AM - 5:00 PM",
      head: "Building Official",
      description: "The Office of the Building Official reviews and approves building, electrical, plumbing, and occupancy permits within Tagaytay City. It inspects ongoing construction for compliance with the National Building Code and city ordinances, and acts on reports of unsafe or unauthorized structures.",
      descriptionTl: "Sinusuri at inaaprubahan ng Office of the Building Official ang mga building, electrical, plumbing, at occupancy permit sa Lungsod ng Tagaytay. Ini-inspeksyon nito ang mga ginagawang konstruksyon kung sumusunod sa National Building Code at sa mga ordinansa ng lungsod, at inaaksyunan ang mga ulat tungkol sa mga mapanganib o walang pahintulot na istruktura.",
      requirements: ["Permit Forms"]
    },
    "budget-office": {
      title: "BUDGET OFFICE",
      badge: "3rd Floor - North",
      hours: "8:00 AM - 5:00 PM",
      phone: "(046) 483-9375",
      head: "Ms. Merly Hernando",
      description: "The City Budget Office prepares and manages the annual budget of the city government. It reviews the funding proposals of every office, certifies that appropriations are available before spending, and monitors expenditures against the approved budget through the year.",
      descriptionTl: "Inihahanda at pinamamahalaan ng City Budget Office ang taunang badyet ng pamahalaang lungsod. Sinusuri nito ang mga panukalang pondo ng bawat tanggapan, pinatutunayang may nakalaang pondo bago gumastos, at binabantayan ang mga gastusin ayon sa aprubadong badyet sa buong taon.",
      requirements: ["Budget Proposal Form"]
    },
    "internal-audit": {
      title: "INTERNAL AUDIT SERVICES",
      badge: "3rd Floor - North",
      hours: "8:00 AM - 5:00 PM",
      phone: "(046) 483-9375",
      head: "Ms. Sylvia Constante",
      description: "The Internal Audit Services Office independently reviews the operations, controls, and transactions of the city government. It examines compliance with laws and internal policies, evaluates how public funds and property are safeguarded, and recommends improvements to management.",
      descriptionTl: "Malayang sinusuri ng Internal Audit Services Office ang mga operasyon, kontrol, at transaksyon ng pamahalaang lungsod. Tinitingnan nito kung sumusunod sa mga batas at panloob na patakaran, sinusuri kung paano iniingatan ang pondo at ari-arian ng publiko, at nagmumungkahi ng mga pagpapabuti sa pamunuan.",
      requirements: []
    },
    "treasure-office": {
      title: "CITY TREASURE OFFICE",
      badge: "3rd Floor - East",
      hours: "8:00 AM - 5:00 PM",
      phone: "(046) 483-9377",
      head: "Ms. Josephine Caraan",
      description: "The City Treasurer's Office collects the revenues of the city — real property taxes, business taxes, fees, and other charges — and keeps custody of city funds. Payments are made and official receipts issued here, and the office also attends to tax clearances and billing inquiries.",
      descriptionTl: "Kinokolekta ng City Treasurer's Office ang kita ng lungsod — buwis sa lupa at gusali (real property tax), buwis sa negosyo, bayarin, at iba pang singil — at iniingatan ang pondo ng lungsod. Dito nagbabayad at naglalabas ng opisyal na resibo, at inaasikaso rin ng tanggapan ang mga tax clearance at mga tanong tungkol sa singil.",
      requirements: ["Payment Slips"]
    },
    "accounting-office": {
      title: "CITY ACCOUNTING OFFICE",
      badge: "3rd Floor - South",
      hours: "8:00 AM - 5:00 PM",
      phone: "(046) 483-9376",
      local: "300",
      head: "Ms. Rhea Amon",
      description: "The City Accounting Office keeps the financial records of the city government. It processes disbursement vouchers, payroll, and the claims of suppliers and employees, maintains the books of accounts, and prepares the financial statements required of the city.",
      descriptionTl: "Iniingatan ng City Accounting Office ang mga talaang pampinansyal ng pamahalaang lungsod. Pinoproseso nito ang mga disbursement voucher, payroll, at mga claim ng mga supplier at empleyado; pinapanatili ang mga libro ng account; at inihahanda ang mga financial statement na kailangan ng lungsod.",
      requirements: ["Financial Reports"]
    },
    "restroom-cr-3": {
      title: "Comfort Room",
      badge: "3rd Floor - Center",
      hours: "Open 24/7",
      head: "Public Utilities",
      requirements: []
    }
  },
  4: {
    "const-west": {
      title: "UNDER CONSTRUCTION",
      badge: "4th Floor - West Wing",
      hours: "Closed for Renovation",
      head: "City Engineering",
      requirements: []
    },
    "const-north": {
      title: "UNDER CONSTRUCTION",
      badge: "4th Floor - North Wing",
      hours: "Closed for Renovation",
      head: "City Engineering",
      requirements: []
    },
    "const-east": {
      title: "UNDER CONSTRUCTION",
      badge: "4th Floor - East Wing",
      hours: "Closed for Renovation",
      head: "City Engineering",
      requirements: []
    },
    "const-south": {
      title: "UNDER CONSTRUCTION",
      badge: "4th Floor - South Wing",
      hours: "Closed for Renovation",
      head: "City Engineering",
      requirements: []
    },
    "restroom-cr-4": {
      title: "Comfort Room",
      badge: "4th Floor - Center",
      hours: "Open 24/7",
      head: "Public Utilities",
      requirements: []
    }
  },
  5: {
    "legal-office": {
      title: "CITY LEGAL OFFICE",
      badge: "5th Floor - West",
      hours: "8:00 AM - 5:00 PM",
      phone: "(046) 483-9370",
      head: "Ms. Marilyn Aala",
      description: "The City Legal Office is the legal counsel of the city government. It drafts and reviews contracts, ordinances, and legal opinions, represents the city in cases and administrative proceedings, and gives legal guidance to the city offices.",
      descriptionTl: "Ang City Legal Office ang tagapayong legal ng pamahalaang lungsod. Gumagawa at sumusuri ito ng mga kontrata, ordinansa, at legal na opinyon; kinakatawan ang lungsod sa mga kaso at administratibong pagdinig; at nagbibigay ng legal na gabay sa mga tanggapan ng lungsod.",
      requirements: ["Legal Documents"]
    },
    "hr-office": {
      title: "HUMAN RESOURCES MANAGEMENT OFFICE",
      badge: "5th Floor - North",
      hours: "8:00 AM - 5:00 PM",
      phone: "(046) 483-9370",
      local: "506",
      head: "Ms. Mariza Agustin",
      description: "The Human Resources Management Office handles the recruitment, appointment, and records of city government personnel. It processes applications and job openings, manages employee benefits, leave, and training, and issues service records and certificates of employment.",
      descriptionTl: "Hinahawakan ng Human Resources Management Office ang pagkuha, pagtatalaga, at mga talaan ng mga kawani ng pamahalaang lungsod. Pinoproseso nito ang mga aplikasyon at bakanteng posisyon; pinamamahalaan ang benepisyo, leave, at pagsasanay ng mga empleyado; at naglalabas ng service record at certificate of employment.",
      requirements: ["Application Forms", "IDs"]
    },
    "admin-office": {
      title: "ADMINISTRATOR'S OFFICE",
      badge: "5th Floor - East",
      hours: "8:00 AM - 5:00 PM",
      phone: "(046) 483-9371",
      head: "Ms. Alma A. Malabanan",
      description: "The City Administrator's Office oversees the day-to-day operations of the city government and coordinates the work of all departments. It carries out the policies and directives of the Mayor, supervises administrative and support services, and acts on matters that cut across several offices.",
      descriptionTl: "Pinangangasiwaan ng City Administrator's Office ang araw-araw na operasyon ng pamahalaang lungsod at pinag-uugnay ang gawain ng lahat ng departamento. Isinasagawa nito ang mga patakaran at direktiba ng Mayor, pinangangasiwaan ang mga serbisyong pang-administratibo at pansuporta, at inaaksyunan ang mga usaping sumasaklaw sa ilang tanggapan.",
      requirements: ["Appointment Schedule"]
    },
    "const-south-5": {
      title: "UNDER CONSTRUCTION",
      badge: "5th Floor - South",
      hours: "Closed for Renovation",
      head: "City Engineering",
      requirements: []
    },
    "restroom-cr-5": {
      title: "Comfort Room",
      badge: "5th Floor - Center",
      hours: "Open 24/7",
      head: "Public Utilities",
      requirements: []
    }
  },
  6: {
    "wedding-hall": {
      title: "WEDDING HALL",
      badge: "6th Floor - West Wing",
      hours: "By Reservation",
      head: "Events Coordinator",
      description: "The Wedding Hall is an elegant venue available for civil wedding ceremonies and receptions within Tagaytay City Hall. It offers a dignified and memorable setting for couples celebrating their union, reflecting the city's reputation as one of the Philippines' most sought-after wedding destinations. The hall can be reserved through the appropriate city government office.",
      descriptionTl: "Ang Wedding Hall ay eleganteng lugar para sa mga civil wedding at handaan sa loob ng Tagaytay City Hall. Nagbibigay ito ng marangal at di-malilimutang lugar para sa magkasintahang nagdiriwang ng kanilang pag-iisang dibdib — angkop sa Tagaytay bilang isa sa mga pinakahinahanap na lugar para sa kasal sa Pilipinas. Maaari itong ipareserba sa kinauukulang tanggapan ng pamahalaang lungsod.",
      requirements: ["Event Booking Confirmation"]
    },
    "conference-hall": {
      title: "CONFERENCE HALL",
      badge: "6th Floor - South Wing",
      hours: "By Reservation",
      head: "Events Coordinator",
      description: "The Conference Hall on the 6th floor is a fully equipped venue designed for official meetings, seminars, training sessions, and government forums. It accommodates delegations, inter-agency conferences, and large-scale official gatherings, providing a professional environment that supports the administrative and governance functions of Tagaytay City Hall.",
      descriptionTl: "Ang Conference Hall sa ika-6 na palapag ay kumpleto sa kagamitan para sa mga opisyal na pulong, seminar, pagsasanay, at forum ng pamahalaan. Kasya rito ang mga delegasyon, mga kumperensya ng iba't ibang ahensya, at malalaking opisyal na pagtitipon — isang propesyonal na lugar na sumusuporta sa pangangasiwa at pamamahala ng Tagaytay City Hall.",
      requirements: ["Event Booking Confirmation"]
    },
    "restroom-cr-6": {
      title: "Comfort Room",
      badge: "6th Floor - Center",
      hours: "Open 24/7",
      head: "Public Utilities",
      requirements: []
    }
  },
  7: {
    "mayor-main": {
      title: "MAYOR'S OFFICE",
      badge: "7th Floor",
      hours: "8:00 AM - 5:00 PM",
      phone: "(046) 483-9379",
      local: "702",
      head: "Analus Angcaya",
      description: "The Office of the Mayor is the seat of the city's executive leadership, where the policies, programs, and official decisions for Tagaytay are made. It handles appointments with the Mayor, the signing of official documents, and matters raised from the other city offices.",
      descriptionTl: "Ang Office of the Mayor ang sentro ng ehekutibong pamumuno ng lungsod, kung saan binubuo ang mga patakaran, programa, at opisyal na desisyon para sa Tagaytay. Inaasikaso nito ang mga appointment sa Mayor, ang paglagda sa mga opisyal na dokumento, at ang mga usaping idinudulog mula sa ibang tanggapan ng lungsod.",
      requirements: ["Appointment"]
    },
    "mayor-receiving": {
      title: "MAYOR'S OFFICE - RECEIVING",
      badge: "7th Floor",
      hours: "8:00 AM - 5:00 PM",
      phone: "(046) 483-9378",
      head: "Ms. Jovie A. Maguinao",
      description: "The Receiving Unit of the Mayor's Office accepts the letters, requests, invitations, and documents addressed to the Mayor. Staff here log incoming communications, set appointments, and endorse concerns to the proper office for action.",
      descriptionTl: "Tinatanggap ng Receiving Unit ng Mayor's Office ang mga liham, kahilingan, imbitasyon, at dokumentong para sa Mayor. Itinatala ng mga kawani rito ang mga papasok na komunikasyon, nagtatakda ng mga appointment, at ipinapasa ang mga hinaing sa tamang tanggapan para maaksyunan.",
      requirements: ["ID"]
    }
  }
};
