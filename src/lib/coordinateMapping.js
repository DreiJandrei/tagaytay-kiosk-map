// ==========================================================
// COORDINATE MAPPING DATA - SECURE FRONTEND ONLY
// ==========================================================
// Lahat ng puwesto ng kwarto, istruktura at ruta sa mapa. Hindi ito nasa
// database — nasa database lang ang teksto ng bawat tanggapan.
//
// Galing ang mga sukat sa bagong guhit na plano ng bawat palapag (Nobyembre
// 2026). Ground Floor: ang pixel ng larawan, bawas 60 sa x at 100 sa y. Sa
// 2nd–7th, pinalaki ang larawan (×1.25 hanggang ×1.9) at inilagay ang gitna
// ng gusali sa (715, 674), ang gitna ng kahon. Isang bagay lang ang dapat tandaan kapag binago ang puwesto
// ng kwarto: dapat dumaan pa rin ang ruta sa pagitan ng mga kwarto, hindi sa
// ibabaw nila.
//
// ANG RUTA. May sariling linya ang bawat tanggapan at bawat paraan ng pag-akyat,
// kaya ito ang pinakadiretsong daan mula roon — hindi dumaraan sa iisang
// sangandaan ng palapag, na nagdudulot ng paliko-likong ruta. Sa Ground Floor,
// `pathData` mula sa kiosk ("YOU ARE HERE"). Sa itaas, `routes` na may tig-isang
// linya para sa elevator, hagdan, at (sa 2nd Floor) escalator.

