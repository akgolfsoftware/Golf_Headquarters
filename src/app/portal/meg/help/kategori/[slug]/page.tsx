/**
 * PlayerHQ · Meg · Hjelp · Kategori (/portal/meg/help/kategori/[slug]) — v2.
 * v2-port 17. juli 2026 (Team D4a): MegHelpKategoriV2 erstatter Tailwind-siden.
 * Auth, KATEGORIER-innholdet, sort-logikken (?sort=populaer/dato/mest-leste)
 * og notFound-oppførselen er uendret — kun presentasjonslaget er nytt
 * (ikonene er nå v2 Icon-navn i stedet for direkte Lucide-imports).
 *
 * NB: Artikkel-metadataene her er redaksjonelt hjelpesenter-innhold
 * (samme verdier som før porten) — ikke spillerens egne data.
 */
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import {
  MegHelpKategoriV2,
  type KategoriSort,
  type MegHelpKategoriData,
} from "@/components/portal/v2/MegHelpKategoriV2";

type Artikkel = {
  slug: string;
  tittel: string;
  preview: string;
  lesetid: number;
  publisert: string;
  visninger: number;
  oppdatert: string;
};

type KategoriDef = {
  slug: string;
  tittel: string;
  beskrivelse: string;
  /** v2 Icon-navn (Lucide via @/components/v2/icon). */
  ikon: string;
  artikler: Artikkel[];
};

const KATEGORIER: Record<string, KategoriDef> = {
  "komme-i-gang": {
    slug: "komme-i-gang",
    tittel: "Komme i gang",
    beskrivelse: "Førstegangs-oppsett og de viktigste tingene du må vite for å komme raskt i gang med PlayerHQ.",
    ikon: "sparkles",
    artikler: [
      {
        slug: "logg-din-forste-runde",
        tittel: "Logg din første runde",
        preview: "Steg-for-steg: hvordan registrere score, statistikk og notater på din første runde i PlayerHQ.",
        lesetid: 3,
        publisert: "2026-03-10",
        visninger: 1842,
        oppdatert: "2026-04-22",
      },
      {
        slug: "koble-til-trackman",
        tittel: "Koble til Trackman",
        preview: "Synkroniser Trackman-data automatisk via Trackman Cloud, slik at hver økt landes i din statistikk.",
        lesetid: 4,
        publisert: "2026-03-15",
        visninger: 1310,
        oppdatert: "2026-05-01",
      },
      {
        slug: "sett-ditt-forste-mal",
        tittel: "Sett ditt første mål",
        preview: "Slik bruker du pyramide-systemet for å sette et balansert utviklingsmål for de neste 12 ukene.",
        lesetid: 5,
        publisert: "2026-03-20",
        visninger: 982,
        oppdatert: "2026-04-30",
      },
    ],
  },
  trening: {
    slug: "trening",
    tittel: "Trening",
    beskrivelse: "Pyramide-systemet, øktstruktur, drills og hvordan du bruker statistikk for å trene smartere.",
    ikon: "dumbbell",
    artikler: [
      {
        slug: "pyramide-systemet",
        tittel: "Hva er pyramide-systemet?",
        preview: "Vår modell for balansert utvikling — fem disipliner, fire nivåer, og hvordan du tolker din pyramide.",
        lesetid: 5,
        publisert: "2026-04-02",
        visninger: 2407,
        oppdatert: "2026-05-12",
      },
      {
        slug: "bygg-din-treningsuke",
        tittel: "Bygg din treningsuke",
        preview: "Slik fordeler du tid mellom range, short game, putting og fysisk basert på din pyramide-profil.",
        lesetid: 7,
        publisert: "2026-04-12",
        visninger: 1612,
        oppdatert: "2026-05-08",
      },
      {
        slug: "drills-for-svake-omrader",
        tittel: "Drills for svake områder",
        preview: "Når pyramiden viser svakhet på pitching, putting eller mental — her er drills som virker.",
        lesetid: 6,
        publisert: "2026-04-18",
        visninger: 1245,
        oppdatert: "2026-05-04",
      },
      {
        slug: "tolke-trackman-data",
        tittel: "Tolke Trackman-data",
        preview: "Smash factor, angrep, klubbflate — hva tallene betyr og hvilke som faktisk hjelper deg å bli bedre.",
        lesetid: 8,
        publisert: "2026-04-25",
        visninger: 1098,
        oppdatert: "2026-05-15",
      },
    ],
  },
  coaching: {
    slug: "coaching",
    tittel: "Coaching",
    beskrivelse: "Hvordan jobbe med din coach gjennom PlayerHQ — booking, meldinger, notater og videoanalyse.",
    ikon: "message-circle",
    artikler: [
      {
        slug: "slik-bytter-du-coach",
        tittel: "Slik bytter du coach",
        preview: "Du kan bytte hovedcoach når som helst. Her er prosessen og hva som skjer med dine eksisterende økter.",
        lesetid: 2,
        publisert: "2026-04-05",
        visninger: 894,
        oppdatert: "2026-05-02",
      },
      {
        slug: "be-om-videoanalyse",
        tittel: "Be om videoanalyse",
        preview: "Last opp en sving-video og få strukturert tilbakemelding fra coachen din innen 48 timer.",
        lesetid: 3,
        publisert: "2026-04-10",
        visninger: 1421,
        oppdatert: "2026-05-09",
      },
      {
        slug: "forbered-coaching-okt",
        tittel: "Forbered en coaching-økt",
        preview: "Hva du bør ha klart før timen — fra siste rundes statistikk til konkrete spørsmål du vil få svar på.",
        lesetid: 4,
        publisert: "2026-04-20",
        visninger: 716,
        oppdatert: "2026-04-30",
      },
    ],
  },
  booking: {
    slug: "booking",
    tittel: "Booking + betaling",
    beskrivelse: "Reservere fasiliteter, kjøpe credits, betale med Vipps eller kort, og forstå abonnement-detaljer.",
    ikon: "calendar",
    artikler: [
      {
        slug: "book-trackman-bay",
        tittel: "Book en Trackman-bay",
        preview: "Steg-for-steg: velg fasilitet, tidspunkt, betal med credits eller kort, og få tilgang via QR-kode.",
        lesetid: 3,
        publisert: "2026-03-25",
        visninger: 1956,
        oppdatert: "2026-05-10",
      },
      {
        slug: "credits-forklart",
        tittel: "Credits forklart",
        preview: "Hvor mange credits koster en økt? Hvordan rulles ubrukte credits over? Vi går gjennom alt.",
        lesetid: 4,
        publisert: "2026-04-01",
        visninger: 1342,
        oppdatert: "2026-05-06",
      },
      {
        slug: "oppgrader-til-pro",
        tittel: "Hvordan oppgrader til Pro?",
        preview: "Forskjellen mellom Gratis og Pro, hva som er inkludert i 299 kr/mnd, og hvordan du oppgraderer.",
        lesetid: 2,
        publisert: "2026-04-08",
        visninger: 2103,
        oppdatert: "2026-05-12",
      },
    ],
  },
  konto: {
    slug: "konto",
    tittel: "Kontoinnstillinger",
    beskrivelse: "Profil, sikkerhet, personvern, varslinger og hvordan du eksporterer eller sletter dataen din.",
    ikon: "settings",
    artikler: [
      {
        slug: "endre-passord",
        tittel: "Endre passord",
        preview: "Slik bytter du passord, og hva du gjør hvis du har glemt det. Vi anbefaler passordbehandler.",
        lesetid: 2,
        publisert: "2026-04-03",
        visninger: 487,
        oppdatert: "2026-04-22",
      },
      {
        slug: "to-faktor-autentisering",
        tittel: "Slå på to-faktor-autentisering",
        preview: "Beskytt kontoen din med 2FA via Google Authenticator eller SMS — anbefalt for alle Pro-brukere.",
        lesetid: 3,
        publisert: "2026-04-08",
        visninger: 312,
        oppdatert: "2026-04-28",
      },
      {
        slug: "eksporter-data",
        tittel: "Eksporter all din data (GDPR)",
        preview: "Last ned all dataen din som JSON eller CSV — runder, statistikk, mål og notater i ett arkiv.",
        lesetid: 3,
        publisert: "2026-04-15",
        visninger: 198,
        oppdatert: "2026-05-01",
      },
    ],
  },
  statistikk: {
    slug: "statistikk",
    tittel: "Statistikk",
    beskrivelse: "SG-tall, strokes-gained, kart over slag, og hvordan du tolker rapporten etter hver runde.",
    ikon: "trending-up",
    artikler: [
      {
        slug: "hva-er-sg",
        tittel: "Hva betyr SG-tallene?",
        preview: "Strokes Gained forklart — hvordan vi måler om du tjente eller mistet slag mot benchmark per hull.",
        lesetid: 4,
        publisert: "2026-04-02",
        visninger: 1782,
        oppdatert: "2026-05-13",
      },
      {
        slug: "lese-runde-rapport",
        tittel: "Lese runde-rapporten",
        preview: "Rapporten har 4 seksjoner — hva du skal se etter, og hvilke tall som faktisk forteller noe.",
        lesetid: 5,
        publisert: "2026-04-14",
        visninger: 1234,
        oppdatert: "2026-05-09",
      },
    ],
  },
};

