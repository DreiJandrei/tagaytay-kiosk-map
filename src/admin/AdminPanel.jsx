import React, { useState, useEffect, useRef } from 'react';
import VirtualKeyboard from '../components/VirtualKeyboard';
import {
  updateOffice, getAnnouncement, updateAnnouncement, changeAdminPassword, logoutAdmin,
  getKioskVideos, saveKioskVideo, deleteKioskVideo,
  uploadKioskVideoFile, deleteKioskVideoFile, isUploadedFile,
} from '../lib/api';
import {
  VIDEO_TYPES, ORIENTATIONS, detectVideoType, validateVideoUrl,
  normalizeFacebookUrl, looksLikeReel, readVideoMeta,
  MAX_VIDEO_BYTES, formatBytes,
} from '../lib/videoUtils';

const BLANK_VIDEO = {
  id: null, title: '', caption: '', source_url: '',
  video_type: 'facebook', duration_seconds: 45, sort_order: 0, is_active: true,
  orientation: 'landscape', has_sound: false,
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

  // Alin sa dalawang teksto ang binubuksan sa lumulutang na editor:
  // 'announcement', 'advisory', o null kapag sarado. Hiwalay ang draft sa
  // tunay na teksto — kaya ang Close ay tunay na pagtalikod, hindi lang
  // pagtago ng nabago na.
  const [annEditor, setAnnEditor] = useState(null);
  const [annDraft, setAnnDraft] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [selectedFloor, setSelectedFloor] = useState(1);
  const [selectedOfficeKey, setSelectedOfficeKey] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [videos, setVideos] = useState([]);
  const [videoForm, setVideoForm] = useState(null);
  // Larawan ng video noong binuksan ito. Dito ikinukumpara kung may
  // nagalaw bago isara — kung wala, walang kwentang magtanong pa.
  const [videoSnapshot, setVideoSnapshot] = useState('');
  // Tumitigil ang awtomatikong paghula ng uri kapag ang staff mismo ang
  // pumili sa dropdown — baka may kakaibang link na alam nilang tama.
  const [videoTypeTouched, setVideoTypeTouched] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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
    const next = video ? { ...video } : { ...BLANK_VIDEO, sort_order: videos.length };
    setVideoForm(next);
    setVideoSnapshot(JSON.stringify(next));
    setVideoTypeTouched(!!video);
  };

  // Ang Close ay nagtatapon ng pagbabago, kaya nagtatanong muna kapag may
  // itatapon. Kapag walang nagalaw, tahimik itong sumasara.
  const closeVideoEditor = () => {
    const dirty = videoForm && JSON.stringify(videoForm) !== videoSnapshot;
    if (dirty && !window.confirm('May hindi pa nase-save na pagbabago sa video.\n\nIsara pa rin at itapon ito?')) return;
    setVideoForm(null);
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

  const handleVideoFileUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // para mapili ulit ang parehong file kung kailangan
    if (!file) return;

    if (file.size > MAX_VIDEO_BYTES) {
      return alert(
        `❌ Masyadong malaki ang file (${formatBytes(file.size)}).\n\n`
        + `Ang hangganan ay ${formatBytes(MAX_VIDEO_BYTES)}. I-compress muna ang video, `
        + `o gupitin ang mas maiikling bahagi.`
      );
    }

    setIsUploading(true);
    try {
      // Binabasa muna ang hugis at haba bago i-upload — kung mabibigo ang
      // upload, wala namang nasayang kundi ilang segundo.
      const meta = await readVideoMeta(file);
      const publicUrl = await uploadKioskVideoFile(file);

      setVideoForm((f) => ({
        ...f,
        source_url: publicUrl,
        video_type: 'file',
        orientation: meta && meta.height > meta.width ? 'portrait' : f.orientation,
        duration_seconds: meta?.duration
          ? Math.min(600, Math.max(5, Math.round(meta.duration)))
          : f.duration_seconds,
        title: f.title || file.name.replace(/\.[^.]+$/, ''),
      }));
      setVideoTypeTouched(true);
    } catch (error) {
      const detail = error.message || String(error);
      // Dalawang magkaibang sanhi na pareho ang hitsura sa staff: walang
      // bucket, o may bucket pero walang pahintulot mag-upload. Malayo
      // ang pinagkaiba ng solusyon, kaya hiwalay ang bawat paliwanag.
      let hint = '';
      if (/bucket not found/i.test(detail)) {
        hint = '\n\n👉 WALA PANG BUCKET.\n'
          + 'Supabase → Storage → New bucket → pangalan: kiosk-videos → i-ON ang Public bucket.';
      } else if (/row-level security|policy|unauthorized|403/i.test(detail)) {
        hint = '\n\n👉 MAY BUCKET NA, PERO BAWAL MAG-UPLOAD.\n'
          + 'Kulang ang permission. Supabase → Storage → Policies → hanapin ang '
          + 'kiosk-videos → New policy → payagan ang INSERT at DELETE para sa '
          + '“authenticated” na role.';
      }
      alert(`❌ Hindi na-upload ang video.\n\n${detail}${hint}`);
    } finally { setIsUploading(false); }
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
      // Best-effort: hindi dapat mabigo ang buong pagbura dahil lang sa
      // naiwang file sa storage. Panlabas na link — walang gagawin.
      try {
        await deleteKioskVideoFile(videoForm.source_url);
      } catch (fileError) {
        console.error('Naiwan ang file sa storage:', fileError);
      }
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

  // ── Lumulutang na editor ng teksto ────────────────────────
  const openAnnEditor = (which) => {
    setAnnDraft(which === 'announcement' ? announcementText : advisoryText);
    setAnnEditor(which);
  };

  const annOriginal = annEditor === 'announcement' ? announcementText : advisoryText;

  const closeAnnEditor = () => {
    if (annEditor && annDraft !== annOriginal
      && !window.confirm('May hindi pa nase-save na pagbabago.\n\nIsara pa rin at itapon ito?')) return;
    setAnnEditor(null);
  };

  const handleSaveAnnouncement = async (e) => {
    e.preventDefault();
    // Iisang row lang sa database ang kinalalagyan ng dalawang teksto,
    // kaya kahit isa lang ang binubuksan, kailangang dalhin pabalik ang
    // kapareha nito nang buo — kung hindi, mabubura ito.
    const next = {
      advisory: annEditor === 'advisory' ? annDraft : advisoryText,
      announcement: annEditor === 'announcement' ? annDraft : announcementText,
    };

    setIsSaving(true);
    try {
      await updateAnnouncement(JSON.stringify(next));
      setAdvisoryText(next.advisory);
      setAnnouncementText(next.announcement);
      setAnnEditor(null);
      alert('✅ Nai-save na! Makikita ito sa welcome screen sa loob ng isang minuto.');
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
            <p className="adm-hint">
              Ito ang lumalabas sa welcome screen. Pindutin ang <strong>✏️ Edit</strong> para
              buksan ang kahon ng pagsusulat. Blangko = nakatago.
            </p>

            <div className="adm-cards">
              {[
                {
                  key: 'announcement',
                  label: '1 · Official Announcement (Board)',
                  text: announcementText,
                  empty: 'Walang laman — nakatago ang malaking kard sa welcome screen.',
                },
                {
                  key: 'advisory',
                  label: '2 · Scrolling Advisory (Marquee)',
                  text: advisoryText,
                  empty: 'Walang laman — nakatago ang gumagalaw na guhit sa ilalim.',
                },
              ].map((card) => (
                <div key={card.key} className="adm-card">
                  <div className="adm-card-head">
                    <span className="adm-card-label">{card.label}</span>
                    <span className={`adm-vid-pill${card.text.trim() ? ' is-on' : ''}`}>
                      {card.text.trim() ? 'LIVE' : 'HIDDEN'}
                    </span>
                  </div>
                  <p className={`adm-card-text${card.text.trim() ? '' : ' is-empty'}`}>
                    {card.text.trim() || card.empty}
                  </p>
                  <button
                    type="button"
                    className="k-btn k-btn--ghost"
                    onClick={() => openAnnEditor(card.key)}
                  >
                    ✏️ Edit
                  </button>
                </div>
              ))}
            </div>

            <div className="adm-divider" aria-hidden="true" />

            <h3>🎬 Welcome Screen Videos</h3>
            <p className="adm-hint">
              3 · I-paste ang link ng <strong>public</strong> na Facebook post, YouTube video, o
              direktang .mp4 file. Salitan itong ipapalabas katabi ng announcement board.
            </p>

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
          </div>
        )}

        {/* Lumulutang na editor ng video. Nasa loob ito ng .adm para
            abutin pa rin ng touchscreen keyboard ang mga field nito. */}
        {videoForm && (
          <div className="adm-modal-back">
            <form className="adm-modal" onSubmit={handleSaveVideo}>
              <div className="adm-modal-top">
                <h4>{videoForm.id ? '🎬 I-edit ang video' : '🎬 Bagong video'}</h4>
                <button type="button" className="adm-modal-x" onClick={closeVideoEditor} disabled={isSaving}>
                  ✕
                </button>
              </div>

              <div className="adm-modal-body">
                <div>
                  <label className="k-label">Video link (URL)</label>
                  {/* Teksto at HINDI required: may pangalawang paraan sa ibaba
                      (upload), kaya walang saysay ang "Please fill out this
                      field" ng browser. Ang sarili nating validation na may
                      malinaw na paliwanag ang bahala kapag blangko. */}
                  <input
                    type="text"
                    className="k-input"
                    value={videoForm.source_url}
                    onChange={(e) => handleVideoUrlChange(e.target.value)}
                    placeholder="https://www.facebook.com/TagaytayCity/videos/1234567890"
                  />
                  <p className="adm-hint">
                    Kailangang naka-<strong>Public</strong> ang post. Huwag gamitin ang
                    “Copy link” ng FB app — <strong>share link</strong> ang ibinibigay niyon
                    at hindi ito bubukas sa kiosk. Sa desktop browser, i-click ang petsa ng
                    post at kopyahin ang address bar. Pinakasigurado: 3 dots (…) →
                    <strong> Embed</strong> → i-paste dito ang buong <code>&lt;iframe&gt;</code> code.
                  </p>
                </div>

                <div className="adm-or"><span>o kaya</span></div>

                <div>
                  <label className="k-label">Mag-upload ng video file</label>
                  <label className={`adm-upload${isUploading ? ' is-busy' : ''}`}>
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/ogg,video/quicktime"
                      onChange={handleVideoFileUpload}
                      disabled={isUploading}
                    />
                    <span className="adm-upload-icon">{isUploading ? '⏳' : '⬆️'}</span>
                    <span className="adm-upload-text">
                      {isUploading ? 'Ina-upload… huwag isara ang window' : 'Pumili ng video mula sa computer'}
                      <small>
                        MP4, WebM, o MOV · hanggang {formatBytes(MAX_VIDEO_BYTES)} ·
                        kusang nababasa ang hugis at haba
                      </small>
                    </span>
                  </label>
                  {isUploadedFile(videoForm.source_url) && (
                    <p className="adm-ok">
                      ✅ Na-upload na ang video. Pindutin ang <strong>Save Video</strong> sa ibaba
                      para mailagay ito sa kiosk.
                    </p>
                  )}

                  <p className="adm-hint">
                    Ito ang pinaka-maaasahan para sa kiosk — hindi na kailangan ng Facebook,
                    at gumagana kahit mabagal ang internet. Mainam para sa Reels na
                    ayaw mag-embed: i-download mo, tapos i-upload dito.
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

                <div>
                  <label className="adm-check">
                    <input
                      type="checkbox"
                      checked={videoForm.has_sound === true}
                      onChange={(e) => setVideoField('has_sound', e.target.checked)}
                      disabled={videoForm.video_type === 'facebook'}
                    />
                    <span>🔊 Buksan ang tunog</span>
                  </label>
                  <p className="adm-hint">
                    {videoForm.video_type === 'facebook'
                      ? 'Hindi kayang buksan ang tunog ng Facebook embed — laging tahimik ito. '
                        + 'Kung kailangan talaga ng tunog, i-download ang video at i-upload dito.'
                      : 'Lalabas ang bilog na 🔊 na buton sa ibabaw ng video sa welcome screen. '
                        + 'Doon kayang buksan o patayin ng bisita ang tunog nang hindi nagsisimula '
                        + 'ang kiosk. Kung haharangin ng browser ang tunog sa umpisa, isang pindot '
                        + 'lang sa buton na iyon ay sapat na. Para bukas agad kahit walang pumipindot, '
                        + 'tingnan ang README (Chrome kiosk flag).'}
                  </p>
                </div>

              </div>

              <div className="adm-modal-foot">
                {videoForm.id && (
                  <button
                    type="button"
                    className="k-btn k-btn--ghost adm-modal-del"
                    onClick={handleDeleteVideo}
                    disabled={isSaving}
                  >
                    🗑️ Delete
                  </button>
                )}
                <button type="button" className="k-btn k-btn--ghost" onClick={closeVideoEditor} disabled={isSaving}>
                  ✕ Close
                </button>
                <button type="submit" className="k-btn k-btn--primary" disabled={isSaving}>
                  {isSaving ? 'Deploying to kiosks…' : '💾 Save Video'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lumulutang na editor ng teksto — iisa lang ang kahon dito,
            kung ano ang pinindot na Edit. */}
        {annEditor && (
          <div className="adm-modal-back">
            <form className="adm-modal adm-modal--sm" onSubmit={handleSaveAnnouncement}>
              <div className="adm-modal-top">
                <h4>
                  {annEditor === 'announcement'
                    ? '📰 Official Announcement'
                    : '🚨 Scrolling Advisory'}
                </h4>
                <button type="button" className="adm-modal-x" onClick={closeAnnEditor} disabled={isSaving}>
                  ✕
                </button>
              </div>

              <div className="adm-modal-body">
                <label className="k-label">
                  {annEditor === 'announcement'
                    ? 'Teksto ng malaking kard sa welcome screen'
                    : 'Teksto ng gumagalaw na guhit sa pinakailalim'}
                </label>
                <textarea
                  className="k-textarea adm-modal-area"
                  autoFocus
                  value={annDraft}
                  onChange={(e) => setAnnDraft(e.target.value)}
                  placeholder={
                    annEditor === 'announcement'
                      ? 'e.g. Walang pasok bukas dahil sa bagyo…'
                      : 'e.g. Please secure your belongings…'
                  }
                />
                <p className="adm-hint">
                  {annEditor === 'announcement'
                    ? 'Hanggang 3 linya lang ang kasya sa kiosk — puputulin ang sobra.'
                    : 'Isang linya bawat mensahe. Pinagsasabit ang mga ito ng “•”.'}
                </p>
                <p className="adm-hint">Iwanang blangko para itago ito sa welcome screen.</p>
              </div>

              <div className="adm-modal-foot">
                <button type="button" className="k-btn k-btn--ghost" onClick={closeAnnEditor} disabled={isSaving}>
                  ✕ Close
                </button>
                <button type="submit" className="k-btn k-btn--primary" disabled={isSaving}>
                  {isSaving ? 'Deploying to kiosks…' : '💾 Save'}
                </button>
              </div>
            </form>
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