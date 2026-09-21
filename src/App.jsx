import React, { useState, useEffect, useRef } from 'react';
import tagaytaySeal from './assets/tagaytay-seal.jpg';
import WelcomeScreen from './WelcomeScreen';
import DashboardScreen from './DashboardScreen';
import DirectoryScreen from './DirectoryScreen';
import MapScreen from './components/MapScreen';
import AdminPanel from './admin/AdminPanel';
import VirtualKeyboard from './components/VirtualKeyboard';
import './index.css';

import { QRCodeSVG } from 'qrcode.react'; 
import { useSearchParams } from 'react-router-dom';

import { getAllOffices, initializeDatabase, incrementSearchCount, loginAdmin, resetPasswordEmail, logoutAdmin, onAuthChange, changeAdminPassword } from './lib/api';
import { coordinateMapping, mergeOfficeData } from './lib/coordinateMapping';
import { defaultOfficeData } from './lib/defaultOfficeData';
import { isRecoveryLink } from './lib/recoveryFlag';

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

// Keyboard para sa mga auth modal. Hiwalay na component para ang pag-unmount
// nito (pagsara ng modal) ang mag-reset ng "hidden" — kaya hindi na kailangan
// ng useEffect na nagse-setState, na nagdudulot ng cascading renders.
function AuthKeyboard({ scopeRef, lang }) {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;
  return <VirtualKeyboard scopeRef={scopeRef} onClose={() => setHidden(true)} lang={lang} />;
}

