import type { Metadata } from "next";
import { IBM_Plex_Mono, Source_Sans_3 } from "next/font/google";

import "@/styles/gfgk-junior-tokens.css";

// GFGK-merkevarens fonter — scoped til micrositen (gfgkjunior.no), lastes ikke
// i resten av appen. Kanon: Claude Design-prosjektet «GFGK Junior og Elite».
const sourceSans = Source_Sans_3({
  variable: "--font-gfgk-sans",
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-gfgk-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Junior & Elite — Juniorgolf og trening | GFGK",
    template: "%s — GFGK Junior & Elite",
  },
  description:
    "Strukturert golftrening for barn og ungdom fra 6 til 19 år i Gamle Fredrikstad Golfklubb. Fire grupper tilpasset alder og nivå, erfarne trenere og et trygt fellesskap.",
  robots: { index: true, follow: true },
};

export default function GfgkJuniorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`gfgk-jr ${sourceSans.variable} ${plexMono.variable} min-h-screen`}>
      {children}
    </div>
  );
}
