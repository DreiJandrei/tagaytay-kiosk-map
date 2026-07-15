import { supabase } from './supabase';

export const initializeDatabase = async (seedData) => {
  try {
    const { data: existing, error: checkError } = await supabase.from('offices').select('office_key').limit(1);
    if (checkError) throw checkError;
    if (existing && existing.length > 0) return { success: true, message: 'Database already initialized.' };

    const rowsToInsert = [];
    Object.keys(seedData).forEach(floorStr => {
      const floorNum = parseInt(floorStr);
      Object.keys(seedData[floorStr]).forEach(officeKey => {
        const item = seedData[floorStr][officeKey];
        rowsToInsert.push({
          office_key: officeKey, floor: floorNum, title: item.title || '', badge: item.badge || '',
          hours: item.hours || '', head: item.head || '', requirements: item.requirements || [],
          status: item.status || 'Available', search_count: 0 // BAGO: Default search count ay 0
        });
      });
    });

    const { error: insertError } = await supabase.from('offices').insert(rowsToInsert);
    if (insertError) throw insertError;
    return { success: true };
  } catch (error) { console.error('Error initializing database setup:', error); throw error; }
};

export const getAllOffices = async () => {
  try {
    const { data, error } = await supabase.from('offices').select('*');
    if (error) throw error;

    const structuredData = {};
    data.forEach(row => {
      if (!structuredData[row.floor]) structuredData[row.floor] = {};
      structuredData[row.floor][row.office_key] = {
        title: row.title, badge: row.badge, hours: row.hours, head: row.head,
        requirements: row.requirements, cssClass: row.css_class, status: row.status || 'Available',
        searchCount: row.search_count || 0 // BAGO: Kinukuha ang search count
      };
    });
    return structuredData;
  } catch (error) { console.error('Error fetching all offices:', error); throw error; }
};

export const updateOffice = async (officeKey, updates) => {
  try {
    const { data, error } = await supabase.from('offices').update({
      title: updates.title, badge: updates.badge, hours: updates.hours, head: updates.head,
      requirements: updates.requirements, css_class: updates.cssClass, status: updates.status
    }).eq('office_key', officeKey).select();
    if (error) throw error;
    return { success: true, data };
  } catch (error) { console.error(`Error updating office ${officeKey}:`, error); throw error; }
};

// BAGO: Function para mag-add ng +1 sa search count sa database kapag may naghanap
export const incrementSearchCount = async (officeKey) => {
  try {
    const { data: currentData, error: fetchError } = await supabase.from('offices').select('search_count').eq('office_key', officeKey).single();
    if (fetchError) throw fetchError;
    
    const newCount = (currentData.search_count || 0) + 1;
    const { error: updateError } = await supabase.from('offices').update({ search_count: newCount }).eq('office_key', officeKey);
    if (updateError) throw updateError;
    return true;
  } catch (error) { console.error(`Error incrementing search count:`, error); return false; }
};