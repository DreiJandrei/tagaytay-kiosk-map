import React, { useState, useEffect } from 'react';

// EXISTING: Frequently Visited Offices
const frequentOfficesConfig = [
  { name: "Mayor's Office", nameTl: "Tanggapan ng Alkalde", floor: 7, floorLabel: "7th Floor", floorLabelTl: "Ika-7 na Palapag", dbKey: "mayor-main" },
  { name: "City Treasurer", nameTl: "Ingat-Yaman ng Lungsod", floor: 3, floorLabel: "3rd Floor", floorLabelTl: "Ika-3 na Palapag", dbKey: "treasure-office" },
  { name: "Building Official (OBO)", nameTl: "Tanggapan ng Paggawa ng Gusali", floor: 3, floorLabel: "3rd Floor", floorLabelTl: "Ika-3 na Palapag", dbKey: "building-official" },
  { name: "Civil Registrar", nameTl: "Rehistrador Sibil", floor: 1, floorLabel: "Ground Floor", floorLabelTl: "Unang Palapag", dbKey: "tolentino-hall" },
  { name: "Social Welfare (CSWDO)", nameTl: "Kagalingang Panlipunan", floor: 1, floorLabel: "Ground Floor", floorLabelTl: "Unang Palapag", dbKey: "pio-1" },
  { name: "Health Office", nameTl: "Tanggapan ng Kalusugan", floor: 2, floorLabel: "2nd Floor", floorLabelTl: "Ika-2 na Palapag", dbKey: "library" },
];

