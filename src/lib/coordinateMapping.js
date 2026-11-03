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
// ANG RUTA. May sariling linya ang bawat tanggapan at bawat paraan ng pag-akyat,
// kaya ito ang pinakadiretsong daan mula roon — hindi dumaraan sa iisang
// sangandaan ng palapag, na nagdudulot ng paliko-likong ruta. Sa Ground Floor,
// `pathData` mula sa kiosk ("YOU ARE HERE"). Sa itaas, `routes` na may tig-isang
// linya para sa elevator, hagdan, at (sa 2nd Floor) escalator.

export const coordinateMapping = {
  1: {
    // Sa harap ng pinto dumarating ang elevator (nasa ilalim ng dalawang pinto).
    "elevator-up": {
      pathData: "M 1017 698 L 1017 634 L 1213 634 L 1213 599",
      style: { display: 'none' },
      isDirectionOnly: true,
      title: "Elevator to Upper Floors",
      badge: "Vertical Transport"
    },
    // Paakyat pakanan ang hagdan: papasok sa kaliwang dulo, tapos pakanan ang lakad.
    "stairs-up": {
      pathData: "M 1017 698 L 1017 574 L 349 574 L 349 545 L 516 545",
      style: { display: 'none' },
      isDirectionOnly: true,
      title: "Stairs to Upper Floors",
      badge: "Vertical Transport"
    },
    "tolentino-hall": {
      pathData: "M 1017 698 L 1017 257",
      style: { width: 729, height: 131, left: 566, top: 126 }, cssClass: "theme-amber"
    },
    "cultural-hall": {
      // Sa ilalim ng hall ang pasok, sa pagitan nito at ng hagdan.
      pathData: "M 1017 698 L 1017 570 L 581 570 L 581 465",
      style: { width: 262, height: 192, left: 336, top: 273 }, cssClass: "theme-cyan"
    },
    "canteen": {
      pathData: "M 1017 698 L 1017 574 L 269 574 L 269 788",
      style: { width: 263, height: 174, left: 30, top: 788 }, cssClass: "theme-blue"
    },
    "pio-1": {
      pathData: "M 1017 698 L 1017 570 L 701 570 L 701 542",
      style: { width: 89, height: 272, left: 622, top: 270, fontSize: '0.75rem' }, cssClass: "theme-purple", mapLabel: "PIO A"
    },
    "pio-2": {
      pathData: "M 1017 698 L 1017 534 L 885 534",
      style: { width: 174, height: 78, left: 711, top: 464, fontSize: '0.75rem' }, cssClass: "theme-purple", mapLabel: "PIO B"
    },
    "csu-office": {
      pathData: "M 1017 698 L 1017 326 L 989 326",
      style: { width: 131, height: 65, left: 858, top: 270, fontSize: '0.75rem' }, cssClass: "theme-teal"
    },
    "barangay-affairs": {
      pathData: "M 1017 698 L 1017 382 L 992 382",
      style: { width: 264, height: 51, left: 728, top: 340, fontSize: '0.75rem' }, cssClass: "theme-teal"
    },
    "tourism-office": {
      pathData: "M 1017 698 L 1017 446 L 992 446",
      style: { width: 264, height: 52, left: 728, top: 402, fontSize: '0.75rem' }, cssClass: "theme-teal"
    },
    "breastfeeding-room": {
      pathData: "M 1017 698 L 1017 362 L 1091 362",
      style: { width: 204, height: 106, left: 1091, top: 270 }, cssClass: "theme-cyan"
    },
    "control-unit": {
      pathData: "M 1017 698 L 1017 470 L 1091 470",
      style: { width: 204, height: 95, left: 1091, top: 386, fontSize: '0.75rem' }, cssClass: "theme-cyan"
    },
    "restroom-cr": {
      pathData: "M 1017 698 L 1017 534 L 1144 534",
      style: { width: 146, height: 52, left: 1144, top: 491, fontSize: '0.75rem' }, cssClass: "theme-gray", isDirectionOnly: true
    },
    "info-desk": {
      pathData: "M 1017 698 L 1017 723",
      style: { width: 130, height: 105, left: 940, top: 723, fontSize: '0.75rem' }, cssClass: "theme-blue"
    },
    "guard": {
      pathData: "M 1017 698 L 1097 698 L 1097 750 L 1180 750",
      style: { width: 97, height: 80, left: 1180, top: 742, fontSize: '0.75rem' }, cssClass: "theme-indigo"
    },
  },
  2: {
    "city-eng": {
      routes: { elevator: "M 928 508 L 928 551 L 184 551 L 184 277", stairs: "M 224 470 L 182 470 L 182 277", escalator: "M 865 663 L 529 663 L 529 303 L 293 303 L 293 277" },
      style: { width: 168, height: 138, left: 142, top: 139 }, cssClass: ""
    },
    "housing": {
      routes: { elevator: "M 928 508 L 928 551 L 512 551 L 512 303 L 468 303 L 468 277", stairs: "M 349 433 L 349 277", escalator: "M 865 663 L 529 663 L 529 303 L 469 303 L 469 277" },
      style: { width: 170, height: 138, left: 317, top: 139 }, cssClass: ""
    },
    "bac": {
      routes: { elevator: "M 928 508 L 928 551 L 628 551 L 628 277", stairs: "M 474 470 L 516 470 L 516 277", escalator: "M 865 663 L 629 663 L 629 277" },
      style: { width: 150, height: 138, left: 494, top: 139, fontSize: '0.75rem' }, cssClass: ""
    },
    "planning": {
      routes: { elevator: "M 928 508 L 928 551 L 788 551 L 788 277", stairs: "M 474 470 L 672 470 L 672 277", escalator: "M 865 663 L 789 663 L 789 277" },
      style: { width: 171, height: 138, left: 656, top: 139 }, cssClass: ""
    },
    "zoning": {
      routes: { elevator: "M 928 508 L 928 551 L 788 551 L 788 303 L 852 303 L 852 277", stairs: "M 349 433 L 349 305 L 853 305 L 853 277", escalator: "M 865 663 L 789 663 L 789 303 L 853 303 L 853 277" },
      style: { width: 177, height: 138, left: 834, top: 139, fontSize: '0.75rem' }, cssClass: ""
    },
    "back-ext": {
      routes: { elevator: "M 928 508 L 928 551 L 788 551 L 788 303 L 1040 303 L 1040 277", stairs: "M 349 433 L 349 305 L 1041 305 L 1041 277", escalator: "M 865 663 L 789 663 L 789 303 L 1041 303 L 1041 277" },
      style: { width: 126, height: 138, left: 1026, top: 139, fontSize: '0.75rem' }, cssClass: ""
    },
    "restroom-cr-2": {
      routes: { elevator: "M 928 508 L 928 535 L 1008 535 L 1008 428", stairs: "M 474 470 L 836 470 L 836 428", escalator: "M 865 663 L 801 663 L 801 415 L 817 415" },
      style: { width: 221, height: 94, left: 817, top: 334 }, cssClass: "", isDirectionOnly: true
    },
    "library": {
      routes: { elevator: "M 928 508 L 928 591 L 484 591 L 484 639", stairs: "M 349 506 L 349 639", escalator: "M 865 663 L 501 663" },
      style: { width: 296, height: 188, left: 205, top: 639 }, cssClass: ""
    },
  },
  3: {
    "building-official": {
      routes: { elevator: "M 613 524 L 613 567 L 420 567", stairs: "M 263 853 L 263 632" },
      style: { width: 194, height: 294, left: 226, top: 338 }, cssClass: ""
    },
    "budget-office": {
      routes: { elevator: "M 613 524 L 613 551 L 501 551 L 501 321", stairs: "M 263 853 L 263 661 L 459 661 L 459 321" },
      style: { width: 206, height: 163, left: 442, top: 158 }, cssClass: ""
    },
    "internal-audit": {
      routes: { elevator: "M 613 524 L 613 551 L 501 551 L 501 339 L 685 339 L 685 321", stairs: "M 263 853 L 263 661 L 503 661 L 503 337 L 687 337 L 687 321" },
      style: { width: 148, height: 163, left: 670, top: 158 }, cssClass: ""
    },
    "treasure-office": {
      routes: { elevator: "M 613 524 L 613 571 L 845 571", stairs: "M 263 853 L 263 673 L 845 673" },
      style: { width: 225, height: 408, left: 845, top: 295 }, cssClass: ""
    },
    "accounting-office": {
      routes: { elevator: "M 613 524 L 613 700", stairs: "M 330 917 L 452 917" },
      style: { width: 369, height: 236, left: 452, top: 700 }, cssClass: ""
    },
    "restroom-cr-3": {
      routes: { elevator: "M 613 524 L 613 551 L 677 551 L 677 457", stairs: "M 263 853 L 263 661 L 547 661 L 547 457" },
      style: { width: 195, height: 87, left: 529, top: 370 }, cssClass: "", isDirectionOnly: true
    },
  },
  4: {
    "const-west": {
      routes: { elevator: "M 632 540 L 632 567 L 429 567", stairs: "M 260 846 L 260 637" },
      style: { width: 213, height: 294, left: 216, top: 343 }, cssClass: ""
    },
    "const-north": {
      routes: { elevator: "M 632 540 L 632 567 L 480 567 L 480 316", stairs: "M 260 846 L 260 666 L 456 666 L 456 316" },
      style: { width: 369, height: 162, left: 439, top: 154 }, cssClass: ""
    },
    "const-east": {
      routes: { elevator: "M 632 540 L 632 567 L 843 567", stairs: "M 260 846 L 260 670 L 843 670" },
      style: { width: 227, height: 408, left: 843, top: 278 }, cssClass: ""
    },
    "const-south": {
      routes: { elevator: "M 632 540 L 632 567 L 708 567 L 708 693", stairs: "M 326 911 L 458 911" },
      style: { width: 370, height: 236, left: 458, top: 693 }, cssClass: ""
    },
    "restroom-cr-4": {
      routes: { elevator: "M 632 540 L 632 567 L 552 567 L 552 472", stairs: "M 260 846 L 260 666 L 480 666 L 480 462 L 508 462" },
      style: { width: 196, height: 95, left: 508, top: 377 }, cssClass: "", isDirectionOnly: true
    },
  },
  5: {
    "legal-office": {
      routes: { elevator: "M 646 533 L 646 560 L 420 560", stairs: "M 596 586 L 596 546 L 420 546" },
      style: { width: 194, height: 292, left: 226, top: 336 }, cssClass: ""
    },
    "hr-office": {
      routes: { elevator: "M 646 533 L 646 560 L 494 560 L 494 306", stairs: "M 526 618 L 484 618 L 484 306" },
      style: { width: 370, height: 164, left: 451, top: 142 }, cssClass: ""
    },
    "admin-office": {
      routes: { elevator: "M 646 533 L 646 564 L 852 564", stairs: "M 666 618 L 852 618" },
      style: { width: 224, height: 407, left: 852, top: 261 }, cssClass: ""
    },
    "const-south-5": {
      routes: { elevator: "M 646 533 L 646 564 L 706 564 L 706 685", stairs: "M 666 618 L 708 618 L 708 685" },
      style: { width: 370, height: 238, left: 463, top: 685 }, cssClass: ""
    },
    "restroom-cr-5": {
      routes: { elevator: "M 646 533 L 646 560 L 566 560 L 566 465", stairs: "M 596 586 L 596 546 L 568 546 L 568 465" },
      style: { width: 194, height: 97, left: 520, top: 368 }, cssClass: "", isDirectionOnly: true
    },
  },
  6: {
    "wedding-hall": {
      routes: { elevator: "M 785 406 L 785 449 L 547 449", stairs: "M 649 593 L 547 593" },
      style: { width: 225, height: 750, left: 322, top: 157 }, cssClass: ""
    },
    "conference-hall": {
      routes: { elevator: "M 785 406 L 785 521 L 857 521 L 857 700", stairs: "M 733 629 L 733 700" },
      style: { width: 450, height: 213, left: 565, top: 700 }, cssClass: ""
    },
    "restroom-cr-6": {
      routes: { elevator: "M 785 406 L 785 433 L 705 433 L 705 333", stairs: "M 733 557 L 733 449 L 705 449 L 705 333" },
      style: { width: 225, height: 108, left: 648, top: 225 }, cssClass: "", isDirectionOnly: true
    },
  },
  7: {
    "mayor-main": {
      routes: { elevator: "M 816 454 L 816 497 L 581 497", stairs: "M 692 624 L 581 624" },
      style: { width: 542, height: 765, left: 356, top: 155, clipPath: 'polygon(0% 0%, 100% 0%, 100% 28%, 41.5% 28%, 41.5% 100%, 0% 100%)', '--l-arm': '28%', '--l-leg': '41.5%' }, cssClass: ""
    },
    "mayor-receiving": {
      routes: { elevator: "M 816 454 L 816 549 L 896 549 L 896 720", stairs: "M 857 624 L 899 624 L 899 720" },
      style: { width: 201, height: 207, left: 821, top: 720 }, cssClass: ""
    },
    "waiting-area": {
      routes: { elevator: "M 816 454 L 816 549 L 652 549 L 652 720", stairs: "M 775 660 L 775 720" },
      style: { width: 201, height: 207, left: 598, top: 720 }, cssClass: "", isDirectionOnly: true
    },
  },
};

