/**
 * /portal/meg — PlayerHQ Min profil hub
 * Pixel-perfect: matcher Dashboard-pattern. Athletic-komponenter, ingen HubFrame.
 */

import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  CalendarCheck,
  CreditCard,
  FileText,
  HeartPulse,
  HelpCircle,
  Settings,
  Shield,
  User,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";
import { AthleticCard } from "@/components/athletic/card";

export const dynamic = "force-dynamic";

type HubItem = {
  href: string;
  icon: typeof User;
  eyebrow: string;
  title: string;
  data: string;
  sub: string;
  cta: string;
};

const HUB_ITEMS: HubItem[] = [
  {
    href: "/portal/meg/profil/rediger",
    icon: User,
    eyebrow: "01 · IDENTITET",
    title: "Profil",
    data: "Bilde + navn",
    sub: "Synlig for coach og foreldre",
    cta: "Rediger",
  },
  {
    href: "/portal/meg/innstillinger",
    icon: Settings,
    eyebrow: "02 · PREFERANSER",
    title: "Innstillinger",
    data: "Personvern, varsler, språk",
    sub: "Tilpass hvordan PlayerHQ varsler og lagrer data om deg.",
    cta: "Åpne",
  },
  {
    href: "/portal/meg/sikkerhet",
    icon: Shield,
    eyebrow: "03 · KONTO",
    title: "Sikkerhet",
    data: "Passord + 2FA",
    sub: "Beskytt kontoen med to-faktor-autentisering.",
    cta: "Administrer",
  },
  {
    href: "/portal/meg/abonnement",
    icon: CreditCard,
    eyebrow: "04 · BETALING",
    title: "Abonnement",
    data: "Se status",
    sub: "Abonnementstype, betalingskort og fakturahistorikk.",
    cta: "Administrer",
  },
  {
    href: "/portal/meg/bookinger",
    icon: CalendarCheck,
    eyebrow: "05 · TIMER",
    title: "Bookinger",
    data: "Ingen kommende",
    sub: "Oversikt over kommende og tidligere coaching-timer.",
    cta: "Se bookinger",
  },
  {
    href: "/portal/meg/helse",
    icon: HeartPulse,
    eyebrow: "06 · KROPP",
    title: "Helse",
    data: "Logg din status",
    sub: "Spor søvn, HR-hvile og skader for å hjelpe coach planlegge.",
    cta: "Logg ny",
  },
  {
    href: "/portal/meg/utstyrsbag",
    icon: Briefcase,
    eyebrow: "07 · UTSTYR",
    title: "Utstyrsbag",
    data: "Ingen køller registrert",
    sub: "Hold oversikt over driver, jern, wedges og putter.",
    cta: "Åpne bag",
  },
  {
    href: "/portal/meg/dokumenter",
    icon: FileText,
    eyebrow: "08 · ARKIV",
    title: "Dokumenter",
    data: "Ingen dokumenter enda",
    sub: "Kontrakter, forsikring og reise-dokumenter samlet ett sted.",
    cta: "Se arkiv",
  },
  {
    href: "/portal/meg/help",
    icon: HelpCircle,
    eyebrow: "09 · HJELP",
    title: "Hjelp",
    data: "Søk i hjelp-senter",
    sub: "Artikler og kontakt med AK-support.",
    cta: "Åpne hjelp",
  },
];

export default async function MegPage() {
  const user = await requirePortalUser();
  const fornavn = user.name?.split(" ")[0] ?? "deg";

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-6 sm:py-8 md:px-6 lg:space-y-12 lg:px-8">
      {/* Header */}
      <header className="space-y-4">
        <AthleticEyebrow tone="lime">PLAYERHQ · MIN PROFIL</AthleticEyebrow>
        <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
          Hei, <em className="font-normal italic text-primary">{fornavn}.</em>
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground">
          Bilde, navn og kontaktinfo — samt alt du eier i appen.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/portal/meg/profil/rediger"
            className="inline-flex h-11 items-center gap-1.5 rounded-md border border-primary bg-transparent px-6 text-sm font-semibold text-primary transition hover:bg-primary/5"
          >
            <User size={14} strokeWidth={1.75} aria-hidden />
            Rediger profil
          </Link>
        </div>
      </header>

      {/* Hub-cards */}
      <section
        aria-label="Min profil"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {HUB_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.title} href={item.href} className="block">
              <AthleticCard className="h-full transition-colors hover:border-primary/50">
                <div className="flex h-full flex-col gap-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="grid h-10 w-10 place-items-center rounded-md bg-secondary text-foreground">
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
            </Link>
          );
        })}
      </section>
    </div>
  );
}
