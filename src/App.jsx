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

import { getAllOffices, initializeDatabase, incrementSearchCount } from './lib/api';
import { coordinateMapping, mergeOfficeData } from './lib/coordinateMapping';
import { defaultOfficeData } from './lib/defaultOfficeData';

// ==============================================================
// BAGO: SERVICE GUIDES CONFIGURATION (Para sa Sidebar)
// ==============================================================
const serviceGuidesConfig = [
  {
    id: 'business-permit',
    icon: '💼',
    titleEn: 'Business Permit',
    titleTl: 'Business Permit',
    isExternal: true, // Annex (Walang Map Route)
    locationTextEn: 'Please proceed to the BPLO at the Annex Building (Old City Hall). This is located outside the main building.',
    locationTextTl: 'Mangyaring pumunta sa BPLO sa Annex Building (Lumang City Hall). Ito ay nasa labas ng gusaling ito.',
    requirements: [
      '1. DTI / SEC / CDA Registration',
      '2. Barangay Clearance for Business',
      '3. Contract of Lease (if renting) or Land Title',
      '4. Picture of Business Establishment'
    ]
  },
  {
    id: 'building-permit',
    icon: '🏗️',
    titleEn: 'Building Permit',
    titleTl: 'Building Permit',
    isExternal: false, // Nasa Main Building (May Map Route)
    floor: 3, 
    dbKey: 'building-official', 
    locationTextEn: 'Please proceed to the Office of the Building Official (OBO), 3rd Floor.',
    locationTextTl: 'Mangyaring pumunta sa Office of the Building Official (OBO), Ika-3 Palapag.',
    requirements: [
      '1. 5 Sets of Architectural/Engineering Plans',
      '2. Barangay Clearance for Construction',
      '3. Certified True Copy of Transfer Certificate of Title (TCT)',
      '4. Tax Declaration and Latest Tax Receipt'
    ]
  },
  {
    id: 'tax-dec',
    icon: '📄',
    titleEn: 'Tax Declaration',
    titleTl: 'Tax Declaration',
    isExternal: false, // Nasa Main Building (May Map Route)
    floor: 3, 
    dbKey: 'treasure-office', 
    locationTextEn: 'Please proceed to the Assessor / City Treasurer Office, 3rd Floor.',
    locationTextTl: 'Mangyaring pumunta sa Assessor / City Treasurer Office, Ika-3 Palapag.',
    requirements: [
      '1. Valid Government ID of the property owner',
      '2. Latest Real Property Tax Receipt',
      '3. Notarized Authorization Letter (if representative)',
      '4. Copy of Land Title (TCT)'
    ]
  }
];