// Ang lahat ng hindi tanggapan sa bawat palapag.
//   wall / box    — panlabas na pader (hugis-L ang Ground Floor)
//   caption       — kung saan nakasulat ang pangalan ng palapag
//   kiosk         — kinatatayuan ng bisita (Ground Floor lang)
//   arrivals      — kung saan nakalagay ang pin sa bawat paraan ng pag-akyat
//   passThrough   — linya sa palapag na dinaraanan lang, hanggang sa pag-akyat
//                   sa kasunod na hagdan. 2nd: mula sa malapad na hagdan papunta
//                   sa hagdan sa ilalim ng Mini Library. 4th: mula sa hagdan sa
//                   sulok papunta sa hagdan sa gitna. Sa 3rd, 5th at 6th, doon
//                   din nagpapatuloy ang hagdan — ang pag-akyat lang ang guhit.
export const floorPlans = {
  1: {
    wall: "M 282 600 L 920 600 L 920 845 L 1357 845 L 1357 100 L 224 100 L 224 600 L 243 600",
    caption: { x: 790, y: 100 },
    kiosk: {"x": 1017, "y": 698},
    escalatorPath: "M 1017 698 L 1017 634 L 1309 634 L 1309 675 L 1286 675",
    structures: [
      {"type": "stairs", "left": 321, "top": 496, "width": 225, "height": 63},
      {"type": "elevator", "doors": [1170, 1216], "top": 555, "doorW": 36, "doorH": 44},
      {"type": "escalator", "left": 1125, "top": 645, "width": 161, "height": 60},
      {"type": "garden", "left": 463, "top": 624, "width": 435, "height": 217},
      {"type": "parking", "left": 311, "top": 859, "width": 265, "height": 121},
      {"type": "entrance", "left": 1130, "top": 927, "width": 175, "height": 30},
    ],
  },
  2: {
    box: {"x": 120, "y": 110, "w": 1059, "h": 862},
    caption: { x: 649, y: 110 },
    arrivals: {
      elevator: { x: 928, y: 553 },
      stairs: { x: 350, y: 470 },
      escalator: { x: 760, y: 662 },
    },
    passThrough: "M 474 470 L 528 470 L 528 930 L 242 930 L 242 870",
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
      elevator: { x: 613, y: 569 },
      stairs: { x: 362, y: 921 },
    },
    passThrough: "M 330 917 L 263 917 L 263 857",
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
      elevator: { x: 632, y: 585 },
      stairs: { x: 362, y: 914 },
    },
    passThrough: "M 260 846 L 260 674 L 544 674 L 544 645 L 652 645",
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
      elevator: { x: 646, y: 578 },
      stairs: { x: 493, y: 618 },
    },
    passThrough: "M 540 645 L 648 645",
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
      elevator: { x: 785, y: 451 },
      stairs: { x: 578, y: 592 },
    },
    passThrough: "M 663 625 L 798 625",
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
      elevator: { x: 816, y: 499 },
      stairs: { x: 639, y: 623 },
    },
    structures: [
      {"type": "stairs", "left": 680, "top": 578, "width": 189, "height": 92},
      {"type": "elevator", "doors": [761, 821], "top": 398, "doorW": 50, "doorH": 56},
      {"type": "exit", "left": 898, "top": 387, "width": 144, "height": 83},
    ],
  },
};

