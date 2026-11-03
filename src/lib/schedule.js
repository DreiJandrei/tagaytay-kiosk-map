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

// Ang status na dapat makita ng bisita ngayon. Ang status na walang petsa
// ay nananatili hanggang palitan — gaya ng dati. Kapag may petsa, sa loob
// lang niyon ito tumatalab; bago at pagkatapos, Available.
export const effectiveStatus = (office, now = Date.now()) => {
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
