// ==============================================================
// SALIN NG MGA DATOS NA NASA INGLES
// Ang badge at oras ng bawat tanggapan ay nakasulat sa Ingles sa
// database at sa defaultOfficeData.js. Hindi sila hiwalay na hanay
// bawat wika — kaya dito sila isinasalin kapag Tagalog ang kiosk.
// Ang hindi kilala ay iniiwan kung ano siya: mas mabuting Ingles kaysa
// maling salin.
// ==============================================================

export const floorName = (n, lang) => (lang === 'TL' ? `Palapag ${n}` : `Floor ${n}`);

// "2nd Floor - West" → "Ika-2 Palapag – Kanluran". Ang 1st ay "Ground Floor",
// gaya ng nasa hanay ng palapag sa mapa.
const BADGE_PLACES = {
  'Rear Grand Concourse': 'Likurang Bahagi ng Grand Concourse',
  'West Wing Complex': 'Kanlurang Wing',
  'Left Courtyard Wing': 'Kaliwang Bahagi ng Courtyard',
  'West Wing Corridor': 'Pasilyo ng Kanlurang Wing',
  'Central Concourse Wall': 'Gitnang Concourse',
  'Central Concourse Gate': 'Bukana ng Gitnang Concourse',
  'East Wing Utilities': 'Silangang Wing (Utilities)',
  'Utilities Section': 'Bahagi ng Utilities',
  'Main Lobby (Left of Entrance)': 'Main Lobby (Kaliwa ng Pasukan)',
  'Main Entrance (Right Side)': 'Pangunahing Pasukan (Kanang Bahagi)',
  'West Wing': 'Kanlurang Wing',
  'North Wing': 'Hilagang Wing',
  'East Wing': 'Silangang Wing',
  'South Wing': 'Timog na Wing',
  'West': 'Kanluran',
  'North': 'Hilaga',
  'East': 'Silangan',
  'South': 'Timog',
  'Center': 'Gitna',
  'Utilities': 'Utilities',
};

const ORDINAL_FLOOR_TL = {
  1: 'Ground Floor',
  2: 'Ika-2 Palapag',
  3: 'Ika-3 Palapag',
  4: 'Ika-4 Palapag',
  5: 'Ika-5 Palapag',
  6: 'Ika-6 Palapag',
  7: 'Ika-7 Palapag',
};

export const localizeBadge = (badge, lang) => {
  if (lang !== 'TL' || typeof badge !== 'string') return badge;
  const m = badge.match(/^\s*(\d)(?:st|nd|rd|th)\s+Floor\s*(?:[-–]\s*(.*))?$/i);
  if (!m) return badge;
  const floor = ORDINAL_FLOOR_TL[m[1]] || `Palapag ${m[1]}`;
  if (!m[2]) return floor;
  const place = m[2].trim();
  return `${floor} – ${BADGE_PLACES[place] || place}`;
};

// Mga karaniwang pariralang nasa oras ng tanggapan.
const HOURS_PHRASES = [
  [/24\/7 Safety Dispatch Window/i, '24/7 na Safety Dispatch Window'],
  [/Open 24\/7/i, 'Bukas 24/7'],
  [/By Reservation/i, 'Sa pamamagitan ng reserbasyon'],
  [/Closed for Renovation/i, 'Sarado — inaayos'],
  [/\(Event Dependent\)/i, '(Depende sa okasyon)'],
  [/\(Mon-Fri\)/i, '(Lunes–Biyernes)'],
  [/\(Mon-Sat\)/i, '(Lunes–Sabado)'],
];

export const localizeHours = (hours, lang) => {
  if (lang !== 'TL' || typeof hours !== 'string') return hours;
  return HOURS_PHRASES.reduce((text, [re, tl]) => text.replace(re, tl), hours);
};

// Kalagayan ng elevator o escalator (tingnan ang getLiftStatuses sa
// api.js), para sa route picker at sa mapa. Walang label ang 'available'
// — doon walang kailangang sabihin.
export const liftStatusLabel = (status, lang) => {
  const EN = lang !== 'TL';
  if (status === 'maintenance') return EN ? 'Under maintenance' : 'Inaayos';
  if (status === 'broken') return EN ? 'Out of order' : 'Sira';
  return '';
};

// Ang paliwanag ng tanggapan sa wikang napili. Kapag wala pang Tagalog
// na bersyon, ang Ingles ang lumalabas — hindi blangko.
export const officeDescription = (office, lang) => {
  if (!office) return '';
  if (lang === 'TL' && typeof office.descriptionTl === 'string' && office.descriptionTl.trim() !== '') {
    return office.descriptionTl;
  }
  return office.description || '';
};
