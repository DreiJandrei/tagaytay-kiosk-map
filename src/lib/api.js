import { supabase, passwordChecker } from './supabase';
import { bumpSearchCount } from './kioskDevice';
import { isLiveNow, scheduleState } from './schedule';

// Ang mga pangalan sa database. Hindi ito ang orihinal na pangalan sa unang
// bersyon ng kiosk, kaya iisang lugar na lang ang babaguhin kung sakali:
//   office_details        → office_information
//   kiosks_announcements  → announcement_text
//   kiosk_videos          → announcement_media
//   offices.badge         → offices.location
const OFFICE_DETAILS = 'office_information';
const ANNOUNCEMENTS = 'announcement_text';
const VIDEOS = 'announcement_media';

// ==============================================================
// HINDI PA NAPAPATAKBO ANG supabase/office_phones.sql
// ==============================================================
// Hinahanap kung ang dahilan ng pagtanggi ng database ay walang hanay
// para sa telepono, at hindi ibang sira. Mahigpit ito nang tiyakan: ang
// ibang pagkakamali ay dapat umabot pa rin sa admin, hindi basta
// malunod dito.
//   42703    — ang sagot ng Postgres sa hanay na wala
//   PGRST204 — ang sagot ng PostgREST kapag hindi nito kilala ang hanay
const isMissingColumn = (error, names) => {
  const code = error?.code;
  if (code !== '42703' && code !== 'PGRST204') return false;
  const haystack = `${error?.message || ''} ${error?.details || ''}`.toLowerCase();
  return names.some((n) => haystack.includes(n));
};
const isMissingPhoneColumn = (error) => isMissingColumn(error, ['phone', 'local']);

// Ganoon din para sa Tagalog na paliwanag — supabase/office_about_tl.sql.
const isMissingDescriptionTlColumn = (error) => isMissingColumn(error, ['description_tl']);

// At sa iskedyul — supabase/map_update_2026_11.sql.
const isMissingStatusScheduleColumn = (error) => isMissingColumn(error, ['status_from', 'status_until']);
const isMissingVideoScheduleColumn = (error) => isMissingColumn(error, ['starts_at', 'ends_at']);

// May mga lumang pangalan sa database na may emoji pa ("🚧 UNDER
// CONSTRUCTION"). Dito sila nililinis para pareho ang lalabas sa mapa, sa
// listahan, at sa Admin Panel — kaya malinis din ito pagka-save.
const stripEmoji = (text) => String(text ?? '')
  .replace(/[\p{Extended_Pictographic}\uFE0F]/gu, '')
  .trim();

// ==============================================================
// 1. SUPABASE AUTHENTICATION
// ==============================================================
// Ita-type ng staff ang email — hindi ito nakasulat sa code, na nababasa
// ng kahit sino sa browser. Pagkapasok, ang database mismo ang tinatanong
// kung admin nga (is_kiosk_admin sa supabase/admin_only_writes.sql): ang
// account ng kiosk ay may tamang password din, pero hindi admin.
//
// REQUIRED ang 2FA: pagkatapos ng password, may 6 na numerong ipinapadala
// sa Gmail ng admin. Hinihingi lang ito isang beses bawat 12 oras sa
// bawat device — tingnan ang MFA_TRUST_MS sa ibaba.
//
// Ibinabalik:
//   { needsCode: false }        — tapos na, papasok na
//   { needsCode: true, email }  — naipadala ang code; verifyAdminCode ang
//                                 susunod (sendAdminCode para ipadala ulit)
export const loginAdmin = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw error;
  try {
    if (!(await isAdminAccount())) return rejectNonAdmin();
    if (hasMfaTrust(data.user.id)) {
      if (await confirmAdmin()) return { needsCode: false };
      // Pinagkakatiwalaan pa ng device na ito, pero sarado na ang 12 oras
      // sa database (hal. hindi naitala doon ang huling code). Code ulit.
      clearMfaTrust();
    }
    await sendAdminCode(data.user.email);
  } catch (stepError) {
    if (stepError?.code !== 'invalid_credentials') await supabase.auth.signOut({ scope: 'local' });
    throw stepError;
  }
  // Ang code ang magbubukas ng bagong session (verifyAdminCode). Hindi na
  // iniiwang naka-login ang password lang habang naghihintay ng code.
  await supabase.auth.signOut({ scope: 'local' });
  return { needsCode: true, email: data.user.email };
};

// Admin account ba ito, bago pa ang code? Hindi pa ito ang karapatang
// magsulat — is_kiosk_admin pa rin iyon. Kung hindi pa napapatakbo ang
// supabase/admin_2fa.sql, ang lumang is_kiosk_admin (email lang) ang
// tinatanong.
const isAdminAccount = async () => {
  let { data, error } = await supabase.rpc('is_kiosk_admin_account');
  if (error?.code === 'PGRST202') ({ data, error } = await supabase.rpc('is_kiosk_admin'));
  if (error) throw error;
  return data === true;
};

