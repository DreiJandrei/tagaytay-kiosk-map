# Tagaytay City Hall Kiosk

## Kiosk mode sa mini PC (Windows)

Nasa `kiosk/` na folder ang lahat ng kailangan. Kopyahin ang buong
folder sa mini PC — halimbawa sa `C:\kiosk`.

**1 · Isang beses lang: patayin ang pagtulog**

Kanang-klik sa `setup-power.bat` → **Run as administrator**.

Kahit tama ang lahat sa app, papatayin pa rin ng Windows ang TV
pagkaraan ng ilang minuto, at walang gigising niyon hanggang may
pumindot. Ito ang pumapatay ng lahat ng timer at ng screen saver.

**2 · Subukan muna**

Doble-klik ang `start-kiosk.bat`. Dapat bumukas ang kiosk sa buong
screen — walang address bar, walang tab, walang paraan para makalabas
ang bisita.

**3 · Auto-start tuwing bubukas ang makina**

1. Pindutin ang `Windows + R`, i-type ang `shell:startup`, Enter.
2. Kanang-klik sa `start-kiosk.bat` → **Copy**.
3. Sa bumukas na Startup folder: kanang-klik → **Paste shortcut**.

Tuwing bubuksan ang mini PC, kusa nang bubukas ang kiosk.

**Paano ito ihihinto para sa maintenance**

Gumawa ng file na `stop-kiosk.txt` sa loob ng `kiosk` folder, tapos
isara ang Chrome (`Alt` + `F4`). Kusa itong bumubukas ulit kapag
isinara — sinasadya iyon, para hindi maiwang blangko ang screen sa
lobby. Ang file na iyon ang nagsasabing huwag nang magbukas. Burahin
ito para bumalik sa dati.

**Ano ang hinahawakan ng app mismo**

Hindi kayang ipagawa ng isang web page ang pagbukas nang buong screen —
nasa `--kiosk` na flag ng Chrome iyon. Pero ang mga aksidenteng
nag-iiwan ng sirang screen ay hinaharangan na sa loob ng app
(`src/lib/kioskMode.js`):

| Aksidente | Dating nangyayari |
|---|---|
| Hawak nang matagal sa screen | Lumalabas ang right-click menu ng Chrome |
| Dalawang daliri / double-tap | Naka-zoom ang layout, hindi na bumabalik |
| Naligaw na `Ctrl`+`P`, `Ctrl`+`S` | Bumubukas ang print/save dialog |
| `Backspace` sa labas ng textbox | Umaatras palabas ng kiosk |

Hinihingi rin nito sa browser na huwag hayaang matulog ang screen
(Wake Lock) — pangalawang depensa sa power settings.

Walang epekto ang alinman sa mga ito sa telepono ng bisita na
nag-scan ng QR: ang link nila ay may `?route=`, at doon normal na
browser pa rin ang gamit nila.

**Tandaan:** ang Vercel link ang binubuksan, kaya kailangan ng
internet sa pagbukas. Kapag naputol ang koneksyon habang nakabukas na,
patuloy pa ring gumagana ang naipakitang mapa, pero hindi na darating
ang bagong anunsyo at video.

---

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
