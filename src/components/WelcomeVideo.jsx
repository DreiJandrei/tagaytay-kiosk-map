import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { getKioskVideos } from '../lib/api';
import { buildEmbedUrl, detectVideoType } from '../lib/videoUtils';
import { VolumePanel, VolumeToggle } from './VolumeControl';
import { useAutoHide } from '../lib/volume';

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

// Dalawang listahan, depende sa "Saan lalabas" ng bawat video sa Admin Panel:
//   placement="side"       — ang kard sa gilid ng pamagat (mga anunsyo)
//   placement="background" — buong screen sa likod ng welcome screen, sa
//                            `backgroundHost`. Walang kard; may sariling
//                            bilog na 🔊 kapag may tunog ito.
// Ang tala na wala pang `placement` (bago patakbuhin ang SQL) ay 'side'.
//
// IISANG TUNOG LANG. Ang WelcomeScreen ang humahawak kung kanino ang tunog:
//   • Ang kard sa gilid ay tumutunog lang kapag siya ang may-ari
//     (`isOwner`), at iniuulat nito kung TALAGANG tumutunog siya
//     (`onAudibleChange`) — hindi lang kung may tunog ang video. Ang
//     hinarang ng browser o pinatay ng bisita ay hindi tumutunog.
//   • Ang background ay tumatahimik habang tumutunog ang kard
//     (`otherAudible`), at tumutunog kapag tahimik ito.
//   • Ang pindot sa alinmang 🔊 ay pag-angkin ng tunog (`onClaimSound`):
//     ang binuksan ang tumutunog, ang isa ay tumatahimik.
//   • Bagong anunsyo sa kard (`onItemChange`) — balik sa anunsyo ang
//     tunog. Siya ang inuuna.
//
// LAKAS NG TUNOG. Galing sa WelcomeScreen ang `volume` (0–100), may
// kanya-kanya ang kard at ang background. Ang kard ay may sariling 🎚️ sa
// ulo nito (`onVolumeChange`); ang sa background ay nasa kaliwang ibaba.
export default function WelcomeVideo({
  placement = 'side', backgroundHost = null, soundSlot = null,
  isOwner = true, otherAudible = false, volume = 100, onVolumeChange,
  onAudibleChange, onClaimSound, onItemChange, onShapeChange,
}) {
  const isBackground = placement === 'background' && !!backgroundHost;
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
  // Tunay na hugis ng larawan o .mp4, nasukat pagka-load. Madalas na
  // nakaiwan sa "landscape" ang setting ng isang poster na patayo — kaya
  // may malapad na itim na gilid. Ang nasukat ang sinusunod.
  const [measured, setMeasured] = useState({});
  const shapeKeyOf = (v) => `${v.id}|${v.source_url}`;
  // Sa background, inaalis din ang nasukat na patayo kahit "landscape" ang
  // nakatakda — buong screen ito, kaya puro itim na gilid ang lalabas.
  // Kapag wala nang natira, ang larawan ng City Hall ang maiiwan.
  const shown = isBackground ? videos.filter((v) => measured[shapeKeyOf(v)] !== true) : videos;
  const fileRef = useRef(null);
  const iframeRef = useRef(null);
  const slider = useAutoHide();
  const swipe = useRef({ id: null, x: 0, y: 0, active: false, moved: false });

  useEffect(() => {
    let alive = true;

    const load = async () => {
      const all = await getKioskVideos({ activeOnly: true });
      if (!alive) return;
      const list = all.filter((v) => (v.placement === 'background' ? 'background' : 'side') === placement
        // Landscape lang ang background. Hinaharang na ito ng Admin Panel,
        // pero may mga tala na nauna pa roon.
        && !(placement === 'background' && v.orientation === 'portrait'));
      setVideos((prev) => (signatureOf(prev) === signatureOf(list) ? prev : list));
    };

    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => { alive = false; clearInterval(timer); };
  }, [placement]);

  // Isang hakbang pasulong o paurong. Sa pabalik, idinaragdag muna ang
  // haba bago ang modulo — kung hindi, negatibo ang lalabas na posisyon.
  const step = useCallback((delta) => {
    setIndex((i) => {
      const len = shown.length || 1;
      return ((i + delta) % len + len) % len;
    });
    setCycle((c) => c + 1);
  }, [shown.length]);

  const advance = useCallback(() => step(1), [step]);

  // Kinakalkula — hindi iniimbak — ang tunay na posisyon, para hindi
  // sumabog kapag may binurang video habang tumatakbo ang kiosk.
  const position = shown.length ? index % shown.length : 0;
  const current = shown[position];
  const single = shown.length === 1;
  const type = current ? (current.video_type || detectVideoType(current.source_url)) : '';

  const isImage = type === 'image';

  // Umaangkop ang kahon sa hugis ng video — kung hindi, puro itim na
  // gilid ang makikita sa Reels.
  const shapeKey = current ? shapeKeyOf(current) : '';
  const portrait = shapeKey in measured
    ? measured[shapeKey]
    : current?.orientation === 'portrait';
  const measure = (w, h) => {
    if (!w || !h) return;
    const tall = h > w;
    setMeasured((m) => (m[shapeKey] === tall ? m : { ...m, [shapeKey]: tall }));
  };

  // Sinasabi sa welcome screen kung patayo ang kard sa gilid — doon
  // nagpapasya kung itatabi ito sa kanang dulo nang buong taas.
  useEffect(() => {
    if (!isBackground) onShapeChange?.(!!current && portrait);
  }, [isBackground, current, portrait, onShapeChange]);
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
  // Sa background, laging may 🔊 ang video na kayang tumunog (mp4 at
  // YouTube) — ang "may tunog" ng admin ang nagsasabi lang kung bukas ito
  // sa umpisa. Sa kard, ang admin pa rin ang nagpapasya kung may buton.
  const soundAvailable = isBackground
    ? (type === 'file' || type === 'youtube')
    : !!current?.has_sound && type !== 'facebook' && !isImage;
  const wantsSound = soundChoice !== null ? soundChoice : !!current?.has_sound;
  // Gustong may tunog (ng admin o ng bisita), at hindi hinarang ng browser…
  const soundWanted = soundAvailable && wantsSound && !soundBlocked;
  // …at siya ang dapat tumunog ngayon (tingnan ang IISANG TUNOG sa itaas).
  const soundOn = soundWanted && (isBackground ? !otherAudible : isOwner);

  // Iniuulat kung talagang tumutunog ngayon — ng kard para sa IISANG
  // TUNOG, at ng dalawa para malaman kung ipapakita ang lakas ng tunog.
  useEffect(() => {
    onAudibleChange?.(soundOn);
  }, [soundOn, onAudibleChange]);

  // Ang kard: bagong anunsyo — siya ulit ang uunahin sa tunog.
  const currentId = current?.id;
  useEffect(() => {
    if (!isBackground && currentId != null) onItemChange?.();
  }, [isBackground, currentId, cycle, onItemChange]);

  // YouTube sa background: pinatatahimik at binubuksan sa utos sa player
  // (postMessage), hindi sa pagpapalit ng link — kung hindi, magre-restart
  // ang video tuwing nagpapalit ang anunsyo sa gilid.
  const ytCommand = useCallback((func, args = []) => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    // Sa YouTube lang ipinapadala — hindi sa kung anumang pahinang
    // napunta sa iframe.
    win.postMessage(JSON.stringify({ event: 'command', func, args }), 'https://www.youtube.com');
  }, []);
  const ytControlled = isBackground && type === 'youtube';
  // Pinakabagong hatol, para sa mga utos na naantala (tingnan ang onLoad).
  const soundOnRef = useRef(soundOn);
  useEffect(() => {
    soundOnRef.current = soundOn;
    if (ytControlled) ytCommand(soundOn ? 'unMute' : 'mute');
  }, [ytControlled, soundOn, ytCommand]);

  // Lakas ng tunog. Sa .mp4, diretso sa elemento; sa YouTube (kard man o
  // background), utos sa player — kaya laging may enablejsapi ang link.
  const volumeRef = useRef(volume);
  useEffect(() => {
    volumeRef.current = volume;
    if (fileRef.current) fileRef.current.volume = volume / 100;
    if (type === 'youtube') ytCommand('setVolume', [volume]);
  }, [volume, type, current, cycle, ytCommand]);

  // Ang pagpindot mismo sa buton ay siyang pahintulot na hinihingi ng
  // browser, kaya sinusubukan ulit ang tunog tuwing may bagong pili.
  const toggleSound = (e) => {
    // Nakabalot ang buong welcome screen sa isang onClick na nagsisimula
    // ng kiosk. Dito huminto ang pindot — tunog lang ang inaayos nito.
    e.stopPropagation();
    setSoundBlocked(false);
    // Ang nakikita ang binabaligtad, hindi ang nakatakda: ang background na
    // nagpapaubaya ay 🔇 sa mata kahit "gusto" pa nito ng tunog.
    const next = !soundOn;
    setSoundChoice(next);
    onClaimSound?.(next);
  };

  // ── Swipe ────────────────────────────────────────────────────
  // Hindi na kailangang hintayin ang orasan: puwedeng ihagod pakaliwa
  // para sa susunod, pakanan para sa nakaraan. Iisa lang ang video?
  // Wala namang lilipatan, kaya patay ang buong galaw na ito.
  const swipeable = shown.length > 1;

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

    if (!s.moved && Math.abs(dx) > 8) {
      s.moved = true;
      // Dito lang — hindi sa pagdampi — inaangkin ang daliri. Kapag sa
      // pagdampi pa lang inagaw, ang buton ng tunog ang unang masisira:
      // sa kard na napupunta ang click, hindi na sa buton.
      if (e.currentTarget.setPointerCapture) {
        try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* wala lang */ }
      }
    }

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
    : buildEmbedUrl(current, {
        loop: selfLoops,
        // Sa background na YouTube, ang `soundWanted` ang nasa link, at ang
        // pagpapaubaya ay sa utos na ginagawa (tingnan ang ytCommand).
        sound: ytControlled ? soundWanted : soundOn,
        jsApi: type === 'youtube',
      });
  const heading = (current.title || '').trim() || 'City Updates';
  const caption = (current.caption || '').trim();

  const media = isImage ? (
      // Walang key na kasama ang `cycle` dito: sa larawan, ang
      // pagpapalit ng key ay pagbura at paggawa ulit ng parehong
      // larawan — kumukurap lang ang screen, walang napapala.
      <img
        key={current.id}
        src={current.source_url}
        alt={heading}
        onLoad={(e) => measure(e.currentTarget.naturalWidth, e.currentTarget.naturalHeight)}
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
        onLoadedMetadata={(e) => measure(e.currentTarget.videoWidth, e.currentTarget.videoHeight)}
        onEnded={single ? undefined : advance}
        onError={advance}
      />
    ) : embedUrl ? (
      <iframe
        key={`${current.id}-${cycle}`}
        ref={iframeRef}
        src={embedUrl}
        // Matagal bago handang makinig ang YouTube player, kaya inuulit
        // ang utos nang ilang beses pagka-load.
        onLoad={type === 'youtube' ? () => {
          [300, 1200, 3000].forEach((ms) => setTimeout(() => {
            if (ytControlled) ytCommand(soundOnRef.current ? 'unMute' : 'mute');
            ytCommand('setVolume', [volumeRef.current]);
          }, ms));
        } : undefined}
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
    );

  // Sa background, walang babala ng sirang link — ang larawan ng City
  // Hall na lang ang maiiwan sa likod, na mas maayos tingnan.
  const backgroundLayer = isBackground && (isImage || type === 'file' || embedUrl)
    ? createPortal(
        <div
          className={`welcome-video-bg is-${isImage ? 'image' : type === 'file' ? 'file' : 'embed'}${portrait ? ' is-portrait' : ''}`}
          // Larawan lang ang may malabong kopya sa likod — sa video, doble
          // ang pagtugtog kapag ganoon, at sa iframe, imposible.
          style={isImage ? { '--bg-img': `url("${current.source_url}")` } : undefined}
        >
          {media}
        </div>,
        backgroundHost,
      )
    : null;

  if (isBackground) {
    // Bilog na 🔊 — laging nandito kapag kayang tumunog ang background.
    // 🔇 habang tumutunog ang anunsyo; ang pindot dito ay paglipat ng
    // tunog sa background. Nakatira ito sa `soundSlot` ng WelcomeScreen:
    // sa kaliwang ibaba, katabi mismo ng lakas ng tunog.
    const soundButton = backgroundLayer && soundAvailable && soundSlot
      ? createPortal(
          <button
            type="button"
            className={`welcome-video-sound welcome-bg-sound${soundOn ? ' is-on' : ''}`}
            onClick={toggleSound}
            aria-label={soundOn ? 'Patayin ang tunog ng background' : 'Buksan ang tunog ng background'}
          >
            <span aria-hidden="true">{soundOn ? '🔊' : '🔇'}</span>
          </button>,
          soundSlot,
        )
      : null;
    return (
      <>
        {backgroundLayer}
        {soundButton}
      </>
    );
  }

  return (
    // Buong kard ang tinatanggap ng hagod — pati pamagat, caption at
    // tuldok. Click-through ang frame (`pointer-events: none`), kaya
    // dumadaan pababa rito ang bawat pindot sa mismong video.
    <div
      className={
        `welcome-video-card${portrait ? ' is-portrait' : ''}` +
        `${swipeable ? ' is-swipeable' : ''}${dragX ? ' is-dragging' : ''}`
      }
      style={dragX ? { transform: `translateX(${dragX}px)` } : undefined}
      onPointerDown={swipeable ? onPointerDown : undefined}
      onPointerMove={swipeable ? onPointerMove : undefined}
      onPointerUp={swipeable ? onPointerUp : undefined}
      onPointerCancel={swipeable ? endSwipe : undefined}
      onClickCapture={swipeable ? onClickCapture : undefined}
    >
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
        {soundOn && onVolumeChange && (
          <VolumeToggle
            open={slider.open}
            onToggle={slider.toggle}
            className="welcome-video-vol-toggle"
            label="ng City Updates"
          />
        )}
        {/* Pahiga, nakalutang sa ibabaw ng video sa ilalim ng ulo — hindi
            nito itinutulak pababa ang video. */}
        {soundOn && onVolumeChange && slider.open && (
          <VolumePanel
            value={volume}
            onChange={onVolumeChange}
            onActivity={slider.keepOpen}
            className="welcome-video-vol-panel"
            label="ng City Updates"
          />
        )}
        {shown.length > 1 && (
          <span className="welcome-video-count">{position + 1}/{shown.length}</span>
        )}
      </div>

      <div className={`welcome-video-frame${portrait ? ' is-portrait' : ''}`}>
        {media}
      </div>

      {caption && <p className="welcome-video-caption">{caption}</p>}

      {swipeable && (
        <div className="welcome-video-nav" aria-hidden="true">
          <div className="welcome-video-dots">
            {shown.map((v, i) => (
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
