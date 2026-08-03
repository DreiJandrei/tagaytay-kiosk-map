import { supabase } from './supabase';

// ==============================================================
// 1. INITIALIZE 2 TABLES (OFFICES & OFFICE_DETAILS)
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
        
        // Data para sa Table 1 (offices)
        officesToInsert.push({
          office_key: officeKey, 
          floor: floorNum, 
          title: item.title || '', 
          badge: item.badge || '',
          css_class: item.cssClass || '',
          search_count: 0
        });

        // Data para sa Table 2 (office_details)
        detailsToInsert.push({
          office_key: officeKey, 
          hours: item.hours || '', 
          head: item.head || '', 
          requirements: item.requirements || [],
          status: item.status || 'Available'
        });
      });
    });

    // Insert sa Table 1 muna (dahil ito ang may Primary Key)
    const { error: insertError1 } = await supabase.from('offices').insert(officesToInsert);
    if (insertError1) throw insertError1;

    // Insert sa Table 2 (dahil nakadepende ito sa Foreign Key ng Table 1)
    const { error: insertError2 } = await supabase.from('office_details').insert(detailsToInsert);
    if (insertError2) throw insertError2;

    return { success: true };
  } catch (error) { 
    console.error('Error initializing database setup:', error); 
    throw error; 
  }
};

// ==============================================================
// 2. GET DATA USING RELATIONAL JOIN
// ==============================================================
export const getAllOffices = async () => {
  try {
    // Kinukuha ang data mula sa hiwalay na tables gamit ang join (*)
    const { data, error } = await supabase.from('offices').select('*, office_details(*)');
    if (error) throw error;

    const structuredData = {};
    data.forEach(row => {
      // Kung sakaling walang details, fallback sa empty object
      const details = row.office_details || {};
      // Kung nag-return ng array ang join, kunin ang unang item
      const safeDetails = Array.isArray(details) ? details[0] : details;
      
      if (!structuredData[row.floor]) structuredData[row.floor] = {};
      
      // Pinagsasama sila pabalik para maging iisang object para sa frontend UI
      structuredData[row.floor][row.office_key] = {
        title: row.title, 
        badge: row.badge, 
        hours: safeDetails?.hours || '', 
        head: safeDetails?.head || '',
        requirements: safeDetails?.requirements || [], 
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
// 3. UPDATE 2 TABLES SIMULTANEOUSLY
// ==============================================================
export const updateOffice = async (officeKey, updates) => {
  try {
    // 1. I-update ang pangunahing table (title, badge, css_class)
    const { error: err1 } = await supabase.from('offices').update({
      title: updates.title, 
      badge: updates.badge, 
      css_class: updates.cssClass
    }).eq('office_key', officeKey);
    if (err1) throw err1;

    // 2. I-update ang hiwalay na table (head, hours, status, requirements)
    const { error: err2 } = await supabase.from('office_details').update({
      head: updates.head, 
      hours: updates.hours, 
      status: updates.status, 
      requirements: updates.requirements
    }).eq('office_key', officeKey);
    if (err2) throw err2;

    return { success: true };
  } catch (error) { 
    console.error(`Error updating office ${officeKey}:`, error); 
    throw error; 
  }
};

// ==============================================================
// 4. INCREMENT SEARCH COUNT
// ==============================================================
export const incrementSearchCount = async (officeKey) => {
  try {
    const { data: currentData, error: fetchError } = await supabase.from('offices').select('search_count').eq('office_key', officeKey).single();
    if (fetchError) throw fetchError;
    
    const newCount = (currentData.search_count || 0) + 1;
    const { error: updateError } = await supabase.from('offices').update({ search_count: newCount }).eq('office_key', officeKey);
    if (updateError) throw updateError;
    return true;
  } catch (error) { 
    console.error(`Error incrementing search count:`, error); 
    return false; 
  }
};

// ==============================================================
// 5. ANNOUNCEMENT SETTINGS API
// ==============================================================
export const getAnnouncement = async () => {
  try {
    const { data, error } = await supabase.from('settings').select('announcement_text').eq('id', 1).single();
    if (error && error.code !== 'PGRST116') throw error; 
    return data ? data.announcement_text : "";
  } catch (error) { 
    console.error('Error fetching announcement:', error); 
    return ""; 
  }
};

export const updateAnnouncement = async (text) => {
  try {
    const { data: existing } = await supabase.from('settings').select('id').eq('id', 1).single();
    if (existing) {
      await supabase.from('settings').update({ announcement_text: text }).eq('id', 1);
    } else {
      await supabase.from('settings').insert([{ id: 1, announcement_text: text }]);
    }
    return true;
  } catch (error) { 
    console.error('Error updating announcement:', error); 
    return false; 
  }
};