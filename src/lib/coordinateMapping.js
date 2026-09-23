// ==========================================================
// COORDINATE MAPPING DATA - SECURE FRONTEND ONLY
// ==========================================================
// This file contains all physical coordinate data, path routing,
// and visual styling for the interactive map.
// This data stays in the frontend and is NOT stored in the database.

export const coordinateMapping = {
 1: {
      // ==========================================================
      // GROUND FLOOR — nakaayon sa opisyal na 1st Floor floor plan.
      // Ang kiosk ("YOU ARE HERE") ay nasa loob ng lobby, katapat ng
      // pulang "Map" block sa plano: (1045, 822).
      // Mga pangunahing daanan (para hindi tumagos sa pader):
      //   x = 1045  -> pasilyo ng lobby paakyat (hilaga)
      //   x = 1100  -> pasilyo ng lobby pababa (timog)
      //   y = 710   -> pagtawid pakanluran, sa bukana ng gitnang pader
      //   y = 935   -> pasilyo sa may bukana/entrance
      // ==========================================================

      // ======== MULTI-FLOOR TRANSPORT ROUTES ========
      "elevator-up": {
          // Nasa ILALIM ng elevator block ang pinto (x 1153-1213), kaya
          // pahalang muna sa pasilyo (y 822) bago pumasok paakyat sa pinto.
          targetX: 1183, targetY: 745,
          pathData: "M 1045 822 L 1183 822 L 1183 790",
          style: { display: 'none' },
          isDirectionOnly: true,
          title: "Elevator to Upper Floors",
          badge: "Vertical Transport"
      },
      "stairs-up": {
          targetX: 450, targetY: 630,
          pathData: "M 1045 822 L 1045 710 L 500 710 L 500 630 L 450 630",
          style: { display: 'none' },
          isDirectionOnly: true,
          title: "Stairs to Upper Floors",
          badge: "Vertical Transport"
      },

      "tolentino-hall": {
          targetX: 1045, targetY: 260, pathData: "M 1045 822 L 1045 260",
          style: { width: 940, height: 180, left: 370, top: 120 }, cssClass: "theme-amber"
      },
      "cultural-hall": {
          targetX: 500, targetY: 540, pathData: "M 1045 822 L 1045 710 L 625 710 L 625 585 L 500 585 L 500 540",
          style: { width: 260, height: 240, left: 370, top: 320 }, cssClass: "theme-cyan"
      },
      "canteen": {
          // Labas ng gusali sa kaliwa — dumadaan sa pintuan ng kanlurang pader (y 480-560).
          targetX: 190, targetY: 520,
          pathData: "M 1045 822 L 1045 710 L 645 710 L 645 572 L 345 572 L 345 520 L 190 520",
          style: { width: 280, height: 250, left: 0, top: 400 }, cssClass: "theme-blue"
      },
      "pio-1": {
          targetX: 695, targetY: 495, pathData: "M 1045 822 L 1045 710 L 695 710 L 695 660",
          style: { width: 90, height: 340, left: 650, top: 320 }, cssClass: "theme-purple vertical-text-wrapper"
      },
      "pio-2": {
          targetX: 785, targetY: 495, pathData: "M 1045 822 L 1045 710 L 785 710 L 785 660",
          style: { width: 90, height: 340, left: 740, top: 320 }, cssClass: "theme-purple vertical-text-wrapper"
      },
      "csu-office": {
          targetX: 990, targetY: 370, pathData: "M 1045 822 L 1045 370 L 1010 370",
          style: { width: 180, height: 100, left: 830, top: 320 }, cssClass: "theme-teal"
      },
      "barangay-affairs": {
          targetX: 990, targetY: 490, pathData: "M 1045 822 L 1045 490 L 1010 490",
          style: { width: 180, height: 100, left: 830, top: 440 }, cssClass: "theme-teal"
      },
      "tourism-office": {
          targetX: 990, targetY: 615, pathData: "M 1045 822 L 1045 615 L 1010 615",
          style: { width: 180, height: 110, left: 830, top: 560 }, cssClass: "theme-teal"
      },
      "breastfeeding-room": {
          targetX: 1130, targetY: 445, pathData: "M 1045 822 L 1045 445 L 1130 445",
          style: { width: 200, height: 250, left: 1110, top: 320 }, cssClass: "theme-cyan"
      },
      "restroom-cr": {
          targetX: 1180, targetY: 630, pathData: "M 1045 822 L 1045 630 L 1180 630",
          style: { width: 140, height: 70, left: 1160, top: 595, padding: '8px', fontSize: '0.8rem' },
          cssClass: "theme-gray",
          isDirectionOnly: true
      },
      "info-desk": {
          // Kaliwa mismo ng bukana, nakadikit sa gitnang pader.
          targetX: 1045, targetY: 910, pathData: "M 1045 822 L 1045 910",
          style: { width: 75, height: 75, left: 1010, top: 880, padding: '6px', fontSize: '0.75rem' },
          cssClass: "theme-blue"
      },
      "guard": {
          // Kanan ng bukana, katabi ng pinto papasok.
          targetX: 1287, targetY: 945,
          pathData: "M 1045 822 L 1105 822 L 1105 945 L 1287 945",
          style: { width: 75, height: 58, left: 1250, top: 900, padding: '6px', fontSize: '0.75rem' },
          cssClass: "theme-indigo"
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
        // Iisa na ang hugis ng 6th at 7th Floor: pareho ang pader, ang
        // hagdan, at ang elevator (tingnan ang MapScreen — isang sanga
        // na lang ang gumuguhit sa dalawa). Kaya pareho rin ang kinaroroonan
        // at ang ruta ng mga kwarto rito — ang pangalan lang ang naiiba,
        // dahil ang tanggapan ng Mayor ang nasa 7th Floor.
        // Walang comfort room sa 7th Floor, kaya sakop na ng tanggapan ng
        // Mayor ang buong itaas — mula sa kanlurang gilid hanggang sa pader
        // ng gitnang core (x 800) — habang nananatili ang mahabang bahagi
        // nito pababa sa kanluran. Hugis L ang kinalabasan.
        //
        // Isang kahon lang ito (250-800 × 150-650) na ginugupit ng
        // `clipPath` para maging L. Hindi puwedeng dalawang kahon: isang
        // tala lang ito sa directory, at iisa lang dapat ang nagliliwanag
        // kapag pinindot. Ang ginugupit na bahagi — ang kanang-ibaba — ay
        // siyang kinalalagyan ng elevator at ng hagdan, at hindi rin ito
        // tumatanggap ng pindot (sumusunod ang pindot sa hugis ng clip).
        //
        //   36%    ng 500px na taas = 180px -> ilalim ng sanga (y 330),
        //                                      nasa itaas ng elevator (350)
        //   36.36% ng 550px na lapad = 200px -> kanan ng haligi (x 450)
        "mayor-main": {
            // Nasa pasukan ang tudlaan, hindi sa gitna: nasa gitna ang
            // pangalan ng tanggapan, at magkakapatong sila roon.
            targetX: 620,
            targetY: 290,
            // Galing sa elevator: diretsong paakyat papasok sa tanggapan —
            // bukas ang itaas ng core, walang pader na hinaharang.
            pathData: "M 620 350 L 620 290",
            style: {
                width: 550, height: 500, left: 250, top: 150,
                clipPath: 'polygon(0% 0%, 100% 0%, 100% 36%, 36.36% 36%, 36.36% 100%, 0% 100%)',
                backgroundColor: '#4338ca', color: 'white', textAlign: 'center',
                display: 'flex',
                // Nasa itaas ang pangalan, hindi sa gitna: nasa gitna ng
                // kahon ang gupit, kaya doon ito mawawala.
                alignItems: 'flex-start', justifyContent: 'center',
                fontWeight: 'bold', fontSize: '1.2rem', borderRadius: '4px'
            },
            cssClass: ""
        },
        "mayor-receiving": {
            targetX: 700,
            targetY: 650,
            pathData: "M 700 480 L 850 480 L 850 620 L 700 620 L 700 650",
            style: { width: 400, height: 200, left: 500, top: 650, backgroundColor: '#4338ca', color: 'white', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', borderRadius: '4px' },
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
