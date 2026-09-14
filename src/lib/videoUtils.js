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
  if (!link) return 'Kailangan ng video link.';
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