// Ipinapadala ang code sa Gmail. Hindi gumagawa ng bagong account kahit
// ibang email pa ang maipasa. Ang laman ng email ay ang template na
// "Magic Link" sa Supabase — kailangang may {{ .Token }} iyon.
export const sendAdminCode = async (email) => {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false },
  });
  if (error) throw error;
};

// Ang ikalawang hakbang ng login: ang code mula sa Gmail.
export const verifyAdminCode = async (email, code) => {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: String(code).trim(),
    type: 'email',
  });
  if (error) throw error;
  // Para sa 12 oras sa database (supabase/admin_2fa.sql). Kapag hindi pa
  // napapatakbo ang SQL, walang hinaharang.
  const { error: markError } = await supabase.rpc('mark_admin_mfa_verified');
  if (markError && markError.code !== 'PGRST202') {
    await supabase.auth.signOut({ scope: 'local' });
    throw markError;
  }
  saveMfaTrust(data.user.id);
  if (await confirmAdmin()) return;
  return rejectNonAdmin();
};

const confirmAdmin = async () => {
  const { data: isAdmin, error } = await supabase.rpc('is_kiosk_admin');
  if (error) {
    await supabase.auth.signOut({ scope: 'local' });
    throw error;
  }
  return isAdmin === true;
};

const rejectNonAdmin = async () => {
  await supabase.auth.signOut({ scope: 'local' });
  // Gaya ng maling password, para iisa ang bilang at mensahe.
  throw Object.assign(new Error('Invalid login credentials'), { code: 'invalid_credentials' });
};

// ── 2FA ──────────────────────────────────────────────────────
// Ang "pinagkakatiwalaan" ay nasa localStorage ng device: { userId, until }.
// Hindi ito ang tunay na kandado — kahit sino ay kayang baguhin iyon.
// Ang database ang may huling salita (supabase/admin_2fa.sql): tatanggapin
// lang ang login na walang code kung may nag-code sa admin account sa loob
// ng huling 12 oras.
const MFA_TRUST_KEY = 'tagaytay-admin-2fa-trust';
const MFA_TRUST_MS = 12 * 60 * 60 * 1000;

const hasMfaTrust = (userId) => {
  try {
    const t = JSON.parse(localStorage.getItem(MFA_TRUST_KEY));
    return t?.userId === userId && Number(t.until) > Date.now();
  } catch { return false; }
};

const saveMfaTrust = (userId) => {
  try {
    localStorage.setItem(MFA_TRUST_KEY, JSON.stringify({ userId, until: Date.now() + MFA_TRUST_MS }));
  } catch { /* walang storage — hihingi lang ulit ng code */ }
};

const clearMfaTrust = () => {
  try { localStorage.removeItem(MFA_TRUST_KEY); } catch { /* walang storage */ }
};

// Mali o expired na code — iisa ang sagot ng Supabase sa dalawa.
// Ito lang ang binibilang na mali, gaya ng maling password.
export const isWrongCode = (error) =>
  error?.code === 'otp_expired'
  || /expired or is invalid|invalid otp|token has expired/i.test(error?.message || '');

// Naabot ang limitasyon ng Supabase sa pagpapadala ng email.
export const isEmailRateLimited = (error) =>
  error?.code === 'over_email_send_rate_limit'
  || error?.code === 'over_request_rate_limit'
  || error?.status === 429;

export const resetPasswordEmail = async (email) => {
  // Ibalik sa ORIHINAL na pinanggalingan, hindi sa naka-hardcode na Vercel URL.
  // Kapag naka-hardcode, ang admin na humihiling mula sa localhost ay
  // itatapon sa production (o babagsak sa Site URL ng Supabase kapag hindi
  // naka-allowlist ang redirectTo) — kaya "hindi gumagana" ang reset link.
  // Ang recovery token sa link mismo ang nagpapapasok pagbalik.
  const redirectTo = `${window.location.origin}/`;

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) throw error;
  return data;
};

export const changeAdminPassword = async (newPassword) => {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
  return data;
};