// BAGO: Service Guides Configuration (May "isExternal" checker na tayo)
const serviceGuidesConfig = [
  {
    id: 'business-permit',
    icon: '💼',
    titleEn: 'Apply for Business Permit',
    titleTl: 'Kumuha ng Business Permit',
    isExternal: true, // BAGO: Naka-true ito kasi nasa Annex, kaya hindi maghahanap ng mapa!
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
    titleEn: 'Apply for Building Permit',
    titleTl: 'Kumuha ng Building Permit',
    isExternal: false, // BAGO: Naka-false kasi nasa loob ng main building (3rd Floor)
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
    titleEn: 'Request Tax Declaration',
    titleTl: 'Kumuha ng Tax Declaration',
    isExternal: false, // Naka-false kasi nasa loob din ng main building
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

export default function DashboardScreen({ 
  tagaytaySeal, 
  onNavigateToDirectory, 
  onNavigateToMap, 
  onQuickRoute,
  theme,
  setTheme,
  lang,
  setLang,
  textSize,
  setTextSize
}) {
  const [time, setTime] = useState("--:-- --");
  const [selectedService, setSelectedService] = useState(null);

  const isDarkMode = theme === 'dark';
  const isLarge = textSize === 'large';

  const colorPalette = {
    containerBg: isDarkMode ? '#0F172A' : '#F8FAFC',
    headerBg: isDarkMode ? '#1E1B4B' : '#FFFFFF',
    cardBg: isDarkMode ? '#1E293B' : '#FFFFFF',
    primaryText: isDarkMode ? '#FFFFFF' : '#0F172A',
    secondaryText: isDarkMode ? '#CBD5E1' : '#475569',
    cardBorder: isDarkMode ? '2px solid #475569' : '2px solid #E2E8F0',
    buttonAccentBg: isDarkMode ? '#334155' : '#EEF2FF',
    accentText: isDarkMode ? '#FBBF24' : '#B45309'
  };

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  const replicatedButtonBaseStyle = {
    width: '100%',
    padding: isLarge ? '24px' : '18px', 
    borderRadius: '12px',
    background: isDarkMode ? '#334155' : '#EEF2FF', 
    color: isDarkMode ? '#FFFFFF' : '#4F46E5', 
    border: 'none',
    fontWeight: 700,
    fontSize: isLarge ? '1.4rem' : '1.1rem', 
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s ease'
  };

  return (
    <div className="directory-container" style={{ backgroundColor: colorPalette.containerBg, color: colorPalette.primaryText, minHeight: '100vh', transition: 'background-color 0.2s ease' }}>
      
      {/* Sticky Universal Header Bar */}
      <header className="dir-header" style={{ backgroundColor: colorPalette.headerBg, borderBottom: colorPalette.cardBorder, transition: 'all 0.2s ease', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', minHeight: '110px' }}>
        <div className="dir-header-left">
          <img src={tagaytaySeal} alt="Tagaytay Seal" style={{ width: '65px', height: '65px', borderRadius: '50%', objectFit: 'contain', backgroundColor: 'white', padding: '4px' }} />
          <div className="dir-titles" style={{ marginLeft: '10px' }}>
            <span className="dir-subtitle" style={{ color: colorPalette.accentText, fontSize: isLarge ? '1.1rem' : '0.9rem', fontWeight: 900, letterSpacing: '1px' }}>
              {lang === 'EN' ? 'REPUBLIC OF THE PHILIPPINES' : 'REPUBLIKA NG PILIPINAS'}
            </span>
            <h2 className="dir-title" style={{ color: colorPalette.primaryText, fontSize: isLarge ? '2rem' : '1.7rem', fontWeight: 900, margin: 0 }}>Tagaytay City Hall</h2>
          </div>
        </div>
        
        {/* Accessibility Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button onClick={() => setTextSize(textSize === 'normal' ? 'large' : 'normal')} style={{ background: isLarge ? '#4F46E5' : colorPalette.buttonAccentBg, color: isLarge ? 'white' : '#4F46E5', border: isLarge ? 'none' : '2px solid #4F46E5', width: '60px', height: '60px', borderRadius: '50%', fontWeight: 900, fontSize: '1.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            {isLarge ? 'A+' : 'A'}
          </button>
          <button onClick={() => setLang(lang === 'EN' ? 'TL' : 'EN')} style={{ background: colorPalette.buttonAccentBg, color: '#4F46E5', border: '2px solid #4F46E5', padding: '0 24px', height: '60px', borderRadius: '50px', fontWeight: 900, fontSize: isLarge ? '1.2rem' : '1.05rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            🌐 {lang === 'EN' ? 'English' : 'Tagalog'}
          </button>
          <button className="ui-action-btn theme-toggle-btn" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} style={{ height: '60px', background: colorPalette.buttonAccentBg, color: '#4F46E5', border: '2px solid #4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: isLarge ? '1.2rem' : '1.05rem', borderRadius: '14px', padding: '0 25px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            {isDarkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
          <div style={{ width: '2px', height: '40px', background: isDarkMode ? '#475569' : '#CBD5E1', margin: '0 5px' }} />
          <div className="dir-clock" style={{ color: colorPalette.primaryText, background: isDarkMode ? '#1E293B' : '#F1F5F9', padding: '10px 24px', borderRadius: '24px', fontWeight: 800, fontSize: isLarge ? '1.4rem' : '1.2rem', border: colorPalette.cardBorder, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '130px', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)', transition: 'all 0.2s ease' }}>
            {time}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="dir-scroll-area" style={{ padding: '40px' }}>
        
        {/* Banner Section */}
        <section className="dir-hero" style={{ background: isDarkMode ? 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)' : 'linear-gradient(135deg, #1E1B4B 0%, #4F46E5 100%)', marginBottom: '40px', padding: '50px 30px', borderRadius: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', boxSizing: 'border-box', transition: 'all 0.2s ease' }}>
          <div className="dir-hero-content" style={{ textAlign: 'center', color: '#FFFFFF', width: '100%' }}>
            <h1 style={{ fontSize: isLarge ? '3.2rem' : '2.6rem', margin: '0 0 16px 0', fontWeight: 900, letterSpacing: '-0.5px' }}>
              {lang === 'EN' ? 'Welcome to Tagaytay City Hall' : 'Maligayang Pagdating sa City Hall ng Tagaytay'}
            </h1>
            <p style={{ margin: '0 auto', textAlign: 'center', opacity: 0.95, fontSize: isLarge ? '1.6rem' : '1.3rem', fontWeight: 700, maxWidth: '800px' }}>
              {lang === 'EN' ? 'How can we help you today?' : 'Paano po namin kayo matutulungan ngayon?'}
            </p>
          </div>
        </section>

        <div className="dir-content" style={{ display: 'flex', flexDirection: 'column', gap: '50px', padding: 0 }}>
          
          {/* Core Feature Row */}
          <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
            <div className="dir-card" style={{ flex: 1, minWidth: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: colorPalette.cardBg, border: colorPalette.cardBorder, borderRadius: '24px', padding: '40px', boxShadow: '0 10px 25px rgba(0,0,0,0.02)', transition: 'all 0.2s ease' }}>
              <div>
                <span className="card-badge" style={{ fontSize: isLarge ? '1.1rem' : '0.95rem', background: '#4F46E5', color: '#FFFFFF', padding: '8px 16px', borderRadius: '8px', fontWeight: 900 }}>
                  {lang === 'EN' ? 'DIRECTORY KIOSK' : 'DIREKTORYO NG KIOSK'}
                </span>
                <div className="card-header" style={{ padding: 0, border: 'none', background: 'transparent', marginTop: '24px', marginBottom: '20px' }}>
                  <h3 style={{ color: colorPalette.primaryText, margin: 0, fontSize: isLarge ? '2.2rem' : '1.8rem', fontWeight: 900 }}>
                    {lang === 'EN' ? 'Find an Office' : 'Maghanap ng Tanggapan'}
                  </h3>
                </div>
                <div className="card-body" style={{ padding: 0, marginBottom: '30px' }}>
                  <p style={{ color: colorPalette.secondaryText, fontSize: isLarge ? '1.35rem' : '1.15rem', lineHeight: '1.6', margin: 0, fontWeight: 600 }}>
                    {lang === 'EN' ? 'Search through complete departments, check requirement listings, and look up public services.' : 'Maghanap sa mga departamento, tingnan ang mga kailangang dokumento, at alamin ang mga serbisyo publiko.'}
                  </p>
                </div>
              </div>
              <div className="card-footer" style={{ padding: 0, border: 'none', background: 'transparent' }}>
                <button className="card-btn" onClick={onNavigateToDirectory} style={replicatedButtonBaseStyle}> 
                  🔍 {lang === 'EN' ? 'Open Directory' : 'Buksan ang Direktoryo'}
                </button>
              </div>
            </div>

            <div className="dir-card" style={{ flex: 1, minWidth: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: colorPalette.cardBg, border: colorPalette.cardBorder, borderRadius: '24px', padding: '40px', boxShadow: '0 10px 25px rgba(0,0,0,0.02)', transition: 'all 0.2s ease' }}>
              <div>
                <span className="card-badge" style={{ fontSize: isLarge ? '1.1rem' : '0.95rem', background: '#4F46E5', color: '#FFFFFF', padding: '8px 16px', borderRadius: '8px', fontWeight: 900 }}>
                  {lang === 'EN' ? 'FLOOR PLANS' : 'PLANO NG PALAPAG'}
                </span>
                <div className="card-header" style={{ padding: 0, border: 'none', background: 'transparent', marginTop: '24px', marginBottom: '20px' }}>
                  <h3 style={{ color: colorPalette.primaryText, margin: 0, fontSize: isLarge ? '2.2rem' : '1.8rem', fontWeight: 900 }}>
                    {lang === 'EN' ? 'Building Map' : 'Mapa ng Gusali'}
                  </h3>
                </div>
                <div className="card-body" style={{ padding: 0, marginBottom: '30px' }}>
                  <p style={{ color: colorPalette.secondaryText, fontSize: isLarge ? '1.35rem' : '1.15rem', lineHeight: '1.6', margin: 0, fontWeight: 600 }}>
                    {lang === 'EN' ? 'Explore our comprehensive 7-floor digital interactive layout with automatic routing tracks.' : 'I-explore ang aming malawak na 7-palapag na digital layout na may automatic routing tracks.'}
                  </p>
                </div>
              </div>
              <div className="card-footer" style={{ padding: 0, border: 'none', background: 'transparent' }}>
                <button className="card-btn" onClick={onNavigateToMap} style={replicatedButtonBaseStyle}>
                  🎛️ {lang === 'EN' ? 'View Building Map' : 'Tingnan ang Mapa ng Gusali'}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Service Guides (FAQ Routing) */}
          <div>
            <h3 style={{ fontSize: isLarge ? '2.2rem' : '1.8rem', color: colorPalette.primaryText, fontWeight: 900, marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              📋 {lang === 'EN' ? 'Quick Service Guides' : 'Mga Gabay sa Transaksyon'}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '25px' }}>
              {serviceGuidesConfig.map((service, idx) => (
                <button 
                  key={idx} 
                  style={{ ...replicatedButtonBaseStyle, justifyContent: 'space-between', padding: '25px 30px', borderRadius: '20px', boxShadow: isDarkMode ? '0 4px 12px rgba(0,0,0,0.2)' : '0 4px 12px rgba(79, 70, 229, 0.05)', background: isDarkMode ? '#1E293B' : '#FFFFFF', color: colorPalette.primaryText, border: colorPalette.cardBorder }}
                  onClick={() => setSelectedService(service)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '18px', textAlign: 'left' }}>
                    <div style={{ fontSize: '2rem' }}>{service.icon}</div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: isLarge ? '1.35rem' : '1.2rem', fontWeight: 800 }}>
                        {lang === 'EN' ? service.titleEn : service.titleTl}
                      </h4>
                      <span style={{ display: 'inline-block', marginTop: '6px', color: '#4F46E5', fontSize: isLarge ? '1rem' : '0.9rem', fontWeight: 800 }}>
                        {lang === 'EN' ? 'View Requirements' : 'Tingnan ang Kailangan'}
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: '2.2rem', fontWeight: 700, opacity: 0.8, color: '#475569' }}>›</span>
                </button>
              ))}
            </div>
          </div>

          {/* Frequently Visited Offices Grid */}
          <div>
            <h3 style={{ fontSize: isLarge ? '2.2rem' : '1.8rem', color: colorPalette.primaryText, fontWeight: 900, marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s' }}>
              ★ {lang === 'EN' ? 'Frequently Visited Offices' : 'Mga Madalas Bisitahing Tanggapan'}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '25px' }}>
              {frequentOfficesConfig.map((office, idx) => (
                <button 
                  key={idx} 
                  className="card-btn" 
                  style={{ ...replicatedButtonBaseStyle, justifyContent: 'space-between', padding: '25px 30px', borderRadius: '20px', boxShadow: isDarkMode ? '0 4px 12px rgba(0,0,0,0.2)' : '0 4px 12px rgba(79, 70, 229, 0.05)' }}
                  onClick={() => onQuickRoute(office.floor, office.dbKey)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '18px', textAlign: 'left' }}>
                    <div style={{ fontSize: '1.6rem' }}>📍</div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: isLarge ? '1.45rem' : '1.25rem', fontWeight: 700 }}>
                        {lang === 'EN' ? office.name : office.nameTl}
                      </h4>
                      <span style={{ display: 'inline-block', marginTop: '6px', opacity: 0.85, fontSize: isLarge ? '1.05rem' : '0.9rem', fontWeight: 600 }}>
                        {lang === 'EN' ? office.floorLabel : office.floorLabelTl}
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: '2.2rem', fontWeight: 700, opacity: 0.8 }}>›</span>
                </button>
              ))}
            </div>
          </div>

          {/* Info Footer */}
          <div style={{ background: isDarkMode ? '#1E293B' : '#EEF2FF', border: colorPalette.cardBorder, borderRadius: '20px', padding: '30px', display: 'flex', alignItems: 'center', gap: '16px', color: isDarkMode ? '#FFFFFF' : '#0F172A', fontSize: isLarge ? '1.4rem' : '1.2rem', fontWeight: 700, transition: 'all 0.2s ease' }}>
            <span style={{ fontSize: '2rem' }}>ℹ️</span>
            <span>
              {lang === 'EN' ? (
                <>Office hours: <strong style={{ textDecoration: 'underline', color: '#4F46E5' }}>Monday – Friday, 8:00 AM – 5:00 PM.</strong> This kiosk is for information only.</>
              ) : (
                <>Oras ng Tanggapan: <strong style={{ textDecoration: 'underline', color: '#4F46E5' }}>Lunes – Biyernes, 8:00 ng Umaga – 5:00 ng Hapon.</strong> Ang kiosk na ito ay para sa impormasyon lamang.</>
              )}
            </span>
          </div>

        </div>
      </div>

      {/* POPUP MODAL FOR REQUIREMENTS & ROUTING */}
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

            {/* BAGO: SMART BUTTON LOGIC */}
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
                  onQuickRoute(selectedService.floor, selectedService.dbKey);
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

    </div>
  );
}