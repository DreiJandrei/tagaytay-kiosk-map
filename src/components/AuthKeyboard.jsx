import { useEffect, useState } from 'react';
import VirtualKeyboard from './VirtualKeyboard';
import Icon from './Icon';
import { wantsOnScreenKeyboard } from '../lib/keyboardUtils';

// Keyboard para sa mga auth modal at sa lock screen. Hiwalay na component
// para ang pag-unmount nito (pagsara ng modal) ang mag-reset ng estado.
//
// Nakatago ito hanggang may pumindot sa field. Hindi sapat ang focus: may
// autoFocus ang unang field — para makapag-type agad ang may keyboard —
// kaya kapag focus ang hudyat, lalabas ito bago pa may pumindot at matatabunan
// ang form. Ang maliit na buton ay para sa mga pagkakataong hindi mabasa kung
// daliri ang pumindot.
export default function AuthKeyboard({ scopeRef, lang }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const root = scopeRef.current;
    if (!root) return;
    const show = (e) => { if (wantsOnScreenKeyboard(e)) setOpen(true); };
    root.addEventListener('pointerdown', show);
    return () => root.removeEventListener('pointerdown', show);
  }, [scopeRef]);

  if (open) return <VirtualKeyboard scopeRef={scopeRef} onClose={() => setOpen(false)} lang={lang} />;
  return (
    <button type="button" className="vkb-chip" onClick={() => setOpen(true)}>
      <Icon name="keyboard" /> {lang === 'EN' ? 'Keyboard' : 'Keyboard'}
    </button>
  );
}
