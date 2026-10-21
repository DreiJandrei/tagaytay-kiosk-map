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
export const KIOSK_DEVICE_EMAIL = 'tagaytaykiosk+device@gmail.com';

const isKioskSession = (session) =>
  session?.user?.email?.toLowerCase() === KIOSK_DEVICE_EMAIL;

// 'unlocked' — may buhay na session ng kiosk
// 'locked'   — wala, o tinanggihan na ng server (hal. binawi)
// 'offline'  — hindi maabot ang server; HINDI ito lock. Nasa storage
//              pa ang session at susubukan ulit — kung hindi, isang
//              putol ng internet sa pagbukas ay mangangailangan ng
//              taong magta-type ng password.
export const checkKioskSession = async () => {
  const { data, error } = await kioskDevice.auth.getSession();
  if (isKioskSession(data?.session)) return 'unlocked';
  if (error && isAuthRetryableFetchError(error)) return 'offline';
  return 'locked';
};

export const onKioskSessionChange = (callback) =>
  kioskDevice.auth.onAuthStateChange((event, session) => {
    // Sa ibang tick ang callback — babala ng Supabase na huwag tumawag
    // ng ibang auth method sa loob mismo nito.
    setTimeout(() => callback(event, isKioskSession(session)), 0);
  });

export const unlockKiosk = async (password) => {
  const { error } = await kioskDevice.auth.signInWithPassword({ email: KIOSK_DEVICE_EMAIL, password });
  if (error) throw error;
};

// Para sa `/?reset=kiosk`. Bumabalik ang link sa email sa mismong
// pahinang iyon, hindi sa kiosk.
export const sendKioskResetEmail = async () => {
  const redirectTo = `${window.location.origin}/?reset=kiosk`;
  const { error } = await kioskDevice.auth.resetPasswordForEmail(KIOSK_DEVICE_EMAIL, { redirectTo });
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
