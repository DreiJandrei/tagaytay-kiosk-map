import React from 'react';

export default function DirectoryScreen({
  theme,
  setTheme,
  lang,
  setLang,
  textSize,
  setTextSize,
  setAppState,
  tagaytaySeal,
  time,
  currentFloor,
  setCurrentFloor,
  officeDatabase,
  handleSelectOffice
}) {
  const isDarkMode = theme === 'dark';
  const isLarge = textSize === 'large';

  const colorPalette = {
    containerBg: isDarkMode ? '#0F172A' : '#F8FAFC',
    headerBg: isDarkMode ? '#1E1B4B' : '#FFFFFF',
    cardBg: isDarkMode ? '#1E293B' : '#FFFFFF',
    primaryText: isDarkMode ? '#FFFFFF' : '#0F172A',
    secondaryText: isDarkMode ? '#94A3B8' : '#475569',
    cardBorder: isDarkMode ? '2px solid #475569' : '2px solid #E2E8F0',
    buttonAccentBg: isDarkMode ? '#334155' : '#EEF2FF',
    accentText: isDarkMode ? '#F59E0B' : '#B45309'
  };

  const floorLabels = [
    { num: 1, labelEn: '1st Floor', labelTl: 'Unang Palapag' },
    { num: 2, labelEn: '2nd Floor', labelTl: 'Ika-2 na Palapag' },
    { num: 3, labelEn: '3rd Floor', labelTl: 'Ika-3 na Palapag' },
    { num: 4, labelEn: '4th Floor', labelTl: 'Ika-4 na Palapag' },
    { num: 5, labelEn: '5th Floor', labelTl: 'Ika-5 na Palapag' },
    { num: 6, labelEn: '6th Floor', labelTl: 'Ika-6 na Palapag' },
    { num: 7, labelEn: '7th Floor', labelTl: 'Ika-7 na Palapag' }
  ];

  return (
    <div className="directory-container" style={{ backgroundColor: colorPalette.containerBg, color: colorPalette.primaryText, minHeight: '100vh', transition: 'all 0.2s ease' }}>
      
      {/* Sticky Universal Header Bar - EXACT MATCH TO DASHBOARD SIZE & PADDING */}
      <header className="dir-header" style={{ 
        backgroundColor: colorPalette.headerBg, 
        borderBottom: colorPalette.cardBorder, 
        transition: 'all 0.2s ease', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '20px 40px', 
        minHeight: '110px',
        boxSizing: 'border-box', 
        width: '100%' 
      }}>
        <div className="dir-header-left" style={{ display: 'flex', alignItems: 'center' }}>
          <img src={tagaytaySeal} alt="Tagaytay Seal" style={{ width: '65px', height: '65px', borderRadius: '50%', objectFit: 'contain', backgroundColor: 'white', padding: '4px' }} />
          <div className="dir-titles" style={{ marginLeft: '10px' }}>
            <span className="dir-subtitle" style={{ color: colorPalette.accentText, fontSize: isLarge ? '1.1rem' : '0.9rem', fontWeight: 900, letterSpacing: '1px' }}>
              {lang === 'EN' ? 'REPUBLIC OF THE PHILIPPINES' : 'REPUBLIKA NG PILIPINAS'}
            </span>
            <h2 className="dir-title" style={{ color: colorPalette.primaryText, fontSize: isLarge ? '2rem' : '1.7rem', fontWeight: 900, margin: 0 }}>Tagaytay City Hall</h2>
          </div>
        </div>

        {/* Dynamic Multi-Feature Accessibility Control Cluster - EXACT MATCH TO DASHBOARD */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          
          {/* 1. TEXT SIZE TOGGLE */}
          <button 
            onClick={() => setTextSize(textSize === 'normal' ? 'large' : 'normal')}
            style={{ 
              background: isLarge ? '#4F46E5' : colorPalette.buttonAccentBg, 
              color: isLarge ? 'white' : '#4F46E5', 
              border: isLarge ? 'none' : '2px solid #4F46E5', width: '60px', height: '60px', borderRadius: '50%',
              fontWeight: 900, fontSize: '1.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', transition: 'all 0.2s'
            }}
          >
            {isLarge ? 'A+' : 'A'}
          </button>

          {/* 2. TRANSLATION INTERACTIVE INTERFACE */}
          <button 
            onClick={() => setLang(lang === 'EN' ? 'TL' : 'EN')}
            style={{ 
              background: colorPalette.buttonAccentBg, color: '#4F46E5', border: '2px solid #4F46E5', 
              padding: '0 24px', height: '60px', borderRadius: '50px',
              fontWeight: 900, fontSize: isLarge ? '1.2rem' : '1.05rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', transition: 'all 0.2s'
            }}
          >
            🌐 {lang === 'EN' ? 'English' : 'Tagalog'}
          </button>

          {/* 3. LIGHT / DARK VISUAL STYLES MODULE */}
          <button 
            className="ui-action-btn theme-toggle-btn" 
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            style={{ 
              height: '60px', background: colorPalette.buttonAccentBg, color: '#4F46E5', border: '2px solid #4F46E5',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: isLarge ? '1.2rem' : '1.05rem', borderRadius: '14px', padding: '0 25px', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', transition: 'all 0.2s'
            }}
          >
            {isDarkMode ? "☀️ Light" : "🌙 Dark"}
          </button>

          <div style={{ width: '2px', height: '40px', background: isDarkMode ? '#475569' : '#CBD5E1', margin: '0 5px' }} />

          {/* Home Dashboard Navigation Button Route */}
          <button 
            onClick={() => setAppState('dashboard')}
            style={{ 
              background: '#0d3674', color: 'white', border: 'none', 
              padding: isLarge ? '14px 30px' : '10px 24px', height: '60px', borderRadius: '50px', fontWeight: 900, 
              fontSize: isLarge ? '1.2rem' : '1.05rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.15)'
            }}
          >
            🏠 {lang === 'EN' ? 'Home' : 'Tahanan'}
          </button>
          
          {/* MATCHED CAPSULE CLOCK LOOK FROM DASHBOARD */}
          <div 
            className="dir-clock" 
            style={{ 
              color: colorPalette.primaryText,
              background: isDarkMode ? '#1E293B' : '#F1F5F9',
              padding: '10px 24px',
              borderRadius: '24px',
              fontWeight: 800,
              fontSize: isLarge ? '1.4rem' : '1.2rem',
              border: colorPalette.cardBorder,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '130px',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
              transition: 'all 0.2s ease'
            }}
          >
            {time}
          </div>
        </div>
      </header>

      {/* Main Container Area */}
      <div className="dir-scroll-area" style={{ padding: '40px' }}>
        
        {/* Balanced and Centered Hero Title Section Banner */}
        <section className="dir-hero" style={{ 
          background: isDarkMode ? 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)' : 'linear-gradient(135deg, #1E1B4B 0%, #4F46E5 100%)', 
          marginBottom: '40px', 
          padding: isLarge ? '50px 30px' : '40px 20px', 
          borderRadius: '20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          boxSizing: 'border-box',
          transition: 'all 0.2s ease'
        }}>
          <div className="dir-hero-content" style={{ textAlign: 'center', color: '#FFFFFF', width: '100%' }}>
            <h1 style={{ fontSize: isLarge ? '3.2rem' : '2.4rem', margin: '0 0 16px 0', fontWeight: 900, letterSpacing: '-0.5px' }}>
              {lang === 'EN' ? 'Where would you like to go today?' : 'Saan mo gustong pumunta ngayon?'}
            </h1>
            <p style={{ margin: '0 auto', textAlign: 'center', opacity: 0.95, fontSize: isLarge ? '1.5rem' : '1.15rem', fontWeight: 700, maxWidth: '800px' }}>
              {lang === 'EN' ? 'Explore our offices, view transaction requirements, and get interactive directions.' : 'Suriin ang aming mga opisina, alamin ang mga kailangan sa transaksyon, at kumuha ng direksyon.'}
            </p>
          </div>
        </section>

        {/* Floor Selection Bar Layout */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '40px', flexWrap: 'wrap' }}>
          {floorLabels.map((floor) => {
            const isSelected = currentFloor === floor.num;
            return (
              <button
                key={floor.num}
                onClick={() => setCurrentFloor(floor.num)}
                style={{
                  padding: isLarge ? '18px 36px' : '12px 24px',
                  borderRadius: '50px',
                  fontWeight: 800,
                  fontSize: isLarge ? '1.3rem' : '0.95rem',
                  cursor: 'pointer',
                  border: isSelected ? 'none' : colorPalette.cardBorder,
                  background: isSelected ? '#1E1B4B' : colorPalette.cardBg,
                  color: isSelected ? '#FFFFFF' : colorPalette.primaryText,
                  boxShadow: isSelected ? '0 10px 20px rgba(30,27,75,0.2)' : '0 2px 4px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s ease'
                }}
              >
                {lang === 'EN' ? floor.labelEn : floor.labelTl}
              </button>
            );
          })}
        </div>

        {/* Interactive Grid Container Office Cards Layout */}
        <div className="dir-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '30px', maxWidth: '1600px', margin: '0 auto' }}>
          {Object.keys(officeDatabase[currentFloor] || {}).length > 0 ? (
            Object.entries(officeDatabase[currentFloor]).map(([key, office]) => (
              <div 
                className="dir-card" 
                key={key}
                style={{
                  backgroundColor: colorPalette.cardBg,
                  border: colorPalette.cardBorder,
                  borderRadius: '24px',
                  padding: '35px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: isDarkMode ? '0 6px 16px rgba(0,0,0,0.3)' : '0 6px 16px rgba(0,0,0,0.02)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div>
                  <div className="card-header" style={{ padding: 0, border: 'none', background: 'transparent', marginBottom: '25px' }}>
                    <span className="card-badge" style={{ 
                      fontSize: isLarge ? '1.1rem' : '0.8rem', 
                      background: isDarkMode ? '#334155' : '#EEF2FF', 
                      color: '#4F46E5', 
                      padding: isLarge ? '8px 16px' : '6px 12px', 
                      borderRadius: '8px', 
                      fontWeight: 800,
                      border: isDarkMode ? '1px solid #475569' : '1px solid #E2E8F0'
                    }}>
                      {office.badge}
                    </span>
                    <h3 style={{ color: colorPalette.primaryText, marginTop: '16px', marginBottom: 0, fontSize: isLarge ? '2.2rem' : '1.5rem', fontWeight: 900, lineHeight: '1.2' }}>
                      {office.title}
                    </h3>
                  </div>

                  <div className="card-body" style={{ padding: 0, display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '25px' }}>
                    <p className="card-info" style={{ color: colorPalette.secondaryText, display: 'flex', alignItems: 'center', gap: '10px', margin: 0, fontSize: isLarge ? '1.35rem' : '1.05rem', fontWeight: 600 }}>
                      <span className="emoji-icon" style={{ fontSize: isLarge ? '1.6rem' : '1.2rem' }}>👤</span> 
                      <strong style={{ color: colorPalette.primaryText, fontWeight: 800 }}>{lang === 'EN' ? 'Head:' : 'Pinuno:'}</strong> 
                      {office.head || "N/A"}
                    </p>
                    <p className="card-info" style={{ color: colorPalette.secondaryText, display: 'flex', alignItems: 'center', gap: '10px', margin: 0, fontSize: isLarge ? '1.35rem' : '1.05rem', fontWeight: 600 }}>
                      <span className="emoji-icon" style={{ fontSize: isLarge ? '1.6rem' : '1.2rem' }}>🕒</span> 
                      <strong style={{ color: colorPalette.primaryText, fontWeight: 800 }}>{lang === 'EN' ? 'Hours:' : 'Oras:'}</strong> 
                      {office.hours || "N/A"}
                    </p>
                    
                    {office.requirements && office.requirements.length > 0 && (
                      <div className="card-reqs" style={{ 
                        background: isDarkMode ? '#1E293B' : '#F8FAFC', 
                        padding: isLarge ? '24px' : '18px', 
                        borderRadius: '12px', 
                        marginTop: '15px',
                        border: colorPalette.cardBorder 
                      }}>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: isLarge ? '1.25rem' : '1rem', color: colorPalette.primaryText, fontWeight: 800 }}>
                          📋 {lang === 'EN' ? 'Requirements:' : 'Mga Kakailanganin:'}
                        </h4>
                        <ul style={{ margin: 0, paddingLeft: '24px', color: colorPalette.secondaryText, fontSize: isLarge ? '1.2rem' : '0.95rem', lineHeight: '1.6' }}>
                          {office.requirements.map((req, i) => (
                            <li key={i} style={{ marginBottom: '6px', fontWeight: 600 }}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="card-footer" style={{ padding: 0, background: 'transparent', border: 'none', paddingTop: '15px' }}>
                  <button 
                    className="card-btn"
                    onClick={() => {
                      setAppState('map');
                      handleSelectOffice(key);
                    }}
                    style={{ 
                      width: '100%', 
                      padding: isLarge ? '24px' : '18px', 
                      borderRadius: '14px', 
                      background: isDarkMode ? '#334155' : '#EEF2FF', 
                      color: isDarkMode ? '#FFFFFF' : '#4F46E5', 
                      border: 'none', 
                      fontWeight: 800, 
                      fontSize: isLarge ? '1.4rem' : '1.1rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    📍 {lang === 'EN' ? 'View on Map' : 'Tingnan sa Mapa'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-floor-message" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '80px 20px', background: colorPalette.cardBg, border: isDarkMode ? '2px dashed #475569' : '2px dashed #CBD5E1', borderRadius: '24px', color: colorPalette.secondaryText }}>
              <h2 style={{ fontSize: isLarge ? '2.5rem' : '2rem', color: colorPalette.primaryText, margin: '0 0 15px 0', fontWeight: 800 }}>
                {lang === 'EN' ? '🏗️ Directory updates coming soon!' : '🏗️ Malapit na ang update sa direktoryo!'}
              </h2>
              <p style={{ fontSize: isLarge ? '1.4rem' : '1.2rem', margin: 0, fontWeight: 600 }}>
                {lang === 'EN' ? `The office data for Level ${currentFloor} is currently being updated by the administration.` : `Ang impormasyon para sa Palapag ${currentFloor} ay kasalukuyang ina-update ng pamunuan.`}
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}