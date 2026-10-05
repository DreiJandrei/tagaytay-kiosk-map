// Default office data for database initialization
// This contains only the text fields that administrators can update
// Coordinate data stays secure in coordinateMapping.js

export const defaultOfficeData = {
  1: {
    "tolentino-hall": {
      title: "Tolentino Hall",
      badge: "1st Floor - Rear Grand Concourse",
      hours: "8:00 AM - 5:00 PM (Event Dependent)",
      head: "General Services Office (GSO)",
      description: "Tolentino Hall is the main multi-purpose civic hall of Tagaytay City Hall, named in honor of a distinguished public servant. It serves as the primary venue for official city government functions, public assemblies, community hearings, orientations, and large-scale events — making it a central hub for democratic participation and public engagement.",
      requirements: ["Approved Event Booking Clearance", "Valid Government ID Pass"]
    },
    "cultural-hall": {
      title: "Cultural Hall",
      badge: "1st Floor - West Wing Complex",
      hours: "8:00 AM - 5:00 PM",
      head: "Tourism & Cultural Development Division",
      description: "The Cultural Hall is a dedicated venue celebrating the rich arts, heritage, and traditions of Tagaytay City. It hosts cultural presentations, exhibits, performances, and community gatherings that promote local identity and civic pride. The hall provides a space for residents and visitors to appreciate the city's vibrant cultural life and diverse community programs.",
      requirements: ["Venue Reservation Authorization", "Valid ID"]
    },
    "canteen": {
      title: "Canteen",
      badge: "1st Floor - Left Courtyard Wing",
      hours: "7:00 AM - 5:00 PM",
      head: "Dietary & Food Services",
      description: "The Canteen serves affordable meals, snacks, and refreshments to City Hall employees and to the public transacting in the building. It is also a place to sit and rest during long transactions, with seating available through the day.",
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
      requirements: ["Press Credentials", "Document Request Form"]
    },
    "csu-office": {
      title: "Civil Security Unit Office",
      badge: "1st Floor - Central Concourse Wall",
      hours: "24/7 Safety Dispatch Window",
      phone: "(046) 483-9370",
      head: "Mr. Jimmy M. Quito",
      description: "The Civil Security Unit is responsible for the safety and order of Tagaytay City Hall and its grounds. It manages the guard posts and visitor screening, responds to incidents inside the building, and receives reports and complaints concerning security, lost items, and public safety.",
      requirements: ["Incident Lodging Form Registry", "Valid ID"]
    },
    "barangay-affairs": {
      title: "Barangay Affairs Office",
      badge: "1st Floor - Central Concourse Wall",
      hours: "8:00 AM - 5:00 PM (Mon-Fri)",
      phone: "(046) 483-9372",
      head: "Mr. Edwin Borja",
      description: "The Barangay Affairs Office is the link between the city government and the barangays of Tagaytay. It assists barangay officials with endorsements and the coordination of programs and resolutions, and takes up concerns raised by barangay councils that need action at the city level.",
      requirements: ["Barangay Council Endorsement Letter", "Community Tax Certificate"]
    },
    "tourism-office": {
      title: "Tourism & Cultural Development",
      badge: "1st Floor - Central Concourse Gate",
      hours: "8:00 AM - 5:00 PM (Mon-Sat)",
      phone: "(046) 483-9372",
      head: "Ms. Faith Maranan",
      description: "The Tourism and Cultural Development Office promotes Tagaytay as a destination and supports the city's cultural programs. It assists tourists with information on attractions, accommodations, and events, processes the accreditation of tourism establishments and guides, and organizes festivals and heritage activities through the year.",
      requirements: ["Accreditation Documents Pack", "Valid State ID"]
    },
    "breastfeeding-room": {
      title: "Breastfeeding Room",
      badge: "1st Floor - East Wing Utilities",
      hours: "8:00 AM - 5:00 PM",
      head: "City Health Office Division",
      description: "The Breastfeeding Room is a private, clean, and comfortable space set aside for mothers who need to nurse or express milk while at City Hall. It is open to both employees and visitors, in support of the city's maternal and child health programs.",
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
      requirements: ["Valid ID for Visitor Logbook"]
    },
    "guard": {
      title: "Guard Post",
      badge: "1st Floor - Main Entrance (Right Side)",
      hours: "Open 24/7",
      head: "Civil Security Unit",
      description: "The Guard Post at the main entrance is where visitors are received and logged before entering City Hall. The guards on duty check identification, issue visitor passes, give basic directions, and keep watch over the entrance around the clock.",
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
      requirements: ["Permit Forms", "Valid ID"]
    },
    "city-eng": {
      title: "City Engineering Office",
      badge: "2nd Floor - West",
      hours: "8:00 AM - 5:00 PM",
      phone: "(046) 483-9374",
      head: "Mr. Noel Baybay",
      description: "The City Engineering Office plans, carries out, and supervises the city's public infrastructure — roads, drainage, bridges, and government buildings. It prepares project designs and cost estimates, oversees contractors and ongoing works, and attends to reports of damaged public facilities.",
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
      requirements: ["Bidding Documents"]
    },
    "planning": {
      title: "City Planning and Development Office",
      badge: "2nd Floor - East",
      hours: "8:00 AM - 5:00 PM",
      phone: "(046) 483-9373",
      head: "Engr. Emma Pello",
      description: "The City Planning and Development Office prepares the city's comprehensive land use and development plans, and reviews projects for consistency with them. It issues locational and zoning clearances, keeps the socio-economic data of Tagaytay, and coordinates the programming of development projects across offices.",
      requirements: ["Clearance"]
    },
    "back-ext": {
      title: "Back Extension Office",
      badge: "2nd Floor - East",
      hours: "8:00 AM - 5:00 PM",
      head: "Admin Officer",
      description: "The Back Extension Office holds administrative support units and additional workspace for staff assigned to this floor. Visitors are usually directed here by the office already handling their transaction.",
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
      requirements: ["Permit Forms"]
    },
    "budget-office": {
      title: "BUDGET OFFICE",
      badge: "3rd Floor - North",
      hours: "8:00 AM - 5:00 PM",
      phone: "(046) 483-9375",
      head: "Ms. Merly Hernando",
      description: "The City Budget Office prepares and manages the annual budget of the city government. It reviews the funding proposals of every office, certifies that appropriations are available before spending, and monitors expenditures against the approved budget through the year.",
      requirements: ["Budget Proposal Form"]
    },
    "internal-audit": {
      title: "INTERNAL AUDIT SERVICES",
      badge: "3rd Floor - North",
      hours: "8:00 AM - 5:00 PM",
      phone: "(046) 483-9375",
      head: "Ms. Sylvia Constante",
      description: "The Internal Audit Services Office independently reviews the operations, controls, and transactions of the city government. It examines compliance with laws and internal policies, evaluates how public funds and property are safeguarded, and recommends improvements to management.",
      requirements: []
    },
    "treasure-office": {
      title: "CITY TREASURE OFFICE",
      badge: "3rd Floor - East",
      hours: "8:00 AM - 5:00 PM",
      phone: "(046) 483-9377",
      head: "Ms. Josephine Caraan",
      description: "The City Treasurer's Office collects the revenues of the city — real property taxes, business taxes, fees, and other charges — and keeps custody of city funds. Payments are made and official receipts issued here, and the office also attends to tax clearances and billing inquiries.",
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
      title: "🚧 UNDER CONSTRUCTION",
      badge: "4th Floor - West Wing",
      hours: "Closed for Renovation",
      head: "City Engineering",
      requirements: []
    },
    "const-north": {
      title: "🚧 UNDER CONSTRUCTION",
      badge: "4th Floor - North Wing",
      hours: "Closed for Renovation",
      head: "City Engineering",
      requirements: []
    },
    "const-east": {
      title: "🚧 UNDER CONSTRUCTION",
      badge: "4th Floor - East Wing",
      hours: "Closed for Renovation",
      head: "City Engineering",
      requirements: []
    },
    "const-south": {
      title: "🚧 UNDER CONSTRUCTION",
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
      requirements: ["Application Forms", "IDs"]
    },
    "admin-office": {
      title: "ADMINISTRATOR'S OFFICE",
      badge: "5th Floor - East",
      hours: "8:00 AM - 5:00 PM",
      phone: "(046) 483-9371",
      head: "Ms. Alma A. Malabanan",
      description: "The City Administrator's Office oversees the day-to-day operations of the city government and coordinates the work of all departments. It carries out the policies and directives of the Mayor, supervises administrative and support services, and acts on matters that cut across several offices.",
      requirements: ["Appointment Schedule"]
    },
    "const-south-5": {
      title: "🚧 UNDER CONSTRUCTION",
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
      requirements: ["Event Booking Confirmation"]
    },
    "conference-hall": {
      title: "CONFERENCE HALL",
      badge: "6th Floor - South Wing",
      hours: "By Reservation",
      head: "Events Coordinator",
      description: "The Conference Hall on the 6th floor is a fully equipped venue designed for official meetings, seminars, training sessions, and government forums. It accommodates delegations, inter-agency conferences, and large-scale official gatherings, providing a professional environment that supports the administrative and governance functions of Tagaytay City Hall.",
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
      requirements: ["Appointment"]
    },
    "mayor-receiving": {
      title: "MAYOR'S OFFICE - RECEIVING",
      badge: "7th Floor",
      hours: "8:00 AM - 5:00 PM",
      phone: "(046) 483-9378",
      head: "Ms. Jovie A. Maguinao",
      description: "The Receiving Unit of the Mayor's Office accepts the letters, requests, invitations, and documents addressed to the Mayor. Staff here log incoming communications, set appointments, and endorse concerns to the proper office for action.",
      requirements: ["ID"]
    }
  }
};
