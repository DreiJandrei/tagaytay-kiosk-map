import React, { useState, useEffect } from 'react';
import tagaytaySeal from './assets/tagaytay-seal.jpg';
import cityhallBg from './assets/cityhall.jpg';
import WelcomeVideo from './components/WelcomeVideo';
import { getAnnouncement } from './lib/api';

export default function WelcomeScreen({ onStart }) {
  const [advisory, setAdvisory] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [now, setNow] = useState(new Date());
  // Ang tatlong lugar na pinagguguhitan ng WelcomeVideo: likod, gitna, at
  // ibaba. State at hindi ref: kailangang mag-render ulit ang video kapag
  // handa na ang mga node na ito.
  const [bgHost, setBgHost] = useState(null);
  const [centerHost, setCenterHost] = useState(null);
  const [dockHost, setDockHost] = useState(null);
  // Alin ang anyo ng screen ngayon — sinasabi ng WelcomeVideo batay sa
  // tumutugtog. Tingnan ang paliwanag doon ('none' | 'center' | 'fullscreen').
  const [layout, setLayout] = useState('none');

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

  // Iisang "Touch the screen to start" — sa hero kapag walang media, sa
  // ibaba ng screen kapag mayroon (doon ito nakapatong sa larawan o video).
  const prompt = (
    <div className="welcome-prompt-group">
      <div className="welcome-prompt">
        <span className="welcome-prompt-ripple" aria-hidden="true" />
        <span className="welcome-prompt-hand">👆</span>
        <span className="welcome-prompt-text">Touch the screen to start</span>
      </div>
      <p className="welcome-subprompt">Pindutin ang screen upang magsimula</p>
    </div>
  );

  // Ang opisyal na anunsyo: sa ilalim ng hero ('none'), o sa kanan ('center').
  const board = hasAnnouncement && (
    <div className={`welcome-board${layout === 'center' ? ' is-side' : ''}`}>
      <div className="welcome-board-head">
        <span className="welcome-board-icon">📰</span>
        <h2>Official Announcement</h2>
      </div>
      <div className="welcome-board-body">{announcement}</div>
    </div>
  );

  return (
    <div
      className={`welcome-screen layout-${layout}${hasAdvisory ? ' has-advisory' : ''}`}
      onClick={onStart}
    >

      {/* Layer 1: dahan-dahang gumagalaw na larawan ng City Hall */}
      <div
        className="welcome-bg"
        style={{ backgroundImage: `url(${cityhallBg})` }}
        aria-hidden="true"
      />
      {/* Layer 1b: ang pahigang video, buong screen ('fullscreen'). */}
      <div className="welcome-video-host" ref={setBgHost} aria-hidden="true" />
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

        <div className="welcome-main">

        {/* 'none'   — hero sa gitna, anunsyo sa ilalim (dating anyo).
            'center' — hero sa kaliwa, larawan/video sa gitna, anunsyo sa kanan.
            'fullscreen' — wala ang hero at anunsyo; video na ang background. */}
        <div className="welcome-columns">

        {layout !== 'fullscreen' && (
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

            {layout === 'none' && prompt}
          </div>
        )}

        {/* Gitna: larawan o patayong video ('center'). `display: contents`
            ito, kaya ang kard mismo ang nagiging hanay. */}
        <div className="welcome-center-host" ref={setCenterHost} />

        {layout === 'center' && board}

        </div>

        {layout === 'none' && board}

        </div>
      </div>

      {/* Ibaba, nakapatong sa ibabaw ng advisory: ang "Touch the screen to
          start" — at sa 'fullscreen', ang pamagat at caption ng video. */}
      <div className="welcome-dock">
        <div className="welcome-dock-host" ref={setDockHost} />
        {layout !== 'none' && prompt}
      </div>

      {bgHost && centerHost && dockHost && (
        <WelcomeVideo
          hosts={{ background: bgHost, center: centerHost, dock: dockHost }}
          onLayoutChange={setLayout}
        />
      )}

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