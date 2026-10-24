import React, { useEffect, useRef, useState } from 'react';
import { liftStatusLabel } from '../lib/i18n';
import EscalatorIcon from './EscalatorIcon';

export default function MapScreen({ 
  offices, 
  selectedOfficeKey, 
  onSelectOffice, 
  currentFloor,
  // Pindot sa hanay ng palapag sa ilalim. Hindi lang ito pagpalit ng
  // palapag — pagtatapos din ito ng anumang rutang nakabukas. Nasa App
  // ang buong kahulugan nito (`handlePickFloor`).
  onPickFloor,
  transportMethod = 'elevator',
  routeStep,
  // Mula sa tab na Elevator / Escalator ng admin. Kapag hindi 'available',
  // may nakasulat na "sira / inaayos" sa mismong elevator o escalator sa mapa.
  elevatorStatus = 'available',
  escalatorStatus = 'available',
  // Kapag may laman, ito ang nakasulat sa pin — ginagamit ito ng
  // step-by-step na gabay sa mga palapag na dinaraanan lang.
  kioskLabel = null,
  // Naka-lock na tanawin: ito ang lumalabas sa telepono ng bisita kapag
  // na-scan ang QR. Larawan lang ito ng palapag at ng ruta — walang
  // mahihila, walang mapapalaki, at walang mapipindot na kwarto. Hindi
  // ito para sa kiosk mismo.
  staticView = false,
  // Lumulutang na laman sa itaas-kaliwa ng mapa — dito nakalagay ang
  // step-by-step na gabay, kung saan agad itong nakikita.
  overlay = null,
  lang = 'EN'
}) {
  const EN = lang === 'EN';
 const pathRef = useRef(null);
  const viewportRef = useRef(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  // Habang hinihila, pini-pinch, o ginugulong — walang transition, para
  // dumikit ang mapa sa daliri. State ito (hindi ref) dahil binabasa sa render.
  const [isGesturing, setIsGesturing] = useState(false);

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 1024;

  // ==============================================================
  // PAGSENTRO NG MAPA — sinusukat, hindi hinuhulaan
  // Dating naka-hardcode ang unang tanaw (pan 20/-120, zoom .65).
  // Tumatama lang iyon sa screen na pinagsukatan; sa ibang laki —
  // TV, mas maliit na monitor — lumilihis ang mapa palabas ng tabi.
  //
  // 1400×1300 ang guhit, at nasa gitna nito ang transform-origin, kaya
  // ang nakikitang gitna ay (700 + pan.x, 650 + pan.y). Pinapantay lang
  // natin iyon sa gitna ng tunay na sukat ng viewport.
  // ==============================================================
  const CANVAS_W = 1400;
  const CANVAS_H = 1300;

  // Hula lang mula sa bintana. Ito ang ginagamit sa unang render — bawal
  // basahin ang ref habang nagre-render, at wala pa naman itong laman
  // doon. Pinapalitan ito ng tunay na sukat pagkatapos ng unang render.
  const estimateViewport = () => {
    if (typeof window === 'undefined') return { w: 1440, h: 1060 };
    return { w: Math.max(320, window.innerWidth - (isMobile ? 0 : 380)), h: window.innerHeight };
  };

  // Tunay na sukat ng node. Tinatawag lang ito sa labas ng render —
  // sa effect at sa pindot ng reset.
  const measureViewport = () => {
    const el = viewportRef.current;
    if (el && el.clientWidth) return { w: el.clientWidth, h: el.clientHeight };
    return estimateViewport();
  };

  // Hindi nakasentro sa 1400×1300 na canvas ang mga guhit — sa 1st floor,
  // nasa kanan ito, kaya malaking blangko ang kaliwa kung ang canvas ang
  // isesentro. Ito ang tunay na sinasakop ng nakikitang bahagi.
  const measureContent = () => {
    const canvas = viewportRef.current?.querySelector('.map-canvas-container');
    if (!canvas) return null;
    const parts = canvas.querySelectorAll('.room-node, .structural-element, .exit-badge');
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    parts.forEach((el) => {
      const w = el.offsetWidth, h = el.offsetHeight;
      if (!w && !h) return;
      minX = Math.min(minX, el.offsetLeft);
      minY = Math.min(minY, el.offsetTop);
      maxX = Math.max(maxX, el.offsetLeft + w);
      maxY = Math.max(maxY, el.offsetTop + h);
    });
    if (!isFinite(minX) || maxX - minX < 50 || maxY - minY < 50) return null;
    return { minX, minY, maxX, maxY, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 };
  };

  // Iisang plano ang 3rd, 4th at 5th Floor, at ito ang pinakamaliit sa
  // gusali — mas makitid at mas mababa kaysa sa 1st, 2nd at 6th. Sa
  // hangganang 0.65, natatapon ang kalahati ng TV sa blangkong grid at
  // maliit ang mababasa mula sa malayo. Dito lang natin pinapayagang
  // lumaki hanggang kasya; ang ibang palapag ay nasa dating laki pa rin.
  //
  const isCompactPlan = currentFloor >= 3 && currentFloor <= 5;

  // ITO ANG PIHIT NG LAKI NG 3rd–5th. Ito ang bahagi ng nakikitang mapa
  // na pinupuno ng plano. Mas maliit = mas maluwag ang paligid.
  //
  // Ang 0.88 na ginagamit ng ibang palapag ay halos dikit na sa itaas at
  // ibaba. Sa malalaking plano, tama iyon. Sa 3rd–5th, taas ang sumisikip
  // muna, kaya sa 0.88 ay dumudulas ang plano sa ilalim ng hanay ng
  // palapag — doon ito nagmukhang sobra.
  //
  // Kung malaki pa rin: babaan (0.58). Kung naliitan naman: taasan (0.66).
  // Mga 0.04 ang isang hakbang na kitang-kita pa rin ngunit hindi biglaan.
  const COMPACT_FILL = 0.62;

  const viewFor = ({ w, h }, box) => {
    // Hindi lalampas sa dating laki sa malalaking screen — doon walang
    // nagbago. Sa masikip lang ito umuurong, para kasya ang buong palapag.
    //
    // Sa naka-lock na tanawin, ang sukat ng screen na lang ang masusunod:
    // walang buton na pampalaki roon, kaya kailangang kasya agad ang buong
    // palapag sa unang tingin — kahit anong telepono ang gamit.
    const base = staticView ? 1.6 : (isMobile ? 0.28 : (isCompactPlan ? 1.6 : 0.65));

    // Walang masukat (unang render, o walang guhit) — ang canvas na ang
    // isesentro. Laging may nailalabas ito, kahit paano.
    if (!box) {
      const fit = Math.min(w / CANVAS_W, h / CANVAS_H) * 0.92;
      return {
        zoom: Math.min(base, Math.max(0.2, fit)),
        pan: { x: w / 2 - CANVAS_W / 2, y: h / 2 - CANVAS_H / 2 },
      };
    }

    const bw = box.maxX - box.minX;
    const bh = box.maxY - box.minY;
    // Luwag sa gilid. Mas maluwag sa 3rd–5th — tingnan ang COMPACT_FILL.
    const fit = Math.min(w / bw, h / bh) * (isCompactPlan ? COMPACT_FILL : 0.88);
    const zoom = Math.min(base, Math.max(0.2, fit));

    // Nasa gitna ng canvas ang transform-origin, kaya ang nakikitang lugar
    // ng puntong (cx, cy) ay: gitna-ng-canvas + (punto − gitna) × zoom + pan.
    // Ipinapantay lang natin iyon sa gitna ng viewport.
    return {
      zoom,
      pan: {
        x: w / 2 - CANVAS_W / 2 - (box.cx - CANVAS_W / 2) * zoom,
        y: h / 2 - CANVAS_H / 2 - (box.cy - CANVAS_H / 2) * zoom,
      },
    };
  };

  const computeDefaultView = () => viewFor(measureViewport(), measureContent());

  const [zoom, setZoom] = useState(() => viewFor(estimateViewport(), null).zoom);
  const [pan, setPan] = useState(() => viewFor(estimateViewport(), null).pan);
  // Lapad ng viewport — dito nakasalalay kung sisikip ang hanay ng palapag.
  const [viewportWidth, setViewportWidth] = useState(() => estimateViewport().w);

  // Isinesentro tuwing nagbabago ang laki ng screen o ang palapag —
  // magkaiba ang sinasakop ng bawat plano. Hindi ito humahawak kapag may
  // hinila o ni-zoom na ang bumibisita; sa reset button lang siya babalik.
  const hasUserMoved = useRef(false);
  // Alin ang palapag na huling naisentro. Dito nakikita kung tunay ngang
  // nagpalit ng palapag, o iba lang ang naging laman ng `offices` —
  // nababago rin ito ng bilang ng hanap at ng sagot ng Supabase.
  const lastCenteredFloor = useRef(currentFloor);
  useEffect(() => {
    // Bagong palapag, bagong tanaw. Sa touch TV, halos laging nahihila o
    // nailalaki ang mapa bago pumili ng susunod na palapag — kung
    // itatago natin ang nakaraang posisyon, ang lumalabas ay gilid o
    // blangkong bahagi ng bagong plano. Kaya kinakalimutan natin ang
    // hinila kapag nagpalit ng palapag, at ang buong palapag agad ang
    // sumasalubong sa bisita.
    if (lastCenteredFloor.current !== currentFloor) {
      lastCenteredFloor.current = currentFloor;
      hasUserMoved.current = false;
    }

    const recenter = () => {
      const size = measureViewport();
      setViewportWidth(size.w);
      if (hasUserMoved.current) return;
      const next = viewFor(size, measureContent());
      setZoom(next.zoom);
      setPan(next.pan);
    };
    // Isang frame ang hinihintay bago sumukat — kakapalit lang ng palapag,
    // at hindi pa naipipinta ang mga bagong kahon.
    const raf = requestAnimationFrame(recenter);
    window.addEventListener('resize', recenter);
    window.addEventListener('orientationchange', recenter);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', recenter);
      window.removeEventListener('orientationchange', recenter);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFloor, offices]);

  useEffect(() => {
    if (pathRef.current && selectedOfficeKey && offices?.[selectedOfficeKey]) {
      const routeLine = pathRef.current;
      routeLine.style.animation = 'none';
      routeLine.style.transition = 'none';
      const totalLength = routeLine.getTotalLength() || 1000;
      routeLine.style.strokeDasharray = totalLength;
      routeLine.style.strokeDashoffset = totalLength;
      routeLine.getBoundingClientRect(); 
      routeLine.style.transition = 'stroke-dashoffset 1.2s ease-in-out';
      routeLine.style.strokeDashoffset = '0';
    }
  }, [selectedOfficeKey, offices]); 

  const handleDragStart = (clientX, clientY) => {
    if (isMobile || staticView) return;
    isDragging.current = true;
    setIsGesturing(true);
    dragStart.current = { x: clientX - pan.x, y: clientY - pan.y };
  };

  const handleDragMove = (clientX, clientY) => {
    if (isMobile || !isDragging.current) return;
    hasUserMoved.current = true;
    setPan({ x: clientX - dragStart.current.x, y: clientY - dragStart.current.y });
  };

  const handleDragEnd = () => { isDragging.current = false; setIsGesturing(false); };

  // ==============================================================
  // PINCH / PAG-ZOOM SA DALIRI AT TRACKPAD
  // Ang puntong nasa ilalim ng mga daliri (o ng cursor) ang nananatili
  // sa lugar habang lumalaki o lumiliit ang mapa — gaya ng Google Maps.
  // Nasa gitna ng canvas ang transform-origin, kaya ang punto p sa canvas
  // ay nasa screen sa: pan + C + (p − C) × zoom, kung saan C ang gitna.
  // ==============================================================
  const MIN_ZOOM = 0.2;
  const MAX_ZOOM = 2.5;
  const clampZoom = (z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));
  const pinch = useRef(null);
  const wheelIdle = useRef(null);
  // Huling zoom/pan, para sa wheel listener na nasa labas ng render.
  const viewRef = useRef({ zoom, pan });
  useEffect(() => { viewRef.current = { zoom, pan }; }, [zoom, pan]);

  const toLocal = (clientX, clientY) => {
    const r = viewportRef.current.getBoundingClientRect();
    return { x: clientX - r.left, y: clientY - r.top };
  };

  // Bagong pan para manatili sa `screenPt` ang punto ng canvas na naroon
  // noong `from` pa ang zoom at pan.
  const panKeeping = (screenPt, from, nextZoom) => {
    const px = CANVAS_W / 2 + (screenPt.x - from.pan.x - CANVAS_W / 2) / from.zoom;
    const py = CANVAS_H / 2 + (screenPt.y - from.pan.y - CANVAS_H / 2) / from.zoom;
    return {
      x: screenPt.x - CANVAS_W / 2 - (px - CANVAS_W / 2) * nextZoom,
      y: screenPt.y - CANVAS_H / 2 - (py - CANVAS_H / 2) * nextZoom,
    };
  };

  const touchInfo = (touches) => {
    const a = toLocal(touches[0].clientX, touches[0].clientY);
    const b = toLocal(touches[1].clientX, touches[1].clientY);
    return {
      dist: Math.hypot(b.x - a.x, b.y - a.y) || 1,
      mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
    };
  };

  const handlePinchStart = (touches) => {
    if (isMobile || staticView) return;
    handleDragEnd();
    const { dist, mid } = touchInfo(touches);
    pinch.current = { dist, mid, zoom, pan };
    setIsGesturing(true);
  };

  const handlePinchMove = (touches) => {
    const start = pinch.current;
    if (!start) return;
    const { dist, mid } = touchInfo(touches);
    const nextZoom = clampZoom(start.zoom * (dist / start.dist));
    // Ang punto sa ilalim ng unang gitna ng mga daliri ay sumusunod sa
    // bagong gitna — kaya puwede ring ihila ang mapa gamit ang dalawang daliri.
    const fromStart = panKeeping(start.mid, start, nextZoom);
    hasUserMoved.current = true;
    setZoom(nextZoom);
    setPan({ x: fromStart.x + (mid.x - start.mid.x), y: fromStart.y + (mid.y - start.mid.y) });
  };

  // Gulong ng mouse at pinch sa trackpad (ctrlKey + wheel sa Chrome).
  // Sa addEventListener ito at hindi sa onWheel: passive ang onWheel ng
  // React, kaya hindi mapipigilan ang pag-zoom ng buong pahina.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el || isMobile || staticView) return;
    const onWheel = (e) => {
      e.preventDefault();
      const from = viewRef.current;
      const factor = Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015));
      const nextZoom = clampZoom(from.zoom * factor);
      if (nextZoom === from.zoom) return;
      const nextPan = panKeeping(toLocal(e.clientX, e.clientY), from, nextZoom);
      viewRef.current = { zoom: nextZoom, pan: nextPan };
      hasUserMoved.current = true;
      setIsGesturing(true);
      clearTimeout(wheelIdle.current);
      wheelIdle.current = setTimeout(() => setIsGesturing(false), 200);
      setZoom(nextZoom);
      setPan(nextPan);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
      clearTimeout(wheelIdle.current);
    };
  }, [isMobile, staticView]);

  // Mga buton na + at −: sa gitna ng nakikitang mapa sila nag-zo-zoom.
  const zoomBy = (delta) => {
    const size = measureViewport();
    const nextZoom = clampZoom(zoom + delta);
    hasUserMoved.current = true;
    setPan(panKeeping({ x: size.w / 2, y: size.h / 2 }, { zoom, pan }, nextZoom));
    setZoom(nextZoom);
  };

  const resetView = () => {
    const next = computeDefaultView();
    setZoom(next.zoom);
    setPan(next.pan);
    hasUserMoved.current = false;
  };

  // Pitong pindutan sa buong pangalan ay humihingi ng mahigit 1050px.
  // Sa mas makitid, pinaliliit sila — kung hindi, naipupulupot ang
  // huling palapag palabas ng gilid at hindi na ito maaabot ng daliri.
  const isTightBar = viewportWidth < 1120;

  const selectedOffice = selectedOfficeKey ? offices?.[selectedOfficeKey] : null;

  // ==============================================================
  // TUNGUHIN NG RUTA (puwedeng palitan ng transport override)
  // Ang "elevator-up" ang ginagamit na key kahit escalator ang pinili,
  // kaya kailangang ilipat ang tunguhin sa mismong escalator — kung
  // hindi, hihilahin ito ng PANUNTUNAN 2 pabalik sa elevator at
  // magsasapawan ang linya sa ibabaw ng escalator.
  // ==============================================================
  let destX = selectedOffice ? selectedOffice.targetX : null;
  let destY = selectedOffice ? selectedOffice.targetY : null;

  // ==============================================================
  // DYNAMIC KIOSK PIN PLACEMENT
  // ==============================================================
  let kioskText = "";
  let kioskStyle = { display: 'none' }; 

  if (currentFloor === 1) {
      // Katapat ng pulang "Map" block sa floor plan — sa loob ng lobby,
      // kaliwa ng escalator. Dito nagsisimula lahat ng ruta sa 1st floor.
      kioskText = EN ? "🔴 YOU ARE HERE (Map Kiosk)" : "🔴 NARITO KAYO (Map Kiosk)";
      kioskStyle = { left: 1045, top: 822, display: 'block' };
  } else if (selectedOfficeKey || routeStep !== 'idle') {
      kioskStyle = { display: 'block' };
      const isClimbing = routeStep === 'climbing-stairs';

      if (transportMethod === 'stairs') {
          kioskText = isClimbing
            ? (EN ? "⬆️ CLIMBING STAIRS..." : "⬆️ UMAAKYAT SA HAGDAN...")
            : (EN ? "🚶‍♂️ ARRIVED VIA STAIRS" : "🚶‍♂️ DUMATING SA HAGDAN");
          if (currentFloor === 2) kioskStyle = { left: 220, top: 420 };
          else if (currentFloor >= 3 && currentFloor <= 5) kioskStyle = { left: 240, top: 720 };
          // Iisa ang plano ng 6th at 7th Floor, kaya iisa rin ang
          // kinatatayuan pagdating — walang hiwalay na sanga ang 7th.
          else if (currentFloor >= 6) kioskStyle = { left: 650, top: 580 };
      }
      else if (transportMethod === 'escalator') {
          kioskText = <><EscalatorIcon className="escalator-icon--inline" /> {EN ? "ARRIVED VIA ESCALATOR" : "DUMATING SA ESCALATOR"}</>;
          if (currentFloor === 2) kioskStyle = { left: 575, top: 670 };
          // Walang naka-mapa na escalator sa 3rd pataas — gamitin ang
          // posisyon ng elevator para hindi mawala sa (0,0) ang pin.
          else if (currentFloor >= 3 && currentFloor <= 5) kioskStyle = { left: 600, top: 410 };
          else if (currentFloor >= 6) kioskStyle = { left: 620, top: 350 };
      }
      else {
          kioskText = EN ? "🛗 ARRIVED VIA ELEVATOR" : "🛗 DUMATING SA ELEVATOR";
          if (currentFloor === 2) kioskStyle = { left: 820, top: 460 };
          else if (currentFloor >= 3 && currentFloor <= 5) kioskStyle = { left: 600, top: 410 };
          else if (currentFloor >= 6) kioskStyle = { left: 620, top: 350 };
      }
  } else {
      kioskStyle = { display: 'none' };
  }

  // Sa palapag na dinaraanan lang ng gabay ay walang tunguhin, kaya mali
  // ang “ARRIVED” sa pin. Pinapakita pa rin ang pin — doon nagpapatuloy
  // paakyat ang hagdan — pero sa tamang pananalita.
  if (kioskLabel && kioskStyle.display !== 'none') {
      kioskText = kioskLabel;
      kioskStyle = { ...kioskStyle, display: 'block' };
  }

  // ==============================================================
  // SMART ROUTER (BULLETPROOF FIX APPLIED)
  // Pinipigilang mag-crash kung walang coordinates ang opisina!
  // ==============================================================
  let finalPathData = (selectedOffice && selectedOffice.pathData) ? String(selectedOffice.pathData) : "";

  if (routeStep === 'climbing-stairs' && transportMethod === 'stairs') {
      const x = kioskStyle.left;
      const y = kioskStyle.top;
      finalPathData = `M ${x} ${y} L ${x} ${y - 20} L ${x + 20} ${y - 20} L ${x + 20} ${y - 40} L ${x + 40} ${y - 40}`;
  }

  // 2nd Floor na dinaraanan lang: PABABA na lang ang hagdang dinatnan
  // (▼, sa itaas-kaliwa) — hindi na iyon tumutuloy paakyat. Ang paakyat
  // sa 3rd ay ang hagdan sa ilalim ng Small Library (↗). Kaya lalakarin
  // muna: palabas sa bukana ng silid (x 380, y 310-380), pababa sa puwang
  // ng pader (x 480-580, y 520), at sa pagitan ng library at escalator
  // (x 450) hanggang sa hagdan.
  if (currentFloor === 2 && transportMethod === 'stairs' && !selectedOffice
      && (routeStep === 'climbing-stairs' || kioskLabel)) {
      // Lumiliko sa y 545 — malayo sa itaas ng escalator (y 590) para hindi
      // magmukhang doon dumadaan ang linya.
      finalPathData = "M 220 420 L 220 350 L 530 350 L 530 545 L 450 545 L 450 850 L 150 850";
  }

  // 5th Floor na dinaraanan lang: walang paakyat sa kaliwang hagdan na
  // dinatnan. Ang paakyat sa 6th ay nasa gitna, paglabas ng elevator. Kaya
  // palabas ng silid ng hagdan (pinto x 340-400), pataas sa x 450, sa
  // pasilyo (y 480) hanggang sa gitna, tapos pababa sa hagdan.
  if (currentFloor === 5 && transportMethod === 'stairs' && !selectedOffice
      && (routeStep === 'climbing-stairs' || kioskLabel)) {
      finalPathData = "M 240 720 L 370 720 L 370 630 L 450 630 L 450 480 L 620 480 L 620 505";
  }

