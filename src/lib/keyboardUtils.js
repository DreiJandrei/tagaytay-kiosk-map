// Mga field na sinusulatan ng touchscreen keyboard. Hiwalay na file para
// magamit ng VirtualKeyboard, ng admin panel at ng login nang hindi
// nasisira ang fast refresh (component lang dapat ang export ng .jsx).
export const isTypable = (el) =>
  !!el &&
  ((el.tagName === 'INPUT' && !['checkbox', 'radio', 'submit', 'button', 'file'].includes(el.type)) ||
    el.tagName === 'TEXTAREA');
