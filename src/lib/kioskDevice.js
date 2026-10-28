import { isAuthRetryableFetchError } from '@supabase/supabase-js';
import { kioskDevice } from './supabase';

// ==========================================================
// ANG PAGBUKAS NG KIOSK
// ==========================================================
// Dating `?key=cct-bsit-kiosk` sa URL ang pampasok. Nakasulat iyon sa
// code, sa README, at sa .bat — kaya sinumang nakabasa ng repo ay
// kayang buksan ang kiosk mula sa sariling laptop.
//
// Ngayon, isang tunay na Supabase account ang kiosk. Sa server sinusuri
// ang password, hindi sa code. Isang beses lang itong tina-type kada
// device: tinatandaan ng browser ang session, kaya kusang bumubukas pa
// rin ang kiosk pagkatapos ng restart.
//
// Iisang Gmail inbox pa rin: sa Gmail, binabalewala ang `+device`, pero
// sa Supabase, ibang user ito — may sariling password, at WALANG
// karapatang mag-edit (tingnan ang supabase/admin_only_writes.sql).
//
// HINDI NAKASULAT DITO ANG EMAIL. Nababasa ng kahit sino ang code na
// ito sa browser, kaya ita-type ito ng staff kasama ng password. SHA-256
// lang nito ang nandito — sapat para malaman kung ang account ng kiosk
// ang nag-login (at hindi ang admin), pero hindi na mababasa pabalik.
const KIOSK_DEVICE_EMAIL_SHA256 = '554b72f65ebb3482cdc6448b740d70fe8608f549c676f05871da9b7366039218';

const sha256Hex = async (text) => {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, '0')).join('');
};

export const isKioskEmail = async (email) =>
  !!email && (await sha256Hex(email.trim().toLowerCase())) === KIOSK_DEVICE_EMAIL_SHA256;

const isKioskSession = (session) => isKioskEmail(session?.user?.email);

// Gaya ng sagot ng Supabase sa maling password, para iisa ang bilang at
// mensahe sa lock screen (tingnan ang isWrongPassword).
const wrongCredentials = () =>
  Object.assign(new Error('Invalid login credentials'), { code: 'invalid_credentials' });

// 'unlocked' — may buhay na session ng kiosk
// 'locked'   — wala, o tinanggihan na ng server (hal. binawi)
// 'offline'  — hindi maabot ang server; HINDI ito lock. Nasa storage
//              pa ang session at susubukan ulit — kung hindi, isang
//              putol ng internet sa pagbukas ay mangangailangan ng
//              taong magta-type ng password.
export const checkKioskSession = async () => {
  const { data, error } = await kioskDevice.auth.getSession();
  if (await isKioskSession(data?.session)) return 'unlocked';
  if (error && isAuthRetryableFetchError(error)) return 'offline';
  return 'locked';
};

export const onKioskSessionChange = (callback) =>
  kioskDevice.auth.onAuthStateChange((event, session) => {
    // Sa ibang tick ang callback — babala ng Supabase na huwag tumawag
    // ng ibang auth method sa loob mismo nito.
    setTimeout(async () => callback(event, await isKioskSession(session)), 0);
  });

// Ang admin account ay tatanggihan dito kahit tama ang password: hindi
// dapat maiwan ang session ng admin sa storage ng pampublikong kiosk.
export const unlockKiosk = async (email, password) => {
  const { data, error } = await kioskDevice.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw error;
  if (!(await isKioskSession(data?.session))) {
    await kioskDevice.auth.signOut({ scope: 'local' });
    throw wrongCredentials();
  }
};

// Para sa `/?reset=kiosk`. Bumabalik ang link sa email sa mismong
// pahinang iyon, hindi sa kiosk. Kapag hindi email ng kiosk ang na-type,
// tahimik na walang ipinapadala — pareho ang sagot sa pahina, kaya
// hindi ito mapagtatanungan kung tama ang hula.
export const sendKioskResetEmail = async (email) => {
  if (!(await isKioskEmail(email))) return;
  const redirectTo = `${window.location.origin}/?reset=kiosk`;
  const { error } = await kioskDevice.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo });
  if (error) throw error;
};

export const setKioskPassword = async (password) => {
  const { error } = await kioskDevice.auth.updateUser({ password });
  if (error) throw error;
};

// Sa device na ito lang. Kadalasang telepono ng admin ang nagbukas ng
// reset link — hindi dapat ito maiwang naka-login bilang kiosk.
export const forgetKioskOnThisDevice = () => kioskDevice.auth.signOut({ scope: 'local' });

// +1 sa bilang ng paghahanap. Sa server ang pagdagdag, at ang naka-login
// na kiosk lang ang pinapayagan — hindi na puwedeng isulat ng kahit
// sino ang anumang bilang.
export const bumpSearchCount = async (officeKey) => {
  const { error } = await kioskDevice.rpc('increment_search_count', { p_office_key: officeKey });
  if (error) throw error;
};
