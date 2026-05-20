/**
 * PlayerHQ · Meg · Hjelp · Kategori (P2)
 *
 * Listevisning av artikler innenfor én kategori. Hero med kategori-navn,
 * sort-filter (popularitet/dato/mest leste), og "send oss et spørsmål"-CTA
 * dersom ingen artikkel passer.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Sparkles,
  Dumbbell,
  Headphones,
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight,
  Clock,
  TrendingUp,
  Mail,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

type Sort = "populaer" | "dato" | "mest-leste";

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
  navn: string;
  italic: string;
  beskrivelse: string;
  ikon: LucideIcon;
  iconBg: string;
  iconFg: string;
  artikler: Artikkel[];
};

const KATEGORIER: Record<string, KategoriDef> = {
  "komme-i-gang": {
    slug: "komme-i-gang",
    navn: "Komme",
    italic: "i gang",
    beskrivelse: "Førstegangs-oppsett og de viktigste tingene du må vite for å komme raskt i gang med PlayerHQ.",
    ikon: Sparkles,
    iconBg: "bg-primary/10",
    iconFg: "text-primary",
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
    navn: "",
    italic: "Trening",
    beskrivelse: "Pyramide-systemet, øktstruktur, drills og hvordan du bruker statistikk for å trene smartere.",
    ikon: Dumbbell,
    iconBg: "bg-secondary",
    iconFg: "text-foreground",
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
    navn: "",
    italic: "Coaching",
    beskrivelse: "Hvordan jobbe med din coach gjennom PlayerHQ — booking, meldinger, notater og videoanalyse.",
    ikon: Headphones,
    iconBg: "bg-accent/30",
    iconFg: "text-foreground",
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
    navn: "Booking +",
    italic: "betaling",
    beskrivelse: "Reservere fasiliteter, kjøpe credits, betale med Vipps eller kort, og forstå abonnement-detaljer.",
    ikon: Calendar,
    iconBg: "bg-destructive/15",
    iconFg: "text-destructive",
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
        preview: "Forskjellen mellom Gratis og Pro, hva som er inkludert i 300 kr/mnd, og hvordan du oppgraderer.",
        lesetid: 2,
        publisert: "2026-04-08",
        visninger: 2103,
        oppdatert: "2026-05-12",
      },
    ],
  },
  konto: {
    slug: "konto",
    navn: "",
    italic: "Kontoinnstillinger",
    beskrivelse: "Profil, sikkerhet, personvern, varslinger og hvordan du eksporterer eller sletter dataen din.",
    ikon: Settings,
    iconBg: "bg-secondary",
    iconFg: "text-foreground",
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
    navn: "",
    italic: "Statistikk",
    beskrivelse: "SG-tall, strokes-gained, kart over slag, og hvordan du tolker rapporten etter hver runde.",
    ikon: TrendingUp,
    iconBg: "bg-primary/10",
    iconFg: "text-primary",
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
  await requirePortalUser();
  const { slug } = await params;
  const sp = await searchParams;
  const sort: Sort =
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

  const Ikon = k.ikon;
  const sortDef: { id: Sort; navn: string }[] = [
    { id: "populaer", navn: "Populært" },
    { id: "mest-leste", navn: "Mest leste" },
    { id: "dato", navn: "Nyeste" },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-12">
      <Link
        href="/portal/meg/help"
        className="inline-flex items-center gap-1 text-[12px] font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft size={14} strokeWidth={1.75} />
        Tilbake til hjelp
      </Link>

      {/* Hero */}
      <header className="flex flex-col items-center gap-6 pt-2 text-center">
        <div
          className={`grid h-16 w-16 place-items-center rounded-2xl ${k.iconBg} ${k.iconFg}`}
        >
          <Ikon size={28} strokeWidth={1.75} />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          PlayerHQ · Hjelp · {k.italic}
        </span>
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium leading-tight tracking-tight">
          {k.navn && <span className="font-semibold">{k.navn} </span>}
          <em className="italic text-primary font-normal">{k.italic}</em>
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
          {k.beskrivelse}
        </p>
        <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
          {k.artikler.length} artikler · sist oppdatert {formatDato(
            k.artikler.reduce(
              (max, a) => (a.oppdatert > max ? a.oppdatert : max),
              k.artikler[0]?.oppdatert ?? "2026-01-01",
            ),
          )}
        </div>
      </header>

      {/* Sort-filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Sortér
        </span>
        {sortDef.map((s) => {
          const aktiv = s.id === sort;
          return (
            <Link
              key={s.id}
              href={
                s.id === "populaer"
                  ? `/portal/meg/help/kategori/${k.slug}`
                  : `/portal/meg/help/kategori/${k.slug}?sort=${s.id}`
              }
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition-colors ${
                aktiv
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-primary/40"
              }`}
            >
              {s.navn}
            </Link>
          );
        })}
      </div>

      {/* Artikkel-liste */}
      <ul className="overflow-hidden rounded-lg border border-border bg-card">
        {sortert.map((a, i) => (
          <li
            key={a.slug}
            className="border-b border-border last:border-0"
          >
            <Link
              href={`/portal/meg/help/artikkel/${a.slug}`}
              className="flex items-start gap-4 px-5 py-5 transition-colors hover:bg-secondary/40"
            >
              <span className="w-8 shrink-0 pt-1 font-mono text-xs font-semibold tabular-nums text-muted-foreground">
                {(i + 1).toString().padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-[15px] font-semibold leading-snug text-foreground">
                  {a.tittel}
                </h3>
                <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
                  {a.preview}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Clock size={11} strokeWidth={1.75} />
                    {a.lesetid} min
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <TrendingUp size={11} strokeWidth={1.75} />
                    {a.visninger.toLocaleString("nb-NO")} visninger
                  </span>
                  <span>Oppdatert {formatDato(a.oppdatert)}</span>
                </div>
              </div>
              <ChevronRight
                size={18}
                strokeWidth={1.75}
                className="mt-1.5 shrink-0 text-muted-foreground"
              />
            </Link>
          </li>
        ))}
      </ul>

      {/* Send-spørsmål-CTA */}
      <section className="rounded-lg border border-border bg-gradient-to-br from-card to-secondary/40 p-8 text-center">
        <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-accent/30 text-foreground">
          <Mail size={18} strokeWidth={1.75} />
        </div>
        <h2 className="mt-4 font-display text-xl font-medium italic tracking-tight">
          Fant du ikke det du lette etter?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Send oss et spørsmål — vi svarer innen 24 timer på hverdager.
        </p>
        <Link
          href="/portal/meg/help/kontakt"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Mail size={14} strokeWidth={1.75} />
          Send oss et spørsmål
        </Link>
      </section>
    </div>
  );
}
