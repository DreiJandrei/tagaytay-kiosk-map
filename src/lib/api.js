import { supabase } from './supabase';

// ==============================================================
// 1. SUPABASE AUTHENTICATION (BAGO!)
// ==============================================================
export const loginAdmin = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

export const resetPasswordEmail = async (email) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin, // Ibabalik siya sa Kiosk website pag na-click ang email
  });
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

// ==============================================================
// 2. INITIALIZE 2 TABLES
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
      
      if (Array.isArray(rawReqs)) { safeRequirements = rawReqs; } 
      else if (typeof rawReqs === 'string') {
        try {
          const parsed = JSON.parse(rawReqs);
          safeRequirements = Array.isArray(parsed) ? parsed : [rawReqs];
        } catch (e) {
          safeRequirements = rawReqs.trim() !== "" ? [rawReqs] : [];
        }
      }

      structuredData[row.floor][row.office_key] = {
        title: row.title, badge: row.badge, hours: safeDetails?.hours || '', 
        head: safeDetails?.head || '', requirements: safeRequirements, 
        cssClass: row.css_class, status: safeDetails?.status || 'Available', searchCount: row.search_count || 0
      };
    });
    return structuredData;
  } catch (error) { 
    console.error('Error fetching all offices:', error); 
    throw error; 
  }
};

// ==============================================================
// 4. UPDATE 2 TABLES SIMULTANEOUSLY (WITH UPSERT FIX)
// ==============================================================
export const updateOffice = async (officeKey, updates) => {
  try {
    const { error: err1 } = await supabase.from('offices').update({
      title: updates.title, badge: updates.badge, css_class: updates.cssClass
    }).eq('office_key', officeKey);
    if (err1) throw err1;

    const { error: err2 } = await supabase.from('office_details').upsert({
      office_key: officeKey, head: updates.head, hours: updates.hours, 
      status: updates.status, requirements: updates.requirements
    });
    if (err2) throw err2;

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
    const { error: updateError } = await supabase.from('offices').update({ search_count: newCount }).eq('office_key', officeKey);
    if (updateError) throw updateError;
    return true;
  } catch (error) { return false; }
};

// ==============================================================
// 6. ANNOUNCEMENT SETTINGS API
// ==============================================================
export const getAnnouncement = async () => {
  try {
    const { data, error } = await supabase.from('settings').select('announcement_text').eq('id', 1).single();
    if (error && error.code !== 'PGRST116') throw error; 
    return data ? data.announcement_text : "";
  } catch (error) { return ""; }
};

export const updateAnnouncement = async (text) => {
  try {
    const { data: existing } = await supabase.from('settings').select('id').eq('id', 1).single();
    if (existing) { await supabase.from('settings').update({ announcement_text: text }).eq('id', 1); } 
    else { await supabase.from('settings').insert([{ id: 1, announcement_text: text }]); }
    return true;
  } catch (error) { return false; }
};