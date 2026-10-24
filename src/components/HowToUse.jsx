import { useEffect, useRef, useState } from 'react';

// Kusang nagsasara kapag iniwan ng bisita — para hindi maiwang nakatakip
// ang tutorial sa idle screen hanggang sa susunod na tao.
const AUTO_CLOSE_MS = 90000;

const CONTENT = {
  EN: {
    title: 'How to Use the Kiosk',
    subtitle: 'Find any office in City Hall in a few taps.',
    stepsHead: 'Finding an office',
    steps: [
      ['👆', 'Touch the screen', 'Tap anywhere on this screen to start.'],
      ['🔍', 'Find the office', 'Type its name in the search box, or pick it from the list.'],
      ['🪜', 'Choose stairs or elevator', 'If the office is upstairs, pick how you want to go up.'],
      ['🗺️', 'Follow the map', 'The line on the map shows the way to the office.'],
      ['📱', 'Take the map with you', 'Scan the QR code with your phone camera to keep the directions.'],
    ],
    screenHead: 'On this screen',
    screen: [
      ['🔊', 'Sound', 'Tap the round 🔊 button at the bottom left to turn the sound on or off.'],
      ['🎚️', 'Volume', 'Tap 🎚️ above the sound button to show the slider. Drag it up or down, or press + and −. Tap ✕ to hide it.'],
      ['👈', 'More announcements', 'Swipe the announcement card left or right to see the others.'],
    ],
    topHead: 'Buttons at the top of the map',
    top: [
      ['🌐', 'Language', 'Switch between English and Tagalog.'],
      ['AA', 'Bigger text', 'Make the words easier to read.'],
      ['🏠', 'Back to start', 'Return to this screen when you are done.'],
    ],
    close: 'Got it',
    other: 'Tagalog',
  },
  TL: {
    title: 'Paano Gamitin ang Kiosk',
    subtitle: 'Hanapin ang kahit anong opisina sa City Hall sa ilang pindot lang.',
    stepsHead: 'Paghahanap ng opisina',
    steps: [
      ['👆', 'Pindutin ang screen', 'Pindutin kahit saan sa screen na ito para magsimula.'],
      ['🔍', 'Hanapin ang opisina', 'I-type ang pangalan nito sa search, o piliin sa listahan.'],
      ['🪜', 'Hagdan o elevator', 'Kung nasa itaas ang opisina, piliin kung paano aakyat.'],
      ['🗺️', 'Sundan ang mapa', 'Ang guhit sa mapa ang daan papunta sa opisina.'],
      ['📱', 'Dalhin ang mapa', 'I-scan ang QR code gamit ang camera ng phone para dala mo ang direksyon.'],
    ],
    screenHead: 'Sa screen na ito',
    screen: [
      ['🔊', 'Tunog', 'Pindutin ang bilog na 🔊 sa kaliwang ibaba para buksan o patayin ang tunog.'],
      ['🎚️', 'Lakas ng tunog', 'Pindutin ang 🎚️ sa ibabaw ng buton ng tunog para lumabas ang slider. I-drag pataas o pababa, o pindutin ang + at −. Pindutin ang ✕ para itago.'],
      ['👈', 'Iba pang anunsyo', 'I-swipe pakaliwa o pakanan ang kard ng anunsyo para makita ang iba.'],
    ],
    topHead: 'Mga buton sa itaas ng mapa',
    top: [
      ['🌐', 'Wika', 'Palitan sa English o Tagalog.'],
      ['AA', 'Palakihin ang teksto', 'Para mas madaling basahin ang mga salita.'],
      ['🏠', 'Bumalik sa simula', 'Bumalik sa screen na ito kapag tapos ka na.'],
    ],
    close: 'Sige, gets ko',
    other: 'English',
  },
};

function Section({ head, items, numbered }) {
  return (
    <section className="howto-section">
      <h3>{head}</h3>
      <ol className={`howto-list${numbered ? ' is-numbered' : ''}`}>
        {items.map(([icon, label, text], i) => (
          <li key={label}>
            <span className="howto-icon" aria-hidden="true">{numbered ? i + 1 : icon}</span>
            <span className="howto-text">
              <strong>{numbered && <span aria-hidden="true">{icon} </span>}{label}</strong>
              <span>{text}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default function HowToUse({ onClose }) {
  const [lang, setLang] = useState('EN');
  const t = CONTENT[lang];
  const timer = useRef(null);

  const keepOpen = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(onClose, AUTO_CLOSE_MS);
  };

  useEffect(() => {
    keepOpen();
    return () => clearTimeout(timer.current);
    // Isang beses lang pagbukas; ang bawat pindot ang nagre-reset.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    // Nasa loob ito ng welcome screen na nagsisimula ng kiosk sa anumang
    // pindot — dito humihinto ang pindot. Ang madilim na likod ay sara.
    <div
      className="howto-overlay"
      onClick={(e) => { e.stopPropagation(); onClose(); }}
      onPointerDown={keepOpen}
    >
      <div
        className="howto-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="howto-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="howto-head">
          <span className="howto-badge" aria-hidden="true">i</span>
          <div className="howto-heading">
            <h2 id="howto-title">{t.title}</h2>
            <p>{t.subtitle}</p>
          </div>
          <button
            type="button"
            className="howto-lang"
            onClick={() => setLang(lang === 'EN' ? 'TL' : 'EN')}
          >
            🌐 {t.other}
          </button>
        </div>

        <div className="howto-body">
          <Section head={t.stepsHead} items={t.steps} numbered />
          <div className="howto-columns">
            <Section head={t.screenHead} items={t.screen} />
            <Section head={t.topHead} items={t.top} />
          </div>
        </div>

        <button type="button" className="howto-close" onClick={onClose}>
          {t.close}
        </button>
      </div>
    </div>
  );
}
