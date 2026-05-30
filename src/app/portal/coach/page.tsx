/**
 * /portal/coach — PlayerHQ Coach hub
 * Pixel-perfect: matcher Dashboard-pattern. Athletic-komponenter, ingen HubFrame.
 */

import Link from "next/link";
import {
  ArrowRight,
  Dumbbell,
  FileText,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
  User,
  Video,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";
import { AthleticCard } from "@/components/athletic/card";

export const dynamic = "force-dynamic";

type HubItem = {
  href?: string;
  icon: typeof MessageSquare;
  eyebrow: string;
  title: string;
  data: string;
  sub: string;
  cta: string;
  featured?: boolean;
};

const HUB_ITEMS: HubItem[] = [
  {
    href: "/portal/coach/melding",
    icon: MessageSquare,
    eyebrow: "01 · DIALOG",
    title: "Meldinger",
    data: "Ingen uleste",
    sub: "Send melding til coach når du har spørsmål eller trenger råd.",
    cta: "Åpne meldinger",
  },
  {
    href: "/portal/coach/notes",
    icon: FileText,
    eyebrow: "02 · OBSERVASJONER",
    title: "Notater",
    data: "Ingen notater enda",
    sub: "Coach legger inn notater etter økter for å spore utvikling.",
    cta: "Bla i notater",
  },
  {
    href: "/portal/coach/plans",
    icon: FileText,
    eyebrow: "03 · PROGRAM",
    title: "Planer",
    data: "Ingen aktive planer",
    sub: "Når coach lager en plan, vises den her med ukentlige økter.",
    cta: "Se planer",
  },
  {
    href: "/portal/coach/ovelser",
    icon: Dumbbell,
    eyebrow: "04 · TILDELT",
    title: "Øvelser",
    data: "Ingen tildelte øvelser",
    sub: "Coach tildeler øvelser og drills basert på SG-data og mål.",
    cta: "Åpne øvelser",
  },
  {
    href: "/portal/coach/videoer",
    icon: Video,
    eyebrow: "05 · INSTRUKSJON",
    title: "Videoer",
    data: "Ingen videoer enda",
    sub: "Instruksjons-videoer og swing-analyse blir lagt til her.",
    cta: "Bla i bibliotek",
  },
  {
    href: "/portal/coach/ai",
    icon: Sparkles,
    eyebrow: "06 · AI-CADDIE",
    title: "AI-assistanse",
    data: "Spør Caddie",
    sub: "Lokal coaching-AI trent på din profil og spillerdata.",
    cta: "Start samtale",
    featured: true,
  },
  {
    icon: User,
    eyebrow: "07 · PROFIL",
    title: "Min coach",
    data: "Ingen coach tildelt enda",
    sub: "Når du blir tildelt en hovedcoach vises profil og kontaktinfo her.",
    cta: "Se profil",
  },
  {
    href: "/portal/onskeligokt",
    icon: Send,
    eyebrow: "08 · ØNSKE",
    title: "Be om økt",
    data: "Send forespørsel",
    sub: "Be om en time. Coach svarer typisk innen 4 timer.",
    cta: "Skriv ønske",
  },
];

export default async function CoachHubPage() {
  await requirePortalUser();

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-6 sm:py-8 md:px-6 lg:space-y-12 lg:px-8">
      {/* Header */}
      <header className="space-y-4">
        <AthleticEyebrow tone="lime">PLAYERHQ · COACH</AthleticEyebrow>
        <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
          Din <em className="font-normal italic text-primary">coach</em>
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground">
          Meldinger, notater, planer og videoer fra coachen din.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/portal/coach/melding"
            className="inline-flex h-11 items-center gap-1.5 rounded-md border border-primary bg-transparent px-6 text-sm font-semibold text-primary transition hover:bg-primary/5"
          >
            <MessageSquare size={14} strokeWidth={1.75} aria-hidden />
            Meldinger
          </Link>
          <Link
            href="/portal/coach/melding/ny"
            className="inline-flex h-11 items-center gap-1.5 rounded-full bg-accent px-6 text-sm font-bold text-primary shadow-[0_6px_14px_rgba(209,248,67,0.25)] transition hover:brightness-105"
          >
            <Plus size={14} strokeWidth={2} aria-hidden />
            Ny melding
          </Link>
        </div>
      </header>

      {/* Hub-cards */}
      <section
        aria-label="Coach-verktøy"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {HUB_ITEMS.map((item) => {
          const Icon = item.icon;
          const inner = (
            <AthleticCard
              className={`h-full transition-colors ${
                item.featured
                  ? "border-primary bg-primary/5"
                  : "hover:border-primary/50"
              }`}
            >
              <div className="flex h-full flex-col gap-4">
                <div className="flex items-start justify-between gap-2">
                  <div
                    className={`grid h-10 w-10 place-items-center rounded-md ${
                      item.featured
                        ? "bg-accent text-primary"
                        : "bg-secondary text-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden />
                  </div>
                  <AthleticEyebrow>{item.eyebrow}</AthleticEyebrow>
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold tracking-tight">
                    {item.title}
                  </h2>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                    {item.data}
                  </p>
                </div>
                <p className="flex-1 text-sm text-muted-foreground">
                  {item.sub}
                </p>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  {item.cta}
                  <ArrowRight size={14} strokeWidth={2} aria-hidden />
                </span>
              </div>
            </AthleticCard>
          );

          return item.href ? (
            <Link key={item.title} href={item.href} className="block">
              {inner}
            </Link>
          ) : (
            <div key={item.title}>{inner}</div>
          );
        })}
      </section>
    </div>
  );
}
