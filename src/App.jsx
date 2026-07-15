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

export default function App() {
  const [liveOfficeDatabase, setLiveOfficeDatabase] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const [appState, setAppState] = useState('welcome');
  const [theme, setTheme] = useState('light'); 
  const [currentFloor, setCurrentFloor] = useState(1);
  const [is3DActive, setIs3DActive] = useState(false);
  const [time, setTime] = useState("--:-- --");
  
  const [selectedOfficeKey, setSelectedOfficeKey] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showKeyboard, setShowKeyboard] = useState(false);

  const [lang, setLang] = useState('EN');     
  const [textSize, setTextSize] = useState('normal'); 

  const [showAdmin, setShowAdmin] = useState(false);
  const [secretClicks, setSecretClicks] = useState(0);

  // SMART ROUTING STATES
  const [routeStep, setRouteStep] = useState('idle'); 
  const [destinationData, setDestinationData] = useState(null);
  const [transportMethod, setTransportMethod] = useState('elevator');

  const [searchParams] = useSearchParams();

  // ==============================================================
  // BAGO: QR CODE MOBILE ROUTING LOGIC
  // Kapag in-scan sa phone, didiretso agad sa Map at iguguhit ang ruta
  // ==============================================================
 
  
  useEffect(() => {
    const routeKey = searchParams.get('route');
    if (routeKey && Object.keys(liveOfficeDatabase).length > 0) {
      let foundFloor = null;
      Object.entries(liveOfficeDatabase).forEach(([floorNum, offices]) => {
        if (offices[routeKey]) foundFloor = parseInt(floorNum);
      });

      if (foundFloor) {
        setAppState('map');
        // BAGO: Direkta na siya tatalon sa floor kung nasaan yung opisina! Wala nang tanong-tanong.
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
        console.error("[Kiosk Setup Error] Failed, using local:", error);
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
    
    // BAGO: I-detect kung phone ang gamit
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 1024;

    // BAGO: Kapag Floor 1 O KAYA ay phone ang gamit, idiretso na agad (wag na magtanong ng transport)
    if (floor === 1 || isMobile) {
      setCurrentFloor(floor);
      setSelectedOfficeKey(key);
      setRouteStep('arrived');
      setDestinationData(null);
    } else {
      // Ito yung original na logic para sa malaking Kiosk (hihingi muna ng Elevator/Stairs)
      setDestinationData({ key, floor, ...targetOffice });
      setCurrentFloor(1); 
      setSelectedOfficeKey(null);
      setRouteStep('choose-transport'); 
    }
  };

  useEffect(() => {
    let animationTimer;
    if (routeStep === 'go-to-transport' && destinationData) {
      animationTimer = setTimeout(() => {
        setCurrentFloor(destinationData.floor);
        setSelectedOfficeKey(destinationData.key);
        setRouteStep('arrived');
      }, 4000); 
    }
    return () => clearTimeout(animationTimer);
  }, [routeStep, destinationData]);


  const getFlatOffices = () => {
    const flatList = [];
    Object.entries(liveOfficeDatabase).forEach(([floorNum, floorOffices]) => {
      Object.entries(floorOffices).forEach(([dbKey, officeDetails]) => {
        // BAGO: Wag isama ang elevator at stairs sa listahan ng search at frequently searched
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

  // BAGO: Kunin ang top 4 na pinakamadalas i-search
  const popularSearches = getFlatOffices()
    .sort((a, b) => (b.searchCount || 0) - (a.searchCount || 0))
    .slice(0, 4);

  // BAGO: Pag may pinili sa search, mag-a-add ng +1 sa count tapos pupunta sa opisina
  const handleSearchSelect = async (key, floor) => {
    handleSelectOffice(key, floor);
    setSearchQuery("");
    setShowKeyboard(false);
    
    await incrementSearchCount(key); // Dagdag +1 sa database
    
    // Auto-update sa screen para updated agad ang count
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

  if (isLoading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#F8FAFC', color: '#0F172A', fontSize: '2rem', fontWeight: 'bold' }}>Initializing Kiosk Systems...</div>;
  
  if (appState === 'welcome') return <WelcomeScreen onStart={() => setAppState('map')} />;
  
  if (appState === 'dashboard') {
    return <DashboardScreen tagaytaySeal={tagaytaySeal} onNavigateToDirectory={() => setAppState('home')} onNavigateToMap={() => setAppState('map')} onQuickRoute={(floor, dbKey) => { setAppState('map'); handleSelectOffice(dbKey, floor); }} theme={theme} setTheme={setTheme} lang={lang} setLang={setLang} textSize={textSize} setTextSize={setTextSize} />;
  }

  if (appState === 'home') {
    return <DirectoryScreen theme={theme} setTheme={setTheme} lang={lang} setLang={setLang} textSize={textSize} setTextSize={setTextSize} setAppState={setAppState} tagaytaySeal={tagaytaySeal} time={time} currentFloor={currentFloor} setCurrentFloor={setCurrentFloor} officeDatabase={liveOfficeDatabase} handleSelectOffice={(key) => handleSelectOffice(key, currentFloor)} />;
  }

  const isDarkMode = theme === 'dark';
  const isLarge = textSize === 'large';

  const colorPalette = {
    headerBg: isDarkMode ? '#1E1B4B' : '#FFFFFF',
    primaryText: isDarkMode ? '#FFFFFF' : '#0F172A',
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

            {/* 1. KUNG MAY TINA-TYPE NA ANG USER (REGULAR SEARCH RESULTS) */}
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

            {/* 2. KUNG WALA PANG TINA-TYPE (FREQUENTLY SEARCHED / TRENDING) */}
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
            
            {routeStep === 'idle' && !selectedOfficeKey && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ background: isDarkMode ? 'linear-gradient(135deg, #1E1B4B, #4F46E5)' : 'linear-gradient(135deg, #4F46E5, #3730A3)', padding: '25px 20px', borderRadius: '16px', color: 'white', marginBottom: '20px', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}>
                  <h2 style={{ fontSize: '1.8rem', margin: 0, fontWeight: 900 }}>Floor {currentFloor} Directory</h2>
                  <p style={{ margin: '5px 0 0 0', opacity: 0.9, fontSize: '1rem' }}>Select a room below or tap on the map.</p>
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

            {routeStep === 'choose-transport' && destinationData && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div className="destination-card" style={{ background: '#F8FAFC', border: '2px solid #CBD5E1', padding: '20px', borderRadius: '16px' }}>
                  <p className="label" style={{ color: '#475569', fontSize: '0.9rem', fontWeight: 800 }}>🎯 DESTINATION</p>
                  <h1 className="office-title" style={{ fontSize: '1.6rem', color: '#0F172A', margin: '5px 0' }}>{destinationData.title}</h1>
                  <span className="floor-badge" style={{ background: '#4F46E5', color: 'white', padding: '6px 12px', borderRadius: '8px', fontWeight: 800 }}>Floor {destinationData.floor}</span>
                </div>

                <div style={{ background: isDarkMode ? '#1E293B' : '#FFFFFF', padding: '25px', borderRadius: '16px', border: colorPalette.cardBorder }}>
                  <h3 style={{ margin: '0 0 15px 0', color: colorPalette.primaryText, fontSize: '1.3rem' }}>How would you like to go up?</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button 
                      onClick={() => { setSelectedOfficeKey('elevator-up'); setTransportMethod('elevator'); setRouteStep('go-to-transport'); }}
                      style={{ padding: '20px', fontSize: '1.2rem', fontWeight: 800, background: '#EEF2FF', color: '#4F46E5', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      🛗 Use the Elevator
                    </button>
                    <button 
                      onClick={() => { setSelectedOfficeKey('stairs-up'); setTransportMethod('stairs'); setRouteStep('go-to-transport'); }}
                      style={{ padding: '20px', fontSize: '1.2rem', fontWeight: 800, background: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      🚶‍♂️ Use the Stairs
                    </button>
                  </div>
                  <button onClick={() => { setRouteStep('idle'); setDestinationData(null); }} style={{ marginTop: '15px', background: 'transparent', border: 'none', color: '#EF4444', fontWeight: 800, cursor: 'pointer', width: '100%' }}>Cancel Navigation</button>
                </div>
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
                  ⏳ Switching to Floor {destinationData.floor} in a few seconds...
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
        />

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

      {showAdmin && <AdminPanel officeDatabase={liveOfficeDatabase} onClose={() => setShowAdmin(false)} onDataUpdate={() => { fetchKioskData(); }} />}
    </div>
  );
}