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
//   - magiging false ang isAuthorized -> "System Locked" ang admin.
//
// Kaya sinasalo natin ang hash DITO, sa module scope, at ini-import ito
// bilang PINAKAUNANG import sa main.jsx — bago pa mabuo ang Supabase
// client. Sinusunod ng ES modules ang pagkakasunod-sunod ng import,
// kaya garantisadong buo pa ang URL sa puntong ito.

const initialHash = typeof window !== 'undefined' ? window.location.hash : '';
const initialSearch = typeof window !== 'undefined' ? window.location.search : '';

const hasRecoveryType = /(^|[#&?])type=recovery(&|$)/.test(initialHash + initialSearch);

export const isRecoveryLink = hasRecoveryType;

// Para sa debugging kapag may nagrereklamong "hindi gumagana ang reset link".
export const capturedAuthUrl = { hash: initialHash, search: initialSearch };
