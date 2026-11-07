// ==============================================================
// PAG-IISKEDYUL
// Iisang tuntunin para sa video/larawan, sa dalawang teksto ng welcome
// screen, at sa status ng tanggapan: may simula at wakas, at parehong
// opsyonal. Walang simula = ngayon na. Walang wakas = hanggang burahin.
//
// Walang gumagalaw sa database kapag lumipas ang petsa: kinakalkula lang
// ang kalagayan mula sa orasan. Kaya ang "archive" ay ang mga tapos na —
// hindi kailangan ng cron, at hindi rin kailangang makapagsulat ang kiosk.
// ==============================================================

const toMs = (value) => {
  if (!value) return null;
  const ms = new Date(value).getTime();
  return Number.isNaN(ms) ? null : ms;
};

// 'upcoming' | 'live' | 'ended'
export const scheduleState = (item, now = Date.now()) => {
  const end = toMs(item?.ends_at);
  if (end !== null && now >= end) return 'ended';
  const start = toMs(item?.starts_at);
  if (start !== null && now < start) return 'upcoming';
  return 'live';
};

export const isLiveNow = (item, now = Date.now()) => scheduleState(item, now) === 'live';

// ==============================================================
// ORAS NG TANGGAPAN
// Pinipili na ang oras sa Admin Panel, hindi isinusulat. Teksto pa rin ang
// nakatala sa database ("8:00 AM - 5:00 PM (Mon-Fri)") — iisang anyo lang
// ang ginagawa ng formatHours, at iyon din ang binabasa ng parseHours.
// Kaya walang bagong hanay sa database, at nababasa pa rin ang dati.
// ==============================================================

// Mga araw na bukas. Linggo = 0 (gaya ng Date.getDay()).
export const HOURS_DAYS = {
  'Mon-Fri': [1, 2, 3, 4, 5],
  'Mon-Sat': [1, 2, 3, 4, 5, 6],
  Daily: [0, 1, 2, 3, 4, 5, 6],
  // Bukas sa oras na iyon tuwing may okasyon — araw-araw ang tsek ng oras.
  'Event Dependent': [0, 1, 2, 3, 4, 5, 6],
};

// Mga oras na hindi orasan. Ang `match` ang kinikilala sa lumang teksto.
const SPECIAL_HOURS = [
  { mode: '24/7', text: 'Open 24/7', match: /24\s*\/\s*7/i },
  { mode: 'reservation', text: 'By Reservation', match: /reservation/i },
  { mode: 'closed', text: 'Closed for Renovation', match: /closed/i },
];

const HOURS_RE = /^\s*(\d{1,2}):(\d{2})\s*([AP]M)\s*[-–]\s*(\d{1,2}):(\d{2})\s*([AP]M)\s*(?:\(([^)]*)\))?\s*$/i;

const to24 = (h, m, ampm) => {
  let hour = Number(h) % 12;
  if (ampm.toUpperCase() === 'PM') hour += 12;
  return `${String(hour).padStart(2, '0')}:${m}`;
};
const to12 = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
};
const minutesOf = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

// Teksto → { mode, opens, closes, days, text }.
//   mode: 'regular' | '24/7' | 'reservation' | 'closed' | 'none' | 'custom'
// Ang 'custom' ay lumang tekstong hindi mabasa — hindi ito ginagalaw.
// Walang nakasulat na araw = araw-araw: iyon lang ang tiyak na sinasabi ng teksto.
export const parseHours = (hours) => {
  const text = String(hours || '').trim();
  if (!text) return { mode: 'none', text };
  const m = text.match(HOURS_RE);
  if (m) {
    const note = (m[7] || '').trim();
    const days = Object.keys(HOURS_DAYS).find((d) => d.toLowerCase() === note.toLowerCase()) || 'Daily';
    return { mode: 'regular', opens: to24(m[1], m[2], m[3]), closes: to24(m[4], m[5], m[6]), days, text };
  }
  const special = SPECIAL_HOURS.find((s) => s.match.test(text));
  if (special) return { mode: special.mode, text };
  return { mode: 'custom', text };
};

// { mode, opens, closes, days } → teksto para sa database at sa kiosk.
export const formatHours = ({ mode, opens, closes, days, text }) => {
  if (mode === 'regular') {
    const range = `${to12(opens)} - ${to12(closes)}`;
    return days && days !== 'Daily' ? `${range} (${days})` : `${range} (Daily)`;
  }
  if (mode === 'none') return '';
  if (mode === 'custom') return text || '';
  // Hindi pinapalitan ang dating teksto kapag ganoon pa rin ang uri:
  // nananatili ang "24/7 Safety Dispatch Window", hindi nagiging "Open 24/7".
  const special = SPECIAL_HOURS.find((s) => s.mode === mode);
  if (!special) return '';
  return text && special.match.test(text) ? text : special.text;
};

// Sarado ba ang tanggapan ngayon ayon sa oras nito? `false` kapag walang
// orasang masusundan (24/7, reservation, hindi mabasa, walang nakatala).
export const isClosedByHours = (hours, now = Date.now()) => {
  const parsed = parseHours(hours);
  if (parsed.mode === 'closed') return true;
  if (parsed.mode !== 'regular') return false;
  const d = new Date(now);
  if (!HOURS_DAYS[parsed.days].includes(d.getDay())) return true;
  const mins = d.getHours() * 60 + d.getMinutes();
  const open = minutesOf(parsed.opens);
  const close = minutesOf(parsed.closes);
  // Lampas hatinggabi (hal. 10:00 PM - 6:00 AM).
  const inside = open <= close ? mins >= open && mins < close : mins >= open || mins < close;
  return !inside;
};

// Ang status na dapat makita ng bisita ngayon.
//  1. Labas sa oras ng tanggapan → Out of Office, kusa — kahit ano ang
//     nakatakda. Bumabalik ito pagdating ng oras ng pagbukas.
//  2. Sa loob ng oras: ang itinakda ng admin. Ang status na walang petsa
//     ay nananatili hanggang palitan; kapag may petsa, sa loob lang niyon
//     ito tumatalab — bago at pagkatapos, Available.
export const effectiveStatus = (office, now = Date.now()) => {
  if (isClosedByHours(office?.hours, now)) return 'Out of Office';
  const status = office?.status || 'Available';
  if (status === 'Available') return status;
  const live = isLiveNow({ starts_at: office.statusFrom, ends_at: office.statusUntil }, now);
  return live ? status : 'Available';
};

// Ang <input type="datetime-local"> ay "2026-11-03T14:30", walang timezone.
// Lokal na oras ng kiosk ito — iyon din ang inaasahan ng nag-e-edit.
export const toLocalInput = (iso) => {
  const ms = toMs(iso);
  if (ms === null) return '';
  const d = new Date(ms);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const fromLocalInput = (value) => {
  const ms = toMs(value);
  return ms === null ? null : new Date(ms).toISOString();
};

export const formatWhen = (iso, lang = 'EN') => {
  const ms = toMs(iso);
  if (ms === null) return '';
  return new Date(ms).toLocaleString(lang === 'EN' ? 'en-PH' : 'fil-PH', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  });
};

// Pareho ang tsek ng lahat ng form. Walang ibinabalik kapag tama.
export const scheduleProblem = (startsAt, endsAt, lang = 'EN') => {
  const start = toMs(startsAt);
  const end = toMs(endsAt);
  if (start !== null && end !== null && end <= start) {
    return lang === 'EN'
      ? 'The end date must be later than the start date.'
      : 'Dapat mas huli ang petsa ng wakas kaysa sa simula.';
  }
  return null;
};
