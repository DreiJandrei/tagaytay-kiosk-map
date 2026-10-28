import React, { useState, useEffect, useRef, useMemo } from 'react';
import tagaytaySeal from './assets/tagaytay-seal.jpg';
import cctLogo from './assets/cct-logo.jpg';
import scsLogo from './assets/scs-logo.jpg';
import photoFranz from './assets/team/franz.jpg';
import photoNeftali from './assets/team/neftali.jpg';
import photoRicalyn from './assets/team/ricalyn.jpg';
import photoMarlon from './assets/team/marlon.jpg';
import WelcomeScreen from './WelcomeScreen';
import DashboardScreen from './DashboardScreen';
import DirectoryScreen from './DirectoryScreen';
import MapScreen from './components/MapScreen';
import AdminPanel from './admin/AdminPanel';
import AuthKeyboard from './components/AuthKeyboard';
import KioskLockScreen from './components/KioskLockScreen';
import StillThereModal from './components/StillThereModal';
import './index.css';

import { QRCodeSVG } from 'qrcode.react';
import EscalatorIcon from './components/EscalatorIcon';

import { getAllOffices, initializeDatabase, incrementSearchCount, loginAdmin, resetPasswordEmail, logoutAdmin, onAuthChange, changeAdminPassword, getLiftStatuses } from './lib/api';
import { checkKioskSession, onKioskSessionChange } from './lib/kioskDevice';
import {
  ADMIN_GUARD_KEY, MAX_LOGIN_ATTEMPTS, FRESH_GUARD,
  readLoginGuard, writeLoginGuard, guardAfterFailure, isWrongPassword, formatCountdown, isStrongPassword,
} from './lib/loginGuard';
import { coordinateMapping, mergeOfficeData } from './lib/coordinateMapping';
import { defaultOfficeData } from './lib/defaultOfficeData';
import { isRecoveryLink } from './lib/recoveryFlag';
import { buildVisitorLink, readVisitorLink } from './lib/visitorLink';
import { floorName, localizeBadge, localizeHours, officeDescription, liftStatusLabel } from './lib/i18n';

// Ang bumuo ng kiosk, sa ganitong pagkakasunod-sunod sa About.
const TEAM = [
  { name: 'Franz Jandrei Valderama', photo: photoFranz },
  { name: 'Neftali Luya', photo: photoNeftali },
  { name: 'Ricalyn Mereyes', photo: photoRicalyn },
  { name: 'Marlon Panganiban', photo: photoMarlon },
];

// Isang pinagmumulan ng estado ng opisina: kulay, salin, at hugis ng pill.
const statusPresets = {
  'In a Meeting':  { mod: 'meeting', tl: 'May Pulong' },
  'Out of Office': { mod: 'out',     tl: 'Wala sa Opisina' },
  'Closed':        { mod: 'closed',  tl: 'Sarado' },
  'Available':     { mod: 'ok',      tl: 'Maaaring Kausapin' }
};

function StatusPill({ status, lang }) {
  const key = statusPresets[status] ? status : 'Available';
  const preset = statusPresets[key];
  return (
    <span className={`status-pill status-pill--${preset.mod}`}>
      {lang === 'TL' ? preset.tl : key}
    </span>
  );
}

// May laman ba talaga? Hindi lang pagsusuring `if (x)`: ang hanay na
// puro puwang (" ") ay totoo sa mata ng JavaScript, kaya dumaraan iyon
// at nag-iiwan ng blangkong kahon sa gilid. Ganoon din ang naisusulat
// ng admin na aksidenteng nakapindot ng space bar.
const hasText = (v) => typeof v === 'string' && v.trim() !== '';

// ── Ang detalye ng tanggapan sa gilid ────────────────────────────
// Ang blangkong sangkap ay NAWAWALA, hindi nagiging blangkong linya.
// Dati'y laging nakalabas ang oras at ang contact person, kaya kapag
// wala pang nakatala, "🕒 Oras" na walang kasunod ang nakikita ng
// bumibisita — mukhang may nawawalang pangalan, samantalang wala
// namang dapat naroon.
//
// Isang component, hindi dalawang magkatulad na sipi: ganito ito
// lumalabas sa pagpili ng daan AT sa pagdating, at dating magkahiwalay
// silang isinusulat — dalawang lugar na dapat sabay baguhin tuwing may
// bagong hanay.
function OfficeMeta({ office, lang }) {
  return (
    <div className="office-meta">
      {/* Laging nandito ang estado: may takdang halaga ito (Available)
          kahit hindi pa nagagalaw, kaya hindi ito nabibitin. */}
      <p className="meta-row">
        <strong>{lang === 'EN' ? 'Status' : 'Estado'}</strong>
        <StatusPill status={office.status} lang={lang} />
      </p>

      {hasText(office.hours) && (
        <p className="meta-row"><strong>{lang === 'EN' ? 'Hours' : 'Oras'}</strong> {localizeHours(office.hours, lang)}</p>
      )}

      {hasText(office.head) && (
        <p className="meta-row"><strong>{lang === 'EN' ? 'Contact Person' : 'Kausapin'}</strong> {office.head}</p>
      )}

      {hasText(office.phone) && (
        <p className="meta-row"><strong>{lang === 'EN' ? 'Direct Line' : 'Telepono'}</strong>
          {office.phone}{hasText(office.local) ? ` · local ${office.local}` : ''}
        </p>
      )}
    </div>
  );
}

// ── QR papunta sa telepono ───────────────────────────────────────
// May hakbang-hakbang sa ilalim: hindi lahat ng bumibisita sa City Hall
// ay nakagamit na ng QR. Iisang component para sa pagpili ng daan at sa
// pagdating — pareho dapat ang nababasa sa dalawa.
function QrCard({ link, lang }) {
  const EN = lang === 'EN';
  const steps = EN
    ? ['Open the camera on your phone.', 'Point it at this QR code and hold still.', 'Tap the link that pops up — the map opens.']
    : ['Buksan ang camera ng inyong phone.', 'Itutok sa QR code na ito at huwag gumalaw.', 'Pindutin ang link na lalabas — bubukas ang mapa.'];
  return (
    <div className="qr-card">
      <span className="qr-title">{EN ? 'Scan for live mobile map' : 'I-scan para sa live mobile map'}</span>
      <div className="qr-frame">
        <QRCodeSVG value={link} size={130} bgColor={"#ffffff"} fgColor={"#0F172A"} />
      </div>
      <ol className="qr-steps">
        {steps.map((step) => <li key={step}>{step}</li>)}
      </ol>
      <span className="qr-note">{EN ? 'The directions continue on your phone.' : 'Magpapatuloy ang direksyon sa iyong phone.'}</span>
    </div>
  );
}

// ── Admin login: eksaktong 15 pindot sa seal ─────────────────────
// Binibilang ang pindot hanggang huminto nang TAP_PAUSE_MS. Saka lang
// tinitingnan: eksaktong 15 → lalabas ang login. Kulang o sobra → walang
// nangyayari, at walang anumang senyas kung bakit. Ang batang naglalaro
// sa seal ay halos laging lalampas.
//
// Hindi ito ang kandado — ang password at ang Supabase RLS iyon. Ito ay
// para hindi aksidenteng lumabas ang login sa harap ng bisita.
const ADMIN_TAPS = 15;

// Walang pumipindot nang IDLE_MS → "Nandiyan pa ba kayo?". Walang sumagot
// sa loob ng STILL_THERE_MS → balik sa welcome screen.
const IDLE_MS = 45 * 1000;
const STILL_THERE_MS = 45 * 1000;
const TAP_PAUSE_MS = 1500;

// ── Pahinga ng "Forgot password" ─────────────────────────────────
// May limitasyon ang Supabase sa dami ng email kada oras. Kapag naabot,
// hindi nito sinasabi kung kailan puwede ulit — kaya isang oras ang
// tantiya (kada oras ang bilang nila). Kung may eksaktong segundo sa
// mensahe ("only request this after 47 seconds"), iyon ang sinusunod.
const RESET_COOLDOWN_KEY = 'tagaytay-reset-cooldown';
const RESET_LIMIT_WAIT_MS = 60 * 60 * 1000;
// Pagkatapos ng matagumpay na padala — ang default na pagitan ng Supabase.
const RESET_AFTER_SEND_MS = 60 * 1000;

const readResetCooldown = () => {
  try { return Number(localStorage.getItem(RESET_COOLDOWN_KEY)) || 0; } catch { return 0; }
};
const writeResetCooldown = (until) => {
  try { localStorage.setItem(RESET_COOLDOWN_KEY, String(until)); } catch { /* walang storage */ }
};

