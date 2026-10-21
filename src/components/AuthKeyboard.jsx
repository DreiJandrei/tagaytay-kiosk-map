import { useEffect, useState } from 'react';
import VirtualKeyboard from './VirtualKeyboard';
import { isTypable } from '../lib/keyboardUtils';

// Keyboard para sa mga auth modal at sa lock screen. Hiwalay na component
// para ang pag-unmount nito (pagsara ng modal) ang mag-reset ng "hidden" —
// kaya hindi na kailangan ng useEffect na nagse-setState, na nagdudulot ng
// cascading renders.
export default function AuthKeyboard({ scopeRef, lang }) {
  const [hidden, setHidden] = useState(false);

  // Kapag itinago, babalik ito sa susunod na pindot sa field. `pointerdown`
  // din, hindi lang `focusin`: naka-focus pa rin ang password field matapos
  // itago ang keyboard, kaya walang bagong focus na mangyayari sa pindot.
  useEffect(() => {
    const root = scopeRef.current;
    if (!root) return;
    const show = (e) => { if (isTypable(e.target)) setHidden(false); };
    root.addEventListener('focusin', show);
    root.addEventListener('pointerdown', show);
    return () => {
      root.removeEventListener('focusin', show);
      root.removeEventListener('pointerdown', show);
    };
  }, [scopeRef]);

  if (hidden) return null;
  return <VirtualKeyboard scopeRef={scopeRef} onClose={() => setHidden(true)} lang={lang} />;
}
