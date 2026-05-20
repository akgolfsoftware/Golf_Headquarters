/**
 * PlayerHQ · Meg · Hjelp
 *
 * Migrert til endelig design (wireframe/design-files-v2/final/11-hjelp.html).
 * Search-driven hjelp-senter med stort søkefelt, kategori-grid, populære artikler
 * og mørk kontakt-card. Italic Instrument Serif hero "Hva lurer du på?".
 */
import {
  Sparkles,
  Dumbbell,
  Headphones,
  Calendar,
  Settings,
  ChevronRight,
  MessageCircle,
  Mail,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { HelpSearch } from "./help-search";

type Kategori = {
  slug: string;
  navn: string;
  artikler: number;
  ikon: LucideIcon;
  ikonBg: string;
  ikonFg: string;
};

const KATEGORIER: Kategori[] = [
  {
    slug: "komme-i-gang",
    navn: "Komme i gang",
    artikler: 8,
    ikon: Sparkles,
    ikonBg: "bg-primary/10",
    ikonFg: "text-primary",
  },
  {
    slug: "trening",
    navn: "Trening",
    artikler: 14,
    ikon: Dumbbell,
    ikonBg: "bg-pyr-tek/15",
    ikonFg: "text-pyr-tek",
  },
  {
    slug: "coaching",
    navn: "Coaching",
    artikler: 12,
    ikon: Headphones,
    ikonBg: "bg-pyr-slag/30",
    ikonFg: "text-pyr-spill",
  },
  {
    slug: "booking",
    navn: "Booking + betaling",
    artikler: 9,
    ikon: Calendar,
    ikonBg: "bg-destructive/15",
    ikonFg: "text-destructive",
  },
  {
    slug: "konto",
    navn: "Kontoinnstillinger",
    artikler: 6,
    ikon: Settings,
    ikonBg: "bg-secondary",
    ikonFg: "text-foreground",
  },
];

const POPULAERE = [
  {
    tittel: "Hva er pyramide-systemet?",
    kategori: "Trening",
    min: 5,
  },
  {
    tittel: "Slik bytter du coach",
    kategori: "Coaching",
    min: 2,
  },
  {
    tittel: "Hva betyr SG-tallene?",
    kategori: "Runder",
    min: 4,
  },
  {
    tittel: "Hvordan oppgrader til Pro?",
    kategori: "Konto",
    min: 2,
  },
  {
    tittel: "Logg din første runde",
    kategori: "Komme i gang",
    min: 3,
  },
];

export default async function HelpPage() {
  await requirePortalUser();
  const totalArtikler = KATEGORIER.reduce((sum, k) => sum + k.artikler, 0);

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-20 md:space-y-12 md:pb-0">
      {/* Hero med stort søkefelt */}
      <section className="flex flex-col items-center gap-6 pt-4 text-center">
        <span
          aria-hidden="true"
          className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground"
        >
          PlayerHQ · /meg/hjelp
        </span>
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-normal italic leading-tight tracking-tight">
          <span className="not-italic font-semibold">Hva</span> lurer du på?
        </h1>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          Søk i hjelp-artikler, eller spør direkte. Vi svarer innen 24 timer på
          hverdager.
        </p>

        <HelpSearch />
      </section>

      {/* Kategorier */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-medium italic tracking-tight">
            Kategorier
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
            {totalArtikler} artikler totalt
          </span>
        </div>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {KATEGORIER.map((k) => {
            const Ikon = k.ikon;
            return (
              <li
                key={k.slug}
                className="group flex cursor-pointer flex-col gap-2 rounded-lg border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
              >
                <div
                  className={`grid h-10 w-10 place-items-center rounded-md ${k.ikonBg} ${k.ikonFg}`}
                >
                  <Ikon size={20} strokeWidth={1.75} aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-display text-base font-semibold tracking-tight">
                    {k.navn}
                  </h3>
                  <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
                    {k.artikler} artikler
                  </div>
                </div>
                <div className="mt-auto flex justify-end pt-2 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Åpne →
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Populære artikler */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-medium italic tracking-tight">
            Populære artikler
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
            Mest leste denne måneden
          </span>
        </div>
        <ul className="overflow-hidden rounded-lg border border-border bg-card">
          {POPULAERE.map((a, i) => (
            <li
              key={a.tittel}
              className="flex items-center gap-4 border-b border-border/60 px-4 py-4 transition-colors last:border-0 hover:bg-muted/30"
            >
              <span className="w-8 font-mono text-xs font-semibold text-muted-foreground">
                {(i + 1).toString().padStart(2, "0")}
              </span>
              <span className="flex-1 text-sm font-medium text-foreground">
                {a.tittel}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
                {a.kategori} · {a.min} min
              </span>
              <ChevronRight
                size={16}
                strokeWidth={1.75}
                className="text-muted-foreground"
                aria-hidden="true"
              />
            </li>
          ))}
        </ul>
      </section>

      {/* Kontakt — mørk card */}
      <section className="rounded-lg bg-gradient-to-br from-foreground to-card p-4 text-white sm:p-6 md:p-8">
        <h2 className="text-center font-display text-2xl font-normal italic leading-tight tracking-tight text-white">
          <span className="not-italic font-semibold">Trenger du</span> mer hjelp?
        </h2>
        <p className="mt-2 text-center font-mono text-xs text-white/70">
          Vi er her — velg det som passer deg
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <KontaktCard
            ikon={MessageCircle}
            tittel="Chat med oss"
            sub="Svar innen 24 timer på hverdager"
            cta="Start chat →"
          />
          <KontaktCard
            ikon={Mail}
            tittel="Send e-post"
            sub="support@akgolf.no · svar innen 24t"
            cta="Skriv e-post →"
            href="mailto:support@akgolf.no"
          />
          <KontaktCard
            ikon={Users}
            tittel="Be coachen din"
            sub="Send melding direkte til din coach"
            cta="Åpne meldinger →"
          />
        </div>
      </section>
    </div>
  );
}

function KontaktCard({
  ikon: Ikon,
  tittel,
  sub,
  cta,
  href,
}: {
  ikon: LucideIcon;
  tittel: string;
  sub: string;
  cta: string;
  href?: string;
}) {
  const innhold = (
    <>
      <div className="grid h-9 w-9 place-items-center rounded-md bg-accent/15 text-accent">
        <Ikon size={18} strokeWidth={1.75} aria-hidden="true" />
      </div>
      <h4 className="font-display text-base font-semibold text-white">
        {tittel}
      </h4>
      <p className="font-mono text-[11px] leading-snug text-white/60">
        {sub}
      </p>
      <span className="mt-auto inline-flex items-center text-xs font-semibold text-accent">
        {cta}
      </span>
    </>
  );

  const className =
    "flex flex-col gap-2 rounded-md border border-white/10 bg-white/[0.04] p-4 transition-colors hover:border-accent/40 hover:bg-white/[0.08]";

  return href ? (
    <a href={href} className={className}>
      {innhold}
    </a>
  ) : (
    <button type="button" className={`${className} text-left`}>
      {innhold}
    </button>
  );
}
