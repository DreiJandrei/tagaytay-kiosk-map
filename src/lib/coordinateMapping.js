// ==========================================================
// COORDINATE MAPPING DATA - SECURE FRONTEND ONLY
// ==========================================================
// Lahat ng puwesto ng kwarto, istruktura at ruta sa mapa. Hindi ito nasa
// database — nasa database lang ang teksto ng bawat tanggapan.
//
// Galing ang mga sukat sa pinagtibay na plano ng bawat palapag (editsss.pdf,
// Oktubre 2026). Isang bagay lang ang dapat tandaan kapag binago ang puwesto
// ng kwarto: dapat dumaan pa rin ang ruta sa pagitan ng mga kwarto, hindi sa
// ibabaw nila.
//
// ANG RUTA. Sa Ground Floor, ang `pathData` ay buong ruta mula sa kiosk
// ("YOU ARE HERE"). Sa itaas, nagsisimula ito sa iisang sangandaan ng palapag
// (hub); nasa `floorPlans[palapag].arrivals` kung paano makarating sa hub
// mula sa elevator, hagdan, o escalator. Pinagdudugtong sila ng `routeFor`
// sa ibaba.

export const coordinateMapping = {
  1: {
    "elevator-up": {
      pathData: "M 1017 698 L 1043 698 L 1043 577 L 1160 577",
      style: { display: 'none' },
      isDirectionOnly: true,
      title: "Elevator to Upper Floors",
      badge: "Vertical Transport"
    },
    "stairs-up": {
      pathData: "M 1017 698 L 1043 698 L 1043 572 L 432 572 L 432 559",
      style: { display: 'none' },
      isDirectionOnly: true,
      title: "Stairs to Upper Floors",
      badge: "Vertical Transport"
    },
    "tolentino-hall": {
      pathData: "M 1017 698 L 1043 698 L 1043 257",
      style: { width: 729, height: 131, left: 566, top: 126 }, cssClass: "theme-amber"
    },
    "cultural-hall": {
      // Sa ilalim ng hall ang pasok, sa pagitan nito at ng hagdan.
      pathData: "M 1017 698 L 1043 698 L 1043 572 L 568 572 L 568 481 L 467 481 L 467 465",
      style: { width: 262, height: 192, left: 336, top: 273 }, cssClass: "theme-cyan"
    },
    "canteen": {
      pathData: "M 1017 698 L 1043 698 L 1043 572 L 263 572 L 263 788",
      style: { width: 263, height: 174, left: 30, top: 788 }, cssClass: "theme-blue"
    },
    "pio-1": {
      pathData: "M 1017 698 L 1043 698 L 1043 572 L 666 572 L 666 542",
      style: { width: 89, height: 272, left: 622, top: 270, fontSize: '0.75rem' }, cssClass: "theme-purple", mapLabel: "PIO A"
    },
    "pio-2": {
      pathData: "M 1017 698 L 1043 698 L 1043 572 L 798 572 L 798 542",
      style: { width: 174, height: 78, left: 711, top: 464, fontSize: '0.75rem' }, cssClass: "theme-purple", mapLabel: "PIO B"
    },
    "csu-office": {
      pathData: "M 1017 698 L 1043 698 L 1043 303 L 989 303",
      style: { width: 131, height: 65, left: 858, top: 270, fontSize: '0.75rem' }, cssClass: "theme-teal"
    },
    "barangay-affairs": {
      pathData: "M 1017 698 L 1043 698 L 1043 365 L 992 365",
      style: { width: 264, height: 51, left: 728, top: 340, fontSize: '0.75rem' }, cssClass: "theme-teal"
    },
    "tourism-office": {
      pathData: "M 1017 698 L 1043 698 L 1043 428 L 992 428",
      style: { width: 264, height: 52, left: 728, top: 402, fontSize: '0.75rem' }, cssClass: "theme-teal"
    },
    "breastfeeding-room": {
      pathData: "M 1017 698 L 1043 698 L 1043 322 L 1091 322",
      style: { width: 204, height: 106, left: 1091, top: 270 }, cssClass: "theme-cyan"
    },
    "control-unit": {
      pathData: "M 1017 698 L 1043 698 L 1043 433 L 1091 433",
      style: { width: 204, height: 95, left: 1091, top: 386, fontSize: '0.75rem' }, cssClass: "theme-cyan"
    },
    "restroom-cr": {
      pathData: "M 1017 698 L 1043 698 L 1043 517 L 1144 517",
      style: { width: 146, height: 52, left: 1144, top: 491, fontSize: '0.75rem' }, cssClass: "theme-gray", isDirectionOnly: true
    },
    "info-desk": {
      pathData: "M 1017 698 L 1017 723",
      style: { width: 130, height: 105, left: 940, top: 723, fontSize: '0.75rem' }, cssClass: "theme-blue"
    },
    "guard": {
      pathData: "M 1017 698 L 1121 698 L 1121 780 L 1180 780",
      style: { width: 97, height: 80, left: 1180, top: 742, fontSize: '0.75rem' }, cssClass: "theme-indigo"
    },
  },
  2: {
    "city-eng": {
      pathData: "M 780 306 L 227 306 L 227 277",
      style: { width: 168, height: 138, left: 142, top: 139 }, cssClass: ""
    },
    "housing": {
      pathData: "M 780 306 L 402 306 L 402 277",
      style: { width: 170, height: 138, left: 317, top: 139 }, cssClass: ""
    },
    "bac": {
      pathData: "M 780 306 L 569 306 L 569 277",
      style: { width: 150, height: 138, left: 494, top: 139, fontSize: '0.75rem' }, cssClass: ""
    },
    "planning": {
      pathData: "M 780 306 L 740 306 L 740 277",
      style: { width: 171, height: 138, left: 656, top: 139 }, cssClass: ""
    },
    "zoning": {
      pathData: "M 780 306 L 922 306 L 922 277",
      style: { width: 177, height: 138, left: 834, top: 139, fontSize: '0.75rem' }, cssClass: ""
    },
    "back-ext": {
      pathData: "M 780 306 L 1089 306 L 1089 277",
      style: { width: 126, height: 138, left: 1026, top: 139, fontSize: '0.75rem' }, cssClass: ""
    },
    "restroom-cr-2": {
      pathData: "M 780 306 L 780 380 L 817 380",
      style: { width: 221, height: 94, left: 817, top: 334 }, cssClass: "", isDirectionOnly: true
    },
    "library": {
      pathData: "M 780 306 L 780 734 L 501 734",
      style: { width: 296, height: 188, left: 205, top: 639 }, cssClass: ""
    },
  },
  3: {
    "building-official": {
      pathData: "M 486 642 L 486 486 L 420 486",
      style: { width: 194, height: 294, left: 226, top: 338 }, cssClass: ""
    },
    "budget-office": {
      pathData: "M 486 642 L 486 345 L 546 345 L 546 321",
      style: { width: 206, height: 163, left: 442, top: 158 }, cssClass: ""
    },
    "internal-audit": {
      pathData: "M 486 642 L 486 345 L 743 345 L 743 321",
      style: { width: 148, height: 163, left: 670, top: 158 }, cssClass: ""
    },
    "treasure-office": {
      pathData: "M 486 642 L 845 642",
      style: { width: 225, height: 408, left: 845, top: 295 }, cssClass: ""
    },
    "accounting-office": {
      pathData: "M 486 642 L 638 642 L 638 700",
      style: { width: 369, height: 236, left: 452, top: 700 }, cssClass: ""
    },
    "restroom-cr-3": {
      pathData: "M 486 642 L 486 413 L 529 413",
      style: { width: 195, height: 87, left: 529, top: 370 }, cssClass: "", isDirectionOnly: true
    },
  },
  4: {
    "const-west": {
      pathData: "M 478 567 L 478 489 L 429 489",
      style: { width: 213, height: 294, left: 216, top: 343 }, cssClass: ""
    },
    "const-north": {
      pathData: "M 478 567 L 478 346 L 622 346 L 622 316",
      style: { width: 369, height: 162, left: 439, top: 154 }, cssClass: ""
    },
    "const-east": {
      pathData: "M 478 567 L 843 567",
      style: { width: 227, height: 408, left: 843, top: 278 }, cssClass: ""
    },
    "const-south": {
      pathData: "M 478 567 L 478 676 L 643 676 L 643 693",
      style: { width: 370, height: 236, left: 458, top: 693 }, cssClass: ""
    },
    "restroom-cr-4": {
      pathData: "M 478 567 L 478 424 L 508 424",
      style: { width: 196, height: 95, left: 508, top: 377 }, cssClass: "", isDirectionOnly: true
    },
  },
  5: {
    "legal-office": {
      pathData: "M 476 564 L 476 482 L 420 482",
      style: { width: 194, height: 292, left: 226, top: 336 }, cssClass: ""
    },
    "hr-office": {
      pathData: "M 476 564 L 476 338 L 636 338 L 636 306",
      style: { width: 370, height: 164, left: 451, top: 142 }, cssClass: ""
    },
    "admin-office": {
      pathData: "M 476 564 L 852 564",
      style: { width: 224, height: 407, left: 852, top: 261 }, cssClass: ""
    },
    "const-south-5": {
      pathData: "M 476 564 L 476 673 L 648 673 L 648 685",
      style: { width: 370, height: 238, left: 463, top: 685 }, cssClass: ""
    },
    "restroom-cr-5": {
      pathData: "M 476 564 L 476 418 L 520 418",
      style: { width: 194, height: 97, left: 520, top: 368 }, cssClass: "", isDirectionOnly: true
    },
  },
  6: {
    "wedding-hall": {
      pathData: "M 596 461 L 547 461",
      style: { width: 225, height: 750, left: 322, top: 157 }, cssClass: ""
    },
    "conference-hall": {
      pathData: "M 596 461 L 596 700",
      style: { width: 450, height: 213, left: 565, top: 700 }, cssClass: ""
    },
    "restroom-cr-6": {
      pathData: "M 596 461 L 596 279 L 648 279",
      style: { width: 225, height: 108, left: 648, top: 225 }, cssClass: "", isDirectionOnly: true
    },
  },
  7: {
    "mayor-main": {
      pathData: "M 639 515 L 581 515",
      style: { width: 542, height: 765, left: 356, top: 155, clipPath: 'polygon(0% 0%, 100% 0%, 100% 28%, 41.5% 28%, 41.5% 100%, 0% 100%)', '--l-arm': '28%', '--l-leg': '41.5%' }, cssClass: ""
    },
    "mayor-receiving": {
      pathData: "M 639 515 L 639 695 L 922 695 L 922 720",
      style: { width: 201, height: 207, left: 821, top: 720 }, cssClass: ""
    },
    "waiting-area": {
      pathData: "M 639 515 L 639 695 L 698 695 L 698 720",
      style: { width: 201, height: 207, left: 598, top: 720 }, cssClass: "", isDirectionOnly: true
    },
  },
};

