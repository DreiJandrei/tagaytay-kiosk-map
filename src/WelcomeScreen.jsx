import React, { useState, useEffect } from 'react';
import tagaytaySeal from './assets/tagaytay-seal.jpg';
import cityhallBg from './assets/cityhall.jpg';
import { getAnnouncement } from './lib/api'; 

export default function WelcomeScreen({ onStart }) {
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    const fetchAnnouncement = async () => {
      const text = await getAnnouncement();
      if (text) setAnnouncement(text);
    };
    
    fetchAnnouncement();
    const interval = setInterval(fetchAnnouncement, 60000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="welcome-screen" 
      onClick={onStart}
      style={{
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.95)), url(${cityhallBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="welcome-content">
        <img src={tagaytaySeal} alt="Tagaytay Seal" className="welcome-seal" />
        <h1 className="welcome-title">Welcome to<br/><span className="gold-text">Tagaytay City Hall</span></h1>
        <p className="welcome-subtitle">Character City of the South</p>
        <button className="touch-prompt">
          <span className="pulse-icon">👆</span> Touch the screen to start
        </button>
      </div>

      {announcement && announcement.trim() !== "" && (
        <div className="announcement-bar">
          <div className="marquee">
            <span style={{ color: '#FBBF24', marginRight: '10px', fontWeight: '900' }}>📢 CITY HALL ADVISORY:</span>
            {announcement.split('\n').map((line, index, array) => (
              <React.Fragment key={index}>
                {line}
                {index !== array.length - 1 && (
                  <span style={{ margin: '0 25px', color: '#60A5FA' }}> 🔹 </span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}