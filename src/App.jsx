import React, { useState, useEffect } from 'react';
import tagaytaySeal from './assets/tagaytay-seal.jpg';
import WelcomeScreen from './WelcomeScreen';
import DashboardScreen from './DashboardScreen';
import DirectoryScreen from './DirectoryScreen';
import MapScreen from './components/MapScreen';
import AdminPanel from './admin/AdminPanel';
import './index.css';

// QR at PDF Imports
import { QRCodeSVG } from 'qrcode.react'; 
import { jsPDF } from 'jspdf';
import { useSearchParams } from 'react-router-dom';

// Dynamic Data Imports
import { getAllOffices, initializeDatabase } from './lib/api';
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

  // --- AUTOMATIC PDF GENERATOR LOGIC ---
  const [searchParams] = useSearchParams();
  const [isDownloadMode, setIsDownloadMode] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState("Preparing your PDF...");

  const generatePDF = (office) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Tagaytay City Hall", 105, 20, { align: 'center' });
    doc.setFontSize(16);
    doc.text(office.title, 105, 30, { align: 'center' });
    doc.line(20, 35, 190, 35);
    doc.setFontSize(12);
    doc.text("Transaction Requirements:", 20, 50);
    
    if (office.requirements && office.requirements.length > 0) {
      office.requirements.forEach((req, index) => {
        doc.text(`• ${req}`, 25, 60 + (index * 10));
      });
    } else {
      doc.text("No specific requirements listed.", 25, 60);
    }
    
    doc.save(`${office.title}_Requirements.pdf`);
  };

  useEffect(() => {
    const downloadKey = searchParams.get('download');
    if (downloadKey) {
      setIsDownloadMode(true);
      if (Object.keys(liveOfficeDatabase).length > 0) {
        const flatOffices = getFlatOffices();
        const targetOffice = flatOffices.find(o => o.key === downloadKey);
        
        if (targetOffice) {
          setDownloadStatus(`Downloading requirements for ${targetOffice.title}...`);
          generatePDF(targetOffice);
          setTimeout(() => {
             setDownloadStatus("✅ PDF Downloaded! You can now close this tab.");
          }, 1500);
        } else {
          setDownloadStatus("❌ Office not found.");
        }
      }
    }
  }, [searchParams, liveOfficeDatabase]);
  // ------------------------------------

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
        console.log("Connecting to Supabase systems...");
        await initializeDatabase(defaultOfficeData);
        await fetchKioskData();
        setIsLoading(false); 
      } catch (error) {
        console.error("[Kiosk Setup Error] Supabase connection failed:", error);
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
      setShowAdmin(true);
      setSecretClicks(0);
    } else {
      setSecretClicks(prev => prev + 1);
      setTimeout(() => setSecretClicks(0), 3000); 
    }
  };

  const handleSelectOffice = (key, forcedFloor = null) => {
    if (forcedFloor !== null) {
      setCurrentFloor(forcedFloor);
    }
    setSelectedOfficeKey(key);
  };

  const getFlatOffices = () => {
    const flatList = [];
    Object.entries(liveOfficeDatabase).forEach(([floorNum, floorOffices]) => {
      Object.entries(floorOffices).forEach(([dbKey, officeDetails]) => {
        flatList.push({ key: dbKey, floor: parseInt(floorNum), ...officeDetails });
      });
    });
    return flatList;
  };

  const filteredSearchOptions = searchQuery.trim() === "" ? [] : getFlatOffices().filter(off => 
    off.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedOffice = selectedOfficeKey ? liveOfficeDatabase[currentFloor]?.[selectedOfficeKey] : null;

  const handleVirtualKeyPress = (key) => {
    if (key === 'BACKSPACE') setSearchQuery(prev => prev.slice(0, -1));
    else if (key === 'SPACE') setSearchQuery(prev => prev + ' ');
    else if (key === 'CLEAR') setSearchQuery('');
    else setSearchQuery(prev => prev + key);
  };

  // --- MOBILE DOWNLOAD MODE UI ---
  if (isDownloadMode) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#F8FAFC', color: '#0F172A', padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '15px' }}>📄</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>{downloadStatus}</h2>
        {downloadStatus.includes('✅') && (
          <p style={{ marginTop: '10px', color: '#64748B' }}>Makikita ang file sa "Downloads" folder ng iyong device.</p>
        )}
      </div>
    );
  }

  if (isLoading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#F8FAFC', color: '#0F172A', fontSize: '2rem', fontWeight: 'bold' }}>Initializing Kiosk Systems...</div>;
  if (appState === 'welcome') return <WelcomeScreen onStart={() => setAppState('dashboard')} />;
  
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
          <button onClick={() => { setAppState('dashboard'); setSelectedOfficeKey(null); setSearchQuery(""); setShowKeyboard(false); }} style={{ background: '#0d3674', color: 'white', border: 'none', padding: isLarge ? '14px 30px' : '10px 24px', height: '60px', borderRadius: '50px', fontWeight: 900, fontSize: isLarge ? '1.2rem' : '1.05rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.15)' }}>🏠 {lang === 'EN' ? 'Home' : 'Tahanan'}</button>
          <div style={{ color: colorPalette.primaryText, background: isDarkMode ? '#1E293B' : '#F1F5F9', padding: '10px 24px', borderRadius: '24px', fontWeight: 800, fontSize: isLarge ? '1.4rem' : '1.2rem', border: colorPalette.cardBorder, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '130px' }}>{time}</div>
        </div>
      </header>

      <div className="map-workspace" style={{ position: 'relative', display: 'flex', flexGrow: 1 }}>
        <aside className="map-sidebar" style={{ width: '450px', flexShrink: 0 }}>
          <button className="back-home-btn" onClick={() => { setAppState('home'); setSearchQuery(""); setShowKeyboard(false); }}><span>⬅️</span> Back to Directory</button>
          
          <div className="sidebar-search-container" style={{ margin: '20px 0', position: 'relative' }}>
            <div style={{ display: 'flex', position: 'relative', alignItems: 'center' }}>
              <input type="text" placeholder={lang === 'EN' ? "🔍 Tap to Search Offices..." : "🔍 Pindutin para maghanap..."} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onClick={() => setShowKeyboard(true)} style={{ width: '100%', padding: '22px 24px', borderRadius: '16px', border: showKeyboard ? '4px solid #4F46E5' : (isDarkMode ? '2px solid #475569' : '2px solid #CBD5E1'), background: isDarkMode ? '#1E293B' : '#FFFFFF', color: colorPalette.primaryText, fontWeight: '800', fontSize: '1.4rem', boxShadow: '0 6px 12px rgba(0,0,0,0.1)', boxSizing: 'border-box', cursor: 'text' }} />
              {searchQuery && (
                <button onClick={(e) => { e.stopPropagation(); setSearchQuery(""); }} style={{ position: 'absolute', right: '20px', background: '#E2E8F0', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#1E293B', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900' }}>✕</button>
              )}
            </div>

            {filteredSearchOptions.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF', border: '3px solid #4F46E5', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.4)', zIndex: 200, maxHeight: '360px', overflowY: 'auto', marginTop: '10px' }}>
                {filteredSearchOptions.map((officeItem) => (
                  <div key={`${officeItem.floor}-${officeItem.key}`} onClick={() => { handleSelectOffice(officeItem.key, officeItem.floor); setSearchQuery(""); setShowKeyboard(false); }} style={{ padding: '20px 24px', borderBottom: isDarkMode ? '2px solid #334155' : '2px solid #F1F5F9', cursor: 'pointer', display: 'flex', flexDirection: 'column' }} className="search-result-row-kiosk">
                    <span style={{ fontWeight: '900', color: colorPalette.primaryText, fontSize: '1.25rem' }}>{officeItem.title}</span>
                    <span style={{ fontSize: '1.05rem', color: isDarkMode ? '#38BDF8' : '#4F46E5', fontWeight: '800', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>📍 {officeItem.badge}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <hr className="divider" />
          
          <div className="destination-card">
            <p className="label">DESTINATION / PAROROOAN</p>
            <h1 className="office-title" style={{ fontSize: '1.8rem' }}>{selectedOffice ? selectedOffice.title : "Select an Office"}</h1>
            <span className="floor-badge" style={{ fontSize: '1.1rem', padding: '6px 14px' }}>{selectedOffice ? selectedOffice.badge : `Level ${currentFloor} Blueprint`}</span>
          </div>

          <div className="office-meta" style={{ fontSize: '1.1rem' }}>
            {!selectedOffice ? (
              <p>Tap any room on the interactive floor plan or use the search bar above to generate step-by-step navigation paths.</p>
            ) : selectedOffice.isDirectionOnly ? (
              <p className="direction-highlight-notice">🚶‍♂️ <strong>Wayfinding Path Generated:</strong> Please follow the blinking red path indicator.</p>
            ) : (
              <>
                <p>🕒 <strong>Hours:</strong> {selectedOffice.hours}</p>
                <p>👤 <strong>Head:</strong> {selectedOffice.head}</p>
              </>
            )}
          </div>

          {/* DITO NA ANG BAGO: REQUIREMENTS LIST + QR CODE */}
          {selectedOffice && selectedOffice.requirements && selectedOffice.requirements.length > 0 && (
            <div className="requirements-box" style={{ marginTop: '20px', background: isDarkMode ? 'rgba(245, 158, 11, 0.1)' : '#FFFBEB', border: `1px solid ${isDarkMode ? 'rgba(245, 158, 11, 0.3)' : '#FDE68A'}`, padding: '20px', borderRadius: '16px', color: colorPalette.primaryText }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '12px', color: isDarkMode ? '#F59E0B' : '#D97706', fontWeight: 800 }}>📋 Transaction Requirements:</h3>
              <ul style={{ fontSize: '1.05rem', paddingLeft: '20px', marginBottom: '25px', lineHeight: '1.6' }}>
                {selectedOffice.requirements.map((req, i) => (
                  <li key={i} style={{ marginBottom: '6px' }}>{req}</li>
                ))}
              </ul>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', background: isDarkMode ? '#1E293B' : '#FFFFFF', padding: '15px', borderRadius: '12px', border: `2px dashed ${isDarkMode ? '#475569' : '#CBD5E1'}`, boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '800', textAlign: 'center', color: colorPalette.primaryText }}>
                  📱 I-scan para i-download ang<br/>Requirements (PDF)
                </span>
                <div style={{ padding: '10px', backgroundColor: '#FFFFFF', borderRadius: '8px' }}>
                  <QRCodeSVG 
                    value={`${window.location.origin}/?download=${selectedOfficeKey}`} 
                    size={120} 
                    bgColor={"#ffffff"}
                    fgColor={"#0F172A"}
                  />
                </div>
              </div>
            </div>
          )}
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