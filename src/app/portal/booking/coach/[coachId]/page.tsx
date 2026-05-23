/**
 * PlayerHQ · Book direkte med coach (sesjon 2 · pixel-perfect)
 *
 * Spec: BATCH PR3 · Skjerm 3.2
 * - Coach-hero med bilde, navn, spesialitet, neste-ledig
 * - Service-pris-liste (60min/90min/gruppe/test/TrackMan)
 * - Date-picker med ledig-prikker
 * - Booking-form med credit-check (PRO) eller Stripe-checkout
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  Clock,
  CreditCard,
  MapPin,
  Shield,
  Star,
  Users,
  Zap,
} from "lucide-react";

type Props = {
  params: Promise<{ coachId: string }>;
};

type CoachData = {
  navn: string;
  initialer: string;
  rolle: string;
  bio: string;
  rating: string;
  elever: number;
  erfaring: string;
  tags: string[];
  lokasjoner: string[];
  nesteLedig: string;
};

const COACHES: Record<string, CoachData> = {
  anders: {
    navn: "Anders Kristiansen",
    initialer: "AK",
    rolle: "Head Coach · AK Golf Academy",
    bio: "Spesialitet: TrackMan-tall + scoring + mental struktur som holder under press. Passer best for golfere som er klare for målbar progresjon og vil ha en plan å jobbe ut fra. 15 år som hovedcoach på GFGK og Miklagard.",
    rating: "4,9",
    elever: 38,
    erfaring: "15 år",
    tags: ["Teknikk", "Slagspill", "Spillestrategi", "Turnering"],
    lokasjoner: ["GFGK Performance Studio", "Miklagard Golf Studio"],
    nesteLedig: "I morgen · 14:00",
  },
  markus: {
    navn: "Markus Røinås Pedersen",
    initialer: "MR",
    rolle: "Sportslig leder junior · GFGK",
    bio: "Tålmodig og lekent fokus på grunnleggende mekanikk. Den ideelle starten hvis du er ny til golfen eller har høyt handicap og vil bygge fundamentet riktig.",
    rating: "4,8",
    elever: 18,
    erfaring: "4 år",
    tags: ["Teknikk", "Fysikk", "Spillestrategi"],
    lokasjoner: ["GFGK Performance Studio"],
    nesteLedig: "I dag · 17:30",
  },
  junior: {
    navn: "Junior-teamet",
    initialer: "JR",
    rolle: "Junior coaches · GFGK",
    bio: "Felles-økter for utviklingsspillere 12–17 år. Strukturert oppvarming, drill-økter etter aldersplan, og minisspill mot slutten av timen.",
    rating: "4,7",
    elever: 24,
    erfaring: "8 år samlet",
    tags: ["Junior", "Gruppe", "Teknikk"],
    lokasjoner: ["GFGK Range", "Performance Studio"],
    nesteLedig: "Torsdag · 16:00",
  },
};

type Service = {
  id: string;
  navn: string;
  varighet: string;
  beskrivelse: string;
  prisOre: number;
  credits?: number;
  pill?: string;
};

const SERVICES: Service[] = [
  {
    id: "privat-60",
    navn: "Privattime 60 min",
    varighet: "60 min",
    beskrivelse: "Én-til-én med TrackMan-analyse og videogjennomgang.",
    prisOre: 90000,
    credits: 2,
    pill: "Mest populær",
  },
  {
    id: "privat-90",
    navn: "Privattime 90 min",
    varighet: "90 min",
    beskrivelse: "Lengre økt for dypere arbeid og to fokusområder.",
    prisOre: 130000,
    credits: 3,
  },
  {
    id: "gruppe",
    navn: "Gruppetime",
    varighet: "60 min",
    beskrivelse: "Maks 4 spillere. Sosialt og kostnadseffektivt.",
    prisOre: 24900,
  },
  {
    id: "test",
    navn: "Test/diagnose",
    varighet: "45 min",
    beskrivelse: "Strukturert utgangs-måling med rapport.",
    prisOre: 70000,
    credits: 2,
  },
  {
    id: "trackman",
    navn: "TrackMan-bay (drop-in)",
    varighet: "60 min",
    beskrivelse: "Egen-trening med TrackMan-data, uten coach.",
    prisOre: 35000,
  },
];

function getWeekDays() {
  const dager = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
  const base = new Date();
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const dagIdx = (d.getDay() + 6) % 7;
    // Faux ledig-pattern
    const ledige = ((i + 1) * 3) % 6;
    return {
      dag: dager[dagIdx],
      dato: d.getDate(),
      ledige,
      erIDag: i === 0,
      erValgt: i === 1,
    };
  });
}

const TIDER = ["08:00", "09:30", "11:00", "13:00", "14:30", "16:00", "17:30"];

export default async function BookingCoachPage({ params }: Props) {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const { coachId } = await params;
  const coach = COACHES[coachId];
  if (!coach) notFound();

  const dager = getWeekDays();
  const harProAbonnement = user.tier !== "GRATIS";
  const availableCredits = harProAbonnement ? 3 : 0;

  return (
    <div className="mx-auto max-w-[1240px] space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <Link
        href="/portal/booking"
        className="inline-flex items-center gap-1.5 font-mono text-[12px] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Tilbake til booking
      </Link>

      {/* HERO */}
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-7">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[auto_1fr_auto] lg:items-start">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-primary font-display text-[26px] font-semibold text-primary-foreground sm:h-24 sm:w-24 sm:text-[30px]">
            {coach.initialer}
          </div>
          <div className="flex flex-col gap-2">
            <div className="font-mono text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              {coach.rolle}
            </div>
            <h1 className="font-display text-[28px] font-medium leading-[1.1] -tracking-[0.02em] text-foreground sm:text-[34px]">
              {coach.navn}
            </h1>
            <p className="max-w-[640px] font-sans text-[14px] leading-[1.55] text-muted-foreground">
              {coach.bio}
            </p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {coach.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-secondary px-2 py-0.5 font-mono text-[10.5px] font-medium text-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2 rounded-xl bg-primary p-4 text-primary-foreground sm:min-w-[200px]">
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] opacity-70">
              Neste ledig
            </div>
            <div className="font-display text-[18px] font-semibold -tracking-[0.01em]">
              {coach.nesteLedig}
            </div>
            <div className="mt-1 grid grid-cols-3 gap-1.5 text-center">
              <div>
                <div className="flex items-center justify-center gap-0.5 font-mono text-[13px] font-semibold tabular-nums">
                  <Star className="h-3 w-3 fill-current" strokeWidth={0} />
                  {coach.rating}
                </div>
                <div className="font-mono text-[9px] uppercase opacity-70">
                  Rating
                </div>
              </div>
              <div>
                <div className="font-mono text-[13px] font-semibold tabular-nums">
                  {coach.elever}
                </div>
                <div className="font-mono text-[9px] uppercase opacity-70">
                  Elever
                </div>
              </div>
              <div>
                <div className="font-mono text-[13px] font-semibold tabular-nums">
                  {coach.erfaring}
                </div>
                <div className="font-mono text-[9px] uppercase opacity-70">
                  Erfaring
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        {/* VENSTRE: tjenester + datepicker */}
        <div className="space-y-6">
          {/* SERVICE-LISTE */}
          <section>
            <h2 className="mb-3 font-display text-[18px] font-semibold -tracking-[0.01em] text-foreground">
              Velg type økt
            </h2>
            <div className="flex flex-col gap-2.5">
              {SERVICES.map((s, i) => (
                <button
                  key={s.id}
                  className={`group relative flex items-center gap-4 rounded-xl border bg-card p-4 text-left transition-colors hover:border-foreground/30 ${
                    i === 0 ? "border-primary" : "border-border"
                  }`}
                >
                  {s.pill && (
                    <span className="absolute -top-2 right-4 rounded-full bg-accent px-2 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.06em] text-accent-foreground">
                      {s.pill}
                    </span>
                  )}
                  <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-secondary">
                    <Clock
                      className="h-4 w-4 text-foreground"
                      strokeWidth={1.75}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-[15px] font-semibold -tracking-[0.005em] text-foreground">
                        {s.navn}
                      </h3>
                      <span className="font-mono text-[10.5px] text-muted-foreground">
                        · {s.varighet}
                      </span>
                    </div>
                    <p className="mt-0.5 font-sans text-[12.5px] leading-[1.4] text-muted-foreground">
                      {s.beskrivelse}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[15px] font-semibold text-foreground tabular-nums">
                      {(s.prisOre / 100).toLocaleString("nb-NO")} kr
                    </div>
                    {s.credits && (
                      <div className="mt-0.5 inline-flex items-center gap-1 rounded bg-accent/40 px-1.5 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.06em] text-foreground">
                        <Zap className="h-2.5 w-2.5" strokeWidth={2.5} />
                        {s.credits} credits
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* DATE-PICKER */}
          <section>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="font-display text-[18px] font-semibold -tracking-[0.01em] text-foreground">
                Velg dato
              </h2>
              <span className="font-mono text-[11px] text-muted-foreground">
                Neste 14 dager
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {dager.map((d, i) => (
                <button
                  key={i}
                  disabled={d.ledige === 0}
                  className={`group flex flex-col items-center gap-1 rounded-xl border p-2.5 transition-all ${
                    d.erValgt
                      ? "border-primary bg-primary text-primary-foreground"
                      : d.ledige === 0
                        ? "border-border bg-secondary/40 opacity-40"
                        : "border-border bg-card hover:border-foreground/30"
                  }`}
                >
                  <div
                    className={`font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] ${d.erValgt ? "opacity-80" : "text-muted-foreground"}`}
                  >
                    {d.dag}
                  </div>
                  <div
                    className={`font-display text-[18px] font-semibold tabular-nums ${d.erValgt ? "" : "text-foreground"}`}
                  >
                    {d.dato}
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: Math.min(d.ledige, 4) }).map((_, j) => (
                      <span
                        key={j}
                        className={`h-1 w-1 rounded-full ${d.erValgt ? "bg-accent" : "bg-primary/60"}`}
                      />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* TIDER */}
          <section>
            <h2 className="mb-3 font-display text-[18px] font-semibold -tracking-[0.01em] text-foreground">
              Ledige tider · i morgen
            </h2>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-7">
              {TIDER.map((t, i) => (
                <button
                  key={t}
                  className={`rounded-md border py-2.5 font-mono text-[12.5px] font-semibold tabular-nums transition-colors ${
                    i === 2
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:border-foreground/30"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* HØYRE: oppsummering / sticky */}
        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-3 font-mono text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Din booking
            </div>
            <div className="space-y-2.5">
              <Row label="Coach" value={coach.navn} />
              <Row label="Type" value="Privattime 60 min" />
              <Row label="Dato" value="I morgen" />
              <Row label="Tid" value="11:00" />
              <Row label="Sted" value={coach.lokasjoner[0]} />
            </div>
            <div className="my-4 border-t border-border" />
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[11px] text-muted-foreground">
                Pris
              </span>
              <span className="font-display text-[24px] font-semibold text-foreground tabular-nums">
                900 kr
              </span>
            </div>

            {harProAbonnement ? (
              <div className="mt-4 rounded-xl bg-accent/40 p-3">
                <div className="flex items-start gap-2">
                  <Zap
                    className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-foreground"
                    strokeWidth={2}
                  />
                  <div>
                    <div className="font-sans text-[13px] font-semibold text-foreground">
                      Bruk credits fra PRO
                    </div>
                    <div className="font-mono text-[10.5px] text-muted-foreground">
                      Du har {availableCredits} av 4 igjen denne mnd.
                    </div>
                  </div>
                </div>
                <button className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 font-sans text-[14px] font-semibold text-primary-foreground hover:opacity-90">
                  Bekreft med 2 credits
                  <ChevronRight className="h-4 w-4" strokeWidth={2} />
                </button>
                <button className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-2.5 font-sans text-[12.5px] font-medium text-foreground hover:border-foreground/30">
                  Betal med kort i stedet
                </button>
              </div>
            ) : (
              <>
                <button className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 font-sans text-[14px] font-semibold text-primary-foreground hover:opacity-90">
                  <CreditCard className="h-4 w-4" strokeWidth={2} />
                  Betal med Stripe
                </button>
                <Link
                  href="/portal/meg/abonnement/oppgrader"
                  className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-accent bg-accent/30 px-4 py-2.5 font-sans text-[12.5px] font-semibold text-foreground hover:bg-accent/50"
                >
                  <Zap className="h-3.5 w-3.5" strokeWidth={2} />
                  Bli PRO og spar 25%
                </Link>
              </>
            )}

            <div className="mt-4 flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
              <Shield className="h-3 w-3" strokeWidth={2} />
              Gratis avbestilling 24t før
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-2 font-mono text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Anlegg
            </div>
            <ul className="space-y-1.5">
              {coach.lokasjoner.map((l) => (
                <li
                  key={l}
                  className="flex items-center gap-1.5 font-sans text-[12.5px] text-foreground"
                >
                  <MapPin
                    className="h-3.5 w-3.5 text-muted-foreground"
                    strokeWidth={1.75}
                  />
                  {l}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="font-mono text-[11px] text-muted-foreground">{label}</span>
      <span className="font-sans text-[13px] font-medium text-foreground text-right">
        {value}
      </span>
    </div>
  );
}
