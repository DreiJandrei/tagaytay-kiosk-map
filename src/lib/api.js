import { supabase } from './supabase';

// ==============================================================
// 1. SUPABASE AUTHENTICATION
// ==============================================================
export const loginAdmin = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

export const resetPasswordEmail = async (email) => {
  // Ibalik sa ORIHINAL na pinanggalingan, hindi sa naka-hardcode na Vercel URL.
  // Kapag naka-hardcode, ang admin na humihiling mula sa localhost ay
  // itatapon sa production (o babagsak sa Site URL ng Supabase kapag hindi
  // naka-allowlist ang redirectTo) — kaya "hindi gumagana" ang reset link.
  // Idinadagdag ang kiosk key para hindi mag-"System Locked" pagbalik.
  const redirectTo = `${window.location.origin}/?key=cct-bsit-kiosk`;

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) throw error;
  return data;
};

export const changeAdminPassword = async (newPassword) => {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
  return data;
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
          badge: item.badge || '',
          css_class: item.cssClass || '',
          search_count: 0
        });

        detailsToInsert.push({
          office_key: officeKey, 
          hours: item.hours || '', 
          head: item.head || '', 
          description: item.description || '', 
          requirements: Array.isArray(item.requirements) ? item.requirements : [],
          status: item.status || 'Available'
        });
      });
    });

    const { error: insertError1 } = await supabase.from('offices').insert(officesToInsert);
    if (insertError1) throw insertError1;

    const { error: insertError2 } = await supabase.from('office_details').insert(detailsToInsert);
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
    const { data, error } = await supabase.from('offices').select('*, office_details(*)');
    if (error) throw error;

    const structuredData = {};
    data.forEach(row => {
      const details = row.office_details || {};
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

      structuredData[row.floor][row.office_key] = {
        title: row.title, 
        badge: row.badge, 
        hours: safeDetails?.hours || '', 
        head: safeDetails?.head || '',
        description: safeDetails?.description || '', 
        requirements: safeRequirements, 
        cssClass: row.css_class, 
        status: safeDetails?.status || 'Available',
        searchCount: row.search_count || 0
      };
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
export const updateOffice = async (officeKey, updates) => {
  try {
    const { error: err1 } = await supabase.from('offices').update({
      title: updates.title, 
      badge: updates.badge, 
      css_class: updates.cssClass
    }).eq('office_key', officeKey);
    if (err1) throw err1;

    const { data: existingDetail, error: checkErr } = await supabase.from('office_details').select('office_key').eq('office_key', officeKey).maybeSingle();
    if (checkErr) throw checkErr;

    if (existingDetail) {
      const { error: err2 } = await supabase.from('office_details').update({
        head: updates.head, 
        hours: updates.hours, 
        description: updates.description, 
        status: updates.status, 
        requirements: updates.requirements
      }).eq('office_key', officeKey);
      if (err2) throw err2;
    } else {
      const { error: err2 } = await supabase.from('office_details').insert({
        office_key: officeKey, 
        head: updates.head, 
        hours: updates.hours, 
        description: updates.description, 
        status: updates.status, 
        requirements: updates.requirements
      });
      if (err2) throw err2;
    }

    return { success: true };
  } catch (error) { 
    console.error(`Error updating office ${officeKey}:`, error); 
    throw error; 
  }
};

// ==============================================================
// 5. INCREMENT SEARCH COUNT
// ==============================================================
export const incrementSearchCount = async (officeKey) => {
  try {
    const { data: currentData, error: fetchError } = await supabase.from('offices').select('search_count').eq('office_key', officeKey).single();
    if (fetchError) throw fetchError;
    const newCount = (currentData.search_count || 0) + 1;
    await supabase.from('offices').update({ search_count: newCount }).eq('office_key', officeKey);
    return true;
  } catch (error) { return false; }
};

// ==============================================================
// 6. ANNOUNCEMENT SETTINGS API
// ==============================================================
export const getAnnouncement = async () => {
  try {
    const { data, error } = await supabase.from('kiosks_announcements').select('announcement_text').eq('id', 1).maybeSingle();
    if (error) throw error; 
    return data ? data.announcement_text : "";
  } catch (error) { return ""; }
};

export const updateAnnouncement = async (text) => {
  try {
    const { data: existing, error: checkErr } = await supabase.from('kiosks_announcements').select('id').eq('id', 1).maybeSingle();
    if (checkErr) throw checkErr;

    if (existing) {
      await supabase.from('kiosks_announcements').update({ announcement_text: text }).eq('id', 1);
    } else {
      await supabase.from('kiosks_announcements').insert([{ id: 1, announcement_text: text }]);
    }
    return true;
  } catch (error) {
    console.error("Save Announcement Error:", error);
    throw error;
  }
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
      .from('kiosk_videos')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true });

    if (activeOnly) query = query.eq('is_active', true);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
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
    };

    if (video.id) {
      const { data, error } = await supabase
        .from('kiosk_videos').update(payload).eq('id', video.id).select().single();
      if (error) throw error;
      return data;
    }

    const { data, error } = await supabase
      .from('kiosk_videos').insert([payload]).select().single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Save Kiosk Video Error:', error);
    throw error;
  }
};

// ==============================================================
// 8. VIDEO FILE UPLOAD (SUPABASE STORAGE)
// ==============================================================
const VIDEO_BUCKET = 'kiosk-videos';
const PUBLIC_MARKER = `/object/public/${VIDEO_BUCKET}/`;

export const uploadKioskVideoFile = async (file) => {
  try {
    const ext = (file.name.match(/\.[a-z0-9]+$/i)?.[0] || '.mp4').toLowerCase();
    const base = file.name
      .replace(/\.[^.]+$/, '')
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'video';
    // Kakaiba ang pangalan bawat upload, kaya ligtas ang mahabang cache
    // at hindi nagkakapatungan ang magkaparehong file name.
    const path = `${Date.now()}-${base}${ext}`;

    const { error } = await supabase.storage.from(VIDEO_BUCKET).upload(path, file, {
      cacheControl: '31536000',
      contentType: file.type || 'video/mp4',
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
    const { error } = await supabase.from('kiosk_videos').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Delete Kiosk Video Error:', error);
    throw error;
  }
};