# Task Plan: Account Settings & Profile Hub

**Task**: Account Settings & User Profile Management
**Route**: `/dashboard/profile`
**Classification**: Unscoped Mission Work (Mandated by Master Prompt; no fake roadmap ID created)
**Status**: IN_PROGRESS
**Owner**: Builder

---

## 1. Requirements
1. **User Identity & State Connection**:
   - Integrate with `useAuth()` to display user name, phone number, and authentication status.
   - If not authenticated, display inviting state with "ورود یا ثبت‌نام" button that triggers `openAuthModal()`.
2. **Account Sections**:
   - **User Info Card**: Name editing, phone number display, registration timestamp.
   - **Registered Pets Summary**: Connected to `usePet()`, showing avatars and linking to `/dashboard/pets`.
   - **Delivery Addresses**: List of saved Tehran delivery addresses (Recipient, District, Address, Postal Code).
   - **Notification & Alert Preferences**:
     - SMS Care Reminders (یادآوری پیامکی روتین‌های روزانه)
     - Smart Depletion & Reorder Alerts (هشدار اتمام بسته غذا)
     - Emergency Lost Pet SMS Alerts (هشدارهای اضطراری اسکن قلاده هوشمند)
   - **Security & Active Sessions**:
     - Current device session details.
     - Safe Logout button calling `logout()` from `useAuth()`.
3. **Design & RTL**:
   - Persian-first, iOS glassmorphic style, Vazirmatn typography, responsive layouts.
   - Logical spacing, 44px touch targets.

---

## 2. File Announcement
- **Files to Create**:
  - `apps/web/src/app/dashboard/profile/page.tsx`
- **Files to Modify**:
  - None required.

---

## 3. Dependencies & Backend Status
- Frontend Auth state handled by `AuthProvider`.
- Real session termination endpoint (`POST /api/v1/auth/logout`) is pending backend FastAPI implementation. Clean frontend integration boundary provided.

---

## 4. Acceptance Criteria
- [ ] `/dashboard/profile` renders cleanly without 404.
- [ ] Connects to `useAuth()` and `usePet()`.
- [ ] Logout action safely clears session and returns user to guest state.
- [ ] Typecheck passes with 0 errors.
- [ ] Next.js production build passes with 0 errors.
