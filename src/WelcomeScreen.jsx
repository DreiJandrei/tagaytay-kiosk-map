import React, { useState, useEffect } from 'react';
import tagaytaySeal from './assets/tagaytay-seal.jpg';
import cityhallBg from './assets/cityhall.jpg';
import { getAnnouncement } from './lib/api'; 

export default function WelcomeScreen({ onStart }) {
  const [advisory, setAdvisory] = useState("");
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    const fetchAnnouncement = async () => {
      const text = await getAnnouncement();
      if (text) {
        try {
          // JSON Trick: Binabasa ang dalawang field mula sa iisang database row
          const parsed = JSON.parse(text);
          setAdvisory(parsed.advisory || "");
          setAnnouncement(parsed.announcement || "");
        } catch (e) {
          // Backward compatibility kung normal text lang ang nasa database
          setAdvisory(text);
        }
      }
    };
    
    fetchAnnouncement();
    const interval = setInterval(fetchAnnouncement, 60000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      onClick={onStart}
      style={{
        position: 'fixed',
        inset: 0,
        // TAGAYTAY BLUE THEME: Deep Royal Blue to Navy Blue Gradient Overlay
        backgroundImage: `linear-gradient(to bottom, rgba(30, 58, 138, 0.85), rgba(15, 23, 42, 0.95)), url(${cityhallBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '50px',
        paddingBottom: advisory && advisory.trim() !== "" ? '90px' : '40px',
        cursor: 'pointer',
        zIndex: 9999
      }}
    >
      {/* 1. UPPER SECTION: Title & Touch to Start */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', animation: 'fadeInSlideUp 1s ease forwards' }}>
        <img src={tagaytaySeal} alt="Tagaytay Seal" style={{ width: '160px', height: '160px', borderRadius: '50%', border: '5px solid white', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', backgroundColor: 'white', padding: '5px' }} />
        
        <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '4.8rem', color: 'white', fontWeight: 900, margin: '20px 0 10px 0', textShadow: '0 10px 20px rgba(0,0,0,0.8)', textAlign: 'center', lineHeight: '1.1' }}>
          Welcome to<br/><span style={{ color: '#FBBF24' }}>Tagaytay City Hall</span>
        </h1>
        
        <p style={{ fontSize: '1.6rem', color: '#E2E8F0', fontWeight: 600, letterSpacing: '4px', textTransform: 'uppercase', margin: '0 0 35px 0' }}>
          Character City of the South
        </p>

        <button style={{ background: 'linear-gradient(135deg, #2563EB, #1E3A8A)', border: '3px solid #60A5FA', padding: '20px 60px', borderRadius: '50px', color: 'white', fontSize: '2rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 15px 30px rgba(37, 99, 235, 0.4)', animation: 'pulsePrompt 2s infinite', pointerEvents: 'none' }}>
          <span style={{ fontSize: '2.5rem' }}>👆</span> TOUCH THE SCREEN TO START
        </button>
      </div>

      {/* 2. MIDDLE/LOWER SECTION: Official Announcement Board */}
      <div style={{ width: '90%', maxWidth: '1100px', marginBottom: '20px', zIndex: 10, animation: 'fadeInSlideUp 1.5s ease forwards' }}>
        {announcement && announcement.trim() !== "" && (
          <div style={{ background: 'rgba(30, 58, 138, 0.4)', backdropFilter: 'blur(20px)', border: '2px solid rgba(96, 165, 250, 0.5)', borderRadius: '24px', padding: '35px 45px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', borderBottom: '2px solid rgba(255,255,255,0.2)', paddingBottom: '15px', marginBottom: '20px' }}>
              <span style={{ fontSize: '2.5rem' }}>📰</span>
              <h2 style={{ color: '#FBBF24', fontSize: '2rem', fontWeight: 900, margin: 0, letterSpacing: '1.5px', textTransform: 'uppercase' }}>Official Announcement</h2>
            </div>
            <div style={{ color: 'white', fontSize: '1.4rem', lineHeight: '1.7', fontWeight: 600, whiteSpace: 'pre-line' }}>
              {announcement}
            </div>
          </div>
        )}
      </div>

      {/* 3. ABSOLUTE BOTTOM: Scrolling Advisory Marquee */}
      {advisory && advisory.trim() !== "" && (
        <div className="announcement-bar" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', background: 'rgba(15, 23, 42, 0.95)', borderTop: '4px solid #EF4444', padding: '15px 0' }}>
          <div className="marquee">
            <span style={{ color: '#EF4444', marginRight: '15px', fontWeight: '900' }}>🚨 ADVISORY:</span>
            {advisory.split('\n').map((line, index, array) => (
              <React.Fragment key={index}>
                {line}
                {index !== array.length - 1 && (
                  <span style={{ margin: '0 30px', color: '#94A3B8' }}> • </span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}