// Ang lahat ng hindi tanggapan sa bawat palapag.
//   wall / box    — panlabas na pader (hugis-L ang Ground Floor)
//   caption       — kung saan nakasulat ang pangalan ng palapag
//   kiosk         — kinatatayuan ng bisita (Ground Floor lang)
//   arrivals      — saan lumalabas sa bawat paraan ng pag-akyat
//   passThrough   — lalakarin sa palapag na dinaraanan lang papunta sa
//                   kasunod na hagdan. 2nd: mula sa malapad na hagdan papunta
//                   sa hagdan sa ilalim ng Mini Library. 4th: mula sa hagdan
//                   sa sulok papunta sa hagdan sa gitna. Sa ibang palapag,
//                   doon din nagpapatuloy ang hagdan — walang lalakarin.
//   overrides     — ruta na hindi kayang dumaan sa hub nang hindi umiikot
export const floorPlans = {
  1: {
    wall: "M 282 600 L 920 600 L 920 845 L 1357 845 L 1357 100 L 224 100 L 224 600 L 243 600",
    caption: { x: 790, y: 100 },
    kiosk: {"x": 1017, "y": 698},
    escalatorPath: "M 1017 698 L 1043 698 L 1043 659 L 1125 659",
    structures: [
      {"type": "stairs", "left": 321, "top": 496, "width": 225, "height": 63},
      {"type": "elevator", "doors": [1170, 1216], "top": 555, "doorW": 36, "doorH": 44},
      {"type": "escalator", "left": 1125, "top": 629, "width": 161, "height": 60},
      {"type": "garden", "left": 463, "top": 624, "width": 435, "height": 217},
      {"type": "parking", "left": 311, "top": 859, "width": 265, "height": 121},
      {"type": "entrance", "left": 1130, "top": 927, "width": 175, "height": 30},
    ],
  },
  2: {
    box: {"x": 120, "y": 110, "w": 1059, "h": 862},
    caption: { x: 649, y: 110 },
    arrivals: {
      elevator: { x: 928, y: 555, path: "M 928 555 L 780 555 L 780 306" },
      stairs: { x: 525, y: 470, path: "M 525 470 L 525 306 L 780 306" },
      escalator: { x: 844, y: 662, path: "M 844 662 L 780 662 L 780 306" },
    },
    passThrough: "M 525 470 L 525 934 L 319 934",
    overrides: {
      "library": { stairs: "M 525 470 L 525 734 L 501 734" },
    },
    structures: [
      {"type": "stairs", "left": 212, "top": 423, "width": 274, "height": 93},
      {"type": "stairs-l", "left": 215, "top": 856, "width": 104, "height": 104, "armW": 52},
      {"type": "elevator", "doors": [873, 934], "top": 447, "doorW": 48, "doorH": 61},
      {"type": "escalator", "left": 865, "top": 618, "width": 205, "height": 89},
      {"type": "exit", "left": 1045, "top": 372, "width": 134, "height": 76},
    ],
  },
  3: {
    box: {"x": 160, "y": 110, "w": 954, "h": 864},
    caption: { x: 636, y: 110 },
    arrivals: {
      elevator: { x: 614, y: 591, path: "M 614 591 L 614 642 L 486 642" },
      stairs: { x: 362, y: 921, path: "M 362 921 L 430 921 L 430 642 L 486 642" },
    },
    structures: [
      {"type": "stairs-l", "left": 238, "top": 843, "width": 104, "height": 103, "armW": 49},
      {"type": "elevator", "doors": [561, 617], "top": 470, "doorW": 48, "doorH": 54},
      {"type": "exit", "left": 699, "top": 464, "width": 134, "height": 78},
    ],
  },
  4: {
    box: {"x": 160, "y": 110, "w": 954, "h": 864},
    caption: { x: 636, y: 110 },
    arrivals: {
      elevator: { x: 634, y: 567, path: "M 634 567 L 478 567" },
      stairs: { x: 359, y: 914, path: "M 359 914 L 442 914 L 442 567 L 478 567" },
    },
    passThrough: "M 359 914 L 442 914 L 442 676 L 600 676 L 600 659",
    structures: [
      {"type": "stairs", "left": 519, "top": 578, "width": 163, "height": 81},
      {"type": "stairs-l", "left": 235, "top": 836, "width": 103, "height": 104, "armW": 49},
      {"type": "elevator", "doors": [580, 636], "top": 486, "doorW": 48, "doorH": 54},
      {"type": "exit", "left": 699, "top": 477, "width": 134, "height": 78},
    ],
  },
  5: {
    box: {"x": 160, "y": 110, "w": 954, "h": 864},
    caption: { x: 636, y: 110 },
    arrivals: {
      elevator: { x: 646, y: 564, path: "M 646 564 L 476 564" },
      stairs: { x: 493, y: 618, path: "M 493 618 L 476 618 L 476 564" },
    },
    structures: [
      {"type": "stairs", "left": 514, "top": 576, "width": 164, "height": 83},
      {"type": "elevator", "doors": [594, 650], "top": 479, "doorW": 48, "doorH": 54},
      {"type": "exit", "left": 706, "top": 474, "width": 134, "height": 78},
    ],
  },
  6: {
    box: {"x": 270, "y": 110, "w": 785, "h": 853},
    caption: { x: 662, y: 110 },
    arrivals: {
      elevator: { x: 785, y: 461, path: "M 785 461 L 596 461" },
      stairs: { x: 619, y: 592, path: "M 619 592 L 596 592 L 596 461" },
    },
    structures: [
      {"type": "stairs", "left": 637, "top": 547, "width": 191, "height": 92},
      {"type": "elevator", "doors": [731, 790], "top": 348, "doorW": 49, "doorH": 58},
      {"type": "exit", "left": 869, "top": 337, "width": 146, "height": 84},
    ],
  },
  7: {
    box: {"x": 270, "y": 110, "w": 785, "h": 869},
    caption: { x: 662, y: 110 },
    arrivals: {
      elevator: { x: 815, y: 515, path: "M 815 515 L 639 515" },
      stairs: { x: 662, y: 623, path: "M 662 623 L 639 623 L 639 515" },
    },
    structures: [
      {"type": "stairs", "left": 680, "top": 578, "width": 189, "height": 92},
      {"type": "elevator", "doors": [761, 821], "top": 398, "doorW": 50, "doorH": 56},
      {"type": "exit", "left": 898, "top": 387, "width": 144, "height": 83},
    ],
  },
};

