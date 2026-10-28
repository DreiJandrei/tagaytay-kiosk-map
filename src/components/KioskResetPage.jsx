import { useEffect, useState } from 'react';
import tagaytaySeal from '../assets/tagaytay-seal.jpg';
import {
  checkKioskSession, sendKioskResetEmail, setKioskPassword, forgetKioskOnThisDevice,
} from '../lib/kioskDevice';
import { isKioskRecoveryLink, recoveryLinkFailed } from '../lib/recoveryFlag';
import { isStrongPassword } from '../lib/loginGuard';

// ==========================================================
// NAKALIMUTAN ANG PASSWORD NG KIOSK — `/?reset=kiosk`
// ==========================================================
// Hindi ito naka-link kahit saan sa kiosk. Ang admin lang ang may alam,
// at kadalasang sa sarili niyang telepono o laptop niya ito bubuksan.
// Kahit may ibang makahanap: ang magagawa lang niya ay magpadala ng
// email sa Gmail ng lungsod.
//
// Dalawang yugto sa iisang pahina:
//   1. Walang token sa URL → buton na nagpapadala ng reset link.
//   2. Galing sa link sa email → form para sa bagong password.
//
// Sa Ingles lang ito: pang-admin, hindi para sa bisita.

const STAGE_FROM_URL = recoveryLinkFailed ? 'failed' : isKioskRecoveryLink ? 'checking' : 'request';

export default function KioskResetPage() {
  const [stage, setStage] = useState(STAGE_FROM_URL);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  // Binabasa ng Supabase ang token sa URL habang nagsisimula ang client.
  // Kapag may session na pagkatapos noon, tunay ang link.
  useEffect(() => {
    if (stage !== 'checking') return;
    let alive = true;
    checkKioskSession().then((status) => {
      if (alive) setStage(status === 'unlocked' ? 'form' : 'failed');
    });
    return () => { alive = false; };
  }, [stage]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    setMessage('');
    try {
      await sendKioskResetEmail(email);
      setStage('sent');
    } catch (error) {
      const limited = error?.code === 'over_email_send_rate_limit' || error?.status === 429;
      setMessage(limited
        ? 'Too many reset emails were sent recently. Wait a while (up to an hour) and try again.'
        : `Could not send the email: ${error?.message || 'unknown error'}`);
    } finally {
      setBusy(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!isStrongPassword(password)) {
      setMessage('Use at least 8 characters, with an uppercase letter, a lowercase letter, and a number.');
      return;
    }
    if (password !== confirm) {
      setMessage('The two passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      await setKioskPassword(password);
      // Huwag iwanang naka-login bilang kiosk ang teleponong ito.
      await forgetKioskOnThisDevice();
      setStage('done');
    } catch (error) {
      setMessage(`Could not save the password: ${error?.message || 'unknown error'}`);
    } finally {
      setBusy(false);
    }
  };

  const restart = () => {
    // Inaalis ang patay na token sa URL bago magsimula ulit.
    window.history.replaceState(null, '', `${window.location.pathname}?reset=kiosk`);
    setMessage('');
    setStage('request');
  };

  return (
    <div className="sys">
      <div className="k-modal k-modal--sm" style={{ textAlign: 'center' }}>
        <img src={tagaytaySeal} alt="Tagaytay City Seal" className="k-modal-seal" style={{ width: '72px', height: '72px', margin: '0 auto 16px' }} />
        <h2 className="k-modal-title" style={{ marginBottom: '10px' }}>Kiosk Password Reset</h2>

        {stage === 'request' && (
          <form onSubmit={handleSend}>
            <p className="k-modal-text k-modal-text--center">
              Type the kiosk account email. A reset link will be sent to its Gmail inbox.
              Open it on this device or any other.
            </p>
            <div className="k-field">
              <input
                type="email"
                className="k-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Kiosk account email"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                autoFocus
                required
              />
            </div>
            {message && <p className="k-login-guard is-locked" role="alert">{message}</p>}
            <button type="submit" className="k-btn k-btn--primary" disabled={busy}>
              {busy ? 'Sending…' : '✉️ Send reset link'}
            </button>
          </form>
        )}

        {stage === 'sent' && (
          <p className="k-modal-text k-modal-text--center" style={{ marginBottom: 0 }}>
            ✅ If that is the kiosk account email, a link is on its way. Open the newest
            "Reset Password" email in the Gmail inbox. The link works only once. Nothing
            arrived? Check the spelling of the email and send again.
          </p>
        )}

        {stage === 'checking' && (
          <>
            <p className="k-modal-text k-modal-text--center">Checking the link…</p>
            <span className="sys-loader" style={{ display: 'block', margin: '0 auto' }} />
          </>
        )}

        {stage === 'failed' && (
          <>
            <p className="k-modal-text k-modal-text--center">
              ⏱️ This reset link has expired or was already used. Send a new one.
            </p>
            <button type="button" className="k-btn k-btn--primary" onClick={restart}>
              Start again
            </button>
          </>
        )}

        {stage === 'form' && (
          <form onSubmit={handleSave}>
            <p className="k-modal-text k-modal-text--center">
              Set the new kiosk password. At least 8 characters, with an uppercase letter, a
              lowercase letter, and a number.
            </p>
            <div className="k-field">
              <input
                type="password"
                className="k-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New kiosk password"
                autoComplete="new-password"
                autoFocus
                required
              />
            </div>
            <div className="k-field">
              <input
                type="password"
                className="k-input"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Type it again"
                autoComplete="new-password"
                required
              />
            </div>
            {message && <p className="k-login-guard is-locked" role="alert">{message}</p>}
            <button type="submit" className="k-btn k-btn--ok" disabled={busy}>
              {busy ? 'Saving…' : '💾 Save new password'}
            </button>
          </form>
        )}

        {stage === 'done' && (
          <p className="k-modal-text k-modal-text--center" style={{ marginBottom: 0 }}>
            ✅ Password changed. Supabase may sign out kiosks that were unlocked with the old
            password. If a kiosk shows "Kiosk Locked", enter the new password there.
          </p>
        )}
      </div>
    </div>
  );
}