// Saan lumalabas ang bisita sa palapag na ito. Walang escalator lampas sa
// 2nd Floor, kaya elevator ang kapalit nito sa itaas (galing sa lumang QR).
export const arrivalFor = (floor, method) => {
  const plan = floorPlans[floor];
  return plan?.arrivals?.[method] || plan?.arrivals?.elevator || plan?.kiosk || null;
};

// Saan ilalagay ang pin ng palapag sa itaas. Hindi ito dapat nakapatong sa
// linya, kaya sinusukat: sa paligid ng simula ng ruta, ang puwestong hindi
// tumatama sa linya, pinakakaunti ang natatakpan, at hindi humaharang sa mga
// pangalan ng kwarto — iyon ang pinakamabigat, dahil iyon ang binabasa ng bisita.
const PIN_NAME_WEIGHT = 8;
const PIN_DISTANCE_WEIGHT = 8;

const pinOverlap = (a, b) => Math.max(0, Math.min(a.r, b.r) - Math.max(a.l, b.l))
  * Math.max(0, Math.min(a.b, b.b) - Math.max(a.t, b.t));

// Ang gitna ng kahon, kung saan nakasulat ang pangalan.
const nameZone = (cx, cy, w = 150, h = 50) => ({ l: cx - w / 2, r: cx + w / 2, t: cy - h / 2, b: cy + h / 2 });

