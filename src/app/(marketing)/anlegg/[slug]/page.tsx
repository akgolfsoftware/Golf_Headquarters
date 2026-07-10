/**
 * /anlegg/[slug] — v2. Statisk ANLEGG_DATA gjenbrukt 1:1 fra
 * (mlegacy)/anlegg/[slug]/page.tsx.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarkedAnleggDetaljV2, type AnleggData } from "@/components/marketing/v2/MarkedAnleggDetaljV2";

const ANLEGG_DATA: Record<string, Omit<AnleggData, "slug">> = {
  "miklagard-golfklubb": {
    name: "Miklagard Golf",
    adresse: "Sigurd Hagens vei 50, 2040 Kløfta",
    heroImage: "/images/anlegg/miklagard-hero.jpg",
    heroAlt: "Luftfoto over Miklagard Golf, mesterskapsbanen fra drone",
    tagline:
      "En av Nordens mest prestisjetunge mesterskapsbaner, designet for utfordring og data-drevet trening året rundt.",
    highlights: [
      {
        icon: "trophy",
        title: "Mesterskapsdesign",
        description: "Internasjonal mesterskapsbane med utfordrende greener og strategisk bunker-plassering.",
      },
      {
        icon: "crosshair",
        title: "Trackman Range",
        description: "2. etg. driving range med Trackman på alle utslag: data fra første ball.",
      },
      {
        icon: "building-2",
        title: "Komplett anlegg",
        description: "To Performance Studio, stor putting green og state-of-the-art wedge-område.",
      },
    ],
    gallery: {
      src: "/images/anlegg/miklagard-2.jpg",
      alt: "Solnedgang over bunkere og fairway på Miklagard Golf",
      label: "Solnedgang · 18. green",
    },
    logo: { src: "/images/logos/miklagard-logo.png", alt: "Miklagard Golf logo", width: 200, height: 97 },
    kontakt: { telefon: "+47 63 94 80 00", epost: "post@miklagardgolf.no" },
    ctaBlurb:
      "AK Golf Academy holder til på Miklagard. Book privat coaching med våre trenere, alt på ett av Nordens mest spektakulære anlegg.",
    websiteUrl: "https://miklagardgolf.no",
    websiteHost: "miklagardgolf.no",
    greenfeeUrl: "https://miklagardgolf.no/greenfee",
    greenfeeFrom: "1 050",
    membershipUrl: "https://miklagardgolf.no/medlemskap",
    membershipFrom: "14 900",
    membershipBlurb: "Fritt spill, rabatterte greenfee for venner og familie, og full tilgang til alle anlegg.",
  },
  "gamle-fredrikstad-gk": {
    name: "Gamle Fredrikstad GK",
    adresse: "Vesterelvveien 100, 1605 Fredrikstad",
    heroImage: "/images/anlegg/gfgk-hero2.jpg",
    heroAlt: "Utsikt over Gamle Fredrikstad Golfklubb, flaggstang på green",
    tagline:
      "Klassisk links-inspirert design med 18+9 hull, kort fra historisk Gamlebyen. Hjemmebanen til AK Golf Academy.",
    highlights: [
      {
        icon: "activity",
        title: "Links-design",
        description: "Værutsatt parkland-links med faste, raske greener og naturlige formasjoner.",
      },
      {
        icon: "flag",
        title: "18 + 9 hull",
        description: "Full 18-hulls mesterskapsbane pluss 9-hulls par 3-bane for trening og rask runde.",
      },
      {
        icon: "history",
        title: "Historisk beliggenhet",
        description: "Få minutters kjøring fra Gamlebyen i Fredrikstad, Nordens best bevarte festningsby.",
      },
    ],
    gallery: {
      src: "/images/anlegg/gfgk-2.jpg",
      alt: "Kongsten fort og golfbane, Gamle Fredrikstad GK",
      label: "Kongsten fort · Hull 14",
    },
    logo: { src: "/images/logos/gfgk-logo.png", alt: "Gamle Fredrikstad GK logo", width: 80, height: 65 },
    kontakt: { telefon: "+47 69 36 14 00", epost: "post@gfgk.no" },
    ctaBlurb:
      "AK Golf Academy holder til på Gamle Fredrikstad Golfklubb. Book privat coaching med våre trenere, i et anlegg med 100 års historie.",
    websiteUrl: "https://gfgk.no",
    websiteHost: "gfgk.no",
    greenfeeUrl: "https://gfgk.no/greenfee",
    greenfeeFrom: "650",
    membershipUrl: "https://gfgk.no/medlemskap",
    membershipFrom: "11 400",
    membershipBlurb: "Hovedmedlemskap inkluderer fritt spill på 18-hulls og 9-hulls bane, og rabatt på coaching.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = ANLEGG_DATA[slug];
  if (!data) return { title: "Anlegg ikke funnet" };
  return {
    title: `${data.name} | AK Golf Academy`,
    description: `Tren hos AK Golf Academy på ${data.name}, ${data.adresse}.`,
  };
}

export default async function AnleggDetaljV2({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = ANLEGG_DATA[slug];
  if (!data) notFound();

  return <MarkedAnleggDetaljV2 data={{ ...data, slug }} />;
}
