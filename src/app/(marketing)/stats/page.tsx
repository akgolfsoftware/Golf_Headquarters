/**
 * /stats — AK Golf Stats hub-landingsside
 *
 * Gratis, offentlig statistikkprodukt. Markedsføringsmotor for PlayerHQ.
 *
 * Struktur:
 *   1. Hero — verdiløfte
 *   2. Live snapshot — antall norske i aksjon denne uka, siste DataGolf-oppdatering
 *   3. 4 modul-kort (Turneringer / PGA-stats / Norske spillere / SG-sammenlign)
 *   4. PlayerHQ mersalg-bånd (midt på)
 *   5. "Slik bruker treneren det" — bro fra gratis stats til betalt verktøy
 *   6. Bunn-CTA (PlayerHQ-abonnement)
 *
 * Datakilder vises live: DataGolf siste sync + antall norske i aksjon.
 * Resten av modulene er teasere — selve sidene bygges i Fase 2-4.
 */

import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Flag,
  LineChart,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";

export const revalidate = 3600; // 1 time

export const metadata: Metadata = {
  title: "AK Golf Stats — gratis statistikk for norsk golf",
  description:
    "Følg norske golfspillere live, utforsk PGA Tour-statistikk og sammenlign din egen Strokes Gained med proffene. Gratis verktøy fra AK Golf — bygget for spillere, foreldre og trenere.",
  alternates: { canonical: "https://akgolf.no/stats" },
  openGraph: {
    title: "AK Golf Stats — gratis statistikk for norsk golf",
    description:
      "Norske spillere i aksjon, PGA Tour-tall, og din egen SG sammenlignet med Rory. Gratis fra AK Golf.",
    url: "https://akgolf.no/stats",
    type: "website",
  },
};

async function hentLiveSnapshot() {
  const now = new Date();
  const ukeStart = new Date(now);
  const dayOfWeek = now.getDay();
  const daysSinceMonday = (dayOfWeek + 6) % 7;
  ukeStart.setDate(ukeStart.getDate() - daysSinceMonday);
  ukeStart.setHours(0, 0, 0, 0);

  const ukeSlutt = new Date(ukeStart);
  ukeSlutt.setDate(ukeSlutt.getDate() + 7);

  const [norskeIAksjon, kommendeTurneringer, sisteDataGolfSync] = await Promise.all([
    // Norske spillere som spiller en turnering denne uka
    prisma.publicPlayerEntry.count({
      where: {
        player: { country: "NO" },
        tournament: {
          startDate: { lte: ukeSlutt },
          endDate: { gte: now },
        },
      },
    }),
    prisma.tournament.count({
      where: {
        startDate: { gte: now, lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) },
        mergedIntoId: null,
      },
    }),
    prisma.tournament.findFirst({
      where: { sourceOrigin: "DATAGOLF", lastSyncAt: { not: null } },
      orderBy: { lastSyncAt: "desc" },
      select: { lastSyncAt: true },
    }),
  ]);

  return {
    norskeIAksjon,
    kommendeTurneringer,
    sisteSyncDato: sisteDataGolfSync?.lastSyncAt ?? null,
  };
}

function formaterDatoKort(d: Date | null): string {
  if (!d) return "—";
  const diff = Date.now() - d.getTime();
  const timer = Math.floor(diff / (60 * 60 * 1000));
  if (timer < 1) return "nå nettopp";
  if (timer < 24) return `for ${timer} time${timer === 1 ? "" : "r"} siden`;
  const dager = Math.floor(timer / 24);
  return `for ${dager} dag${dager === 1 ? "" : "er"} siden`;
}

