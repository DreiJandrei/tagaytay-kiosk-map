import { useCallback, useEffect, useRef, useState } from 'react';

// ==========================================================
// FLOATING TOUCHSCREEN KEYBOARD
// ==========================================================
// Para sa kiosk na walang pisikal na keyboard. Nakalutang at
// puwedeng hilahin (drag) kaya hindi natatakpan ang fields.
//
// MAHALAGA — controlled React inputs ang mga field ng admin:
// hindi sapat ang `el.value = x`. Hindi napapansin ng React ang
// direktang pagpapalit dahil sinusubaybayan nito ang sariling
// value tracker. Kaya ginagamit natin ang native value setter ng
// prototype, saka nagpapaputok ng `input` event na bubbling —
// iyon ang nababasa ng React bilang tunay na pag-type.

const LETTER_ROWS = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ':'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '-'],
];

const SYMBOL_ROWS = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['!', '@', '#', '₱', '%', '&', '*', '(', ')', '/'],
  ['-', '_', '=', '+', ':', ';', "'", '"', '?', '~'],
  ['.', ',', '<', '>', '[', ']', '{', '}', '|', '\\'],
];

// Isinusulat ang bagong halaga sa paraang nakikita ng React.
const setNativeValue = (el, value) => {
  const proto = el instanceof HTMLTextAreaElement
    ? HTMLTextAreaElement.prototype
    : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  if (setter) setter.call(el, value);
  else el.value = value;
  el.dispatchEvent(new Event('input', { bubbles: true }));
};

const isTypable = (el) =>
  !!el &&
  ((el.tagName === 'INPUT' && !['checkbox', 'radio', 'submit', 'button', 'file'].includes(el.type)) ||
    el.tagName === 'TEXTAREA');

