import { useEffect, useRef, useState } from 'react';
import tagaytaySeal from '../assets/tagaytay-seal.jpg';
import AuthKeyboard from './AuthKeyboard';
import { unlockKiosk } from '../lib/kioskDevice';
import {
  KIOSK_GUARD_KEY, MAX_LOGIN_ATTEMPTS, FRESH_GUARD,
  readLoginGuard, writeLoginGuard, guardAfterFailure, isWrongPassword, formatCountdown,
} from '../lib/loginGuard';

// ==========================================================
// LOCK SCREEN NG KIOSK
// ==========================================================
// Ito ang sasalubong sa kahit anong browser na walang session ng kiosk —
// ang mini PC sa unang setup, o ang taong nakahula ng Vercel link.
// Isang beses lang ito sa mini PC: tinatandaan ang session, kaya hindi
// na ito lalabas tuwing restart.
//
// Walang "Forgot password" dito. Nasa hiwalay na link iyon
// (`/?reset=kiosk`), at sa Gmail ng lungsod lang dumarating ang email.
export default function KioskLockScreen({ lang, onUnlocked }) {
  const EN = lang === 'EN';
  const cardRef = useRef(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [serverDown, setServerDown] = useState(false);
  const [guard, setGuard] = useState(() => readLoginGuard(KIOSK_GUARD_KEY));
  const [now, setNow] = useState(() => Date.now());
  const locked = guard.lockUntil > now;

  useEffect(() => {
    if (!locked) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [locked]);

  const updateGuard = (next) => { setGuard(next); writeLoginGuard(KIOSK_GUARD_KEY, next); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (guard.lockUntil > Date.now() || !password) return;
    setBusy(true);
    setServerDown(false);
    try {
      await unlockKiosk(password);
      updateGuard(FRESH_GUARD);
      onUnlocked();
    } catch (error) {
      setPassword('');
      // Hindi binibilang ang putol na internet — hindi kasalanan ng nagta-type.
      if (!isWrongPassword(error)) {
        setServerDown(true);
        return;
      }
      updateGuard(guardAfterFailure(guard));
      setNow(Date.now());
    } finally {
      setBusy(false);
    }
  };

  const triesLeft = MAX_LOGIN_ATTEMPTS - guard.fails;

  return (
    <div className="sys">
      <div className="k-modal k-modal--sm" ref={cardRef} style={{ textAlign: 'center' }}>
        <img src={tagaytaySeal} alt="Tagaytay City Seal" className="k-modal-seal" style={{ width: '84px', height: '84px', margin: '0 auto 18px' }} />
        <h2 className="k-modal-title" style={{ marginBottom: '10px' }}>
          {EN ? 'Kiosk Locked' : 'Naka-lock ang Kiosk'}
        </h2>
        <p className="k-modal-text k-modal-text--center">
          {EN
            ? 'Enter the kiosk password to start this terminal. This device will remember it.'
            : 'Ilagay ang password ng kiosk para mabuksan ang terminal na ito. Tatandaan ito ng device na ito.'}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="k-field k-input-wrap">
            <input
              type={showPassword ? 'text' : 'password'}
              className="k-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={EN ? 'Kiosk password…' : 'Password ng kiosk…'}
              autoComplete="current-password"
              disabled={locked}
              autoFocus
            />
            <button
              type="button"
              className="k-eye"
              onClick={() => setShowPassword(!showPassword)}
              title={EN
                ? (showPassword ? 'Hide password' : 'Show password')
                : (showPassword ? 'Itago ang password' : 'Ipakita ang password')}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>

          {locked ? (
            <p className="k-login-guard is-locked" role="alert">
              🔒 {EN
                ? `Too many wrong passwords. Try again in ${formatCountdown(guard.lockUntil - now)}.`
                : `Sobrang daming maling password. Subukan ulit sa loob ng ${formatCountdown(guard.lockUntil - now)}.`}
            </p>
          ) : serverDown ? (
            <p className="k-login-guard is-locked" role="alert">
              📡 {EN
                ? 'Could not reach the server. Check the internet connection and try again.'
                : 'Hindi maabot ang server. Tingnan ang koneksyon sa internet at subukan ulit.'}
            </p>
          ) : guard.fails > 0 && (
            <p className="k-login-guard" role="alert">
              ⚠️ {EN
                ? `Wrong password. ${triesLeft} ${triesLeft === 1 ? 'try' : 'tries'} left before it locks.`
                : `Mali ang password. ${triesLeft} subok na lang bago ma-lock.`}
            </p>
          )}

          <button type="submit" className="k-btn k-btn--primary" disabled={busy || locked}>
            {EN
              ? (busy ? 'Checking…' : locked ? 'Locked' : '🔓 Unlock Kiosk')
              : (busy ? 'Sinusuri…' : locked ? 'Naka-lock' : '🔓 Buksan ang Kiosk')}
          </button>
        </form>
      </div>

      {/* Walang pisikal na keyboard ang mini PC. */}
      <AuthKeyboard scopeRef={cardRef} lang={lang} />
    </div>
  );
}
