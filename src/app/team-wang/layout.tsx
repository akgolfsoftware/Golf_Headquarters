import type { Metadata } from "next";
import { Montserrat, Quattrocento_Sans } from "next/font/google";

import "@/styles/wang-tokens.css";

// WANG-merkevarens fonter — scoped til fellessiden (/team-wang), lastes ikke
// i resten av appen. Kanon: Claude Design «WANG Toppidrett Fredrikstad Golf v2».
const montserrat = Montserrat({
  variable: "--font-wang-brand",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

const quattrocentoSans = Quattrocento_Sans({
  variable: "--font-wang-body",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "WANG Toppidrett Fredrikstad — Golf",
  description:
    "Fellesside for elever og foreldre i golfgruppa ved WANG Toppidrett Fredrikstad — sesongplan, kalender, samlinger, skole og foreldreinfo.",
  // Elevrelatert innhold — holdes utenfor søkemotorer inntil Anders sier noe annet.
  robots: { index: false, follow: false },
  // Egen PWA-identitet for WANG-micrositen: «Legg til på Hjem-skjerm» gir WANG-
  // våpenskjoldet som ikon og navnet «WANG Golf» — ikke AK Golf-appens globale manifest.
  manifest: "/team-wang/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/team-wang/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/team-wang/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/team-wang/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "WANG Golf",
    statusBarStyle: "default",
  },
  // Lenke-forhåndsvisning (iMessage/SoMe) skal vise WANG-identiteten,
  // ikke arve AK Golf-appens globale OG-bilde fra rot-layoutet.
  openGraph: {
    type: "website",
    locale: "nb_NO",
    url: "https://akgolf-hq.vercel.app/team-wang",
    siteName: "WANG Toppidrett Fredrikstad",
    title: "WANG Toppidrett Fredrikstad Årsplan",
    description:
      "Årsplan, kalender og samlinger for golfgruppa ved WANG Toppidrett Fredrikstad.",
    images: [{ url: "/team-wang/icon-512.png", width: 512, height: 512 }],
  },
  twitter: {
    card: "summary",
    title: "WANG Toppidrett Fredrikstad Årsplan",
    description:
      "Årsplan, kalender og samlinger for golfgruppa ved WANG Toppidrett Fredrikstad.",
    images: ["/team-wang/icon-512.png"],
  },
};

export default function TeamWangLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`wang-tp ${montserrat.variable} ${quattrocentoSans.variable} min-h-screen`}
    >
      {children}
    </div>
  );
}
