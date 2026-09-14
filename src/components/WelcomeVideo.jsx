import { useCallback, useEffect, useRef, useState } from 'react';
import { getKioskVideos } from '../lib/api';
import { buildEmbedUrl, detectVideoType } from '../lib/videoUtils';

// Kasabay ng announcement ang paghila ng bagong listahan, para agad
// lumitaw sa kiosk ang bagong post nang hindi kailangang i-restart.
const REFRESH_MS = 60000;
const DEFAULT_DURATION = 45;

// Ikinukumpara ang laman — hindi ang object identity — para hindi
// masira ang kasalukuyang pinapanood tuwing nagre-refresh.
const signatureOf = (list) =>
  list.map((v) => [v.id, v.source_url, v.video_type, v.title, v.caption, v.duration_seconds].join('~')).join('|');

export default function WelcomeVideo() {
  const [videos, setVideos] = useState([]);
  const [index, setIndex] = useState(0);
  const [cycle, setCycle] = useState(0);
  const fileRef = useRef(null);

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

  const advance = useCallback(() => {
    setIndex((i) => i + 1);
    setCycle((c) => c + 1);
  }, []);

  // Kinakalkula — hindi iniimbak — ang tunay na posisyon, para hindi
  // sumabog kapag may binurang video habang tumatakbo ang kiosk.
  const position = videos.length ? index % videos.length : 0;
  const current = videos[position];
  const single = videos.length === 1;
  const type = current ? (current.video_type || detectVideoType(current.source_url)) : '';

  // Ang .mp4 at YouTube ay kayang umulit nang kusa kapag iisa lang ang
  // video; ang Facebook plugin ay walang loop kaya ini-remount ito.
  const selfLoops = single && (type === 'file' || type === 'youtube');
  // Sa file, ang totoong dulo ng video ang hudyat — hindi ang orasan —
  // para hindi maputol ang panonood.
  const usesTimer = !!current && !selfLoops && type !== 'file';

  useEffect(() => {
    if (!usesTimer) return;
    const seconds = Math.max(5, Number(current?.duration_seconds) || DEFAULT_DURATION);
    const timer = setTimeout(advance, seconds * 1000);
    return () => clearTimeout(timer);
  }, [usesTimer, current, cycle, advance]);

  // Ang mga autoplay na hadlang ng browser ay minsang tahimik na tumatanggi;
  // ito ang pangalawang tulak para tuloy pa rin ang attract loop.
  useEffect(() => {
    const el = fileRef.current;
    if (!el) return;
    const play = el.play();
    if (play && typeof play.catch === 'function') play.catch(() => {});
  }, [current, cycle]);

  if (!current) return null;

  const embedUrl = type === 'file' ? '' : buildEmbedUrl(current, { loop: selfLoops });
  const heading = (current.title || '').trim() || 'City Updates';
  const caption = (current.caption || '').trim();

  return (
    <div className="welcome-video-card">
      <div className="welcome-video-head">
        <span className="welcome-video-icon">🎬</span>
        <h2>{heading}</h2>
        {videos.length > 1 && (
          <span className="welcome-video-count">{position + 1}/{videos.length}</span>
        )}
      </div>

      <div className="welcome-video-frame">
        {type === 'file' ? (
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
      </div>

      {caption && <p className="welcome-video-caption">{caption}</p>}

      {videos.length > 1 && (
        <div className="welcome-video-dots" aria-hidden="true">
          {videos.map((v, i) => (
            <span key={v.id} className={i === position ? 'is-on' : ''} />
          ))}
        </div>
      )}
    </div>
  );
}