// Pagpapalit mula sa Admin Panel: sinusuri muna ang KASALUKUYANG
// password, para hindi ito mapalitan ng sinumang nakadaan sa naiwang
// bukas na admin. Sa hiwalay na client ito nag-lo-login (passwordChecker)
// para hindi mapalitan ang session ng admin — kapag mali, iyon ang error
// na ibinabato (tingnan ang isWrongPassword).
// Ang recovery link ay hindi dumadaan dito: hindi na alam ng gumagamit
// niyon ang dating password, kaya changeAdminPassword pa rin doon.
export const changeAdminPasswordWithCurrent = async (currentPassword, newPassword) => {
  const { data: { user } = {}, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user?.email) throw new Error('Not logged in');
  const { error: verifyError } = await passwordChecker.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (verifyError) throw verifyError;
  await passwordChecker.auth.signOut({ scope: 'local' });
  return changeAdminPassword(newPassword);
};

export const logoutAdmin = async () => {
  await supabase.auth.signOut();
};

export const onAuthChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback);
};

// ==============================================================
// 2. INITIALIZE 2 TABLES (OFFICES & OFFICE_DETAILS)
// ==============================================================
export const initializeDatabase = async (seedData) => {
  try {
    const { data: existing, error: checkError } = await supabase.from('offices').select('office_key').limit(1);
    if (checkError) throw checkError;
    if (existing && existing.length > 0) return { success: true, message: 'Database already initialized.' };

    const officesToInsert = [];
    const detailsToInsert = [];

    Object.keys(seedData).forEach(floorStr => {
      const floorNum = parseInt(floorStr);
      Object.keys(seedData[floorStr]).forEach(officeKey => {
        // Dating `seedData[seedData]` — naging "[object Object]" ang index,
        // kaya laging undefined at sumasabog sa `.title` sa bagong database.
        const item = seedData[floorStr][officeKey];

        officesToInsert.push({
          office_key: officeKey, 
          floor: floorNum, 
          title: item.title || '', 
          location: item.badge || '',
          css_class: item.cssClass || '',
          search_count: 0
        });

        detailsToInsert.push({
          office_key: officeKey,
          hours: item.hours || '',
          head: item.head || '',
          description: item.description || '',
          requirements: Array.isArray(item.requirements) ? item.requirements : [],
          status: item.status || 'Available',
          // NULL, hindi '' — may kahulugan ang pagkakaiba sa getAllOffices:
          // ang NULL ay "walang nakatala", ang '' ay "sinadyang walisin".
          phone: item.phone || null,
          local: item.local || null
        });
      });
    });

    const { error: insertError1 } = await supabase.from('offices').insert(officesToInsert);
    if (insertError1) throw insertError1;

    let { error: insertError2 } = await supabase.from(OFFICE_DETAILS).insert(detailsToInsert);

    // Gaya ng nasa updateOffice: kapag wala pang hanay para sa telepono,
    // huwag ipatumba ang buong pagbibinhi ng bagong database — ang lahat
    // ng iba ay maisasalba pa. Tingnan ang isMissingPhoneColumn.
    if (insertError2 && isMissingPhoneColumn(insertError2)) {
      console.warn(
        'Wala pang hanay na phone/local ang office_details — nabinhi ang '
        + 'lahat maliban sa telepono. Patakbuhin ang supabase/office_phones.sql.',
      );
      /* eslint-disable-next-line no-unused-vars */
      const withoutPhone = detailsToInsert.map(({ phone, local, ...rest }) => rest);
      ({ error: insertError2 } = await supabase.from(OFFICE_DETAILS).insert(withoutPhone));
    }
    if (insertError2) throw insertError2;

    return { success: true };
  } catch (error) { 
    console.error('Error initializing database setup:', error); 
    throw error; 
  }
};

