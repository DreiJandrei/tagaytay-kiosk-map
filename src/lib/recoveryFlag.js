// ==========================================================
// PAGSALO SA RECOVERY LINK — DAPAT UNANG-UNANG TUMAKBO
// ==========================================================
// Ang Supabase client (detectSessionInUrl: true) ay binabasa ang
// `#access_token=...&type=recovery` sa URL at BINUBURA ito gamit ang
// history.replaceState, ilang millisecond pagkatapos ma-import.
//
// Dahil doon, hindi maaasahan ang pagbasa ng `window.location.hash`
// sa loob ng isang React useEffect — maaaring wala na ang hash pagdating
// doon, kaya:
//   - hindi lalabas ang "Set New Password" modal, at
//   - lalabas ang lock screen ng kiosk sa halip na ang modal.
//
// Kaya sinasalo natin ang hash DITO, sa module scope, at ini-import ito
// bilang PINAKAUNANG import sa main.jsx — bago pa mabuo ang Supabase
// client. Sinusunod ng ES modules ang pagkakasunod-sunod ng import,
// kaya garantisadong buo pa ang URL sa puntong ito.

const initialHash = typeof window !== 'undefined' ? window.location.hash : '';
const initialSearch = typeof window !== 'undefined' ? window.location.search : '';

// Hiwalay na sinusuri ang hash at ang query. Kapag pinagdugtong, ang
// `#...&type=recovery` + `?reset=kiosk` ay nagiging `type=recovery?reset=kiosk`
// — walang `&` o dulo pagkatapos ng `recovery`, kaya hindi tumutugma at
// hindi nakikilala ang reset link ng kiosk.
const RECOVERY_TYPE = /(^|[#&?])type=recovery(&|$)/;
const hasRecoveryType = RECOVERY_TYPE.test(initialHash) || RECOVERY_TYPE.test(initialSearch);

// Ang pahina para sa nakalimutang password NG KIOSK (`/?reset=kiosk`).
// Hiwalay ito sa admin: ibang account, ibang Supabase client. Kailangan
// itong malaman bago pa mabuo ang mga client sa supabase.js — iyon ang
// nagpapasya kung aling client ang sasalo sa token sa URL.
export const isKioskResetPage = new URLSearchParams(initialSearch).get('reset') === 'kiosk';

// Recovery link ng ADMIN — ang galing sa "Forgot password" ng admin login.
// Ang recovery link na papunta sa `/?reset=kiosk` ay hindi kasama.
export const isRecoveryLink = hasRecoveryType && !isKioskResetPage;

// Ang link sa email na paso na o nagamit na: `#error=...&error_code=otp_expired`.
export const recoveryLinkFailed = /(^|[#&])error(_code)?=/.test(initialHash);

// Recovery link ng kiosk na buhay pa.
export const isKioskRecoveryLink = isKioskResetPage && hasRecoveryType;

// Para sa debugging kapag may nagrereklamong "hindi gumagana ang reset link".
export const capturedAuthUrl = { hash: initialHash, search: initialSearch };
