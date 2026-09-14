import React, { useState, useEffect, useRef } from 'react';
import VirtualKeyboard from '../components/VirtualKeyboard';
import {
  updateOffice, getAnnouncement, updateAnnouncement, changeAdminPassword, logoutAdmin,
  getKioskVideos, saveKioskVideo, deleteKioskVideo,
} from '../lib/api';
import {
  VIDEO_TYPES, ORIENTATIONS, detectVideoType, validateVideoUrl,
  normalizeFacebookUrl, looksLikeReel,
} from '../lib/videoUtils';

const BLANK_VIDEO = {
  id: null, title: '', caption: '', source_url: '',
  video_type: 'facebook', duration_seconds: 45, sort_order: 0, is_active: true,
  orientation: 'landscape',
};

export default function AdminPanel({ officeDatabase, onClose, onDataUpdate }) {
  const [activeTab, setActiveTab] = useState('announcements');

  // Kiosk touchscreen keyboard — walang pisikal na keyboard sa terminal.
  const [showKeyboard, setShowKeyboard] = useState(false);
  const admRef = useRef(null);

  // Awtomatikong lumalabas sa unang pagpindot ng kahit anong field, para
  // hindi na kailangang hanapin pa ng staff ang buton.
  useEffect(() => {
    const root = admRef.current;
    if (!root) return;
    const open = (e) => {
      const el = e.target;
      const typable =
        (el.tagName === 'INPUT' && !['checkbox', 'radio', 'submit', 'button', 'file'].includes(el.type)) ||
        el.tagName === 'TEXTAREA';
      if (typable) setShowKeyboard(true);
    };
    root.addEventListener('focusin', open);
    return () => root.removeEventListener('focusin', open);
  }, []);
  
  const [advisoryText, setAdvisoryText] = useState('');
  const [announcementText, setAnnouncementText] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [selectedFloor, setSelectedFloor] = useState(1);
  const [selectedOfficeKey, setSelectedOfficeKey] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [videos, setVideos] = useState([]);
  const [videoForm, setVideoForm] = useState(null);
  // Tumitigil ang awtomatikong paghula ng uri kapag ang staff mismo ang
  // pumili sa dropdown — baka may kakaibang link na alam nilang tama.
  const [videoTypeTouched, setVideoTypeTouched] = useState(false);

  const [formTitle, setFormTitle] = useState('');
  const [formHours, setFormHours] = useState('');
  const [formHead, setFormHead] = useState('');
  const [formDescription, setFormDescription] = useState(''); 
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
        setAdvisoryText(text); 
      }
    };
    fetchAdminData();
  }, []);

  const loadVideos = async () => {
    const list = await getKioskVideos();
    setVideos(list);
    return list;
  };

  useEffect(() => {
    const fetchVideos = async () => {
      const list = await getKioskVideos();
      setVideos(list);
    };
    fetchVideos();
  }, []);

  const pickVideo = (video) => {
    setVideoForm(video ? { ...video } : { ...BLANK_VIDEO, sort_order: videos.length });
    setVideoTypeTouched(!!video);
  };

  const setVideoField = (field, value) => setVideoForm((f) => ({ ...f, [field]: value }));

  const handleVideoUrlChange = (url) => {
    // Nili-linis agad ang na-paste — kahit buong <iframe> embed code ang
    // ibigay ng staff, permalink ang makikita nilang natira sa field.
    const cleaned = normalizeFacebookUrl(url);
    setVideoForm((f) => ({
      ...f,
      source_url: cleaned,
      video_type: videoTypeTouched ? f.video_type : detectVideoType(cleaned),
      // Sinusuri ang orihinal na `url`, hindi ang `cleaned` — nabubura
      // ng normalize ang /reel/ kaya doon lang makikita ang senyas.
      orientation: looksLikeReel(url) ? 'portrait' : f.orientation,
    }));
  };

  const handleSaveVideo = async (e) => {
    e.preventDefault();
    if (!videoForm) return;

    const problem = validateVideoUrl(videoForm.source_url, videoForm.video_type);
    if (problem) return alert(`❌ ${problem}`);

    setIsSaving(true);
    try {
      await saveKioskVideo(videoForm);
      await loadVideos();
      // Pagsasara ng editor: ang bagong row sa listahan — kasama ang
      // LIVE/OFF na pill — ang nagpapatunay na natanggap ang pagbabago.
      setVideoForm(null);
      alert('🎬 Video saved! Lalabas na ito sa welcome screen sa loob ng isang minuto.');
    } catch (error) {
      alert(`❌ Failed to save video.\n\n${error.message || error}`);
    } finally { setIsSaving(false); }
  };

  const handleDeleteVideo = async () => {
    if (!videoForm?.id) return;
    if (!window.confirm(`Burahin ang video na "${videoForm.title || videoForm.source_url}"?`)) return;

    setIsSaving(true);
    try {
      await deleteKioskVideo(videoForm.id);
      await loadVideos();
      setVideoForm(null);
    } catch (error) {
      alert(`❌ Failed to delete video.\n\n${error.message || error}`);
    } finally { setIsSaving(false); }
  };

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
      setFormDescription(currentOffice.description || ''); 
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
        title: formTitle, 
        hours: formHours, 
        head: formHead,
        description: formDescription, 
        badge: currentOffice?.badge || '', 
        requirements: requirementsArray,
        cssClass: formCssClass, 
        status: formStatus 
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
      const combined = JSON.stringify({ advisory: advisoryText, announcement: announcementText });
      await updateAnnouncement(combined);
      alert('System Announcements & Advisories updated successfully!');
    } catch (error) {
      alert('Failed to update announcement.');
    } finally { setIsSaving(false); }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.trim() === '') return alert('Please enter a valid password.');
    if (newPassword !== confirmPassword) return alert('Passwords do not match! Please try again.');
    
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    
    if (newPassword.length < 6 || !hasUpper || !hasLower || !hasNumber) {
      return alert('❌ Weak Password:\n\nPassword must be at least 6 characters long and include:\n- At least 1 Uppercase letter\n- At least 1 Lowercase letter\n- At least 1 Number');
    }

    try {
      await changeAdminPassword(newPassword);
      setNewPassword('');
      setConfirmPassword('');
      alert('✅ Admin Password updated securely in the cloud!\n\nYou will now be logged out. Please login again using your new password.');
      await logoutAdmin();
      onClose(); 
    } catch (error) {
      alert('❌ Failed to update password. You must be logged in to do this.');
    }
  };

  return (
    <div className="k-overlay">
      <div className="adm" ref={admRef}>

        <div className="adm-top">
          <h2>
            🔧
            <span>
              Admin Panel
              <span className="adm-top-sub">Tagaytay City Hall Kiosk</span>
            </span>
          </h2>
          <div className="adm-top-actions">
            <button
              type="button"
              className={`adm-kb-toggle${showKeyboard ? ' is-on' : ''}`}
              onClick={() => setShowKeyboard((v) => !v)}
              title="Para sa kiosk na walang pisikal na keyboard"
            >
              ⌨️ {showKeyboard ? 'Hide Keyboard' : 'Keyboard'}
            </button>
            <button
              className="adm-exit"
              onClick={async () => {
                await logoutAdmin();
                onClose();
              }}
            >
              ✕ Close &amp; Logout
            </button>
          </div>
        </div>

        <div className="adm-tabs">
          <button className={`adm-tab${activeTab === 'announcements' ? ' active' : ''}`} onClick={() => setActiveTab('announcements')}>
            📢 Announcements
          </button>
          <button className={`adm-tab${activeTab === 'offices' ? ' active' : ''}`} onClick={() => setActiveTab('offices')}>
            🏢 Office Directory
          </button>
          <button className={`adm-tab${activeTab === 'security' ? ' active' : ''}`} onClick={() => setActiveTab('security')}>
            🔒 Admin Password
          </button>
        </div>

        {activeTab === 'announcements' && (
          <div className="adm-pane">
            <h3>📢 Announcements &amp; Advisories</h3>
            <p className="adm-hint">Manage what appears on the idle screen. Leave a field blank to hide it.</p>

            <form className="adm-form adm-form--stack" onSubmit={handleSaveAnnouncement}>

              <div>
                <label className="k-label">1 · Official Announcement (Board)</label>
                <textarea
                  className="k-textarea"
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  placeholder="e.g. Walang pasok bukas dahil sa bagyo… (Appears in a large card below the title)"
                />
              </div>

              <div>
                <label className="k-label">2 · Scrolling Advisory (Marquee)</label>
                <textarea
                  className="k-textarea"
                  value={advisoryText}
                  onChange={(e) => setAdvisoryText(e.target.value)}
                  placeholder="e.g. Please secure your belongings… (Scrolling ticker at the very bottom)"
                />
              </div>

              <button type="submit" className="k-btn k-btn--primary" disabled={isSaving}>
                {isSaving ? 'Deploying to kiosks…' : '📢 Publish Updates'}
              </button>
            </form>

            <div className="adm-divider" aria-hidden="true" />

            <h3>🎬 Welcome Screen Videos</h3>
            <p className="adm-hint">
              3 · I-paste ang link ng <strong>public</strong> na Facebook post, YouTube video, o
              direktang .mp4 file. Salitan itong ipapalabas katabi ng announcement board.
            </p>

            {!videoForm ? (
              <>
                <div className="adm-vid-list">
                  {videos.length === 0 && (
                    <p className="adm-hint">Wala pang video. Pindutin ang “Add Video” sa ibaba.</p>
                  )}
                  {videos.map((video, i) => (
                    <div key={video.id} className="adm-vid-item">
                      <span className="adm-vid-idx">{i + 1}</span>
                      <span className="adm-vid-body">
                        <span className="adm-vid-name">{video.title || video.source_url}</span>
                        <span className="adm-vid-meta">
                          {video.video_type} · {video.duration_seconds}s ·{' '}
                          {video.orientation === 'portrait' ? '▯ portrait' : '▭ landscape'}
                        </span>
                      </span>
                      <span className={`adm-vid-pill${video.is_active ? ' is-on' : ''}`}>
                        {video.is_active ? 'LIVE' : 'OFF'}
                      </span>
                      <button type="button" className="k-btn k-btn--ghost" onClick={() => pickVideo(video)}>
                        ✏️ Edit
                      </button>
                    </div>
                  ))}
                </div>

                <button type="button" className="k-btn k-btn--primary" onClick={() => pickVideo(null)}>
                  ＋ Add Video
                </button>
              </>
            ) : (
              <form className="adm-form adm-form--stack adm-vid-editor" onSubmit={handleSaveVideo}>
                <div>
                  <label className="k-label">Video link (URL)</label>
                  {/* Teksto, hindi url — para tanggapin din ang buong <iframe>
                      embed code at ang sarili nating mensahe ang lumabas
                      imbes na ang generic na babala ng browser. */}
                  <input
                    type="text"
                    className="k-input"
                    value={videoForm.source_url}
                    onChange={(e) => handleVideoUrlChange(e.target.value)}
                    placeholder="https://www.facebook.com/TagaytayCity/videos/1234567890"
                    required
                  />
                  <p className="adm-hint">
                    Kailangang naka-<strong>Public</strong> ang post. Huwag gamitin ang
                    “Copy link” ng FB app — <strong>share link</strong> ang ibinibigay niyon
                    at hindi ito bubukas sa kiosk. Sa desktop browser, i-click ang petsa ng
                    post at kopyahin ang address bar. Pinakasigurado: 3 dots (…) →
                    <strong> Embed</strong> → i-paste dito ang buong <code>&lt;iframe&gt;</code> code.
                  </p>
                </div>

                <div className="adm-form--split">
                  <div>
                    <label className="k-label">Title (header sa kiosk)</label>
                    <input
                      type="text"
                      className="k-input"
                      value={videoForm.title}
                      onChange={(e) => setVideoField('title', e.target.value)}
                      placeholder="e.g. Tagaytay Flower Festival 2026"
                    />
                  </div>
                  <div>
                    <label className="k-label">Source type</label>
                    <select
                      className="k-select"
                      value={videoForm.video_type}
                      onChange={(e) => { setVideoTypeTouched(true); setVideoField('video_type', e.target.value); }}
                    >
                      {VIDEO_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="adm-form--split">
                  <div>
                    <label className="k-label">Display seconds (bago lumipat sa susunod)</label>
                    <input
                      type="number"
                      className="k-input"
                      min="5"
                      max="600"
                      value={videoForm.duration_seconds}
                      onChange={(e) => setVideoField('duration_seconds', e.target.value)}
                    />
                    <p className="adm-hint">
                      Hindi ito ginagamit sa .mp4 — hinihintay doon ang tunay na dulo ng video.
                    </p>
                  </div>
                  <div>
                    <label className="k-label">Order (mas mababa, mas nauna)</label>
                    <input
                      type="number"
                      className="k-input"
                      value={videoForm.sort_order}
                      onChange={(e) => setVideoField('sort_order', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="k-label">Hugis ng video</label>
                  <select
                    className="k-select"
                    value={videoForm.orientation || 'landscape'}
                    onChange={(e) => setVideoField('orientation', e.target.value)}
                  >
                    {ORIENTATIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <p className="adm-hint">
                    Awtomatikong napipili ang Portrait kapag Reels ang na-paste. Kung mali,
                    palitan mo dito — kung hindi, magkakaroon ng itim na gilid sa kiosk.
                  </p>
                </div>

                <div>
                  <label className="k-label">Caption (opsyonal)</label>
                  <textarea
                    className="k-textarea"
                    value={videoForm.caption}
                    onChange={(e) => setVideoField('caption', e.target.value)}
                    placeholder="Maikling paliwanag na lalabas sa ilalim ng video…"
                  />
                </div>

                <label className="adm-check">
                  <input
                    type="checkbox"
                    checked={videoForm.is_active !== false}
                    onChange={(e) => setVideoField('is_active', e.target.checked)}
                  />
                  <span>Ipakita sa welcome screen</span>
                </label>

                <div className="k-btn-row">
                  <button type="submit" className="k-btn k-btn--primary" disabled={isSaving}>
                    {isSaving ? 'Deploying to kiosks…' : '🎬 Save Video'}
                  </button>
                  <button type="button" className="k-btn k-btn--ghost" onClick={() => setVideoForm(null)} disabled={isSaving}>
                    ✕ Cancel
                  </button>
                  {videoForm.id && (
                    <button type="button" className="k-btn k-btn--ghost" onClick={handleDeleteVideo} disabled={isSaving}>
                      🗑️ Delete
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        )}

        {activeTab === 'offices' && (
          <div className="adm-split">
            <div className="adm-list">
              <div>
                <label className="k-label">Select Floor</label>
                <select className="k-select" value={selectedFloor} onChange={handleFloorChange}>
                  {[1, 2, 3, 4, 5, 6, 7].map(f => (<option key={f} value={f}>Floor {f}</option>))}
                </select>
              </div>
              <div className="adm-list-scroll">
                {visibleOffices.map((office) => (
                  <button
                    key={office.key}
                    className={`adm-office${selectedOfficeKey === office.key ? ' active' : ''}`}
                    onClick={() => setSelectedOfficeKey(office.key)}
                  >
                    {office.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="adm-pane">
              {!selectedOfficeKey ? (
                <div className="adm-empty">
                  <span>📝</span>
                  <h3>Select an office to edit</h3>
                  <p className="adm-hint">Pick a floor, then choose an office from the list.</p>
                </div>
              ) : (
                <form className="adm-form" onSubmit={handleSaveOffice}>
                  <div className="adm-form--split">
                    <div>
                      <label className="k-label">Title</label>
                      <input type="text" className="k-input" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} required />
                    </div>
                    <div>
                      <label className="k-label">Hours</label>
                      <input type="text" className="k-input" value={formHours} onChange={(e) => setFormHours(e.target.value)} />
                    </div>
                  </div>

                  <div className="adm-form--split">
                    <div>
                      <label className="k-label">Head</label>
                      <input type="text" className="k-input" value={formHead} onChange={(e) => setFormHead(e.target.value)} />
                    </div>
                    <div>
                      <label className="k-label">Status</label>
                      <select className="k-select" value={formStatus} onChange={(e) => setFormStatus(e.target.value)}>
                        <option value="Available">🟢 Available</option>
                        <option value="In a Meeting">🔴 In a Meeting</option>
                        <option value="Out of Office">🟡 Out of Office</option>
                      </select>
                    </div>
                  </div>

                  <div className="adm-grow">
                    <label className="k-label">Office Description / Info</label>
                    <textarea
                      className="k-textarea"
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Short information about what this office does…"
                    />
                  </div>

                  <button type="submit" className="k-btn k-btn--primary" disabled={isSaving}>
                    {isSaving ? 'Saving…' : '💾 Save Office Metadata'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="adm-pane">
            <h3>🔒 Cloud Security &amp; Authentication</h3>
            <p className="adm-hint">
              Change the master password for <strong>tagaytaykiosk@gmail.com</strong>. This is updated
              directly in the Supabase Cloud.
            </p>

            <form className="adm-form" onSubmit={handleSavePassword} style={{ maxWidth: '480px', flex: 'none' }}>
              <div>
                <label className="k-label">New admin password (min 6 chars, 1 uppercase, 1 number)</label>
                <input
                  type="password"
                  className="k-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password…"
                  required
                  minLength="6"
                />
              </div>
              <div>
                <label className="k-label">Confirm new password</label>
                <input
                  type="password"
                  className="k-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password…"
                  required
                  minLength="6"
                />
              </div>
              <button type="submit" className="k-btn k-btn--primary">
                ☁️ Save Password to Cloud
              </button>
            </form>
          </div>
        )}
      </div>

      {showKeyboard && (
        <VirtualKeyboard scopeRef={admRef} onClose={() => setShowKeyboard(false)} />
      )}
    </div>
  );
}