// ==============================================================
// 3. GET DATA USING RELATIONAL JOIN
// ==============================================================
export const getAllOffices = async () => {
  try {
    const { data, error } = await supabase.from('offices').select(`*, ${OFFICE_DETAILS}(*)`);
    if (error) throw error;

    const structuredData = {};
    data.forEach(row => {
      const details = row[OFFICE_DETAILS] || {};
      const safeDetails = Array.isArray(details) ? details[0] : details;
      
      if (!structuredData[row.floor]) structuredData[row.floor] = {};
      
      let rawReqs = safeDetails?.requirements;
      let safeRequirements = [];
      
      if (Array.isArray(rawReqs)) {
        safeRequirements = rawReqs;
      } else if (typeof rawReqs === 'string') {
        try {
          const parsed = JSON.parse(rawReqs);
          safeRequirements = Array.isArray(parsed) ? parsed : [rawReqs];
        } catch (e) {
          safeRequirements = rawReqs.trim() !== "" ? [rawReqs] : [];
        }
      }

      const office = {
        title: stripEmoji(row.title),
        badge: row.location,
        hours: safeDetails?.hours || '',
        head: safeDetails?.head || '',
        description: safeDetails?.description || '',
        requirements: safeRequirements,
        cssClass: row.css_class,
        status: safeDetails?.status || 'Available',
        searchCount: row.search_count || 0
      };

      // ── Telepono ────────────────────────────────────────────
      // Hindi ito laging isinasama, at sinasadya iyon. Ang
      // mergeOfficeData ay spread: `{...default, ...db}` — kaya ang
      // ANUMANG isinama rito ay tumatabon sa nasa defaultOfficeData.js,
      // pati ang blangko. Kung palagi itong isasama, ang bawat
      // tanggapang hindi pa nagagalaw ng admin (NULL pa ang hanay) ay
      // mawawalan ng numero sa kiosk sa mismong araw na idagdag ang
      // hanay — kahit walang binago ang sinuman.
      //
      // Kaya ganito ang basa ng tatlong halaga:
      //   NULL  → walang nakatala; hindi isinasama, kaya ang nasa code
      //           pa rin ang lumalabas (tingnan ang office_phones.sql)
      //   ''    → sinadyang walisin ng admin; isinasama, kaya nabubura
      //           nga ang nasa code at wala nang numerong lumalabas
      //   teksto → ito ang totoong numero ngayon
      if (safeDetails?.phone !== null && safeDetails?.phone !== undefined) {
        office.phone = safeDetails.phone;
      }
      if (safeDetails?.local !== null && safeDetails?.local !== undefined) {
        office.local = safeDetails.local;
      }

      // Tagalog na paliwanag — parehong basa ng telepono sa itaas. Ang
      // NULL (hindi pa nagagalaw, o wala pang hanay) ay hindi isinasama,
      // kaya ang salin sa defaultOfficeData.js ang lumalabas.
      if (safeDetails?.description_tl !== null && safeDetails?.description_tl !== undefined) {
        office.descriptionTl = safeDetails.description_tl;
      }

      // Iskedyul ng status. Kapag NULL, walang petsa: nananatili ang status
      // hanggang palitan (tingnan ang effectiveStatus sa schedule.js).
      office.statusFrom = safeDetails?.status_from || null;
      office.statusUntil = safeDetails?.status_until || null;

      structuredData[row.floor][row.office_key] = office;
    });
    return structuredData;
  } catch (error) { 
    console.error('Error fetching all offices:', error); 
    throw error; 
  }
};

// ==============================================================
// 4. BULLETPROOF UPDATE FUNCTION
// ==============================================================

