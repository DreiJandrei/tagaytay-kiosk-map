// ==============================================================
// PAGHAHANAP NG TANGGAPAN — pati sa acronym
// "tcdo" → Tourism & Cultural Development (Office), "hrmo" → Human
// Resources Management Office, "cr" → Comfort Room. Kadalasan, acronym
// ang alam ng bisita at hindi ang buong pangalan.
// ==============================================================

// Hindi kasama sa acronym: "Bids and Awards Committee" → BAC, hindi BAAC.
const SKIP_WORDS = new Set(['and', 'of', 'the', 'ng', 'sa', 'at']);

// Mga tawag na hindi makukuha sa mismong pangalan. Naka-office_key, kaya
// hindi nawawala kahit palitan ng admin ang pangalan.
const ALIASES = {
  'mayor-main': ['ocm', 'alkalde'],
  'mayor-receiving': ['ocm', 'alkalde'],
  'admin-office': ['cao', 'city administrator'],
  'treasure-office': ['cto', 'treasury', 'tax', 'buwis'],
  'accounting-office': ['cacc', 'accounting'],
  'budget-office': ['cbo', 'city budget office'],
  'legal-office': ['clo', 'legal'],
  'hr-office': ['hr', 'hrmo', 'personnel'],
  'city-eng': ['ceo', 'engineering', 'engineer'],
  'planning': ['cpdo', 'planning'],
  'internal-audit': ['ias', 'audit'],
  'tourism-office': ['tcdo', 'tourism'],
  'barangay-affairs': ['bao', 'barangay'],
  'csu-office': ['csu', 'security'],
  'guard': ['security', 'guard', 'guwardiya'],
  'info-desk': ['info', 'help desk', 'information'],
  'pio-1': ['pio'],
  'pio-2': ['pio'],
  'housing': ['tho', 'housing', 'pabahay'],
  'bac': ['bac', 'bids'],
  'breastfeeding-room': ['lactation', 'breastfeeding', 'pasusuhan'],
  'library': ['library', 'aklatan'],
};
// Lahat ng CR, kahit anong numero ang key (restroom-cr, restroom-cr-2, …).
const CR_ALIASES = ['cr', 'comfort room', 'restroom', 'toilet', 'banyo', 'palikuran'];

const compact = (text) => String(text || '').toLowerCase().replace(/[^a-z0-9]/g, '');

// Ang mga acronym ng isang pangalan. Hindi kasama ang nasa panaklong:
// "Public Information Office (Dept A)" → PIO.
export const acronymsFor = (title) => {
  const words = String(title || '')
    .replace(/\([^)]*\)/g, ' ')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w && !SKIP_WORDS.has(w));
  if (words.length < 2) return [];
  const initials = words.map((w) => w[0]).join('');
  const out = [initials];
  // "Office" ang karaniwang dulo ng tawag kahit wala sa pangalan:
  // Tourism & Cultural Development → TCD at TCDO. At kabaligtaran:
  // Civil Security Unit Office → CSUO at CSU.
  if (words[words.length - 1] === 'office') out.push(initials.slice(0, -1));
  else out.push(`${initials}o`);
  return out.filter((a) => a.length >= 2);
};

const termsFor = (office) => {
  const key = office.key || '';
  return [
    ...acronymsFor(office.title),
    ...(ALIASES[key] || []),
    ...(key.startsWith('restroom-cr') ? CR_ALIASES : []),
  ];
};

// 0 = eksaktong acronym o alias, 1 = nagsisimula sa hinanap, 2 = nasa loob.
// `null` kapag hindi tugma.
const rank = (office, query) => {
  const q = query.trim().toLowerCase();
  const qc = compact(q);
  if (!q) return null;
  const terms = termsFor(office);
  if (qc.length >= 2 && terms.some((t) => compact(t) === qc)) return 0;

  const title = String(office.title || '').toLowerCase();
  const label = String(office.mapLabel || '').toLowerCase();
  if (title.startsWith(q) || label.startsWith(q)) return 1;
  if (title.includes(q) || label.includes(q)) return 2;
  // "tcd" habang tina-type pa ang "tcdo".
  if (qc.length >= 2 && terms.some((t) => compact(t).startsWith(qc))) return 2;
  return null;
};

// Ang mga tugmang tanggapan, pinakamalapit sa hinanap ang nauuna.
export const searchOffices = (offices, query) => offices
  .map((office) => ({ office, r: rank(office, query) }))
  .filter(({ r }) => r !== null)
  .sort((a, b) => a.r - b.r)
  .map(({ office }) => office);
