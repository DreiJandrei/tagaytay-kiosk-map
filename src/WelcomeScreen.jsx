import React from 'react';
import tagaytaySeal from './assets/tagaytay-seal.jpg';
import cityhallBg from './assets/cityhall.jpg'; // Ibinalik ko na ang pag-import sa picture ng City Hall niyo!

export default function WelcomeScreen({ onStart }) {
  return (
    <div 
      className="welcome-screen" 
      onClick={onStart}
      style={{
        /* Dito natin ibinalik yung cityhallBg na galing sa assets ninyo */
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
    </div>
  );
}