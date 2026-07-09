// ==========================================================
// COORDINATE MAPPING DATA - SECURE FRONTEND ONLY
// ==========================================================
// This file contains all physical coordinate data, path routing,
// and visual styling for the interactive map.
// This data stays in the frontend and is NOT stored in the database.

export const coordinateMapping = {
  1: {
    // Sa loob ng coordinateMapping.js (Floor 1 section)
"floor1-wall": { 
    type: "grey-wall", 
    x: 10,    // I-adjust kung kailangan i-center
    y: 10,    // I-adjust kung kailangan i-center
    w: 1400,  // GAWIN MONG MAS MALAKI (e.g., 1400)
    h: 1200   // GAWIN MONG MAS MALAKI (e.g., 1200)
},
      "tolentino-hall": {
          targetX: 1030, targetY: 260, pathData: "M 1030 1000 L 1030 300",
          style: { width: 940, height: 180, left: 370, top: 120 }, cssClass: "theme-amber"
      },
      "cultural-hall": {
          targetX: 500, targetY: 540, pathData: "M 1030 1000 L 1030 710 L 625 710 L 625 585 L 500 585 L 500 540",
          style: { width: 260, height: 240, left: 370, top: 320 }, cssClass: "theme-cyan"
      },
      "canteen": {
          targetX: 190, targetY: 530, pathData: "M 1030 1000 L 1030 710 L 190 710 L 190 650",
          style: { width: 280, height: 250, left: 50, top: 400 }, cssClass: "theme-blue"
      },
      "pio-1": {
          targetX: 695, targetY: 495, pathData: "M 1030 1000 L 1030 710 L 695 710 L 695 660",
          style: { width: 90, height: 340, left: 650, top: 320 }, cssClass: "theme-purple vertical-text-wrapper"
      },
      "pio-2": {
          targetX: 785, targetY: 495, pathData: "M 1030 1000 L 1030 710 L 785 710 L 785 660",
          style: { width: 90, height: 340, left: 740, top: 320 }, cssClass: "theme-purple vertical-text-wrapper"
      },
      "csu-office": {
          targetX: 990, targetY: 370, pathData: "M 1030 1000 L 1030 370 L 1010 370",
          style: { width: 180, height: 100, left: 830, top: 320 }, cssClass: "theme-teal"
      },
      "barangay-affairs": {
          targetX: 990, targetY: 490, pathData: "M 1030 1000 L 1030 490 L 1010 490",
          style: { width: 180, height: 100, left: 830, top: 440 }, cssClass: "theme-teal"
      },
      "tourism-office": {
          targetX: 990, targetY: 615, pathData: "M 1030 1000 L 1030 615 L 1010 615",
          style: { width: 180, height: 110, left: 830, top: 560 }, cssClass: "theme-teal"
      },
      "breastfeeding-room": {
          targetX: 1060, targetY: 450, pathData: "M 1030 1000 L 1030 450 L 1040 450",
          style: { width: 270, height: 260, left: 1040, top: 320 }, cssClass: "theme-cyan"
      },
      "restroom-cr": {
          targetX: 1060, targetY: 635, pathData: "M 1030 1000 L 1030 635 L 1040 635",
          style: { width: 270, height: 70, left: 1040, top: 600 }, cssClass: "theme-gray",
          isDirectionOnly: true
      }
  },
  2: {
      "bldg-official": {
          targetX: 100, targetY: 220, pathData: "M 860 490 L 860 470 L 680 470 L 680 260 L 100 260 L 100 220",
          style: { width: 100, height: 120, left: 50, top: 100, backgroundColor: '#4dd0e1', color: 'black' }, cssClass: ""
      },
      "city-eng": {
          targetX: 210, targetY: 220, pathData: "M 860 490 L 860 470 L 680 470 L 680 260 L 210 260 L 210 220",
          style: { width: 120, height: 120, left: 150, top: 100, backgroundColor: '#818cf8', color: 'white' }, cssClass: ""
      },
      "housing": {
          targetX: 330, targetY: 220, pathData: "M 860 490 L 860 470 L 680 470 L 680 260 L 330 260 L 330 220",
          style: { width: 120, height: 120, left: 270, top: 100, backgroundColor: '#fbcfe8', color: 'black' }, cssClass: ""
      },
      "bac": {
          targetX: 450, targetY: 220, pathData: "M 860 490 L 860 470 L 680 470 L 680 260 L 450 260 L 450 220",
          style: { width: 120, height: 120, left: 390, top: 100, backgroundColor: '#67e8f9', color: 'black' }, cssClass: ""
      },
      "planning": {
          targetX: 685, targetY: 220, pathData: "M 860 490 L 860 470 L 680 470 L 680 260 L 685 260 L 685 220",
          style: { width: 350, height: 120, left: 510, top: 100, backgroundColor: '#38bdf8', color: 'black' }, cssClass: ""
      },
      "back-ext": {
          targetX: 935, targetY: 220, pathData: "M 860 490 L 860 470 L 680 470 L 680 260 L 935 260 L 935 220",
          style: { width: 150, height: 120, left: 860, top: 100, backgroundColor: '#d8b4fe', color: 'black' }, cssClass: ""
      },
      "restroom-cr-2": {
          targetX: 835, targetY: 340, pathData: "M 860 490 L 860 470 L 680 470 L 680 260 L 835 260 L 835 340",
          style: { width: 140, height: 60, left: 780, top: 310, backgroundColor: '#93c5fd', color: 'black' }, cssClass: "",
          isDirectionOnly: true
      },
      "library": {
          targetX: 250, targetY: 600, pathData: "M 860 490 L 860 470 L 530 470 L 530 560 L 250 560 L 250 600",
          style: { width: 300, height: 200, left: 100, top: 600, backgroundColor: '#a3e635', color: 'black' }, cssClass: ""
      }
  },
  3: {
      "building-official": {
          targetX: 410, targetY: 460, pathData: "M 620 480 L 450 480 L 450 460 L 410 460",
          style: { width: 190, height: 250, left: 180, top: 330, backgroundColor: '#911e1f', color: 'white', textAlign: 'center' }, cssClass: ""
      },
      "budget-office": {
          targetX: 540, targetY: 270, pathData: "M 620 480 L 450 480 L 450 285 L 540 285 L 540 270",
          style: { width: 170, height: 130, left: 440, top: 110, backgroundColor: '#0c6046', color: 'white', textAlign: 'center' }, cssClass: ""
      },
      "internal-audit": {
          targetX: 710, targetY: 270, pathData: "M 620 480 L 770 480 L 770 285 L 710 285 L 710 270",
          style: { width: 110, height: 130, left: 660, top: 110, backgroundColor: '#0c6046', color: 'white' }, cssClass: "vertical-text-wrapper"
      },
      "treasure-office": {
          targetX: 820, targetY: 390, pathData: "M 620 480 L 770 480 L 770 390 L 820 390",
          style: { width: 200, height: 350, left: 850, top: 200, backgroundColor: '#0c6046', color: 'white', textAlign: 'center' }, cssClass: ""
      },
      "accounting-office": {
          targetX: 620, targetY: 520, pathData: "M 620 480 L 620 520",
          style: { width: 240, height: 160, left: 510, top: 550, backgroundColor: '#0c6046', color: 'white', textAlign: 'center' }, cssClass: ""
      },
      "restroom-cr-3": {
          targetX: 620, targetY: 350, pathData: "M 620 480 L 450 480 L 450 285 L 620 285 L 620 350",
          style: { width: 140, height: 60, left: 550, top: 320, backgroundColor: '#93c5fd', color: 'black' }, cssClass: "",
          isDirectionOnly: true
      }
  },
  4: {
      "const-west": {
          targetX: 410, targetY: 460, pathData: "M 620 480 L 450 480 L 450 460 L 410 460",
          style: { width: 190, height: 250, left: 180, top: 330, backgroundColor: '#cbd5e1', color: '#334155', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }, cssClass: ""
      },
      "const-north": {
          targetX: 540, targetY: 270, pathData: "M 620 480 L 450 480 L 450 285 L 540 285 L 540 270",
          style: { width: 330, height: 130, left: 440, top: 110, backgroundColor: '#cbd5e1', color: '#334155', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }, cssClass: ""
      },
      "const-east": {
          targetX: 820, targetY: 390, pathData: "M 620 480 L 770 480 L 770 390 L 820 390",
          style: { width: 200, height: 350, left: 850, top: 200, backgroundColor: '#cbd5e1', color: '#334155', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }, cssClass: ""
      },
      "const-south": {
          targetX: 620, targetY: 520, pathData: "M 620 480 L 620 520",
          style: { width: 240, height: 160, left: 510, top: 550, backgroundColor: '#cbd5e1', color: '#334155', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }, cssClass: ""
      },
      "restroom-cr-4": {
          targetX: 620, targetY: 350, pathData: "M 620 480 L 450 480 L 450 285 L 620 285 L 620 350",
          style: { width: 140, height: 60, left: 550, top: 320, backgroundColor: '#93c5fd', color: 'black' }, cssClass: "",
          isDirectionOnly: true
      }
  },
  5: {
      "legal-office": {
          targetX: 410, targetY: 460, pathData: "M 620 480 L 450 480 L 450 460 L 410 460",
          style: { width: 190, height: 250, left: 180, top: 330, backgroundColor: '#4f46e5', color: 'white', textAlign: 'center' }, cssClass: ""
      },
      "hr-office": {
          targetX: 600, targetY: 270, pathData: "M 620 480 L 450 480 L 450 285 L 600 285 L 600 270",
          style: { width: 330, height: 130, left: 440, top: 110, backgroundColor: '#4f46e5', color: 'white', textAlign: 'center' }, cssClass: ""
      },
      "admin-office": {
          targetX: 820, targetY: 390, pathData: "M 620 480 L 770 480 L 770 390 L 820 390",
          style: { width: 200, height: 350, left: 850, top: 200, backgroundColor: '#4f46e5', color: 'white', textAlign: 'center' }, cssClass: "vertical-text-wrapper"
      },
      "const-south-5": {
          targetX: 620, targetY: 520, pathData: "M 620 480 L 620 520",
          style: { width: 240, height: 160, left: 510, top: 550, backgroundColor: '#cbd5e1', color: '#334155', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }, cssClass: ""
      },
      "restroom-cr-5": {
          targetX: 620, targetY: 350, pathData: "M 620 480 L 450 480 L 450 285 L 620 285 L 620 350",
          style: { width: 140, height: 60, left: 550, top: 320, backgroundColor: '#93c5fd', color: 'black' }, cssClass: "",
          isDirectionOnly: true
      }
  },
6: {
      "wedding-hall": {
          targetX: 450, targetY: 480, pathData: "M 650 480 L 450 480",
          style: { width: 200, height: 500, left: 250, top: 150, backgroundColor: '#c2410c', color: 'white', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }, cssClass: ""
      },
     "conference-hall": {
          targetX: 700, targetY: 650, 
          pathData: "M 700 480 L 850 480 L 850 620 L 700 620 L 700 650",
          style: { width: 400, height: 200, left: 500, top: 650, backgroundColor: '#c2410c', color: 'white', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }, cssClass: ""
      },
      "restroom-cr-6": {
          targetX: 650, targetY: 200, pathData: "M 650 480 L 480 480 L 480 120 L 650 120 L 650 200",
          style: { width: 200, height: 80, left: 550, top: 200, backgroundColor: '#93c5fd', color: 'black' }, cssClass: "",
          isDirectionOnly: true
      }
  },
  7: {
        "mayor-main": { 
            targetX: 250, 
            targetY: 400, 
            pathData: "M 580 340 L 580 400 L 250 400", 
            style: { width: 400, height: 400, left: 50, top: 50, backgroundColor: '#4338ca', color: 'white', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', borderRadius: '4px' }, 
            cssClass: "" 
        },
        "mayor-receiving": { 
            targetX: 870, 
            targetY: 730, 
            pathData: "M 580 340 L 580 400 L 870 400 L 870 730", 
            style: { width: 360, height: 265, left: 590, top: 605, backgroundColor: '#4338ca', color: 'white', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', borderRadius: '4px' }, 
            cssClass: "" 
        }
    }
};

// Function to merge coordinate data with database data
export const mergeOfficeData = (coordinateData, databaseData) => {
  const merged = {};
  
  Object.keys(coordinateData).forEach(structural => {
    merged[floor] = {};
    
    Object.keys(coordinateData[floor]).forEach(officeKey => {
      merged[floor][officeKey] = {
        // Start with coordinate/style data (always from frontend)
        ...coordinateData[floor][officeKey],
        // Merge with database data if available (dynamic fields)
        ...(databaseData[floor] && databaseData[floor][officeKey] ? databaseData[floor][officeKey] : {})
      };
    });
  });
  
  return merged;
};
