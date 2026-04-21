# BTC Stacking App

A premium Bitcoin accumulation tracker — React + Tailwind, dark theme, mobile-first.

## Features

| Page | Description |
|------|-------------|
| **Home** | Total BTC holdings, portfolio value (USD + THB), progress toward goal, cash-flow-to-BTC, this month, recent activity |
| **DCA** | DCA-only stack tracker, age-based projection, what-if scenarios, entries log |
| **Futures** | Cumulative PnL chart, win rate, trade log with mistake tags |
| **Triggers** | **Buy the Dip – 4 Layer Strategy** with interactive calculator |
| **More** | Live BTC/USD & BTC/THB price, Dip Reserve summary, Grid Bot |

## Stack

- **React 18** — UI
- **Vite** — build tool
- **Tailwind CSS 3** — styling
- **Recharts** — charts (via MiniChart SVG component)
- **Lucide React** — icons
- **Space Grotesk + Space Mono** — typography

---

## Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Open http://localhost:5173
```

## Build for Production

```bash
npm run build
# Output: dist/
```

---

## GitHub Deployment (GitHub Pages)

### Step 1 — Create GitHub repo

```bash
# On github.com: New repository → name: btc-stacking → Create

# Then in your project folder:
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/btc-stacking.git
git push -u origin main
```

### Step 2 — Install gh-pages

```bash
npm install --save-dev gh-pages
```

### Step 3 — Update vite.config.js

```js
// vite.config.js
export default defineConfig({
  plugins: [react()],
  base: '/btc-stacking/',   // ← your repo name
})
```

### Step 4 — Add deploy scripts to package.json

```json
"scripts": {
  "dev":     "vite",
  "build":   "vite build",
  "preview": "vite preview",
  "predeploy": "npm run build",
  "deploy":    "gh-pages -d dist"
}
```

### Step 5 — Deploy

```bash
npm run deploy
```

### Step 6 — Enable GitHub Pages

1. Go to your repo → **Settings → Pages**
2. Source: **Deploy from a branch**
3. Branch: **gh-pages** / root
4. Save → Your app is live at `https://YOUR_USERNAME.github.io/btc-stacking/`

---

## Suggested Repo Name

```
btc-stacking
```

---

## File Structure

```
btc-stacking/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── src/
    ├── main.jsx              ← React entry point
    ├── App.jsx               ← Root: routing, dialogs, global state wiring
    ├── index.css             ← Tailwind base + global styles
    ├── data/
    │   └── seed.js           ← Default entries & settings
    ├── hooks/
    │   ├── useAppState.js    ← Global state + localStorage persistence
    │   └── usePrice.js       ← Live BTC price fetch
    ├── utils/
    │   ├── format.js         ← Number formatters (compact USD/THB, BTC, %)
    │   └── metrics.js        ← Business logic (portfolio metrics, projection, dip calc)
    ├── components/
    │   ├── layout/
    │   │   ├── AppHeader.jsx       ← Sticky topbar (price pill, refresh)
    │   │   ├── BottomNav.jsx       ← Fixed bottom navigation
    │   │   └── AddEntrySheet.jsx   ← Add entry bottom sheet
    │   └── shared/
    │       ├── Card.jsx            ← Card + CardHead
    │       ├── StatCard.jsx        ← Small metric tile
    │       ├── EntryRow.jsx        ← Activity list row
    │       ├── ProgressBar.jsx     ← Animated progress bar
    │       └── MiniChart.jsx       ← Reusable SVG area/line chart
    └── pages/
        ├── HomePage.jsx      ← Dashboard
        ├── DcaPage.jsx       ← DCA tracking & projection
        ├── FuturesPage.jsx   ← Futures journal
        ├── TriggersPage.jsx  ← Buy the Dip calculator
        └── MorePage.jsx      ← Market price, Dip Reserve, Grid Bot
```

---

## Optional Improvements

- Add **PWA support** (`vite-plugin-pwa`) for offline use and home screen install
- Add **CSV export** of DCA / Futures history
- Add **price alerts** via Notification API
- Connect to **real exchange API** (Bitkub, Binance) for auto-import
- Add **dark/light toggle** (token already wired in tailwind.config.js)
- Add **fingerprint/PIN lock** for privacy
