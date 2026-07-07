import type { Metadata } from "next";
import { headers } from "next/headers";
import { Familjen_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { InstallPrompt } from "@/components/portal/install-prompt";
import { SwRegister } from "@/components/sw-register";
// S-14: CookieBanner + AnalyticsLoader erstatter hardkodet Plausible <Script>.
// Plausible lastes nå kun etter eksplisitt samtykke fra bruker.
import { CookieBanner } from "@/components/shared/cookie-banner";
import { AnalyticsLoader } from "@/components/shared/analytics-loader";
import "./globals.css";

// Inter — UI og brødtekst (variable font)
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// JetBrains Mono — KPI-tall, tabulære tall, kode
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

// Familjen Grotesk — display-font (v13-kanon, .claude/rules/design-system-regel.md).
// Eneste display-font i appen; Inter Tight er fjernet (Fase 3, 2026-07-07).
const familjenGrotesk = Familjen_Grotesk({
  variable: "--font-familjen-grotesk",
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
  applicationName: "AK Golf",
  formatDetection: {
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AK Golf",
    startupImage: [
      {
        url: "/splash/apple-splash-1290-2796.png",
        media:
          "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/splash/apple-splash-1179-2556.png",
        media:
          "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/splash/apple-splash-1170-2532.png",
        media:
          "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/splash/apple-splash-828-1792.png",
        media:
          "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/splash/apple-splash-1668-2388.png",
        media:
          "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)",
      },
    ],
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
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover" as const,
};

// Async RSC — nødvendig for å lese headers() (CSP-nonce).
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Nonce settes av proxy.ts (middleware) og forwardes som x-nonce request-header
  // inn i RSC-render. Passes til <Script>-komponenter slik at CSP script-src
  // med 'nonce-{nonce}' + 'strict-dynamic' godkjenner dem.
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  // nonce er fremdeles tilgjengelig for fremtidig bruk
  void nonce;

  return (
    <html
      lang="nb"
      className={`${inter.variable} ${jetbrainsMono.variable} ${familjenGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <InstallPrompt />
        <SwRegister />
        <Analytics />
        <SpeedInsights />
        {/* S-14: cookie-samtykke + betinget Plausible-lasting */}
        <CookieBanner />
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
          <AnalyticsLoader domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN} />
        )}
      </body>
    </html>
  );
}
