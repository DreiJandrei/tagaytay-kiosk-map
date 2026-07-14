import React, { useState, useEffect } from 'react';
import { updateOffice } from '../lib/api';

export default function AdminPanel({ officeDatabase, onClose, onDataUpdate }) {
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [selectedOfficeKey, setSelectedOfficeKey] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formTitle, setFormTitle] = useState('');
  const [formHours, setFormHours] = useState('');
  const [formHead, setFormHead] = useState('');
  const [formRequirements, setFormRequirements] = useState('');
  const [formCssClass, setFormCssClass] = useState('');
  const [formStatus, setFormStatus] = useState('Available'); // BAGO: Status state

  const getOfficesForSelectedFloor = () => {
    if (!officeDatabase) return [];
    if (officeDatabase[selectedFloor]) {
      return Object.entries(officeDatabase[selectedFloor]).map(([key, details]) => ({
        key: key,
        ...details
      }));
    }
    if (Array.isArray(officeDatabase)) {
      return officeDatabase.filter(off => Number(off.floor) === Number(selectedFloor));
    }
    return [];
  };

  const visibleOffices = getOfficesForSelectedFloor();
  const currentOffice = officeDatabase?.[selectedFloor]?.[selectedOfficeKey];

  useEffect(() => {
    if (currentOffice) {
      setFormTitle(currentOffice.title || '');
      setFormHours(currentOffice.hours || '');
      setFormHead(currentOffice.head || '');
      setFormCssClass(currentOffice.cssClass || '');
      setFormStatus(currentOffice.status || 'Available'); // BAGO: Set initial status
      
      if (Array.isArray(currentOffice.requirements)) {
        setFormRequirements(currentOffice.requirements.join('\n'));
      } else {
        setFormRequirements('');
      }
    }
  }, [selectedOfficeKey, selectedFloor, officeDatabase, currentOffice]);

  const handleFloorChange = (e) => {
    setSelectedFloor(Number(e.target.value));
    setSelectedOfficeKey(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedOfficeKey) return;

    setIsSaving(true);
    try {
      const requirementsArray = formRequirements
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      await updateOffice(selectedOfficeKey, {
        title: formTitle,
        hours: formHours,
        head: formHead,
        badge: currentOffice?.badge || '',
        requirements: requirementsArray,
        cssClass: formCssClass,
        status: formStatus // BAGO: Pinapasa ang status sa backend
      });

      if (onDataUpdate) onDataUpdate();
      alert('Office updates successfully deployed to database!');
    } catch (error) {
      console.error("Failed to update office information:", error);
      alert('Database connection error. Check console logs.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
    }}>
      <div style={{
        backgroundColor: '#FFFFFF', width: '90%', maxWidth: '1100px', height: '650px',
        borderRadius: '20px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden'
      }}>
        
        <div style={{
          backgroundColor: '#4F46E5', padding: '20px 30px', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center', color: '#FFFFFF'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
            🔧 Admin Panel – Office Information Management
          </h2>
          <button onClick={onClose} style={{
            backgroundColor: 'rgba(255, 255, 255, 0.15)', color: '#FFFFFF', border: '1px solid rgba(255, 255, 255, 0.3)',
            padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.95rem',
            transition: 'background 0.2s'
          }}>
            ✕ Close
          </button>
        </div>

        <div style={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
          <div style={{ width: '320px', borderRight: '1px solid #E2E8F0', padding: '24px', display: 'flex', flexDirection: 'column', backgroundColor: '#F8FAFC' }}>
            <label style={{ display: 'block', color: '#475569', fontWeight: '800', fontSize: '0.9rem', marginBottom: '8px', textTransform: 'uppercase' }}>
              Select Floor:
            </label>
            <select value={selectedFloor} onChange={handleFloorChange} style={{
              width: '100%', padding: '12px 16px', borderRadius: '10px', border: '2px solid #CBD5E1',
              fontSize: '1.05rem', fontWeight: '700', color: '#1E293B', backgroundColor: '#FFFFFF', outline: 'none', cursor: 'pointer'
            }}>
              {[1, 2, 3, 4, 5, 6, 7].map(f => (
                <option key={f} value={f}>Floor {f}</option>
              ))}
            </select>

            <div style={{ flexGrow: 1, overflowY: 'auto', marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
              {visibleOffices.length === 0 ? (
                <p style={{ color: '#94A3B8', fontStyle: 'italic', textAlign: 'center', marginTop: '20px' }}>No offices registered.</p>
              ) : (
                visibleOffices.map((office) => {
                  const isActive = selectedOfficeKey === office.key;
                  return (
                    <button key={office.key} onClick={() => setSelectedOfficeKey(office.key)} style={{
                      width: '100%', padding: '14px 16px', textAlign: 'left', borderRadius: '10px',
                      border: isActive ? '2px solid #4F46E5' : '1px solid #E2E8F0',
                      backgroundColor: isActive ? '#EEF2FF' : '#FFFFFF',
                      color: isActive ? '#4F46E5' : '#334155',
                      fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer'
                    }}>
                      {office.title}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div style={{ flexGrow: 1, padding: '35px', overflowY: 'auto', backgroundColor: '#FFFFFF' }}>
            {!selectedOfficeKey ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748B' }}>
                <div style={{ fontSize: '4.5rem', marginBottom: '15px' }}>📝</div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.6rem', color: '#1E293B', fontWeight: '800' }}>Select an Office to Edit</h3>
                <p style={{ margin: 0, fontSize: '1.05rem', color: '#64748B', textAlign: 'center' }}>Choose an office from the left sidebar to update its information</p>
              </div>
            ) : (
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
                <div style={{ borderBottom: '2px solid #F1F5F9', paddingBottom: '15px' }}>
                  <span style={{ color: '#4F46E5', fontWeight: '800', fontSize: '0.9rem', textTransform: 'uppercase' }}>Editing Room Metadata</span>
                  <h2 style={{ margin: '4px 0 0 0', color: '#0F172A', fontSize: '1.6rem', fontWeight: '900' }}>{currentOffice?.title || selectedOfficeKey}</h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: '700', color: '#475569', marginBottom: '6px', fontSize: '0.95rem' }}>Office Window/Display Title</label>
                    <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} required style={{
                      width: '100%', padding: '12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '1rem', outline: 'none'
                    }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: '700', color: '#475569', marginBottom: '6px', fontSize: '0.95rem' }}>Operating Hours</label>
                    <input type="text" value={formHours} onChange={(e) => setFormHours(e.target.value)} placeholder="e.g., 8:00 AM - 5:00 PM" style={{
                      width: '100%', padding: '12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '1rem', outline: 'none'
                    }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: '700', color: '#475569', marginBottom: '6px', fontSize: '0.95rem' }}>Department Head</label>
                    <input type="text" value={formHead} onChange={(e) => setFormHead(e.target.value)} style={{
                      width: '100%', padding: '12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '1rem', outline: 'none'
                    }} />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontWeight: '700', color: '#475569', marginBottom: '6px', fontSize: '0.95rem' }}>Room Theme</label>
                    <select value={formCssClass} onChange={(e) => setFormCssClass(e.target.value)} style={{
                      width: '100%', padding: '12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '1rem', outline: 'none', backgroundColor: '#F8FAFC'
                    }}>
                      <option value="">Default Normal Color</option>
                      <option value="theme-const">🚧 Under Construction (Striped)</option>
                      <option value="theme-amber">🟠 Amber / Orange</option>
                      <option value="theme-blue">🔵 Blue</option>
                      <option value="theme-cyan">🩵 Cyan</option>
                      <option value="theme-purple">🟣 Purple</option>
                      <option value="theme-teal">🟢 Teal</option>
                      <option value="theme-gray">🔘 Dark Gray</option>
                    </select>
                  </div>

                  {/* BAGO: Status Dropdown */}
                  <div>
                    <label style={{ display: 'block', fontWeight: '700', color: '#475569', marginBottom: '6px', fontSize: '0.95rem' }}>Current Status</label>
                    <select value={formStatus} onChange={(e) => setFormStatus(e.target.value)} style={{
                      width: '100%', padding: '12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '1rem', outline: 'none', backgroundColor: '#F8FAFC'
                    }}>
                      <option value="Available">🟢 Available</option>
                      <option value="In a Meeting">🔴 In a Meeting</option>
                      <option value="Out of Office">🟡 Out of Office</option>
                      <option value="Closed">⚫ Closed</option>
                    </select>
                  </div>
                </div>

                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <label style={{ display: 'block', fontWeight: '700', color: '#475569', marginBottom: '6px', fontSize: '0.95rem' }}>
                    Transaction Requirements <span style={{ fontWeight: 'normal', color: '#94A3B8', fontSize: '0.85rem' }}>(Put each required document on a new line)</span>
                  </label>
                  <textarea value={formRequirements} onChange={(e) => setFormRequirements(e.target.value)} placeholder="Example:&#10;Valid Government ID&#10;Application Form Box 4" style={{
                    width: '100%', flexGrow: 1, minHeight: '120px', padding: '12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '1rem', outline: 'none', fontFamily: 'inherit', resize: 'none'
                  }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: 'auto', paddingTop: '15px', borderTop: '2px solid #F1F5F9' }}>
                  <button type="button" onClick={() => setSelectedOfficeKey(null)} style={{
                    padding: '12px 24px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#64748B', fontWeight: '700', cursor: 'pointer'
                  }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={isSaving} style={{
                    padding: '12px 30px', borderRadius: '8px', border: 'none', backgroundColor: '#4F46E5', color: '#FFFFFF', fontWeight: '700', cursor: isSaving ? 'not-allowed' : 'pointer'
                  }}>
                    {isSaving ? 'Saving Changes...' : '💾 Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}