export const updateOffice = async (officeKey, updates, floor) => {
  try {
    const officeFields = {
      title: updates.title,
      location: updates.badge,
      css_class: updates.cssClass
    };
    const { data: updatedRows, error: err1 } = await supabase.from('offices')
      .update(officeFields).eq('office_key', officeKey).select('office_key');
    if (err1) throw err1;

    // Ito ang dahilan ng "Database error" sa Info Desk at Guard Post: nasa
    // code sila pero walang row sa `offices`, dahil isang beses lang nagbibinhi
    // ang initializeDatabase. Walang error ang UPDATE na walang natamaan — sa
    // sumunod na INSERT sa detalye sumasabog, dahil sa foreign key. Kaya
    // ginagawa muna ang row. Ganoon din sa bawat bagong kwarto sa mapa.
    if (!updatedRows?.length) {
      const { error: insertErr } = await supabase.from('offices')
        .insert({ office_key: officeKey, floor, search_count: 0, ...officeFields });
      if (insertErr) throw insertErr;
    }

    const { data: existingDetail, error: checkErr } = await supabase.from(OFFICE_DETAILS).select('office_key').eq('office_key', officeKey).maybeSingle();
    if (checkErr) throw checkErr;

    // Mula sa admin, ang blangkong kahon ay '' — sinadyang pagwalis
    // iyon, at ganoon ito dapat maitala. Ang NULL ay para lang sa
    // hindi pa nagagalaw, at hindi na iyon nagdaraan dito.
    const detailFields = {
      head: updates.head,
      hours: updates.hours,
      description: updates.description,
      description_tl: updates.descriptionTl ?? '',
      status: updates.status,
      status_from: updates.statusFrom ?? null,
      status_until: updates.statusUntil ?? null,
      requirements: updates.requirements,
      phone: updates.phone ?? '',
      local: updates.local ?? ''
    };

    const writeDetails = (fields) => (existingDetail
      ? supabase.from(OFFICE_DETAILS).update(fields).eq('office_key', officeKey)
      : supabase.from(OFFICE_DETAILS).insert({ office_key: officeKey, ...fields }));

    let fields = detailFields;
    let { error: err2 } = await writeDetails(fields);
    let phoneSkipped = false;
    let descriptionTlSkipped = false;
    let statusScheduleSkipped = false;

    // Kapag hindi pa napatakbo ang supabase/office_phones.sql, wala pang
    // hanay para sa telepono — at tatanggihan ng database ang BUONG
    // pag-save dahil doon. Ang mawawala ay hindi lang ang numero: hindi
    // na rin maipapalit ang oras, ang status, ang paliwanag. Iyon ang
    // pinakamasamang kalalabasan: mukhang sirang-sira ang admin panel.
    //
    // Kaya kapag ito ang dahilan ng pagtanggi — at ITO LAMANG — muli
    // itong isinusubok nang wala ang telepono. Nakakapag-save pa rin ang
    // admin sa lahat ng iba habang hindi pa napapatakbo ang SQL.
    //
    // PERO KAILANGANG MALAMAN ITO NG NAG-SAVE. Ang unang gawa nito ay
    // sa console lang nagbababala — at walang console na nakikita sa
    // TV ng kiosk. Kaya para sa nag-e-edit, mukhang tahimik na hindi
    // pumapasok ang numero: "na-save" naman daw, pero hindi nagbabago.
    // Ang `phoneSkipped` ang nagpapaabot niyon sa tumawag.
    //
    // Ganoon din ang Tagalog na paliwanag (supabase/office_about_tl.sql).
    // Isa-isang hanay lang ang nirereklamo ng database bawat tanggi, kaya
    // ilang beses itong puwedeng umikot kapag marami pang wala.
    for (let attempt = 0; err2 && attempt < 3; attempt++) {
      if (!phoneSkipped && isMissingPhoneColumn(err2)) {
        console.warn(
          'Wala pang hanay na phone/local ang office_details — na-save ang '
          + 'lahat maliban sa telepono. Patakbuhin ang supabase/office_phones.sql.',
        );
        /* eslint-disable-next-line no-unused-vars */
        const { phone, local, ...rest } = fields;
        fields = rest;
        phoneSkipped = true;
      } else if (!descriptionTlSkipped && isMissingDescriptionTlColumn(err2)) {
        console.warn(
          'Wala pang hanay na description_tl ang office_details — na-save ang '
          + 'lahat maliban sa Tagalog na paliwanag. Patakbuhin ang supabase/office_about_tl.sql.',
        );
        /* eslint-disable-next-line no-unused-vars */
        const { description_tl, ...rest } = fields;
        fields = rest;
        descriptionTlSkipped = true;
      } else if (!statusScheduleSkipped && isMissingStatusScheduleColumn(err2)) {
        console.warn(
          'Wala pang hanay na status_from/status_until — na-save ang lahat '
          + 'maliban sa iskedyul. Patakbuhin ang supabase/map_update_2026_11.sql.',
        );
        /* eslint-disable-next-line no-unused-vars */
        const { status_from, status_until, ...rest } = fields;
        fields = rest;
        statusScheduleSkipped = true;
      } else {
        break;
      }
      ({ error: err2 } = await writeDetails(fields));
    }
    if (err2) throw err2;

    return { success: true, phoneSkipped, descriptionTlSkipped, statusScheduleSkipped };
  } catch (error) { 
    console.error(`Error updating office ${officeKey}:`, error); 
    throw error; 
  }
};

// ==============================================================
// 5. INCREMENT SEARCH COUNT
// ==============================================================
// Dating basa-tapos-sulat ito mula sa anonymous na client — kaya bukas
// ang `offices` sa pagsulat ng kahit sino. Ngayon, isang function sa
// database na +1 lang ang kaya (supabase/admin_only_writes.sql).
export const incrementSearchCount = async (officeKey) => {
  try {
    await bumpSearchCount(officeKey);
    return true;
  } catch { return false; }
};

// ==============================================================
// 6. ANNOUNCEMENT SETTINGS API
// ==============================================================
export const getAnnouncement = async () => {
  try {
    const { data, error } = await supabase.from(ANNOUNCEMENTS).select('announcement_text').eq('id', 1).maybeSingle();
    if (error) throw error; 
    return data ? data.announcement_text : "";
  } catch (error) { return ""; }
};

export const updateAnnouncement = async (text) => {
  try {
    const { data: existing, error: checkErr } = await supabase.from(ANNOUNCEMENTS).select('id').eq('id', 1).maybeSingle();
    if (checkErr) throw checkErr;

    // Hindi nagtatapon ang supabase-js kapag tinanggihan ang pagsulat —
    // nasa `error` ito. Kung hindi titingnan, "nai-save na" ang sasabihin
    // sa admin kahit walang nagbago.
    const { error: writeErr } = existing
      ? await supabase.from(ANNOUNCEMENTS).update({ announcement_text: text }).eq('id', 1)
      : await supabase.from(ANNOUNCEMENTS).insert([{ id: 1, announcement_text: text }]);
    if (writeErr) throw writeErr;
    return true;
  } catch (error) {
    console.error("Save Announcement Error:", error);
    throw error;
  }
};