// Tinatanggal ang gitnang punto kapag tatlong magkakasunod ay nasa iisang
// guhit. Dito rin nawawala ang paglampas-at-balik sa hub: kung mula sa
// elevator ay paakyat sa hub ang linya tapos pababa ulit, diretso na lang.
const simplifyPath = (d) => {
  const nums = String(d).match(/-?\d+(\.\d+)?/g);
  if (!nums || nums.length < 6) return d;
  const pts = [];
  for (let i = 0; i + 1 < nums.length; i += 2) pts.push({ x: +nums[i], y: +nums[i + 1] });
  let changed = true;
  while (changed && pts.length > 2) {
    changed = false;
    for (let i = 1; i < pts.length - 1; i++) {
      const a = pts[i - 1], b = pts[i], c = pts[i + 1];
      if ((a.y === b.y && b.y === c.y) || (a.x === b.x && b.x === c.x)) {
        pts.splice(i, 1);
        changed = true;
        break;
      }
    }
  }
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
};

// Saan lumalabas ang bisita sa palapag na ito. Walang escalator lampas sa
// 2nd Floor, kaya elevator ang kapalit nito sa itaas (galing sa lumang QR).
export const arrivalFor = (floor, method) => {
  const plan = floorPlans[floor];
  return plan?.arrivals?.[method] || plan?.arrivals?.elevator || plan?.kiosk || null;
};

