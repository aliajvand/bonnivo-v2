# 3D Floating Island & Visual Asset Mapping

## 1. Asset Inventory (`icons/`)

| Asset Name | Current Path | Format | Feature Mapping | 2D Usage | 3D Usage | Needs Model? | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `bonnivo-floating-island.svg` | `/icons/` | SVG | Hero Banner | Primary 2D Fallback | Reference Map | No | Available (8.9MB) |
| `bonnivo-logo-horizontal.svg` | `/icons/` | SVG | Header / Brand | Navbar | Texture | No | Available |
| `bonnivo-logo-mark.svg` | `/icons/` | SVG | Favicon / App Icon | PWA / Mobile Icon | Texture | No | Available |
| `bonnivo-logo-vertical.svg` | `/icons/` | SVG | Footer / Splash | Mobile Splash | Texture | No | Available |
| `dog.svg` / `dog.png` | `/icons/` | SVG/PNG | Dog Category & Profile | Species Selector | Mesh Decal | Future (GLB) | Available |
| `cat.svg` / `cat.png` | `/icons/` | SVG/PNG | Cat Category & Profile | Species Selector | Mesh Decal | Future (GLB) | Available |
| `birds.svg` / `birds.png` | `/icons/` | SVG/PNG | Birds Category & Profile| Species Selector | Mesh Decal | Future (GLB) | Available |
| `small-pets.svg` / `small-pets.png` | `/icons/` | SVG/PNG | Small Pets Profile | Species Selector | Mesh Decal | Future (GLB) | Available |
| `food.svg` / `food.png` | `/icons/` | SVG/PNG | Food Category / Reorder| Store Navigation | Island Building| Future (GLB) | Available |
| `health.svg` / `health.png` | `/icons/` | SVG/PNG | Health / Vaccines | Care Dashboard | Island Building| Future (GLB) | Available |
| `toys.svg` / `toys.png` | `/icons/` | SVG/PNG | Toys Category | Store Navigation | Island Building| Future (GLB) | Available |
| `all.svg` / `all.png` | `/icons/` | SVG/PNG | All Categories | Marketplace Filter | UI Marker | No | Available |

---

## 2. Interactive Island Landmark Mapping (Phase 1)

```text
[ Pet Home ]       --> Links to: /dashboard/pet-profile
[ Health Clinic ]  --> Links to: /dashboard/care/health
[ Bonyo Store ]    --> Links to: /shop
[ Food Kitchen ]   --> Links to: /shop/category/food & /dashboard/reorder
[ Park ]           --> Links to: /dashboard/care/tasks (Walking tracker)
[ QR Center ]      --> Links to: /dashboard/passport
```

---

## 3. Performance & Fallback Engine
- **Lazy Loading:** Three.js / React Three Fiber is imported dynamically with `ssr: false` in Next.js.
- **2D Fallback Logic:**
  - Hardware concurrency < 4 OR low device memory (< 4GB) -> Mount 2D SVG (`bonnivo-floating-island.svg`).
  - Connection `save-data: on` OR effective type `2g/3g` -> Mount 2D SVG.
  - User preference `prefers-reduced-motion: reduce` -> Mount 2D SVG.
- **Performance Budget:** 3D bundle < 250KB gzipped; frame rate target >= 55 FPS on mid-tier desktop devices.