export default async function StatsLandingPage() {
  const snapshot = await hentLiveSnapshot();

  return (
    <div className="bg-background text-foreground">
      {/* HERO */}
      <section className="border-b border-border bg-gradient-to-b from-background to-secondary/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 md:py-24">
          <div className="text-center">
            <AthleticEyebrow tone="lime">AK Golf Stats</AthleticEyebrow>
            <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              All statistikken.{" "}
              <em className="font-normal italic text-primary">
                Gratis.
              </em>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-[16px] leading-[1.6] text-muted-foreground md:text-[18px]">
              Følg norske spillere på PGA Tour og amatørtourer, utforsk hva som
              skiller verdens beste fra resten, og sammenlign din egen Strokes
              Gained med proffene. Bygget av AK Golf — fordi god statistikk
              skal være tilgjengelig.
            </p>

            {/* Live snapshot-strip */}
            <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
              <SnapshotKort
                ikon={<Flag className="h-4 w-4" />}
                tall={snapshot.norskeIAksjon.toString()}
                label="Norske spillere i aksjon denne uka"
              />
              <SnapshotKort
                ikon={<Trophy className="h-4 w-4" />}
                tall={snapshot.kommendeTurneringer.toString()}
                label="Turneringer neste 30 dager"
              />
              <SnapshotKort
                ikon={<Zap className="h-4 w-4" />}
                tall={formaterDatoKort(snapshot.sisteSyncDato)}
                label="Siste DataGolf-oppdatering"
                liten
              />
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/turneringer"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                Se turneringer
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#moduler"
                className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-5 py-3 text-sm font-medium text-foreground hover:bg-secondary"
              >
                Utforsk alle verktøy
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* MODULER */}
      <section id="moduler" className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="text-center">
            <AthleticEyebrow tone="default">4 verktøy</AthleticEyebrow>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
              Statistikken du faktisk{" "}
              <em className="font-normal italic text-primary">trenger</em>.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
              Fire fokuserte verktøy. Ingen reklame, ingen popup-vegg.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            <ModulKort
              status="LIVE"
              ikon={<Trophy className="h-6 w-6" strokeWidth={1.5} />}
              tittel="Turneringer"
              undertittel="Hele kalenderen, alle tourer"
              tekst="PGA, DP World, LPGA, Korn Ferry, Challenge, og alle norske amatør- og juniortourer. Følg nordmenn live — uten innlogging."
              href="/turneringer"
              hrefLabel="Åpne turneringskalender"
              tag="Oppdateres daglig"
            />
            <ModulKort
              status="LIVE"
              ikon={<LineChart className="h-6 w-6" strokeWidth={1.5} />}
              tittel="PGA Tour Stats"
              undertittel="Hva er snittet egentlig?"
              tekst="Interaktiv stats-playground: drive distance, fairway %, GIR, putter og Strokes Gained. Lek deg med slidere og sammenlign deg selv med proffene."
              href="/stats/pga"
              hrefLabel="Utforsk PGA Tour Stats"
              tag="Oppdateres ukentlig"
            />
            <ModulKort
              status="KOMMER SNART"
              ikon={<Users className="h-6 w-6" strokeWidth={1.5} />}
              tittel="Norsk spillerbase"
              undertittel="Alle norske golfspillere"
              tekst="Søk opp deg selv, barnet ditt eller spillere du følger med på. Komplette resultater fra Srixon, Olyo, Norges Cup, Regionstour, NCAA og WAGR. Brutto runde-scores."
              href="/stats/spillere"
              hrefLabel="Få varsel når den åpner"
              tag="Stor lansering høst 2026"
              kommerSnart
            />
            <ModulKort
              status="KOMMER SNART"
              ikon={<Sparkles className="h-6 w-6" strokeWidth={1.5} />}
              tittel="SG-sammenligning"
              undertittel="Hvordan ligger du an mot Rory?"
              tekst="Legg inn din egen Strokes Gained og sammenlign med spillere fra topp 250 i verden. Få estimat på hva din norske snittscore tilsvarer på PGA Tour."
              href="/stats/sg-sammenlign"
              hrefLabel="Bli varslet ved lansering"
              tag="Krever gratis konto"
              kommerSnart
            />
          </div>
        </div>
      </section>

      {/* MERSALG-BÅND 1 — midt på siden */}
      <section className="border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 sm:py-16 md:grid-cols-[2fr_1fr] md:items-center">
          <div>
            <AthleticEyebrow tone="lime">Ditt eget verktøy</AthleticEyebrow>
            <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Vil du følge{" "}
              <em className="font-normal italic">dine egne</em> tall like enkelt?
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-primary-foreground/90">
              PlayerHQ er treningsdagboken som AK Golf Academy bruker med
              spillerne sine. Logg runder, se din egen Strokes Gained over tid,
              få AI-coach-analyser, og følg utvikling mot mål. Gratis i 30 dager.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/playerhq"
                className="inline-flex items-center gap-2 rounded-md bg-background px-5 py-3 text-sm font-semibold text-foreground hover:bg-background/90"
              >
                Prøv PlayerHQ gratis
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/priser"
                className="inline-flex items-center gap-2 rounded-md border border-primary-foreground/30 px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary-foreground/10"
              >
                Se priser
              </Link>
            </div>
          </div>
          <div className="rounded-lg border border-primary-foreground/20 bg-primary-foreground/5 p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary-foreground/70">
              Inkludert i abonnement
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-primary-foreground/95">
              {[
                "Strokes Gained per runde",
                "AI-coach 24/7",
                "Treningsplaner fra coach",
                "Mål, streaks og achievements",
                "Live-økt-flow på mobil/iPad",
                "Ubegrenset datalagring",
              ].map((b) => (
                <li key={b} className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-1 w-1 rounded-full bg-accent" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
              300 kr/mnd · Gratis 30 dager
            </p>
          </div>
        </div>
      </section>

      {/* "SLIK BRUKER TRENEREN DET" — bro fra gratis til betalt */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="text-center">
            <AthleticEyebrow tone="default">Fra stats til utvikling</AthleticEyebrow>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
              Slik bruker{" "}
              <em className="font-normal italic text-primary">treneren</em> data.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
              Statistikk er bare et utgangspunkt. Det som faktisk skaper
              utvikling er konsistent trening basert på det tallene viser.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <StegKort
              nr="01"
              tittel="Mål svakhet"
              tekst="Spillerens SG-profil viser hvor strokene tapes — putt, innspill, drive, eller game management."
            />
            <StegKort
              nr="02"
              tittel="Bygg drillen"
              tekst="Coachen lager en treningsplan i CoachHQ med drills som målrettet jobber med svakheten."
            />
            <StegKort
              nr="03"
              tittel="Følg utvikling"
              tekst="Spilleren logger runder i PlayerHQ. SG-trenden viser om treningen virker — og når det er tid for ny plan."
            />
          </div>

          <div className="mt-12 rounded-2xl border border-border bg-card p-8 text-center">
            <p className="text-base text-muted-foreground">
              <Calendar className="mr-2 inline h-4 w-4 text-primary" />
              <strong className="text-foreground">Vil du jobbe med en av våre coacher?</strong>{" "}
              Vi har plass til nye spillere på AK Golf Academy i 2026.
            </p>
            <Link
              href="/coaching"
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-foreground px-5 py-3 text-sm font-semibold text-background hover:bg-foreground/90"
            >
              Se coaching-tilbud
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* BUNN-CTA */}
      <section className="bg-secondary/40">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Klar for å bli{" "}
            <em className="font-normal italic text-primary">bedre</em>?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
            Bruk stats-verktøyene gratis så lenge du vil. Når du er klar for å
            jobbe systematisk med utvikling — vi er her.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/playerhq"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Start PlayerHQ gratis
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/turneringer"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-5 py-3 text-sm font-medium text-foreground hover:bg-secondary"
            >
              Se norske i aksjon
            </Link>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            Ingen kredittkort nødvendig. Avslutt når du vil. Gratis for
            Academy-kunder.
          </p>
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-komponenter
// ---------------------------------------------------------------------------

function SnapshotKort({
  ikon,
  tall,
  label,
  liten,
}: {
  ikon: React.ReactNode;
  tall: string;
  label: string;
  liten?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
      <div className="flex items-center justify-center gap-1.5 text-primary">
        {ikon}
        <span
          className={`font-mono font-semibold tabular-nums text-foreground ${liten ? "text-sm" : "text-2xl"}`}
        >
          {tall}
        </span>
      </div>
      <p className="mt-1 text-[11px] leading-tight text-muted-foreground">{label}</p>
    </div>
  );
}

function ModulKort({
  status,
  ikon,
  tittel,
  undertittel,
  tekst,
  href,
  hrefLabel,
  tag,
  kommerSnart,
}: {
  status: "LIVE" | "KOMMER SNART";
  ikon: React.ReactNode;
  tittel: string;
  undertittel: string;
  tekst: string;
  href: string;
  hrefLabel: string;
  tag: string;
  kommerSnart?: boolean;
}) {
  const inner = (
    <article
      className={`group h-full rounded-xl border bg-card p-6 transition-all hover:shadow-md sm:p-8 ${
        kommerSnart
          ? "border-border opacity-90 hover:opacity-100"
          : "border-border hover:border-primary/40"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className={`grid h-12 w-12 place-items-center rounded-lg ${
            kommerSnart ? "bg-secondary text-muted-foreground" : "bg-primary/10 text-primary"
          }`}
        >
          {ikon}
        </div>
        <span
          className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.10em] ${
            status === "LIVE"
              ? "bg-primary/15 text-primary"
              : "bg-accent/30 text-accent-foreground"
          }`}
        >
          {status}
        </span>
      </div>
      <h3 className="mt-6 font-display text-2xl font-semibold tracking-tight">
        {tittel}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">{undertittel}</p>
      <p className="mt-4 text-[15px] leading-relaxed text-foreground/80">{tekst}</p>
      <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          {tag}
        </span>
        <span
          className={`inline-flex items-center gap-1 text-sm font-medium ${
            kommerSnart ? "text-muted-foreground" : "text-primary group-hover:gap-2"
          } transition-all`}
        >
          {hrefLabel}
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </article>
  );

  if (kommerSnart) {
    // For kommer-snart, link til hjem som fallback
    return (
      <Link href="/playerhq" className="block">
        {inner}
      </Link>
    );
  }

  return (
    <Link href={href} className="block">
      {inner}
    </Link>
  );
}

function StegKort({
  nr,
  tittel,
  tekst,
}: {
  nr: string;
  tittel: string;
  tekst: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
        {nr}
      </span>
      <h3 className="mt-3 font-display text-xl font-semibold tracking-tight">
        {tittel}
      </h3>
      <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
        {tekst}
      </p>
    </div>
  );
}
