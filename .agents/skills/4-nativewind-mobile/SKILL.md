---
name: nativewind-mobile
description: React Native, Expo Router, NativeWind, and shared Bonyo Care System design tokens
---
# Mobile Directives:

1. **Stack & Foundation:**
   - React Native with Expo and Expo Router for file-based navigation.
   - NativeWind for Tailwind-compatible styling, sharing design tokens (Bonyo Care System) with web.

2. **State & Storage:**
   - Zustand for lightweight, decoupled client state management.
   - Expo SecureStore for encrypted token and session storage.

3. **Offline & Experience:**
   - Offline-first caching for daily care routines, tasks, and pet profiles.
   - RTL layout support and Vazirmatn Persian typography.
   - Do not force 100% code sharing with web; share design tokens and domain models where natural without introducing leaky abstractions.
