import type { Metadata } from "next";
import { WangBrandFrame } from "@/components/precision/brand/WangBrandFrame";


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
    title: "WANG Toppidrett Fredrikstad årsplan",
    description:
      "Årsplan, kalender og samlinger for golfgruppa ved WANG Toppidrett Fredrikstad.",
    images: [{ url: "/team-wang/icon-512.png", width: 512, height: 512 }],
  },
  twitter: {
    card: "summary",
    title: "WANG Toppidrett Fredrikstad årsplan",
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
  return <WangBrandFrame>{children}</WangBrandFrame>;
}
