// ==========================================================
// COORDINATE MAPPING DATA - SECURE FRONTEND ONLY
// ==========================================================
// Lahat ng puwesto ng kwarto, istruktura at ruta sa mapa. Hindi ito nasa
// database — nasa database lang ang teksto ng bawat tanggapan.
//
// Galing ang mga sukat sa pinagtibay na plano ng bawat palapag (editsss.pdf,
// Oktubre 2026; mapp.pdf, Nobyembre 2026, para sa mga pader at pinto). Isang bagay lang ang dapat tandaan kapag binago ang puwesto
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
      pathData: "M 1047 698 L 1047 626 L 1239 626 L 1239 592",
      style: { display: 'none' },
      isDirectionOnly: true,
      title: "Elevator to Upper Floors",
      badge: "Vertical Transport"
    },
    // Paakyat pakanan ang hagdan: papasok sa kaliwang dulo, tapos pakanan ang lakad.
    "stairs-up": {
      pathData: "M 1047 698 L 1047 574 L 379 574 L 379 545 L 546 545",
      style: { display: 'none' },
      isDirectionOnly: true,
      title: "Stairs to Upper Floors",
      badge: "Vertical Transport"
    },
    "tolentino-hall": {
      pathData: "M 1047 698 L 1047 252",
      style: { width: 729, height: 137, left: 596, top: 115 }, cssClass: "theme-amber"
    },
    "cultural-hall": {
      // Sa ilalim ng hall ang pasok, sa pagitan nito at ng hagdan.
      pathData: "M 1047 698 L 1047 562 L 599 562 L 599 486 L 467 486 L 467 465",
      style: { width: 353, height: 192, left: 275, top: 273 }, cssClass: "theme-cyan"
    },
    "canteen": {
      pathData: "M 1047 698 L 1047 578 L 279 578 L 279 686 L 255 686 L 255 719",
      style: { width: 263, height: 233, left: 24, top: 719 }, cssClass: "theme-blue"
    },
    "pio-1": {
      pathData: "M 1047 698 L 1047 562 L 695 562 L 695 534",
      style: { width: 84, height: 264, left: 652, top: 270, fontSize: '12px' }, cssClass: "theme-purple", mapLabel: "PIO A"
    },
    "pio-2": {
      pathData: "M 1047 698 L 1047 562 L 783 562 L 783 534",
      style: { width: 174, height: 70, left: 741, top: 464, fontSize: '12px' }, cssClass: "theme-purple", mapLabel: "PIO B"
    },
    "csu-office": {
      pathData: "M 1047 698 L 1047 302 L 1019 302",
      style: { width: 131, height: 65, left: 888, top: 270, fontSize: '12px' }, cssClass: "theme-teal"
    },
    "barangay-affairs": {
      pathData: "M 1047 698 L 1047 370 L 1022 370",
      style: { width: 264, height: 51, left: 758, top: 340, fontSize: '12px' }, cssClass: "theme-teal"
    },
    "tourism-office": {
      pathData: "M 1047 698 L 1047 426 L 1022 426",
      style: { width: 264, height: 52, left: 758, top: 402, fontSize: '12px' }, cssClass: "theme-teal"
    },
    "breastfeeding-room": {
      pathData: "M 1047 698 L 1047 326 L 1121 326",
      style: { width: 204, height: 75, left: 1121, top: 270 }, cssClass: "theme-cyan"
    },
    "control-unit": {
      pathData: "M 1047 698 L 1047 458 L 1275 458 L 1275 439",
      style: { width: 204, height: 76, left: 1121, top: 363, fontSize: '12px' }, cssClass: "theme-cyan"
    },
    "restroom-cr": {
      pathData: "M 1047 698 L 1047 458 L 1223 458 L 1223 478",
      style: { width: 177, height: 54, left: 1149, top: 478, fontSize: '12px' }, cssClass: "theme-gray", isDirectionOnly: true
    },
    "info-desk": {
      pathData: "M 1047 698 L 1047 723",
      style: { width: 130, height: 105, left: 970, top: 723, fontSize: '12px' }, cssClass: "theme-blue"
    },
    "guard": {
      pathData: "M 1047 698 L 1131 698 L 1131 782 L 1210 782",
      style: { width: 97, height: 80, left: 1210, top: 742, fontSize: '12px' }, cssClass: "theme-indigo"
    },
  },
  2: {
    "city-eng": {
      routes: { elevator: "M 928 508 L 928 575 L 508 575 L 508 307 L 228 307 L 228 277", stairs: "M 349 433 L 349 305 L 237 305 L 237 277", escalator: "M 865 663 L 649 663 L 649 307 L 237 307 L 237 277" },
      style: { width: 168, height: 138, left: 142, top: 139 }, cssClass: ""
    },
    "housing": {
      routes: { elevator: "M 928 508 L 928 575 L 508 575 L 508 307 L 404 307 L 404 277", stairs: "M 349 433 L 349 305 L 393 305 L 393 277", escalator: "M 865 663 L 649 663 L 649 307 L 417 307 L 417 277" },
      style: { width: 170, height: 138, left: 317, top: 139 }, cssClass: ""
    },
    "bac": {
      routes: { elevator: "M 928 508 L 928 575 L 568 575 L 568 277", stairs: "M 474 470 L 568 470 L 568 277", escalator: "M 865 663 L 649 663 L 649 307 L 569 307 L 569 277" },
      style: { width: 150, height: 138, left: 494, top: 139, fontSize: '12px' }, cssClass: ""
    },
    "planning": {
      routes: { elevator: "M 928 508 L 928 575 L 696 575 L 696 277", stairs: "M 474 470 L 696 470 L 696 277", escalator: "M 865 663 L 697 663 L 697 277" },
      style: { width: 171, height: 138, left: 656, top: 139 }, cssClass: ""
    },
    "zoning": {
      routes: { elevator: "M 928 508 L 928 575 L 784 575 L 784 307 L 968 307 L 968 277", stairs: "M 349 433 L 349 305 L 965 305 L 965 277", escalator: "M 865 663 L 781 663 L 781 307 L 965 307 L 965 277" },
      style: { width: 177, height: 138, left: 834, top: 139, fontSize: '12px' }, cssClass: ""
    },
    "back-ext": {
      routes: { elevator: "M 928 508 L 928 575 L 784 575 L 784 307 L 1088 307 L 1088 277", stairs: "M 349 433 L 349 305 L 1077 305 L 1077 277", escalator: "M 865 663 L 781 663 L 781 307 L 1077 307 L 1077 277" },
      style: { width: 126, height: 138, left: 1026, top: 139, fontSize: '12px' }, cssClass: ""
    },
    "restroom-cr-2": {
      routes: { elevator: "M 928 508 L 928 575 L 784 575 L 784 307 L 908 307 L 908 334", stairs: "M 349 433 L 349 305 L 909 305 L 909 334", escalator: "M 865 663 L 781 663 L 781 307 L 909 307 L 909 334" },
      style: { width: 221, height: 94, left: 817, top: 334 }, cssClass: "", isDirectionOnly: true
    },
    "library": {
      routes: { elevator: "M 928 508 L 928 595 L 484 595 L 484 666", stairs: "M 349 506 L 349 630 L 453 630 L 453 666", escalator: "M 865 663 L 649 663 L 649 631 L 485 631 L 485 666" },
      style: { width: 299, height: 191, left: 313, top: 666 }, cssClass: ""
    },
  },
  3: {
    "building-official": {
      routes: { elevator: "M 613 524 L 613 593 L 453 593 L 453 489 L 420 489", stairs: "M 263 853 L 263 665 L 455 665 L 455 489 L 420 489" },
      style: { width: 194, height: 294, left: 226, top: 338 }, cssClass: ""
    },
    "budget-office": {
      routes: { elevator: "M 613 524 L 613 593 L 493 593 L 493 321", stairs: "M 263 853 L 263 665 L 479 665 L 479 321" },
      style: { width: 206, height: 163, left: 442, top: 158 }, cssClass: ""
    },
    "internal-audit": {
      routes: { elevator: "M 613 524 L 613 593 L 493 593 L 493 349 L 737 349 L 737 321", stairs: "M 263 853 L 263 665 L 495 665 L 495 349 L 735 349 L 735 321" },
      style: { width: 148, height: 163, left: 670, top: 158 }, cssClass: ""
    },
    "treasure-office": {
      routes: { elevator: "M 613 524 L 613 625 L 845 625", stairs: "M 263 853 L 263 665 L 811 665 L 811 637 L 845 637" },
      style: { width: 225, height: 408, left: 845, top: 295 }, cssClass: ""
    },
    "accounting-office": {
      routes: { elevator: "M 613 524 L 613 669 L 537 669 L 537 700", stairs: "M 263 853 L 263 669 L 503 669 L 503 700" },
      style: { width: 369, height: 236, left: 452, top: 700 }, cssClass: ""
    },
    "restroom-cr-3": {
      routes: { elevator: "M 613 524 L 613 593 L 493 593 L 493 341 L 609 341 L 609 370", stairs: "M 263 853 L 263 665 L 495 665 L 495 341 L 611 341 L 611 370" },
      style: { width: 195, height: 87, left: 529, top: 370 }, cssClass: "", isDirectionOnly: true
    },
  },
  4: {
    "const-west": {
      routes: { elevator: "M 632 540 L 632 585 L 464 585 L 464 493 L 429 493", stairs: "M 260 846 L 260 666 L 464 666 L 464 494 L 429 494" },
      style: { width: 213, height: 294, left: 216, top: 343 }, cssClass: ""
    },
    "const-north": {
      routes: { elevator: "M 632 540 L 632 585 L 472 585 L 472 325 L 604 325 L 604 297", stairs: "M 260 846 L 260 666 L 472 666 L 472 326 L 604 326 L 604 297" },
      style: { width: 375, height: 161, left: 433, top: 136 }, cssClass: ""
    },
    "const-east": {
      routes: { elevator: "M 632 540 L 632 587 L 808 587 L 808 625 L 843 625", stairs: "M 260 846 L 260 666 L 476 666 L 476 587 L 808 587 L 808 634 L 843 634" },
      style: { width: 227, height: 408, left: 843, top: 278 }, cssClass: ""
    },
    "const-south": {
      routes: { elevator: "M 632 540 L 632 587 L 744 587 L 744 713", stairs: "M 260 846 L 260 666 L 476 666 L 476 587 L 744 587 L 744 713" },
      style: { width: 370, height: 235, left: 458, top: 713 }, cssClass: ""
    },
    "restroom-cr-4": {
      routes: { elevator: "M 632 540 L 632 585 L 472 585 L 472 349 L 588 349 L 588 377", stairs: "M 260 846 L 260 666 L 472 666 L 472 346 L 588 346 L 588 377" },
      style: { width: 196, height: 101, left: 508, top: 377 }, cssClass: "", isDirectionOnly: true
    },
  },
  5: {
    "legal-office": {
      routes: { elevator: "M 646 533 L 646 572 L 458 572 L 458 544 L 420 544", stairs: "M 666 644 L 716 644 L 716 572 L 456 572 L 456 544 L 420 544" },
      style: { width: 194, height: 286, left: 226, top: 342 }, cssClass: ""
    },
    "hr-office": {
      routes: { elevator: "M 646 533 L 646 572 L 490 572 L 490 297", stairs: "M 666 644 L 716 644 L 716 572 L 488 572 L 488 297" },
      style: { width: 370, height: 164, left: 451, top: 133 }, cssClass: ""
    },
    "admin-office": {
      routes: { elevator: "M 646 533 L 646 572 L 714 572 L 714 616 L 852 616", stairs: "M 666 628 L 852 628" },
      style: { width: 224, height: 407, left: 852, top: 261 }, cssClass: ""
    },
    "const-south-5": {
      routes: { elevator: "M 646 533 L 646 580 L 750 580 L 750 710", stairs: "M 666 644 L 752 644 L 752 710" },
      style: { width: 370, height: 238, left: 463, top: 710 }, cssClass: ""
    },
    "restroom-cr-5": {
      routes: { elevator: "M 646 533 L 646 572 L 482 572 L 482 336 L 602 336 L 602 368", stairs: "M 666 644 L 716 644 L 716 572 L 484 572 L 484 336 L 600 336 L 600 368" },
      style: { width: 194, height: 97, left: 520, top: 368 }, cssClass: "", isDirectionOnly: true
    },
  },
  6: {
    "wedding-hall": {
      routes: { elevator: "M 785 406 L 785 481 L 547 481", stairs: "M 821 621 L 867 621 L 867 481 L 547 481" },
      style: { width: 225, height: 750, left: 322, top: 157 }, cssClass: ""
    },
    "conference-hall": {
      routes: { elevator: "M 785 406 L 785 541 L 937 541 L 937 700", stairs: "M 821 621 L 939 621 L 939 700" },
      style: { width: 450, height: 213, left: 565, top: 700 }, cssClass: ""
    },
    "restroom-cr-6": {
      routes: { elevator: "M 785 406 L 785 469 L 613 469 L 613 197 L 741 197 L 741 225", stairs: "M 821 621 L 1027 621 L 1027 197 L 783 197 L 783 225" },
      style: { width: 225, height: 108, left: 648, top: 225 }, cssClass: "", isDirectionOnly: true
    },
  },
  7: {
    "mayor-main": {
      routes: { elevator: "M 816 454 L 816 564 L 604 564 L 604 632 L 581 632", stairs: "M 858 641 L 900 641 L 900 565 L 604 565 L 604 629 L 581 629" },
      style: { width: 542, height: 765, left: 356, top: 155, clipPath: 'polygon(0% 0%, 100% 0%, 100% 28%, 41.5% 28%, 41.5% 100%, 0% 100%)', '--l-arm': '28%', '--l-leg': '41.5%' }, cssClass: ""
    },
    "mayor-receiving": {
      routes: { elevator: "M 816 454 L 816 564 L 944 564 L 944 720", stairs: "M 858 641 L 944 641 L 944 720" },
      style: { width: 206, height: 207, left: 816, top: 720 }, cssClass: ""
    },
    "waiting-area": {
      routes: { elevator: "M 816 454 L 816 564 L 640 564 L 640 720", stairs: "M 858 641 L 900 641 L 900 565 L 640 565 L 640 720" },
      style: { width: 201, height: 207, left: 598, top: 720 }, cssClass: "", isDirectionOnly: true
    },
  },
};

