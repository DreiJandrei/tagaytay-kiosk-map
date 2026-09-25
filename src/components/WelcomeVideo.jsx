import { useCallback, useEffect, useRef, useState } from 'react';
import { getKioskVideos } from '../lib/api';
import { buildEmbedUrl, detectVideoType } from '../lib/videoUtils';

// Kasabay ng announcement ang paghila ng bagong listahan, para agad
// lumitaw sa kiosk ang bagong post nang hindi kailangang i-restart.
const REFRESH_MS = 60000;
const DEFAULT_DURATION = 45;
// Layo ng daliri bago ituring na swipe. Mababa nang kaunti sa karaniwan:
// nakatayo ang bisita sa harap ng kiosk, maikli ang hagod nila.
const SWIPE_MIN = 55;
// Hanggang saan sumusunod ang kard sa daliri. Hindi ito buong layo —
// pahiwatig lang na may susunod, hindi paghila ng buong video.
const DRAG_MAX = 48;

// Ikinukumpara ang laman — hindi ang object identity — para hindi
// masira ang kasalukuyang pinapanood tuwing nagre-refresh.
const signatureOf = (list) =>
  list.map((v) => [
    v.id, v.source_url, v.video_type, v.title, v.caption,
    v.duration_seconds, v.orientation, v.has_sound,
  ].join('~')).join('|');

