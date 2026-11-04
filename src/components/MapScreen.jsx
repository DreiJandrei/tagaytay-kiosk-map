import React, { useEffect, useRef, useState } from 'react';
import { liftStatusLabel } from '../lib/i18n';
import { floorPlans, routeFor, pinFor } from '../lib/coordinateMapping';
import Icon from './Icon';

// "Ground Floor", "2nd Floor", "Ika-3 Palapag"… — sa floor tag sa itaas
// ng mapa.
const floorName = (floor, EN) => {
  if (floor === 1) return 'Ground Floor';
  if (!EN) return `Ika-${floor} Palapag`;
  const suffix = floor === 2 ? 'nd' : floor === 3 ? 'rd' : 'th';
  return `${floor}${suffix} Floor`;
};

// Ang nakasulat sa ibabaw ng plano ng palapag.
const FLOOR_CAPTION = {
  EN: ['GROUND FLOOR', 'SECOND FLOOR', 'THIRD FLOOR', 'FOURTH FLOOR', 'FIFTH FLOOR', 'SIXTH FLOOR', 'SEVENTH FLOOR'],
  TL: ['GROUND FLOOR', 'IKALAWANG PALAPAG', 'IKATLONG PALAPAG', 'IKAAPAT NA PALAPAG', 'IKALIMANG PALAPAG', 'IKAANIM NA PALAPAG', 'IKAPITONG PALAPAG'],
};

