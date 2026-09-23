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
      requirements: ["Cash or Digital Wallet (Gcash) Payment"]
    },
    "pio-1": {
      title: "Public Information Office (Dept A)",
      badge: "1st Floor - West Wing Corridor",
      hours: "8:00 AM - 5:00 PM (Mon-Fri)",
      phone: "(046) 483-9372",
      local: "106",
      head: "Ms. Sonia S. Mendoza",
      requirements: ["Press Credentials", "Document Request Form"]
    },
    "pio-2": {
      title: "Public Information Office (Dept B)",
      badge: "1st Floor - West Wing Corridor",
      hours: "8:00 AM - 5:00 PM (Mon-Fri)",
      phone: "(046) 483-9372",
      local: "106",
      head: "Staff",
      requirements: ["Press Credentials", "Document Request Form"]
    },
    "csu-office": {
      title: "Civil Security Unit Office",
      badge: "1st Floor - Central Concourse Wall",
      hours: "24/7 Safety Dispatch Window",
      phone: "(046) 483-9370",
      head: "Mr. Jimmy M. Quito",
      requirements: ["Incident Lodging Form Registry", "Valid ID"]
    },
    "barangay-affairs": {
      title: "Barangay Affairs Office",
      badge: "1st Floor - Central Concourse Wall",
      hours: "8:00 AM - 5:00 PM (Mon-Fri)",
      phone: "(046) 483-9372",
      head: "Mr. Edwin Borja",
      requirements: ["Barangay Council Endorsement Letter", "Community Tax Certificate"]
    },
    "tourism-office": {
      title: "Tourism & Cultural Development",
      badge: "1st Floor - Central Concourse Gate",
      hours: "8:00 AM - 5:00 PM (Mon-Sat)",
      phone: "(046) 483-9372",
      head: "Ms. Faith Maranan",
      requirements: ["Accreditation Documents Pack", "Valid State ID"]
    },
    "breastfeeding-room": {
      title: "Breastfeeding Room",
      badge: "1st Floor - East Wing Utilities",
      hours: "8:00 AM - 5:00 PM",
      head: "City Health Office Division",
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
      requirements: ["Valid ID for Visitor Logbook"]
    },
    "guard": {
      title: "Guard Post",
      badge: "1st Floor - Main Entrance (Right Side)",
      hours: "Open 24/7",
      head: "Civil Security Unit",
      requirements: ["Valid ID", "Visitor Pass Registration"]
    }
  },
  2: {
    "bldg-official": {
      title: "Office of the Building Official",
      badge: "2nd Floor - West",
      hours: "8:00 AM - 5:00 PM",
      head: "Building Official",
      requirements: ["Permit Forms", "Valid ID"]
    },
    "city-eng": {
      title: "City Engineering Office",
      badge: "2nd Floor - West",
      hours: "8:00 AM - 5:00 PM",
      phone: "(046) 483-9374",
      head: "Mr. Noel Baybay",
      requirements: ["Project Plans"]
    },
    "housing": {
      title: "Tagaytay Housing Office",
      badge: "2nd Floor - West",
      hours: "8:00 AM - 5:00 PM",
      phone: "(046) 483-9370",
      local: "207",
      head: "Ms. Mabel Perea",
      requirements: ["Application Form"]
    },
    "bac": {
      title: "Bids and Awards Committee",
      badge: "2nd Floor - Center",
      hours: "8:00 AM - 5:00 PM",
      phone: "(046) 483-9376",
      local: "206",
      head: "Staff",
      requirements: ["Bidding Documents"]
    },
    "planning": {
      title: "City Planning and Development Office",
      badge: "2nd Floor - East",
      hours: "8:00 AM - 5:00 PM",
      phone: "(046) 483-9373",
      head: "Engr. Emma Pello",
      requirements: ["Clearance"]
    },
    "back-ext": {
      title: "Back Extension Office",
      badge: "2nd Floor - East",
      hours: "8:00 AM - 5:00 PM",
      head: "Admin Officer",
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
      requirements: ["Library Card"]
    }
  },
  3: {
    "building-official": {
      title: "OFFICE OF THE BUILDING OFFICIAL",
      badge: "3rd Floor - West",
      hours: "8:00 AM - 5:00 PM",
      head: "Building Official",
      requirements: ["Permit Forms"]
    },
    "budget-office": {
      title: "BUDGET OFFICE",
      badge: "3rd Floor - North",
      hours: "8:00 AM - 5:00 PM",
      phone: "(046) 483-9375",
      head: "Ms. Merly Hernando",
      requirements: ["Budget Proposal Form"]
    },
    "internal-audit": {
      title: "INTERNAL AUDIT SERVICES",
      badge: "3rd Floor - North",
      hours: "8:00 AM - 5:00 PM",
      phone: "(046) 483-9375",
      head: "Ms. Sylvia Constante",
      requirements: []
    },
    "treasure-office": {
      title: "CITY TREASURE OFFICE",
      badge: "3rd Floor - East",
      hours: "8:00 AM - 5:00 PM",
      phone: "(046) 483-9377",
      head: "Ms. Josephine Caraan",
      requirements: ["Payment Slips"]
    },
    "accounting-office": {
      title: "CITY ACCOUNTING OFFICE",
      badge: "3rd Floor - South",
      hours: "8:00 AM - 5:00 PM",
      phone: "(046) 483-9376",
      local: "300",
      head: "Ms. Rhea Amon",
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
      requirements: ["Legal Documents"]
    },
    "hr-office": {
      title: "HUMAN RESOURCES MANAGEMENT OFFICE",
      badge: "5th Floor - North",
      hours: "8:00 AM - 5:00 PM",
      phone: "(046) 483-9370",
      local: "506",
      head: "Ms. Mariza Agustin",
      requirements: ["Application Forms", "IDs"]
    },
    "admin-office": {
      title: "ADMINISTRATOR'S OFFICE",
      badge: "5th Floor - East",
      hours: "8:00 AM - 5:00 PM",
      phone: "(046) 483-9371",
      head: "Ms. Alma A. Malabanan",
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
      requirements: ["Appointment"]
    },
    "mayor-receiving": {
      title: "MAYOR'S OFFICE - RECEIVING",
      badge: "7th Floor",
      hours: "8:00 AM - 5:00 PM",
      phone: "(046) 483-9378",
      head: "Ms. Jovie A. Maguinao",
      requirements: ["ID"]
    }
  }
};
