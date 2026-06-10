/**
 * AgencyOS — Hjelp + support
 * Design migrert fra wireframe/design-files-v2/final/11-hjelp.html.
 *
 * Search-driven help-center med 5 kategorier, populære artikler og kontakt-CTA.
 * Statisk innhold — ingen database-spørringer.
 */

import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  CreditCard,
  GraduationCap,
  Mail,
  MessageCircle,
  Settings,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AdminHero as PageHeader } from "@/components/admin/admin-hero";
import { HjelpSearch, type HelpArticle } from "./hjelp-search";

const CATEGORIES: ReadonlyArray<{
  id: string;
  title: string;
  count: number;
  icon: LucideIcon;
  tone: "primary" | "blue" | "yellow" | "red" | "gray";
}> = [
  { id: "komme-i-gang", title: "Komme i gang", count: 8, icon: Sparkles, tone: "primary" },
  { id: "trening", title: "Trening", count: 14, icon: Target, tone: "blue" },
  { id: "coaching", title: "Coaching", count: 12, icon: GraduationCap, tone: "yellow" },
  { id: "booking-betaling", title: "Booking + betaling", count: 9, icon: CreditCard, tone: "red" },
  { id: "kontoinnstillinger", title: "Kontoinnstillinger", count: 6, icon: Settings, tone: "gray" },
];

const ARTICLES: ReadonlyArray<HelpArticle> = [
  {
    id: "logg-runde-golfbox",
    title: "Hvordan logger jeg en runde fra GolfBox?",
    category: "Trening",
    readMin: 3,
    snippet:
      "Eksporter scorekort som CSV fra GolfBox, last opp i PlayerHQ og runden registreres automatisk på spilleren.",
  },
  {
    id: "pyramide-fokus",
    title: "Hva er pyramide-fokus?",
    category: "Trening",
    readMin: 5,
    snippet:
      "Pyramide-fokus er AK Golf sin treningsmodell — bredt fundament av basistreninger, smalere topp med konkurransesimulering.",
  },
  {
    id: "bytt-coach",
    title: "Slik bytter du coach",
    category: "Coaching",
    readMin: 2,
    snippet:
      "Be om bytte fra profilsiden. Nåværende coach får varsel, ny coach matcher etter tilgjengelighet og sertifisering.",
  },
  {
    id: "pro-vs-elite",
    title: "Pro vs Elite — hva er forskjellen?",
    category: "Konto",
    readMin: 4,
    snippet:
      "Pro inkluderer 4 credits/mnd og digital coaching. Elite-tier er pauset — kontakt support for skreddersydd opplegg.",
  },
  {
    id: "live-session",
    title: "Slik bruker du Live Session",
    category: "Coaching",
    readMin: 6,
    snippet:
      "Live Session lar coach og spiller dele Trackman-data i sanntid. Krever Pro-abonnement og oppdatert mobilapp.",
  },
];

