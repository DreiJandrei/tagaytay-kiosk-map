import React, { useState, useEffect } from 'react';
import { updateOffice, getAnnouncement, updateAnnouncement } from '../lib/api';

export default function AdminPanel({ officeDatabase, onClose, onDataUpdate }) {
  const [activeTab, setActiveTab] = useState('announcements');
  
  // BAGO: Hinati natin sa dalawang state ang mga text
  const [advisoryText, setAdvisoryText] = useState('');
  const [announcementText, setAnnouncementText] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [selectedFloor, setSelectedFloor] = useState(1);
  const [selectedOfficeKey, setSelectedOfficeKey] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formTitle, setFormTitle] = useState('');
  const [formHours, setFormHours] = useState('');
  const [formHead, setFormHead] = useState('');
  const [formRequirements, setFormRequirements] = useState('');
  const [formCssClass, setFormCssClass] = useState('');
  const [formStatus, setFormStatus] = useState('Available'); 

  useEffect(() => {
    const fetchAdminData = async () => {
      const text = await getAnnouncement();
      try {
        const parsed = JSON.parse(text);
        setAdvisoryText(parsed.advisory || '');
        setAnnouncementText(parsed.announcement || '');
      } catch (e) {
        setAdvisoryText(text); // Default fallback
      }
    };
    fetchAdminData();
  }, []);

  const getOfficesForSelectedFloor = () => {
    if (!officeDatabase) return [];
    if (officeDatabase[selectedFloor]) {
      return Object.entries(officeDatabase[selectedFloor])
        .filter(([key]) => key !== 'elevator-up' && key !== 'stairs-up') 
        .map(([key, details]) => ({ key: key, ...details }));
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
      setFormStatus(currentOffice.status || 'Available'); 
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

  const handleSaveOffice = async (e) => {
    e.preventDefault();
    if (!selectedOfficeKey) return;
    setIsSaving(true);
    try {
      const requirementsArray = formRequirements.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      await updateOffice(selectedOfficeKey, {
        title: formTitle, hours: formHours, head: formHead,
        badge: currentOffice?.badge || '', requirements: requirementsArray,
        cssClass: formCssClass, status: formStatus 
      });
      if (onDataUpdate) onDataUpdate();
      alert('Office updates successfully deployed!');
    } catch (error) {
      alert('Database error. Check logs.');
    } finally { setIsSaving(false); }
  };

  const handleSaveAnnouncement = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // BAGO: Pinagsasama natin sila bago i-save sa database para hindi na kailangan ng bagong table column!
      const combined = JSON.stringify({ advisory: advisoryText, announcement: announcementText });
      await updateAnnouncement(combined);
      alert('System Announcements & Advisories updated successfully!');
    } catch (error) {
      alert('Failed to update announcement.');
    } finally { setIsSaving(false); }
  };

  const handleSavePassword = (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.trim() === '') {
      alert('Please enter a valid password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match! Please try again.');
      return;
    }
    localStorage.setItem('kiosk_admin_password', newPassword);
    setNewPassword('');
    setConfirmPassword('');
    alert('✅ Admin Password changed successfully! Use your new password next time you login.');
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ backgroundColor: '#FFFFFF', width: '90%', maxWidth: '1100px', height: '750px', borderRadius: '20px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        <div style={{ backgroundColor: '#4F46E5', padding: '20px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#FFFFFF' }}>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
            🔧 Tagaytay City Hall Admin Panel
          </h2>
          <button onClick={onClose} style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', color: '#FFFFFF', border: '1px solid rgba(255, 255, 255, 0.3)', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', transition: 'background 0.2s' }}>
            ✕ Close
          </button>
        </div>

        <div style={{ display: 'flex', background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
          <button onClick={() => setActiveTab('announcements')} style={{ flex: 1, padding: '15px', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer', border: 'none', background: activeTab === 'announcements' ? '#FFFFFF' : 'transparent', color: activeTab === 'announcements' ? '#4F46E5' : '#64748B', borderBottom: activeTab === 'announcements' ? '4px solid #4F46E5' : '4px solid transparent' }}>
            📢 Announcements & Advisories
          </button>
          <button onClick={() => setActiveTab('offices')} style={{ flex: 1, padding: '15px', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer', border: 'none', background: activeTab === 'offices' ? '#FFFFFF' : 'transparent', color: activeTab === 'offices' ? '#4F46E5' : '#64748B', borderBottom: activeTab === 'offices' ? '4px solid #4F46E5' : '4px solid transparent' }}>
            🏢 Office Directory Management
          </button>
          <button onClick={() => setActiveTab('security')} style={{ flex: 1, padding: '15px', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer', border: 'none', background: activeTab === 'security' ? '#FFFFFF' : 'transparent', color: activeTab === 'security' ? '#4F46E5' : '#64748B', borderBottom: activeTab === 'security' ? '4px solid #4F46E5' : '4px solid transparent' }}>
            🔒 Change Admin Password
          </button>
        </div>

        {/* TAB 1: ANNOUNCEMENTS & ADVISORIES */}
        {activeTab === 'announcements' && (
          <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#FFFFFF', overflowY: 'auto' }}>
            <h2 style={{ color: '#0F172A', marginBottom: '10px' }}>📢 Announcements & Advisories</h2>
            <p style={{ color: '#64748B', marginBottom: '20px' }}>Manage the idle screen displays. Leave a field blank to hide it.</p>
            
            <form onSubmit={handleSaveAnnouncement} style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, gap: '20px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <label style={{ fontWeight: 800, color: '#1E40AF', marginBottom: '8px' }}>1. Official Announcement (Board)</label>
                <textarea 
                  value={announcementText} 
                  onChange={(e) => setAnnouncementText(e.target.value)} 
                  placeholder="e.g. Walang pasok bukas dahil sa bagyo... (Appears in a large card below the title)"
                  style={{ width: '100%', flexGrow: 1, padding: '20px', border: '2px solid #CBD5E1', borderRadius: '12px', fontSize: '1.2rem', outline: 'none', fontFamily: 'inherit', resize: 'none', background: '#F8FAFC', boxSizing: 'border-box' }} 
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <label style={{ fontWeight: 800, color: '#E11D48', marginBottom: '8px' }}>2. Scrolling Advisory (Marquee)</label>
                <textarea 
                  value={advisoryText} 
                  onChange={(e) => setAdvisoryText(e.target.value)} 
                  placeholder="e.g. Please secure your belongings... (Scrolling ticker at the absolute bottom)"
                  style={{ width: '100%', flexGrow: 1, padding: '20px', border: '2px solid #CBD5E1', borderRadius: '12px', fontSize: '1.2rem', outline: 'none', fontFamily: 'inherit', resize: 'none', background: '#FEF2F2', boxSizing: 'border-box' }} 
                />
              </div>

              <button type="submit" disabled={isSaving} style={{ padding: '20px', borderRadius: '12px', border: 'none', backgroundColor: '#3B82F6', color: '#FFFFFF', fontWeight: '900', fontSize: '1.2rem', cursor: isSaving ? 'not-allowed' : 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginTop: '10px' }}>
                {isSaving ? 'Deploying to Kiosks...' : '📢 Publish Updates'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: OFFICES */}
        {activeTab === 'offices' && (
          <div style={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
            <div style={{ width: '320px', borderRight: '1px solid #E2E8F0', padding: '24px', display: 'flex', flexDirection: 'column', backgroundColor: '#F8FAFC' }}>
              <label style={{ display: 'block', color: '#475569', fontWeight: '800', fontSize: '0.9rem', marginBottom: '8px', textTransform: 'uppercase' }}>Select Floor:</label>
              <select value={selectedFloor} onChange={handleFloorChange} style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '2px solid #CBD5E1', fontSize: '1.05rem', fontWeight: '700', color: '#1E293B', outline: 'none', cursor: 'pointer' }}>
                {[1, 2, 3, 4, 5, 6, 7].map(f => (<option key={f} value={f}>Floor {f}</option>))}
              </select>
              <div style={{ flexGrow: 1, overflowY: 'auto', marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
                {visibleOffices.map((office) => (
                  <button key={office.key} onClick={() => setSelectedOfficeKey(office.key)} style={{ width: '100%', padding: '14px 16px', textAlign: 'left', borderRadius: '10px', border: selectedOfficeKey === office.key ? '2px solid #4F46E5' : '1px solid #E2E8F0', backgroundColor: selectedOfficeKey === office.key ? '#EEF2FF' : '#FFFFFF', color: selectedOfficeKey === office.key ? '#4F46E5' : '#334155', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer' }}>
                    {office.title}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ flexGrow: 1, padding: '35px', overflowY: 'auto', backgroundColor: '#FFFFFF' }}>
              {!selectedOfficeKey ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748B' }}>
                  <div style={{ fontSize: '4.5rem', marginBottom: '15px' }}>📝</div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.6rem', color: '#1E293B', fontWeight: '800' }}>Select an Office to Edit</h3>
                </div>
              ) : (
                <form onSubmit={handleSaveOffice} style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div><label style={{ fontWeight: '700', color: '#475569', fontSize: '0.95rem' }}>Title</label><input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} required style={{ width: '100%', padding: '12px', border: '1px solid #CBD5E1', borderRadius: '8px', boxSizing: 'border-box' }} /></div>
                    <div><label style={{ fontWeight: '700', color: '#475569', fontSize: '0.95rem' }}>Hours</label><input type="text" value={formHours} onChange={(e) => setFormHours(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #CBD5E1', borderRadius: '8px', boxSizing: 'border-box' }} /></div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={{ fontWeight: '700', color: '#475569', fontSize: '0.95rem' }}>Head</label>
                      <input type="text" value={formHead} onChange={(e) => setFormHead(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #CBD5E1', borderRadius: '8px', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontWeight: '700', color: '#475569', fontSize: '0.95rem' }}>Status</label>
                      <select value={formStatus} onChange={(e) => setFormStatus(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #CBD5E1', borderRadius: '8px', boxSizing: 'border-box' }}>
                        <option value="Available">🟢 Available</option>
                        <option value="In a Meeting">🔴 In a Meeting</option>
                        <option value="Out of Office">🟡 Out of Office</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontWeight: '700', color: '#475569', fontSize: '0.95rem' }}>Requirements</label>
                    <textarea value={formRequirements} onChange={(e) => setFormRequirements(e.target.value)} style={{ width: '100%', flexGrow: 1, padding: '12px', border: '1px solid #CBD5E1', borderRadius: '8px', resize: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <button type="submit" disabled={isSaving} style={{ padding: '15px', borderRadius: '8px', background: '#4F46E5', color: 'white', fontWeight: '800', fontSize: '1.1rem', border: 'none', cursor: 'pointer' }}>
                    {isSaving ? 'Saving...' : '💾 Save Office Metadata'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SECURITY / CHANGE PASSWORD */}
        {activeTab === 'security' && (
          <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#FFFFFF' }}>
            <h2 style={{ color: '#0F172A', marginBottom: '10px' }}>🔒 Security & Admin Access</h2>
            <p style={{ color: '#64748B', marginBottom: '30px', fontSize: '1.05rem', lineHeight: '1.6' }}>
              Change the password required to open this Admin Panel. Make sure to remember your new password! 
              <br />
              <span style={{ color: '#E11D48', fontWeight: '700' }}>
                Note: Default password is <strong>admin123</strong>. If you ever forget your custom password, type cctreset on password, and it will return to admin123
              </span>
            </p>
            
            <form onSubmit={handleSavePassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '480px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '800', color: '#475569', marginBottom: '8px' }}>New Admin Password:</label>
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  placeholder="Enter new password..." 
                  required 
                  style={{ width: '100%', padding: '15px', border: '2px solid #CBD5E1', borderRadius: '10px', fontSize: '1.1rem', outline: 'none', boxSizing: 'border-box' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '800', color: '#475569', marginBottom: '8px' }}>Confirm New Password:</label>
                <input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  placeholder="Re-type new password..." 
                  required 
                  style={{ width: '100%', padding: '15px', border: '2px solid #CBD5E1', borderRadius: '10px', fontSize: '1.1rem', outline: 'none', boxSizing: 'border-box' }} 
                />
              </div>
              <button type="submit" style={{ padding: '18px', borderRadius: '12px', border: 'none', backgroundColor: '#4F46E5', color: '#FFFFFF', fontWeight: '900', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginTop: '10px' }}>
                💾 Update Admin Password
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}