export default function WelcomeVideo() {
  const [videos, setVideos] = useState([]);
  const [index, setIndex] = useState(0);
  const [cycle, setCycle] = useState(0);
  // Pagpili ng bisita mula sa buton. Habang null, ang nakatakda ng admin
  // ang sinusunod; kapag may pinindot na, iyon na ang masusunod hanggang
  // sa susunod na reload.
  const [soundChoice, setSoundChoice] = useState(null);
  // Totoong tinanggihan ng browser ang tunog — hindi lang "ayaw namin".
  const [soundBlocked, setSoundBlocked] = useState(false);
  // Layo ng kasalukuyang hagod — ito lang ang nasa state, dahil ito ang
  // nakikita. Ang pinagmulan at hatol ng galaw ay nasa ref: bawat pixel
  // ng paggalaw ay hindi dapat magpa-render ng buong kard.
  const [dragX, setDragX] = useState(0);
  const fileRef = useRef(null);
  const swipe = useRef({ id: null, x: 0, y: 0, active: false, moved: false });

  useEffect(() => {
    let alive = true;

    const load = async () => {
      const list = await getKioskVideos({ activeOnly: true });
      if (!alive) return;
      setVideos((prev) => (signatureOf(prev) === signatureOf(list) ? prev : list));
    };

    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => { alive = false; clearInterval(timer); };
  }, []);

  // Isang hakbang pasulong o paurong. Sa pabalik, idinaragdag muna ang
  // haba bago ang modulo — kung hindi, negatibo ang lalabas na posisyon.
  const step = useCallback((delta) => {
    setIndex((i) => {
      const len = videos.length || 1;
      return ((i + delta) % len + len) % len;
    });
    setCycle((c) => c + 1);
  }, [videos.length]);

  const advance = useCallback(() => step(1), [step]);

  // Kinakalkula — hindi iniimbak — ang tunay na posisyon, para hindi
  // sumabog kapag may binurang video habang tumatakbo ang kiosk.
  const position = videos.length ? index % videos.length : 0;
  const current = videos[position];
  const single = videos.length === 1;
  const type = current ? (current.video_type || detectVideoType(current.source_url)) : '';

  const isImage = type === 'image';
  // Ang .mp4 at YouTube ay kayang umulit nang kusa kapag iisa lang ang
  // video; ang Facebook plugin ay walang loop kaya ini-remount ito. Ang
  // nag-iisang larawan ay wala namang dulo — nakatitig lang ito, kaya
  // walang saysay ang orasan doon.
  const selfLoops = single && (type === 'file' || type === 'youtube' || isImage);
  // Sa file, ang totoong dulo ng video ang hudyat — hindi ang orasan —
  // para hindi maputol ang panonood. Sa larawan, orasan talaga: iyon ang
  // takdang segundo na inilagay ng admin.
  const usesTimer = !!current && !selfLoops && type !== 'file';

  useEffect(() => {
    if (!usesTimer) return;
    const seconds = Math.max(5, Number(current?.duration_seconds) || DEFAULT_DURATION);
    const timer = setTimeout(advance, seconds * 1000);
    return () => clearTimeout(timer);
  }, [usesTimer, current, cycle, advance]);

  // May tunog bang maaaring buksan — ito ang nagpapakita ng buton.
  // Tahimik ang larawan, kaya walang buton doon kahit anong nakatakda.
  const soundAvailable = !!current?.has_sound && type !== 'facebook' && !isImage;
  const wantsSound = soundChoice !== null ? soundChoice : !!current?.has_sound;
  const soundOn = soundAvailable && wantsSound && !soundBlocked;

  // Ang pagpindot mismo sa buton ay siyang pahintulot na hinihingi ng
  // browser, kaya sinusubukan ulit ang tunog tuwing may bagong pili.
  const toggleSound = (e) => {
    // Nakabalot ang buong welcome screen sa isang onClick na nagsisimula
    // ng kiosk. Dito huminto ang pindot — tunog lang ang inaayos nito.
    e.stopPropagation();
    setSoundBlocked(false);
    setSoundChoice(!wantsSound);
  };

  // ── Swipe ────────────────────────────────────────────────────
  // Hindi na kailangang hintayin ang orasan: puwedeng ihagod pakaliwa
  // para sa susunod, pakanan para sa nakaraan. Iisa lang ang video?
  // Wala namang lilipatan, kaya patay ang buong galaw na ito.
  const swipeable = videos.length > 1;

  const endSwipe = () => {
    swipe.current.active = false;
    swipe.current.id = null;
    setDragX(0);
  };

  const onPointerDown = (e) => {
    swipe.current = {
      id: e.pointerId, x: e.clientX, y: e.clientY,
      active: true, moved: false,
    };
    // Kahit lumabas ang daliri sa kahon ng video, sa amin pa rin ang
    // galaw — malapad ang kiosk, madaling makalampas ang hagod.
    if (e.currentTarget.setPointerCapture) {
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* wala lang */ }
    }
  };

  const onPointerMove = (e) => {
    const s = swipe.current;
    if (!s.active || e.pointerId !== s.id) return;

    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;

    // Hindi pa napagpapasyahan at mas patayo ang galaw: hindi ito
    // paglipat ng video — pag-scroll o alanganing pindot lang.
    if (!s.moved && Math.abs(dy) > Math.abs(dx)) {
      endSwipe();
      return;
    }
    if (Math.abs(dx) > 8) s.moved = true;

    // Bumibigat ang paghila habang papalayo — may hangganan ang sunod
    // na kard, kaya ramdam na hindi ito basta hinihila kahit saan.
    const pull = Math.sign(dx) * DRAG_MAX * (1 - Math.exp(-Math.abs(dx) / 90));
    setDragX(pull);
  };

  const onPointerUp = (e) => {
    const s = swipe.current;
    if (!s.active || e.pointerId !== s.id) return;

    const dx = e.clientX - s.x;
    endSwipe();

    if (Math.abs(dx) < SWIPE_MIN) return;
    // Kaliwa ang hagod: papasok ang kasunod mula sa kanan. Ganoon ang
    // inaasahan ng kahit sinong nakagamit ng telepono.
    step(dx < 0 ? 1 : -1);
  };

  // Ang buong welcome screen ay isang malaking buton na nagsisimula ng
  // kiosk. Ang isang hagod ay hindi pindot — dito ito pinipigil, bago
  // pa umakyat sa screen. Ang tuyot na pindot ay pinapadaan pa rin.
  const onClickCapture = (e) => {
    if (swipe.current.moved) {
      e.stopPropagation();
      swipe.current.moved = false;
    }
  };

  // Ang mga autoplay na hadlang ng browser ay minsang tahimik na tumatanggi;
  // ito ang pangalawang tulak para tuloy pa rin ang attract loop.
  useEffect(() => {
    const el = fileRef.current;
    if (!el) return;

    el.muted = !soundOn;
    const play = el.play();
    if (play && typeof play.catch === 'function') {
      play.catch(() => {
        // Tinanggihan ang pagtugtog na may tunog. Mas mahalaga ang
        // gumagalaw na video kaysa sa tunog, kaya bumabalik sa tahimik
        // imbes na manatiling naka-freeze ang attract loop.
        el.muted = true;
        setSoundBlocked(true);
        const retry = el.play();
        if (retry && typeof retry.catch === 'function') retry.catch(() => {});
      });
    }
  }, [current, cycle, soundOn]);

  if (!current) return null;

  const embedUrl = (type === 'file' || isImage)
    ? ''
    : buildEmbedUrl(current, { loop: selfLoops, sound: soundOn });
  const heading = (current.title || '').trim() || 'City Updates';
  const caption = (current.caption || '').trim();
  // Umaangkop ang kahon sa hugis ng video — kung hindi, puro itim na
  // gilid ang makikita sa Reels.
  const portrait = current.orientation === 'portrait';

  return (
    <div className={`welcome-video-card${portrait ? ' is-portrait' : ''}`}>
      <div className="welcome-video-head">
        <span className="welcome-video-icon">{isImage ? '🖼️' : '🎬'}</span>
        <h2>{heading}</h2>
        {soundAvailable && (
          <button
            type="button"
            className={`welcome-video-sound${soundOn ? ' is-on' : ''}`}
            onClick={toggleSound}
            aria-label={soundOn ? 'Patayin ang tunog' : 'Buksan ang tunog'}
          >
            <span aria-hidden="true">{soundOn ? '🔊' : '🔇'}</span>
          </button>
        )}
        {videos.length > 1 && (
          <span className="welcome-video-count">{position + 1}/{videos.length}</span>
        )}
      </div>

      <div
        className={`welcome-video-frame${portrait ? ' is-portrait' : ''}${dragX ? ' is-dragging' : ''}`}
        style={dragX ? { transform: `translateX(${dragX}px)` } : undefined}
      >
        {isImage ? (
          // Walang key na kasama ang `cycle` dito: sa larawan, ang
          // pagpapalit ng key ay pagbura at paggawa ulit ng parehong
          // larawan — kumukurap lang ang screen, walang napapala.
          <img
            key={current.id}
            src={current.source_url}
            alt={heading}
            // Kapag sira ang link ng larawan at iisa lang ang nakatala,
            // hindi puwedeng lumipat — ang paglipat ay babalik din dito
            // at mauuwi sa walang hintong ikot.
            onError={single ? undefined : advance}
          />
        ) : type === 'file' ? (
          <video
            key={`${current.id}-${cycle}`}
            ref={fileRef}
            src={current.source_url}
            autoPlay
            muted
            playsInline
            loop={single}
            onEnded={single ? undefined : advance}
            onError={advance}
          />
        ) : embedUrl ? (
          <iframe
            key={`${current.id}-${cycle}`}
            src={embedUrl}
            title={heading}
            frameBorder="0"
            scrolling="no"
            allow="autoplay; encrypted-media; picture-in-picture; web-share"
          />
        ) : (
          <div className="welcome-video-fallback">
            <span>⚠️</span>
            <p>Hindi mabasa ang video link.</p>
          </div>
        )}

        {/* Ang YouTube at Facebook ay nakabalot sa iframe — nilululon
            nito ang bawat pindot bago pa makarating sa amin. Ito ang
            salaming nakapatong sa lahat: dito dumadaan ang hagod, at
            dito rin dumadaan pababa ang tuyot na pindot. */}
        {swipeable && (
          <div
            className="welcome-video-swipe"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={endSwipe}
            onClickCapture={onClickCapture}
          />
        )}
      </div>

      {caption && <p className="welcome-video-caption">{caption}</p>}

      {swipeable && (
        <div className="welcome-video-nav" aria-hidden="true">
          <div className="welcome-video-dots">
            {videos.map((v, i) => (
              <span key={v.id} className={i === position ? 'is-on' : ''} />
            ))}
          </div>
          {/* Walang nakakaalam na puwedeng ihagod kung walang magsasabi.
              Sa kiosk, ang hindi sinabi ay hindi nagagamit. */}
          <span className="welcome-video-hint">‹ I-swipe para sa iba ›</span>
        </div>
      )}
    </div>
  );
}