// Iisang JSON sa iisang row ang lahat ng setting ng welcome screen at ng
// elevator: { announcements, advisories, elevator, escalator }. Ang lumang row
// na payak na teksto lang ay ang advisory noon pa.
export const parseKioskSettings = (text) => {
  if (!text) return {};
  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === 'object' ? parsed : { advisory: text };
  } catch {
    return { advisory: text };
  }
};

// Binabago lang ang mga field na ibinigay; buo ang iba. Sariwang basa ito
// mula sa database — HINDI ang getAnnouncement, na blangko ang ibinabalik
// kapag nabigo. Kung iyon ang gagamitin, ang isang pumalyang basa ay
// magbubura ng anunsyo sa susunod na pag-save ng elevator.
export const patchKioskSettings = async (patch) => {
  const { data, error } = await supabase
    .from(ANNOUNCEMENTS).select('announcement_text').eq('id', 1).maybeSingle();
  if (error) throw error;
  const next = { ...parseKioskSettings(data?.announcement_text), ...patch };
  await updateAnnouncement(JSON.stringify(next));
  return next;
};

// ==============================================================
// 6a. NAKA-ISKEDYUL NA TEKSTO SA WELCOME SCREEN
// ==============================================================
// Listahan na ang dalawang teksto, hindi na iisang teksto bawat isa: bawat
// tala ay { id, text, starts_at, ends_at }. Nagpapatong-patong sila, at
// lumalabas lang ang tala sa loob ng iskedyul nito. Ang lumipas na ay archive.
export const TEXT_KINDS = { announcement: 'announcements', advisory: 'advisories' };

// Hanggang ilang tapos na tala ang tinatandaan bawat uri. Iisang row lang ang
// pinaglalagyan nila, kaya hindi ito puwedeng lumaki nang walang hangganan.
const MAX_ARCHIVED_TEXTS = 30;

// Ang row na hindi pa nagagalaw mula noong iisang teksto pa lang ang bawat
// isa: `announcement` / `advisory`. Isang talang walang iskedyul iyon — kaya
// walang nawawala sa kasalukuyang anunsyo.
export const readTextItems = (settings, kind) => {
  const items = settings?.[TEXT_KINDS[kind]];
  if (Array.isArray(items)) return items;
  const legacy = settings?.[kind];
  return typeof legacy === 'string' && legacy.trim()
    ? [{ id: `legacy-${kind}`, text: legacy, starts_at: null, ends_at: null }]
    : [];
};

const pruneArchive = (items, now = Date.now()) => {
  const ended = items
    .filter((i) => scheduleState(i, now) === 'ended')
    .sort((a, b) => new Date(b.ends_at) - new Date(a.ends_at))
    .slice(MAX_ARCHIVED_TEXTS);
  const drop = new Set(ended.map((i) => i.id));
  return items.filter((i) => !drop.has(i.id));
};

const writeTextItems = async (kind, change) => {
  const { data, error } = await supabase
    .from(ANNOUNCEMENTS).select('announcement_text').eq('id', 1).maybeSingle();
  if (error) throw error;
  const settings = parseKioskSettings(data?.announcement_text);
  const items = pruneArchive(change(readTextItems(settings, kind)));
  // Binubura ang lumang teksto: ang listahan na ang masusunod.
  const next = { ...settings, [TEXT_KINDS[kind]]: items, [kind]: '' };
  await updateAnnouncement(JSON.stringify(next));
  return items;
};

export const saveTextItem = (kind, item) => {
  const saved = { ...item, id: item.id || `${kind}-${Date.now()}` };
  return writeTextItems(kind, (items) => (items.some((i) => i.id === saved.id)
    ? items.map((i) => (i.id === saved.id ? saved : i))
    : [...items, saved]));
};

export const deleteTextItem = (kind, id) =>
  writeTextItems(kind, (items) => items.filter((i) => i.id !== id));

// ==============================================================
// 6b. KALAGAYAN NG ELEVATOR AT ESCALATOR
// ==============================================================
//   'available'   — gumagana
//   'maintenance' — inaayos (naka-iskedyul)
//   'broken'      — sira
export const LIFT_STATUSES = ['available', 'maintenance', 'broken'];
export const LIFTS = ['elevator', 'escalator'];

// Iisang basa para sa dalawa — sabay silang hinihila ng kiosk bawat
// minuto. Kapag hindi mabasa (walang internet, o wala pang naitala),
// gumagana ang palagay — gaya ng kiosk bago pa nagkaroon ng setting na ito.
export const getLiftStatuses = async () => {
  const settings = parseKioskSettings(await getAnnouncement());
  const pick = (status) => (LIFT_STATUSES.includes(status) ? status : 'available');
  return { elevator: pick(settings.elevator), escalator: pick(settings.escalator) };
};

