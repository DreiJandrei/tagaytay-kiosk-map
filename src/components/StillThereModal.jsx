import { useEffect, useState } from 'react';

// ==========================================================
// "NANDIYAN PA BA KAYO?"
// ==========================================================
// Lumalabas pagkaraan ng 45 segundong walang pumipindot. Dati, diretso
// nang bumabalik sa welcome screen — at nawawala ang ruta ng bisitang
// nagbabasa lang pala ng mapa. Ngayon, may isa pang 45 segundo para
// sabihing nandiyan pa siya. Kapag walang pumindot, saka pa lang
// bumabalik sa simula (ang App ang may hawak ng orasang iyon; dito,
// pagpapakita lang ng natitirang segundo).
export default function StillThereModal({ deadline, lang, onStay, onLeave }) {
  const EN = lang === 'EN';
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  const secondsLeft = Math.max(0, Math.ceil((deadline - now) / 1000));

  return (
    <div className="k-overlay still-there" role="alertdialog" aria-modal="true" aria-labelledby="still-there-title">
      <div className="k-modal k-modal--sm" style={{ textAlign: 'center' }}>
        <h2 id="still-there-title" className="k-modal-title" style={{ marginBottom: '10px' }}>
          {EN ? 'Are you still there?' : 'Nandiyan pa ba kayo?'}
        </h2>
        <p className="k-modal-text k-modal-text--center">
          {EN
            ? 'The kiosk will return to the start screen soon.'
            : 'Babalik na sa simula ang kiosk.'}
        </p>
        <div className="still-there-count" aria-live="polite">
          <span className="still-there-num">{secondsLeft}</span>
          <span className="still-there-unit">{EN ? 'seconds left' : 'segundo na lang'}</span>
        </div>
        <div className="k-btn-row">
          <button type="button" className="k-btn k-btn--ghost" onClick={onLeave}>
            {EN ? 'Start over' : 'Magsimula ulit'}
          </button>
          <button type="button" className="k-btn k-btn--primary" onClick={onStay} autoFocus>
            {EN ? "Yes, I'm still here" : 'Oo, nandito pa ako'}
          </button>
        </div>
      </div>
    </div>
  );
}