function formatDato(iso: string): string {
  return new Date(iso).toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function KategoriPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string }>;
}) {
  const user = await requirePortalUser();
  const { slug } = await params;
  const sp = await searchParams;
  const sort: KategoriSort =
    sp?.sort === "dato" || sp?.sort === "mest-leste" ? sp.sort : "populaer";

  const k = KATEGORIER[slug];
  if (!k) notFound();

  // Sorter — populaer = nyeste oppdatering først, vektet av visninger
  const sortert = [...k.artikler].sort((a, b) => {
    if (sort === "dato") return b.publisert.localeCompare(a.publisert);
    if (sort === "mest-leste") return b.visninger - a.visninger;
    // populaer: kombinasjon av oppdatert-dato og visninger
    const dateCmp = b.oppdatert.localeCompare(a.oppdatert);
    if (dateCmp !== 0) return dateCmp;
    return b.visninger - a.visninger;
  });

  const data: MegHelpKategoriData = {
    slug: k.slug,
    tittel: k.tittel,
    beskrivelse: k.beskrivelse,
    ikon: k.ikon,
    sort,
    sistOppdatertTekst: formatDato(
      k.artikler.reduce(
        (max, a) => (a.oppdatert > max ? a.oppdatert : max),
        k.artikler[0]?.oppdatert ?? "2026-01-01",
      ),
    ),
    artikler: sortert.map((a) => ({
      slug: a.slug,
      tittel: a.tittel,
      preview: a.preview,
      lesetid: a.lesetid,
      visninger: a.visninger,
      oppdatertTekst: formatDato(a.oppdatert),
    })),
  };

  return (
    <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/meg/help">Hjelp-hub</TilbakeLenke>
      <MegHelpKategoriV2 data={data} />
    </V2Shell>
  );
}