export const coordinateMapping = {
  // Ground Floor: bagong plano (Nobyembre 2026). Ang kiosk ay nasa lobby, sa
  // itaas ng Information Desk. Tatlong daan mula roon:
  //   • pataas sa gitnang pasilyo (x 977) — Tolentino Hall at ang mga kwarto
  //     sa magkabilang gilid nito;
  //   • pakaliwa sa bukana sa pader (y 881), tapos sa pasilyo sa ilalim ng
  //     PIO at ng hagdan (y 760) — PIO, Cultural Hall, hagdan, Canteen;
  //   • sa lobby mismo — Information Desk, Guard Post, elevator, escalator.
  1: {
    // Nasa ilalim ng Comfort Room ang elevator; sa pagitan ng dalawang pinto
    // humihinto ang linya.
    "elevator-up": {
      pathData: "M 977 940 L 977 760 L 1082 760 L 1082 711",
      style: { display: 'none' },
      isDirectionOnly: true,
      title: "Elevator to Upper Floors",
      badge: "Vertical Transport"
    },
    // Paakyat pakanan ang hagdan: papasok sa kaliwang dulo, tapos pakanan ang lakad.
    "stairs-up": {
      pathData: "M 977 940 L 977 881 L 850 881 L 850 760 L 378 760 L 378 694 L 440 694",
      style: { display: 'none' },
      isDirectionOnly: true,
      title: "Stairs to Upper Floors",
      badge: "Vertical Transport"
    },
    "tolentino-hall": {
      pathData: "M 977 940 L 977 396",
      style: { width: 393, height: 288, left: 748, top: 105 }, cssClass: "theme-amber"
    },
    "cultural-hall": {
      // Sa ilalim ng hall ang pasok, sa pagitan nito at ng hagdan.
      pathData: "M 977 940 L 977 881 L 850 881 L 850 760 L 720 760 L 720 627 L 548 627 L 548 596",
      style: { width: 391, height: 197, left: 353, top: 398 }, cssClass: "theme-cyan"
    },
    // Nasa labas ng gusali: lalabas sa pinto sa kaliwang pader.
    "canteen": {
      pathData: "M 977 940 L 977 881 L 850 881 L 850 760 L 175 760 L 175 983",
      style: { width: 157, height: 267, left: 97, top: 984 }, cssClass: "theme-blue"
    },
    // Patayo ang pangalan ng dalawang PIO (labelVertical) — makikitid sila.
    "pio-1": {
      pathData: "M 977 940 L 977 881 L 850 881 L 850 760 L 780 760 L 780 733",
      style: { width: 66, height: 272, left: 748, top: 460, fontSize: '12px' }, cssClass: "theme-purple",
      mapLabel: "Public Information Office (A)", labelVertical: true
    },
    "pio-2": {
      pathData: "M 977 940 L 977 881 L 850 881 L 850 733",
      style: { width: 71, height: 110, left: 816, top: 622, fontSize: '12px' }, cssClass: "theme-purple",
      mapLabel: "Public Information Office (B)", labelVertical: true
    },
    "csu-office": {
      pathData: "M 977 940 L 977 427 L 946 427",
      style: { width: 127, height: 64, left: 818, top: 395, fontSize: '12px' }, cssClass: "theme-teal"
    },
    "barangay-affairs": {
      pathData: "M 977 940 L 977 505 L 946 505",
      style: { width: 127, height: 84, left: 818, top: 463, fontSize: '12px' }, cssClass: "theme-teal"
    },
    "tourism-office": {
      pathData: "M 977 940 L 977 584 L 946 584",
      style: { width: 127, height: 65, left: 818, top: 552, fontSize: '12px' }, cssClass: "theme-teal"
    },
    "breastfeeding-room": {
      pathData: "M 977 940 L 977 434 L 1009 434",
      style: { width: 141, height: 73, left: 1010, top: 398, fontSize: '12px' }, cssClass: "theme-cyan"
    },
    "control-unit": {
      pathData: "M 977 940 L 977 532 L 1009 532",
      style: { width: 141, height: 114, left: 1010, top: 475 }, cssClass: "theme-cyan"
    },
    // Sa itaas ang pinto, galing sa maikling pasilyo sa ilalim ng Control Room.
    "restroom-cr": {
      pathData: "M 977 940 L 977 610 L 1078 610 L 1078 630",
      style: { width: 140, height: 56, left: 1010, top: 631, fontSize: '12px' }, cssClass: "theme-gray", isDirectionOnly: true
    },
    "info-desk": {
      pathData: "M 977 940 L 977 987",
      style: { width: 119, height: 161, left: 948, top: 988, fontSize: '12px' }, cssClass: "theme-blue"
    },
    "guard": {
      pathData: "M 977 940 L 1162 940 L 1162 1069",
      style: { width: 119, height: 82, left: 1103, top: 1070, fontSize: '12px' }, cssClass: "theme-indigo"
    },
  },
  2: {
    "city-eng": {
      routes: { elevator: "M 1046 608 L 1046 729 L 694 729 L 694 548 L 238 548 L 238 514", stairs: "M 541 659 L 694 659 L 694 548 L 238 548 L 238 514", escalator: "M 958 860 L 896 860 L 896 729 L 694 729 L 694 548 L 238 548 L 238 514" },
      style: { width: 258, height: 290, left: 106, top: 222 }, cssClass: ""
    },
    "housing": {
      routes: { elevator: "M 1046 608 L 1046 729 L 694 729 L 694 548 L 432 548 L 432 514", stairs: "M 541 659 L 694 659 L 694 548 L 432 548 L 432 514", escalator: "M 958 860 L 896 860 L 896 729 L 694 729 L 694 548 L 432 548 L 432 514" },
      style: { width: 114, height: 289, left: 375, top: 222 }, cssClass: "", labelVertical: true
    },
    "bac": {
      routes: { elevator: "M 1046 608 L 1046 729 L 694 729 L 694 548 L 557 548 L 557 514", stairs: "M 541 659 L 694 659 L 694 548 L 557 548 L 557 514", escalator: "M 958 860 L 896 860 L 896 729 L 694 729 L 694 548 L 557 548 L 557 514" },
      style: { width: 108, height: 290, left: 501, top: 222 }, cssClass: "", labelVertical: true
    },
    "planning": {
      routes: { elevator: "M 1046 608 L 1046 729 L 896 729 L 896 440 L 753 440 L 753 415", stairs: "M 541 659 L 694 659 L 694 440 L 753 440 L 753 415", escalator: "M 958 860 L 896 860 L 896 440 L 753 440 L 753 415" },
      style: { width: 259, height: 193, left: 621, top: 222 }, cssClass: ""
    },
    "zoning": {
      routes: { elevator: "M 1046 608 L 1046 729 L 896 729 L 896 440 L 996 440 L 996 415", stairs: "M 541 659 L 694 659 L 694 440 L 996 440 L 996 415", escalator: "M 958 860 L 896 860 L 896 440 L 996 440 L 996 415" },
      style: { width: 212, height: 193, left: 884, top: 222 }, cssClass: ""
    },
    "back-ext": {
      routes: { elevator: "M 1046 608 L 1046 729 L 896 729 L 896 440 L 1164 440 L 1164 350", stairs: "M 541 659 L 694 659 L 694 440 L 1164 440 L 1164 350", escalator: "M 958 860 L 896 860 L 896 440 L 1164 440 L 1164 350" },
      style: { width: 104, height: 125, left: 1106, top: 223, fontSize: '12px' }, cssClass: ""
    },
    "restroom-cr-2": {
      routes: { elevator: "M 1046 608 L 1046 729 L 896 729 L 896 440 L 1048 440 L 1048 472", stairs: "M 541 659 L 694 659 L 694 440 L 1048 440 L 1048 472", escalator: "M 958 860 L 896 860 L 896 440 L 1048 440 L 1048 472" },
      style: { width: 237, height: 98, left: 927, top: 471 }, cssClass: "", isDirectionOnly: true
    },
    "library": {
      routes: { elevator: "M 1046 608 L 1046 729 L 722 729 L 722 910", stairs: "M 541 659 L 722 659 L 722 910", escalator: "M 958 860 L 722 860 L 722 910" },
      style: { width: 187, height: 140, left: 629, top: 912 }, cssClass: ""
    },
  },
  3: {
    "budget-office": {
      routes: { elevator: "M 707 561 L 707 657 L 558 657 L 558 388 L 606 388 L 606 370", stairs: "M 382 1188 L 440 1188 L 440 972 L 558 972 L 558 388 L 606 388 L 606 370" },
      style: { width: 352, height: 245, left: 517, top: 120 }, cssClass: ""
    },
    "internal-audit": {
      routes: { elevator: "M 707 561 L 707 657 L 937 657 L 937 370", stairs: "M 382 1188 L 440 1188 L 440 972 L 558 972 L 558 657 L 937 657 L 937 370" },
      style: { width: 127, height: 245, left: 876, top: 120 }, cssClass: "", labelVertical: true
    },
    "treasure-office": {
      routes: { elevator: "M 707 561 L 707 657 L 961 657 L 961 592 L 1004 592", stairs: "M 382 1188 L 440 1188 L 440 972 L 558 972 L 558 657 L 961 657 L 961 592 L 1004 592" },
      style: { width: 298, height: 595, left: 1007, top: 120 }, cssClass: ""
    },
    "building-official": {
      routes: { elevator: "M 707 561 L 707 657 L 513 657", stairs: "M 382 1188 L 440 1188 L 440 972 L 558 972 L 558 674 L 513 674" },
      style: { width: 295, height: 434, left: 217, top: 413 }, cssClass: ""
    },
    "accounting-office": {
      routes: { elevator: "M 707 561 L 707 657 L 801 657 L 801 718", stairs: "M 382 1188 L 440 1188 L 440 972 L 558 972 L 558 657 L 801 657 L 801 718" },
      style: { width: 391, height: 346, left: 610, top: 720 }, cssClass: ""
    },
    "restroom-cr-3": {
      routes: { elevator: "M 707 561 L 707 657 L 558 657 L 558 388 L 707 388 L 707 411", stairs: "M 382 1188 L 440 1188 L 440 972 L 558 972 L 558 388 L 707 388 L 707 411" },
      style: { width: 191, height: 118, left: 610, top: 413 }, cssClass: "", isDirectionOnly: true
    },
  },
  4: {
    "const-north": {
      routes: { elevator: "M 703 565 L 703 653 L 558 653 L 558 393 L 604 393 L 604 372", stairs: "M 380 1191 L 454 1191 L 454 965 L 558 965 L 558 393 L 604 393 L 604 372" },
      style: { width: 477, height: 248, left: 515, top: 116 }, cssClass: ""
    },
    "const-east": {
      routes: { elevator: "M 703 565 L 703 653 L 956 653 L 956 602 L 996 602", stairs: "M 380 1191 L 454 1191 L 454 965 L 558 965 L 558 828 L 956 828 L 956 602 L 996 602" },
      style: { width: 308, height: 602, left: 1000, top: 116 }, cssClass: ""
    },
    "const-west": {
      routes: { elevator: "M 703 565 L 703 653 L 508 653", stairs: "M 380 1191 L 454 1191 L 454 965 L 558 965 L 558 677 L 508 677" },
      style: { width: 294, height: 437, left: 212, top: 417 }, cssClass: ""
    },
    "const-south": {
      routes: { elevator: "M 703 565 L 703 653 L 944 653 L 944 853", stairs: "M 380 1191 L 454 1191 L 454 965 L 558 965 L 558 828 L 944 828 L 944 853" },
      style: { width: 382, height: 209, left: 610, top: 857 }, cssClass: ""
    },
    "restroom-cr-4": {
      routes: { elevator: "M 703 565 L 703 653 L 558 653 L 558 393 L 703 393 L 703 412", stairs: "M 380 1191 L 454 1191 L 454 965 L 558 965 L 558 393 L 703 393 L 703 412" },
      style: { width: 191, height: 118, left: 606, top: 417 }, cssClass: "", isDirectionOnly: true
    },
  },
  5: {
    "hr-office": {
      routes: { elevator: "M 654 646 L 654 746 L 489 746 L 489 452 L 542 452 L 542 430", stairs: "M 874 861 L 935 861 L 935 452 L 911 452 L 911 430" },
      style: { width: 531, height: 276, left: 445, top: 147 }, cssClass: ""
    },
    "admin-office": {
      routes: { elevator: "M 654 646 L 654 746 L 935 746 L 935 687 L 977 687", stairs: "M 874 861 L 935 861 L 935 687 L 977 687" },
      style: { width: 345, height: 676, left: 983, top: 147 }, cssClass: ""
    },
    "legal-office": {
      routes: { elevator: "M 654 646 L 654 746 L 440 746", stairs: "M 874 861 L 935 861 L 935 746 L 440 746" },
      style: { width: 330, height: 481, left: 107, top: 482 }, cssClass: ""
    },
    "const-south-5": {
      routes: { elevator: "M 654 646 L 654 746 L 498 746 L 498 967", stairs: "M 874 861 L 922 861 L 922 967" },
      style: { width: 868, height: 231, left: 107, top: 974 }, cssClass: ""
    },
    "restroom-cr-5": {
      routes: { elevator: "M 654 646 L 654 746 L 489 746 L 489 452 L 654 452 L 654 477", stairs: "M 874 861 L 935 861 L 935 452 L 654 452 L 654 477" },
      style: { width: 213, height: 131, left: 546, top: 482 }, cssClass: "", isDirectionOnly: true
    },
  },
  6: {
    "wedding-hall": {
      routes: { elevator: "M 922 484 L 922 603 L 672 603", stairs: "M 1182 739 L 1256 739 L 1256 603 L 672 603" },
      style: { width: 404, height: 587, left: 262, top: 268 }, cssClass: ""
    },
    "conference-hall": {
      routes: { elevator: "M 922 484 L 922 603 L 1236 603 L 1236 862", stairs: "M 1182 739 L 1236 739 L 1236 862" },
      style: { width: 637, height: 288, left: 680, top: 868 }, cssClass: ""
    },
    "restroom-cr-6": {
      routes: { elevator: "M 922 484 L 922 603 L 733 603 L 733 262 L 922 262 L 922 289", stairs: "M 1182 739 L 1256 739 L 1256 262 L 922 262 L 922 289" },
      style: { width: 250, height: 153, left: 795, top: 295 }, cssClass: "", isDirectionOnly: true
    },
  },
  7: {
    "mayor-main": {
      routes: { elevator: "M 910 418 L 910 553 L 636 553", stairs: "M 1180 702 L 1248 702 L 1248 553 L 636 553" },
      style: { width: 1050, height: 665, left: 117, top: 173, clipPath: 'polygon(0% 0%, 100% 0%, 100% 29.3%, 48.9% 29.3%, 48.9% 100%, 0% 100%)', '--l-arm': '29.3%', '--l-leg': '48.9%' }, cssClass: ""
    },
    "waiting-area": {
      routes: { elevator: "M 910 418 L 910 553 L 708 553 L 708 836", stairs: "M 1180 702 L 1210 702 L 1210 802 L 708 802 L 708 836" },
      style: { width: 267, height: 330, left: 642, top: 844 }, cssClass: "", isDirectionOnly: true
    },
    "mayor-receiving": {
      routes: { elevator: "M 910 418 L 910 553 L 1229 553 L 1229 836", stairs: "M 1180 702 L 1229 702 L 1229 836" },
      style: { width: 389, height: 330, left: 921, top: 844 }, cssClass: ""
    },
  },
};