export const setLiftStatus = async (lift, status) => {
  if (!LIFTS.includes(lift)) throw new Error(`Unknown lift: ${lift}`);
  if (!LIFT_STATUSES.includes(status)) throw new Error(`Unknown ${lift} status: ${status}`);
  await patchKioskSettings({ [lift]: status });
  return status;
};

// ==============================================================
// 7. WELCOME SCREEN VIDEOS API
// ==============================================================

// Hindi nagtatapon ng error ang reader: kapag hindi pa nagagawa ang table
// o walang internet ang kiosk, blangkong listahan ang ibabalik at basta
// itatago na lang ang video panel sa welcome screen.
export const getKioskVideos = async ({ activeOnly = false } = {}) => {
  try {
    let query = supabase
      .from(VIDEOS)
      .select('*')
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true });

    if (activeOnly) query = query.eq('is_active', true);

    const { data, error } = await query;
    if (error) throw error;
    // Ang kiosk (`activeOnly`) ay ang nasa iskedyul ngayon lang ang kukunin.
    // Isang minuto ang pagitan ng paghila, kaya iyon din ang tumpak ng iskedyul.
    return activeOnly ? (data || []).filter((v) => isLiveNow(v)) : (data || []);
  } catch (error) {
    console.error('Error fetching kiosk videos:', error);
    return [];
  }
};

export const saveKioskVideo = async (video) => {
  try {
    const payload = {
      title: video.title || '',
      caption: video.caption || '',
      source_url: (video.source_url || '').trim(),
      video_type: video.video_type || 'facebook',
      duration_seconds: Number(video.duration_seconds) || 45,
      sort_order: Number(video.sort_order) || 0,
      is_active: video.is_active !== false,
      orientation: video.orientation === 'portrait' ? 'portrait' : 'landscape',
      has_sound: video.has_sound === true,
      placement: video.placement === 'background' ? 'background' : 'side',
      starts_at: video.starts_at || null,
      ends_at: video.ends_at || null,
    };

    const write = (fields) => (video.id
      ? supabase.from(VIDEOS).update(fields).eq('id', video.id).select().single()
      : supabase.from(VIDEOS).insert([fields]).select().single());

    let { data, error } = await write(payload);

    // Hindi pa napapatakbo ulit ang supabase/kiosk_videos.sql — wala pang
    // hanay para sa `placement`. Ise-save pa rin ang lahat ng iba (lalabas
    // ito sa gilid, gaya ng dati), at sasabihan ang admin.
    let placementSkipped = false;
    let scheduleSkipped = false;
    let fields = payload;
    for (let attempt = 0; error && attempt < 2; attempt++) {
      if (!placementSkipped && isMissingColumn(error, ['placement'])) {
        /* eslint-disable-next-line no-unused-vars */
        const { placement, ...rest } = fields;
        fields = rest;
        placementSkipped = true;
      } else if (!scheduleSkipped && isMissingVideoScheduleColumn(error)) {
        // Hindi pa napapatakbo ang supabase/map_update_2026_11.sql.
        /* eslint-disable-next-line no-unused-vars */
        const { starts_at, ends_at, ...rest } = fields;
        fields = rest;
        scheduleSkipped = true;
      } else {
        break;
      }
      ({ data, error } = await write(fields));
    }
    if (error) throw error;
    return { ...data, placementSkipped, scheduleSkipped };
  } catch (error) {
    console.error('Save Kiosk Video Error:', error);
    throw error;
  }
};

// Inilalagay ang isang video sa posisyong pinili ng admin (1 = una), at
// kusang umuusog ang lahat ng iba. Hindi na kailangang i-edit isa-isa ang
// iba para lang makasingit: ang bagong pang-2 ay itinutulak ang dating
// pang-2 sa pang-3, at iba pa. Pagkatapos nito, laging 0, 1, 2… ang
// sort_order — walang dobleng numero, walang puwang. Ang tapos na (archive)
// ay wala sa bilang ng admin, kaya sa dulo sila laging nakapuwesto.
export const placeKioskVideo = async (id, position) => {
  const { data, error } = await supabase
    .from(VIDEOS)
    .select('*')
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true });
  if (error) throw error;

  const rows = data || [];
  const others = rows.filter((r) => r.id !== id);
  const current = others.filter((r) => scheduleState(r) !== 'ended');
  const archived = others.filter((r) => scheduleState(r) === 'ended');
  const at = Math.min(current.length, Math.max(0, (Number(position) || 1) - 1));
  const ordered = [...current.slice(0, at), { id }, ...current.slice(at), ...archived];

  // Ang nagbago lang ang isinusulat.
  const before = new Map(rows.map((r) => [r.id, r.sort_order]));
  const changes = ordered
    .map((r, i) => ({ id: r.id, sort_order: i }))
    .filter((r) => before.get(r.id) !== r.sort_order);

  for (const r of changes) {
    const { error: updateError } = await supabase
      .from(VIDEOS)
      .update({ sort_order: r.sort_order })
      .eq('id', r.id);
    if (updateError) throw updateError;
  }
};

