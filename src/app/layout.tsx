import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { IBM_Plex_Mono, Lora, Poppins } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { InstallPrompt } from "@/components/portal/install-prompt";
import { SwRegister } from "@/components/sw-register";
// S-14: CookieBanner + AnalyticsLoader erstatter hardkodet Plausible <Script>.
// Plausible lastes nå kun etter eksplisitt samtykke fra bruker.
import { CookieBanner } from "@/components/shared/cookie-banner";
import { VriTelefonen } from "@/components/shared/vri-telefonen";
import { AnalyticsLoader } from "@/components/shared/analytics-loader";
import "./globals.css";

// ---------- Claude Paper-fontene (designport steg 4 + 10) ----------
// Poppins (UI/display) · Lora (prosa) · IBM Plex Mono (tall) er de ENESTE
// fontene i appen. Inter, Familjen Grotesk og JetBrains Mono ble fjernet i
// steg 10 (2026-08-14) da siste direkte referanse til deres CSS-variabler
// var portet til --p-ui / --p-disp / --p-mono. Ikke gjeninnfør dem — se
// CLAUDE.md invariant 2. Lint-porten i scripts/check-token-gap.mjs vokter det.
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
  themeColor: "#141413",
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
    path.startsWith("/forelder") ||
    // Auth følger landingssidene/fasiten (fase1/innlogging.html): lys default.
    // Anders' beslutning 2026-08-13.
    path.startsWith("/auth")
  );
}

/**
 * Landingssidene — LYSE, alltid. Anders' beslutning 20.08.2026 sammen med
 * designvalget (fasit: `ak-golf-website`): «Design skal være lyst og matche
 * HQ-designet».
 *
 * Før dette var alt utenfor app-pathene mørkt som default, og de 23 PkShell-
 * sidene reddet seg selv ved å låse lys palett i sin egen CSS. Alt annet på
 * marketing — booking, blogg-restene — arvet produkt-mørk. Det var grunnen
 * til at nettstedet ikke så ut som ett sted.
 *
 * `/stats/*` står bevisst IKKE her: det er et eget produkt med egen mørk
 * ramme og egen designbølge (W7).
 */
const LANDINGSSIDER = [
  "/anlegg",
  "/blogg",
  "/booking",
  "/cases",
  "/coacher",
  "/coaching",
  "/cookies",
  "/faq",
  "/jobb",
  "/junior",
  "/kontakt",
  "/mulligan",
  "/om-oss",
  "/personvern",
  "/playerhq",
  "/priser",
  "/suksess",
  "/treningsfilosofi",
  "/turneringer",
  // Vedlikeholdsskiltet er landingsflaten mens VEDLIKEHOLD står på — lys, som
  // de andre landingssidene. Proxy-en setter x-pathname til /vedlikehold.
  "/vedlikehold",
  "/vilkar",
];

function erLandingsside(path: string): boolean {
  if (path === "/" || path === "") return true;
  return LANDINGSSIDER.some((p) => path === p || path.startsWith(`${p}/`));
}

/** Samme regel som gammelt FOUC-script + V2Shell — men på server (ingen <script>). */
function onsketMorkTema(path: string, temaCookie: string | undefined): boolean {
  const mork = temaCookie === "dark";
  const lysCk = temaCookie === "light";
  // App + auth: lys default, mørk kun med dark-cookie.
  // Landingssidene: alltid lyse — ingen toggle, heller ikke med dark-cookie.
  // Resten (stats, team-flatene, interne): mørk default, lys med light-cookie.
  if (erLandingsside(path)) return false;
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
      className={`${poppins.variable} ${lora.variable} ${ibmPlexMono.variable} h-full antialiased`}
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
        {/* Mobil i liggende (Safari-fane): ren CSS-overlay, se globals.css §ak-vri-telefonen */}
        <VriTelefonen />
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
          <AnalyticsLoader domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN} />
        )}
      </body>
    </html>
  );
}
