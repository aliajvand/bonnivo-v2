# Bonyo Security Rules

1. **Authentication & OTP**:
   - Never persist plain-text OTPs in `localStorage`, cookies, or browser storage.
   - Do not log secret tokens or verification codes to the browser console.
   - Guard against brute-force in the UI by enforcing countdown timers on OTP resend requests.
2. **PII & Medical Privacy**:
   - Public pages (like `/passport/[token]`) must never leak the owner's home address, unmasked phone number, or confidential veterinary notes.
3. **Session Management**:
   - Handle JWT session tokens via secure HTTP-only cookies where applicable or secure in-memory context state.
