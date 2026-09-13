import React, { useState, useEffect } from 'react';
import tagaytaySeal from './assets/tagaytay-seal.jpg';
import WelcomeScreen from './WelcomeScreen';
import DashboardScreen from './DashboardScreen';
import DirectoryScreen from './DirectoryScreen';
import MapScreen from './components/MapScreen';
import AdminPanel from './admin/AdminPanel';
import './index.css';

import { QRCodeSVG } from 'qrcode.react'; 
import { useSearchParams } from 'react-router-dom';

import { getAllOffices, initializeDatabase, incrementSearchCount, loginAdmin, resetPasswordEmail, logoutAdmin, onAuthChange, changeAdminPassword } from './lib/api';
import { coordinateMapping, mergeOfficeData } from './lib/coordinateMapping';
import { defaultOfficeData } from './lib/defaultOfficeData';
import { isRecoveryLink } from './lib/recoveryFlag';

const serviceGuidesConfig = [
  {
    id: 'business-permit',
    icon: '💼',
    titleEn: 'Business Permit',
    titleTl: 'Business Permit',
    isExternal: true, 
    locationTextEn: 'Please proceed to the BPLO at the Annex Building (Old City Hall). This is located outside the main building.',
    locationTextTl: 'Mangyaring pumunta sa BPLO sa Annex Building (Lumang City Hall). Ito ay nasa labas ng gusaling ito.',
    requirements: []
  },
  {
    id: 'building-permit',
    icon: '🏗️',
    titleEn: 'Building Permit',
    titleTl: 'Building Permit',
    isExternal: false, 
    floor: 3, 
    dbKey: 'building-official', 
    locationTextEn: 'Please proceed to the Office of the Building Official (OBO), 3rd Floor.',
    locationTextTl: 'Mangyaring pumunta sa Office of the Building Official (OBO), Ika-3 Palapag.',
    requirements: []
  },
  {
    id: 'tax-dec',
    icon: '📄',
    titleEn: 'Tax Declaration',
    titleTl: 'Tax Declaration',
    isExternal: false, 
    floor: 3, 
    dbKey: 'treasure-office', 
    locationTextEn: 'Please proceed to the Assessor / City Treasurer Office, 3rd Floor.',
    locationTextTl: 'Mangyaring pumunta sa Assessor / City Treasurer Office, Ika-3 Palapag.',
    requirements: []
  }
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
  const [is3DActive, setIs3DActive] = useState(false);
  const [time, setTime] = useState("--:-- --");
  
  const [selectedOfficeKey, setSelectedOfficeKey] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const [lang, setLang] = useState('EN');     
  const [textSize, setTextSize] = useState('normal'); 

  const [showAdmin, setShowAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false); 
  const [adminPasswordInput, setAdminPasswordInput] = useState(''); 
  const [showPassword, setShowPassword] = useState(false); 
  
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryPassword, setRecoveryPassword] = useState('');

  const [secretClicks, setSecretClicks] = useState(0);
  const [showAbout, setShowAbout] = useState(false); 

  const [routeStep, setRouteStep] = useState('idle'); 
  const [destinationData, setDestinationData] = useState(null);
  const [transportMethod, setTransportMethod] = useState(() => searchParams.get('transport') || 'elevator');

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
        setSelectedService(null);
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
      alert('❌ Access Denied: Incorrect Password or Network Error.');
      setAdminPasswordInput('');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleForgotPassword = async () => {
    try {
      await resetPasswordEmail('tagaytaykiosk@gmail.com');
      alert('✅ Recovery link sent to tagaytaykiosk@gmail.com!\n\nPlease check the Gmail inbox to set a new password.');
    } catch (error) {
      // Dati ay laging "internet connection" ang sinasabi nito kahit ano pa
      // ang tunay na dahilan — kaya mahirap i-debug. Ipakita ang totoo.
      const code = error?.code || error?.error_code || '';
      const isRateLimited = code === 'over_email_send_rate_limit' || error?.status === 429;

      if (isRateLimited) {
        alert(
          '⏳ Too many reset requests.\n\n' +
          'May limitasyon ang Supabase sa dami ng email na maipapadala kada oras, ' +
          'at naabot na ito. Maghintay ng mga isang oras bago subukan ulit.\n\n' +
          '(Supabase: email rate limit exceeded)'
        );
        return;
      }

      alert(
        '❌ Failed to send reset email.\n\n' +
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
            title={lang === 'EN' ? 'Larger text' : 'Mas malaking teksto'}
          >
            <span className="hdr-btn-glyph">🔠</span>
            <span className="hdr-btn-label">{isLarge ? 'A+' : 'A'}</span>
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

            {routeStep === 'idle' && !selectedOfficeKey && (
              <div style={{ display: 'flex', flexDirection: 'column', flexShrink: 0 }}>

                <div className="sb-section">
                  <h3 className="sidebar-heading">
                    📋 {lang === 'EN' ? 'Quick Service Guides' : 'Mabilisang Serbisyo'}
                  </h3>
                  <div className="service-grid">
                    {serviceGuidesConfig.map((service, idx) => (
                      <button key={idx} className="service-tile" onClick={() => setSelectedService(service)}>
                        <span className="service-icon">{service.icon}</span>
                        <span className="service-name">
                          {lang === 'EN' ? service.titleEn : service.titleTl}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

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

                <div className="transport-card">
                  <h3>
                    {destinationData.floor === 2
                      ? (lang === 'EN' ? 'Choose your route' : 'Piliin ang daan papunta')
                      : (lang === 'EN' ? 'Elevator or stairs?' : 'Elevator o hagdan?')}
                  </h3>
                  <div className="transport-grid">
                    <button
                      className="transport-btn"
                      onClick={() => { setSelectedOfficeKey('elevator-up'); setTransportMethod('elevator'); setRouteStep('go-to-transport'); }}
                    >
                      <span>🛗</span><span>Elevator</span>
                    </button>

                    {destinationData.floor === 2 && (
                      <button
                        className="transport-btn"
                        onClick={() => { setSelectedOfficeKey('elevator-up'); setTransportMethod('escalator'); setRouteStep('go-to-transport'); }}
                      >
                        <span>🪜</span><span>Escalator</span>
                      </button>
                    )}

                    <button
                      className="transport-btn"
                      onClick={() => { setSelectedOfficeKey('stairs-up'); setTransportMethod('stairs'); setRouteStep('go-to-transport'); }}
                    >
                      <span>🚶</span><span>Stairs</span>
                    </button>
                  </div>
                  <button className="transport-cancel" onClick={() => { setRouteStep('idle'); setDestinationData(null); }}>
                    {lang === 'EN' ? 'Cancel navigation' : 'Kanselahin ang direksyon'}
                  </button>
                </div>

                {destinationData.description && (
                  <div className="office-about">
                    <strong>ℹ️ {lang === 'EN' ? 'About this Office' : 'Tungkol sa Opisina'}</strong>
                    <div className="office-about-body">{destinationData.description}</div>
                  </div>
                )}

                <div className="qr-card">
                  <span className="qr-title">📱 {lang === 'EN' ? 'Scan for live mobile map' : 'I-scan para sa live mobile map'}</span>
                  <div className="qr-frame">
                    <QRCodeSVG value={`${window.location.origin}/?route=${destinationData.key}&transport=${transportMethod}`} size={130} bgColor={"#ffffff"} fgColor={"#0F172A"} />
                  </div>
                  <span className="qr-note">Magpapatuloy ang direksyon sa iyong phone.</span>
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

            {(routeStep === 'arrived' || (routeStep === 'idle' && selectedOfficeKey && selectedOfficeKey !== 'elevator-up' && selectedOfficeKey !== 'stairs-up')) && selectedOffice && (
              <div className="sb-detail">
                <button
                  className="back-to-list-btn"
                  onClick={() => { setSelectedOfficeKey(null); setRouteStep('idle'); setDestinationData(null); }}
                >
                  ⬅️ {lang === 'EN' ? `Back to Floor ${currentFloor} list` : `Balik sa listahan ng Palapag ${currentFloor}`}
                </button>

                <div className="destination-card">
                  <p className="label">{lang === 'EN' ? 'Destination' : 'Paroroonan'}</p>
                  <h1 className="office-title">{selectedOffice.title}</h1>
                  <span className="floor-badge">{selectedOffice.badge}</span>
                </div>

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

                {selectedOffice.description && (
                  <div className="office-about">
                    <strong>ℹ️ {lang === 'EN' ? 'About this Office' : 'Tungkol sa Opisina'}</strong>
                    <div className="office-about-body">{selectedOffice.description}</div>
                  </div>
                )}

                <div className="qr-card">
                  <span className="qr-title">📱 {lang === 'EN' ? 'Scan for live mobile map' : 'I-scan para sa live mobile map'}</span>
                  <div className="qr-frame">
                    <QRCodeSVG value={`${window.location.origin}/?route=${selectedOfficeKey}&transport=${transportMethod}`} size={130} bgColor={"#ffffff"} fgColor={"#0F172A"} />
                  </div>
                  <span className="qr-note">Magpapatuloy ang direksyon sa iyong phone.</span>
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
          is3DActive={is3DActive}
          setIs3DActive={setIs3DActive}
          transportMethod={transportMethod} 
          routeStep={routeStep}
        />

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

      {selectedService && (
        <div className="k-overlay" onClick={() => setSelectedService(null)}>
          <div className="k-modal" onClick={(e) => e.stopPropagation()}>

            <div className="k-modal-head">
              <div>
                <span className="k-modal-icon">{selectedService.icon}</span>
                <span className="k-modal-eyebrow">{lang === 'EN' ? 'Service guide' : 'Gabay sa serbisyo'}</span>
                <h2 className="k-modal-title">
                  {lang === 'EN' ? selectedService.titleEn : selectedService.titleTl}
                </h2>
              </div>
              <button className="k-close" onClick={() => setSelectedService(null)}>✕</button>
            </div>

            <div className={`k-callout${selectedService.isExternal ? ' k-callout--alert' : ''}`}>
              <span className="k-callout-glyph">{selectedService.isExternal ? '🏛️' : '📍'}</span>
              {lang === 'EN' ? selectedService.locationTextEn : selectedService.locationTextTl}
            </div>

            <div style={{ marginTop: '22px' }}>
              {selectedService.isExternal ? (
                <button className="k-btn k-btn--ok" onClick={() => setSelectedService(null)}>
                  👍 {lang === 'EN' ? 'Got it, thank you!' : 'Sige po, salamat!'}
                </button>
              ) : (
                <button
                  className="k-btn k-btn--primary"
                  onClick={() => {
                    handleSelectOffice(selectedService.dbKey, selectedService.floor);
                    setSelectedService(null);
                  }}
                >
                  🗺️ {lang === 'EN' ? 'Show me the way' : 'Ituro ang daan sa mapa'}
                </button>
              )}
            </div>

          </div>
        </div>
      )}

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

            <p className="k-modal-text">
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
          <div className="k-modal k-modal--sm" style={{ textAlign: 'center' }}>
            <span className="k-modal-icon" style={{ margin: '0 auto 16px' }}>🔑</span>
            <h2 className="k-modal-title" style={{ marginBottom: '10px' }}>Set New Password</h2>
            <p className="k-modal-text k-modal-text--center">Enter your new master password below.</p>

            <form onSubmit={async (e) => {
              e.preventDefault();
              const hasUpper = /[A-Z]/.test(recoveryPassword);
              const hasLower = /[a-z]/.test(recoveryPassword);
              const hasNumber = /\d/.test(recoveryPassword);
              if (recoveryPassword.length < 6 || !hasUpper || !hasLower || !hasNumber) {
                return alert('❌ Weak Password:\n\nPassword must be at least 6 characters long and include:\n- At least 1 Uppercase letter\n- At least 1 Lowercase letter\n- At least 1 Number');
              }
              try {
                setIsLoggingIn(true);
                await changeAdminPassword(recoveryPassword);
                alert('✅ Password successfully changed! You can now login.');
                setShowRecoveryModal(false);
                setRecoveryPassword('');
                await logoutAdmin(); 
                setShowAdminLogin(true); 
              } catch (err) {
                alert('❌ Failed to update password. Link might be expired.');
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
                  placeholder="Min 6 chars, 1 uppercase, 1 number"
                  autoFocus
                  required
                />
                <button type="button" className="k-eye" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>

              <button type="submit" className="k-btn k-btn--ok" disabled={isLoggingIn}>
                {isLoggingIn ? 'Saving…' : '💾 Save New Password'}
              </button>

            </form>
          </div>
        </div>
      )}

      {showAdminLogin && (
        <div className="k-overlay">
          <div className="k-modal k-modal--sm" style={{ textAlign: 'center' }}>
            <span className="k-modal-icon" style={{ margin: '0 auto 16px' }}>🔒</span>
            <h2 className="k-modal-title" style={{ marginBottom: '10px' }}>Admin Access</h2>
            <p className="k-modal-text k-modal-text--center">Enter the password for tagaytaykiosk@gmail.com</p>

            <form onSubmit={handleAdminLogin}>

              <div className="k-field k-input-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  className="k-input"
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  placeholder="Enter password…"
                  autoFocus
                />
                <button
                  type="button"
                  className="k-eye"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide password" : "Show password"}
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
                  Cancel
                </button>
                <button type="submit" className="k-btn k-btn--primary" disabled={isLoggingIn}>
                  {isLoggingIn ? 'Checking…' : 'Login'}
                </button>
              </div>

              <button type="button" className="k-btn k-btn--link" onClick={handleForgotPassword}>
                Forgot password? Send reset link
              </button>

            </form>
          </div>
        </div>
      )}

      {showAdmin && <AdminPanel officeDatabase={liveOfficeDatabase} onClose={() => setShowAdmin(false)} onDataUpdate={() => { fetchKioskData(); }} />}
    </div>
  );
}