export const pinFor = ({ floor, method, path, label }) => {
  const nums = String(path).match(/-?\d+/g)?.map(Number);
  if (!nums || nums.length < 4) return arrivalFor(floor, method);

  const segments = [];
  for (let i = 0; i + 3 < nums.length; i += 2) {
    segments.push({
      l: Math.min(nums[i], nums[i + 2]), r: Math.max(nums[i], nums[i + 2]),
      t: Math.min(nums[i + 1], nums[i + 3]), b: Math.max(nums[i + 1], nums[i + 3]),
    });
  }

  const plan = floorPlans[floor];
  const covered = [];
  const names = [];
  const addBox = ({ left, top, width, height }) => {
    covered.push({ l: left, t: top, r: left + width, b: top + height });
    names.push(nameZone(left + width / 2, top + height / 2));
  };
  Object.entries(coordinateMapping[floor]).forEach(([key, office]) => {
    const s = office.style;
    if (key === 'mayor-main') {
      // Hugis-L: sa mahabang bahagi sa kaliwa ang pangalan (--l-arm, --l-leg).
      const arm = s.height * 0.28;
      const leg = s.width * 0.415;
      covered.push({ l: s.left, t: s.top, r: s.left + s.width, b: s.top + arm });
      covered.push({ l: s.left, t: s.top, r: s.left + leg, b: s.top + s.height });
      names.push(nameZone(s.left + leg / 2, s.top + arm + (s.height - arm) / 2));
    } else {
      addBox(s);
    }
  });
  plan.structures.forEach((s) => {
    if (s.type === 'elevator') {
      covered.push({ l: s.doors[0], t: s.top, r: s.doors[1] + s.doorW, b: s.top + s.doorH + 20 });
    } else {
      addBox(s);
    }
  });

  const w = label.length * 8.5 + 40;
  const h = 40;
  const dx = w / 2 + 14;
  const dy = h / 2 + 14;
  const [sx, sy] = nums;
  let best = null;
  [1, 1.8, 2.6].forEach((reach) => {
    [[0, dy], [0, -dy], [dx, 0], [-dx, 0], [dx, dy], [-dx, dy], [dx, -dy], [-dx, -dy]].forEach(([ox, oy]) => {
      const x = sx + ox * reach;
      const y = sy + oy * reach;
      const pin = { l: x - w / 2, r: x + w / 2, t: y - h / 2, b: y + h / 2 };
      const pad = { l: pin.l - 10, r: pin.r + 10, t: pin.t - 10, b: pin.b + 10 };
      if (segments.some((s) => s.r >= pad.l && s.l <= pad.r && s.b >= pad.t && s.t <= pad.b)) return;
      const score = covered.reduce((sum, c) => sum + pinOverlap(pin, c), 0)
        + names.reduce((sum, c) => sum + pinOverlap(pin, c) * PIN_NAME_WEIGHT, 0)
        + Math.hypot(ox * reach, oy * reach) * PIN_DISTANCE_WEIGHT;
      if (!best || score < best.score) best = { x, y, score };
    });
  });
  return best || arrivalFor(floor, method);
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
  if (!office?.routes) return method === 'stairs' ? (plan.passThrough || '') : '';
  // Walang escalator lampas sa 2nd Floor, kaya elevator ang kapalit (lumang QR).
  return office.routes[method] || office.routes.elevator || '';
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
