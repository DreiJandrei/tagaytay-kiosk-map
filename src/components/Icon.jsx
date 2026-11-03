// Mga icon ng buong kiosk — iisang estilo (guhit, 24×24), at sumusunod sa
// laki at kulay ng teksto (1em, currentColor). Hindi emoji: iba-iba ang
// itsura ng emoji sa bawat makina, at kahon lang (tofu) ang 🛗 sa Windows.
const PATHS = {
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 7.5h.01" /></>,
  pin: <><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></>,
  warning: <><path d="M10.3 4 2.7 17.5A2 2 0 0 0 4.4 20.5h15.2a2 2 0 0 0 1.7-3L13.7 4a2 2 0 0 0-3.4 0Z" /><path d="M12 10v4" /><path d="M12 17.2h.01" /></>,
  elevator: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M12 3v18" /><path d="m6.5 9 1.75-2L10 9" /><path d="m14 7 1.75 2 1.75-2" /><path d="M6.5 13.5h3.5" /><path d="M14 13.5h3.5" /></>,
  stairs: <path d="M3 20h5v-5h5v-5h5V5h3" />,
  escalator: <><path d="M3 19h4.5L16 8.5h5" /><path d="M3 14.5h2.5L14 4h7" /><circle cx="10.5" cy="4.5" r="1.5" /></>,
  keyboard: <><rect x="2.5" y="6" width="19" height="12" rx="2" /><path d="M6.5 10h.01M10 10h.01M14 10h.01M17.5 10h.01M6.5 14h.01M17.5 14h.01M10 14h4" /></>,
  volume: <><path d="M11 5 6.5 9H3v6h3.5L11 19Z" /><path d="M15.5 9a4 4 0 0 1 0 6" /><path d="M18.5 6.5a8 8 0 0 1 0 11" /></>,
  volumeOff: <><path d="M11 5 6.5 9H3v6h3.5L11 19Z" /><path d="m16 9.5 5 5" /><path d="m21 9.5-5 5" /></>,
  sliders: <><path d="M5 21v-6M5 11V3M12 21v-9M12 8V3M19 21v-4M19 13V3" /><path d="M2.5 15h5M9.5 8h5M16.5 17h5" /></>,
  close: <><path d="M6 6l12 12" /><path d="M18 6 6 18" /></>,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  chevronLeft: <path d="m15 5-7 7 7 7" />,
  chevronRight: <path d="m9 5 7 7-7 7" />,
  backspace: <><path d="M9 5h11a1.5 1.5 0 0 1 1.5 1.5v11A1.5 1.5 0 0 1 20 19H9l-6.5-7Z" /><path d="m12.5 9.5 5 5" /><path d="m17.5 9.5-5 5" /></>,
  enter: <><path d="M20 5v6a3 3 0 0 1-3 3H5" /><path d="m9 10-4 4 4 4" /></>,
  shift: <path d="M12 4 4 12.5h4.5V20h7v-7.5H20Z" />,
  plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>,
  garden: <><path d="M12 21v-8" /><path d="M12 13c0-4 2.5-7 7-8 0 4.5-2.5 8-7 8Z" /><path d="M12 15c0-3-2-5.5-6.5-6 0 3.5 2.5 6 6.5 6Z" /></>,
  parking: <><rect x="3.5" y="3.5" width="17" height="17" rx="3" /><path d="M9.5 17V7.5h3.5a3 3 0 0 1 0 6H9.5" /></>,
  exit: <><path d="M14 4h4.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H14" /><path d="M4 12h11" /><path d="m11 8 4 4-4 4" /></>,
};

export default function Icon({ name, className = '', title }) {
  return (
    <svg
      className={`k-icon ${className}`}
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : 'true'}
    >
      {PATHS[name]}
    </svg>
  );
}
