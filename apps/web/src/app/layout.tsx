import type { Metadata, Viewport } from "next";
import "./globals.css";
import { DesktopHeader } from "@/components/layout/desktop-header";
import { DesktopFooter } from "@/components/layout/desktop-footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { PetProvider } from "@/context/pet-context";
import { CartProvider } from "@/context/cart-context";
import { AuthProvider } from "@/context/auth-context";
import { ThemeProvider } from "@/context/theme-context";
import { OtpAuthModal } from "@/components/auth/otp-auth-modal";
import { SupportDrawer } from "@/components/support/support-drawer";
import { OfflineBanner } from "@/components/common/offline-banner";


export const metadata: Metadata = {
  title: "بونیو | فروشگاه هوشمند و اکوسیستم زندگی پت",
  description: "بونیو، همراه روزانه زندگی پت شما — شناسنامه هوشمند، مراقبت روزانه و خرید آسان از معتبرترین پت‌شاپ‌ها",
  applicationName: "بونیو",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "بونیو",
  },
  formatDetection: {
    telephone: true,
  },
  icons: {
    icon: "/icons/bonnivo-logo-mark.svg",
    apple: "/icons/bonnivo-logo-mark.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0F766E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        {/* Load Vazirmatn Persian Font from reliable CDN with system fallback */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css"
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased pb-24 md:pb-12 selection:bg-emerald-500/20 selection:text-emerald-600 dark:selection:text-emerald-400 overflow-x-hidden w-full max-w-full">
        <ThemeProvider>
          <AuthProvider>
            <PetProvider>
              <CartProvider>
                {/* Global Network Connectivity Offline Banner */}
                <OfflineBanner />

                {/* Floating Glassmorphic Desktop Header */}
                <DesktopHeader />

                {/* Main Content Area */}
                <main className="relative flex flex-col min-h-screen overflow-x-hidden w-full max-w-full">
                  {children}
                </main>

                {/* Canonical Desktop Footer */}
                <DesktopFooter />

                {/* Floating iOS Glassmorphic 5-Tab Mobile Bottom Navigation */}
                <MobileBottomNav />

                {/* Global OTP Login / Signup Modal */}
                <OtpAuthModal />

                {/* Customer Support & AI Assistant Drawer */}
                <SupportDrawer />
              </CartProvider>
            </PetProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
