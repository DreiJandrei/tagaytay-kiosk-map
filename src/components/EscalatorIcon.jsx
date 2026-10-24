// Walang escalator na emoji sa Unicode — ang 🪜 ay hagdang-kawayan, kaya
// mali ang basa ng bisita. Ito ang kapalit: kahon na kahawig ng 🛗, may
// taong nakatayo sa pahilis na escalator. Sumusunod sa laki ng teksto
// (1em), kaya puwedeng ilagay kahit saan nakalagay dati ang emoji.
export default function EscalatorIcon({ className = '', title = 'Escalator' }) {
  return (
    <svg
      className={`escalator-icon ${className}`}
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      role="img"
      aria-label={title}
    >
      <rect x="0.5" y="0.5" width="23" height="23" rx="5" fill="#3B6FD8" />
      <rect x="0.5" y="0.5" width="23" height="23" rx="5" fill="none" stroke="#1E40AF" strokeWidth="1" />
      {/* Hawakan (handrail) */}
      <path
        d="M3.5 15.3h4.4l8.4-8.4h4.2"
        fill="none" stroke="#BFDBFE" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
      />
      {/* Ang umaandar na baitang */}
      <path
        d="M3.5 19.5h5.2l8.6-8.6h3.2"
        fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"
      />
      {/* Taong nakatayo */}
      <circle cx="11.6" cy="7.4" r="1.8" fill="#FFFFFF" />
      <path
        d="M11.6 10v5.6"
        fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round"
      />
    </svg>
  );
}
