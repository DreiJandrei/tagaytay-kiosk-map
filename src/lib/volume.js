import { useCallback, useEffect, useRef, useState } from 'react';

// Mga hook ng lakas ng tunog sa idle screen (tingnan ang
// components/VolumeControl.jsx para sa slider mismo).

const AUTO_HIDE_MS = 10000;
const DEFAULT_VOLUME = 70;
// Ang lumang iisang lakas, bago pinaghiwalay. Ito ang panimula ng dalawa.
const LEGACY_KEY = 'kiosk-welcome-volume';

const clamp = (v) => Math.max(0, Math.min(100, Math.round(v)));

const readStored = (key) => {
  try {
    for (const k of [key, LEGACY_KEY]) {
      const saved = localStorage.getItem(k);
      if (saved !== null && saved !== '' && !Number.isNaN(Number(saved))) return clamp(Number(saved));
    }
  } catch { /* walang storage */ }
  return DEFAULT_VOLUME;
};

// Lakas na natatandaan kahit i-restart ang kiosk.
export function useStoredVolume(key) {
  const [volume, setVolume] = useState(() => readStored(key));
  const change = useCallback((v) => {
    const next = clamp(v);
    setVolume(next);
    try { localStorage.setItem(key, String(next)); } catch { /* walang storage */ }
  }, [key]);
  return [volume, change];
}

// Nakatago ang slider hanggang pindutin ang 🎚️. Kusa itong nagtatago ulit
// kapag iniwan — para hindi nakaharang sa idle screen buong araw.
export function useAutoHide() {
  const [open, setOpen] = useState(false);
  const timer = useRef(null);
  const keepOpen = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), AUTO_HIDE_MS);
  }, []);
  const toggle = () => {
    if (open) {
      clearTimeout(timer.current);
      setOpen(false);
    } else {
      setOpen(true);
      keepOpen();
    }
  };
  useEffect(() => () => clearTimeout(timer.current), []);
  return { open, toggle, keepOpen };
}
