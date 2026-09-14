// videoUtils.js
// Ginagawang embeddable ang link na kinopya ng staff mula sa browser.
// Tatlong pinagmumulan ang sinusuportahan ng kiosk:
//   facebook — post/reel/video mula sa opisyal na FB Page ng Tagaytay
//   youtube  — video o Shorts sa YouTube
//   file     — direktang .mp4/.webm (hal. na-upload sa Supabase Storage)

export const VIDEO_TYPES = [
  { value: 'facebook', label: '📘 Facebook post / video' },
  { value: 'youtube', label: '▶️ YouTube video' },
  { value: 'file', label: '🎞️ Direct video file (.mp4)' },
];

const FILE_EXT = /\.(mp4|webm|ogg|ogv|mov|m4v)(\?|#|$)/i;

// Hinuhulaan ang uri mula mismo sa link para hindi na kailangang mag-isip
// pa ang staff kung ano ang pipiliin sa dropdown.
export function detectVideoType(url) {
  const link = (url || '').trim();
  if (!link) return 'facebook';
  if (FILE_EXT.test(link)) return 'file';
  if (/(^|\.)(youtube\.com|youtu\.be)/i.test(link)) return 'youtube';
  if (/(^|\.)(facebook\.com|fb\.watch|fb\.com)/i.test(link)) return 'facebook';
  return 'file';
}

// Hindi lahat ng kinokopyang link ay kayang basahin ng FB video plugin.
// Tatlong anyo ang madalas na na-paste ng staff:
//   1. buong <iframe> na galing sa "Embed" ng Facebook
//   2. ang plugins/video.php URL na nasa loob niyon
//   3. facebook.com/reel/<id> — pino-provide bilang /watch/?v=<id>
// Ibinabalik nito ang anyong talagang tinatanggap ng plugin.
export function normalizeFacebookUrl(raw, depth = 0) {
  const input = (raw || '').trim();
  if (!input || depth > 3) return input;

  // 1. <iframe src="…"> → kunin ang src
  const iframeSrc = input.match(/<iframe[^>]*\ssrc=["']([^"']+)["']/i);
  const candidate = iframeSrc ? iframeSrc[1].replace(/&amp;/g, '&') : input;

  // 2. plugins/video.php?href=… → kunin ang totoong permalink. Kung
  //    hindi tatanggalin ang balot na ito, maiipit ang isang plugin URL
  //    sa loob ng isa pa at babagsak ang embed. Inuulit ang paglilinis
  //    dahil madalas na reel ang nakabalot sa loob.
  const pluginQuery = candidate.match(/plugins\/video\.php\?(.+)$/i);
  if (pluginQuery) {
    const href = new URLSearchParams(pluginQuery[1]).get('href');
    if (href) return normalizeFacebookUrl(href, depth + 1);
  }

  // 3. /reel/<id> → /watch/?v=<id>, ang anyong nauunawaan ng plugin
  const reel = candidate.match(/facebook\.com\/reel\/(\d+)/i);
  if (reel) return `https://www.facebook.com/watch/?v=${reel[1]}`;

  return candidate;
}

// Ang /share/ ay redirect stub lang — hindi ito kayang sundan ng plugin,
// at hindi rin natin mare-resolve sa browser dahil sa CORS.
export function isFacebookShareLink(url) {
  return /facebook\.com\/share\//i.test((url || '').trim());
}

// 50MB ang karaniwang hangganan ng Supabase Storage sa libreng plano.
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

export const formatBytes = (bytes) => `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

// Binabasa ang file sa browser bago i-upload, para awtomatikong matukoy
// kung patayo ba ito at gaano katagal — hindi na kailangang hulaan pa
// ng staff ang dalawang field na iyon.
export function readVideoMeta(file) {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const probe = document.createElement('video');
    probe.preload = 'metadata';

    const done = (result) => {
      URL.revokeObjectURL(objectUrl);
      resolve(result);
    };

    probe.onloadedmetadata = () => done({
      width: probe.videoWidth,
      height: probe.videoHeight,
      duration: probe.duration,
    });
    probe.onerror = () => done(null);
    probe.src = objectUrl;
  });
}

export const ORIENTATIONS = [
  { value: 'landscape', label: '▭ Landscape (16:9) — karaniwang video' },
  { value: 'portrait', label: '▯ Portrait (9:16) — Reels / patayo' },
];

// Sinusuri ang ORIHINAL na na-paste, bago pa ito i-normalize — nawawala
// kasi ang senyas na "reel" kapag naging /watch/?v= na ito.
// Ang /share/r/ ay reel din; ang r ay para sa reel.
export function looksLikeReel(raw) {
  let input = (raw || '').trim();
  // Naka-percent-encode ang /reel/ sa loob ng embed code (%2Freel%2F),
  // kaya kailangang i-decode muna bago hanapin.
  try { input = decodeURIComponent(input); } catch { /* iwanan kung sira */ }
  return /facebook\.com\/(reel|share\/r)\//i.test(input)
    || /youtube\.com\/shorts\//i.test(input);
}

export function getYouTubeId(url) {
  const link = (url || '').trim();
  if (!link) return '';
  // Kinukuha ang ID sa lahat ng anyo ng YouTube link: watch, youtu.be,
  // embed, shorts, at live.
  const patterns = [
    /[?&]v=([A-Za-z0-9_-]{6,})/,
    /youtu\.be\/([A-Za-z0-9_-]{6,})/,
    /\/embed\/([A-Za-z0-9_-]{6,})/,
    /\/shorts\/([A-Za-z0-9_-]{6,})/,
    /\/live\/([A-Za-z0-9_-]{6,})/,
  ];
  for (const re of patterns) {
    const match = link.match(re);
    if (match) return match[1];
  }
  return '';
}

// Ang FB plugin ang tanging opisyal na paraan para i-embed ang isang post.
// Kailangang PUBLIC ang post, kung hindi ay blangko ang lalabas sa kiosk.
// Walang loop na parameter ang FB plugin, kaya ini-remount na lang ito ng
// player kapag naabot na ang takdang tagal ng video.
function facebookEmbedUrl(url) {
  const params = new URLSearchParams({
    href: (url || '').trim(),
    show_text: 'false',
    autoplay: 'true',
    mute: '1',
    allowfullscreen: 'false',
  });
  return `https://www.facebook.com/plugins/video.php?${params.toString()}`;
}

