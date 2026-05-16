import type { Metadata } from "next";
import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { InstallPrompt } from "@/components/portal/install-prompt";
import { SwRegister } from "@/components/sw-register";
import "./globals.css";

// Inter — UI og brødtekst (variable font)
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Inter Tight — display, hero-greeting, seksjonstittler
const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  display: "swap",
});

// JetBrains Mono — KPI-tall, tabulære tall, kode
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AK Golf — coaching, plan og fremgang i én app",
    template: "%s · AK Golf",
  },
  description:
    "Personlig AI-coach, periodiserte treningsplaner, SG-tracking og booking for golfere som vil bli bedre raskere.",
  metadataBase: new URL("https://akgolf.no"),
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AK Golf",
    startupImage: ["/apple-touch-icon.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    locale: "nb_NO",
    url: "https://akgolf.no",
    siteName: "AK Golf",
    title: "AK Golf — coaching, plan og fremgang i én app",
    description:
      "Personlig AI-coach, periodiserte treningsplaner, SG-tracking og booking.",
    images: [{ url: "/icon-512.png", width: 512, height: 512 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AK Golf",
    description: "Coaching, plan og fremgang i én app.",
    images: ["/icon-512.png"],
  },
};

export const viewport = {
  themeColor: "#005840",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover" as const,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="nb"
      className={`${inter.variable} ${interTight.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
          <Script
            defer
            data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
            src="https://plausible.io/js/script.js"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <InstallPrompt />
        <SwRegister />
      </body>
    </html>
  );
}