if (currentFloor === 1 && transportMethod === 'escalator') {
      // Nasa KANANG dulo ang sakayan paakyat ng escalator. Kaya pahalang
      // muna sa pasilyo (y 822, nasa pagitan ng elevator at escalator),
      // hanggang x 1225, tapos pababa papasok sa kanang dulo.
      // Inililipat din ang tunguhin sa escalator (hindi elevator).
      finalPathData = "M 1045 822 L 1225 822 L 1225 885";
      destX = 1225;
      destY = 885;
  }

  if (selectedOffice && currentFloor !== 1 && finalPathData !== "") {
      if (currentFloor === 2) {
          if (transportMethod === 'stairs') {
              if (finalPathData.includes("L 680 260")) {
                  finalPathData = finalPathData.replace("M 860 490 L 860 470 L 680 470 L 680 260", "M 220 420 L 220 350 L 420 350 L 420 260 L 680 260");
              } else if (finalPathData.includes("L 530 470")) {
                  finalPathData = finalPathData.replace("M 860 490 L 860 470 L 530 470 L 530 560", "M 220 420 L 220 350 L 530 350 L 530 560");
              }
          } 
          else if (transportMethod === 'escalator') {
              if (finalPathData.includes("L 680 260")) {
                  finalPathData = finalPathData.replace("M 860 490 L 860 470 L 680 470 L 680 260", "M 575 670 L 575 470 L 680 470 L 680 260");
              } else if (selectedOfficeKey === 'library') {
                  // FIX 2: Direktang ruta pakaliwa papuntang Small Library para walang zig-zag
                  finalPathData = "M 575 670 L 250 670 L 250 600";
              }
          }
      } 
      else if (currentFloor >= 3 && currentFloor <= 5) {
          if (transportMethod === 'stairs') {
              if (finalPathData.startsWith("M 620 480 L 450 480")) {
                  finalPathData = finalPathData.replace("M 620 480 L 450 480", "M 240 720 L 370 720 L 370 630 L 450 630 L 450 480");
              } else if (finalPathData.startsWith("M 620 480 L 770 480")) {
                  finalPathData = finalPathData.replace("M 620 480 L 770 480", "M 240 720 L 370 720 L 370 630 L 450 630 L 450 480 L 770 480");
              } else if (finalPathData.startsWith("M 620 480 L 620 520")) {
                  finalPathData = finalPathData.replace("M 620 480 L 620 520", "M 240 720 L 370 720 L 370 630 L 450 630 L 450 480 L 620 480 L 620 520");
              } else if (finalPathData.startsWith("M 620 480 L 745 480")) {
                  // Silid sa ilalim sa 5th Floor (pinto sa kanan ng hagdan).
                  finalPathData = finalPathData.replace("M 620 480 L 745 480", "M 240 720 L 370 720 L 370 630 L 450 630 L 450 480 L 745 480");
              }
          }
      }
      // Pareho ang plano ng 6th at 7th Floor — pati ang pinagmumulan ng
      // bawat ruta — kaya iisang sanga na lang ang humahawak sa dalawa.
      else if (currentFloor >= 6) {
          if (transportMethod === 'stairs') {
              if (finalPathData.startsWith("M 650 480 L 450 480")) finalPathData = finalPathData.replace("M 650 480 L 450 480", "M 650 580 L 650 480 L 450 480");
              else if (finalPathData.startsWith("M 700 480 L 850 480")) finalPathData = finalPathData.replace("M 700 480 L 850 480", "M 650 580 L 650 480 L 700 480 L 850 480");
              else if (finalPathData.startsWith("M 650 480 L 480 480")) finalPathData = finalPathData.replace("M 650 480 L 480 480", "M 650 580 L 650 480 L 480 480");
          }
      }
  }

  // ==============================================================
  // PAGPAPANTAY NG RUTA (2 panuntunan para sa lahat ng palapag)
  // Dating problema: marami sa mga pathData ay nakasulat para sa
  // elevator lang, kaya kapag ibang transport ang pinili, nakalutang
  // ang simula ng linya. Ganoon din, may mga ruta na natatapos sa
  // pintuan pero ang pin ay nasa gitna ng opisina — kaya may puwang.
  // Hindi ito humahawak ng pagpili ng opisina; hugis lang ng linya.
  // ==============================================================
  const readPoints = (d) => {
    const nums = String(d).match(/-?\d+(\.\d+)?/g);
    if (!nums || nums.length < 2) return null;
    return {
      first: { x: +nums[0], y: +nums[1] },
      last:  { x: +nums[nums.length - 2], y: +nums[nums.length - 1] }
    };
  };

  // PANUNTUNAN 1 — Dapat magsimula ang linya mismo sa kinatatayuan ng tao.
  if (currentFloor !== 1 && finalPathData !== "" && kioskStyle.left != null && kioskStyle.top != null) {
      const pts = readPoints(finalPathData);
      if (pts) {
          const kx = kioskStyle.left, ky = kioskStyle.top;
          if (Math.abs(pts.first.x - kx) > 2 || Math.abs(pts.first.y - ky) > 2) {
              // Pahalang muna, saka patayo — sumusunod sa pasilyo.
              finalPathData = `M ${kx} ${ky} L ${pts.first.x} ${ky} ` + finalPathData.replace(/^\s*M/, 'L');
          }
      }
  }

  // PANUNTUNAN 2 — Dapat matapos ang linya mismo sa destination pin.
  if (finalPathData !== "" && destX != null && destY != null) {
      const pts = readPoints(finalPathData);
      if (pts) {
          const tx = destX, ty = destY;
          if (Math.abs(pts.last.x - tx) > 2 || Math.abs(pts.last.y - ty) > 2) {
              finalPathData += ` L ${tx} ${pts.last.y} L ${tx} ${ty}`;
          }
      }
  }

  // PANUNTUNAN 3 — Alisin ang paglampas-at-balik.
  // Maraming pathData ang may waypoint na para lang sa elevator (hal.
  // "L 680 260" sa 2nd Floor). Kapag galing sa hagdan, napipilitang
  // lumampas sa kanan bago bumalik pakaliwa — kaya mukhang paikot-ikot.
  // Kapag tatlong magkasunod na punto ay nasa IISANG guhit (pareho ang
  // x o pareho ang y), tinatanggal ang nasa gitna. Ligtas ito: ang
  // natitirang segment ay nasa loob pa rin ng dinaanan ng orihinal,
  // kaya walang bagong pader na matatawid.
  if (finalPathData !== "") {
      const nums = String(finalPathData).match(/-?\d+(\.\d+)?/g);
      if (nums && nums.length >= 6) {
          let pts = [];
          for (let i = 0; i + 1 < nums.length; i += 2) pts.push({ x: +nums[i], y: +nums[i + 1] });

          let changed = true;
          while (changed && pts.length > 2) {
              changed = false;
              for (let i = 1; i < pts.length - 1; i++) {
                  const a = pts[i - 1], b = pts[i], c = pts[i + 1];
                  const sameRow = a.y === b.y && b.y === c.y;
                  const sameCol = a.x === b.x && b.x === c.x;
                  if (sameRow || sameCol) { pts.splice(i, 1); changed = true; break; }
              }
          }

          finalPathData = pts
            .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
            .join(' ');
      }
  }

  // Patag na 2D transform — hindi translate3d. Tingnan ang paliwanag sa
  // .map-canvas-container sa index.css kung bakit ito ang nagpapatalas.
  const mapTransformStyle = {
    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
    transition: isGesturing ? 'none' : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
  };

  // Ang dalawang pinto ng elevator sa 2nd–7th Floor. Kapag sira o inaayos
  // (tab na Elevator / Escalator sa admin), guhit-guhit ang mga pinto at may
  // nakasulat sa itaas nila — gaya ng elevator sa Ground Floor. Kung wala
  // ito, mukhang gumagana ang elevator sa bawat palapag maliban sa una.
  const renderElevators = (lefts, top, width, height, fontSize) => {
    const out = elevatorStatus !== 'available';
    const centerX = (lefts[0] + lefts[lefts.length - 1] + width) / 2;
    return (
      <>
        {lefts.map((left) => (
          <div
            key={left}
            className={`elev-door${out ? ' is-out' : ''}`}
            style={{ position: 'absolute', width, height, left, top, background: '#9CA3AF', borderRadius: '4px 4px 0 0', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', fontSize, fontWeight: 'bold', color: '#1F2937' }}
          >
            ELEV
          </div>
        ))}
        {out && (
          <span className="elevator-out-tag elevator-out-tag--floating" style={{ left: centerX, top: top - 4 }}>
            ⚠️ {liftStatusLabel(elevatorStatus, lang)}
          </span>
        )}
      </>
    );
  };

  const exitBadgeStyle = (leftPos, topPos) => ({
    position: 'absolute',
    left: leftPos,
    top: topPos,
    background: '#10B981',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '900',
    border: '1px solid #059669',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
    zIndex: 15,
    pointerEvents: 'none',
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap'
  });

  return (
    <main
      ref={viewportRef}
      className="map-viewport"
      style={{ flexGrow: 1, position: 'relative', overflow: 'hidden', cursor: staticView ? 'default' : (isGesturing ? 'grabbing' : 'grab') }}
      onMouseDown={(e) => {
        if(!e.target.closest('.room-node') && !e.target.closest('.floor-selector') && !e.target.closest('.map-legend') && !e.target.closest('.bottom-floor-bar')) {
          handleDragStart(e.clientX, e.clientY);
        }
      }}
      onMouseMove={(e) => handleDragMove(e.clientX, e.clientY)}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
      // Isang daliri = paghila. Dalawang daliri = pinch-zoom ng MAPA
      // (hindi ng buong pahina — pinipigilan iyon ng kioskMode.js at ng
      // touch-action sa index.css). Sa pangatlong daliri pataas, ang
      // unang dalawa lang ang sinusundan.
      onTouchStart={(e) => {
        if (e.touches.length >= 2) {
          if (!pinch.current) handlePinchStart(e.touches);
          return;
        }
        if(!e.target.closest('.room-node') && !e.target.closest('.floor-selector') && !e.target.closest('.map-legend') && !e.target.closest('.bottom-floor-bar')) {
          handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
        }
      }}
      onTouchMove={(e) => {
        if (e.touches.length >= 2) { handlePinchMove(e.touches); return; }
        if (pinch.current) return;
        handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
      }}
      onTouchEnd={(e) => {
        if (pinch.current && e.touches.length < 2) {
          // Tapos na ang pinch. Hindi itinutuloy sa paghila ang natirang
          // daliri — kung hindi, tatalon ang mapa sa lumang posisyon.
          pinch.current = null;
          setIsGesturing(false);
          return;
        }
        if (e.touches.length === 0) handleDragEnd();
      }}
      onTouchCancel={() => { pinch.current = null; handleDragEnd(); }}
    >

      {/* Walang kontrol sa naka-lock na tanawin — larawan lang ito. */}
      {!staticView && (
        <div className="floor-selector" style={{ position: 'absolute', top: 30, right: 30, zIndex: 10, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button className="ui-action-btn zoom-btn" style={{ height: '45px', fontSize: '1.2rem' }} onClick={() => zoomBy(0.15)}>➕</button>
          <button className="ui-action-btn zoom-btn" style={{ height: '45px', fontSize: '1.2rem' }} onClick={() => zoomBy(-0.15)}>➖</button>
          <button className="ui-action-btn reset-view-btn" style={{ height: '45px', fontSize: '1rem' }} onClick={resetView} title={EN ? 'Recenter map' : 'Ibalik sa gitna ang mapa'}>⟲</button>
        </div>
      )}

      {/* Hindi dapat humila ng mapa ang pindot dito — kontrol ito, hindi
          bahagi ng palapag. */}
      {overlay && (
        <div
          className="map-overlay"
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          {overlay}
        </div>
      )}

      {/* Dating `!isMobile` lang ito — at ang `isMobile` ay sukat lang ng
          screen. Ang tablet na nakahiga at ang laptop na pinagbuksan ng
          QR link ay lumalagpas sa 1024, kaya lumalabas doon ang hanay ng
          palapag: ganap na paglilibot sa gusali mula sa isang link na
          isang ruta lang ang ipinangako. Sukat AT tanawin ang sinusuri
          ngayon. */}
      {!isMobile && !staticView && (
        <div className="bottom-floor-bar" style={{
            position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)',
            display: 'flex', gap: isTightBar ? '8px' : '12px', background: 'rgba(15, 23, 42, 0.85)',
            padding: isTightBar ? '10px 14px' : '15px 25px',
            borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
            zIndex: 100, boxShadow: '0 20px 40px rgba(0,0,0,0.3)', overflowX: 'auto',
            maxWidth: 'calc(100% - 40px)', scrollBehavior: 'smooth'
        }}>
          {[1, 2, 3, 4, 5, 6, 7].map(floor => {
            const isActive = currentFloor === floor;
            return (
              <button
                key={floor}
                className={`floor-chip${isActive ? ' active' : ''}`}
                onClick={() => onPickFloor(floor)}
                style={{
                  minWidth: isTightBar ? '86px' : '130px',
                  padding: isTightBar ? '11px 12px' : '14px 20px',
                  borderRadius: '16px',
                  border: isActive ? '2px solid #4F46E5' : '1px solid rgba(255,255,255,0.2)',
                  backgroundColor: isActive ? '#4F46E5' : 'transparent', color: isActive ? '#FFFFFF' : '#E2E8F0',
                  fontWeight: '900', fontSize: isTightBar ? '0.92rem' : '1.1rem',
                  cursor: 'pointer', transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap', boxShadow: isActive ? '0 8px 15px rgba(79, 70, 229, 0.4)' : 'none'
                }}
              >
                {/* Sa masikip, pinaikli — "6F" imbes na "6th Floor". Mas
                    mabuting mabasa lahat kaysa maputol ang huli. Ang
                    unang palapag ay "Ground" lang sa parehong laki. */}
                {floor === 1
                  ? 'Ground'
                  : isTightBar
                    ? `${floor}F`
                    : EN
                      ? `${floor}${floor === 2 ? 'nd' : floor === 3 ? 'rd' : 'th'} Floor`
                      : `Ika-${floor} Palapag`}
              </button>
            )
          })}
        </div>
      )}

      <div className="map-canvas-container" style={mapTransformStyle}>
        <div className="mock-map-graphic floor-transition" key={currentFloor}>
          
          {currentFloor === 1 && (
            <svg width="1400" height="1300" style={{ position: 'absolute', top: 0, left: 0, zIndex: 1, pointerEvents: 'none' }}>
              <g stroke="#9CA3AF" strokeWidth="8" fill="transparent" strokeLinecap="round">
                {/* Panlabas na pader. Puwang sa baba (1100-1230) = bukana/entrance,
                    puwang sa kaliwa (y 480-560) = pinto papuntang canteen. */}
                <path d="M 1100 960 L 330 960 L 330 560 M 330 480 L 330 75 L 1350 75 L 1350 960 L 1230 960" />
                {/* Pader sa ilalim ng Tolentino Hall, may pintuan sa 1000-1060. */}
                <path d="M 330 310 L 1000 310 M 1060 310 L 1350 310" />
                <path d="M 720 575 L 980 575" />

                {/* Gitnang pader (x 1010) — ito ang naghahati sa hanay ng
                    opisina sa kanluran at sa lobby sa silangan. Limang
                    puwang ito: tig-isang PINTO para sa Civil Security
                    (350-390), Barangay Affairs (470-510) at Tourism
                    (595-635) — doon mismo dumaraan ang ruta papasok sa
                    bawat isa — at ang malapad na daanan pakanluran
                    (680-740) na dinaraanan ng lahat ng rutang papuntang
                    Cultural Hall, PIO, hagdan at canteen. */}
                <path d="M 1010 310 L 1010 350 M 1010 390 L 1010 470 M 1010 510 L 1010 595 M 1010 635 L 1010 680 M 1010 740 L 1010 960" />

                {/* Breastfeeding Room — kaliwang pader na may pinto sa
                    425-465, tapos ang ilalim nito hanggang sa silangang
                    pader. */}
                <path d="M 1110 310 L 1110 425 M 1110 465 L 1110 570 L 1350 570" />

                {/* Restroom (CR) — dalawang pahalang na pader lang: ang
                    ilalim ng Breastfeeding Room (570) ang bubong nito, at
                    ito ang sahig (670). BUKAS ang buong kanlurang gilid —
                    iyon ang bukana, at doon dumadaan ang ruta papasok.
                    Walang patayong pader dito: kung may pader sa kaliwa,
                    masikip na silid ang lalabas at hindi na bukana. */}
                <path d="M 1140 670 L 1350 670" />

                {/* Fire exit sa kanang pader. */}
                <path d="M 1310 740 L 1350 740" />
              </g>
            </svg>
          )}
          
          {currentFloor === 2 && (
            <svg width="1400" height="1300" style={{ position: 'absolute', top: 0, left: 0, zIndex: 1, pointerEvents: 'none' }}>
              <g stroke="#9CA3AF" strokeWidth="8" fill="transparent" strokeLinecap="round">
                <rect x="30" y="80" width="1000" height="850" rx="12" />
                <path d="M 30 240 L 80 240 M 120 240 L 190 240 M 230 240 L 310 240 M 350 240 L 430 240 M 470 240 L 665 240 M 705 240 L 915 240 M 955 240 L 1030 240" />
                <path d="M 30 310 L 380 310" />
                <path d="M 380 380 L 380 520" />
                <path d="M 720 490 L 720 280 L 800 280 M 870 280 L 950 280 L 950 490 L 880 490 M 780 490 L 720 490" />
                <path d="M 30 520 L 480 520 M 580 520 L 1030 520" />
              </g>
            </svg>
          )}
          
          {(currentFloor === 3 || currentFloor === 4 || currentFloor === 5) && (
            <svg width="1400" height="1300" style={{ position: 'absolute', top: 0, left: 0, zIndex: 1, pointerEvents: 'none' }}>
              <g stroke="#9CA3AF" strokeWidth="6" fill="rgba(255,255,255,0.03)">
                <path d="M 150 300 L 410 300 L 410 80 L 810 80 L 810 170 L 1080 170 L 1080 580 L 780 580 L 780 740 L 480 740 L 480 870 L 150 870 Z" />
                <path d="M 410 300 L 150 300 L 150 610 L 410 610 L 410 490 M 410 430 L 410 300" />
                <path d="M 410 270 L 410 80 L 810 80 L 810 270 L 740 270 M 680 270 L 570 270 M 510 270 L 410 270" />
                <path d="M 510 300 L 510 460 L 730 460 L 730 300 L 660 300 M 580 300 L 510 300" />
                <path d="M 820 170 L 1080 170 L 1080 580 L 820 580 L 820 420 M 820 360 L 820 170" />
                {/* Sa 5th Floor, ibinaba ang silid sa ilalim (y 600, hindi
                    520) para may luwag ang hagdan paakyat sa 6th sa gitna ng
                    pasilyo. Nasa kanan ng hagdan ang pinto (x 720-770) para
                    hindi tumawid sa hagdan ang ruta papasok. */}
                {currentFloor === 5
                  ? <path d="M 480 600 L 480 740 L 780 740 L 780 600 L 770 600 M 720 600 L 480 600" />
                  : <path d="M 480 520 L 480 740 L 780 740 L 780 520 L 670 520 M 600 520 L 480 520" />}
                <path d="M 150 650 L 150 870 L 480 870 L 480 650 L 400 650 M 340 650 L 150 650" />
              </g>
            </svg>
          )}
          
          {/* Iisang plano ang 6th at 7th Floor — magkapatong na palapag
              sila sa tunay na gusali, kaya pareho ang pader at daanan.
              Ang pangalan lang ng mga kwarto ang naiiba. */}
          {currentFloor >= 6 && (
            <svg width="1400" height="1300" style={{ position: 'absolute', top: 0, left: 0, zIndex: 1, pointerEvents: 'none' }}>
              <g stroke="#9CA3AF" strokeWidth="6" fill="rgba(255,255,255,0.03)">
                <rect x="200" y="100" width="750" height="800" rx="4" fill="none" stroke="#9CA3AF" strokeWidth="6" />

                {currentFloor === 6 ? (
                  <>
                    {/* Silid sa kanluran (Wedding Hall) at ang gitnang core
                        na kinalalagyan ng comfort room at ng elevator. */}
                    <path d="M 450 150 L 250 150 L 250 650 L 450 650 L 450 520 M 450 440 L 450 150" />
                    <path d="M 600 150 L 500 150 L 500 450 L 800 450 L 800 150 L 700 150" />
                  </>
                ) : (
                  <>
                    {/* 7th Floor: walang comfort room dito, at sakop na ng
                        tanggapan ng Mayor ang buong itaas. Sinusundan ng
                        pader ang hugis-L nito. Ang puwang sa gilid
                        (x 450, y 440-520) ay ang PINTO — kapareho ng pinto
                        ng katapat nitong silid sa 6th Floor. */}
                    <path d="M 250 150 L 800 150 L 800 330 L 450 330 L 450 440 M 450 520 L 450 650 L 250 650 L 250 150" />
                    {/* Ang natira sa gitnang core ay ang elevator lang. Ang
                        itaas nito ay pader na ng tanggapan; ang pintuan nito
                        ay nasa ibaba (x 600-720), palabas sa pasilyo. */}
                    <path d="M 500 330 L 500 450 L 600 450 M 720 450 L 800 450 L 800 330" />
                  </>
                )}

                <path d="M 500 650 L 500 850 L 900 850 L 900 650 L 750 650 M 650 650 L 500 650" />
              </g>
            </svg>
          )}

          {currentFloor === 1 && (
            <>
              <div className="structural-element garden-area" style={{ width: '400px', height: '220px', left: '350px', top: '730px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                  <div style={{ fontSize: '2.2rem', display: 'flex', gap: '15px', justifyContent: 'center' }}>🌿 🪴 🌴</div>
                  <div style={{ textAlign: 'center', fontWeight: '800', marginTop: '10px' }}>{EN ? 'Atrium Garden' : 'Hardin ng Atrium'}</div>
                </div>
              </div>
              <div className="structural-element stairs-block" style={{ width: '255px', height: '100px', left: '370px', top: '585px' }}>
                <div className="stair-lines"></div><span className="stair-label">{EN ? 'Stairs' : 'Hagdan'} ▶</span>
              </div>
              {/* Elevator: nasa ibaba ang pinto. May 60px na pasilyo (y 790-850)
                  sa pagitan nito at ng escalator para may daanan ang ruta. */}
              <div className={`structural-element elevator-block${elevatorStatus !== 'available' ? ' is-out' : ''}`} style={{ width: '145px', height: '100px', left: '1110px', top: '690px' }}>
                Elevator
                {elevatorStatus !== 'available' && (
                  <span className="elevator-out-tag">⚠️ {liftStatusLabel(elevatorStatus, lang)}</span>
                )}
                <div className="elevator-doors" style={{ left: '43px' }}></div>
              </div>
              <div className={`structural-element escalator-block${escalatorStatus !== 'available' ? ' is-out' : ''}`} style={{ width: '120px', height: '80px', left: '1120px', top: '845px' }}>
                {escalatorStatus !== 'available' ? (
                  <>Escalator<span className="elevator-out-tag">⚠️ {liftStatusLabel(escalatorStatus, lang)}</span></>
                ) : (
                  <><div className="stair-lines"></div><span className="escalator-label">Escalator ◀</span></>
                )}
              </div>

              {/* Pulang "Map" block — ito ang pisikal na kiosk kung saan
                  nakatayo ang bumibisita. Dito nagsisimula ang lahat ng ruta. */}
              <div className="structural-element kiosk-block" style={{ width: '40px', height: '85px', left: '1025px', top: '780px' }}>
                <span className="kiosk-block-label">MAP</span>
              </div>

              {/* Hagdan papasok galing sa labas (harap ng bukana). */}
              <div className="structural-element entrance-steps" style={{ width: '180px', height: '40px', left: '1080px', top: '1005px' }}></div>

              {/* Parking area — nasa labas ng gusali, kaliwang bahagi. */}
              <div className="structural-element parking-area" style={{ width: '240px', height: '150px', left: '20px', top: '730px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                  <div style={{ fontSize: '2rem' }}>🅿️ 🚗</div>
                  <div style={{ textAlign: 'center', fontWeight: '800', marginTop: '8px' }}>{EN ? 'Parking Area' : 'Paradahan'}</div>
                </div>
              </div>

              {/* Ang dating dalawang `grey-wall` na div dito ay naging
                  bahagi na ng gitnang pader sa SVG sa itaas — doon na
                  kasama ang mga pinto, at iisa na lang ang paraan ng
                  pagguhit ng pader sa buong mapa. */}

              <div className="exit-badge" style={exitBadgeStyle(1262, 730)}>FIRE EXIT</div>
              <div className="exit-badge" style={exitBadgeStyle(1080, 968)}>{EN ? 'EXIT' : 'LABASAN'}</div>
              <div className="exit-badge entrance-badge" style={exitBadgeStyle(EN ? 1150 : 1160, 968)}>{EN ? 'ENTRANCE' : 'PASUKAN'}</div>
            </>
          )}
          
          {currentFloor === 2 && (
            <>
              <div className="structural-element stairs-block" style={{ width: 150, height: 80, left: 150, top: 380, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}><div className="stair-lines"></div><span className="stair-label">{EN ? 'Stairs' : 'Hagdan'} ▼</span></div>
              <div className="structural-element stairs-block" style={{ width: 100, height: 80, left: 100, top: 810, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}><div className="stair-lines"></div><span className="stair-label">{EN ? 'Stairs' : 'Hagdan'} ↗</span></div>
              {escalatorStatus !== 'available' ? (
                <div className="structural-element escalator-block is-out" style={{ width: 150, height: 60, left: 500, top: 590 }}>
                  Escalator<span className="elevator-out-tag">⚠️ {liftStatusLabel(escalatorStatus, lang)}</span>
                </div>
              ) : (
                <div className="structural-element escalator-block" style={{ width: 150, height: 60, left: 500, top: 590, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}><div className="escalator-lines"></div><span className="escalator-label">Escalator ▼</span></div>
              )}
              {renderElevators([800, 850], 460, 40, 30, 10)}
              
              <div className="exit-badge" style={exitBadgeStyle(910, 480)}>FIRE EXIT</div>
            </>
          )}
          
          {(currentFloor >= 3 && currentFloor <= 5) && (
            <>
              <div className="structural-element stairs-block" style={{ width: 80, height: 80, left: 200, top: 680, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}><div className="stair-lines"></div><span className="stair-label">{EN ? 'Stairs' : 'Hagdan'} ↙</span></div>
              {currentFloor === 5 ? (
                // Paakyat sa 6th: sa gitna, paglabas ng elevator — katapat
                // ng hagdan sa gitna ng 6th Floor. Wala nang paakyat sa
                // kaliwa rito; walang hagdan sa kaliwa ng 6th na dadatnan.
                // Nakahanay sa lapad ng elevator (560-680), at may 25px na
                // luwag sa ilalim ng pasilyo (y 480) para sa ruta.
                <div className="structural-element stairs-block" style={{ width: 150, height: 55, left: 545, top: 505 }}><div className="stair-lines"></div><span className="stair-label">{EN ? 'Stairs' : 'Hagdan'} ↗</span></div>
              ) : (
                <div className="structural-element stairs-block" style={{ width: 80, height: 80, left: 280, top: 740, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}><div className="stair-lines"></div><span className="stair-label">{EN ? 'Stairs' : 'Hagdan'} ↗</span></div>
              )}
              {renderElevators([560, 640], 410, 40, 30, 10)}
              {/* Walang escalator sa 3rd hanggang 5th Floor. Hanggang 2nd
                  Floor lang ito sa tunay na gusali — hagdan at elevator
                  na ang paakyat mula rito. Ang ruta na "escalator" ang
                  pinili ay sa elevator na dumadaan sa mga palapag na ito
                  (tingnan ang kioskStyle sa itaas), kaya walang ruta ang
                  nawawalan ng tunguhin. */}

              <div className="exit-badge" style={exitBadgeStyle(700, 445)}>FIRE EXIT</div>
            </>
          )}
          
          {currentFloor >= 6 && (
            <>
              {renderElevators([570, 680], 350, 50, 40, 12)}
              <div className="structural-element stairs-block" style={{ width: 200, height: 60, left: 550, top: 550, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}><div className="stair-lines"></div><span className="stair-label">{EN ? 'Stairs' : 'Hagdan'} ↙ ↗</span></div>

              <div className="exit-badge" style={exitBadgeStyle(765, 435)}>FIRE EXIT</div>
            </>
          )}

          {Object.entries(offices || {}).map(([key, office]) => {
            const isVertical = office.cssClass && office.cssClass.includes('vertical-text-wrapper');
            const activeStyle = selectedOfficeKey === key ? {
              boxShadow: '0 0 30px 10px rgba(255, 255, 255, 0.5)',
              transform: 'scale(1.02)',
              transition: 'all 0.3s ease',
              border: '2px solid white',
              zIndex: 20
            } : { transition: 'all 0.3s ease' };

            return (
              <div
                key={key}
                className={`room-node ${office.cssClass || ''} ${selectedOfficeKey === key ? 'active-room' : ''}`}
                // Sa naka-lock na tanawin, hindi mapipindot ang kwarto:
                // iisang ruta lang ang ipinapakita ng larawang ito — ang
                // pinili sa kiosk — at hindi ito dapat mapalitan ng
                // aksidenteng pindot sa telepono.
                style={{...office.style, ...activeStyle, ...(staticView ? { cursor: 'default' } : null)}}
                onClick={staticView ? undefined : () => onSelectOffice(key)}
              >
                <span className="room-label">
                  {isVertical ? <span className="vertical-text">{office.title}</span> : office.title}
                </span>
              </div>
            );
          })}

          <svg className="path-overlay" width="100%" height="100%">
            <path d={finalPathData} className="route-underlay" />
            <path ref={pathRef} d={finalPathData} className="marching-route-line" />
            {finalPathData && (
              <g key={`runner-${selectedOfficeKey}-${currentFloor}`} className="route-runner-group">
                <circle className="route-runner-halo" r="16">
                  <animateMotion dur="3s" repeatCount="indefinite" path={finalPathData} rotate="auto" />
                </circle>
                <circle className="route-runner" r="7">
                  <animateMotion dur="3s" repeatCount="indefinite" path={finalPathData} rotate="auto" />
                </circle>
              </g>
            )}
          </svg>
          
          <div className="node pin-kiosk" style={{ ...kioskStyle }}>
            <span className="pulse-ring"></span>{kioskText}
          </div>

          {/* Walang lumulutang na "🎯 pangalan" sa dulo ng ruta — natatakpan
              nito ang mismong kwarto. Ang kwarto na ang nagsasabi: lumalaki
              ang pangalan nito kapag napili (.active-room .room-label). */}

        </div>
      </div>
    </main>
  );
}