export default async function HjelpAdmin() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const totalArticles = CATEGORIES.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="AgencyOS · /admin/hjelp"
        titleLead="Hva"
        titleItalic="lurer du på?"
        sub="Søk i hjelp-artikler, eller spør direkte. Vi svarer innen 1 time på hverdager."
      />

      {/* Søkefelt + foreslåtte spørringer */}
      <HjelpSearch articles={ARTICLES} />

      {/* Kategorier */}
      <section aria-labelledby="kategorier-heading">
        <div className="mb-4 flex items-baseline justify-between">
          <h2
            id="kategorier-heading"
            className="font-display text-xl font-semibold italic text-foreground"
          >
            Kategorier
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
            {totalArticles} artikler totalt
          </span>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      {/* Populære artikler */}
      <section aria-labelledby="populaere-heading">
        <div className="mb-4 flex items-baseline justify-between">
          <h2
            id="populaere-heading"
            className="font-display text-xl font-semibold italic text-foreground"
          >
            Populære artikler
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
            Sett 1 247 ganger denne måneden
          </span>
        </div>
        <ul className="overflow-hidden rounded-lg border border-border bg-card">
          {ARTICLES.map((article, index) => (
            <li
              key={article.id}
              className="border-b border-border last:border-b-0"
            >
              <Link
                href={`#${article.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-secondary"
              >
                <span className="font-mono text-[12px] font-semibold tabular-nums text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 text-sm font-medium text-foreground">
                  {article.title}
                </span>
                <span className="hidden font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground sm:inline">
                  {article.category} · {article.readMin} min
                </span>
                <ChevronRight
                  size={14}
                  strokeWidth={1.75}
                  className="text-muted-foreground"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Kontakt-CTA */}
      <section
        aria-labelledby="kontakt-heading"
        className="rounded-2xl bg-foreground p-8 text-white"
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h2
            id="kontakt-heading"
            className="font-display text-2xl font-semibold"
          >
            <span>Trenger du </span>
            <em className="font-normal italic">mer hjelp?</em>
          </h2>
          <p className="font-mono text-[12px] text-white/70">
            Vi er her — velg det som passer deg
          </p>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <ContactCard
            icon={MessageCircle}
            title="Chat med oss"
            sub="Svar innen 1 time på hverdager. Aktiv nå."
            cta="Start chat"
            href="/admin/innboks"
          />
          <ContactCard
            icon={Mail}
            title="Send e-post"
            sub="support@akgolf.no · svar innen 24t"
            cta="Skriv e-post"
            href="mailto:support@akgolf.no"
          />
          <ContactCard
            icon={Users}
            title="Be coachen din"
            sub="Send en melding direkte i innboksen"
            cta="Åpne meldinger"
            href="/admin/messages"
          />
        </div>
      </section>

      <p className="text-[12px] text-muted-foreground">
        Hjelp-innholdet er statisk og vedlikeholdes manuelt — kontakt support
        dersom en artikkel mangler eller er utdatert.
      </p>
    </div>
  );
}

// ----------------- Komponenter -----------------

function CategoryCard({
  category,
}: {
  category: (typeof CATEGORIES)[number];
}) {
  const Icon = category.icon;
  const toneClasses: Record<typeof category.tone, string> = {
    primary: "bg-primary/10 text-primary",
    blue: "bg-secondary text-foreground",
    yellow: "bg-accent/30 text-accent-foreground",
    red: "bg-destructive/15 text-destructive",
    gray: "bg-secondary text-muted-foreground",
  };

  return (
    <Link
      href={`#${category.id}`}
      className="group flex flex-col gap-2 rounded-lg border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-lg"
    >
      <span
        aria-hidden="true"
        className={`grid h-10 w-10 place-items-center rounded-md ${toneClasses[category.tone]}`}
      >
        <Icon size={18} strokeWidth={1.75} />
      </span>
      <h3 className="mt-2 font-display text-base font-semibold text-foreground">
        {category.title}
      </h3>
      <div className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
        {category.count} artikler
      </div>
      <div className="mt-2 flex justify-end text-[12px] font-medium text-primary">
        Åpne
        <ArrowRight size={12} strokeWidth={1.75} className="ml-1" aria-hidden="true" />
      </div>
    </Link>
  );
}

function ContactCard({
  icon: Icon,
  title,
  sub,
  cta,
  href,
}: {
  icon: LucideIcon;
  title: string;
  sub: string;
  cta: string;
  href: string;
}) {
  const isMail = href.startsWith("mailto:");
  const className =
    "group flex flex-col gap-2 rounded-lg border border-white/10 bg-white/5 p-4 transition-colors hover:border-accent/40 hover:bg-white/10";

  const content = (
    <>
      <span
        aria-hidden="true"
        className="grid h-10 w-10 place-items-center rounded-md bg-accent/15 text-accent"
      >
        <Icon size={18} strokeWidth={1.75} />
      </span>
      <h3 className="mt-2 font-display text-base font-semibold">{title}</h3>
      <p className="font-mono text-[11px] leading-snug text-white/60">{sub}</p>
      <div className="mt-2 flex items-center gap-1 text-[12px] font-semibold text-accent">
        {cta}
        <ArrowRight size={12} strokeWidth={1.75} aria-hidden="true" />
      </div>
    </>
  );

  if (isMail) {
    return (
      <a href={href} className={className}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}