export default function App() {
  const [liveOfficeDatabase, setLiveOfficeDatabase] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // SECURITY STATES
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
  
  const [selectedService, setSelectedService] = useState(null); // BAGO: State para sa Service Popup

  const [lang, setLang] = useState('EN');     
  const [textSize, setTextSize] = useState('normal'); 

  const [showAdmin, setShowAdmin] = useState(false);
  const [secretClicks, setSecretClicks] = useState(0);

  const [routeStep, setRouteStep] = useState('idle'); 
  const [destinationData, setDestinationData] = useState(null);
  const [transportMethod, setTransportMethod] = useState('elevator');

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const authorized = localStorage.getItem('kiosk_authorized');
    const key = searchParams.get('key');
    const routeKey = searchParams.get('route'); 
    
    if (authorized === 'true') {
      setIsAuthorized(true);
    } else if (key === 'cct-bsit-kiosk') { 
      localStorage.setItem('kiosk_authorized', 'true');
      setIsAuthorized(true);
    } else if (routeKey) {
      setIsAuthorized(true);
    }
  }, [searchParams]);

 // ==============================================================
  // BAGO: SELF-DESTRUCT & ANTI-IDLE LOGIC PARA SA PHONES (ANTI-REFRESH)
  // ==============================================================
  useEffect(() => {
    const routeKey = searchParams.get('route');
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 1024;

    if (isMobile && routeKey) {
      // 1. Pagka-load o pagka-refresh ng page, check agad sa browser memory kung na-flag na siyang expired!
      if (sessionStorage.getItem('mobile_session_expired') === 'true') {
        setIsMobileSessionExpired(true);
        return; // I-stop agad ang code, wag nang i-load ang map!
      }

      // 2. Function para i-lock at i-save sa browser memory yung pagka-expire
      const triggerSelfDestruct = () => {
        setIsMobileSessionExpired(true);
        sessionStorage.setItem('mobile_session_expired', 'true'); // Isusulat sa memory ng phone na hindi nabubura sa refresh!
      };

      // 3. Kapag pinatay ang screen o ni-minimize ang browser
      const handleVisibilityChange = () => {
        if (document.hidden) {
          triggerSelfDestruct();
        }
      };
      document.addEventListener("visibilitychange", handleVisibilityChange);

      // 4. Kapag walang ginagawa (idle) ng 5 minuto
      let idleTimeout;
      const resetIdleTimer = () => {
        clearTimeout(idleTimeout);
        idleTimeout = setTimeout(() => {
          triggerSelfDestruct();
        }, 300000); // 300000 ms = 5 minutes
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
    if (routeKey && Object.keys(liveOfficeDatabase).length > 0) {
      let foundFloor = null;
      Object.entries(liveOfficeDatabase).forEach(([floorNum, offices]) => {
        if (offices[routeKey]) foundFloor = parseInt(floorNum);
      });

      if (foundFloor) {
        setAppState('map');
        setCurrentFloor(foundFloor);
        setSelectedOfficeKey(routeKey);
        setRouteStep('arrived');
      }
    }
  }, [searchParams, liveOfficeDatabase]);

  const fetchKioskData = async () => {
    try {
      const dbData = await getAllOffices();
      const completeData = mergeOfficeData(coordinateMapping, dbData);
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
    if (secretClicks + 1 >= 5) { setShowAdmin(true); setSecretClicks(0); } 
    else { setSecretClicks(prev => prev + 1); setTimeout(() => setSecretClicks(0), 3000); }
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

  // 1. Unang step: Pag-alis sa Ground Floor
  useEffect(() => {
    let timeoutId;
    if (routeStep === 'go-to-transport' && destinationData) {
      if (transportMethod === 'elevator') {
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

  // 2. Pangalawang step: Ang tuloy-tuloy na pag-akyat per floor (Stairs Loop)
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
    off.title.toLowerCase().includes(searchQuery.toLowerCase())
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
      const newData = { ...prev };
      if (newData[floor] && newData[floor][key]) {
        newData[floor][key].searchCount = (newData[floor][key].searchCount || 0) + 1;
      }
      return newData;
    });
  };

  const selectedOffice = selectedOfficeKey ? liveOfficeDatabase[currentFloor]?.[selectedOfficeKey] : null;

  const handleVirtualKeyPress = (key) => {
    if (key === 'BACKSPACE') setSearchQuery(prev => prev.slice(0, -1));
    else if (key === 'SPACE') setSearchQuery(prev => prev + ' ');
    else if (key === 'CLEAR') setSearchQuery('');
    else setSearchQuery(prev => prev + key);
  };

  // ==============================================================
  // RENDER BLOCKS
  // ==============================================================
  
  if (isMobileSessionExpired) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#FFFFFF', color: '#0F172A', textAlign: 'center', padding: '30px' }}>
        <span style={{ fontSize: '5rem', marginBottom: '20px' }}>⏱️</span>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#E11D48', margin: '0 0 15px 0' }}>Session Expired</h2>
        <p style={{ fontSize: '1.1rem', color: '#475569', maxWidth: '400px', fontWeight: 600, lineHeight: '1.6', margin: 0 }}>
          For security purposes, this mobile map link has self-destructed because you minimized the app or turned off your screen.
          <br/><br/>
          Please return to the Tagaytay City Hall Directory Kiosk and scan the QR code again.
        </p>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0F172A', color: 'white', textAlign: 'center', padding: '20px' }}>
        <h1 style={{ fontSize: '5rem', margin: 0 }}>🔒</h1>
        <h2 style={{ fontSize: '2.5rem', marginTop: '20px' }}>System Locked</h2>
        <p style={{ color: '#94A3B8', fontSize: '1.2rem', maxWidth: '500px', lineHeight: '1.6' }}>
          This system is restricted and can only be accessed from the physical Tagaytay City Hall Kiosk Terminal.
        </p>
      </div>
    );
  }

  if (isLoading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#F8FAFC', color: '#0F172A', fontSize: '2rem', fontWeight: 'bold' }}>Initializing Kiosk Systems...</div>;
  
  if (appState === 'welcome') return <WelcomeScreen onStart={() => setAppState('map')} />;

  const isDarkMode = theme === 'dark';
  const isLarge = textSize === 'large';

  const colorPalette = {
    headerBg: isDarkMode ? '#1E1B4B' : '#FFFFFF',
    primaryText: isDarkMode ? '#FFFFFF' : '#0F172A',
    secondaryText: isDarkMode ? '#94A3B8' : '#64748B',
    cardBorder: isDarkMode ? '2px solid #475569' : '2px solid #E2E8F0',
    buttonAccentBg: isDarkMode ? '#334155' : '#EEF2FF',
    accentText: isDarkMode ? '#F59E0B' : '#B45309'
  };

  const keyboardRows = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', '-'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'CLEAR', 'BACKSPACE'],
    ['SPACE']
  ];

  return (
    <div className={`map-screen-container ${theme}-theme`} style={{ backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      <header className="dir-header" style={{ backgroundColor: colorPalette.headerBg, borderBottom: colorPalette.cardBorder, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', minHeight: '110px', boxSizing: 'border-box', width: '100%' }}>
        <div className="dir-header-left" onClick={handleLogoTap} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <img src={tagaytaySeal} alt="Tagaytay Seal" style={{ width: '65px', height: '65px', borderRadius: '50%', objectFit: 'contain', backgroundColor: 'white', padding: '4px' }} />
          <div className="dir-titles" style={{ marginLeft: '10px' }}>
            <span className="dir-subtitle" style={{ color: colorPalette.accentText, fontSize: isLarge ? '1.1rem' : '0.9rem', fontWeight: 900, letterSpacing: '1px' }}>{lang === 'EN' ? 'REPUBLIC OF THE PHILIPPINES' : 'REPUBLIKA NG PILIPINAS'}</span>
            <h2 className="dir-title" style={{ color: colorPalette.primaryText, fontSize: isLarge ? '2rem' : '1.7rem', fontWeight: 900, margin: 0 }}>Tagaytay City Hall</h2>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button onClick={() => setTextSize(textSize === 'normal' ? 'large' : 'normal')} style={{ background: isLarge ? '#4F46E5' : colorPalette.buttonAccentBg, color: isLarge ? 'white' : '#4F46E5', border: isLarge ? 'none' : '2px solid #4F46E5', width: '60px', height: '60px', borderRadius: '50%', fontWeight: 900, fontSize: '1.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>{isLarge ? 'A+' : 'A'}</button>
          <button onClick={() => setLang(lang === 'EN' ? 'TL' : 'EN')} style={{ background: colorPalette.buttonAccentBg, color: '#4F46E5', border: '2px solid #4F46E5', padding: '0 24px', height: '60px', borderRadius: '50px', fontWeight: 900, fontSize: isLarge ? '1.2rem' : '1.05rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>🌐 {lang === 'EN' ? 'English' : 'Tagalog'}</button>
          <button className="ui-action-btn theme-toggle-btn" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} style={{ height: '60px', background: colorPalette.buttonAccentBg, color: '#4F46E5', border: '2px solid #4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: isLarge ? '1.2rem' : '1.05rem', borderRadius: '14px', padding: '0 25px', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>{isDarkMode ? "☀️ Light" : "🌙 Dark"}</button>
          <div style={{ width: '2px', height: '40px', background: isDarkMode ? '#475569' : '#CBD5E1', margin: '0 5px' }} />
          <div style={{ color: colorPalette.primaryText, background: isDarkMode ? '#1E293B' : '#F1F5F9', padding: '10px 24px', borderRadius: '24px', fontWeight: 800, fontSize: isLarge ? '1.4rem' : '1.2rem', border: colorPalette.cardBorder, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '130px' }}>{time}</div>
        </div>
      </header>

      <div className="map-workspace" style={{ position: 'relative', display: 'flex', flexGrow: 1 }}>
        
        <aside className="map-sidebar" style={{ width: '450px', flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="sidebar-search-container" style={{ margin: '20px 0', position: 'relative' }}>
            <div style={{ display: 'flex', position: 'relative', alignItems: 'center' }}>
              <input type="text" placeholder={lang === 'EN' ? "🔍 Tap to Search Offices..." : "🔍 Pindutin para maghanap..."} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onClick={() => setShowKeyboard(true)} style={{ width: '100%', padding: '22px 24px', borderRadius: '16px', border: showKeyboard ? '4px solid #4F46E5' : (isDarkMode ? '2px solid #475569' : '2px solid #CBD5E1'), background: isDarkMode ? '#1E293B' : '#FFFFFF', color: colorPalette.primaryText, fontWeight: '800', fontSize: '1.4rem', boxShadow: '0 6px 12px rgba(0,0,0,0.1)', boxSizing: 'border-box', cursor: 'text' }} />
              {searchQuery && (
                <button onClick={(e) => { e.stopPropagation(); setSearchQuery(""); }} style={{ position: 'absolute', right: '20px', background: '#E2E8F0', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#1E293B', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900' }}>✕</button>
              )}
            </div>

            {searchQuery.trim() !== "" && filteredSearchOptions.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF', border: '3px solid #4F46E5', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.4)', zIndex: 200, maxHeight: '360px', overflowY: 'auto', marginTop: '10px' }}>
                {filteredSearchOptions.map((officeItem) => (
                  <div key={`search-${officeItem.floor}-${officeItem.key}`} onClick={() => handleSearchSelect(officeItem.key, officeItem.floor)} style={{ padding: '20px 24px', borderBottom: isDarkMode ? '2px solid #334155' : '2px solid #F1F5F9', cursor: 'pointer', display: 'flex', flexDirection: 'column' }} className="search-result-row-kiosk">
                    <span style={{ fontWeight: '900', color: colorPalette.primaryText, fontSize: '1.25rem' }}>{officeItem.title}</span>
                    <span style={{ fontSize: '1.05rem', color: isDarkMode ? '#38BDF8' : '#4F46E5', fontWeight: '800', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>📍 {officeItem.badge}</span>
                  </div>
                ))}
              </div>
            )}

            {searchQuery.trim() === "" && showKeyboard && popularSearches.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF', border: '3px solid #4F46E5', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.4)', zIndex: 200, marginTop: '10px', overflow: 'hidden' }}>
                <div style={{ padding: '15px 24px', background: isDarkMode ? '#334155' : '#EEF2FF', borderBottom: isDarkMode ? '2px solid #475569' : '2px solid #E2E8F0', fontWeight: '900', color: '#4F46E5', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🔥 {lang === 'EN' ? 'Frequently Searched' : 'Madalas Hanapin'}
                </div>
                {popularSearches.map((officeItem) => (
                  <div key={`pop-${officeItem.floor}-${officeItem.key}`} onClick={() => handleSearchSelect(officeItem.key, officeItem.floor)} style={{ padding: '20px 24px', borderBottom: isDarkMode ? '2px solid #334155' : '2px solid #F1F5F9', cursor: 'pointer', display: 'flex', flexDirection: 'column' }} className="search-result-row-kiosk">
                    <span style={{ fontWeight: '900', color: colorPalette.primaryText, fontSize: '1.25rem' }}>{officeItem.title}</span>
                    <span style={{ fontSize: '1.05rem', color: isDarkMode ? '#94A3B8' : '#64748B', fontWeight: '800', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      📍 {officeItem.badge} • 🔍 {officeItem.searchCount || 0} {lang === 'EN' ? 'searches' : 'beses hinanap'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <hr className="divider" style={{ margin: '0 0 20px 0', borderTop: isDarkMode ? '2px solid #334155' : '2px solid #E2E8F0' }} />

          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px' }}>
            
            {/* ============================================================== */}
            {/* BAGO: QUICK SERVICES SECTION SA MAP SIDEBAR */}
            {/* ============================================================== */}
            {routeStep === 'idle' && !selectedOfficeKey && (
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ fontSize: '1.1rem', color: colorPalette.primaryText, marginBottom: '12px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  📋 {lang === 'EN' ? 'Quick Service Guides' : 'Mabilisang Serbisyo'}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {serviceGuidesConfig.map((service, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setSelectedService(service)}
                      style={{ 
                        background: isDarkMode ? '#1E293B' : '#FFFFFF', border: colorPalette.cardBorder, 
                        borderRadius: '12px', padding: '15px 10px', display: 'flex', flexDirection: 'column', 
                        alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s', 
                        boxShadow: '0 4px 6px rgba(0,0,0,0.02)' 
                      }}
                    >
                      <span style={{ fontSize: '1.8rem' }}>{service.icon}</span>
                      <span style={{ color: colorPalette.primaryText, fontWeight: 800, fontSize: '0.9rem', textAlign: 'center' }}>
                        {lang === 'EN' ? service.titleEn : service.titleTl}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* EXISTING: FLOOR DIRECTORY */}
            {routeStep === 'idle' && !selectedOfficeKey && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ background: isDarkMode ? 'linear-gradient(135deg, #1E1B4B, #4F46E5)' : 'linear-gradient(135deg, #4F46E5, #3730A3)', padding: '20px', borderRadius: '16px', color: 'white', marginBottom: '20px', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}>
                  <h2 style={{ fontSize: '1.6rem', margin: 0, fontWeight: 900 }}>Floor {currentFloor} Directory</h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '20px' }}>
                  {liveOfficeDatabase[currentFloor] && Object.keys(liveOfficeDatabase[currentFloor]).length > 0 ? (
                    Object.entries(liveOfficeDatabase[currentFloor]).map(([key, office]) => {
                      if (key === 'elevator-up' || key === 'stairs-up') return null; 
                      return (
                      <button
                        key={key}
                        onClick={() => handleSelectOffice(key, currentFloor)}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '16px 20px', borderRadius: '14px', border: isDarkMode ? '1px solid #334155' : '1px solid #E2E8F0', background: isDarkMode ? '#1E293B' : '#FFFFFF', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', width: '100%', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}
                      >
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#4F46E5', marginBottom: '6px', background: isDarkMode ? '#0F172A' : '#EEF2FF', padding: '4px 10px', borderRadius: '6px' }}>{office.badge || `F${currentFloor}`}</span>
                        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: colorPalette.primaryText }}>{office.title}</span>
                      </button>
                    )})
                  ) : (
                    <div style={{ textAlign: 'center', padding: '30px 10px', color: colorPalette.secondaryText }}>
                      <span style={{ fontSize: '2rem' }}>🚧</span>
                      <p style={{ fontWeight: 700, marginTop: '10px' }}>No offices mapped for this floor yet.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ROUTING TRANSPORT UI */}
            {routeStep === 'choose-transport' && destinationData && (
              <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: '20px' }}>
                <div className="destination-card" style={{ marginBottom: '20px' }}>
                  <p className="label" style={{ color: colorPalette.secondaryText, fontSize: '0.9rem', fontWeight: 800, letterSpacing: '1px' }}>DESTINATION / PAROROOAN</p>
                  <h1 className="office-title" style={{ fontSize: '1.8rem', color: colorPalette.primaryText, margin: '5px 0' }}>{destinationData.title}</h1>
                  <span className="floor-badge" style={{ fontSize: '1.1rem', padding: '6px 14px', display: 'inline-block', marginTop: '10px', background: '#4F46E5', color: 'white', borderRadius: '8px', fontWeight: 800 }}>{destinationData.badge || `Floor ${destinationData.floor}`}</span>
                </div>

                {!destinationData.isDirectionOnly && (
                  <div className="office-meta" style={{ fontSize: '1.1rem', color: colorPalette.secondaryText, marginBottom: '20px' }}>
                    <p style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.2rem' }}>
                        {destinationData.status === 'In a Meeting' ? '🔴' : destinationData.status === 'Out of Office' ? '🟡' : destinationData.status === 'Closed' ? '⚫' : '🟢'}
                      </span>
                      <strong style={{ color: colorPalette.primaryText }}>{lang === 'EN' ? 'Status:' : 'Estado:'}</strong>
                      <span style={{ color: destinationData.status === 'In a Meeting' ? '#EF4444' : destinationData.status === 'Out of Office' ? '#F59E0B' : destinationData.status === 'Closed' ? '#64748B' : '#10B981', fontWeight: 900 }}>
                        {destinationData.status === 'In a Meeting' && lang === 'TL' ? 'May Pulong' : destinationData.status === 'Out of Office' && lang === 'TL' ? 'Wala sa Opisina' : destinationData.status === 'Closed' && lang === 'TL' ? 'Sarado' : destinationData.status === 'Available' && lang === 'TL' ? 'Maaaring Kausapin' : destinationData.status || 'Available'}
                      </span>
                    </p>
                    <p style={{ marginBottom: '8px' }}>🕒 <strong style={{ color: colorPalette.primaryText }}>{lang === 'EN' ? 'Hours:' : 'Oras:'}</strong> {destinationData.hours}</p>
                    <p>👤 <strong style={{ color: colorPalette.primaryText }}>{lang === 'EN' ? 'Head:' : 'Pinuno:'}</strong> {destinationData.head}</p>
                  </div>
                )}

                <div style={{ background: isDarkMode ? '#1E293B' : '#FFFFFF', padding: '20px', borderRadius: '16px', border: colorPalette.cardBorder, marginBottom: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ margin: '0 0 15px 0', color: colorPalette.primaryText, fontSize: '1.1rem', textAlign: 'center' }}>Elevator or Stairs?</h3>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={() => { setSelectedOfficeKey('elevator-up'); setTransportMethod('elevator'); setRouteStep('go-to-transport'); }}
                      style={{ flex: 1, padding: '15px', fontSize: '1rem', fontWeight: 800, background: '#EEF2FF', color: '#4F46E5', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      🛗 Elevator
                    </button>
                    <button 
                      onClick={() => { setSelectedOfficeKey('stairs-up'); setTransportMethod('stairs'); setRouteStep('go-to-transport'); }}
                      style={{ flex: 1, padding: '15px', fontSize: '1rem', fontWeight: 800, background: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      🚶‍♂️ Stairs
                    </button>
                  </div>
                  <button onClick={() => { setRouteStep('idle'); setDestinationData(null); }} style={{ marginTop: '12px', background: 'transparent', border: 'none', color: '#EF4444', fontWeight: 800, cursor: 'pointer', width: '100%', padding: '10px' }}>Cancel Navigation</button>
                </div>

                {destinationData.requirements && destinationData.requirements.length > 0 && (
                  <div className="requirements-box" style={{ background: isDarkMode ? 'rgba(245, 158, 11, 0.1)' : '#FFFBEB', border: `1px solid ${isDarkMode ? 'rgba(245, 158, 11, 0.3)' : '#FDE68A'}`, padding: '20px', borderRadius: '16px', color: colorPalette.primaryText }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '12px', color: isDarkMode ? '#F59E0B' : '#D97706', fontWeight: 800 }}>📋 Transaction Requirements:</h3>
                    <ul style={{ fontSize: '1.05rem', paddingLeft: '20px', marginBottom: '25px', lineHeight: '1.6' }}>
                      {destinationData.requirements.map((req, i) => (
                        <li key={i} style={{ marginBottom: '6px' }}>{req}</li>
                      ))}
                    </ul>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', background: isDarkMode ? '#1E293B' : '#FFFFFF', padding: '15px', borderRadius: '12px', border: `2px dashed ${isDarkMode ? '#475569' : '#CBD5E1'}`, boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: '800', textAlign: 'center' }}>
                        📱 I-scan para makita ang<br/>direksyon sa phone
                      </span>
                      <div style={{ padding: '10px', backgroundColor: '#FFFFFF', borderRadius: '8px' }}>
                        <QRCodeSVG value={`${window.location.origin}/?route=${destinationData.key}`} size={120} bgColor={"#ffffff"} fgColor={"#0F172A"} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {routeStep === 'go-to-transport' && destinationData && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ background: '#FEF2F2', border: '2px solid #FECDD3', padding: '25px', borderRadius: '16px', textAlign: 'center' }}>
                  <span style={{ fontSize: '3rem', display: 'inline-block' }}>📍</span>
                  <h2 style={{ color: '#E11D48', margin: '10px 0', fontSize: '1.3rem' }}>Showing route on Ground Floor...</h2>
                  <p style={{ color: '#9F1239', fontWeight: 600 }}>Please proceed to the {transportMethod === 'elevator' ? 'Elevator' : 'Stairs'}.</p>
                </div>

                <div style={{ background: '#1E293B', color: 'white', padding: '18px', borderRadius: '12px', textAlign: 'center', fontWeight: 800, border: '2px solid #334155', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}>
                  ⏳ {transportMethod === 'elevator' ? `Going up to Floor ${destinationData.floor}...` : 'Walking to the stairs...'}
                </div>
              </div>
            )}

            {routeStep === 'climbing-stairs' && destinationData && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ background: '#FFFBEB', border: '2px solid #FDE68A', padding: '25px', borderRadius: '16px', textAlign: 'center' }}>
                  <span style={{ fontSize: '4rem', display: 'inline-block' }}>🚶‍♂️</span>
                  <h2 style={{ color: '#D97706', margin: '10px 0', fontSize: '1.5rem' }}>Climbing Stairs...</h2>
                  <p style={{ color: '#B45309', fontWeight: 900, fontSize: '1.3rem' }}>Currently passing Floor {currentFloor}</p>
                </div>
                
                <div style={{ background: '#1E293B', color: 'white', padding: '18px', borderRadius: '12px', textAlign: 'center', fontWeight: 800, border: '2px solid #334155', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}>
                  🎯 Target: Floor {destinationData.floor}
                </div>
              </div>
            )}

            {(routeStep === 'arrived' || (routeStep === 'idle' && selectedOfficeKey && selectedOfficeKey !== 'elevator-up' && selectedOfficeKey !== 'stairs-up')) && selectedOffice && (
              <div style={{ paddingBottom: '20px' }}>
                <button 
                  onClick={() => { setSelectedOfficeKey(null); setRouteStep('idle'); setDestinationData(null); }}
                  style={{ background: isDarkMode ? '#334155' : '#E2E8F0', color: colorPalette.primaryText, border: 'none', padding: '10px 18px', borderRadius: '50px', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '20px' }}
                >
                  ⬅️ Back to Floor {currentFloor} List
                </button>

                <div className="destination-card" style={{ marginBottom: '20px' }}>
                  <p className="label" style={{ color: colorPalette.secondaryText, fontSize: '0.9rem', fontWeight: 800, letterSpacing: '1px' }}>DESTINATION / PAROROOAN</p>
                  <h1 className="office-title" style={{ fontSize: '1.8rem', color: colorPalette.primaryText, margin: '5px 0' }}>{selectedOffice.title}</h1>
                  <span className="floor-badge" style={{ fontSize: '1.1rem', padding: '6px 14px', display: 'inline-block', marginTop: '10px', background: '#4F46E5', color: 'white', borderRadius: '8px', fontWeight: 800 }}>{selectedOffice.badge}</span>
                </div>

                <div className="office-meta" style={{ fontSize: '1.1rem', color: colorPalette.secondaryText, marginBottom: '20px' }}>
                  {selectedOffice.isDirectionOnly ? (
                    <p style={{ background: '#FEF2F2', color: '#E11D48', padding: '15px', borderRadius: '12px', border: '1px solid #FECDD3', fontWeight: 600 }}>🚶‍♂️ <strong>Wayfinding Path Generated:</strong> Please follow the blinking red path indicator.</p>
                  ) : (
                    <>
                      <p style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.2rem' }}>
                          {selectedOffice.status === 'In a Meeting' ? '🔴' : selectedOffice.status === 'Out of Office' ? '🟡' : selectedOffice.status === 'Closed' ? '⚫' : '🟢'}
                        </span>
                        <strong style={{ color: colorPalette.primaryText }}>{lang === 'EN' ? 'Status:' : 'Estado:'}</strong>
                        <span style={{ color: selectedOffice.status === 'In a Meeting' ? '#EF4444' : selectedOffice.status === 'Out of Office' ? '#F59E0B' : selectedOffice.status === 'Closed' ? '#64748B' : '#10B981', fontWeight: 900 }}>
                          {selectedOffice.status === 'In a Meeting' && lang === 'TL' ? 'May Pulong' : selectedOffice.status === 'Out of Office' && lang === 'TL' ? 'Wala sa Opisina' : selectedOffice.status === 'Closed' && lang === 'TL' ? 'Sarado' : selectedOffice.status === 'Available' && lang === 'TL' ? 'Maaaring Kausapin' : selectedOffice.status || 'Available'}
                        </span>
                      </p>
                      
                      <p style={{ marginBottom: '8px' }}>🕒 <strong style={{ color: colorPalette.primaryText }}>{lang === 'EN' ? 'Hours:' : 'Oras:'}</strong> {selectedOffice.hours}</p>
                      <p>👤 <strong style={{ color: colorPalette.primaryText }}>{lang === 'EN' ? 'Head:' : 'Pinuno:'}</strong> {selectedOffice.head}</p>
                    </>
                  )}
                </div>

                {selectedOffice.requirements && selectedOffice.requirements.length > 0 && (
                  <div className="requirements-box" style={{ background: isDarkMode ? 'rgba(245, 158, 11, 0.1)' : '#FFFBEB', border: `1px solid ${isDarkMode ? 'rgba(245, 158, 11, 0.3)' : '#FDE68A'}`, padding: '20px', borderRadius: '16px', color: colorPalette.primaryText }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '12px', color: isDarkMode ? '#F59E0B' : '#D97706', fontWeight: 800 }}>📋 Transaction Requirements:</h3>
                    <ul style={{ fontSize: '1.05rem', paddingLeft: '20px', marginBottom: '25px', lineHeight: '1.6' }}>
                      {selectedOffice.requirements.map((req, i) => (
                        <li key={i} style={{ marginBottom: '6px' }}>{req}</li>
                      ))}
                    </ul>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', background: isDarkMode ? '#1E293B' : '#FFFFFF', padding: '15px', borderRadius: '12px', border: `2px dashed ${isDarkMode ? '#475569' : '#CBD5E1'}`, boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: '800', textAlign: 'center' }}>
                        📱 I-scan para makita ang<br/>direksyon sa phone
                      </span>
                      <div style={{ padding: '10px', backgroundColor: '#FFFFFF', borderRadius: '8px' }}>
                        <QRCodeSVG value={`${window.location.origin}/?route=${selectedOfficeKey}`} size={120} bgColor={"#ffffff"} fgColor={"#0F172A"} />
                      </div>
                    </div>
                  </div>
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
          setCurrentFloor={setCurrentFloor} 
          setSelectedOfficeKey={setSelectedOfficeKey} 
          is3DActive={is3DActive}
          setIs3DActive={setIs3DActive}
          transportMethod={transportMethod} 
          routeStep={routeStep}
        />

        {searchParams.get('route') && (
          <div style={{
            position: 'absolute', bottom: '100px', top: 'auto', left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(254, 243, 199, 0.95)', backdropFilter: 'blur(4px)', color: '#92400E',
            padding: '10px 15px', borderRadius: '12px', border: '2px solid #F59E0B', zIndex: 99999,
            width: '90%', maxWidth: '350px', textAlign: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
          }}>
            <span style={{ display: 'block', fontSize: '1rem', fontWeight: '900', marginBottom: '2px' }}>
              📸 Take a Screenshot!
            </span>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', lineHeight: '1.2' }}>
              Session expires when screen is locked or idle.
            </span>
          </div>
        )}

        {showKeyboard && (
          <div className="kiosk-virtual-keyboard" style={{ position: 'absolute', bottom: '20px', left: '480px', right: '30px', backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9', border: '4px solid #4F46E5', borderRadius: '24px', padding: '25px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
              <span style={{ fontWeight: '900', color: isDarkMode ? '#94A3B8' : '#475569', fontSize: '1.2rem', textTransform: 'uppercase' }}>⌨️ Kiosk Touchscreen Keyboard</span>
              <button onClick={() => setShowKeyboard(false)} style={{ background: '#EF4444', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' }}>Hide Keyboard ✕</button>
            </div>
            {keyboardRows.map((row, rowIndex) => (
              <div key={rowIndex} style={{ display: 'flex', justifyContent: 'center', gap: '10px', width: '100%' }}>
                {row.map((key) => {
                  let buttonWidth = '75px'; let bgBtnColor = isDarkMode ? '#334155' : '#FFFFFF'; let fontBtnColor = colorPalette.primaryText;
                  if (key === 'SPACE') { buttonWidth = '500px'; bgBtnColor = '#4F46E5'; fontBtnColor = 'white'; }
                  if (key === 'BACKSPACE') { buttonWidth = '160px'; bgBtnColor = '#F59E0B'; fontBtnColor = 'black'; }
                  if (key === 'CLEAR') { buttonWidth = '120px'; bgBtnColor = '#64748B'; fontBtnColor = 'white'; }
                  return (
                    <button key={key} onClick={() => handleVirtualKeyPress(key)} style={{ width: buttonWidth, height: '70px', borderRadius: '14px', border: isDarkMode ? '1px solid #475569' : '1px solid #CBD5E1', backgroundColor: bgBtnColor, color: fontBtnColor, fontSize: '1.4rem', fontWeight: '900', cursor: 'pointer' }}>
                      {key === 'BACKSPACE' ? '⌫ Delete' : (key === 'SPACE' ? 'Space Bar' : key)}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}

      </div>

      {/* ============================================================== */}
      {/* BAGO: POPUP MODAL SA IBABAW NG MAPA */}
      {/* ============================================================== */}
      {selectedService && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999
        }}>
          <div style={{
            backgroundColor: colorPalette.cardBg, borderRadius: '24px', padding: '40px',
            maxWidth: '650px', width: '90%', border: colorPalette.cardBorder,
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '25px'
          }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '3rem', display: 'block', marginBottom: '10px' }}>{selectedService.icon}</span>
                <h2 style={{ margin: 0, color: colorPalette.primaryText, fontSize: '2.2rem', fontWeight: 900 }}>
                  {lang === 'EN' ? selectedService.titleEn : selectedService.titleTl}
                </h2>
              </div>
              <button 
                onClick={() => setSelectedService(null)} 
                style={{ background: '#E2E8F0', border: 'none', color: '#0F172A', width: '45px', height: '45px', borderRadius: '50%', fontSize: '1.2rem', fontWeight: 900, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
              >
                ✕
              </button>
            </div>

            <div style={{ background: isDarkMode ? 'rgba(245, 158, 11, 0.1)' : '#FFFBEB', border: `2px solid ${isDarkMode ? 'rgba(245, 158, 11, 0.3)' : '#FDE68A'}`, padding: '25px', borderRadius: '16px' }}>
              <h3 style={{ margin: '0 0 15px 0', color: isDarkMode ? '#F59E0B' : '#D97706', fontSize: '1.3rem', fontWeight: 900 }}>
                📋 {lang === 'EN' ? 'Requirements Needed:' : 'Mga Kailangang Dalhin:'}
              </h3>
              <ul style={{ margin: 0, paddingLeft: '20px', color: colorPalette.primaryText, fontSize: '1.15rem', lineHeight: '1.8', fontWeight: 600 }}>
                {selectedService.requirements.map((req, i) => <li key={i}>{req}</li>)}
              </ul>
            </div>

            <div style={{ background: selectedService.isExternal ? '#FEF2F2' : '#EEF2FF', border: `2px solid ${selectedService.isExternal ? '#FECDD3' : '#C7D2FE'}`, padding: '20px', borderRadius: '16px', color: selectedService.isExternal ? '#9F1239' : '#3730A3', fontSize: '1.2rem', fontWeight: 800, display: 'flex', gap: '15px', alignItems: 'center', lineHeight: '1.5' }}>
              <span style={{ fontSize: '2rem' }}>{selectedService.isExternal ? '🏛️' : '📍'}</span>
              {lang === 'EN' ? selectedService.locationTextEn : selectedService.locationTextTl}
            </div>

            {selectedService.isExternal ? (
              <button 
                onClick={() => setSelectedService(null)}
                style={{ width: '100%', padding: '20px', borderRadius: '16px', background: '#10B981', color: 'white', border: 'none', fontSize: '1.3rem', fontWeight: 900, cursor: 'pointer', marginTop: '10px', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.3)' }}
              >
                👍 {lang === 'EN' ? 'Got it, thank you!' : 'Sige po, salamat!'}
              </button>
            ) : (
              <button 
                onClick={() => {
                  handleSelectOffice(selectedService.dbKey, selectedService.floor);
                  setSelectedService(null);
                }}
                style={{ width: '100%', padding: '20px', borderRadius: '16px', background: '#4F46E5', color: 'white', border: 'none', fontSize: '1.3rem', fontWeight: 900, cursor: 'pointer', marginTop: '10px', boxShadow: '0 10px 20px rgba(79, 70, 229, 0.3)' }}
              >
                🗺️ {lang === 'EN' ? 'Show me the way' : 'Ituro ang daan sa mapa'}
              </button>
            )}

          </div>
        </div>
      )}

      {showAdmin && <AdminPanel officeDatabase={liveOfficeDatabase} onClose={() => setShowAdmin(false)} onDataUpdate={() => { fetchKioskData(); }} />}
    </div>
  );
}