function youtubeEmbedUrl(url, { loop }) {
  const id = getYouTubeId(url);
  if (!id) return '';
  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    controls: '0',
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
  });
  if (loop) {
    // Kailangan ng playlist=<id> para talagang umulit ang iisang video.
    params.set('loop', '1');
    params.set('playlist', id);
  }
  return `https://www.youtube.com/embed/${id}?${params.toString()}`;
}

// Ibinabalik ang handang-ipasok na src para sa <iframe>. Blangko kung
// hindi mabasa ang link — hindi na ipapakita ng player ang video na iyon.
export function buildEmbedUrl(video, { loop = false } = {}) {
  if (!video) return '';
  const type = video.video_type || detectVideoType(video.source_url);
  if (type === 'youtube') return youtubeEmbedUrl(video.source_url, { loop });
  if (type === 'facebook') return facebookEmbedUrl(video.source_url);
  return '';
}

// Panimulang tsek bago i-save, para maaga pang masabihan ang staff na
// mali ang na-paste na link.
export function validateVideoUrl(url, type) {
  const link = (url || '').trim();
  if (!link) {
    return 'Wala pang video.\n\nDalawang paraan:\n'
      + '• I-paste ang link ng public na FB post o YouTube video sa itaas, O\n'
      + '• Pumili ng video file sa “Mag-upload ng video file” at hintaying matapos';
  }

  // Ang "Copy link" ng FB app ay nagbibigay ng /share/ na stub. Mukhang
  // tama ito at bumubukas sa browser, pero "Video Unavailable" sa kiosk.
  if (isFacebookShareLink(link)) {
    return 'Share link ito (facebook.com/share/…) — hindi ito kayang buksan ng kiosk.\n\n'
      + 'Ganito ang tamang kunin:\n'
      + '1. Buksan ang post sa DESKTOP browser (hindi sa FB app)\n'
      + '2. I-click ang petsa/oras ng post, o ang video mismo\n'
      + '3. Kopyahin ang link sa address bar\n\n'
      + 'Dapat ganito ang hitsura:\n'
      + 'facebook.com/TagaytayCity/videos/1234567890\n\n'
      + 'Mas sigurado: 3 dots (…) sa post → Embed → kopyahin ang buong '
      + '<iframe> code at i-paste dito nang buo.';
  }

  if (!/^https?:\/\//i.test(link)) return 'Dapat magsimula ang link sa http:// o https://';
  if (type === 'youtube' && !getYouTubeId(link)) return 'Hindi mabasa ang YouTube video ID sa link na ito.';
  if (type === 'facebook' && !/(facebook\.com|fb\.watch|fb\.com)/i.test(link)) {
    return 'Hindi ito mukhang Facebook link.';
  }
  if (type === 'file' && !FILE_EXT.test(link)) {
    return 'Dapat direktang video file ang link (nagtatapos sa .mp4, .webm, atbp.).';
  }
  return '';
}