export default function VirtualKeyboard({ scopeRef, onClose, lang = 'EN' }) {
  const [shift, setShift] = useState(false);
  const [symbols, setSymbols] = useState(false);
  const [pos, setPos] = useState(null);          // null = default (ilalim, gitna)
  const [dragging, setDragging] = useState(false);
  const targetRef = useRef(null);                 // huling field na na-focus
  const dragRef = useRef(null);
  const panelRef = useRef(null);

  // Subaybayan kung aling field ang ginagamit. Nakalagay sa scope (admin
  // panel) para hindi ito humawak ng ibang input sa labas.
  useEffect(() => {
    const root = scopeRef?.current || document;
    const remember = (e) => { if (isTypable(e.target)) targetRef.current = e.target; };
    root.addEventListener('focusin', remember);
    // Kunin agad ang kasalukuyang naka-focus, kung mayroon.
    if (isTypable(document.activeElement)) targetRef.current = document.activeElement;
    return () => root.removeEventListener('focusin', remember);
  }, [scopeRef]);

  // Hindi puwedeng mahila palabas ng screen ang keyboard — sa kiosk, wala
  // namang paraan para maibalik ito kung mawala sa gilid. Laging may 8px
  // na natitira sa bawat tabi.
  const clamp = (left, top, w, h) => {
    const m = 8;
    const maxLeft = Math.max(m, window.innerWidth - w - m);
    const maxTop = Math.max(m, window.innerHeight - h - m);
    return {
      left: Math.min(Math.max(left, m), maxLeft),
      top: Math.min(Math.max(top, m), maxTop),
    };
  };

  // Paghila ng panel — sa itaas na bar, hawak man ay daliri o mouse.
  useEffect(() => {
    const move = (e) => {
      const d = dragRef.current;
      if (!d) return;
      // Habang hinihila, atin ang galaw — hindi ito pag-scroll ng pahina.
      if (e.cancelable) e.preventDefault();
      const p = e.touches ? e.touches[0] : e;
      setPos(clamp(p.clientX - d.dx, p.clientY - d.dy, d.w, d.h));
    };
    const end = () => {
      if (!dragRef.current) return;
      dragRef.current = null;
      setDragging(false);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', end);
    window.addEventListener('touchcancel', end);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', end);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', end);
      window.removeEventListener('touchcancel', end);
    };
  }, []);

  // Kapag nagbago ang laki ng bintana, baka nasa labas na ang dating
  // pwesto. Ibinabalik ito sa loob sa halip na mawala nang tuluyan.
  useEffect(() => {
    const onResize = () => {
      const el = panelRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      // Walang ginagawa kapag nasa default pa ang keyboard (pos === null) —
      // ang CSS na ang bahala roon.
      setPos((p) => (p ? clamp(p.left, p.top, r.width, r.height) : p));
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const startDrag = (e) => {
    // Ang Hide na buton ay nasa loob din ng bar — hindi iyon hawakan.
    if (e.target.closest('.vkb-close')) return;
    const rect = panelRef.current.getBoundingClientRect();
    const p = e.touches ? e.touches[0] : e;
    dragRef.current = {
      dx: p.clientX - rect.left,
      dy: p.clientY - rect.top,
      w: rect.width,
      h: rect.height,
    };
    setDragging(true);
    setPos({ left: rect.left, top: rect.top });
  };

  const press = useCallback((key) => {
    const el = targetRef.current;
    if (!el || !el.isConnected) return;

    const value = el.value ?? '';
    // Isingit sa kinaroroonan ng cursor, hindi laging sa dulo — para
    // magamit din ito sa pag-edit ng dati nang teksto.
    let start = el.selectionStart ?? value.length;
    let end = el.selectionEnd ?? value.length;
    let next;
    let caret;

    if (key === 'BACKSPACE') {
      if (start !== end) { next = value.slice(0, start) + value.slice(end); caret = start; }
      else if (start > 0) { next = value.slice(0, start - 1) + value.slice(end); caret = start - 1; }
      else return;
    } else if (key === 'CLEAR') {
      next = ''; caret = 0;
    } else {
      const ch = key === 'SPACE' ? ' '
        : key === 'ENTER' ? '\n'
        : (shift && !symbols ? key.toUpperCase() : key);
      // Ang Enter ay newline lang sa textarea; walang saysay sa input.
      if (key === 'ENTER' && el.tagName !== 'TEXTAREA') return;
      next = value.slice(0, start) + ch + value.slice(end);
      caret = start + ch.length;
    }

    setNativeValue(el, next);
    el.focus();
    try { el.setSelectionRange(caret, caret); } catch { /* hindi lahat ng input type sumusuporta */ }

    if (shift && key.length === 1 && !symbols) setShift(false);   // one-shot shift
  }, [shift, symbols]);

  const rows = symbols ? SYMBOL_ROWS : LETTER_ROWS;
  const style = pos
    ? { left: pos.left, top: pos.top, bottom: 'auto', transform: 'none' }
    : undefined;

  return (
    <div
      ref={panelRef}
      className={`vkb${dragging ? ' is-dragging' : ''}`}
      style={style}
      // Huwag nakawin ang focus mula sa field kapag pinindot ang key.
      onMouseDown={(e) => e.preventDefault()}
      onTouchStart={(e) => { if (e.target.closest('.vkb-head')) return; e.preventDefault(); }}
    >
      {/* Buong bar sa itaas ang hawakan — kahit saan dito maaaring
          i-swipe para ilipat ang keyboard. Ang Hide lang ang hindi
          kasama (sinasala ito sa loob ng startDrag). */}
      <div
        className="vkb-head"
        onMouseDown={startDrag}
        onTouchStart={startDrag}
        title={lang === 'EN' ? 'Swipe this bar to move the keyboard' : 'I-swipe ang bar na ito para ilipat ang keyboard'}
      >
        <span className="vkb-grip">
          ⠿ <span className="vkb-title">
            {lang === 'EN' ? 'Touchscreen Keyboard' : 'Keyboard sa Touchscreen'}
          </span>
        </span>
        <span className="vkb-hint">
          {lang === 'EN' ? 'Swipe to move' : 'I-swipe para ilipat'}
        </span>
        <button type="button" className="vkb-close" onClick={onClose}>
          {lang === 'EN' ? 'Hide' : 'Itago'} ✕
        </button>
      </div>

      {rows.map((row, i) => (
        <div className="vkb-row" key={i}>
          {row.map((k) => (
            <button type="button" key={k} className="vkb-key" onClick={() => press(k)}>
              {shift && !symbols ? k.toUpperCase() : k}
            </button>
          ))}
          {i === 0 && (
            <button type="button" className="vkb-key vkb-key--wide" onClick={() => press('BACKSPACE')}>
              ⌫
            </button>
          )}
        </div>
      ))}

      <div className="vkb-row">
        <button
          type="button"
          className={`vkb-key vkb-key--mod${shift ? ' is-on' : ''}`}
          onClick={() => setShift((s) => !s)}
          disabled={symbols}
        >
          ⇧ Shift
        </button>
        <button
          type="button"
          className={`vkb-key vkb-key--mod${symbols ? ' is-on' : ''}`}
          onClick={() => setSymbols((s) => !s)}
        >
          {symbols ? 'ABC' : '?123'}
        </button>
        <button type="button" className="vkb-key vkb-key--space" onClick={() => press('SPACE')}>Space</button>
        <button type="button" className="vkb-key vkb-key--mod" onClick={() => press('ENTER')}>⏎ Enter</button>
        <button type="button" className="vkb-key vkb-key--clear" onClick={() => press('CLEAR')}>Clear</button>
      </div>
    </div>
  );
}