// Ang lahat ng hindi tanggapan sa bawat palapag.
//   look          — 'drawn': guhit na plano (navy na kwarto, kulay-abong sahig,
//                   maitim na pader)
//   frame         — kahon sa paligid ng buong plano, may header na `header` ang
//                   taas; sa gitna ng header dapat ang `caption`. Iisa ang laki
//                   sa lahat ng palapag, para hindi gumagalaw ang kahon sa paglipat
//   floor / blank — sahig ng gusali, at ang mga bakanteng puting bahagi (rect na
//                   x/y/w/h, o `d` kapag pahilis ang gilid). Sa 2nd–7th, ang puti
//                   sa ilalim ng Comfort Room ang harap ng elevator
//   walk          — daan sa labas ng gusali (Ground Floor: papuntang Canteen)
//   soft          — manipis na kulay-abong pader (paligid ng CR at elevator, at
//                   ang marka ng pinto sa ilalim ng mga kwarto)
//   wall / box    — panlabas na pader. Sa Ground Floor, ang puwang sa ilalim,
//                   sa pagitan ng Information Desk at Guard Post, ang pinto ng
//                   main entrance; nasa tapat nito ang `entrance`. Ang puwang
//                   sa kaliwang pader ang daan papuntang Canteen
//   walls         — pader ng mga kwarto (mapp.pdf); ang puwang sa linya ang pinto,
//                   at doon pumapasok ang ruta ng bawat tanggapan
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
    look: 'drawn',
    // Ang kahong kinalalagyan ng buong plano, pati ang Canteen; nasa header
    // nito ang pangalan ng palapag (`caption`).
    frame: { x: 56, y: 4, w: 1318, h: 1284, header: 56, r: 18 },
    floor: "M 350 100 L 1333 100 L 1333 1162 L 941 1162 L 941 1029 L 745 1029 L 745 794 L 350 794 Z",
    // Daan sa labas, mula sa pinto sa kaliwang pader hanggang sa Canteen.
    walk: "M 350 735 L 150 735 L 150 984 L 200 984 L 200 785 L 350 785 Z",
    blank: [
      { x: 350, y: 100, w: 398, h: 295 },
      { x: 1143, y: 100, w: 190, h: 295 },
      { x: 1152, y: 395, w: 181, h: 339 },
    ],
    wall: "M 350 735 L 350 100 L 1333 100 L 1333 1162 L 1110 1162 M 1060 1162 L 941 1162 L 941 1029 L 745 1029 L 745 794 L 350 794 L 350 785",
    walls: "M 350 395 L 962 395 M 992 395 L 1333 395 M 748 100 L 748 395 M 1143 100 L 1143 395 M 745 395 L 745 734 M 350 597 L 523 597 M 573 597 L 745 597 M 745 460 L 818 460 M 818 395 L 818 620 M 814 460 L 814 733 M 818 460 L 944 460 M 818 549 L 944 549 M 814 620 L 944 620 M 887 620 L 887 733 M 745 733 L 763 733 M 797 733 L 831 733 M 869 733 L 944 733 M 944 395 L 944 844 M 944 919 L 944 1029 M 1010 395 L 1010 590 M 1010 630 L 1010 687 M 1152 395 L 1152 734 M 1010 472 L 1152 472 M 1010 589 L 1152 589 M 1010 631 L 1059 631 M 1097 631 L 1152 631 M 1010 686 L 1152 686 M 1011 734 L 1043 734 M 1118 734 L 1333 734",
    caption: { x: 715, y: 32 },
    kiosk: {"x":977,"y":940},
    escalatorPath: "M 977 940 L 1305 940 L 1305 831 L 1279 831",
    structures: [
      {"type":"stairs","left":406,"top":656,"width":290,"height":77,"arrow":"right"},
      {"type":"elevator","doors":[1042,1084],"top":690,"doorW":38,"doorH":20},
      {"type":"escalator","left":1014,"top":792,"width":264,"height":79,"arrow":"left"},
      {"type":"exit","left":1250,"top":678,"width":78,"height":50},
      {"type":"entrance","left":995,"top":1174,"width":180,"height":30},
    ],
  },
  2: {
    look: 'drawn',
    frame: { x: 56, y: 4, w: 1318, h: 1284, header: 56, r: 18 },
    floor: "M 99 215 L 1331 215 L 1331 1133 L 99 1133 Z",
    blank: [
      { d: "M 99 735 L 622 735 L 622 790 L 534 883 L 534 1133 L 99 1133 Z" },
      { d: "M 929 930 L 1331 930 L 1331 989 L 929 989 Z" },
      { d: "M 929 989 L 1331 989 L 1331 1133 L 832 1133 L 926 994 Z" },
      { d: "M 927 570 L 1163 570 L 1163 674 L 927 674 Z" },
      { d: "M 769 468 L 868 468 L 868 674 L 769 674 Z" },
    ],
    wall: "M 99 215 L 1331 215 L 1331 1133 L 99 1133 Z",
    walls: "M 99 583 L 627 583 M 99 735 L 622 735 L 622 790 L 534 883 L 534 1133 M 924 788 L 1331 788 M 929 930 L 1331 930 M 929 930 L 929 994 L 832 1133 M 923 989 L 1331 989 M 363 215 L 363 513 M 374 215 L 374 513 M 488 215 L 488 513 M 501 215 L 501 513 M 608 215 L 608 513 M 621 215 L 621 414 M 881 215 L 881 414 M 1096 215 L 1096 414 M 1106 215 L 1106 349 M 1209 215 L 1209 349 M 99 512 L 172 512 M 304 512 L 399 512 M 464 512 L 526 512 M 589 512 L 609 512 M 621 414 L 719 414 M 786 414 L 939 414 M 1052 414 L 1096 414 M 1106 348 L 1136 348 M 1193 348 L 1209 348 M 927 569 L 1163 569",
    soft: "M 107 516 L 172 516 M 304 516 L 399 516 M 464 516 L 524 516 M 589 516 L 618 516 M 611 418 L 719 418 M 787 418 L 939 418 M 1053 418 L 1107 418 M 368 222 L 368 519 M 494 222 L 494 519 M 613 222 L 613 519 M 1099 353 L 1136 353 M 1194 353 L 1219 353 M 1216 222 L 1216 356 M 1102 222 L 1102 419 M 923 463 L 923 676 M 1167 463 L 1167 676 M 921 465 L 983 465 M 1113 465 L 1171 465 M 921 673 L 983 673 M 1108 673 L 1171 673 M 769 468 L 868 468 L 868 673 L 769 673 L 769 468 M 792 492 L 843 492 L 843 652 L 792 652 L 792 492",
    caption: { x: 715, y: 32 },
    arrivals: {
      elevator: { x: 1046, y: 608 },
      stairs: { x: 541, y: 659 },
      escalator: { x: 958, y: 860 },
    },
    passThrough: "M 541 659 L 666 659 L 666 890 L 582 890 L 582 1013",
    structures: [
      {"type":"stairs","left":167,"top":613,"width":360,"height":95,"arrow":"right"},
      {"type":"stairs-l","left":549,"top":958,"width":235,"height":167,"arm":65,"foot":61,"arrow":"l"},
      {"type":"escalator","left":958,"top":812,"width":329,"height":97,"arrow":"left"},
      {"type":"elevator","doors":[1003,1049],"top":575,"doorW":40,"doorH":32},
      {"type":"exit","left":1191,"top":595,"width":92,"height":63},
    ],
  },
  3: {
    look: 'drawn',
    frame: { x: 56, y: 4, w: 1318, h: 1284, header: 56, r: 18 },
    floor: "M 120 112 L 1310 112 L 1310 1236 L 120 1236 Z",
    blank: [
      { d: "M 120 112 L 515 112 L 515 368 L 427 368 L 427 411 L 120 411 Z" },
      { d: "M 427 368 L 513 368 L 513 411 L 427 411 Z" },
      { d: "M 120 411 L 214 411 L 214 852 L 120 852 Z" },
      { d: "M 120 852 L 213 852 L 120 931 Z" },
      { d: "M 1004 716 L 1310 716 L 1310 1236 L 431 1236 L 608 1067 L 1004 1067 Z" },
      { d: "M 608 531 L 804 531 L 804 595 L 608 595 Z" },
    ],
    wall: "M 120 112 L 1310 112 L 1310 1236 L 120 1236 Z",
    walls: "M 515 112 L 515 368 M 872 112 L 872 368 M 1006 112 L 1006 524 M 1006 657 L 1006 717 M 427 368 L 557 368 M 656 368 L 904 368 M 969 368 L 1006 368 M 427 368 L 427 411 M 120 411 L 512 411 M 214 411 L 214 852 M 510 411 L 510 613 M 510 735 L 510 852 M 120 852 L 512 852 M 120 931 L 213 852 M 1006 716 L 1310 716 M 605 718 L 751 718 M 852 718 L 1004 718 M 608 718 L 608 1067 M 1003 718 L 1003 1067 M 608 1067 L 1004 1067 M 608 1067 L 431 1236 M 609 531 L 801 531",
    soft: "M 606 406 L 606 596 M 804 406 L 804 596 M 605 409 L 653 409 M 759 409 L 807 409 M 605 593 L 655 593 M 759 593 L 807 593",
    caption: { x: 715, y: 32 },
    arrivals: {
      elevator: { x: 707, y: 561 },
      stairs: { x: 382, y: 1188 },
    },
    // Umiikot sa labas ng hagdan: mula sa dulo ng dinatnan (kanan sa
    // ibaba), pakanan, paakyat sa gilid, pakaliwa sa itaas, at pababa sa
    // simula ng susunod na akyat (itaas ng makitid na bahagi).
    passThrough: "M 382 1188 L 425 1188 L 425 1015 L 171 1015 L 171 1063",
    structures: [
      {"type":"stairs-l","left":137,"top":1044,"width":245,"height":175,"arm":68,"foot":64,"arrow":"l"},
      {"type":"elevator","doors":[664,710],"top":537,"doorW":40,"doorH":23},
      {"type":"exit","left":822,"top":524,"width":96,"height":66},
    ],
  },
  4: {
    look: 'drawn',
    frame: { x: 56, y: 4, w: 1318, h: 1284, header: 56, r: 18 },
    floor: "M 117 109 L 1313 109 L 1313 1239 L 117 1239 Z",
    blank: [
      { d: "M 117 109 L 514 109 L 514 415 L 117 415 Z" },
      { d: "M 117 415 L 209 415 L 209 857 L 117 857 Z" },
      { d: "M 117 857 L 209 857 L 117 939 Z" },
      { d: "M 998 718 L 1313 718 L 1313 1239 L 432 1239 L 607 1069 L 998 1069 Z" },
      { d: "M 606 536 L 800 536 L 800 597 L 606 597 Z" },
    ],
    wall: "M 117 109 L 1313 109 L 1313 1239 L 117 1239 Z",
    walls: "M 514 109 L 514 370 M 997 109 L 997 543 M 997 660 L 997 1069 M 514 370 L 555 370 M 654 370 L 902 370 M 966 370 L 997 370 M 117 415 L 514 415 M 209 415 L 209 857 M 507 415 L 507 616 M 507 738 L 507 854 M 117 854 L 510 854 M 117 939 L 209 857 M 997 718 L 1313 718 M 607 854 L 919 854 M 970 854 L 997 854 M 607 854 L 607 1069 M 607 1069 L 997 1069 M 607 1069 L 432 1239 M 607 534 L 798 534",
    soft: "M 603 411 L 603 599 M 802 411 L 802 599 M 603 412 L 651 412 M 755 412 L 803 412 M 603 597 L 651 597 M 757 597 L 803 597",
    caption: { x: 715, y: 32 },
    arrivals: {
      elevator: { x: 703, y: 565 },
      stairs: { x: 380, y: 1191 },
    },
    passThrough: "M 380 1191 L 454 1191 L 454 965 L 558 965 L 558 757 L 636 757",
    structures: [
      {"type":"stairs","left":606,"top":707,"width":295,"height":99,"arrow":"right"},
      {"type":"stairs-l","left":135,"top":1048,"width":245,"height":174,"arm":68,"foot":62,"arrow":"l"},
      {"type":"elevator","doors":[660,706],"top":541,"doorW":40,"doorH":23},
      {"type":"exit","left":818,"top":521,"width":96,"height":65},
    ],
  },
  5: {
    look: 'drawn',
    frame: { x: 56, y: 4, w: 1318, h: 1284, header: 56, r: 18 },
    floor: "M 99 139 L 1331 139 L 1331 1209 L 99 1209 Z",
    blank: [
      { d: "M 99 139 L 440 139 L 440 477 L 99 477 Z" },
      { d: "M 979 828 L 1331 828 L 1331 1209 L 979 1209 Z" },
      { d: "M 545 615 L 760 615 L 760 681 L 545 681 Z" },
    ],
    wall: "M 99 139 L 1331 139 L 1331 1209 L 99 1209 Z",
    walls: "M 440 139 L 440 429 M 440 429 L 489 429 M 598 429 L 876 429 M 947 429 L 979 429 M 979 139 L 979 623 M 979 752 L 979 1209 M 99 477 L 440 477 M 437 477 L 437 704 M 437 841 L 437 968 M 99 968 L 454 968 M 541 968 L 895 968 M 951 968 L 979 968 M 979 828 L 1331 828 M 547 613 L 758 613",
    soft: "M 542 474 L 542 686 M 763 474 L 763 686 M 542 475 L 596 475 M 712 475 L 766 475 M 542 683 L 596 683 M 714 683 L 766 683",
    caption: { x: 715, y: 32 },
    arrivals: {
      elevator: { x: 654, y: 646 },
      stairs: { x: 874, y: 861 },
    },
    // Umiikot sa labas ng hagdan: mula sa kanang dulo (dinatnan), paakyat
    // sa itaas nito, pakaliwa, at pababa papasok sa kaliwang dulo — doon
    // nagsisimula ang susunod na akyat.
    passThrough: "M 874 861 L 910 861 L 910 750 L 512 750 L 512 861 L 570 861",
    structures: [
      {"type":"stairs","left":545,"top":806,"width":329,"height":110,"arrow":"right"},
      {"type":"elevator","doors":[611,657],"top":620,"doorW":40,"doorH":25},
      {"type":"exit","left":785,"top":599,"width":107,"height":72},
    ],
  },
  6: {
    look: 'drawn',
    frame: { x: 56, y: 4, w: 1318, h: 1284, header: 56, r: 18 },
    floor: "M 257 265 L 672 265 L 672 190 L 1323 190 L 1323 1158 L 257 1158 L 257 862 L 107 862 L 107 449 L 257 449 Z",
    blank: [
      { d: "M 107 449 L 257 449 L 257 862 L 107 862 Z" },
      { d: "M 672 190 L 1323 190 L 1323 233 L 672 233 Z" },
      { d: "M 794 449 L 1049 449 L 1049 529 L 794 529 Z" },
    ],
    wall: "M 257 265 L 672 265 L 672 190 L 1323 190 L 1323 1158 L 257 1158 L 257 862 L 107 862 L 107 449 L 257 449 Z",
    walls: "M 672 233 L 1316 233 M 670 265 L 670 554 M 670 716 L 670 862 M 259 449 L 259 862 M 257 857 L 672 857 M 791 864 L 1204 864 M 1270 864 L 1323 864 M 677 858 L 677 1158 M 796 449 L 1047 449",
    soft: "M 792 286 L 792 532 M 1051 286 L 1051 532 M 791 287 L 854 287 M 990 287 L 1054 287 M 791 529 L 854 529 M 991 529 L 1054 529",
    caption: { x: 715, y: 32 },
    arrivals: {
      elevator: { x: 922, y: 484 },
      stairs: { x: 1182, y: 739 },
    },
    // Gaya ng sa 5th Floor: umiikot sa itaas ng hagdan papunta sa kaliwang dulo.
    passThrough: "M 1182 739 L 1225 739 L 1225 625 L 755 625 L 755 739 L 818 739",
    structures: [
      {"type":"stairs","left":794,"top":675,"width":388,"height":127,"arrow":"right"},
      {"type":"elevator","doors":[879,925],"top":455,"doorW":40,"doorH":28},
      {"type":"exit","left":1069,"top":432,"width":126,"height":85},
    ],
  },
  7: {
    look: 'drawn',
    frame: { x: 56, y: 4, w: 1318, h: 1284, header: 56, r: 18 },
    floor: "M 112 168 L 1318 168 L 1318 1180 L 112 1180 Z",
    blank: [
      { d: "M 1172 168 L 1318 168 L 1318 475 L 1062 475 L 1062 371 L 1172 371 Z" },
      { d: "M 765 380 L 1056 380 L 1056 474 L 765 474 Z" },
    ],
    wall: "M 112 168 L 1318 168 L 1318 1180 L 112 1180 Z",
    walls: "M 1172 168 L 1172 371 M 632 371 L 1172 371 M 1062 371 L 1062 475 M 1062 475 L 1318 475 M 634 371 L 634 493 M 634 605 L 634 838 M 112 838 L 674 838 M 744 838 L 1185 838 M 1271 838 L 1318 838 M 640 838 L 640 1180 M 914 838 L 914 1180 M 763 379 L 1067 379",
    soft: "M 765 380 L 765 477 M 1056 380 L 1056 477 M 763 474 L 834 474 M 986 474 L 1058 474",
    caption: { x: 715, y: 32 },
    arrivals: {
      elevator: { x: 910, y: 418 },
      stairs: { x: 1180, y: 702 },
    },
    structures: [
      {"type":"stairs","left":746,"top":629,"width":434,"height":143,"arrow":"right"},
      {"type":"elevator","doors":[867,913],"top":385,"doorW":40,"doorH":32},
      {"type":"exit","left":1073,"top":384,"width":118,"height":82},
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
  Object.values(coordinateMapping[floor]).forEach((office) => {
    const s = office.style;
    if (s['--l-arm']) {
      // Hugis-L: sa mahabang bahagi sa kaliwa ang pangalan (--l-arm, --l-leg).
      const arm = s.height * parseFloat(s['--l-arm']) / 100;
      const leg = s.width * parseFloat(s['--l-leg']) / 100;
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
