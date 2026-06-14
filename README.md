# 5D BIM Construction Estimation

Two-page web app for construction estimation linked to Revit BIM models, comparing **Indonesian (AHSP)** and **Taiwan** standards across 5D dimensions: 3D Model → Quantity → Cost → Schedule → S-Curve.

## Pages

| Page | URL | What it does |
|---|---|---|
| **Dashboard** | `/` *(or `Dashboard 5D BIM.html`)* | Main app — upload Revit CSV/XLSX, view 3D IFC viewer, compute unit price (AHSP), BoQ, schedule, S-curve |
| **Process Guide** | `cons-mgmt-process.html` | 16-slide pedagogical walkthrough explaining each formula and stage |

Both pages cross-link in the topbar and the **Process Guide CTA** in the dashboard. Navigating between them auto-enters fullscreen on first interaction.

## Stack

- **HTML / CSS / vanilla JS** + React 18 (via Babel standalone, no build step)
- **3 languages**: Bahasa Indonesia · English · 繁體中文 — toggle in settings drawer
- **Three.js** for IFC 3D viewer
- **OKLCH color tokens** + Source Serif 4 typography
- **Tailwind CDN** only on legacy components (most styles are hand-rolled CSS)

## Running locally

```powershell
cd "ConstEst Project"
python -m http.server 8765
```

Open <http://localhost:8765/>.

## Author

Mukti Hadi Trinanda · 木安豪 · W1435407
