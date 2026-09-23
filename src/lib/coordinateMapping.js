// ==========================================================
// COORDINATE MAPPING DATA - SECURE FRONTEND ONLY
// ==========================================================
// This file contains all physical coordinate data, path routing,
// and visual styling for the interactive map.
// This data stays in the frontend and is NOT stored in the database.

export const coordinateMapping = {
 1: {
      // ==========================================================
      // GROUND FLOOR — nakaayon sa opisyal na ground floor na plano.
      //
      // TATLONG PASILYO lang ang dinadaanan ng LAHAT ng ruta rito.
      // Nakatago ang mga numerong ito sa bawat pathData sa ibaba, kaya
      // walang linyang tumatagos sa pader o sa loob ng ibang kwarto:
      //
      //   x = 880  (V2) — lobby, mula sa kiosk paakyat sa hilaga.
      //                   Nasa kanan ito ng escalator (dulo: 855).
      //   y = 655  (H1) — pahalang na pasilyo sa likuran ng lahat ng
      //                   opisina. Nasa ilalim ito ng pinakamababang
      //                   kwarto (PIO, 625) at ng hagdan (605).
      //   x = 727  (V1) — makitid na daanan sa pagitan ng gitnang hanay
      //                   (dulo: 710) at ng silangang hanay (simula: 745).
      //                   Dito dumadaan ang ruta paakyat sa Tolentino.
      //
      // Ang kiosk ("YOU ARE HERE") ay nasa lobby, katabi ng bukana:
      // (880, 832) — doon din nakatayo ang pulang "MAP" block.
      // ==========================================================

      // ======== MULTI-FLOOR TRANSPORT ROUTES ========
      "elevator-up": {
          // Nasa ILALIM ng elevator block ang pinto (x 745-855), kaya
          // sa pasilyo muna (y 655) bago tumapat sa pinto paakyat.
          targetX: 800, targetY: 618,
          pathData: "M 880 832 L 880 655 L 800 655 L 800 618",
          style: { display: 'none' },
          isDirectionOnly: true,
          title: "Elevator to Upper Floors",
          badge: "Vertical Transport"
      },
      "stairs-up": {
          targetX: 335, targetY: 618,
          pathData: "M 880 832 L 880 655 L 335 655 L 335 618",
          style: { display: 'none' },
          isDirectionOnly: true,
          title: "Stairs to Upper Floors",
          badge: "Vertical Transport"
      },

      "tolentino-hall": {
          // Ang puwang sa pagitan ng CSU (710) at ng Breastfeeding (745)
          // ang pinto ng bulwagan — doon dumadaan ang V1 paakyat.
          targetX: 727, targetY: 290,
          pathData: "M 880 832 L 880 655 L 727 655 L 727 290",
          style: { width: 335, height: 200, left: 520, top: 180 }, cssClass: "theme-blue"
      },
      "cultural-hall": {
          // Nakaharang ang hagdan (260-410) sa ilalim ng bulwagan, kaya
          // sa gawing kanan (x 430) pumapasok ang ruta — doon lang
          // malinis ang akyat — tapos pakaliwa na sa loob mismo.
          targetX: 350, targetY: 465,
          pathData: "M 880 832 L 880 655 L 430 655 L 430 465 L 350 465",
          style: { width: 200, height: 135, left: 250, top: 380 }, cssClass: "theme-blue"
      },
      "canteen": {
          // Labas ng gusali sa kanluran — dumadaan sa pintuan ng
          // kanlurang pader (puwang sa y 620-690).
          targetX: 105, targetY: 760,
          pathData: "M 880 832 L 880 655 L 105 655 L 105 760",
          style: { width: 130, height: 200, left: 40, top: 690 }, cssClass: "theme-blue"
      },
      "pio-1": {
          targetX: 490, targetY: 555,
          pathData: "M 880 832 L 880 655 L 490 655 L 490 555",
          style: { width: 70, height: 240, left: 455, top: 385, fontSize: '0.75rem' },
          cssClass: "theme-blue vertical-text-wrapper"
      },
      "pio-2": {
          targetX: 565, targetY: 555,
          pathData: "M 880 832 L 880 655 L 565 655 L 565 555",
          style: { width: 70, height: 240, left: 530, top: 385, fontSize: '0.75rem' },
          cssClass: "theme-blue vertical-text-wrapper"
      },
      "csu-office": {
          // Nakaharap sa V1 ang tatlong kwarto ng gitnang hanay, kaya
          // pareho ang hugis ng ruta: akyat sa 727, tapos pakaliwa.
          targetX: 695, targetY: 420,
          pathData: "M 880 832 L 880 655 L 727 655 L 727 420 L 695 420",
          style: { width: 105, height: 70, left: 605, top: 385, fontSize: '0.75rem' }, cssClass: "theme-blue"
      },
      "barangay-affairs": {
          targetX: 695, targetY: 495,
          pathData: "M 880 832 L 880 655 L 727 655 L 727 495 L 695 495",
          style: { width: 105, height: 70, left: 605, top: 460, fontSize: '0.75rem' }, cssClass: "theme-blue"
      },
      "tourism-office": {
          targetX: 695, targetY: 575,
          pathData: "M 880 832 L 880 655 L 727 655 L 727 575 L 695 575",
          style: { width: 105, height: 80, left: 605, top: 535, fontSize: '0.75rem' }, cssClass: "theme-blue"
      },
      "breastfeeding-room": {
          targetX: 760, targetY: 420,
          pathData: "M 880 832 L 880 655 L 727 655 L 727 420 L 760 420",
          style: { width: 110, height: 70, left: 745, top: 385, fontSize: '0.75rem' }, cssClass: "theme-blue"
      },
      "restroom-cr": {
          targetX: 760, targetY: 497,
          pathData: "M 880 832 L 880 655 L 727 655 L 727 497 L 760 497",
          style: { width: 110, height: 65, left: 745, top: 465, fontSize: '0.75rem' },
          cssClass: "theme-blue",
          isDirectionOnly: true
      },
      "info-desk": {
          // Nasa lobby mismo, nakasandal sa kanlurang pader — ilang
          // hakbang lang mula sa kiosk, kaya tuwid ang ruta.
          targetX: 730, targetY: 832,
          pathData: "M 880 832 L 730 832",
          style: { width: 60, height: 130, left: 660, top: 760, fontSize: '0.75rem' },
          cssClass: "theme-blue vertical-text-wrapper"
      },
      "guard": {
          // Katabi ng bukana sa gawing silangan.
          targetX: 945, targetY: 875,
          pathData: "M 880 832 L 945 832 L 945 875",
          style: { width: 80, height: 55, left: 905, top: 880, fontSize: '0.75rem' },
          cssClass: "theme-blue"
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
// Function to merge coordinate data with database data
// Function to merge coordinate data with database data
// Ang `fallback` ay ang defaultOfficeData. Kailangan ito dahil ang
// initializeDatabase() ay tumatalon agad kapag may laman na ang `offices`
// table — kaya ang bagong opisina (hal. info-desk, guard) ay wala pa roon
// at mawawalan ng title/badge kung DB lang ang pagkukunan.
export const mergeOfficeData = (coords, dbData, fallback = {}) => {
  const merged = {};

  Object.keys(coords).forEach((floor) => {
    merged[floor] = {};
    Object.keys(coords[floor]).forEach((officeKey) => {

      const defaultInfo = (fallback[floor] && fallback[floor][officeKey])
        ? fallback[floor][officeKey]
        : {};

      // Hahanapin natin yung text data sa loob ng tamang floor group.
      // Kung sakaling walang mahanap, gagamit tayo ng {} para hindi mag-crash.
      const dbOfficeInfo = (dbData && dbData[floor] && dbData[floor][officeKey])
        ? dbData[floor][officeKey]
        : {};

      // Pagsasamahin na ang coordinates (mapa) at dbOfficeInfo (text/details)
      merged[floor][officeKey] = {
        ...coords[floor][officeKey],
        ...defaultInfo,
        ...dbOfficeInfo
      };

    });
  });

  return merged;
};
