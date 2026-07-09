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
      requirements: ["Approved Event Booking Clearance", "Valid Government ID Pass"]
    },
    "cultural-hall": {
      title: "Cultural Hall",
      badge: "1st Floor - West Wing Complex",
      hours: "8:00 AM - 5:00 PM",
      head: "Tourism & Cultural Development Division",
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
      head: "City Information Officer",
      requirements: ["Press Credentials", "Document Request Form"]
    },
    "pio-2": {
      title: "Public Information Office (Dept B)",
      badge: "1st Floor - West Wing Corridor",
      hours: "8:00 AM - 5:00 PM (Mon-Fri)",
      head: "City Information Officer",
      requirements: ["Press Credentials", "Document Request Form"]
    },
    "csu-office": {
      title: "Civil Security Unit Office",
      badge: "1st Floor - Central Concourse Wall",
      hours: "24/7 Safety Dispatch Window",
      head: "Chief of Civil Security Services",
      requirements: ["Incident Lodging Form Registry", "Valid ID"]
    },
    "barangay-affairs": {
      title: "Barangay Affairs Office",
      badge: "1st Floor - Central Concourse Wall",
      hours: "8:00 AM - 5:00 PM (Mon-Fri)",
      head: "Head of Barangay Relations",
      requirements: ["Barangay Council Endorsement Letter", "Community Tax Certificate"]
    },
    "tourism-office": {
      title: "Tourism & Cultural Development",
      badge: "1st Floor - Central Concourse Gate",
      hours: "8:00 AM - 5:00 PM (Mon-Sat)",
      head: "Supervising Tourism Officer",
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
      head: "City Engineer",
      requirements: ["Project Plans"]
    },
    "housing": {
      title: "Tagaytay Housing Office",
      badge: "2nd Floor - West",
      hours: "8:00 AM - 5:00 PM",
      head: "Housing Officer",
      requirements: ["Application Form"]
    },
    "bac": {
      title: "Bids and Awards Committee",
      badge: "2nd Floor - Center",
      hours: "8:00 AM - 5:00 PM",
      head: "BAC Chairman",
      requirements: ["Bidding Documents"]
    },
    "planning": {
      title: "City Planning and Development Office",
      badge: "2nd Floor - East",
      hours: "8:00 AM - 5:00 PM",
      head: "Planning Officer",
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
      head: "Budget Officer",
      requirements: ["Budget Proposal Form"]
    },
    "internal-audit": {
      title: "INTERNAL AUDIT SERVICES",
      badge: "3rd Floor - North",
      hours: "8:00 AM - 5:00 PM",
      head: "Auditor",
      requirements: []
    },
    "treasure-office": {
      title: "CITY TREASURE OFFICE",
      badge: "3rd Floor - East",
      hours: "8:00 AM - 5:00 PM",
      head: "City Treasurer",
      requirements: ["Payment Slips"]
    },
    "accounting-office": {
      title: "CITY ACCOUNTING OFFICE",
      badge: "3rd Floor - South",
      hours: "8:00 AM - 5:00 PM",
      head: "Chief Accountant",
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
      head: "City Legal Officer",
      requirements: ["Legal Documents"]
    },
    "hr-office": {
      title: "HUMAN RESOURCES MANAGEMENT OFFICE",
      badge: "5th Floor - North",
      hours: "8:00 AM - 5:00 PM",
      head: "HR Officer",
      requirements: ["Application Forms", "IDs"]
    },
    "admin-office": {
      title: "ADMINISTRATOR'S OFFICE",
      badge: "5th Floor - East",
      hours: "8:00 AM - 5:00 PM",
      head: "City Administrator",
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
      requirements: ["Event Booking Confirmation"]
    },
    "conference-hall": {
      title: "CONFERENCE HALL",
      badge: "6th Floor - South Wing",
      hours: "By Reservation",
      head: "Events Coordinator",
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
      head: "City Mayor",
      requirements: ["Appointment"]
    },
    "mayor-receiving": {
      title: "MAYOR'S OFFICE - RECEIVING",
      badge: "7th Floor",
      hours: "8:00 AM - 5:00 PM",
      head: "Receiving",
      requirements: ["ID"]
    }
  }
};
