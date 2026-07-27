import React, { useState, useEffect } from 'react';
import tagaytaySeal from './assets/tagaytay-seal.jpg';
import cityhallBg from './assets/cityhall.jpg';
import { getAnnouncement } from './lib/api'; // Kukunin natin ang API logic

export default function WelcomeScreen({ onStart }) {
  const [announcement, setAnnouncement] = useState("");

  // Kukunin ang text galing database tuwing maglo-load ang Idle Screen
  useEffect(() => {
    const fetchAnnouncement = async () => {
      const text = await getAnnouncement();
      if (text) setAnnouncement(text);
    };
    
    fetchAnnouncement();

    // Re-check natin ang database every 1 minute incase may in-update sa admin
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

      {/* BAGO: Ipapalabas lang natin ito kung may laman ang announcement! */}
      {announcement && announcement.trim() !== "" && (
        <div className="announcement-bar">
          <div className="marquee">
            📢 CITY HALL ADVISORY: {announcement}
          </div>
        </div>
      )}
    </div>
  );
}