export default function App() {
  // ── Telepono ba ito ng bisita? ────────────────────────────────
  // Binabasa nang ISANG BESES sa pagbukas pa lang ng pahina, at hindi
  // na muling tinitingnan. Sinasadya ito: kung nakasabit ito sa buhay
  // na URL o sa estado ng app, sapat nang isang pindot sa loob para
  // mawala ang `route` at maging buong kiosk ang tanawin sa telepono.
  const [visitorLink] = useState(() => readVisitorLink());
  const isVisitorView = visitorLink.isVisitor;

  const [liveOfficeDatabase, setLiveOfficeDatabase] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false); 

  // Ang login ng kiosk mismo: 'checking' | 'unlocked' | 'locked' | 'offline'.
  // Hindi kailangan sa telepono ng bisita — ang may-tatak na link ang
  // pampasok doon — kaya hindi na rin ito sinusuri roon.
  const [kioskStatus, setKioskStatus] = useState(() => (visitorLink.isVisitor ? 'locked' : 'checking'));

  // Tatlo lang ang pinapapasok:
  //   • ang device na naka-login bilang kiosk (tingnan ang kioskDevice.js)
  //   • ang password recovery ng admin na galing sa email
  //   • ang BUHAY PANG QR link ng bisita
  //
  // Dating `?key=cct-bsit-kiosk` sa URL ang una. Nakasulat ang key na
  // iyon sa public na repo, kaya kahit sino ay kayang buksan ang buong
  // kiosk — at ang admin login — mula sa sariling laptop.
  const isAuthorized = isRecoveryLink
    || kioskStatus === 'unlocked'
    || (isVisitorView && !visitorLink.expired);
  // Paso na ang link bago pa tumakbo ang unang effect — kaya dito na
  // ito nagsisimula, hindi sa `false`. Kung hihintayin pa ang effect,
  // may isang kisap-mata na sumisilip ang buhay na mapa.
  const [isMobileSessionExpired, setIsMobileSessionExpired] = useState(() => visitorLink.expired);

  const [appState, setAppState] = useState('welcome');
  // Dark ang panimula — ito ang nakikita ng bisita paggising ng kiosk.
  // Mas madaling tingnan sa lobby na may matapang na ilaw sa itaas, at
  // hindi nakakasilaw sa gabi. Nasa header pa rin ang panlipat.
  const [theme, setTheme] = useState('dark');
  const [currentFloor, setCurrentFloor] = useState(1);
  const [time, setTime] = useState("--:-- --");
  
  const [selectedOfficeKey, setSelectedOfficeKey] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showKeyboard, setShowKeyboard] = useState(false);
  // Shift ng keyboard sa paghahanap — isang titik lang ang malaki, gaya ng
  // sa telepono. Hindi naman case-sensitive ang paghahanap; para lang ito
  // kamukha ng karaniwang keyboard.
  const [kbShift, setKbShift] = useState(false);

  // Kusang nagtatago ang keyboard kapag may pinindot sa labas nito — sa
  // mapa, sa header, kahit saan. Hindi kasama ang kahon ng paghahanap at
  // ang listahan ng resulta: doon pa nagta-type o pumipili ang bisita
  // (at kapag nawala ang listahan sa pagdampi pa lang, hindi na aabot ang
  // pindot sa resulta).
  useEffect(() => {
    if (!showKeyboard) return;
    const onPointerDown = (e) => {
      if (e.target.closest?.('.kiosk-virtual-keyboard, .sb-search, .sb-panel')) return;
      setShowKeyboard(false);
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [showKeyboard]);

  const [lang, setLang] = useState('EN');     
  const [textSize, setTextSize] = useState('normal'); 

  const [showAdmin, setShowAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false); 
  // Kailan babalik sa welcome screen kapag walang sumagot sa "Nandiyan
  // pa ba kayo?". null = nakasara ang tanong.
  const [stillThereDeadline, setStillThereDeadline] = useState(null);
  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);

  // Kiosk touchscreen keyboard para sa mga auth modal. Walang pisikal na
  // keyboard ang terminal — kung wala ito, hindi makakapasok ang admin.
  const authModalRef = useRef(null);
  const [recoveryPassword, setRecoveryPassword] = useState('');

  const logoTaps = useRef({ count: 0, timer: null });
  useEffect(() => () => clearTimeout(logoTaps.current.timer), []);
  const [loginGuard, setLoginGuard] = useState(() => readLoginGuard(ADMIN_GUARD_KEY));
  // Orasan ng countdown habang naka-lock. Itinatakda rin sa mga pindot,
  // para sariwa agad ang bilang pagbukas ng login.
  const [guardNow, setGuardNow] = useState(() => Date.now());
  const loginLocked = loginGuard.lockUntil > guardNow;
  const [resetCooldownUntil, setResetCooldownUntil] = useState(readResetCooldown);
  const resetLocked = resetCooldownUntil > guardNow;
  const startResetCooldown = (ms) => {
    const until = Date.now() + ms;
    setResetCooldownUntil(until);
    writeResetCooldown(until);
    setGuardNow(Date.now());
    return until;
  };
  const updateLoginGuard = (next) => { setLoginGuard(next); writeLoginGuard(ADMIN_GUARD_KEY, next); };

  // Countdown ng lock sa admin login at ng pahinga ng reset — tumatakbo
  // lang habang bukas ang login at may binibilang pa.
  useEffect(() => {
    if (!showAdminLogin || !(loginLocked || resetLocked)) return;
    const id = setInterval(() => setGuardNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [showAdminLogin, loginLocked, resetLocked]);
  const [showAbout, setShowAbout] = useState(false); 

  const [routeStep, setRouteStep] = useState('idle');
  const [destinationData, setDestinationData] = useState(null);
  const [transportMethod, setTransportMethod] = useState(() => visitorLink.transport);

  // Itinatakda ng admin (tab na Elevator / Escalator). Kapag hindi
  // 'available' ang elevator, hindi na ito mapipili at sa hagdan
  // nagsisimula ang bawat ruta. Ganoon din ang escalator: hindi na ito
  // mapipili papuntang 2nd Floor. Kasabay ng anunsyo ang paghila — isang minuto.
  const [elevatorStatus, setElevatorStatus] = useState('available');
  const [escalatorStatus, setEscalatorStatus] = useState('available');
  const elevatorOut = elevatorStatus !== 'available';
  const escalatorOut = escalatorStatus !== 'available';
  useEffect(() => {
    let alive = true;
    const load = () => getLiftStatuses().then((s) => {
      if (!alive) return;
      setElevatorStatus(s.elevator);
      setEscalatorStatus(s.escalator);
    });
    load();
    const timer = setInterval(load, 60000);
    return () => { alive = false; clearInterval(timer); };
  }, []);

  // Hindi sapat na naka-disable lang ang buton sa pagpili ng daan. Puwedeng
  // nakasakay pa rin ang escalator/elevator: napili ito bago nasira (isang
  // minuto ang paghila), naiwan mula sa naunang ruta, o galing sa QR link.
  // Kaya dito inililipat ang daan sa gumaganang paraan — at muling
  // iginuguhit ng mapa ang ruta mula roon.
  useEffect(() => {
    let next = null;
    if (transportMethod === 'escalator' && escalatorOut) next = elevatorOut ? 'stairs' : 'elevator';
    else if (transportMethod === 'elevator' && elevatorOut) next = 'stairs';
    if (!next) return;
    setTransportMethod(next);
    // Habang naglalakad pa papunta sa sasakyan, ang tunguhin sa Ground
    // Floor ay ang mismong sasakyan — kaya kailangang ilipat din iyon.
    if (routeStep === 'go-to-transport') setSelectedOfficeKey(next === 'stairs' ? 'stairs-up' : 'elevator-up');
  }, [transportMethod, escalatorOut, elevatorOut, routeStep]);

  // Step-by-step na balikan ng ruta. Kapag bukas ito, ang bumibisita na
  // ang humahawak ng palapag — hindi na ang awtomatikong orasan. Dito
  // nakaimbak ang pinanggalingan para maibalik kapag isinara.
  const [guide, setGuide] = useState(null);

  useEffect(() => {
    const { data: authSubscription } = onAuthChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setAppState('map'); 
        setShowAdminLogin(false); 
        setShowRecoveryModal(true); 
      }
    });
    
    // Ginagamit ang nasalong flag, hindi ang buhay na window.location.hash —
    // baka nabura na ito ng Supabase bago pa tumakbo ang effect na ito.
    // Sinasaklaw din nito ang pagkakataong nakaligtaan ang PASSWORD_RECOVERY
    // event (maaaring nailabas bago pa naka-subscribe sa itaas).
    if (isRecoveryLink) {
      setAppState('map');
      setShowAdminLogin(false);
      setShowRecoveryModal(true);
    }

    return () => {
      if (authSubscription?.subscription) {
        authSubscription.subscription.unsubscribe();
      }
    };
  }, []);

  // ── Naka-login ba ang device na ito bilang kiosk? ────────────────
  // Sinusubaybayan din pagkatapos: kapag binawi ng server ang session
  // (hal. napalitan ang password), babalik ito sa lock screen.
  useEffect(() => {
    if (isVisitorView) return;
    let alive = true;
    let retry;

    const check = async () => {
      const status = await checkKioskSession();
      if (!alive) return;
      setKioskStatus(status);
      // Walang internet sa pagbukas ng mini PC: hindi lock, hintay lang.
      // Nasa storage pa ang session — subukan ulit hanggang makakonekta.
      if (status === 'offline') retry = setTimeout(check, 10000);
    };
    check();

    const { data } = onKioskSessionChange((event, isKiosk) => {
      if (!alive) return;
      if (isKiosk) setKioskStatus('unlocked');
      else if (event === 'SIGNED_OUT') setKioskStatus('locked');
    });

    return () => {
      alive = false;
      clearTimeout(retry);
      data?.subscription?.unsubscribe();
    };
  }, [isVisitorView]);

  // ── Buhay ng sesyon sa telepono ──────────────────────────────
  // Dating nakasabit ito sa `window.innerWidth <= 1024`. Tablet na
  // nakahiga, laptop na pinagbuksan ng link, telepono sa landscape —
  // lahat ng iyon ay lumalagpas sa 1024, kaya WALANG tumatakbong
  // panahon sa kanila: hindi nagpapaso, hindi nagsasara. Wala nang
  // sukat ng screen dito. Ang pagiging link-ng-bisita ang batayan.
  useEffect(() => {
    if (!isVisitorView || visitorLink.expired) return;

    if (sessionStorage.getItem('mobile_session_expired') === 'true') {
      setIsMobileSessionExpired(true);
      return;
    }

    const triggerSelfDestruct = () => {
      setIsMobileSessionExpired(true);
      sessionStorage.setItem('mobile_session_expired', 'true');
    };

    const handleVisibilityChange = () => {
      if (document.hidden) triggerSelfDestruct();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    let idleTimeout;
    const resetIdleTimer = () => {
      clearTimeout(idleTimeout);
      idleTimeout = setTimeout(triggerSelfDestruct, 300000);
    };

    window.addEventListener('mousemove', resetIdleTimer);
    window.addEventListener('touchstart', resetIdleTimer);
    window.addEventListener('click', resetIdleTimer);

    resetIdleTimer();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearTimeout(idleTimeout);
      window.removeEventListener('mousemove', resetIdleTimer);
      window.removeEventListener('touchstart', resetIdleTimer);
      window.removeEventListener('click', resetIdleTimer);
    };
  }, [isVisitorView, visitorLink.expired]);

  useEffect(() => {
    if (!isVisitorView || visitorLink.expired) return;
    if (Object.keys(liveOfficeDatabase).length === 0) return;

    let foundFloor = null;
    Object.entries(liveOfficeDatabase).forEach(([floorNum, offices]) => {
      if (offices[visitorLink.route]) foundFloor = parseInt(floorNum);
    });

    if (foundFloor) {
      // Dumiretso sa ruta. Hindi dumadaan sa welcome screen ang
      // telepono — kiosk screen iyon, at wala itong silbi rito.
      setAppState('map');
      setCurrentFloor(foundFloor);
      setSelectedOfficeKey(visitorLink.route);
      setTransportMethod(visitorLink.transport);
      setRouteStep('arrived');
    }
  }, [isVisitorView, visitorLink, liveOfficeDatabase]);

  const fetchKioskData = async () => {
    try {
      const dbData = await getAllOffices();
      const completeData = mergeOfficeData(coordinateMapping, dbData, defaultOfficeData);
      
      Object.keys(completeData).forEach(floor => {
        Object.keys(completeData[floor]).forEach(key => {
          if (dbData[floor] && dbData[floor][key]) {
             completeData[floor][key].description = dbData[floor][key].description;
          }
        });
      });

      setLiveOfficeDatabase(completeData);
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    const setupKiosk = async () => {
      setIsLoading(true);
      try {
        await initializeDatabase(defaultOfficeData);
        await fetchKioskData();
        setIsLoading(false); 
      } catch (error) {
        const localMergedData = mergeOfficeData(coordinateMapping, defaultOfficeData);
        setLiveOfficeDatabase(localMergedData);
        setIsLoading(false);
      }
    };
    setupKiosk();
  }, []);

  useEffect(() => {
    if (theme === 'light') document.documentElement.classList.add('light-theme');
    else document.documentElement.classList.remove('light-theme');
  }, [theme]);

  useEffect(() => {
    if (textSize === 'large') document.documentElement.style.fontSize = '120%'; 
    else document.documentElement.style.fontSize = '100%';
  }, [textSize]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Pagbabalik sa idle (welcome) screen at paglilinis ng lahat ng iniwan
  // ng bisita. Iisa ito para sa 45-segundong timer at sa "Home" na buton
  // sa header — pareho dapat ang malinis na sasalubong sa susunod.
  const returnToIdle = () => {
    setAppState('welcome');
    setSelectedOfficeKey(null);
    setSearchQuery("");
    setShowKeyboard(false);
    setRouteStep('idle');
    setDestinationData(null);
    // Kasama ang gabay sa nililinis. Kung maiiwan itong bukas nang
    // umalis ang dating bisita, ang gabay pa rin niya ang sasalubong
    // sa susunod na pipindot — kasama ang pangalan ng opisinang
    // hinanap ng iba, sa halip na ang listahan ng palapag.
    setGuide(null);
    setShowAdmin(false);
    setShowAdminLogin(false);
    setAdminEmailInput('');
    setAdminPasswordInput('');
    setShowPassword(false);
    setShowAbout(false);
    setShowRecoveryModal(false);
    setRecoveryPassword('');
    setCurrentFloor(1);
    setStillThereDeadline(null);
    logoutAdmin();
  };

  // Pagkaraan ng IDLE_MS na walang pumipindot, nagtatanong muna ng
  // "Nandiyan pa ba kayo?" (StillThereModal). Kapag walang sumagot sa
  // loob ng STILL_THERE_MS, saka pa lang bumabalik sa welcome screen.
  useEffect(() => {
    if (stillThereDeadline === null) return;
    const timeout = setTimeout(returnToIdle, Math.max(0, stillThereDeadline - Date.now()));
    return () => clearTimeout(timeout);
  }, [stillThereDeadline]);

  useEffect(() => {
    // Habang nakabukas ang tanong, ang mga buton lang niyon ang sagot —
    // hindi binibilang ang basta pagdaan ng kamay sa screen.
    if (stillThereDeadline !== null) return;
    let timeout;
    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => setStillThereDeadline(Date.now() + STILL_THERE_MS), IDLE_MS);
    };

    // ITO ANG PINAKAMALAKING BUTAS NA NAHULI NG EVALUATION.
    //
    // Ang paglilinis na ito ay para sa kiosk: pagkaraan ng 45 segundong
    // walang gumagalaw, ibinabalik sa welcome screen para malinis ang
    // sasalubong sa susunod na bisita. Tumatakbo rin ito dati sa
    // telepono — at doon, ang `setAppState('welcome')` ay naglalabas ng
    // WELCOME SCREEN NG KIOSK sa kamay ng bisita. Isang pindot sa
    // "Start" at nasa buong kiosk na siya: listahan ng opisina,
    // paghahanap, paglipat ng palapag, at ang mga pindot sa seal na
    // nagbubukas ng admin login. Apatnapu't limang segundo lang ang
    // kailangan — kaya "nirefresh ko lang, nakapasok na ako".
    //
    // May sariling panahon ang telepono (ang self-destruct sa itaas).
    // Hindi ito nito.
    if (appState !== 'welcome' && !isVisitorView) {
      window.addEventListener('mousemove', resetTimer);
      window.addEventListener('touchstart', resetTimer);
      window.addEventListener('click', resetTimer);
      resetTimer();
    }
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
      window.removeEventListener('click', resetTimer);
    };
  }, [appState, isVisitorView, stillThereDeadline]);

  // ── Mga pindot na sa kiosk lang ──────────────────────────────
  // Nakatago na ang mga buton na ito sa tanawin ng bisita (tingnan ang
  // render sa ibaba), pero nandito pa rin ang pagsusuri. Dalawa ang
  // dahilan: kung may maidagdag na bagong buton bukas na nakalimutang
  // itago, hindi pa rin ito tatalab; at ang nakatago lang na buton ay
  // nananatiling naroon sa DOM kung saan kayang pindutin.

  const handleLogoTap = () => {
    // Eksaktong 15 pindot sa seal ang nagbubukas ng admin login (tingnan
    // ang ADMIN_TAPS sa itaas). Hindi ito dapat umabot sa telepono ng
    // kahit sinong nakakita ng QR.
    if (isVisitorView) return;
    const taps = logoTaps.current;
    taps.count += 1;
    clearTimeout(taps.timer);
    taps.timer = setTimeout(() => {
      const exact = taps.count === ADMIN_TAPS;
      taps.count = 0;
      if (!exact) return;
      // Binabasa ulit: puwedeng nadagdagan ito ng maling kasalukuyang
      // password sa Admin Panel (pagpapalit ng password).
      setLoginGuard(readLoginGuard(ADMIN_GUARD_KEY));
      setGuardNow(Date.now());
      setShowAdminLogin(true);
    }, TAP_PAUSE_MS);
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault(); 
    // Naka-lock: hindi na ipinapadala sa Supabase.
    if (loginGuard.lockUntil > Date.now()) return;
    setIsLoggingIn(true);
    
    try {
      await loginAdmin(adminEmailInput, adminPasswordInput);
      updateLoginGuard(FRESH_GUARD);
      setShowAdminLogin(false);
      setAdminEmailInput('');
      setAdminPasswordInput('');
      setShowPassword(false);
      setShowAdmin(true); 
    } catch (error) {
      setAdminPasswordInput('');
      if (!isWrongPassword(error)) {
        // Hindi ito binibilang — hindi kasalanan ng nagta-type ang internet.
        alert(lang === 'EN'
          ? 'Could not reach the server. Check the internet connection and try again.'
          : 'Hindi maabot ang server. Tingnan ang koneksyon sa internet at subukan ulit.');
        return;
      }
      updateLoginGuard(guardAfterFailure(loginGuard));
      setGuardNow(Date.now());
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleForgotPassword = async () => {
    // Nagpapahinga pa: hindi na ipinapadala — lalo lang tatagal ang hintay.
    if (resetCooldownUntil > Date.now()) return;
    // Hindi na nakasulat sa code ang email ng admin, kaya ang na-type sa
    // itaas ang pagpapadalhan.
    const email = adminEmailInput.trim();
    if (!email) {
      alert(lang === 'EN'
        ? 'Type the admin email above first, then tap "Forgot password" again.'
        : 'I-type muna ang email ng admin sa itaas, saka pindutin ulit ang "Nakalimutan ang password".');
      return;
    }
    try {
      await resetPasswordEmail(email);
      startResetCooldown(RESET_AFTER_SEND_MS);
      // Pareho ang sagot ng Supabase tama man o mali ang email — hindi
      // nito sinasabi kung may ganoong account.
      alert(lang === 'EN'
        ? 'If that is the admin email, a recovery link is on its way.\n\nCheck the Gmail inbox to set a new password. Nothing arrived? Check the spelling of the email.'
        : 'Kung iyan ang email ng admin, papunta na ang recovery link.\n\nTingnan ang Gmail inbox para maglagay ng bagong password. Walang dumating? Tingnan ang baybay ng email.');
    } catch (error) {
      // Dati ay laging "internet connection" ang sinasabi nito kahit ano pa
      // ang tunay na dahilan — kaya mahirap i-debug. Ipakita ang totoo.
      const code = error?.code || error?.error_code || '';
      const isRateLimited = code === 'over_email_send_rate_limit' || error?.status === 429;

      if (isRateLimited) {
        // Eksaktong segundo kung ibinigay; kung hindi, isang oras.
        const seconds = Number((error?.message || '').match(/after (\d+) seconds?/i)?.[1]);
        const until = startResetCooldown(seconds > 0 ? seconds * 1000 : RESET_LIMIT_WAIT_MS);
        const at = new Date(until).toLocaleTimeString(lang === 'EN' ? 'en-PH' : 'fil-PH', { hour: 'numeric', minute: '2-digit' });
        const wait = formatCountdown(until - Date.now());
        alert(lang === 'EN'
          ? 'Too many reset requests.\n\n' +
            'Supabase limits how many emails can be sent, and that limit has been reached.\n\n' +
            `You can try again in ${wait} (around ${at}). The countdown is shown on the ` +
            '"Forgot password" button.'
          : 'Sobrang dami nang reset request.\n\n' +
            'May limitasyon ang Supabase sa dami ng email na maipapadala, at naabot na ito.\n\n' +
            `Puwede ulit pagkalipas ng ${wait} (bandang ${at}). Makikita ang countdown sa ` +
            '"Forgot password" na buton.'
        );
        return;
      }

      alert(lang === 'EN'
        ? 'Failed to send reset email.\n\n' +
          `Reason: ${error?.message || 'Unknown'}` +
          (error?.status ? ` (HTTP ${error.status})` : '')
        : 'Hindi naipadala ang reset email.\n\n' +
          `Dahilan: ${error?.message || 'Hindi matukoy'}` +
          (error?.status ? ` (HTTP ${error.status})` : '')
      );
    }
  };

  const handleSelectOffice = (key, floor) => {
    // Isang ruta lang ang ipinapakita ng link na na-scan — ang pinili
    // sa kiosk. Hindi paglilibot sa direktoryo ang telepono.
    if (isVisitorView) return;

    const targetOffice = liveOfficeDatabase[floor]?.[key];
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 1024;

    // Bagong opisina ang pinili — paglabas na iyon sa hakbang-hakbang na
    // gabay. Kung maiiwan itong bukas, nakapako sa `backTo` ang ipinapakita
    // sa gilid: ang opisinang PINAGSIMULAN ng gabay, hindi ang bagong
    // pinindot. Kaya nagbabago ang ruta sa mapa pero hindi ang pangalan sa
    // sidebar — at sa opisinang nasa itaas, dalawang panel pa ang sabay na
    // lumalabas (ang gabay at ang bagong pagpili ng daan).
    setGuide(null);

    // Ang panimulang daan: elevator, o hagdan kapag sira ang elevator.
    const defaultTransport = elevatorOut ? 'stairs' : 'elevator';

    if (floor === 1 || isMobile) {
      setCurrentFloor(floor);
      setSelectedOfficeKey(key);
      setRouteStep('arrived');
      setDestinationData(null);
      // Walang sasakyan papunta sa 1st Floor. Kung maiiwan ang daang
      // pinili sa NAKARAANG opisina (hal. escalator), iyon ang naisusulat
      // sa QR at ginagamit ng gabay — kaya ibinabalik sa panimula.
      if (floor === 1) setTransportMethod(defaultTransport);
    } else {
      setDestinationData({ key, floor, ...targetOffice });
      setCurrentFloor(1);
      setSelectedOfficeKey(null);
      // Bumabalik sa elevator ang panimula tuwing bagong paroroonan.
      // Kung hindi, ang daang pinili sa NAKARAANG opisina ang nakasakay
      // pa rin habang wala pang pinipili ang bisita — at iyon ang
      // naisusulat sa QR, kaya ibang daan ang nababasa sa telepono
      // kaysa sa pipiliin niya sa kiosk pagkatapos. Hagdan naman kapag
      // sira o inaayos ang elevator — hindi dapat iyon ang nasa QR.
      setTransportMethod(defaultTransport);
      setRouteStep('choose-transport');
    }
  };

  // ==============================================================
  // PAGPILI NG PALAPAG SA HANAY SA ILALIM NG MAPA
  // Sadyang paglabas ito sa kasalukuyang ruta: ang ibig sabihin ng
  // pindot ay "ipakita mo sa akin ang palapag na ito", hindi "ituloy
  // ang dinadaanan ko". Kaya tinatapos nito ang lahat ng nakabukas.
  //
  // Dating `setCurrentFloor` at `setSelectedOfficeKey` lang ito, at
  // naiiwan ang `routeStep` sa dating halaga. Dalawa ang nasisira:
  //
  //  • Mula sa 'arrived' — naaalis ang napiling opisina, kaya wala nang
  //    maipapakitang detalye; pero 'arrived' pa rin ang hakbang, kaya
  //    nakatago pa rin ang listahan ng opisina. Blangko ang buong
  //    sidebar, at wala nang balikan ang bisita.
  //
  //  • Mula sa 'choose-transport' — naiiwang nakalutang ang pagpili ng
  //    daan sa ibabaw ng ibang palapag. Ang pindot doon ay parang
  //    walang nangyayari, tapos biglang lilipat ang mapa pagkaraan ng
  //    apat na segundo.
  // ==============================================================
  const handlePickFloor = (floor) => {
    if (isVisitorView) return;
    setCurrentFloor(floor);
    setSelectedOfficeKey(null);
    setRouteStep('idle');
    setDestinationData(null);
    setGuide(null);
  };

  useEffect(() => {
    let timeoutId;
    if (routeStep === 'go-to-transport' && destinationData) {
      if (transportMethod === 'elevator') {
        timeoutId = setTimeout(() => {
          setCurrentFloor(destinationData.floor);
          setSelectedOfficeKey(destinationData.key);
          setRouteStep('arrived');
        }, 4000);
      } else if (transportMethod === 'escalator') {
        timeoutId = setTimeout(() => {
          setCurrentFloor(destinationData.floor);
          setSelectedOfficeKey(destinationData.key);
          setRouteStep('arrived');
        }, 4000);
      } else if (transportMethod === 'stairs') {
        timeoutId = setTimeout(() => {
          setRouteStep('climbing-stairs');
          setCurrentFloor(2); 
        }, 4000);
      }
    }
    return () => clearTimeout(timeoutId);
  }, [routeStep, destinationData, transportMethod]);

  useEffect(() => {
    let timeoutId;
    if (routeStep === 'climbing-stairs' && destinationData) {
      if (currentFloor < destinationData.floor) {
        // Mas matagal sa 2nd at 5th Floor: may lalakarin doon papunta sa
        // ibang hagdan (tingnan ang MapScreen), hindi lang tuloy-tuloy na akyat.
        timeoutId = setTimeout(() => {
          setCurrentFloor(prev => prev + 1);
        }, currentFloor === 2 || currentFloor === 5 ? 5000 : 1500);
      } else {
        // `>=`, hindi `===`. Kung sakaling makalampas ang palapag sa
        // paroroonan, walang sasalo sa dating `===` at doon titigil ang
        // pag-akyat habambuhay — mananatiling "papunta pa" ang kiosk at
        // wala nang darating. Ang lampas ay itinuturing nang dating.
        setSelectedOfficeKey(destinationData.key);
        setRouteStep('arrived');
      }
    }
    return () => clearTimeout(timeoutId);
  }, [routeStep, currentFloor, destinationData]);

  const getFlatOffices = () => {
    const flatList = [];
    Object.entries(liveOfficeDatabase).forEach(([floorNum, floorOffices]) => {
      Object.entries(floorOffices).forEach(([dbKey, officeDetails]) => {
        if (dbKey !== 'elevator-up' && dbKey !== 'stairs-up') {
          flatList.push({ key: dbKey, floor: parseInt(floorNum), ...officeDetails });
        }
      });
    });
    return flatList;
  };

  const filteredSearchOptions = searchQuery.trim() === "" ? [] : getFlatOffices().filter(off => 
    (off.title || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const popularSearches = getFlatOffices()
    .sort((a, b) => (b.searchCount || 0) - (a.searchCount || 0))
    .slice(0, 4);

  const handleSearchSelect = async (key, floor) => {
    if (isVisitorView) return;
    handleSelectOffice(key, floor);
    setSearchQuery("");
    setShowKeyboard(false);
    
    await incrementSearchCount(key); 
    
    setLiveOfficeDatabase(prev => {
      if (!prev[floor] || !prev[floor][key]) return prev;
      return {
        ...prev,
        [floor]: {
          ...prev[floor],
          [key]: {
            ...prev[floor][key],
            searchCount: (prev[floor][key].searchCount || 0) + 1
          }
        }
      };
    });
  };

  const handleVirtualKeyPress = (key) => {
    if (key === 'BACKSPACE') setSearchQuery(prev => prev.slice(0, -1));
    else if (key === 'SPACE') setSearchQuery(prev => prev + ' ');
    else if (key === 'CLEAR') setSearchQuery('');
    else if (key === 'SHIFT') setKbShift(v => !v);
    else if (key === 'ENTER') {
      // Enter = piliin ang unang resulta. Walang resulta? Itago na lang.
      const first = filteredSearchOptions[0];
      if (first) handleSearchSelect(first.key, first.floor);
      else setShowKeyboard(false);
    } else {
      const isLetter = /^[A-Z]$/.test(key);
      setSearchQuery(prev => prev + (isLetter && !kbShift ? key.toLowerCase() : key));
      if (isLetter) setKbShift(false);
    }
  };

  const selectedOffice = selectedOfficeKey ? liveOfficeDatabase[currentFloor]?.[selectedOfficeKey] : null;

  // ── Ang laman ng QR ──────────────────────────────────────────
  // Naka-memo, hindi ginagawa tuwing nagre-render: may oras ng
  // paggawa ang link, at kung bawat render ay bagong oras, hindi na
  // magkatugma ang nakaguhit sa screen at ang nasa isip ng app.
  // Nagbabago lang ito kapag nagbago ang tunguhin o ang daan — at
  // doon talaga dapat bagong link.
  const arrivedQrLink = useMemo(
    () => (selectedOfficeKey ? buildVisitorLink(selectedOfficeKey, transportMethod) : ''),
    [selectedOfficeKey, transportMethod]
  );

  // Kung masira ang elevator habang nakabukas na ang pagpili ng daan,
  // elevator pa ang palagay — pero hindi iyon ang dapat dalhin ng QR.
  const destinationQrLink = useMemo(
    () => (destinationData
      ? buildVisitorLink(destinationData.key, elevatorOut && transportMethod === 'elevator' ? 'stairs' : transportMethod)
      : ''),
    [destinationData, transportMethod, elevatorOut]
  );

  // Nasaang palapag ang opisinang nakasulat sa na-scan na link. Dito
  // kinukuwenta, hindi sa effect — para sa mismong render na natapos
  // ang paghahakot ng datos, alam na kung may ipapakita ba o wala.
  // Kung hinintay pa ang effect, may isang frame na dumadaan muna sa
  // welcome screen ng kiosk, at iyon ang ayaw na ayaw nating makita
  // sa telepono.
  const visitorRouteFloor = useMemo(() => {
    if (!isVisitorView) return null;
    const found = Object.entries(liveOfficeDatabase)
      .find(([, offices]) => offices && offices[visitorLink.route]);
    return found ? parseInt(found[0]) : null;
  }, [isVisitorView, visitorLink.route, liveOfficeDatabase]);

  // ==============================================================
  // STEP-BY-STEP NA GABAY
  // Isa-isang palapag mula sa kiosk hanggang sa pinto ng opisina.
  // Hindi ito bagong ruta — ang mismong linyang ginuguhit ng mapa ang
  // ipinapakita sa bawat hakbang, kaya walang pagkakaiba sa totoong
  // dadaanan. Ang bago lang ay ang bumibisita na ang humahawak ng
  // pihit, kaya kaya na niyang balikan ang nalampasan.
  // ==============================================================
  const buildGuideSteps = (officeKey, office, floor, method) => {
    const EN = lang === 'EN';
    const ride = method === 'elevator' ? 'Elevator' : method === 'escalator' ? 'Escalator' : 'Stairs';
    const rideTL = ride === 'Stairs' ? 'Hagdan' : ride;
    // Maikling utos ang pamagat ng bawat hakbang — "Start here", "Take
    // the stairs", "Arrive at …" — para mabasa agad mula sa malayo. Nasa
    // `body` ang mas mahabang paliwanag.
    const steps = [{
      floor: 1,
      officeKey: method === 'stairs' ? 'stairs-up' : 'elevator-up',
      title: EN ? 'Start here' : 'Dito magsimula',
      body: EN
        ? `You are at the map kiosk on the Ground Floor. Follow the line to the ${ride}.`
        : `Nasa map kiosk po kayo sa Ground Floor. Sundan ang linya papunta sa ${rideTL}.`,
    }];

    const arrive = {
      title: EN ? `Arrive at ${office.title}` : `Dumating sa ${office.title}`,
    };

    if (method === 'stairs') {
      // Isang hakbang bawat palapag na aakyatin — ito ang talagang
      // dinaraanan ng naglalakad.
      for (let f = 2; f <= floor; f++) {
        const isLast = f === floor;
        steps.push(isLast ? {
          floor: f,
          officeKey,
          ...arrive,
          body: EN
            ? `You are on Floor ${f}. Follow the line to the door.`
            : `Nasa Palapag ${f} na po kayo. Sundan ang linya papunta sa pinto.`,
        } : {
          floor: f,
          officeKey: null,
          title: EN ? 'Take the stairs up' : 'Umakyat sa hagdan',
          // Sa 2nd at 5th Floor, hindi tumutuloy paakyat ang hagdang
          // dinatnan — nasa ilalim ng Small Library (2nd) o sa gitna,
          // paglabas ng elevator (5th), ang paakyat.
          body: f === 2
            ? (EN
              ? 'You arrive on Floor 2. These stairs only go down from here — follow the line to the other stairs below the Small Library to keep climbing.'
              : 'Darating po kayo sa Palapag 2. Pababa na lang ang hagdang ito — sundan ang linya papunta sa kabilang hagdan sa ilalim ng Small Library para tumuloy paakyat.')
            : f === 5
            ? (EN
              ? 'You arrive on Floor 5. The stairs up to Floor 6 are in the middle, right outside the elevator — follow the line there.'
              : 'Darating po kayo sa Palapag 5. Nasa gitna ang hagdan paakyat sa Palapag 6, paglabas mismo ng elevator — sundan ang linya papunta roon.')
            : (EN
              ? `You pass Floor ${f}. Keep climbing — the stairs continue up from the same spot.`
              : `Dadaanan po ninyo ang Palapag ${f}. Tuloy lang paakyat — dito rin nagpapatuloy ang hagdan.`),
        });
      }
    } else {
      steps.push({
        floor,
        officeKey,
        ...arrive,
        body: EN
          ? `Take the ${ride} to Floor ${floor}, then follow the line to the door.`
          : `Sumakay sa ${rideTL} hanggang Palapag ${floor}, tapos sundan ang linya papunta sa pinto.`,
      });
    }

    return steps;
  };

  const openGuide = () => {
    if (isVisitorView) return;
    if (!selectedOfficeKey || !selectedOffice || currentFloor <= 1) return;
    const steps = buildGuideSteps(selectedOfficeKey, selectedOffice, currentFloor, transportMethod);
    // Nagsisimula sa "Start here" sa Ground Floor, tapos Next nang Next
    // hanggang sa pinto — ganito binabasa ang direksyon.
    setGuide({
      steps,
      index: 0,
      backTo: { floor: currentFloor, officeKey: selectedOfficeKey },
    });
    setCurrentFloor(steps[0].floor);
    setSelectedOfficeKey(steps[0].officeKey);
  };

  const goToGuideStep = (index) => {
    if (!guide) return;
    const step = guide.steps[index];
    if (!step) return;
    setGuide({ ...guide, index });
    setCurrentFloor(step.floor);
    setSelectedOfficeKey(step.officeKey);
  };

  const closeGuide = () => {
    if (!guide) return;
    setCurrentFloor(guide.backTo.floor);
    setSelectedOfficeKey(guide.backTo.officeKey);
    setGuide(null);
  };

  // Ang pinanggalingang tunguhin ng gabay. Hindi ito ang kasalukuyang
  // napipili: nagiging blangko iyon sa mga palapag na dinaraanan lang,
  // at nagiging "Stairs to Upper Floors" sa unang hakbang.
  const guideDestination = guide
    ? liveOfficeDatabase[guide.backTo.floor]?.[guide.backTo.officeKey]
    : null;

  // Sa palapag na dinaraanan lang, walang tunguhin — kaya mali ang
  // “ARRIVED” na nakasulat sa pin. Ito ang tamang sasabihin doon.
  const guideStep = guide ? guide.steps[guide.index] : null;
  const guideKioskLabel = guideStep && guideStep.officeKey === null
    ? (lang === 'EN'
      ? `PASSING FLOOR ${guideStep.floor}`
      : `DINARAANAN — PALAPAG ${guideStep.floor}`)
    : null;

  // Mga opisinang ipinapakita sa listahan ng kasalukuyang palapag
  const floorOfficeList = Object.entries(liveOfficeDatabase[currentFloor] || {})
    .filter(([key]) => key !== 'elevator-up' && key !== 'stairs-up');

  if (isMobileSessionExpired) {
    return (
      <div className="sys sys--alert">
        <h2 className="sys-title">Session Expired</h2>
        <p className="sys-text">
          For security purposes, this mobile map link is no longer valid. A scanned link works
          only for a short while, and it closes as soon as the app is minimized or the screen is
          turned off.
        </p>
        <p className="sys-text">
          Please return to the City Government of Tagaytay Directory Kiosk and scan the QR code again.
        </p>
        <span className="sys-note">Secure mobile session</span>
      </div>
    );
  }

  if (!isAuthorized) {
    if (kioskStatus === 'locked') {
      return <KioskLockScreen lang={lang} onUnlocked={() => setKioskStatus('unlocked')} />;
    }
    // Sinusuri pa, o naghihintay ng internet.
    return (
      <div className="sys">
        <img src={tagaytaySeal} alt="Tagaytay City Seal" className="k-modal-seal" style={{ width: '96px', height: '96px', margin: '0 0 24px 0' }} />
        <h2 className="sys-title">City Government of Tagaytay</h2>
        <p className="sys-text">
          {kioskStatus === 'offline'
            ? 'Waiting for the internet connection…'
            : 'Starting the kiosk…'}
        </p>
        <span className="sys-loader" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="sys">
        <img src={tagaytaySeal} alt="Tagaytay City Seal" className="k-modal-seal" style={{ width: '96px', height: '96px', margin: '0 0 24px 0' }} />
        <h2 className="sys-title">City Government of Tagaytay</h2>
        <p className="sys-text">Initializing kiosk systems…</p>
        <span className="sys-loader" />
      </div>
    );
  }

  // Natanggal na sa direktoryo ang opisinang nakasulat sa link, o mali
  // ang nakasulat. Hindi welcome screen ang sagot dito.
  if (isVisitorView && visitorRouteFloor === null) {
    return (
      <div className="sys sys--alert">
        <h2 className="sys-title">Route Unavailable</h2>
        <p className="sys-text">
          This office is no longer listed in the directory, so the saved route cannot be shown.
        </p>
        <p className="sys-text">
          Please return to the City Government of Tagaytay Directory Kiosk and scan the QR code again.
        </p>
        <span className="sys-note">Secure mobile session</span>
      </div>
    );
  }

  // Sa telepono, hindi dapat lumitaw ang welcome screen kahit isang
  // kisap-mata: pampasok iyon sa kiosk, at ang "Start" nito ay
  // nagbubukas ng buong direktoryo. Ito ang dinaanan ng nag-evaluate —
  // pagkaraan ng 45 segundong nakatunganga ang telepono, bumabalik ito
  // sa welcome, at isang pindot na lang ang kiosk. (Tingnan din ang
  // pagsusuri ng oras sa itaas, na hindi na tumatakbo sa telepono.)
  if (appState === 'welcome' && !isVisitorView) {
    return <WelcomeScreen onStart={() => setAppState('map')} />;
  }

  const isDarkMode = theme === 'dark';
  const isLarge = textSize === 'large';

  const dateLabel = new Date().toLocaleDateString(lang === 'EN' ? 'en-PH' : 'fil-PH', { weekday: 'short', month: 'short', day: 'numeric' });

  // Ayos ng karaniwang keyboard: Backspace sa dulo ng hanay ng numero,
  // Enter sa dulo ng A–L, Shift sa simula ng Z–M.
  const keyboardRows = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'BACKSPACE'],
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'ENTER'],
    ['SHIFT', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '-'],
    ['CLEAR', 'SPACE']
  ];
  const keyLabel = (key) => {
    const EN = lang === 'EN';
    switch (key) {
      case 'BACKSPACE': return EN ? '⌫ Backspace' : '⌫ Bura';
      case 'ENTER': return EN ? '⏎ Enter' : '⏎ Enter';
      case 'SHIFT': return '⇧ Shift';
      case 'SPACE': return EN ? 'Space' : 'Espasyo';
      case 'CLEAR': return EN ? 'Clear' : 'Linis';
      default: return /^[A-Z]$/.test(key) && !kbShift ? key.toLowerCase() : key;
    }
  };

  // ── STEP-BY-STEP SA IBABAW NG MAPA ───────────────────────────
  // Nasa itaas-kaliwa ng mapa, lumulutang gaya ng zoom. Dati'y maliit
  // na pindutan ito sa sidebar at makitid na hanay sa ilalim ng zoom —
  // hindi napapansin, at hiwalay pa ang numero sa sinasabi ng hakbang.
  // Ngayon, iisang kard: nasaang hakbang, ano ang gagawin, at
  // Previous/Next.
  //
  // Sa kiosk lang, at sa mga opisinang nasa itaas lang — sa ground
  // floor, walang palapag na dadaanan.
  const canOpenGuide = !isVisitorView && !guide && selectedOffice && currentFloor > 1
    && (routeStep === 'arrived'
      || (routeStep === 'idle' && selectedOfficeKey && selectedOfficeKey !== 'elevator-up' && selectedOfficeKey !== 'stairs-up'));
  const isLastGuideStep = guide && guide.index === guide.steps.length - 1;

  const guideOverlay = guide ? (
    <div className="map-guide">
      <div className="map-guide-head">
        <span className="map-guide-cap">
          {lang === 'EN'
            ? `Step ${guide.index + 1} of ${guide.steps.length}`
            : `Hakbang ${guide.index + 1} ng ${guide.steps.length}`}
        </span>
        <button className="map-guide-x" onClick={closeGuide} title={lang === 'EN' ? 'Close' : 'Isara'}>✕</button>
      </div>

      {/* Isang pindutan bawat palapag na dadaanan. Mapipindot ang
          kahit alin — pagbalik sa isang palapag nang hindi paulit-ulit
          ang pag-atras. */}
      <div className="map-guide-steps">
        {guide.steps.map((s, i) => (
          <button
            key={`${s.floor}-${i}`}
            className={`map-guide-step${i === guide.index ? ' is-now' : ''}${i < guide.index ? ' is-done' : ''}`}
            onClick={() => goToGuideStep(i)}
            title={s.title}
          >
            {s.floor === 1 ? 'GF' : s.floor}
          </button>
        ))}
      </div>

      <div className="map-guide-now" key={guide.index}>
        <div className="map-guide-text">
          <span className="map-guide-floor">{floorName(guideStep.floor, lang)}</span>
          <h3>{guideStep.title}</h3>
          <p>{guideStep.body}</p>
        </div>
      </div>

      <div className="map-guide-nav">
        <button
          className="map-guide-btn"
          disabled={guide.index === 0}
          onClick={() => goToGuideStep(guide.index - 1)}
        >
          ◀ {lang === 'EN' ? 'Previous' : 'Bumalik'}
        </button>
        {isLastGuideStep ? (
          <button className="map-guide-btn is-primary" onClick={closeGuide}>
            ✓ {lang === 'EN' ? 'Done' : 'Tapos na'}
          </button>
        ) : (
          <button className="map-guide-btn is-primary" onClick={() => goToGuideStep(guide.index + 1)}>
            {lang === 'EN' ? 'Next' : 'Susunod'} ▶
          </button>
        )}
      </div>
    </div>
  ) : canOpenGuide ? (
    <button className="map-guide-open" onClick={openGuide}>
      <span className="map-guide-open-text">
        <strong>{lang === 'EN' ? 'Step-by-step directions' : 'Hakbang-hakbang na direksyon'}</strong>
        <small>{lang === 'EN' ? 'See the way floor by floor' : 'Tingnan ang daan bawat palapag'}</small>
      </span>
    </button>
  ) : null;

  return (
    <div className={`map-screen-container ${theme}-theme`} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      <header className="dir-header">
        <div className="brand" onClick={isVisitorView ? undefined : handleLogoTap}>
          <span className="brand-seal">
            <img src={tagaytaySeal} alt="Tagaytay City Seal" />
          </span>
          <span className="brand-text">
            <span className="dir-subtitle">{lang === 'EN' ? 'Republic of the Philippines' : 'Republika ng Pilipinas'}</span>
            <h2 className="dir-title">City Government of Tagaytay</h2>
            <span className="brand-tagline">{lang === 'EN' ? 'Interactive Directory Kiosk' : 'Interaktibong Gabay sa Opisina'}</span>
          </span>
        </div>

        <div className="hdr-tools">
          {/* Pabalik sa idle screen. Sa kiosk lang — walang welcome screen
              sa telepono ng bisita (tingnan ang timer sa itaas). */}
          {!isVisitorView && (
            <button
              className="hdr-btn"
              onClick={returnToIdle}
              title={lang === 'EN' ? 'Back to the start screen' : 'Bumalik sa simula'}
            >
              <span className="hdr-btn-label">{lang === 'EN' ? 'Back to Idle' : 'Bumalik sa Simula'}</span>
            </button>
          )}

          <button
            className="hdr-btn"
            onClick={() => setShowAbout(true)}
            title={lang === 'EN' ? 'About this kiosk' : 'Tungkol sa kiosk'}
          >
            {/* Salita, hindi emoji: ang ℹ️ ay hulaan pa ng bisita kung ano
                ang laman. Ang "About" ay mismong sagot na. */}
            <span className="hdr-btn-label">{lang === 'EN' ? 'About' : 'Tungkol'}</span>
          </button>

          <button
            className={`hdr-btn${isLarge ? ' is-on' : ''}`}
            onClick={() => setTextSize(textSize === 'normal' ? 'large' : 'normal')}
            title={lang === 'EN'
              ? (isLarge ? 'Back to normal text size' : 'Make the text bigger')
              : (isLarge ? 'Ibalik sa normal na laki ng teksto' : 'Palakihin ang teksto')}
          >
            {/* Maliit na A katabi ng malaking A — ito ang karaniwang
                pananda ng laki ng teksto. Mas malinaw ito kaysa sa
                emoji na 🔠, na hindi naman pampalaki ang ibig sabihin. */}
            <span className="hdr-btn-glyph hdr-btn-glyph--size" aria-hidden="true">
              <span className="glyph-a-sm">A</span>
              <span className="glyph-a-lg">A</span>
            </span>
            <span className="hdr-btn-label">
              {/* Pandiwa — ang sinasabi ay ang MANGYAYARI kapag pinindot,
                  hindi ang kasalukuyang laki. */}
              {lang === 'EN'
                ? (isLarge ? 'Reset to Normal' : 'Make Text Bigger')
                : (isLarge ? 'Ibalik sa Normal' : 'Palakihin ang Teksto')}
            </span>
          </button>

          <button className="hdr-btn" onClick={() => setLang(lang === 'EN' ? 'TL' : 'EN')}>
            <span className="hdr-btn-label">{lang === 'EN' ? 'English' : 'Tagalog'}</span>
          </button>

          <button
            className={`hdr-btn${isDarkMode ? ' is-on' : ''}`}
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
          >
            <span className="hdr-btn-label">
              {lang === 'EN' ? (isDarkMode ? 'Light' : 'Dark') : (isDarkMode ? 'Maliwanag' : 'Madilim')}
            </span>
          </button>

          <span className="hdr-sep" />

          <div className="hdr-clock">
            <span className="hdr-clock-time">{time}</span>
            <span className="hdr-clock-date">{dateLabel}</span>
          </div>
        </div>
      </header>

      <div className="map-workspace" style={{ position: 'relative', display: 'flex', flexGrow: 1 }}>
        
        <aside className="map-sidebar" style={{ flexShrink: 0, display: 'flex', flexDirection: 'column' }}>

          {/* Ang paghahanap ay pagbubukas sa buong direktoryo — kaya sa
              kiosk lang ito. Ang bisitang nag-scan ay may hawak nang
              isang tanong na nasagot na; wala siyang hahanapin dito. */}
          {!isVisitorView && (
            <div className={`sb-search${showKeyboard ? ' is-active' : ''}`}>
              <span className="sb-search-icon">🔍</span>
              <input
                type="text"
                className="sb-search-input"
                placeholder={lang === 'EN' ? 'Tap to search offices…' : 'Pindutin para maghanap…'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={() => setShowKeyboard(true)}
              />
              {searchQuery && (
                <button className="sb-search-clear" onClick={(e) => { e.stopPropagation(); setSearchQuery(""); }}>✕</button>
              )}
            </div>
          )}

          <div className="sb-scroll">

            {!isVisitorView && searchQuery.trim() !== "" && filteredSearchOptions.length > 0 && (
              <section className="sb-panel">
                <header className="sb-panel-head">
                  {lang === 'EN' ? 'Search Results' : 'Resulta ng Paghahanap'}
                </header>
                {filteredSearchOptions.map((officeItem) => (
                  <div
                    key={`search-${officeItem.floor}-${officeItem.key}`}
                    className="result-row"
                    onClick={() => handleSearchSelect(officeItem.key, officeItem.floor)}
                  >
                    <span className="result-badge">{localizeBadge(officeItem.badge, lang)}</span>
                    <span className="result-title">{officeItem.title}</span>
                  </div>
                ))}
              </section>
            )}

            {!isVisitorView && searchQuery.trim() === "" && showKeyboard && popularSearches.length > 0 && (
              <section className="sb-panel sb-panel--gold">
                <header className="sb-panel-head">
                  {lang === 'EN' ? 'Frequently Searched' : 'Madalas Hanapin'}
                </header>
                {popularSearches.map((officeItem) => (
                  <div
                    key={`pop-${officeItem.floor}-${officeItem.key}`}
                    className="result-row"
                    onClick={() => handleSearchSelect(officeItem.key, officeItem.floor)}
                  >
                    <span className="result-badge">{localizeBadge(officeItem.badge, lang)} • {officeItem.searchCount || 0} {lang === 'EN' ? 'searches' : 'hanap'}</span>
                    <span className="result-title">{officeItem.title}</span>
                  </div>
                ))}
              </section>
            )}

            {/* Ang listahan ng buong palapag — ito ang dating naabot ng
                bisita sa pamamagitan ng "Floor N list" na buton sa
                ibaba, at ito ang ibig sabihin ng "na-access nila ang
                kiosk". Wala na ang buton na iyon sa telepono, pero
                nakasara na rin ang listahan mismo. */}
            {!isVisitorView && !guide && routeStep === 'idle' && !selectedOfficeKey && (
              <div style={{ display: 'flex', flexDirection: 'column', flexShrink: 0 }}>

                <div className="floor-banner">
                  <div className="floor-banner-row">
                    <div>
                      <h2>{lang === 'EN' ? `Floor ${currentFloor} Directory` : `Direktoryo ng Palapag ${currentFloor}`}</h2>
                      <span className="floor-banner-sub">
                        {lang === 'EN' ? 'Tap an office to see the way' : 'Pindutin ang opisina para sa daan'}
                      </span>
                    </div>
                    <span className="floor-banner-count">
                      {lang === 'EN'
                        ? `${floorOfficeList.length} ${floorOfficeList.length === 1 ? 'office' : 'offices'}`
                        : `${floorOfficeList.length} opisina`}
                    </span>
                  </div>
                </div>

                <div className="office-list">
                  {floorOfficeList.length > 0 ? (
                    floorOfficeList.map(([key, office]) => (
                      <button
                        key={key}
                        className="office-row"
                        onClick={() => handleSelectOffice(key, currentFloor)}
                      >
                        <span className="office-row-badge">{localizeBadge(office.badge, lang) || `F${currentFloor}`}</span>
                        <span className="office-row-title">{office.title}</span>
                      </button>
                    ))
                  ) : (
                    <div className="sb-empty">
                      <p>{lang === 'EN' ? 'No offices mapped for this floor yet.' : 'Wala pang nakatalang opisina sa palapag na ito.'}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {routeStep === 'choose-transport' && destinationData && (
              <div className="sb-detail">
                <div className="destination-card">
                  <p className="label">{lang === 'EN' ? 'Destination' : 'Paroroonan'}</p>
                  <h1 className="office-title">{destinationData.title}</h1>
                  <span className="floor-badge">{localizeBadge(destinationData.badge, lang) || floorName(destinationData.floor, lang)}</span>
                </div>

                {/* Sunod agad sa pangalan: ano ang ginagawa ng tanggapang
                    ito. Iyon ang unang tanong ng bisita — nauuna pa ito sa
                    oras at pinuno, kaya nasa itaas ito ng .office-meta. */}
                {hasText(officeDescription(destinationData, lang)) && (
                  <div className="office-about">
                    <strong>ℹ️ {lang === 'EN' ? 'About this Office' : 'Tungkol sa Opisina'}</strong>
                    <div className="office-about-body">{officeDescription(destinationData, lang)}</div>
                  </div>
                )}

                {!destinationData.isDirectionOnly && (
                  <OfficeMeta office={destinationData} lang={lang} />
                )}

                {/* Nasa lumulutang na bintana sa gitna ng screen ang
                    pagpili ng daan — tingnan ang .route-pick-back sa
                    ibaba. Nandito lang ang detalye ng tanggapan, na
                    mababasa pagkatapos pumili. */}

                <QrCard link={destinationQrLink} lang={lang} />
              </div>
            )}

            {routeStep === 'go-to-transport' && destinationData && (
              <div>
                <div className="route-status">
                  <h2>{lang === 'EN' ? 'Showing route on the Ground Floor' : 'Ipinapakita ang ruta sa Ground Floor'}</h2>
                  <p>
                    {lang === 'EN' ? 'Please proceed to the ' : 'Pumunta po sa '}
                    {transportMethod === 'elevator' ? 'Elevator' : transportMethod === 'escalator' ? 'Escalator' : (lang === 'EN' ? 'Stairs' : 'Hagdan')}.
                  </p>
                </div>
                <div className="route-status-step">
                  {lang === 'EN'
                        ? (transportMethod === 'elevator'
                          ? `Going up to Floor ${destinationData.floor}…`
                          : transportMethod === 'escalator'
                            ? 'Taking the escalator to Floor 2…'
                            : 'Walking to the stairs…')
                        : (transportMethod === 'elevator'
                          ? `Paakyat sa Palapag ${destinationData.floor}…`
                          : transportMethod === 'escalator'
                            ? 'Sumasakay sa escalator papuntang Palapag 2…'
                            : 'Naglalakad papunta sa hagdan…')}
                </div>
              </div>
            )}

            {routeStep === 'climbing-stairs' && destinationData && (
              <div>
                <div className="route-status route-status--gold">
                  <h2>{lang === 'EN' ? 'Climbing stairs…' : 'Umaakyat sa hagdan…'}</h2>
                  <p>{lang === 'EN' ? `Currently passing Floor ${currentFloor}` : `Kasalukuyang nasa Palapag ${currentFloor}`}</p>
                  {currentFloor === 2 && (
                    <p>{lang === 'EN'
                      ? 'Walk to the other stairs below the Small Library to keep going up.'
                      : 'Lumakad papunta sa kabilang hagdan sa ilalim ng Small Library para tumuloy paakyat.'}</p>
                  )}
                  {currentFloor === 5 && (
                    <p>{lang === 'EN'
                      ? 'Walk to the stairs in the middle, right outside the elevator, to keep going up.'
                      : 'Lumakad papunta sa hagdan sa gitna, paglabas ng elevator, para tumuloy paakyat.'}</p>
                  )}
                </div>
                <div className="route-status-step">{lang === 'EN' ? 'Target' : 'Papunta sa'}: {floorName(destinationData.floor, lang)}</div>
              </div>
            )}

            {/* Nasa lumulutang na kard sa itaas-kaliwa ng mapa ang mismong
                gabay (tingnan ang guideOverlay). Dito naiiwan ang
                paalala kung saan pupunta — nagpapalit-palit kasi ang
                napipili habang binabalikan ang mga palapag, kaya ang
                pinanggalingang tunguhin ang ipinapakita, hindi iyon. */}
            {guide && (
              <div className="sb-detail">
                {guideDestination && (
                  <div className="destination-card">
                    <p className="label">{lang === 'EN' ? 'Destination' : 'Paroroonan'}</p>
                    <h1 className="office-title">{guideDestination.title}</h1>
                    <span className="floor-badge">
                      {localizeBadge(guideDestination.badge, lang) || floorName(guide.backTo.floor, lang)}
                    </span>
                  </div>
                )}

                <button className="guide-done" onClick={closeGuide}>
                  ✓ {lang === 'EN' ? 'Done — back to the office' : 'Tapos na — balik sa opisina'}
                </button>
              </div>
            )}

            {!guide && (routeStep === 'arrived' || (routeStep === 'idle' && selectedOfficeKey && selectedOfficeKey !== 'elevator-up' && selectedOfficeKey !== 'stairs-up')) && selectedOffice && (
              <div className="sb-detail">
                {/* Wala ang hanay na ito sa telepono. Ang "⬅️ Floor N
                    list" ay nagbubura ng napiling opisina at nag-iiwan
                    ng BUONG DIREKTORYO — ito mismo ang pinasukan ng
                    nag-evaluate. Ang gabay naman ay paglipat-lipat ng
                    palapag, at larawan lang ng isang palapag ang
                    ipinangako ng link na na-scan. */}
                {!isVisitorView && (
                  <div className="sb-detail-actions">
                    <button
                      className="back-to-list-btn"
                      onClick={() => { setSelectedOfficeKey(null); setRouteStep('idle'); setDestinationData(null); }}
                    >
                      {lang === 'EN' ? `Floor ${currentFloor} list` : `Palapag ${currentFloor}`}
                    </button>
                  </div>
                )}

                <div className="destination-card">
                  <p className="label">{lang === 'EN' ? 'Destination' : 'Paroroonan'}</p>
                  <h1 className="office-title">{selectedOffice.title}</h1>
                  <span className="floor-badge">{localizeBadge(selectedOffice.badge, lang)}</span>
                </div>

                {/* Tingnan ang nasa itaas: sunod sa pangalan ang paliwanag
                    tungkol sa tanggapan, bago ang estado at oras. */}
                {hasText(officeDescription(selectedOffice, lang)) && (
                  <div className="office-about">
                    <strong>ℹ️ {lang === 'EN' ? 'About this Office' : 'Tungkol sa Opisina'}</strong>
                    <div className="office-about-body">{officeDescription(selectedOffice, lang)}</div>
                  </div>
                )}

                {selectedOffice.isDirectionOnly ? (
                  <div className="wayfinding-note">
                    <strong>{lang === 'EN' ? 'Wayfinding path generated.' : 'Nakahanda na ang daan.'}</strong>{' '}
                    {lang === 'EN'
                      ? 'Please follow the highlighted path on the map.'
                      : 'Sundan po ang linyang nakahighlight sa mapa.'}
                  </div>
                ) : (
                  <OfficeMeta office={selectedOffice} lang={lang} />
                )}

                {/* Sa kiosk lang may silbi ang QR. Sa telepono, ang
                    paanyaya nitong "i-scan mo sa phone mo" ay nasa
                    phone na mismo — at bawat bagong QR ay bagong link
                    na mabubuhay pang labinlimang minuto. */}
                {!isVisitorView && (
                  <QrCard link={arrivedQrLink} lang={lang} />
                )}
              </div>
            )}
          </div>
        </aside>

        <MapScreen 
          offices={liveOfficeDatabase[currentFloor]} 
          selectedOfficeKey={selectedOfficeKey}
          onSelectOffice={(key) => handleSelectOffice(key, currentFloor)}
          currentFloor={currentFloor}
          onPickFloor={handlePickFloor}
          transportMethod={transportMethod}
          routeStep={routeStep}
          elevatorStatus={elevatorStatus}
          escalatorStatus={escalatorStatus}
          kioskLabel={guideKioskLabel}
          lang={lang}
          // Ang `route` sa URL ay galing lang sa QR na na-scan ng bisita —
          // hindi ito kailanman nilalagay ng kiosk sa sarili nitong URL.
          // Kaya ito ang malinaw na senyas na nasa telepono na ito, at
          // larawan lang ng palapag ang dapat lumabas doon.
          staticView={isVisitorView}
          overlay={guideOverlay}
        />

        {isVisitorView && (
          <div className="screenshot-hint">
            <strong>{lang === 'EN' ? 'Take a screenshot' : 'Mag-screenshot'}</strong>
            <span>{lang === 'EN'
              ? 'Session expires when the screen is locked or idle.'
              : 'Mawawala ang session kapag na-lock o hindi ginalaw ang screen.'}</span>
          </div>
        )}

        {showKeyboard && (
          <div className="kiosk-virtual-keyboard">
            <div className="kb-head">
              <span className="kb-title">⌨️ {lang === 'EN' ? 'Kiosk touchscreen keyboard' : 'Keyboard ng kiosk'}</span>
              <button className="kb-hide" onClick={() => setShowKeyboard(false)}>
                {lang === 'EN' ? 'Hide keyboard' : 'Itago'} ✕
              </button>
            </div>
            {keyboardRows.map((row, rowIndex) => (
              <div className="kb-row" key={rowIndex}>
                {row.map((key) => {
                  const modifier = key === 'SPACE' ? ' kb-key--space'
                    : key === 'BACKSPACE' ? ' kb-key--back'
                    : key === 'ENTER' ? ' kb-key--enter'
                    : key === 'SHIFT' ? ` kb-key--shift${kbShift ? ' is-on' : ''}`
                    : key === 'CLEAR' ? ' kb-key--clear' : '';
                  return (
                    <button key={key} className={`kb-key${modifier}`} onClick={() => handleVirtualKeyPress(key)}>
                      {keyLabel(key)}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}

      </div>

      {/* ── PAGPILI NG DAAN PAAKYAT ────────────────────────────────
          Lumulutang na bintana sa gitna ng screen, hindi maliit na
          kontrol sa gilid. May dahilan ito: noong nasa tabi ng zoom
          pa ito, hindi napapansin ng bisita na may pipiliin pa siya —
          blangko ang mapa habang hinihintay ang pagpili, at akala
          niya sira ang kiosk. Dito, hindi ito puwedeng malampasan:
          nakaharang ito sa mapa hangga't wala pang napipili.

          Sadyang hindi nagsasara kapag napindot ang likuran — dalawa
          lang ang paraan palabas: pumili ng daan, o pindutin ang
          malinaw na pagkansela sa ilalim. */}
      {routeStep === 'choose-transport' && destinationData && (
        <div className="route-pick-back">
          <div className="route-pick">

            <div className="route-pick-head">
              <span className="route-pick-eyebrow">
                {lang === 'EN' ? 'One more step' : 'Isa na lang'}
              </span>
              <h2 className="route-pick-title">
                {lang === 'EN' ? 'How would you like to go up?' : 'Paano po kayo aakyat?'}
              </h2>
              <p className="route-pick-dest">
                {lang === 'EN' ? 'Going to' : 'Papunta sa'}{' '}
                <strong>{destinationData.title}</strong>
                <span className="route-pick-badge">
                  {localizeBadge(destinationData.badge, lang) || floorName(destinationData.floor, lang)}
                </span>
              </p>
            </div>

            <div className="route-pick-opts">
              {/* Nananatiling nakikita kahit sira — kapag nawala na lang
                  ito, iisipin ng bisita na walang elevator ang gusali at
                  hahanapin pa rin. Ang malinaw na "sira" ang sagot doon. */}
              <button
                className={`route-opt${elevatorOut ? ' is-out' : ''}`}
                disabled={elevatorOut}
                onClick={() => { setSelectedOfficeKey('elevator-up'); setTransportMethod('elevator'); setRouteStep('go-to-transport'); }}
              >
                <span className="route-opt-ico">🛗</span>
                <span className="route-opt-name">{lang === 'EN' ? 'Elevator' : 'Elevator'}</span>
                {elevatorOut ? (
                  <span className="route-opt-sub route-opt-warn">
                    ⚠️ {liftStatusLabel(elevatorStatus, lang)}
                    {lang === 'EN' ? ' — not available right now' : ' — hindi magagamit sa ngayon'}
                  </span>
                ) : (
                  <span className="route-opt-sub">
                    {lang === 'EN'
                      ? `Ride up to Floor ${destinationData.floor}`
                      : `Sumakay paakyat sa Palapag ${destinationData.floor}`}
                  </span>
                )}
              </button>

              {destinationData.floor === 2 && (
                <button
                  className={`route-opt${escalatorOut ? ' is-out' : ''}`}
                  disabled={escalatorOut}
                  onClick={() => { setSelectedOfficeKey('elevator-up'); setTransportMethod('escalator'); setRouteStep('go-to-transport'); }}
                >
                  <span className="route-opt-ico"><EscalatorIcon /></span>
                  <span className="route-opt-name">{lang === 'EN' ? 'Escalator' : 'Escalator'}</span>
                  {escalatorOut ? (
                    <span className="route-opt-sub route-opt-warn">
                      ⚠️ {liftStatusLabel(escalatorStatus, lang)}
                      {lang === 'EN' ? ' — not available right now' : ' — hindi magagamit sa ngayon'}
                    </span>
                  ) : (
                    <span className="route-opt-sub">
                      {lang === 'EN' ? 'Glide up to Floor 2' : 'Paakyat sa Palapag 2'}
                    </span>
                  )}
                </button>
              )}

              <button
                className="route-opt"
                onClick={() => { setSelectedOfficeKey('stairs-up'); setTransportMethod('stairs'); setRouteStep('go-to-transport'); }}
              >
                <span className="route-opt-ico">🚶</span>
                <span className="route-opt-name">{lang === 'EN' ? 'Stairs' : 'Hagdan'}</span>
                <span className="route-opt-sub">
                  {lang === 'EN'
                    ? `Walk up ${destinationData.floor - 1} ${destinationData.floor - 1 === 1 ? 'floor' : 'floors'}`
                    : `Akyatin ang ${destinationData.floor - 1} palapag`}
                </span>
              </button>
            </div>

            <p className="route-pick-hint">
              {lang === 'EN'
                ? 'Pick one and the route will be drawn on the map.'
                : 'Pumili po at iguguhit na ang ruta sa mapa.'}
            </p>

            <button
              className="route-pick-cancel"
              // Kasama ang napiling opisina sa binubura. Nakatago ang
              // listahan hangga't may napili, kaya kung maiiwan ito,
              // blangko ang sidebar pagkatapos kanselahin.
              onClick={() => { setRouteStep('idle'); setDestinationData(null); setSelectedOfficeKey(null); }}
            >
              ✕ {lang === 'EN' ? 'Never mind — back to the office list' : 'Hindi na — balik sa listahan'}
            </button>
          </div>
        </div>
      )}

      {showAbout && (
        <div className="k-overlay" onClick={() => setShowAbout(false)}>
          <div className="k-modal" onClick={(e) => e.stopPropagation()}>

            <div className="k-modal-head">
              <div>
                <span className="k-modal-eyebrow">City Government of Tagaytay</span>
                <h2 className="k-modal-title">{lang === 'EN' ? 'About the Kiosk' : 'Tungkol sa Kiosk'}</h2>
              </div>
              <button className="k-close" onClick={() => setShowAbout(false)}>✕</button>
            </div>

            <p className="k-modal-text k-modal-text--justify">
              {lang === 'EN' ? (
                <>
                  This Interactive Directory Kiosk was developed by 4th-year Bachelor of Science in
                  Information Technology (BSIT) students from the City College of Tagaytay. Our goal is
                  to enhance public service by providing an accessible, easy-to-use digital mapping
                  system that helps citizens seamlessly locate offices and navigate the City Hall.
                </>
              ) : (
                <>
                  Ang Interaktibong Directory Kiosk na ito ay binuo ng mga mag-aaral sa ika-4 na taon
                  ng Bachelor of Science in Information Technology (BSIT) mula sa City College of
                  Tagaytay. Layunin naming mapabuti ang serbisyo publiko sa pamamagitan ng isang
                  madaling gamitin na digital na mapa na tumutulong sa mga mamamayan na mabilis
                  mahanap ang mga tanggapan at makapaglibot sa City Hall.
                </>
              )}
            </p>

            <div className="k-roster">
              <h3 className="k-roster-title">{lang === 'EN' ? 'The Development Team' : 'Ang Bumuo ng Kiosk'}</h3>

              <div className="k-roster-grid">
                {TEAM.map((member) => (
                  <div key={member.name} className="k-roster-card">
                    <img src={member.photo} alt={member.name} className="k-roster-photo" loading="lazy" />
                    <span className="k-roster-name">{member.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ang lungsod na pinagsisilbihan, ang kolehiyo, at ang
                departamentong bumuo ng kiosk. */}
            <div className="k-modal-logos">
              <img src={tagaytaySeal} alt="City Government of Tagaytay" className="k-modal-seal" />
              <img src={cctLogo} alt="City College of Tagaytay" className="k-modal-logo" />
              <img src={scsLogo} alt="School of Computer Studies" className="k-modal-logo" />
            </div>
          </div>
        </div>
      )}

      {showRecoveryModal && (
        <div className="k-overlay">
          <div className="k-modal k-modal--sm" ref={authModalRef} style={{ textAlign: 'center' }}>
            <h2 className="k-modal-title" style={{ marginBottom: '10px' }}>
              {lang === 'EN' ? 'Set New Password' : 'Maglagay ng Bagong Password'}
            </h2>
            <p className="k-modal-text k-modal-text--center">
              {lang === 'EN'
                ? 'Enter your new master password below.'
                : 'Ilagay sa ibaba ang bagong master password.'}
            </p>

            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!isStrongPassword(recoveryPassword)) {
                return alert(lang === 'EN'
                  ? 'Weak Password:\n\nPassword must be at least 8 characters long and include:\n- At least 1 Uppercase letter\n- At least 1 Lowercase letter\n- At least 1 Number'
                  : 'Mahinang Password:\n\nKailangang hindi bababa sa 8 na karakter ang password at may kasamang:\n- Kahit 1 malaking letra\n- Kahit 1 maliit na letra\n- Kahit 1 numero');
              }
              try {
                setIsLoggingIn(true);
                await changeAdminPassword(recoveryPassword);
                alert(lang === 'EN'
                  ? 'Password successfully changed! You can now login.'
                  : 'Matagumpay na napalitan ang password! Maaari na kayong mag-login.');
                setShowRecoveryModal(false);
                setRecoveryPassword('');
                await logoutAdmin(); 
                setShowAdminLogin(true); 
              } catch (err) {
                alert(lang === 'EN'
                  ? 'Failed to update password. Link might be expired.'
                  : 'Hindi na-update ang password. Baka expired na ang link.');
              } finally {
                setIsLoggingIn(false);
              }
            }}>
              
              <div className="k-field k-input-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  className="k-input"
                  value={recoveryPassword}
                  onChange={(e) => setRecoveryPassword(e.target.value)}
                  placeholder={lang === 'EN'
                    ? 'Min 8 chars, 1 uppercase, 1 number'
                    : 'Hindi bababa sa 8 na karakter, 1 malaking letra, 1 numero'}
                  autoFocus
                  required
                />
                <button type="button" className="k-eye" onClick={() => setShowPassword(!showPassword)}>
                  {lang === 'EN' ? (showPassword ? 'Hide' : 'Show') : (showPassword ? 'Itago' : 'Ipakita')}
                </button>
              </div>

              <button type="submit" className="k-btn k-btn--ok" disabled={isLoggingIn}>
                {lang === 'EN'
                  ? (isLoggingIn ? 'Saving…' : 'Save New Password')
                  : (isLoggingIn ? 'Sine-save…' : 'I-save ang Bagong Password')}
              </button>

            </form>
          </div>
        </div>
      )}

      {showAdminLogin && (
        <div className="k-overlay">
          <div className="k-modal k-modal--sm" ref={authModalRef} style={{ textAlign: 'center' }}>
            <h2 className="k-modal-title" style={{ marginBottom: '10px' }}>
              {lang === 'EN' ? 'Admin Access' : 'Pagpasok ng Admin'}
            </h2>
            <p className="k-modal-text k-modal-text--center">
              {lang === 'EN'
                ? 'Enter the admin email and password.'
                : 'Ilagay ang email at password ng admin.'}
            </p>

            <form onSubmit={handleAdminLogin}>

              <div className="k-field">
                <input
                  type="email"
                  className="k-input"
                  value={adminEmailInput}
                  onChange={(e) => setAdminEmailInput(e.target.value)}
                  placeholder={lang === 'EN' ? 'Admin email…' : 'Email ng admin…'}
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  disabled={loginLocked}
                  required
                  autoFocus
                />
              </div>

              <div className="k-field k-input-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  className="k-input"
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  placeholder={lang === 'EN' ? 'Enter password…' : 'Ilagay ang password…'}
                  autoComplete="current-password"
                  disabled={loginLocked}
                />
                <button
                  type="button"
                  className="k-eye"
                  onClick={() => setShowPassword(!showPassword)}
                  title={lang === 'EN'
                    ? (showPassword ? 'Hide password' : 'Show password')
                    : (showPassword ? 'Itago ang password' : 'Ipakita ang password')}
                >
                  {lang === 'EN' ? (showPassword ? 'Hide' : 'Show') : (showPassword ? 'Itago' : 'Ipakita')}
                </button>
              </div>

              {/* Ilang subok pa, o gaano pa katagal ang lock. */}
              {loginLocked ? (
                <p className="k-login-guard is-locked" role="alert">
                  {lang === 'EN'
                    ? `Too many wrong passwords. Try again in ${formatCountdown(loginGuard.lockUntil - guardNow)}.`
                    : `Sobrang daming maling password. Subukan ulit sa loob ng ${formatCountdown(loginGuard.lockUntil - guardNow)}.`}
                </p>
              ) : loginGuard.fails > 0 && (
                <p className="k-login-guard" role="alert">
                  {lang === 'EN'
                    ? `Wrong email or password. ${MAX_LOGIN_ATTEMPTS - loginGuard.fails} ${MAX_LOGIN_ATTEMPTS - loginGuard.fails === 1 ? 'try' : 'tries'} left before it locks.`
                    : `Mali ang email o password. ${MAX_LOGIN_ATTEMPTS - loginGuard.fails} subok na lang bago ma-lock.`}
                </p>
              )}

              <div className="k-btn-row" style={{ marginBottom: '14px' }}>
                <button
                  type="button"
                  className="k-btn k-btn--ghost"
                  onClick={() => { setShowAdminLogin(false); setAdminEmailInput(''); setAdminPasswordInput(''); setShowPassword(false); }}
                >
                  {lang === 'EN' ? 'Cancel' : 'Kanselahin'}
                </button>
                <button type="submit" className="k-btn k-btn--primary" disabled={isLoggingIn || loginLocked}>
                  {lang === 'EN'
                    ? (isLoggingIn ? 'Checking…' : loginLocked ? 'Locked' : 'Login')
                    : (isLoggingIn ? 'Sinusuri…' : loginLocked ? 'Naka-lock' : 'Mag-login')}
                </button>
              </div>

              <button type="button" className="k-btn k-btn--link" onClick={handleForgotPassword} disabled={resetLocked}>
                {resetLocked
                  ? (lang === 'EN'
                    ? `Reset link: try again in ${formatCountdown(resetCooldownUntil - guardNow)}`
                    : `Reset link: puwede ulit sa loob ng ${formatCountdown(resetCooldownUntil - guardNow)}`)
                  : lang === 'EN'
                  ? 'Forgot password? Send reset link'
                  : 'Nakalimutan ang password? Magpadala ng reset link'}
              </button>

            </form>
          </div>
        </div>
      )}

      {showAdmin && (
        <AdminPanel
          officeDatabase={liveOfficeDatabase}
          onClose={() => setShowAdmin(false)}
          onDataUpdate={() => { fetchKioskData(); }}
          lang={lang}
          setLang={setLang}
        />
      )}

      {/* Nasa TOP LEVEL, hindi sa loob ng .k-modal. Ang .vkb ay position:fixed —
          kung may ninuno itong may transform/filter, ang ninuno ang magiging
          containing block at malilihis (o maiipit sa overflow) ang keyboard.
          Dito, ang viewport lagi ang sukatan. */}
      {(showAdminLogin || showRecoveryModal) && <AuthKeyboard scopeRef={authModalRef} lang={lang} />}

      {/* Huli sa DOM para nasa ibabaw ng lahat, pati ng Admin Panel. */}
      {stillThereDeadline !== null && (
        <StillThereModal
          deadline={stillThereDeadline}
          lang={lang}
          onStay={() => setStillThereDeadline(null)}
          onLeave={returnToIdle}
        />
      )}
    </div>
  );
}