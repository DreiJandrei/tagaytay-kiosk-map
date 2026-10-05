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

**3 · Laki ng lahat sa screen**

Bumubukas na ito sa katumbas ng **80% na zoom ng Chrome** — mas marami
ang kasya, at hindi na sumisikip sa TV. Nasa `start-kiosk.bat` ang
bilang, malapit sa itaas:

```
set "KIOSK_SCALE=0.8"
```

Palitan lang iyon kung masyado pang maliit o malaki: `0.9` ay bahagyang
malaki, `0.75` ay mas maliit pa. Hindi na kailangang mag-`Ctrl` at minus
tuwing bubukas, at hindi rin ito mababago ng bisita.

Kung nasa `100%` ang Scale ng Windows (karaniwan sa TV), tumpak na 80%
ang `0.8`. Kung iba ang Scale sa **Settings → System → Display**,
pinapalitan ito ng bilang sa itaas — hindi dinadagdag.

**4 · Auto-start tuwing bubukas ang makina**

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
| Dalawang kamay na pag-swipe | Nagwawala ang mapa habang nag-zoom ang Chrome |
| Naligaw na `Ctrl`+`P`, `Ctrl`+`S` | Bumubukas ang print/save dialog |
| `Backspace` sa labas ng textbox | Umaatras palabas ng kiosk |

Hinihingi rin nito sa browser na huwag hayaang matulog ang screen
(Wake Lock) — pangalawang depensa sa power settings.

### Bakit hindi lang JavaScript ang panangga sa pag-zoom

Tatlong bagay ang kailangan, at dalawa sa mga ito ay hindi JavaScript:

1. **`touch-action: pan-x pan-y` sa `html`** (`src/index.css`) — ito ang
   tunay na panangga. Ang pinch ay hinahawakan ng compositor ng Chrome,
   at ito lang ang kayang magsabing huwag. Naka-`html.is-kiosk` ito, kaya
   hindi ito umaabot sa telepono ng bisita — doon, ang pinch ang tanging
   paraan niyang tingnan nang malapitan ang mapa.
2. **`--disable-pinch`** sa `kiosk/start-kiosk.bat` — panangga sa labas
   ng pahina. **Kung luma ang kopya ng `.bat` sa mini PC, wala ito.**
3. **`kioskMode.js`** — pandagdag lang: `touchstart`/`touchmove` na may
   `passive: false` (kung wala iyon, walang ginagawa ang
   `preventDefault()`), at `Ctrl` + gulong.

Hindi kabilang dito ang `user-scalable=no` sa `<meta viewport>`:
binabale-wala iyon ng Chrome sa Windows, sa mobile lang iyon tumatalab.

Walang epekto ang alinman sa mga ito sa telepono ng bisita na
nag-scan ng QR: ang link nila ay may `?route=`, at doon normal na
browser pa rin ang gamit nila.

**Tandaan:** ang Vercel link ang binubuksan, kaya kailangan ng
internet sa pagbukas. Kapag naputol ang koneksyon habang nakabukas na,
patuloy pa ring gumagana ang naipakitang mapa, pero hindi na darating
ang bagong anunsyo at video.

---

## Telepono ng mga tanggapan (kailangang patakbuhin minsan)

Para mapalitan ang contact number mula sa Admin Panel, kailangan munang
may hanay para doon sa database. **Minsan lang ito:**

1. Supabase → **SQL Editor** → **New query**
2. I-paste ang buong `supabase/office_phones.sql`
3. **Run**

Nagdadagdag ito ng `phone` at `local` sa `office_details`, at inililipat
ang mga numerong dati'y nasa `src/lib/defaultOfficeData.js`. Ligtas itong
ulit-ulitin.

Habang hindi pa ito napapatakbo, hindi masisira ang Admin Panel — nai-save
pa rin ang lahat maliban sa telepono, at may paalala sa console. Ang
lumalabas na numero sa kiosk ay ang nasa code pa rin.

### Pagkatapos: ang buong listahan ng contact

Ang `supabase/office_contacts_pdf.sql` ang naglalagay ng **contact person
at telepono ng labinsiyam na tanggapan** sa isang takbo — ito ang kapalit
ng manu-manong pag-type sa Admin Panel. **Patakbuhin ito pagkatapos ng
`office_phones.sql`**, hindi bago. Ligtas itong ulit-ulitin.

Pinagmulan ang `office-info.pdf` (direktoryo kada palapag), at `(046)
483-937x` ang numero roon.

Dalawang tanggapan sa PDF ang hindi kasama — **Zoning Office** at
**Character Office**. Wala silang silid sa mapa, kaya walang maituturo
ang kiosk para sa kanila; kailangan munang maipuwesto sila bago sila
bigyan ng contact card.

#### Ang naunang bersyon: Citizen's Charter 2025

Ang `supabase/office_contacts_charter.sql` ay ibang set ng numero —
`(046) 888-9500` + 3-digit na local, mula sa opisyal na Citizen's Charter
2025, sa labintatlong tanggapang may katapat sa mapa. **Huwag patakbuhin
ang dalawa nang sabay**: magkabaligtad sila, at kung alin ang huling
tumakbo, iyon ang mananaig.

Napiling sundin ang PDF noong 2026-10-05, kaya ang `office_contacts_pdf.sql`
ang patakbuhin. Buksan lang ulit ang charter file kapag napagtibay na ng
City Hall ang `888-9500`.

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
