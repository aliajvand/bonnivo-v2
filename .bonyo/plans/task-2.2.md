# Task Plan — Task 2.2: Web OTP Login / Signup Modal with Countdown Timer

## 1. Requirements & Acceptance Criteria
- Phone number input accepting standard Iranian mobile format (`09xxxxxxxxx`).
- Smooth transition to OTP verification step.
- 120-second (2 minute) countdown timer with formatted MM:SS display.
- 5-digit individual OTP input fields with auto-focus, paste support, and backspace navigation.
- Resend OTP button strictly disabled until timer reaches 00:00.
- State management via `AuthContext`:
  - `user`: { id, phoneNumber, fullName, avatarUrl } | null
  - `isAuthenticated`: boolean
  - `isAuthModalOpen`: boolean
  - `openAuthModal()` / `closeAuthModal()`
  - `requestOtp(phoneNumber)`
  - `verifyOtp(code)`
  - `logout()`
- Security: Never persist plain-text OTPs or mock secrets in client storage.
- Navigation integration: DesktopHeader and MobileBottomNav trigger modal when unauthenticated.

## 2. Files to Create
- `apps/web/src/types/auth.ts`
- `apps/web/src/context/auth-context.tsx`
- `apps/web/src/components/auth/otp-auth-modal.tsx`

## 3. Files to Modify
- `apps/web/src/app/layout.tsx` (wrap in AuthProvider, render OtpAuthModal)
- `apps/web/src/components/layout/desktop-header.tsx` (connect profile button to auth state)
- `apps/web/src/components/layout/mobile-bottom-nav.tsx` (connect profile tab to auth state)

## 4. Verification Protocol
- `pnpm --filter web typecheck`
- Auditor verification in `.bonyo/audits/task-2.2.md`
- `pnpm --filter web build`
