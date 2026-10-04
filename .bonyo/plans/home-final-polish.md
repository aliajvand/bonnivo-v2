# Sprint Plan: Home Final Polish & Design System Integration

## Work Packages:
1. **WP-1 (Design System & Global Harmony - `1-ui-pro-max`):**
   - Harmonize typography, border colors, radii (`rounded-2xl` for cards, `rounded-3xl` for major blocks, `rounded-full` for badges).
   - Ensure soft neutral `#F7F8F6` light canvas and `#0c1712` deep forest dark canvas.
   - Restrain colors to Bonnivo emerald (`#0e9f6e`), soft mint, and warm neutrals.
2. **WP-2 (3D Floating Island & Hotspots - `2-threejs-3d`):**
   - Fine-tune hotspot coordinates to sit directly on buildings across desktop and mobile.
   - Refine micro-animations with `@media (prefers-reduced-motion)` safety.
3. **WP-3 (Product & Personalization UX - `1-ui-pro-max` / `3-fastapi-backend`):**
   - Increase product image scale, reduce empty surrounding whitespace, center properly on soft neutral canvas.
   - Ensure clean e-commerce hierarchy: Brand -> Image -> Name -> Rating -> Price -> Add to Cart CTA.
4. **WP-4 (Services, Events, Trainers & Brands):**
   - Clean editorial service cards with verified badges and deep-linking.
   - Event and Trainer cards with crisp full-width photo banners.
   - Partner brands wavy floating animation and accessible hover/focus tooltips.
5. **WP-5 (Mobile & Responsive - `4-nativewind-mobile`):**
   - Verify 375px, 390px, 430px viewports without horizontal scroll.
   - Confirm 6-tab mobile bottom navigation.
6. **WP-6 (QA, Build & Verification - `bonyo-sprint`):**
   - Run `pnpm --filter web typecheck` and `pnpm --filter web build`.
   - Execute automated headless Chrome test verifying all clicks, tooltips, cart, dark mode, and zero console errors.
   - Write comprehensive report to `.bonyo/reports/home-final-polish-verification.md`.