// Ang buong linyang iguguhit. `office` ay null sa palapag na dinaraanan
// lang ng naghahagdan — doon, ang `passThrough` lang ang lalakarin.
export const routeFor = ({ floor, officeKey, office, method }) => {
  const plan = floorPlans[floor];
  if (!plan) return '';
  if (floor === 1) {
    // Iisa ang key ng elevator at escalator ('elevator-up'), pero magkaiba
    // ang dulo nila sa Ground Floor.
    if (method === 'escalator' && officeKey === 'elevator-up') return plan.escalatorPath;
    return office?.pathData || '';
  }
  if (!office?.pathData) return method === 'stairs' ? (plan.passThrough || '') : '';
  const override = plan.overrides?.[officeKey]?.[method];
  if (override) return override;
  return simplifyPath(`${arrivalFor(floor, method).path} ${office.pathData.replace(/^\s*M/, 'L')}`);
};

// Pinagsasama ang coordinates at ang teksto mula sa database. Ang `fallback`
// ay ang defaultOfficeData: tumatalon ang initializeDatabase() kapag may laman
// na ang `offices`, kaya ang bagong kwarto ay wala pa roon hangga't hindi
// nase-save o napapatakbo ang supabase/map_update_2026_11.sql.
export const mergeOfficeData = (coords, dbData, fallback = {}) => {
  const merged = {};

  Object.keys(coords).forEach((floor) => {
    merged[floor] = {};
    Object.keys(coords[floor]).forEach((officeKey) => {
      merged[floor][officeKey] = {
        ...coords[floor][officeKey],
        ...(fallback[floor]?.[officeKey] || {}),
        ...(dbData?.[floor]?.[officeKey] || {}),
      };
    });
  });

  return merged;
};
