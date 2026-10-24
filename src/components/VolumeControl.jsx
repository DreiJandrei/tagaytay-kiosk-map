// Lakas ng tunog sa idle screen. Dalawa ang gumagamit nito — ang
// background na video (kaliwang ibaba, patayo) at ang City Updates na kard
// (sa ulo ng kard, pahiga) — at may kanya-kanya silang lakas.

const VOLUME_STEP = 10;

// Nasa loob ito ng welcome screen na nagsisimula ng kiosk sa anumang pindot,
// at ng kard na may swipe — dito humihinto ang pindot at ang hagod.
const stop = (e) => e.stopPropagation();

export function VolumeToggle({ open, onToggle, className = '', label }) {
  return (
    <button
      type="button"
      className={`vol-toggle${open ? ' is-open' : ''} ${className}`}
      onClick={(e) => { stop(e); onToggle(); }}
      onPointerDown={stop}
      aria-expanded={open}
      aria-label={open ? `Itago ang lakas ng tunog ${label}` : `Ipakita ang lakas ng tunog ${label}`}
    >
      <span aria-hidden="true">{open ? '✕' : '🎚️'}</span>
    </button>
  );
}

export function VolumePanel({ value, onChange, onActivity, vertical = false, className = '', label }) {
  const set = (v) => { onChange(v); onActivity?.(); };
  return (
    <div
      className={`vol-panel${vertical ? ' is-vertical' : ''} ${className}`}
      onClick={stop}
      onPointerDown={(e) => { stop(e); onActivity?.(); }}
      role="group"
      aria-label={`Lakas ng tunog ${label}`}
    >
      <button
        type="button"
        className="vol-btn"
        onClick={() => set(value - VOLUME_STEP)}
        disabled={value <= 0}
        aria-label="Hinaan ang tunog"
      >−</button>
      <input
        type="range"
        min="0"
        max="100"
        step="1"
        value={value}
        onChange={(e) => set(Number(e.target.value))}
        style={{ '--vol': `${value}%` }}
        aria-label={`Lakas ng tunog ${label}`}
      />
      <button
        type="button"
        className="vol-btn"
        onClick={() => set(value + VOLUME_STEP)}
        disabled={value >= 100}
        aria-label="Lakasan ang tunog"
      >+</button>
      <span className="vol-value">{value}%</span>
    </div>
  );
}
