import React, { useState, useEffect, useCallback } from 'react';
import tagaytaySeal from './assets/tagaytay-seal.jpg';
import cityhallBg from './assets/cityhall.jpg';
import WelcomeVideo from './components/WelcomeVideo';
import HowToUse from './components/HowToUse';
import { VolumePanel, VolumeToggle } from './components/VolumeControl';
import { useAutoHide, useStoredVolume } from './lib/volume';
import { getAnnouncement } from './lib/api';

export default function WelcomeScreen({ onStart }) {
  const [advisory, setAdvisory] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [now, setNow] = useState(new Date());
  // Ang layer sa likod na pinagguguhitan ng video (tingnan ang
  // WelcomeVideo). State at hindi ref: kailangang mag-render ulit ang
  // video kapag handa na ang node na ito.
  const [videoHost, setVideoHost] = useState(null);
  // Iisang tunog lang (tingnan ang WelcomeVideo). Kanino ang tunog ngayon —
  // ang anunsyo sa kard ('side') o ang background — at kung talagang
  // tumutunog ang kard.
  const [soundOwner, setSoundOwner] = useState('side');
  const [sideAudible, setSideAudible] = useState(false);
  const claimForSide = useCallback((on) => { if (on) setSoundOwner('side'); }, []);
  const claimForBackground = useCallback((on) => setSoundOwner(on ? 'background' : 'side'), []);
  const backToSide = useCallback(() => setSoundOwner('side'), []);
  // Lakas ng tunog (0–100), hiwalay sa background at sa City Updates.
  // Natatandaan kahit i-restart ang kiosk. Ang sa City Updates ay nasa
  // kard mismo (tingnan ang WelcomeVideo); ang sa background ay dito.
  const [bgVolume, setBgVolume] = useStoredVolume('kiosk-welcome-volume-bg');
  const [sideVolume, setSideVolume] = useStoredVolume('kiosk-welcome-volume-side');
  const [bgAudible, setBgAudible] = useState(false);
  const bgSlider = useAutoHide();
  // Dito inilalagay ng background na video ang 🔊 niya — sa loob mismo ng
  // kahon ng lakas ng tunog sa kaliwang ibaba.
  const [soundSlot, setSoundSlot] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  // Patayo ba ang nasa kard ngayon (poster, Reels). Kapag oo, buong taas
  // ito sa kanang dulo ng screen, at sa natitirang lapad ang lahat ng iba.
  const [sidePortrait, setSidePortrait] = useState(false);

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
    <div className={`welcome-screen${sidePortrait ? ' has-side-portrait' : ''}`} onClick={onStart}>

      {/* Layer 1: dahan-dahang gumagalaw na larawan ng City Hall */}
      <div
        className="welcome-bg"
        style={{ backgroundImage: `url(${cityhallBg})` }}
        aria-hidden="true"
      />
      {/* Layer 1b: ang background na video (hal. "Welcome to Tagaytay"),
          buong screen. Nakapatong sa larawan ng City Hall — iyon ang
          lumalabas kapag walang naka-"Background" sa Admin Panel. */}
      <div className="welcome-video-host" ref={setVideoHost} aria-hidden="true" />
      {videoHost && (
        <WelcomeVideo
          placement="background"
          backgroundHost={videoHost}
          soundSlot={soundSlot}
          otherAudible={sideAudible}
          volume={bgVolume}
          onAudibleChange={setBgAudible}
          onClaimSound={claimForBackground}
        />
      )}
      <div className="welcome-tint" aria-hidden="true" />
      <div className="welcome-vignette" aria-hidden="true" />
      <div className="welcome-glow" aria-hidden="true" />

      {/* Layer 2: nilalaman. Nagbabago ang taas ng kahon kapag may
          gumagalaw na advisory sa ilalim, para walang natatakpan. */}
      <div className={`welcome-content${hasAdvisory ? ' has-advisory' : ''}`}>

        {/* Itaas: petsa at oras */}
        <div className="welcome-topbar">
          <span className="welcome-date">{dateText}</span>
          <div className="welcome-topbar-right">
            <span className="welcome-time">{timeText}</span>
            <button
              type="button"
              className="welcome-help-btn"
              onClick={(e) => { e.stopPropagation(); setShowHelp(true); }}
              aria-label="How to use / Paano gamitin"
            >
              <span className="welcome-help-icon" aria-hidden="true">i</span>
              <span className="welcome-help-label">How to Use</span>
            </button>
          </div>
        </div>

        {/* Gitna. Dalawang palapag: magkatabing hanay sa itaas, tapos ang
            anunsyo na nakasentro sa ilalim ng dalawa. */}
        <div className="welcome-main">

        <div className="welcome-columns">

        {/* Seal, pamagat, at prompt */}
        <div className="welcome-hero">
          <div className="welcome-seal-wrap">
            <span className="welcome-seal-ring" aria-hidden="true" />
            <span className="welcome-seal-ring delay" aria-hidden="true" />
            <img src={tagaytaySeal} alt="Tagaytay City Seal" className="welcome-seal" />
          </div>

          <p className="welcome-republic">Republic of the Philippines</p>

          <h1 className="welcome-title">
            <span className="welcome-title-kiosk">Interactive Directory Kiosk</span>
            <span className="welcome-title-for">for the City Government of</span>
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

        {/* Kanan: mga anunsyong video (naka-"Anunsyo" sa Admin Panel).
            Nagiging magkatabi ang hero at ang video kapag may laman ito. */}
        <div className="welcome-board-slot">
          <WelcomeVideo
            placement="side"
            isOwner={soundOwner === 'side'}
            volume={sideVolume}
            onVolumeChange={setSideVolume}
            onAudibleChange={setSideAudible}
            onClaimSound={claimForSide}
            onItemChange={backToSide}
            onShapeChange={setSidePortrait}
          />
        </div>

        </div>

        {/* Ilalim: nakasentro ang opisyal na anunsyo sa ilalim ng hero at
            ng video — hindi na ito nakakabit sa kanang hanay. */}
        {hasAnnouncement && (
          <div className="welcome-board">
            <div className="welcome-board-head">
              <span className="welcome-board-icon">📰</span>
              <h2>Official Announcement</h2>
            </div>
            <div className="welcome-board-body">{announcement}</div>
          </div>
        )}

        </div>
      </div>

      {/* Kaliwang ibaba: ang 🔊 ng background (inilalagay ng WelcomeVideo
          sa slot) at, habang tumutunog ang background, ang 🎚️ na
          nagpapakita o nagtatago ng lakas nito sa ibabaw. Walang laman?
          Nakatago (tingnan ang CSS). Hindi nagsisimula ng kiosk ang
          pindot dito. */}
      <div
        className="welcome-volume"
        onClick={(e) => e.stopPropagation()}
        role="group"
        aria-label="Tunog ng background"
      >
        <span className="welcome-volume-slot" ref={setSoundSlot} />
        {bgAudible && (
          <VolumeToggle open={bgSlider.open} onToggle={bgSlider.toggle} label="ng background" />
        )}
        {bgAudible && bgSlider.open && (
          <VolumePanel
            vertical
            value={bgVolume}
            onChange={setBgVolume}
            onActivity={bgSlider.keepOpen}
            label="ng background"
          />
        )}
      </div>

      {showHelp && <HowToUse onClose={() => setShowHelp(false)} />}

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