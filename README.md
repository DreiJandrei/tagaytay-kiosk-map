# Tagaytay City Hall Kiosk

## Tunog sa welcome screen video

Hinaharangan ng lahat ng browser ang tunog hangga't walang pumipindot sa
screen. Kaya kahit naka-ON ang "🔊 Buksan ang tunog" sa Admin Panel,
maaaring tahimik pa rin ang unang video pagkatapos ng restart.

May bilog na 🔊 na buton sa ibabaw ng video sa welcome screen. Doon
kayang buksan o patayin ng bisita ang tunog — at hindi nagsisimula ang
kiosk kapag iyon ang pinindot (ang pindot sa kahit saang iba ay
nagsisimula pa rin gaya ng dati).

Para may tunog agad kahit walang pumipindot, buksan ang Chrome sa kiosk
gamit ang flag na ito:

```bash
# macOS
open -a "Google Chrome" --args --autoplay-policy=no-user-gesture-required --kiosk "https://tagaytay-kiosk-map-one.vercel.app/?key=cct-bsit-kiosk"

# Windows
chrome.exe --autoplay-policy=no-user-gesture-required --kiosk "https://tagaytay-kiosk-map-one.vercel.app/?key=cct-bsit-kiosk"
```

Ilagay ito sa startup shortcut ng kiosk para tuwing bubukas ang makina,
handa na agad. Wala itong epekto sa ibang website — para lang sa
window na binuksan ng utos na ito.

Tandaan: hindi kayang buksan ang tunog ng Facebook embed kahit anong
gawin. Kung kailangan talaga ng tunog, i-download ang video at i-upload
sa Admin Panel bilang .mp4.

---

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