// Galaw ng camera sa bawat hakbang ng gabay: lapit sa simula ng ruta, sunod
// sa linya, tapos atras para makita ang buong ruta. Sa huling hakbang, ang
// buong palapag ang tanaw pagdating sa opisina.
const CAMERA_APPROACH_MS = 550;
const CAMERA_MIN_FOLLOW_MS = 1400;
const CAMERA_MAX_FOLLOW_MS = 3200;
const CAMERA_PX_PER_MS = 0.4;
const CAMERA_FOLLOW_ZOOM = 1.3; // gaano kalapit kaysa sa tanaw ng buong ruta
const CAMERA_ARRIVAL_PAUSE_MS = 700; // sandaling hinto sa opisina bago umatras

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
  // Habang nasa step-by-step: hindi mapipindot ang ibang kwarto at palapag.
  // Next, Previous at Done lang ang gumagalaw sa mapa.
  locked = false,
  // Nagbabago sa bawat hakbang ng gabay. Ito ang hudyat ng camera.
  followKey = null,
  // Huling hakbang na ito: buong palapag ang ipapakita pagdating sa opisina.
  fullViewOnArrival = false,
  // Tapos na ang galaw ng camera sa hakbang na ito (ibinabalik ang followKey).
  onCameraDone,
  // Hinawakan ng bisita ang mapa habang may gabay — hihinto ang kusang paglipat.
  onTakeOver,
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
  // Habang sinusundan ng camera ang linya: bawat frame ang galaw, kaya wala
  // ring transition. Hiwalay sa isGesturing para hindi "grabbing" ang cursor.
  const [isFollowing, setIsFollowing] = useState(false);
  const stopCamera = useRef(null);

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 1024;

  const plan = floorPlans[currentFloor];
  const selectedOffice = selectedOfficeKey ? offices?.[selectedOfficeKey] : null;

  // ── Kinatatayuan ng bisita at ang linya ──────────────────────────
  // Ang pagbuo ng ruta ay nasa routeFor (coordinateMapping.js). Dito lang
  // pinipili kung ano ang isusulat sa pin.
  const finalPathData = (selectedOffice || (currentFloor > 1 && kioskLabel))
    ? routeFor({ floor: currentFloor, officeKey: selectedOfficeKey, office: selectedOffice, method: transportMethod })
    : '';

  let kioskText = '';
  let kioskPos = null;
  if (currentFloor === 1) {
    kioskText = EN ? 'YOU ARE HERE' : 'NARITO KAYO';
    kioskPos = plan.kiosk;
  } else if (selectedOfficeKey || routeStep !== 'idle') {
    kioskText = kioskLabel || (
      transportMethod === 'stairs'
        ? (EN ? 'ARRIVED VIA STAIRS' : 'DUMATING SA HAGDAN')
        : transportMethod === 'escalator' && currentFloor === 2
          ? (EN ? 'ARRIVED VIA ESCALATOR' : 'DUMATING SA ESCALATOR')
          : (EN ? 'ARRIVED VIA ELEVATOR' : 'DUMATING SA ELEVATOR')
    );
    kioskPos = pinFor({ floor: currentFloor, method: transportMethod, path: finalPathData, label: kioskText });
  }

  // ==============================================================
  // PAGSENTRO NG MAPA — sinusukat, hindi hinuhulaan
  // 1400×1300 ang guhit, at nasa gitna nito ang transform-origin, kaya ang
  // puntong (x, y) ay nasa screen sa: pan + C + (punto − C) × zoom.
  // ==============================================================
  const CANVAS_W = 1400;
  const CANVAS_H = 1300;
  const MAX_FIT_ZOOM = 1.6;
  const MAX_ZOOM = 2.5;

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
    // Kasama ang pader at ang pangalan ng palapag sa itaas nito.
    const wall = canvas.querySelector('.plan-wall')?.getBBox?.();
    if (wall?.width) {
      minX = Math.min(minX, wall.x); maxX = Math.max(maxX, wall.x + wall.width);
      minY = Math.min(minY, wall.y - 44); maxY = Math.max(maxY, wall.y + wall.height);
    }
    // Sa Ground Floor, lumalampas sa panlabas na pader ang pader ng Canteen.
    const inner = canvas.querySelector('.plan-partition')?.getBBox?.();
    if (inner?.width) {
      minX = Math.min(minX, inner.x); maxX = Math.max(maxX, inner.x + inner.width);
      minY = Math.min(minY, inner.y); maxY = Math.max(maxY, inner.y + inner.height);
    }
    if (!isFinite(minX) || maxX - minX < 50 || maxY - minY < 50) return null;
    return { minX, minY, maxX, maxY, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 };
  };

  // Ang bahagi ng viewport na hindi natatakpan. Sa ilalim, ang hanay ng
  // palapag; sa gabay, ang kard sa kaliwa at ang mga buton ng zoom sa kanan.
  const frameFor = ({ w, h }, left = 16, right = 16) => {
    const bottom = staticView || isMobile ? 16 : 128;
    return { left, top: 16, w: Math.max(200, w - left - right), h: Math.max(200, h - bottom - 16) };
  };

  // Ang zoom at pan na naglalagay sa `box` sa gitna ng `frame`.
  const fitBox = (frame, box, fill = 0.94) => ({
    zoom: Math.min(MAX_FIT_ZOOM, Math.max(0.2, Math.min(frame.w / (box.maxX - box.minX), frame.h / (box.maxY - box.minY)) * fill)),
  });
  const panTo = (frame, x, y, zoom) => ({
    x: frame.left + frame.w / 2 - CANVAS_W / 2 - (x - CANVAS_W / 2) * zoom,
    y: frame.top + frame.h / 2 - CANVAS_H / 2 - (y - CANVAS_H / 2) * zoom,
  });

  const viewFor = (size, box) => {
    // Sa kanan, ang floor tag at ang mga buton ng zoom.
    const frame = frameFor(size, 16, staticView || isMobile ? 16 : 170);
    // Walang masukat (unang render, o walang guhit) — ang canvas na ang
    // isesentro. Laging may nailalabas ito, kahit paano.
    const area = box || { minX: 0, minY: 0, maxX: CANVAS_W, maxY: CANVAS_H };
    const { zoom } = fitBox(frame, area);
    return { zoom, pan: panTo(frame, (area.minX + area.maxX) / 2, (area.minY + area.maxY) / 2, zoom) };
  };

  const computeDefaultView = () => viewFor(measureViewport(), measureContent());

  // Ang default na tanaw ng kasalukuyang palapag at screen. Ito rin ang
  // pinakamalayong zoom out — kapag lumampas pa roon, lumiliit ang plano
  // sa gitna ng blangkong grid at parang nawawala ang mapa.
  const defaultViewRef = useRef(null);

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
      const next = viewFor(size, measureContent());
      defaultViewRef.current = next;
      // Habang may gabay, ang camera ang may hawak ng tanaw.
      if (hasUserMoved.current || followKey) return;
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
  }, [currentFloor, offices, followKey]);

  // ==============================================================
  // CAMERA NG STEP-BY-STEP
  // Ito na lang ang animasyon ng paggabay. Sa bawat hakbang:
  //   1. lumalapit ang camera sa simula ng ruta sa palapag na ito,
  //   2. sinusundan nito ang linya hanggang sa dulo, kasabay ng pagguhit,
  //   3. umaatras nang kaunti para makita ang buong ruta, at doon humihinto.
  //      Sa huling hakbang, humihinto muna ito sa opisina, tapos ang buong
  //      palapag na ang tanaw.
  // Sa palapag na walang lalakarin, sa kinatatayuan lang ito tumutuon.
  // ==============================================================
  useEffect(() => {
    if (!followKey) return undefined;
    const size = measureViewport();
    const card = viewportRef.current?.querySelector('.map-overlay');
    const frame = frameFor(size, card ? card.offsetWidth + 46 : 16, 190);

    const box = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
    const add = (l, t, r, b) => {
      box.minX = Math.min(box.minX, l); box.minY = Math.min(box.minY, t);
      box.maxX = Math.max(box.maxX, r); box.maxY = Math.max(box.maxY, b);
    };
    const path = finalPathData ? pathRef.current : null;
    if (path) {
      const b = path.getBBox();
      add(b.x, b.y, b.x + b.width, b.y + b.height);
    }
    const room = selectedOffice?.style;
    if (room?.width) add(room.left, room.top, room.left + room.width, room.top + room.height);
    if (kioskPos) add(kioskPos.x, kioskPos.y, kioskPos.x, kioskPos.y);
    if (!isFinite(box.minX)) return undefined;
    const PAD = 110;
    box.minX -= PAD; box.minY -= PAD; box.maxX += PAD; box.maxY += PAD;

    const { zoom: restZoom } = fitBox(frame, box, 1);
    const rest = { zoom: restZoom, pan: panTo(frame, (box.minX + box.maxX) / 2, (box.minY + box.maxY) / 2, restZoom) };
    // Ang buong palapag, sa bahaging hindi natatakpan ng kard at ng mga buton.
    const content = fullViewOnArrival ? measureContent() : null;
    const whole = content && (() => {
      const { zoom: wholeZoom } = fitBox(frame, content);
      return { zoom: wholeZoom, pan: panTo(frame, content.cx, content.cy, wholeZoom) };
    })();
    const finalView = whole || rest;
    let raf = 0;
    let timer = 0;
    const settleCamera = () => {
      setIsFollowing(false);
      setZoom(finalView.zoom);
      setPan(finalView.pan);
      onCameraDone?.(followKey);
    };
    const stop = () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
      setIsFollowing(false);
    };
    // Ito ang tinatawag ng paghila, pinch, at zoom: ang bisita na ang may hawak.
    stopCamera.current = () => {
      stop();
      onCameraDone?.(followKey);
      onTakeOver?.();
    };
    const release = () => {
      stop();
      stopCamera.current = null;
    };

    const length = path ? path.getTotalLength() : 0;
    hasUserMoved.current = false;
    if (length < 1) {
      settleCamera();
      return release;
    }

    const followZoom = Math.min(MAX_ZOOM, restZoom * CAMERA_FOLLOW_ZOOM);
    const start = path.getPointAtLength(0);
    const duration = Math.min(CAMERA_MAX_FOLLOW_MS, Math.max(CAMERA_MIN_FOLLOW_MS, length / CAMERA_PX_PER_MS));
    setIsFollowing(false);
    setZoom(followZoom);
    setPan(panTo(frame, start.x, start.y, followZoom));

    timer = setTimeout(() => {
      setIsFollowing(true);
      const began = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - began) / duration);
        const eased = t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2;
        const p = path.getPointAtLength(length * eased);
        setPan(panTo(frame, p.x, p.y, followZoom));
        if (t < 1) raf = requestAnimationFrame(tick);
        else if (whole) timer = setTimeout(settleCamera, CAMERA_ARRIVAL_PAUSE_MS);
        else settleCamera();
      };
      raf = requestAnimationFrame(tick);
    }, CAMERA_APPROACH_MS);

    // Kasabay ng camera ang pagguhit ng linya.
    path.style.animation = 'none';
    path.style.transition = 'none';
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length;
    path.getBoundingClientRect();
    path.style.transition = `stroke-dashoffset ${duration}ms ease-in-out ${CAMERA_APPROACH_MS}ms`;
    path.style.strokeDashoffset = '0';

    return release;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [followKey]);

  // Ang linya sa labas ng gabay (Ground Floor, at ang telepono ng bisita).
  useEffect(() => {
    if (followKey || !pathRef.current || !finalPathData) return;
    const routeLine = pathRef.current;
    routeLine.style.animation = 'none';
    routeLine.style.transition = 'none';
    const totalLength = routeLine.getTotalLength() || 1000;
    routeLine.style.strokeDasharray = totalLength;
    routeLine.style.strokeDashoffset = totalLength;
    routeLine.getBoundingClientRect();
    routeLine.style.transition = 'stroke-dashoffset 1.2s ease-in-out';
    routeLine.style.strokeDashoffset = '0';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalPathData, followKey]);

  const handleDragStart = (clientX, clientY) => {
    if (isMobile || staticView) return;
    // Ang bisita na ang humahawak — hihinto ang camera.
    stopCamera.current?.();
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
  // Hindi lalayo pa sa default na tanaw (tingnan ang defaultViewRef).
  const minZoom = () => defaultViewRef.current?.zoom ?? MIN_ZOOM;
  const clampZoom = (z) => Math.min(MAX_ZOOM, Math.max(minZoom(), z));
  // Pagsagad sa zoom out ay pagbalik sa default na tanaw — buo at nasa
  // gitna ang palapag, kahit saan pa ito nahila. Kung hindi, puwedeng
  // maiwan ang plano sa gilid ng screen.
  const settle = (nextZoom, nextPan) => {
    const home = defaultViewRef.current;
    if (home && nextZoom <= home.zoom + 1e-6) {
      hasUserMoved.current = false;
      return { zoom: home.zoom, pan: home.pan };
    }
    hasUserMoved.current = true;
    return { zoom: nextZoom, pan: nextPan };
  };
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
    stopCamera.current?.();
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
    const next = settle(nextZoom, { x: fromStart.x + (mid.x - start.mid.x), y: fromStart.y + (mid.y - start.mid.y) });
    setZoom(next.zoom);
    setPan(next.pan);
  };

  // Gulong ng mouse at pinch sa trackpad (ctrlKey + wheel sa Chrome).
  // Sa addEventListener ito at hindi sa onWheel: passive ang onWheel ng
  // React, kaya hindi mapipigilan ang pag-zoom ng buong pahina.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el || isMobile || staticView) return;
    const onWheel = (e) => {
      e.preventDefault();
      stopCamera.current?.();
      const from = viewRef.current;
      const factor = Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015));
      const nextZoom = clampZoom(from.zoom * factor);
      if (nextZoom === from.zoom) return;
      const next = settle(nextZoom, panKeeping(toLocal(e.clientX, e.clientY), from, nextZoom));
      viewRef.current = next;
      setIsGesturing(true);
      clearTimeout(wheelIdle.current);
      wheelIdle.current = setTimeout(() => setIsGesturing(false), 200);
      setZoom(next.zoom);
      setPan(next.pan);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
      clearTimeout(wheelIdle.current);
    };
    // Ref lang ang binabasa ng clampZoom at settle, kaya ligtas ang kopya
    // mula sa unang render — hindi kailangang ikabit ulit ang listener.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, staticView]);

  // Mga buton na + at −: sa gitna ng nakikitang mapa sila nag-zo-zoom.
  const zoomBy = (delta) => {
    stopCamera.current?.();
    const size = measureViewport();
    const nextZoom = clampZoom(zoom + delta);
    const next = settle(nextZoom, panKeeping({ x: size.w / 2, y: size.h / 2 }, { zoom, pan }, nextZoom));
    setPan(next.pan);
    setZoom(next.zoom);
  };

  const resetView = () => {
    stopCamera.current?.();
    const next = computeDefaultView();
    defaultViewRef.current = next;
    setZoom(next.zoom);
    setPan(next.pan);
    hasUserMoved.current = false;
  };

  // Pitong pindutan sa buong pangalan ay humihingi ng mahigit 1050px.
  // Sa mas makitid, pinaliliit sila — kung hindi, naipupulupot ang
  // huling palapag palabas ng gilid at hindi na ito maaabot ng daliri.
  const isTightBar = viewportWidth < 1120;

  // Kung aling palapag ang nasa screen. Kapag nagpalit ng palapag ang
  // gabay o ang bisita, hindi laging halata sa plano lang kung nasaan na
  // — ito ang nagsasabi. Lumalabas din sa telepono.
  const floorTag = (
    <div className="map-floor-tag" aria-live="polite">
      <span className="map-floor-tag-label">{EN ? 'You are viewing' : 'Tinitingnan ang'}</span>
      <span className="map-floor-tag-name">{floorName(currentFloor, EN)}</span>
    </div>
  );

  // Patag na 2D transform — hindi translate3d. Tingnan ang paliwanag sa
  // .map-canvas-container sa index.css kung bakit ito ang nagpapatalas.
  const mapTransformStyle = {
    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
    transition: isGesturing || isFollowing ? 'none' : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
  };

  const outTag = (status) => (
    <span className="elevator-out-tag"><Icon name="warning" /> {liftStatusLabel(status, lang)}</span>
  );

  // Hagdan, elevator, escalator, at iba pang hindi tanggapan sa palapag.
  const renderStructure = (s, i) => {
    const box = { left: s.left, top: s.top, width: s.width, height: s.height };
    switch (s.type) {
      case 'stairs':
        return (
          <div key={i} className="structural-element stairs-block" style={box}>
            <div className="stair-lines" /><span className="stair-label">{EN ? 'STAIRS' : 'HAGDAN'}</span>
          </div>
        );
      case 'stairs-l':
        // Hugis-L: makitid sa itaas, buong lapad sa ibaba.
        return (
          <div
            key={i}
            className="structural-element stairs-block plan-stairs-l"
            style={{ ...box, clipPath: `polygon(0 0, ${s.armW}% 0, ${s.armW}% 50%, 100% 50%, 100% 100%, 0 100%)` }}
          >
            <div className="stair-lines" /><span className="stair-label">{EN ? 'STAIRS' : 'HAGDAN'}</span>
          </div>
        );
      case 'escalator': {
        const out = escalatorStatus !== 'available';
        return (
          <div key={i} className={`structural-element escalator-block${out ? ' is-out' : ''}`} style={box}>
            {out ? <>Escalator{outTag(escalatorStatus)}</> : (
              <><div className="escalator-lines" /><span className="escalator-label">ESCALATOR</span></>
            )}
          </div>
        );
      }
      case 'elevator': {
        // Dalawang pinto, at ang pangalan sa ilalim nila. Kapag sira o
        // inaayos, guhit-guhit ang mga pinto at may nakasulat sa itaas.
        const out = elevatorStatus !== 'available';
        const centerX = (s.doors[0] + s.doors[1] + s.doorW) / 2;
        return (
          <React.Fragment key={i}>
            {s.doors.map((left) => (
              <div
                key={left}
                className={`structural-element elev-door${out ? ' is-out' : ''}`}
                style={{ left, top: s.top, width: s.doorW, height: s.doorH }}
              />
            ))}
            <span className="plan-elev-label" style={{ left: centerX, top: s.top + s.doorH + 3 }}>ELEVATOR</span>
            {out && (
              <span className="elevator-out-tag elevator-out-tag--floating" style={{ left: centerX, top: s.top - 4 }}>
                <Icon name="warning" /> {liftStatusLabel(elevatorStatus, lang)}
              </span>
            )}
          </React.Fragment>
        );
      }
      case 'exit':
        return (
          <div key={i} className="exit-badge plan-exit" style={box}>
            <Icon name="exit" /><span>FIRE EXIT</span>
          </div>
        );
      case 'garden':
        return (
          <div key={i} className="structural-element garden-area plan-area" style={box}>
            <Icon name="garden" /><span>{EN ? 'ATRIUM GARDEN' : 'HARDIN NG ATRIUM'}</span>
          </div>
        );
      case 'parking':
        return (
          <div key={i} className="structural-element parking-area plan-area" style={box}>
            <Icon name="parking" /><span>{EN ? 'PARKING AREA' : 'PARADAHAN'}</span>
          </div>
        );
      case 'entrance':
        return (
          <div key={i} className="exit-badge entrance-badge plan-entrance" style={box}>
            {EN ? 'MAIN ENTRANCE' : 'PANGUNAHING PASUKAN'}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main
      ref={viewportRef}
      className={`map-viewport${locked ? ' is-guide-locked' : ''}`}
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

      {/* Walang kontrol sa naka-lock na tanawin — larawan lang ito. Ang
          floor tag lang ang natitira roon, mag-isa sa sulok. */}
      {staticView ? (
        <div className="floor-selector map-floor-solo">{floorTag}</div>
      ) : (
        <div className="floor-selector" style={{ position: 'absolute', top: 30, right: 30, zIndex: 10, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {floorTag}
          {/* Salita, hindi + / − / ⟲: hindi alam ng lahat ng bisita kung
              ano ang ibig sabihin ng mga simbolo. */}
          <button className="ui-action-btn zoom-btn map-ctrl-btn" onClick={() => zoomBy(0.15)}>
            {EN ? 'Zoom in' : 'Palakihin'}
          </button>
          <button className="ui-action-btn zoom-btn map-ctrl-btn" onClick={() => zoomBy(-0.15)}>
            {EN ? 'Zoom out' : 'Paliitin'}
          </button>
          <button className="ui-action-btn reset-view-btn map-ctrl-btn" onClick={resetView} title={EN ? 'Recenter map' : 'Ibalik sa gitna ang mapa'}>
            {EN ? 'Reset' : 'I-reset'}
          </button>
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
                disabled={locked}
                style={{
                  minWidth: isTightBar ? '86px' : '130px',
                  padding: isTightBar ? '11px 12px' : '14px 20px',
                  borderRadius: '16px',
                  border: isActive ? '2px solid #4F46E5' : '1px solid rgba(255,255,255,0.2)',
                  backgroundColor: isActive ? '#4F46E5' : 'transparent', color: isActive ? '#FFFFFF' : '#E2E8F0',
                  fontWeight: '900', fontSize: isTightBar ? '0.92rem' : '1.1rem',
                  cursor: locked ? 'not-allowed' : 'pointer', opacity: locked && !isActive ? 0.4 : 1, transition: 'all 0.2s ease',
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

          <svg width="1400" height="1300" style={{ position: 'absolute', top: 0, left: 0, zIndex: 1, pointerEvents: 'none' }}>
            <g stroke="#9CA3AF" strokeWidth="2.5" fill="transparent" strokeLinecap="round" strokeLinejoin="round">
              {plan.wall
                ? <path className="plan-wall" d={plan.wall} />
                : <rect className="plan-wall" x={plan.box.x} y={plan.box.y} width={plan.box.w} height={plan.box.h} rx="12" />}
              <path className="plan-partition" d={plan.walls} />
            </g>
          </svg>

          <span className="map-floor-caption" style={{ left: plan.caption.x, top: plan.caption.y }}>
            {FLOOR_CAPTION[lang === 'TL' ? 'TL' : 'EN'][currentFloor - 1]}
          </span>

          {plan.structures.map(renderStructure)}

          {Object.entries(offices || {}).map(([key, office]) => {
            const activeStyle = selectedOfficeKey === key ? {
              boxShadow: '0 0 30px 10px rgba(255, 255, 255, 0.5)',
              transform: 'scale(1.02)',
              transition: 'all 0.3s ease',
              border: '2px solid white',
              zIndex: 20
            } : { transition: 'all 0.3s ease' };
            const inert = staticView || locked;

            return (
              <div
                key={key}
                className={`room-node ${office.cssClass || ''} ${selectedOfficeKey === key ? 'active-room' : ''}`}
                // Hindi mapipindot ang kwarto sa dalawang pagkakataon: sa
                // telepono, larawan lang ito ng isang ruta; at habang nasa
                // step-by-step, tinatapos muna ang kasalukuyang ruta.
                style={{...office.style, ...activeStyle, ...(inert ? { cursor: 'default' } : null)}}
                onClick={inert ? undefined : () => onSelectOffice(key)}
              >
                <span className="room-label">{office.mapLabel || office.title}</span>
              </div>
            );
          })}

          <svg className="path-overlay" width="100%" height="100%">
            <path d={finalPathData} className="route-underlay" />
            <path ref={pathRef} d={finalPathData} className="marching-route-line" />
            {finalPathData && (
              <g key={finalPathData} className="route-runner-group">
                <circle className="route-runner-halo" r="16">
                  <animateMotion dur="3s" repeatCount="indefinite" path={finalPathData} rotate="auto" />
                </circle>
                <circle className="route-runner" r="7">
                  <animateMotion dur="3s" repeatCount="indefinite" path={finalPathData} rotate="auto" />
                </circle>
              </g>
            )}
          </svg>

          {kioskPos && (
            <div className="node pin-kiosk" style={{ left: kioskPos.x, top: kioskPos.y }}>
              <span className="pulse-ring"></span>
              {currentFloor === 1 && <span className="pin-dot" />}
              {kioskText}
            </div>
          )}

          {/* Walang lumulutang na pangalan sa dulo ng ruta — natatakpan
              nito ang mismong kwarto. Ang kwarto na ang nagsasabi: lumalaki
              ang pangalan nito kapag napili (.active-room .room-label). */}

        </div>
      </div>
    </main>
  );
}
