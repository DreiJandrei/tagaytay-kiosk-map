import React, { useState, useEffect } from 'react';
import tagaytaySeal from './assets/tagaytay-seal.jpg';
import cityhallBg from './assets/cityhall.jpg';
import WelcomeVideo from './components/WelcomeVideo';
import { getAnnouncement } from './lib/api';

export default function WelcomeScreen({ onStart }) {
  const [advisory, setAdvisory] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [now, setNow] = useState(new Date());

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

  // Buhay na orasan para sa kiosk
  useEffect(() => {
    const clock = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);

  const hasAdvisory = advisory && advisory.trim() !== "";
  const hasAnnouncement = announcement && announcement.trim() !== "";

  const timeText = now.toLocaleTimeString('en-PH', {
    hour: '2-digit', minute: '2-digit', hour12: true
  });
  const dateText = now.toLocaleDateString('en-PH', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  });

  return (
    <div className="welcome-screen" onClick={onStart}>

      {/* Layer 1: dahan-dahang gumagalaw na larawan ng City Hall */}
      <div
        className="welcome-bg"
        style={{ backgroundImage: `url(${cityhallBg})` }}
        aria-hidden="true"
      />
      <div className="welcome-tint" aria-hidden="true" />
      <div className="welcome-vignette" aria-hidden="true" />
      <div className="welcome-glow" aria-hidden="true" />

      {/* Layer 2: nilalaman. Nagbabago ang taas ng kahon kapag may
          gumagalaw na advisory sa ilalim, para walang natatakpan. */}
      <div className={`welcome-content${hasAdvisory ? ' has-advisory' : ''}`}>

        {/* Itaas: petsa at oras */}
        <div className="welcome-topbar">
          <span className="welcome-date">{dateText}</span>
          <span className="welcome-time">{timeText}</span>
        </div>

        {/* Gitna. Nagiging magkatabi ang hero at ang mga kard kapag may
            laman ang board slot — doon kasi may sobrang espasyo, at ang
            pagpapatong-patong pababa ang dahilan ng pag-apaw. */}
        <div className="welcome-main">

        {/* Seal, pamagat, at prompt */}
        <div className="welcome-hero">
          <div className="welcome-seal-wrap">
            <span className="welcome-seal-ring" aria-hidden="true" />
            <span className="welcome-seal-ring delay" aria-hidden="true" />
            <img src={tagaytaySeal} alt="Tagaytay City Seal" className="welcome-seal" />
          </div>

          <p className="welcome-republic">Republic of the Philippines</p>

          <h1 className="welcome-title">
            City Government of
            <span className="welcome-title-accent">Tagaytay</span>
          </h1>

          <div className="welcome-rule" aria-hidden="true">
            <span /><em>★</em><span />
          </div>

          <p className="welcome-tagline">Character City of the South</p>

          <div className="welcome-prompt">
            <span className="welcome-prompt-ripple" aria-hidden="true" />
            <span className="welcome-prompt-hand">👆</span>
            <span className="welcome-prompt-text">Touch the screen to start</span>
          </div>

          <p className="welcome-subprompt">Pindutin ang screen upang magsimula</p>
        </div>

        {/* Ibaba: opisyal na anunsyo katabi ng mga video ng lungsod */}
        <div className="welcome-board-slot">
          {hasAnnouncement && (
            <div className="welcome-board">
              <div className="welcome-board-head">
                <span className="welcome-board-icon">📰</span>
                <h2>Official Announcement</h2>
              </div>
              <div className="welcome-board-body">{announcement}</div>
            </div>
          )}
          <WelcomeVideo />
        </div>

        </div>
      </div>

      {/* Layer 3: gumagalaw na advisory sa pinakailalim */}
      {hasAdvisory && (
        <div className="announcement-bar">
          <div className="marquee">
            <span className="advisory-tag">🚨 ADVISORY:</span>
            {advisory.split('\n').map((line, index, array) => (
              <React.Fragment key={index}>
                {line}
                {index !== array.length - 1 && (
                  <span className="advisory-dot"> • </span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}