// ==============================================================
// 8. VIDEO / PICTURE FILE UPLOAD (SUPABASE STORAGE)
// ==============================================================
// Iisang bucket lang ang pinagsasaluhan ng video at larawan — magkasama
// naman silang lumalabas sa iisang kahon sa welcome screen, at iisa rin
// ang mabuburang path kapag tinanggal ang isang tala.
const VIDEO_BUCKET = 'kiosk-videos';
const PUBLIC_MARKER = `/object/public/${VIDEO_BUCKET}/`;

export const uploadKioskVideoFile = async (file) => {
  try {
    const isImage = (file.type || '').startsWith('image/');
    const fallbackExt = isImage ? '.jpg' : '.mp4';
    const ext = (file.name.match(/\.[a-z0-9]+$/i)?.[0] || fallbackExt).toLowerCase();
    const base = file.name
      .replace(/\.[^.]+$/, '')
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || (isImage ? 'picture' : 'video');
    // Kakaiba ang pangalan bawat upload, kaya ligtas ang mahabang cache
    // at hindi nagkakapatungan ang magkaparehong file name.
    const path = `${Date.now()}-${base}${ext}`;

    const { error } = await supabase.storage.from(VIDEO_BUCKET).upload(path, file, {
      cacheControl: '31536000',
      contentType: file.type || (isImage ? 'image/jpeg' : 'video/mp4'),
      upsert: false,
    });
    if (error) throw error;

    const { data } = supabase.storage.from(VIDEO_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  } catch (error) {
    console.error('Upload Kiosk Video Error:', error);
    throw error;
  }
};

// Nakikilala kung galing ba sa sarili nating storage ang link — ginagamit
// para sa kumpirmasyon sa admin at para malaman kung may buburahing file.
export const isUploadedFile = (url) => (url || '').includes(PUBLIC_MARKER);

// Ang landas ay nakabaon na sa public URL, kaya hindi na kailangan ng
// karagdagang column para matandaan kung aling file ang buburahin.
export const deleteKioskVideoFile = async (publicUrl) => {
  const url = publicUrl || '';
  const at = url.indexOf(PUBLIC_MARKER);
  if (at === -1) return false; // panlabas na link — walang buburahin

  const path = decodeURIComponent(url.slice(at + PUBLIC_MARKER.length).split('?')[0]);
  const { error } = await supabase.storage.from(VIDEO_BUCKET).remove([path]);
  if (error) throw error;
  return true;
};

export const deleteKioskVideo = async (id) => {
  try {
    const { error } = await supabase.from(VIDEOS).delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Delete Kiosk Video Error:', error);
    throw error;
  }
};
// ==============================================================
// 10. ACTIVITY LOGS — sino ang nag-edit ng ano, at kailan
// ==============================================================
// Table: supabase/activity_logs.sql. Ang database ang naglalagay ng oras
// at email (trigger), kaya `action`, `target` at `details` lang ang
// ipinapadala rito.
const ACTIVITY_LOGS = 'activity_logs';

// 42P01 — sagot ng Postgres sa table na wala; PGRST205 — ng PostgREST.
const isMissingTable = (error) => error?.code === '42P01' || error?.code === 'PGRST205';

// Hindi kailanman ipinapatumba ang mismong pag-save: kapag hindi naitala,
// nai-save pa rin ang pagbabago. Sa console lang ang babala.
export const logActivity = async (action, target, details = {}) => {
  try {
    const { error } = await supabase.from(ACTIVITY_LOGS).insert({ action, target, details });
    if (error) throw error;
  } catch (error) {
    console.warn(
      isMissingTable(error)
        ? 'Wala pang activity_logs table — patakbuhin ang supabase/activity_logs.sql.'
        : 'Hindi naitala sa activity log:',
      error,
    );
  }
};

// `{ logs, missing }` — `missing` kapag hindi pa napapatakbo ang SQL, para
// masabi ito ng Admin Panel sa halip na blangkong listahan lang.
export const getActivityLogs = async (limit = 200) => {
  const { data, error } = await supabase.from(ACTIVITY_LOGS)
    .select('*').order('created_at', { ascending: false }).limit(limit);
  if (error) {
    if (isMissingTable(error)) return { logs: [], missing: true };
    throw error;
  }
  return { logs: data || [], missing: false };
};
