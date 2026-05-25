/**
 * /stats/sg-sammenlign — landingsside (offentlig)
 *
 * Hero + verdiløfte + eksempel-radar + CTA. Krever ikke innlogging.
 * "Start sammenligning"-knappen sender bruker til /auth/signup hvis ikke innlogget,
 * ellers rett til /stats/sg-sammenlign/start.
 */

import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "SG-sammenligning — sammenlign deg med Rory McIlroy",
  description:
    "Legg inn din egen Strokes Gained og se hvordan du ligger an mot verdens beste. Få et estimat på hva din norske snittscore tilsvarer på PGA Tour.",
  alternates: { canonical: "https://akgolf.no/stats/sg-sammenlign" },
  openGraph: {
    title: "Sammenlign deg med Rory — SG-tool fra AK Golf",
    description:
      "Hvor mye taper du mot proffene? Få konkrete tall på din egen SG-profil.",
    url: "https://akgolf.no/stats/sg-sammenlign",
  },
};

export default async function SgSammenlignLanding() {
  const user = await getCurrentUser();
  const startHref = user
    ? "/stats/sg-sammenlign/start"
    : "/auth/signup?next=/stats/sg-sammenlign/start";

  return (
    <div className="bg-background text-foreground">
      {/* Breadcrumb */}
      <div className="border-b border-border bg-secondary/20">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
          <Link
            href="/stats"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Tilbake til AK Golf Stats
          </Link>
        </div>
      </div>

      {/* HERO */}
      <section className="border-b border-border bg-gradient-to-b from-background to-secondary/40">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20 md:py-24">
          <div className="text-center">
            <AthleticEyebrow tone="lime">SG-sammenligning</AthleticEyebrow>
            <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Sammenlign deg med{" "}
              <em className="font-normal italic text-primary">Rory</em>.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-[16px] leading-[1.6] text-muted-foreground md:text-[18px]">
              Legg inn dine egne Strokes Gained-tall — vi viser hvor mye du
              taper mot toppen, hvilken kategori som har størst gap, og hva din
              norske snittscore tilsvarer på en PGA Tour-bane.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={startHref}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-base font-semibold text-primary-foreground hover:opacity-90"
              >
                {user ? "Start sammenligning" : "Start gratis sammenligning"}
                <ArrowRight className="h-4 w-4" />
              </Link>
              {!user && (
                <Link
                  href="/auth/login?next=/stats/sg-sammenlign/start"
                  className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-6 py-3 text-base font-medium text-foreground hover:bg-secondary"
                >
                  Logg inn
                </Link>
              )}
            </div>
            {!user && (
              <p className="mt-4 text-xs text-muted-foreground">
                Krever gratis konto · Ingen kredittkort · 60 sek
              </p>
            )}
          </div>
        </div>
      </section>

      {/* HVA DU FÅR */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="text-center">
            <AthleticEyebrow tone="default">Hvordan det fungerer</AthleticEyebrow>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Tre steg til{" "}
              <em className="font-normal italic text-primary">innsikt</em>.
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <Steg
              nr="01"
              ikon={<Trophy className="h-5 w-5" />}
              tittel="Velg referansespiller"
              tekst="Velg en av topp 250 på PGA Tour. Rory, Scottie, Viktor — du bestemmer hvem du måler deg mot."
            />
            <Steg
              nr="02"
              ikon={<Target className="h-5 w-5" />}
              tittel="Legg inn din SG"
              tekst="Drive, Approach, Around the Green og Putting — fire tall. Hvis du ikke har egne SG-data, estimerer vi fra snittscoren din."
            />
            <Steg
              nr="03"
              ikon={<Sparkles className="h-5 w-5" />}
              tittel="Få analyse + estimat"
              tekst="Radar-graf med din profil mot referansespilleren. Estimat: din norske snitt 78 → ~83 på PGA Tour-bane."
            />
          </div>
        </div>
      </section>

      {/* DETAILS / FAQ-stil */}
      <section className="border-b border-border bg-secondary/20">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <h2 className="text-center font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Hva er{" "}
            <em className="font-normal italic text-primary">Strokes Gained</em>?
          </h2>
          <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-foreground/80">
            <p>
              Strokes Gained (SG) måler hvor mange strokes du vinner eller
              taper sammenlignet med Tour-snittet på hver slagtype. Det
              opprinnelige rammeverket fra professor Mark Broadie skiller på
              fire kategorier:
            </p>
            <ul className="space-y-2">
              <li>
                <strong className="font-display text-primary">SG: OTT</strong>{" "}
                — Off The Tee. Hvor mye du vinner/taper på drives.
              </li>
              <li>
                <strong className="font-display text-primary">SG: APP</strong>{" "}
                — Approach. Innspill mot green fra fairway/rough.
              </li>
              <li>
                <strong className="font-display text-primary">SG: ARG</strong>{" "}
                — Around the Green. Chip, pitch, bunker-spill fra inntil 30 yd.
              </li>
              <li>
                <strong className="font-display text-primary">SG: PUTT</strong>{" "}
                — Putting. Inkludert alt fra greenen.
              </li>
            </ul>
            <p>
              PGA Tour-snittet er definert som 0. Tigers beste år var ca +3
              total SG per runde. En typisk klubbamatør ligger på −10 til −20.
              Verktøyet vårt viser deg nøyaktig hvor du ligger.
            </p>
          </div>
        </div>
      </section>

      {/* SLUTT-CTA */}
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6 sm:py-16">
          <AthleticEyebrow tone="lime">Klar?</AthleticEyebrow>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Det tar{" "}
            <em className="font-normal italic">60 sekunder</em>.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-primary-foreground/90">
            Gratis konto. Vi sender ingen spam. Etterpå kan du oppgradere til
            PlayerHQ for å logge runder, få AI-coach-analyse og følge
            utviklingen over tid.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={startHref}
              className="inline-flex items-center gap-2 rounded-md bg-background px-6 py-3 text-base font-semibold text-foreground hover:bg-background/90"
            >
              {user ? "Start sammenligning" : "Lag gratis konto"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-primary-foreground/70">
            <TrendingUp className="h-3 w-3" />
            300+ har allerede prøvd
          </p>
        </div>
      </section>
    </div>
  );
}

function Steg({
  nr,
  ikon,
  tittel,
  tekst,
}: {
  nr: string;
  ikon: React.ReactNode;
  tittel: string;
  tekst: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
          {ikon}
        </div>
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {nr}
        </span>
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold tracking-tight">
        {tittel}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {tekst}
      </p>
    </div>
  );
}
