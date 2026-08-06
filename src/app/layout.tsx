import type { Metadata } from "next";
import { headers } from "next/headers";
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
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Nonce settes av proxy.ts (middleware) og forwardes som x-nonce request-header
  // inn i RSC-render. Passes til <Script>-komponenter slik at CSP script-src
  // med 'nonce-{nonce}' + 'strict-dynamic' godkjenner dem.
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html
      lang="nb"
      className={`${inter.variable} ${jetbrainsMono.variable} ${familjenGrotesk.variable} ${poppins.variable} ${lora.variable} ${ibmPlexMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        {/* Fase F PR1: CSS :root = lys. Mørk via data-v2-tema="dark" + cookie.
            App (/portal|/admin|/forelder): lys default, mørk kun med dark-cookie.
            Marketing/auth: mørk default (som før), lys kun med light-cookie.
            V2Shell synker samme regel ved SPA-navigasjon. */}
        {/* suppressHydrationWarning: nettlesere nuller nonce-attributtet i DOM
            (sikkerhetsmekanisme) → server/klient-avvik som er forventet. */}
        <script
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `try{var p=window.location.pathname;var ck=document.cookie.split("; ");var mork=ck.some(function(c){return c==="ak-v2-tema=dark"});var lysCk=ck.some(function(c){return c==="ak-v2-tema=light"});var app=p.indexOf("/portal")===0||p.indexOf("/admin")===0||p.indexOf("/forelder")===0;var morkOnsket=app?mork:!lysCk;if(morkOnsket)document.documentElement.setAttribute("data-v2-tema","dark");else document.documentElement.removeAttribute("data-v2-tema")}catch(e){}`,
          }}
        />
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
