// Mga field na sinusulatan ng touchscreen keyboard. Hiwalay na file para
// magamit ng VirtualKeyboard, ng admin panel at ng login nang hindi
// nasisira ang fast refresh (component lang dapat ang export ng .jsx).
export const isTypable = (el) =>
  !!el &&
  ((el.tagName === 'INPUT' && !['checkbox', 'radio', 'submit', 'button', 'file', 'datetime-local', 'date', 'time', 'range'].includes(el.type)) ||
    el.tagName === 'TEXTAREA');

// May sariling keyboard ba ang gumagamit? Ang pindot ng DALIRI ang senyas ng
// touchscreen; ang MOUSE sa karaniwang browser window ay laptop o desktop —
// walang kwentang tabunan ng isa pang keyboard ang screen niya.
//
// Bakit may pagsusuri pa sa buong screen: may mga touch frame sa TV na mouse
// ang iniuulat ng Windows. Naka---kiosk (buong screen) ang kiosk, at wala
// itong ibang keyboard, kaya doon lumalabas pa rin ito kahit "mouse" ang pindot.
export const isFullScreenWindow = () =>
  window.innerHeight >= window.screen.height - 1 && window.innerWidth >= window.screen.width - 1;

export const wantsOnScreenKeyboard = (e) =>
  isTypable(e.target) && (e.pointerType !== 'mouse' || isFullScreenWindow());
