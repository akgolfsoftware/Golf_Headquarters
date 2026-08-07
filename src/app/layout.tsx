import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import {
  Familjen_Grotesk,
  IBM_Plex_Mono,
  Inter,
  JetBrains_Mono,
  Lora,
  Poppins,
} from "next/font/google";
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

// Familjen Grotesk — eneste display-font i appen; Inter Tight er fjernet
// (Fase 3, 2026-07-07). Merk: design-kanonen er tømt 2026-07-25 — fontvalg
// står fritt frem til nytt designsystem fra Open Design.
const familjenGrotesk = Familjen_Grotesk({
  variable: "--font-familjen-grotesk",
  subsets: ["latin"],
  display: "swap",
});

// ---------- Claude Paper-fontene (designport steg 4) ----------
// --font-sans/--font-display/--font-mono (globals.css) peker nå på disse
// (fontbyttet gjort 2026-08-06). Fontene over (Inter/Familjen Grotesk/
// JetBrains Mono) står fortsatt igjen — mange enkeltskjermer (onboarding,
// teknisk-plan, hubs, golfdata) refererer dem direkte og må portes hver for
// seg før de kan fjernes i steg 10.
const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500", "600"],
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
  // WCAG 1.4.4: zoom skal aldri sperres (iOS ignorerer uansett user-scalable=no).
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover" as const,
};

// Async RSC — nødvendig for å lese headers() (CSP-nonce).
function erAppPath(path: string): boolean {
  return (
    path.startsWith("/portal") ||
    path.startsWith("/admin") ||
    path.startsWith("/forelder")
  );
}

/** Samme regel som gammelt FOUC-script + V2Shell — men på server (ingen <script>). */
function onsketMorkTema(path: string, temaCookie: string | undefined): boolean {
  const mork = temaCookie === "dark";
  const lysCk = temaCookie === "light";
  // App: lys default, mørk kun med dark-cookie.
  // Marketing/auth: mørk default, lys kun med light-cookie.
  return erAppPath(path) ? mork : !lysCk;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const h = await headers();
  const path = h.get("x-pathname") ?? "";
  const temaCookie = (await cookies()).get("ak-v2-tema")?.value;
  const mork = onsketMorkTema(path, temaCookie);

  return (
    <html
      lang="nb"
      className={`${inter.variable} ${jetbrainsMono.variable} ${familjenGrotesk.variable} ${poppins.variable} ${lora.variable} ${ibmPlexMono.variable} h-full antialiased`}
      {...(mork ? { "data-v2-tema": "dark" } : {})}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        {/* Tema: satt på <html> via cookie + path (SSR). V2Shell synker ved toggle. */}
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
