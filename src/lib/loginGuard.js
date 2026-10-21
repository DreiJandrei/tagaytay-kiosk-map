// ── Bantay sa maling password ──────────────────────────────────
// Gaya ng sa telepono: limang maling subok, tapos naka-lock nang ilang
// minuto — at humahaba ang lock sa bawat ulit. Nasa localStorage para
// hindi ito mabura ng pag-refresh ng pahina. Bumabalik sa simula kapag
// tama na ang password. (Pandagdag lang ito: may sariling limitasyon din
// ang Supabase sa dami ng login.)
//
// Magkahiwalay ang bilang ng admin login at ng lock screen ng kiosk —
// tingnan ang mga key sa ibaba.
export const ADMIN_GUARD_KEY = 'tagaytay-admin-login-guard';
export const KIOSK_GUARD_KEY = 'tagaytay-kiosk-unlock-guard';

export const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_MINUTES = [1, 5, 15, 30, 60];
export const FRESH_GUARD = { fails: 0, lockUntil: 0, level: 0 };

export const readLoginGuard = (key) => {
  try {
    const g = JSON.parse(localStorage.getItem(key));
    if (g && typeof g === 'object') {
      return { fails: Number(g.fails) || 0, lockUntil: Number(g.lockUntil) || 0, level: Number(g.level) || 0 };
    }
  } catch { /* walang storage o sira ang laman — magsimula sa malinis */ }
  return FRESH_GUARD;
};

export const writeLoginGuard = (key, g) => {
  try { localStorage.setItem(key, JSON.stringify(g)); } catch { /* walang storage */ }
};

// Ang susunod na kalagayan pagkatapos ng isang maling password.
export const guardAfterFailure = (g) => {
  const fails = g.fails + 1;
  if (fails < MAX_LOGIN_ATTEMPTS) return { ...g, fails };
  const minutes = LOCK_MINUTES[Math.min(g.level, LOCK_MINUTES.length - 1)];
  return { fails: 0, lockUntil: Date.now() + minutes * 60000, level: g.level + 1 };
};

// Maling password ba talaga — o problema sa internet o sa Supabase?
// Ang mali lang na password ang binibilang.
export const isWrongPassword = (error) =>
  error?.code === 'invalid_credentials'
  || /invalid login credentials/i.test(error?.message || '');

export const formatCountdown = (ms) => {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const sec = String(total % 60).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
};

// Parehong patakaran sa bagong password ng admin at ng kiosk.
export const isStrongPassword = (pw) =>
  pw.length >= 8 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /\d/.test(pw);
