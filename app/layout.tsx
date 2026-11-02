import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://scriptkaro.com"),
  title: "ScriptKaro | Viral Reel & Shorts Script Generator",
  description: "Topic do, viral reel script lo. 60 seconds mein. The #1 AI scriptwriter for Indian Instagram & YouTube Shorts creators in Roman Hinglish.",
  keywords: ["Reel script generator", "Hinglish AI scripts", "YouTube Shorts scripts", "Viral hooks", "ScriptKaro"],
  authors: [{ name: "ScriptKaro" }],
  creator: "ScriptKaro",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://scriptkaro.com",
    siteName: "ScriptKaro",
    title: "ScriptKaro - Viral Reel & Shorts Script Generator",
    description: "Topic do, viral reel script lo. 60 seconds mein. 3-second scroll-stopping hooks, scene-wise camera directions & Roman Hinglish dialogue.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ScriptKaro - Viral Reel & Shorts Script Generator",
    description: "Topic do, viral reel script lo. 60 seconds mein. 3-second hooks & Roman Hinglish dialogue.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ScriptKaro",
  },
  applicationName: "ScriptKaro",
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#0A0A0D",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-touch-fullscreen" content="yes" />
      </head>
      <body
        suppressHydrationWarning
        className={`${inter.variable} font-sans bg-[#0A0A0D] text-gray-100 antialiased selection:bg-[#FF7A1A]/30 selection:text-white min-h-[100dvh] flex flex-col`}
      >
        {/* Skip to Content for Keyboard Accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-[#FF7A1A] focus:text-black focus:font-bold focus:rounded-xl focus:shadow-orange-glow focus:outline-none"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
