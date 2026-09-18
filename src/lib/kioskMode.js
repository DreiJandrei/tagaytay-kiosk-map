// ==========================================================
// KIOSK MODE — pananggalang sa screen na walang nagbabantay
// ==========================================================
// Walang keyboard at walang tao sa tabi ng kiosk. Anumang naipong
// aksidente — hawak nang matagal, dalawang daliri sa screen, naligaw na
// pindot sa keyboard — ay nag-iiwan ng screen na mukhang sira, at wala
// namang makakaayos nito hanggang may dumaan.
//
// Ang mga ito lang ang hinahawakan dito. Ang mismong pagbukas nang
// buong screen (walang address bar, walang tab) ay nasa Chrome na
// `--kiosk` na flag — hindi kayang gawin iyon ng isang web page.
//
// Hindi ito tumatakbo kapag naka-QR sa telepono ng bisita: sariling
// browser nila iyon, at hindi natin dapat bawalan ang normal na gamit.

const isTouchKiosk = () => {
  if (typeof window === 'undefined') return false;
  // Ang mga screen na nasa kamay ng bisita ay dumadaan sa QR, at may
  // `route` na sangkap ang link nila. Ang kiosk mismo ay may `key`.
  const params = new URLSearchParams(window.location.search);
  if (params.get('route')) return false;
  return window.innerWidth > 1024;
};

// Hawak nang matagal sa touchscreen = right click sa browser. Lumalabas
// ang menu ng Chrome, at walang makakapagsara niyon sa kiosk.
const blockContextMenu = (e) => e.preventDefault();

// Dalawang daliri o double-tap = zoom. Kapag nangyari iyon, hindi na
// bumabalik sa dating laki ang layout at mukhang sira ang kiosk.
const blockGesture = (e) => e.preventDefault();
const blockCtrlWheel = (e) => { if (e.ctrlKey) e.preventDefault(); };

const blockPinch = (e) => { if (e.touches && e.touches.length > 1) e.preventDefault(); };

// Mga pindot na naglalabas ng dialog o nag-aalis sa pahina. Sa kiosk na
// may nakasaksak na keyboard (o naligaw na presentation remote), ito ang
// pinakamadaling paraan para masira ang display.
const BLOCKED_WITH_CTRL = ['p', 's', 'f', 'o', 'u', 'j', 'h', '+', '-', '=', '0'];

const blockKeys = (e) => {
  const key = (e.key || '').toLowerCase();

  if ((e.ctrlKey || e.metaKey) && BLOCKED_WITH_CTRL.includes(key)) {
    e.preventDefault();
    return;
  }

  // Ang Backspace sa labas ng textbox ay pag-atras sa kasaysayan ng
  // browser sa lumang Chrome — palabas ng kiosk.
  if (key === 'backspace') {
    const el = e.target;
    const typing = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
    if (!typing) e.preventDefault();
  }
};

// ── Hindi pagpapatulog ng screen ──────────────────────────
// Sa mini PC, papatayin ng power settings ang TV pagkaraan ng ilang
// minutong walang gumagalaw — at walang gigising niyon hanggang may
// pumindot. Hinihingi nito sa browser na huwag hayaang matulog.
// Hinihiling itong muli kapag bumalik ang tab: kinukuha ito ng sistema
// tuwing natatabunan ang window.
let wakeLock = null;

const requestWakeLock = async () => {
  if (!('wakeLock' in navigator)) return;
  try {
    wakeLock = await navigator.wakeLock.request('screen');
    wakeLock.addEventListener?.('release', () => { wakeLock = null; });
  } catch {
    // Tinanggihan ng browser (hal. hindi pa naaaksyunan ang pahina, o
    // hindi sinusuportahan). Hindi ito dahilan para masira ang kiosk —
    // ang power setting ng mini PC ang pangalawang linya ng depensa.
    wakeLock = null;
  }
};

const onVisibilityChange = () => {
  if (document.visibilityState === 'visible') requestWakeLock();
};

export function installKioskMode() {
  if (typeof window === 'undefined' || !isTouchKiosk()) return () => {};

  window.addEventListener('contextmenu', blockContextMenu);
  window.addEventListener('gesturestart', blockGesture);
  window.addEventListener('gesturechange', blockGesture);
  window.addEventListener('gestureend', blockGesture);
  window.addEventListener('wheel', blockCtrlWheel, { passive: false });
  window.addEventListener('touchmove', blockPinch, { passive: false });
  window.addEventListener('keydown', blockKeys);
  document.addEventListener('visibilitychange', onVisibilityChange);

  requestWakeLock();
  // Kailangan ng ilang browser ng unang pindot bago payagan ang wake
  // lock. Ito ang pangalawang tangka, sakaling tinanggihan ang una.
  window.addEventListener('pointerdown', requestWakeLock, { once: true });

  return () => {
    window.removeEventListener('contextmenu', blockContextMenu);
    window.removeEventListener('gesturestart', blockGesture);
    window.removeEventListener('gesturechange', blockGesture);
    window.removeEventListener('gestureend', blockGesture);
    window.removeEventListener('wheel', blockCtrlWheel);
    window.removeEventListener('touchmove', blockPinch);
    window.removeEventListener('keydown', blockKeys);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    wakeLock?.release?.();
    wakeLock = null;
  };
}
