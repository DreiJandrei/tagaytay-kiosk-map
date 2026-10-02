// ==========================================================
// ANG LINK NA ISINUSULAT SA QR
// ==========================================================
// Isa lang ang silbi ng link na ito: ipakita sa telepono ng bisita ang
// RUTANG pinili niya sa kiosk. Hindi ito pampasok sa kiosk mismo.
//
// Dati, ang pagkakaroon lang ng `?route=` sa URL ay sapat na para
// buksan ang buong app. Dalawa ang naging bunga niyon:
//
//   • Sinumang nakakita ng isang QR ay alam na ang anyo ng link
//     (`/?route=mayor&transport=elevator`), at kayang buksan iyon kahit
//     kailan, kahit saang device, nang hindi dumadaan sa kiosk.
//   • Walang katapusan ang link. Na-bookmark, naipasa sa chat,
//     binuksan ulit kinabukasan — bukas pa rin.
//
// Tatlo ang laman ng link ngayon: ang ruta, ang oras ng paggawa (`t`),
// at ang tatak (`s`). Ang tatak ang nagpapatunay na ang kiosk ang
// gumawa ng link at walang ginalaw sa loob nito — kaya hindi na
// puwedeng i-type na lang ang sariling `?route=`.
//
// TAPAT NA PAALALA: nasa bundle ng browser ang SALT sa ibaba, kaya
// kayang kopyahin ito ng taong handang magbasa ng JavaScript. HINDI
// ITO ang tunay na kandado ng sistema — ang Supabase RLS at ang admin
// login ang kandado. Ang hadlang na ito ay laban sa paggalaw ng URL sa
// address bar, at doon talaga ito epektibo.

const SALT = 'tch-kiosk-route-v1';

// Gaano katagal bago mapaso ang isang na-scan na link. Sa totoong
// paggamit, segundo lang ang namamagitan sa pagpapakita ng QR at sa
// pag-scan — at 45 segundo lang bago bumalik ang kiosk sa welcome
// screen, kaya hindi nagtatagal sa screen ang isang QR. Maluwag na
// maluwag na ang labinlimang minuto.
export const LINK_TTL_MS = 15 * 60 * 1000;

// Hindi laging magkasabay ang orasan ng mini PC at ng telepono. Kung
// bahagyang nauuna ang kiosk, mukhang galing sa hinaharap ang link —
// kaya may kaunting palugit sa direksyong iyon.
const CLOCK_SKEW_MS = 5 * 60 * 1000;

// FNV-1a: maikli, walang dependency, at sapat para mapansin ang
// kahit isang letrang binago sa URL.
const sign = (route, transport, issuedAt) => {
  const input = `${route}|${transport}|${issuedAt}|${SALT}`;
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(36);
};

// Ginagamit ng kiosk tuwing may iguguhit na QR.
export function buildVisitorLink(route, transport, issuedAt = Date.now()) {
  const params = new URLSearchParams({
    route,
    transport,
    t: String(issuedAt),
    s: sign(route, transport, issuedAt),
  });
  return `${window.location.origin}/?${params.toString()}`;
}

// Ginagamit ng pahina sa pagbukas: ito ba ay telepono ng bisita, at
// buhay pa ba ang link?
//
// Pansinin: kapag may `route`, bisita ito — kahit sira o paso ang
// tatak. Sinasadya iyon. Ang taong may lumang QR ay dapat makabasa ng
// "i-scan ulit", hindi ng "System Locked" na parang siya ang nagkamali
// ng pinasok.
export function readVisitorLink(search) {
  const query = typeof search === 'string'
    ? search
    : (typeof window === 'undefined' ? '' : window.location.search);

  const params = new URLSearchParams(query);
  const route = params.get('route');

  if (!route) {
    return { isVisitor: false, route: null, transport: 'elevator', expired: false };
  }

  const transport = params.get('transport') || 'elevator';
  const issuedAt = Number(params.get('t'));
  const stamp = params.get('s');

  const isSigned = Number.isFinite(issuedAt)
    && issuedAt > 0
    && stamp === sign(route, transport, issuedAt);

  const age = Date.now() - issuedAt;
  const isFresh = isSigned && age < LINK_TTL_MS && age > -CLOCK_SKEW_MS;

  return { isVisitor: true, route, transport, expired: !isFresh };
}
