# Bonyo Frontend Engineering Rules

1. **RTL & Typography**:
   - Direction: `rtl`.
   - Primary font: `Vazirmatn`.
   - Directional classes: Use logical utility classes (`ps-*`, `pe-*`, `ms-*`, `me-*`, `start-*`, `end-*`).
2. **Design Language**:
   - iOS 18-inspired glassmorphism (`glass-pill`, `glass-dock`, `glass-card`).
   - Deep Teal (`--primary`), Terracotta (`--terracotta`), Soft Gold (`--gold`).
   - Rounded corners: `rounded-2xl`, `rounded-3xl`, `rounded-full`.
3. **SSR Safety**:
   - Ensure all `localStorage` and browser APIs are protected with `typeof window !== "undefined"` or inside `useEffect`.
4. **Touch & Ergonomics**:
   - Touch targets must be at least 44x44px.