// Ang lahat ng hindi tanggapan sa bawat palapag.
//   wall / box    — panlabas na pader (hugis-L ang Ground Floor). Sa Ground Floor,
//                   ang puwang sa ilalim, sa pagitan ng Information Desk at Guard
//                   Post, ang pinto ng main entrance; nasa tapat nito ang `entrance`
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
    wall: "M 300 600 L 950 600 L 950 845 L 1114 845 M 1192 845 L 1387 845 L 1387 100 L 254 100 L 254 600 L 262 600",
    walls: "M 584 107 L 1334 107 M 584 107 L 584 257 M 1334 107 L 1334 257 M 584 257 L 1033 257 M 1107 257 L 1334 257 M 265 264 L 638 264 M 265 264 L 265 466 M 638 264 L 638 466 M 265 466 L 427 466 M 479 466 L 638 466 M 644 264 L 739 264 M 644 264 L 644 539 M 739 264 L 739 539 M 644 539 L 675 539 M 712 539 L 756 539 M 808 539 L 918 539 M 918 458 L 918 539 M 876 264 L 1029 264 M 876 264 L 876 336 M 749 336 L 1029 336 M 749 397 L 1029 397 M 749 336 L 749 458 M 739 458 L 1029 458 M 1029 264 L 1029 287 M 1029 316 L 1029 353 M 1029 382 L 1029 412 M 1029 441 L 1029 458 M 1112 264 L 1334 264 M 1112 264 L 1112 301 M 1112 336 L 1112 348 M 1334 264 L 1334 348 M 1112 348 L 1334 348 M 1112 358 L 1334 358 M 1112 358 L 1112 446 M 1334 358 L 1334 446 M 1112 446 L 1262 446 M 1313 446 L 1334 446 M 1139 471 L 1208 471 M 1267 471 L 1334 471 M 1139 471 L 1139 539 M 1334 471 L 1334 539 M 1139 539 L 1334 539 M 1181 539 L 1181 615 M 1301 539 L 1301 615 M 1181 615 L 1208 615 M 1274 615 L 1301 615 M 15 709 L 209 709 M 270 709 L 297 709 M 15 709 L 15 962 M 297 709 L 297 962 M 15 962 L 297 962",
    caption: { x: 820, y: 100 },
    kiosk: {"x":1047,"y":698},
    escalatorPath: "M 1047 698 L 1047 626 L 1339 626 L 1339 670 L 1313 670",
    structures: [
      {"type":"stairs","left":351,"top":496,"width":225,"height":63},
      {"type":"elevator","doors":[1198,1243],"top":547,"doorW":38,"doorH":45},
      {"type":"escalator","left":1151,"top":639,"width":162,"height":61},
      {"type":"garden","left":493,"top":624,"width":435,"height":217},
      {"type":"parking","left":341,"top":859,"width":265,"height":121},
      {"type":"entrance","left":1062,"top":855,"width":180,"height":30},
    ],
  },
  2: {
    box: {"x":120,"y":110,"w":1059,"h":862},
    walls: "M 130 127 L 1163 127 M 130 127 L 130 283 M 1163 127 L 1163 283 M 130 283 L 204 283 M 249 283 L 381 283 M 426 283 L 548 283 M 587 283 L 674 283 M 719 283 L 954 283 M 1002 283 L 1070 283 M 1105 283 L 1163 283 M 806 327 L 886 327 M 970 327 L 1050 327 M 806 327 L 806 435 M 1050 327 L 1050 435 M 806 435 L 1050 435 M 313 127 L 313 283 M 490 127 L 490 283 M 651 127 L 651 283 M 831 127 L 831 283 M 1018 127 L 1018 283 M 302 655 L 435 655 M 500 655 L 624 655 M 302 655 L 302 868 M 624 655 L 624 868 M 302 868 L 624 868 M 847 435 L 847 553 M 1005 435 L 1005 553 M 847 553 L 880 553 M 973 553 L 1005 553",
    caption: { x: 649, y: 110 },
    arrivals: {
      elevator: { x: 928, y: 553 },
      stairs: { x: 350, y: 470 },
      escalator: { x: 760, y: 662 },
    },
    passThrough: "M 474 470 L 648 470 L 648 930 L 242 930 L 242 870",
    structures: [
      {"type":"stairs","left":212,"top":423,"width":274,"height":93},
      {"type":"stairs-l","left":215,"top":856,"width":104,"height":104,"armW":52},
      {"type":"elevator","doors":[873,934],"top":447,"doorW":48,"doorH":61},
      {"type":"escalator","left":865,"top":618,"width":205,"height":89},
      {"type":"exit","left":1045,"top":372,"width":134,"height":76},
    ],
  },
  3: {
    box: {"x":160,"y":110,"w":954,"h":864},
    walls: "M 430 149 L 833 149 M 430 149 L 430 471 M 430 503 L 430 642 M 656 149 L 656 328 M 213 328 L 465 328 M 520 328 L 727 328 M 765 328 L 833 328 M 213 328 L 213 642 M 213 642 L 430 642 M 833 149 L 833 606 M 833 645 L 833 945 M 833 287 L 1082 287 M 1082 287 L 1082 710 M 833 710 L 1082 710 M 517 361 L 591 361 M 665 361 L 736 361 M 517 361 L 517 461 M 736 361 L 736 461 M 517 461 L 736 461 M 539 461 L 539 571 M 691 461 L 691 571 M 539 571 L 572 571 M 665 571 L 691 571 M 439 692 L 484 692 M 555 692 L 833 692 M 439 692 L 439 945 M 439 945 L 833 945",
    caption: { x: 636, y: 110 },
    arrivals: {
      elevator: { x: 613, y: 569 },
      stairs: { x: 362, y: 921 },
    },
    passThrough: "M 330 917 L 263 917 L 263 857",
    structures: [
      {"type":"stairs-l","left":238,"top":843,"width":104,"height":103,"armW":49},
      {"type":"elevator","doors":[561,617],"top":470,"doorW":48,"doorH":54},
      {"type":"exit","left":699,"top":464,"width":134,"height":78},
    ],
  },
  4: {
    box: {"x":160,"y":110,"w":954,"h":864},
    walls: "M 423 129 L 817 129 M 423 129 L 423 303 M 817 129 L 817 303 M 423 303 L 585 303 M 656 303 L 817 303 M 833 271 L 1078 271 M 1078 271 L 1078 694 M 833 694 L 1078 694 M 833 271 L 833 616 M 833 655 L 833 694 M 204 336 L 439 336 M 204 336 L 204 642 M 204 642 L 439 642 M 439 336 L 439 474 M 439 510 L 439 642 M 497 371 L 568 371 M 643 371 L 717 371 M 497 371 L 497 481 M 717 371 L 717 481 M 497 481 L 717 481 M 562 481 L 562 571 M 710 481 L 710 571 M 562 571 L 588 571 M 681 571 L 710 571 M 501 603 L 691 603 M 501 603 L 501 700 M 691 603 L 691 623 M 691 684 L 691 700 M 501 700 L 691 700 M 442 708 L 727 708 M 798 708 L 836 708 M 442 708 L 442 955 M 836 708 L 836 955 M 442 955 L 836 955",
    caption: { x: 636, y: 110 },
    arrivals: {
      elevator: { x: 632, y: 585 },
      stairs: { x: 362, y: 914 },
    },
    passThrough: "M 260 846 L 260 666 L 476 666 L 476 587 L 716 587 L 716 654 L 545 654",
    structures: [
      {"type":"stairs","left":519,"top":610,"width":163,"height":84},
      {"type":"stairs-l","left":235,"top":836,"width":103,"height":104,"armW":49},
      {"type":"elevator","doors":[580,636],"top":486,"doorW":48,"doorH":54},
      {"type":"exit","left":699,"top":477,"width":134,"height":78},
    ],
  },
  5: {
    box: {"x":160,"y":110,"w":954,"h":864},
    walls: "M 439 126 L 833 126 M 439 126 L 439 302 M 833 126 L 833 302 M 439 302 L 472 302 M 539 302 L 833 302 M 840 255 L 1088 255 M 1088 255 L 1088 674 M 840 674 L 1088 674 M 840 255 L 840 606 M 840 645 L 840 674 M 216 329 L 433 329 M 216 329 L 216 639 M 216 639 L 433 639 M 433 329 L 433 526 M 433 558 L 433 639 M 507 361 L 581 361 M 656 361 L 727 361 M 507 361 L 507 474 M 727 361 L 727 474 M 507 474 L 727 474 M 568 474 L 568 558 M 720 474 L 720 558 M 568 558 L 594 558 M 694 558 L 720 558 M 501 594 L 691 594 M 501 594 L 501 694 M 691 594 L 691 613 M 691 674 L 691 694 M 501 694 L 691 694 M 452 703 L 733 703 M 801 703 L 843 703 M 452 703 L 452 955 M 843 703 L 843 955 M 452 955 L 843 955",
    caption: { x: 636, y: 110 },
    arrivals: {
      elevator: { x: 646, y: 578 },
      stairs: { x: 493, y: 618 },
    },
    passThrough: "M 664 644 L 540 644",
    structures: [
      {"type":"stairs","left":514,"top":600,"width":164,"height":87},
      {"type":"elevator","doors":[594,650],"top":479,"doorW":48,"doorH":54},
      {"type":"exit","left":706,"top":474,"width":134,"height":78},
    ],
  },
  6: {
    box: {"x":270,"y":110,"w":785,"h":853},
    walls: "M 309 147 L 558 147 M 309 147 L 309 917 M 558 147 L 558 454 M 558 505 L 558 917 M 309 917 L 1026 917 M 637 219 L 722 219 M 801 219 L 886 219 M 637 219 L 637 342 M 886 219 L 886 342 M 637 342 L 886 342 M 702 342 L 702 447 M 862 342 L 862 447 M 702 447 L 739 447 M 828 447 L 862 447 M 627 566 L 842 566 M 627 566 L 627 679 M 842 566 L 842 590 M 842 655 L 842 679 M 627 679 L 842 679 M 558 692 L 920 692 M 992 692 L 1026 692 M 1026 692 L 1026 917",
    caption: { x: 662, y: 110 },
    arrivals: {
      elevator: { x: 785, y: 451 },
      stairs: { x: 578, y: 592 },
    },
    passThrough: "M 819 621 L 668 621",
    structures: [
      {"type":"stairs","left":642,"top":573,"width":191,"height":95},
      {"type":"elevator","doors":[731,790],"top":348,"doorW":49,"doorH":58},
      {"type":"exit","left":869,"top":337,"width":146,"height":84},
    ],
  },
  7: {
    box: {"x":270,"y":110,"w":785,"h":869},
    walls: "M 350 151 L 904 151 M 350 151 L 350 926 M 904 151 L 904 372 M 590 372 L 904 372 M 590 372 L 590 618 M 590 666 L 590 931 M 350 926 L 590 926 M 733 384 L 891 384 M 733 384 L 733 506 M 891 384 L 891 506 M 733 506 L 764 506 M 863 506 L 891 506 M 668 588 L 894 588 M 668 588 L 668 693 M 894 588 L 894 601 M 894 683 L 894 693 M 668 693 L 894 693 M 805 709 L 805 931 M 590 709 L 610 709 M 665 709 L 925 709 M 1000 709 L 1031 709 M 1031 709 L 1031 931 M 590 931 L 1031 931",
    caption: { x: 662, y: 110 },
    arrivals: {
      elevator: { x: 816, y: 499 },
      stairs: { x: 639, y: 623 },
    },
    structures: [
      {"type":"stairs","left":686,"top":595,"width":184,"height":91},
      {"type":"elevator","doors":[761,821],"top":398,"doorW":50,"doorH":56},
      {"type":"exit","left":898,"top":387,"width":144,"height":83},
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