export default function App() {
  const [searchParams] = useSearchParams();

  const [liveOfficeDatabase, setLiveOfficeDatabase] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false); 

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isMobileSessionExpired, setIsMobileSessionExpired] = useState(false);

  const [appState, setAppState] = useState('welcome');
  const [theme, setTheme] = useState('light'); 
  const [currentFloor, setCurrentFloor] = useState(1);
  const [time, setTime] = useState("--:-- --");
  
  const [selectedOfficeKey, setSelectedOfficeKey] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showKeyboard, setShowKeyboard] = useState(false);

  const [lang, setLang] = useState('EN');     
  const [textSize, setTextSize] = useState('normal'); 

  const [showAdmin, setShowAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false); 
  const [adminPasswordInput, setAdminPasswordInput] = useState(''); 
  const [showPassword, setShowPassword] = useState(false); 
  
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);

  // Kiosk touchscreen keyboard para sa mga auth modal. Walang pisikal na
  // keyboard ang terminal — kung wala ito, hindi makakapasok ang admin.
  const authModalRef = useRef(null);
  const [recoveryPassword, setRecoveryPassword] = useState('');

  const [secretClicks, setSecretClicks] = useState(0);
  const [showAbout, setShowAbout] = useState(false); 

  const [routeStep, setRouteStep] = useState('idle');
  const [destinationData, setDestinationData] = useState(null);
  const [transportMethod, setTransportMethod] = useState(() => searchParams.get('transport') || 'elevator');

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

  useEffect(() => {
    const key = searchParams.get('key');
    const routeKey = searchParams.get('route');
    const isRecovery = isRecoveryLink;

    // Papasukin kung mobile scan (routeKey), password recovery (isRecovery), o may tamang secret key
    if (isRecovery || routeKey || key === 'cct-bsit-kiosk') {
      setIsAuthorized(true);
    } else {
      // Kung wala yung tamang key sa link, i-lock palagi ang system!
      setIsAuthorized(false);
    }
  }, [searchParams]);

  useEffect(() => {
    const routeKey = searchParams.get('route');
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 1024;

    if (isMobile && routeKey) {
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
        idleTimeout = setTimeout(() => {
          triggerSelfDestruct();
        }, 300000); 
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
    }
  }, [searchParams]);

  useEffect(() => {
    const routeKey = searchParams.get('route');
    const transportParam = searchParams.get('transport'); 

    if (routeKey && Object.keys(liveOfficeDatabase).length > 0) {
      let foundFloor = null;
      Object.entries(liveOfficeDatabase).forEach(([floorNum, offices]) => {
        if (offices[routeKey]) foundFloor = parseInt(floorNum);
      });

      if (foundFloor) {
        setAppState('map');
        setCurrentFloor(foundFloor);
        setSelectedOfficeKey(routeKey);
        if (transportParam) setTransportMethod(transportParam); 
        setRouteStep('arrived');
      }
    }
  }, [searchParams, liveOfficeDatabase]);

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

  useEffect(() => {
    let timeout;
    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setAppState('welcome');
        setSelectedOfficeKey(null);
        setSearchQuery("");
        setShowKeyboard(false);
        setRouteStep('idle');
        setDestinationData(null);
        setShowAdmin(false);
        setShowAdminLogin(false);
        setAdminPasswordInput('');
        setShowPassword(false);
        setShowAbout(false); 
        setShowRecoveryModal(false); 
        setRecoveryPassword('');
        logoutAdmin(); 
      }, 45000); 
    };

    if (appState !== 'welcome') {
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
  }, [appState]);

  const handleLogoTap = () => {
    if (secretClicks + 1 >= 5) { 
      setShowAdminLogin(true); 
      setSecretClicks(0); 
    } else { 
      setSecretClicks(prev => prev + 1); 
      setTimeout(() => setSecretClicks(0), 3000); 
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault(); 
    setIsLoggingIn(true);
    
    try {
      await loginAdmin('tagaytaykiosk@gmail.com', adminPasswordInput);
      setShowAdminLogin(false);
      setAdminPasswordInput('');
      setShowPassword(false);
      setShowAdmin(true); 
    } catch (error) {
      alert(lang === 'EN'
        ? '❌ Access Denied: Incorrect Password or Network Error.'
        : '❌ Hindi Makapasok: Maling password o may problema sa koneksyon.');
      setAdminPasswordInput('');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleForgotPassword = async () => {
    try {
      await resetPasswordEmail('tagaytaykiosk@gmail.com');
      alert(lang === 'EN'
        ? '✅ Recovery link sent to tagaytaykiosk@gmail.com!\n\nPlease check the Gmail inbox to set a new password.'
        : '✅ Naipadala ang recovery link sa tagaytaykiosk@gmail.com!\n\nTingnan ang Gmail inbox para maglagay ng bagong password.');
    } catch (error) {
      // Dati ay laging "internet connection" ang sinasabi nito kahit ano pa
      // ang tunay na dahilan — kaya mahirap i-debug. Ipakita ang totoo.
      const code = error?.code || error?.error_code || '';
      const isRateLimited = code === 'over_email_send_rate_limit' || error?.status === 429;

      if (isRateLimited) {
        alert(lang === 'EN'
          ? '⏳ Too many reset requests.\n\n' +
            'Supabase limits how many emails can be sent per hour, and that limit ' +
            'has been reached. Wait about an hour before trying again.\n\n' +
            '(Supabase: email rate limit exceeded)'
          : '⏳ Sobrang dami nang reset request.\n\n' +
            'May limitasyon ang Supabase sa dami ng email na maipapadala kada oras, ' +
            'at naabot na ito. Maghintay ng mga isang oras bago subukan ulit.\n\n' +
            '(Supabase: email rate limit exceeded)'
        );
        return;
      }

      alert(lang === 'EN'
        ? '❌ Failed to send reset email.\n\n' +
          `Reason: ${error?.message || 'Unknown'}` +
          (error?.status ? ` (HTTP ${error.status})` : '')
        : '❌ Hindi naipadala ang reset email.\n\n' +
          `Dahilan: ${error?.message || 'Hindi matukoy'}` +
          (error?.status ? ` (HTTP ${error.status})` : '')
      );
    }
  };

  const handleSelectOffice = (key, floor) => {
    const targetOffice = liveOfficeDatabase[floor]?.[key];
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 1024;

    if (floor === 1 || isMobile) {
      setCurrentFloor(floor);
      setSelectedOfficeKey(key);
      setRouteStep('arrived');
      setDestinationData(null);
    } else {
      setDestinationData({ key, floor, ...targetOffice });
      setCurrentFloor(1); 
      setSelectedOfficeKey(null);
      setRouteStep('choose-transport'); 
    }
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
        timeoutId = setTimeout(() => {
          setCurrentFloor(prev => prev + 1);
        }, 1500);
      } else if (currentFloor === destinationData.floor) {
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
    else setSearchQuery(prev => prev + key);
  };

  const selectedOffice = selectedOfficeKey ? liveOfficeDatabase[currentFloor]?.[selectedOfficeKey] : null;

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
    const steps = [{
      floor: 1,
      officeKey: method === 'stairs' ? 'stairs-up' : 'elevator-up',
      icon: '🔴',
      title: EN ? 'Ground Floor — start here' : 'Ground Floor — dito magsimula',
      body: EN
        ? `You are at the map kiosk. Follow the line to the ${ride}.`
        : `Nasa map kiosk po kayo. Sundan ang linya papunta sa ${ride === 'Stairs' ? 'Hagdan' : ride}.`,
    }];

    if (method === 'stairs') {
      // Isang hakbang bawat palapag na aakyatin — ito ang talagang
      // dinaraanan ng naglalakad.
      for (let f = 2; f <= floor; f++) {
        const isLast = f === floor;
        steps.push({
          floor: f,
          officeKey: isLast ? officeKey : null,
          icon: isLast ? '🎯' : '🚶',
          title: isLast
            ? `Floor ${f} — ${office.title}`
            : (EN ? `Floor ${f} — keep climbing` : `Palapag ${f} — akyat pa`),
          body: isLast
            ? (EN ? 'You have arrived. Follow the line to the door.' : 'Narito na po. Sundan ang linya papunta sa pinto.')
            : (EN
              ? 'You pass this floor. The stairs continue up from the same spot.'
              : 'Dadaanan po ninyo ang palapag na ito. Dito rin nagpapatuloy paakyat ang hagdan.'),
        });
      }
    } else {
      steps.push({
        floor,
        officeKey,
        icon: '🎯',
        title: `Floor ${floor} — ${office.title}`,
        body: EN
          ? `Get off at Floor ${floor}, then follow the line to the door.`
          : `Bumaba po sa Palapag ${floor}, tapos sundan ang linya papunta sa pinto.`,
      });
    }

    return steps;
  };

  const openGuide = () => {
    if (!selectedOfficeKey || !selectedOffice || currentFloor <= 1) return;
    const steps = buildGuideSteps(selectedOfficeKey, selectedOffice, currentFloor, transportMethod);
    // Ang huling hakbang ang kinalalagyan na ngayon ng bumibisita, kaya
    // doon nagbubukas — pabalik ang tingin, hindi pasimula ulit.
    const startIndex = steps.length - 1;
    setGuide({
      steps,
      index: startIndex,
      backTo: { floor: currentFloor, officeKey: selectedOfficeKey },
    });
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
      ? `🚶 PASSING FLOOR ${guideStep.floor}`
      : `🚶 DINARAANAN — PALAPAG ${guideStep.floor}`)
    : null;

  // Mga opisinang ipinapakita sa listahan ng kasalukuyang palapag
  const floorOfficeList = Object.entries(liveOfficeDatabase[currentFloor] || {})
    .filter(([key]) => key !== 'elevator-up' && key !== 'stairs-up');

  if (isMobileSessionExpired) {
    return (
      <div className="sys sys--alert">
        <span className="sys-icon">⏱️</span>
        <h2 className="sys-title">Session Expired</h2>
        <p className="sys-text">
          For security purposes, this mobile map link has self-destructed because the app was
          minimized or the screen was turned off.
        </p>
        <p className="sys-text">
          Please return to the Tagaytay City Hall Directory Kiosk and scan the QR code again.
        </p>
        <span className="sys-note">Secure mobile session</span>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="sys">
        <span className="sys-icon">🔒</span>
        <h2 className="sys-title">System Locked</h2>
        <p className="sys-text">
          This system is restricted and can only be accessed from the physical
          Tagaytay City Hall Kiosk Terminal.
        </p>
        <span className="sys-note">Tagaytay City Hall · Directory Kiosk</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="sys">
        <img src={tagaytaySeal} alt="Tagaytay City Seal" className="k-modal-seal" style={{ width: '96px', height: '96px', margin: '0 0 24px 0' }} />
        <h2 className="sys-title">Tagaytay City Hall</h2>
        <p className="sys-text">Initializing kiosk systems…</p>
        <span className="sys-loader" />
      </div>
    );
  }

  if (appState === 'welcome') return <WelcomeScreen onStart={() => setAppState('map')} />;

  const isDarkMode = theme === 'dark';
  const isLarge = textSize === 'large';

  const dateLabel = new Date().toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' });

  const keyboardRows = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', '-'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'CLEAR', 'BACKSPACE'],
    ['SPACE']
  ];

  return (
    <div className={`map-screen-container ${theme}-theme`} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      <header className="dir-header">
        <div className="brand" onClick={handleLogoTap}>
          <span className="brand-seal">
            <img src={tagaytaySeal} alt="Tagaytay City Seal" />
          </span>
          <span className="brand-text">
            <span className="dir-subtitle">{lang === 'EN' ? 'Republic of the Philippines' : 'Republika ng Pilipinas'}</span>
            <h2 className="dir-title">Tagaytay City Hall</h2>
            <span className="brand-tagline">{lang === 'EN' ? 'Interactive Directory Kiosk' : 'Interaktibong Gabay sa Opisina'}</span>
          </span>
        </div>

        <div className="hdr-tools">
          <button
            className="hdr-btn hdr-btn--icon"
            onClick={() => setShowAbout(true)}
            title={lang === 'EN' ? 'About this kiosk' : 'Tungkol sa kiosk'}
          >
            ℹ️
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
              {lang === 'EN'
                ? (isLarge ? 'Normal Text' : 'Bigger Text')
                : (isLarge ? 'Normal' : 'Palakihin')}
            </span>
          </button>

          <button className="hdr-btn" onClick={() => setLang(lang === 'EN' ? 'TL' : 'EN')}>
            <span className="hdr-btn-glyph">🌐</span>
            <span className="hdr-btn-label">{lang === 'EN' ? 'English' : 'Tagalog'}</span>
          </button>

          <button
            className={`hdr-btn${isDarkMode ? ' is-on' : ''}`}
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
          >
            <span className="hdr-btn-glyph">{isDarkMode ? '☀️' : '🌙'}</span>
            <span className="hdr-btn-label">{isDarkMode ? 'Light' : 'Dark'}</span>
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

          <div className="sb-scroll">

            {searchQuery.trim() !== "" && filteredSearchOptions.length > 0 && (
              <section className="sb-panel">
                <header className="sb-panel-head">
                  🔍 {lang === 'EN' ? 'Search Results' : 'Resulta ng Paghahanap'}
                </header>
                {filteredSearchOptions.map((officeItem) => (
                  <div
                    key={`search-${officeItem.floor}-${officeItem.key}`}
                    className="result-row"
                    onClick={() => handleSearchSelect(officeItem.key, officeItem.floor)}
                  >
                    <span className="result-badge">📍 {officeItem.badge}</span>
                    <span className="result-title">{officeItem.title}</span>
                  </div>
                ))}
              </section>
            )}

            {searchQuery.trim() === "" && showKeyboard && popularSearches.length > 0 && (
              <section className="sb-panel sb-panel--gold">
                <header className="sb-panel-head">
                  🔥 {lang === 'EN' ? 'Frequently Searched' : 'Madalas Hanapin'}
                </header>
                {popularSearches.map((officeItem) => (
                  <div
                    key={`pop-${officeItem.floor}-${officeItem.key}`}
                    className="result-row"
                    onClick={() => handleSearchSelect(officeItem.key, officeItem.floor)}
                  >
                    <span className="result-badge">📍 {officeItem.badge} • 🔍 {officeItem.searchCount || 0}</span>
                    <span className="result-title">{officeItem.title}</span>
                  </div>
                ))}
              </section>
            )}

            {!guide && routeStep === 'idle' && !selectedOfficeKey && (
              <div style={{ display: 'flex', flexDirection: 'column', flexShrink: 0 }}>

                <div className="floor-banner">
                  <div className="floor-banner-row">
                    <div>
                      <h2>{lang === 'EN' ? `Floor ${currentFloor} Directory` : `Direktoryo ng Palapag ${currentFloor}`}</h2>
                      <span className="floor-banner-sub">
                        {lang === 'EN' ? 'Tap an office to see the way' : 'Pindutin ang opisina para sa daan'}
                      </span>
                    </div>
                    <span className="floor-banner-count">{floorOfficeList.length}</span>
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
                        <span className="office-row-badge">{office.badge || `F${currentFloor}`}</span>
                        <span className="office-row-title">{office.title}</span>
                      </button>
                    ))
                  ) : (
                    <div className="sb-empty">
                      <span>🚧</span>
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
                  <span className="floor-badge">{destinationData.badge || `Floor ${destinationData.floor}`}</span>
                </div>

                {/* Sunod agad sa pangalan: ano ang ginagawa ng tanggapang
                    ito. Iyon ang unang tanong ng bisita — nauuna pa ito sa
                    oras at pinuno, kaya nasa itaas ito ng .office-meta. */}
                {destinationData.description && (
                  <div className="office-about">
                    <strong>ℹ️ {lang === 'EN' ? 'About this Office' : 'Tungkol sa Opisina'}</strong>
                    <div className="office-about-body">{destinationData.description}</div>
                  </div>
                )}

                {!destinationData.isDirectionOnly && (
                  <div className="office-meta">
                    <p className="meta-row">
                      <strong>{lang === 'EN' ? 'Status' : 'Estado'}</strong>
                      <StatusPill status={destinationData.status} lang={lang} />
                    </p>
                    <p className="meta-row">🕒 <strong>{lang === 'EN' ? 'Hours' : 'Oras'}</strong> {destinationData.hours}</p>
                    <p className="meta-row">👤 <strong>{lang === 'EN' ? 'Head' : 'Pinuno'}</strong> {destinationData.head}</p>
                  </div>
                )}

                {/* Nasa lumulutang na panel sa gilid ng mapa ang pagpili
                    ng daan — nakatabi sa zoom, katapat ng mismong
                    ruta. Tingnan ang .map-mini-stack sa ibaba. */}

                <div className="qr-card">
                  <span className="qr-title">📱 {lang === 'EN' ? 'Scan for live mobile map' : 'I-scan para sa live mobile map'}</span>
                  <div className="qr-frame">
                    <QRCodeSVG value={`${window.location.origin}/?route=${destinationData.key}&transport=${transportMethod}`} size={130} bgColor={"#ffffff"} fgColor={"#0F172A"} />
                  </div>
                  <span className="qr-note">{lang === 'EN' ? 'The directions continue on your phone.' : 'Magpapatuloy ang direksyon sa iyong phone.'}</span>
                </div>
              </div>
            )}

            {routeStep === 'go-to-transport' && destinationData && (
              <div>
                <div className="route-status">
                  <span className="route-status-icon">📍</span>
                  <h2>{lang === 'EN' ? 'Showing route on the Ground Floor' : 'Ipinapakita ang ruta sa Ground Floor'}</h2>
                  <p>
                    {lang === 'EN' ? 'Please proceed to the ' : 'Pumunta po sa '}
                    {transportMethod === 'elevator' ? 'Elevator' : transportMethod === 'escalator' ? 'Escalator' : 'Stairs'}.
                  </p>
                </div>
                <div className="route-status-step">
                  ⏳ {transportMethod === 'elevator'
                        ? `Going up to Floor ${destinationData.floor}…`
                        : transportMethod === 'escalator'
                          ? 'Taking the escalator to Floor 2…'
                          : 'Walking to the stairs…'}
                </div>
              </div>
            )}

            {routeStep === 'climbing-stairs' && destinationData && (
              <div>
                <div className="route-status route-status--gold">
                  <span className="route-status-icon">🚶</span>
                  <h2>{lang === 'EN' ? 'Climbing stairs…' : 'Umaakyat sa hagdan…'}</h2>
                  <p>{lang === 'EN' ? `Currently passing Floor ${currentFloor}` : `Kasalukuyang nasa Palapag ${currentFloor}`}</p>
                </div>
                <div className="route-status-step">🎯 Target: Floor {destinationData.floor}</div>
              </div>
            )}

            {/* Nasa lumulutang na panel sa gilid ng mapa ang mismong
                gabay (tingnan ang .map-mini-stack). Dito naiiwan ang
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
                      {guideDestination.badge || `Floor ${guide.backTo.floor}`}
                    </span>
                  </div>
                )}

                {/* Ang bilang at ang pagpili ay nasa maliit na kontrol sa
                    tabi ng zoom. Ang sinasabi ng hakbang ay nandito —
                    dito lang kasi may sapat na lapad para mabasa ito. */}
                <div className="guide-now">
                  <span className="guide-now-icon">{guide.steps[guide.index].icon}</span>
                  <h2>{guide.steps[guide.index].title}</h2>
                  <p>{guide.steps[guide.index].body}</p>
                </div>

                <button className="guide-done" onClick={closeGuide}>
                  ✓ {lang === 'EN' ? 'Done — back to the office' : 'Tapos na — balik sa opisina'}
                </button>
              </div>
            )}

            {!guide && (routeStep === 'arrived' || (routeStep === 'idle' && selectedOfficeKey && selectedOfficeKey !== 'elevator-up' && selectedOfficeKey !== 'stairs-up')) && selectedOffice && (
              <div className="sb-detail">
                <div className="sb-detail-actions">
                  <button
                    className="back-to-list-btn"
                    onClick={() => { setSelectedOfficeKey(null); setRouteStep('idle'); setDestinationData(null); }}
                  >
                    ⬅️ {lang === 'EN' ? `Floor ${currentFloor} list` : `Palapag ${currentFloor}`}
                  </button>

                  {/* Sa mga opisinang nasa itaas lang may dinaanang palapag
                      na puwedeng balikan. Sa ground floor, walang laman ito. */}
                  {currentFloor > 1 && (
                    <button className="guide-open-btn" onClick={openGuide}>
                      🧭 {lang === 'EN' ? 'Step-by-step' : 'Hakbang-hakbang'}
                    </button>
                  )}
                </div>

                <div className="destination-card">
                  <p className="label">{lang === 'EN' ? 'Destination' : 'Paroroonan'}</p>
                  <h1 className="office-title">{selectedOffice.title}</h1>
                  <span className="floor-badge">{selectedOffice.badge}</span>
                </div>

                {/* Tingnan ang nasa itaas: sunod sa pangalan ang paliwanag
                    tungkol sa tanggapan, bago ang estado at oras. */}
                {selectedOffice.description && (
                  <div className="office-about">
                    <strong>ℹ️ {lang === 'EN' ? 'About this Office' : 'Tungkol sa Opisina'}</strong>
                    <div className="office-about-body">{selectedOffice.description}</div>
                  </div>
                )}

                {selectedOffice.isDirectionOnly ? (
                  <div className="wayfinding-note">
                    🚶 <strong>{lang === 'EN' ? 'Wayfinding path generated.' : 'Nakahanda na ang daan.'}</strong>{' '}
                    {lang === 'EN'
                      ? 'Please follow the highlighted path on the map.'
                      : 'Sundan po ang linyang nakahighlight sa mapa.'}
                  </div>
                ) : (
                  <div className="office-meta">
                    <p className="meta-row">
                      <strong>{lang === 'EN' ? 'Status' : 'Estado'}</strong>
                      <StatusPill status={selectedOffice.status} lang={lang} />
                    </p>
                    <p className="meta-row">🕒 <strong>{lang === 'EN' ? 'Hours' : 'Oras'}</strong> {selectedOffice.hours}</p>
                    <p className="meta-row">👤 <strong>{lang === 'EN' ? 'Head' : 'Pinuno'}</strong> {selectedOffice.head}</p>
                  </div>
                )}

                <div className="qr-card">
                  <span className="qr-title">📱 {lang === 'EN' ? 'Scan for live mobile map' : 'I-scan para sa live mobile map'}</span>
                  <div className="qr-frame">
                    <QRCodeSVG value={`${window.location.origin}/?route=${selectedOfficeKey}&transport=${transportMethod}`} size={130} bgColor={"#ffffff"} fgColor={"#0F172A"} />
                  </div>
                  <span className="qr-note">{lang === 'EN' ? 'The directions continue on your phone.' : 'Magpapatuloy ang direksyon sa iyong phone.'}</span>
                </div>
              </div>
            )}
          </div>
        </aside>

        <MapScreen 
          offices={liveOfficeDatabase[currentFloor]} 
          selectedOfficeKey={selectedOfficeKey}
          onSelectOffice={(key) => handleSelectOffice(key, currentFloor)}
          currentFloor={currentFloor}
          setCurrentFloor={setCurrentFloor} 
          setSelectedOfficeKey={setSelectedOfficeKey} 
          transportMethod={transportMethod}
          routeStep={routeStep}
          kioskLabel={guideKioskLabel}
        />

        {/* ── Maliliit na kontrol sa gilid ng mapa ───────────────────
            Kasinlaki at kasinghugis ng zoom, nakapatong lang sa ilalim
            nito. Ang mga pagpipilian ang nandito — ang mahabang teksto
            ay nasa sidebar, kung saan may lugar para dito. */}
        <div className="map-mini-stack">

          {routeStep === 'choose-transport' && destinationData && (
            <div className="map-mini">
              <span className="mini-cap">{lang === 'EN' ? 'Route' : 'Daan'}</span>

              <button
                className="mini-btn"
                onClick={() => { setSelectedOfficeKey('elevator-up'); setTransportMethod('elevator'); setRouteStep('go-to-transport'); }}
              >
                <span className="mini-ico">🛗</span>
                <span className="mini-txt">Elevator</span>
              </button>

              {destinationData.floor === 2 && (
                <button
                  className="mini-btn"
                  onClick={() => { setSelectedOfficeKey('elevator-up'); setTransportMethod('escalator'); setRouteStep('go-to-transport'); }}
                >
                  <span className="mini-ico">🪜</span>
                  <span className="mini-txt">Escalator</span>
                </button>
              )}

              <button
                className="mini-btn"
                onClick={() => { setSelectedOfficeKey('stairs-up'); setTransportMethod('stairs'); setRouteStep('go-to-transport'); }}
              >
                <span className="mini-ico">🚶</span>
                <span className="mini-txt">Stairs</span>
              </button>

              <button
                className="mini-x"
                onClick={() => { setRouteStep('idle'); setDestinationData(null); }}
                title={lang === 'EN' ? 'Cancel navigation' : 'Kanselahin'}
              >
                ✕
              </button>
            </div>
          )}

          {guide && (
            <div className="map-mini">
              <span className="mini-cap">{guide.index + 1}/{guide.steps.length}</span>

              {/* Isang pindutan bawat palapag na dadaanan. Mapipindot ang
                  kahit alin — ito ang pagbalik sa isang palapag nang
                  hindi paulit-ulit ang pag-atras. */}
              <div className="mini-steps">
                {guide.steps.map((s, i) => (
                  <button
                    key={`${s.floor}-${i}`}
                    className={`mini-step${i === guide.index ? ' is-now' : ''}${i < guide.index ? ' is-done' : ''}`}
                    onClick={() => goToGuideStep(i)}
                    title={s.title}
                  >
                    {s.floor === 1 ? 'GF' : s.floor}
                  </button>
                ))}
              </div>

              <div className="mini-nav">
                <button
                  className="mini-nav-btn"
                  disabled={guide.index === 0}
                  onClick={() => goToGuideStep(guide.index - 1)}
                  title={lang === 'EN' ? 'Previous' : 'Bumalik'}
                >
                  ⬅
                </button>
                <button
                  className="mini-nav-btn"
                  disabled={guide.index === guide.steps.length - 1}
                  onClick={() => goToGuideStep(guide.index + 1)}
                  title={lang === 'EN' ? 'Next' : 'Susunod'}
                >
                  ➡
                </button>
              </div>

              <button className="mini-x" onClick={closeGuide} title={lang === 'EN' ? 'Done' : 'Tapos na'}>
                ✕
              </button>
            </div>
          )}
        </div>

        {searchParams.get('route') && (
          <div className="screenshot-hint">
            <strong>📸 Take a screenshot</strong>
            <span>Session expires when the screen is locked or idle.</span>
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
                    : key === 'CLEAR' ? ' kb-key--clear' : '';
                  return (
                    <button key={key} className={`kb-key${modifier}`} onClick={() => handleVirtualKeyPress(key)}>
                      {key === 'BACKSPACE' ? '⌫ Delete' : (key === 'SPACE' ? 'Space' : key)}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}

      </div>

      {showAbout && (
        <div className="k-overlay" onClick={() => setShowAbout(false)}>
          <div className="k-modal" onClick={(e) => e.stopPropagation()}>

            <div className="k-modal-head">
              <div>
                <span className="k-modal-eyebrow">Tagaytay City Hall</span>
                <h2 className="k-modal-title">About the Kiosk</h2>
              </div>
              <button className="k-close" onClick={() => setShowAbout(false)}>✕</button>
            </div>

            <p className="k-modal-text k-modal-text--justify">
              This Interactive Directory Kiosk was developed by 4th-year Bachelor of Science in
              Information Technology (BSIT) students from the City College of Tagaytay. Our goal is
              to enhance public service by providing an accessible, easy-to-use digital mapping
              system that helps citizens seamlessly locate offices and navigate the City Hall.
            </p>

            <div className="k-roster">
              <h3 className="k-roster-title">The Development Team</h3>

              <div className="k-roster-row">
                <span className="k-roster-name">Franz Jandrei Valderama</span>
                <span className="k-roster-role">Full Stack Developer</span>
              </div>
              <div className="k-roster-row">
                <span className="k-roster-name">Neftali Luya</span>
                <span className="k-roster-role">Front End Developer</span>
              </div>
              <div className="k-roster-row">
                <span className="k-roster-name">Ricalyn Mereyes</span>
                <span className="k-roster-role k-roster-role--alt">Main Documentation</span>
              </div>
              <div className="k-roster-row">
                <span className="k-roster-name">Marlon Panganiban</span>
                <span className="k-roster-role k-roster-role--alt">Documentation</span>
              </div>
            </div>

            <img src={tagaytaySeal} alt="City College of Tagaytay" className="k-modal-seal" />
          </div>
        </div>
      )}

      {showRecoveryModal && (
        <div className="k-overlay">
          <div className="k-modal k-modal--sm" ref={authModalRef} style={{ textAlign: 'center' }}>
            <span className="k-modal-icon" style={{ margin: '0 auto 16px' }}>🔑</span>
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
              const hasUpper = /[A-Z]/.test(recoveryPassword);
              const hasLower = /[a-z]/.test(recoveryPassword);
              const hasNumber = /\d/.test(recoveryPassword);
              if (recoveryPassword.length < 6 || !hasUpper || !hasLower || !hasNumber) {
                return alert(lang === 'EN'
                  ? '❌ Weak Password:\n\nPassword must be at least 6 characters long and include:\n- At least 1 Uppercase letter\n- At least 1 Lowercase letter\n- At least 1 Number'
                  : '❌ Mahinang Password:\n\nKailangang hindi bababa sa 6 na karakter ang password at may kasamang:\n- Kahit 1 malaking letra\n- Kahit 1 maliit na letra\n- Kahit 1 numero');
              }
              try {
                setIsLoggingIn(true);
                await changeAdminPassword(recoveryPassword);
                alert(lang === 'EN'
                  ? '✅ Password successfully changed! You can now login.'
                  : '✅ Matagumpay na napalitan ang password! Maaari na kayong mag-login.');
                setShowRecoveryModal(false);
                setRecoveryPassword('');
                await logoutAdmin(); 
                setShowAdminLogin(true); 
              } catch (err) {
                alert(lang === 'EN'
                  ? '❌ Failed to update password. Link might be expired.'
                  : '❌ Hindi na-update ang password. Baka expired na ang link.');
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
                    ? 'Min 6 chars, 1 uppercase, 1 number'
                    : 'Hindi bababa sa 6 na karakter, 1 malaking letra, 1 numero'}
                  autoFocus
                  required
                />
                <button type="button" className="k-eye" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>

              <button type="submit" className="k-btn k-btn--ok" disabled={isLoggingIn}>
                {lang === 'EN'
                  ? (isLoggingIn ? 'Saving…' : '💾 Save New Password')
                  : (isLoggingIn ? 'Sine-save…' : '💾 I-save ang Bagong Password')}
              </button>

            </form>
          </div>
        </div>
      )}

      {showAdminLogin && (
        <div className="k-overlay">
          <div className="k-modal k-modal--sm" ref={authModalRef} style={{ textAlign: 'center' }}>
            <span className="k-modal-icon" style={{ margin: '0 auto 16px' }}>🔒</span>
            <h2 className="k-modal-title" style={{ marginBottom: '10px' }}>
              {lang === 'EN' ? 'Admin Access' : 'Pagpasok ng Admin'}
            </h2>
            <p className="k-modal-text k-modal-text--center">
              {lang === 'EN'
                ? 'Enter the password for tagaytaykiosk@gmail.com'
                : 'Ilagay ang password para sa tagaytaykiosk@gmail.com'}
            </p>

            <form onSubmit={handleAdminLogin}>

              <div className="k-field k-input-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  className="k-input"
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  placeholder={lang === 'EN' ? 'Enter password…' : 'Ilagay ang password…'}
                  autoFocus
                />
                <button
                  type="button"
                  className="k-eye"
                  onClick={() => setShowPassword(!showPassword)}
                  title={lang === 'EN'
                    ? (showPassword ? 'Hide password' : 'Show password')
                    : (showPassword ? 'Itago ang password' : 'Ipakita ang password')}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>

              <div className="k-btn-row" style={{ marginBottom: '14px' }}>
                <button
                  type="button"
                  className="k-btn k-btn--ghost"
                  onClick={() => { setShowAdminLogin(false); setAdminPasswordInput(''); setShowPassword(false); }}
                >
                  {lang === 'EN' ? 'Cancel' : 'Kanselahin'}
                </button>
                <button type="submit" className="k-btn k-btn--primary" disabled={isLoggingIn}>
                  {lang === 'EN'
                    ? (isLoggingIn ? 'Checking…' : 'Login')
                    : (isLoggingIn ? 'Sinusuri…' : 'Mag-login')}
                </button>
              </div>

              <button type="button" className="k-btn k-btn--link" onClick={handleForgotPassword}>
                {lang === 'EN'
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
    </div>
  );
}