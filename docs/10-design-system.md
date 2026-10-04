# Bonyo Care Design System (سیستم طراحی مراقبت بونیو)

## 1. Brand Philosophy & Design Attributes
The Bonyo Care System is engineered specifically for pet parenting in Persian RTL.
- **Attributes:** Warm, Reassuring, Premium, Clinically Reliable, Modern, Low Cognitive Load.
- **Strict Principle:** Avoid childlike cartoonish tropes while steering clear of sterile hospital aesthetics.

---

## 2. Color Palette & Semantic Tokens

| Token Name | Hex Code | HSL Value | Purpose |
| :--- | :--- | :--- | :--- |
| **Deep Teal (Primary)** | `#0F766E` | `175, 77%, 26%` | Brand identity, primary CTAs, active tab indicators |
| **Warm Ivory (Canvas)** | `#FAF8F3` | `43, 33%, 97%` | Background canvas, calm container backdrops |
| **Terracotta (Action)** | `#D97757` | `15, 65%, 60%` | Care task check-offs, walk progress, urgent notifications |
| **Soft Gold (Accent)** | `#D4AF37` | `46, 65%, 52%` | Milestone celebrations, VIP badges, streak rewards |
| **Deep Forest (Dark)** | `#064E3B` | `166, 85%, 16%` | High-contrast headings and dark mode accents |
| **Calm Green (Success)** | `#10B981` | `160, 84%, 39%` | Task completed, inventory in-stock, payment verified |
| **Amber (Warning)** | `#F59E0B` | `38, 92%, 50%` | Low stock alert, food package expiring in 7 days |
| **Muted Red (Danger)** | `#EF4444` | `0, 84%, 60%` | Lost Pet alert, order cancellation, payment failure |

---

## 3. Typography & RTL Standards
- **Font Family:** `Vazirmatn`, sans-serif.
- **Base Direction:** `dir="rtl"` (100% RTL first).
- **Line Heights:**
  - Body copy: `leading-[1.7]` to `leading-[1.8]` for optimal Persian legibility.
  - Headings: `leading-[1.3]` to `leading-[1.4]`.
- **CSS Logical Properties:**
  - Use `ms-*` (margin-inline-start) and `me-*` (margin-inline-end) instead of `ml-*` and `mr-*`.
  - Use `ps-*` (padding-inline-start) and `pe-*` (padding-inline-end) instead of `pl-*` and `pr-*`.
  - Use `text-start` and `text-end`.

---

## 4. UI Components & States Checklist
Every component must implement all six visual states:
1. **Default / Rest:** Clean borders, soft shadows, warm ivory backdrop.
2. **Hover / Focus:** Deep Teal ring (`ring-2 ring-primary/20`), subtle elevation.
3. **Loading / Skeleton:** Shimmering animated skeletons (`animate-pulse bg-muted`).
4. **Empty State:** Reassuring illustration, Persian explanatory copy, single clear CTA.
5. **Error Boundary:** Friendly error toast/card with "تلاش مجدد" (Retry) action.
6. **Offline / Low-Connection:** Cached state banner with offline indicator.
