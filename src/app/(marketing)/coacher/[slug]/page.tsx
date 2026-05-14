import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, GraduationCap, Trophy, Mail } from "lucide-react";

type CoachProfil = {
  slug: string;
  navn: string;
  tittel: string;
  initialer: string;
  intro: string;
  bio: string[];
  erfaring: string[];
  spesialiteter: string[];
};

const COACHER: CoachProfil[] = [
  {
    slug: "anders",
    navn: "Anders Kristiansen",
    tittel: "Head Coach · CEO i AK Golf Group",
    initialer: "AK",
    intro:
      "Anders har bygget Academy rundt én idé — at coaching skal være tydelig, målbar og personlig. Ingen magi, bare struktur og oppfølging.",
    bio: [
      "Anders har coachet golfspillere i mer enn et tiår — fra første time til nasjonale konkurranseutøvere. Bakgrunnen kombinerer egen turneringskarriere med formell trenerutdanning og en stadig læring fra Mac O'Grady, Trackman-data og moderne treningsmetodikk.",
      "I 2024 startet han AK Golf Group AS for å bygge en plattform der personlig coaching og digital oppfølging henger sammen. Resultatet er Academy slik det fungerer i dag — du møter coachen i timene, men jobber strukturert i PlayerHQ mellom dem.",
    ],
    erfaring: [
      "10+ år som golfcoach på alle nivåer",
      "Trener WANG Toppidrett Fredrikstad — golflinjen",
      "PGA-utdanning under arbeid",
      "Trackman-sertifisert (Combine + Performance)",
    ],
    spesialiteter: [
      "Plan- og strukturbygging for ambisiøse spillere",
      "Mental tilnærming og turneringsforberedelse",
      "Datadrevet teknikk — Trackman, video, AimPoint",
      "Junior-utvikling (alder 12–20)",
    ],
  },
  {
    slug: "markus",
    navn: "Markus Røinås Pedersen",
    tittel: "Assistent · Junior-ansvarlig",
    initialer: "MR",
    intro:
      "Markus jobber tett med juniorgruppen og spillere som vil løfte kortspill og putting. Tålmodig, presis, og kompromissløst opptatt av god teknikk.",
    bio: [
      "Markus kombinerer egen spillerbakgrunn med en pedagogisk tilnærming som gjør komplisert stoff enkelt å forstå. Spillerne hans merker forskjellen raskt — særlig på de slagene som teller mest når runden står og vipper.",
      "I Academy har Markus hovedansvaret for juniorprogrammet og driver gruppetreninger på Gamle Fredrikstad og Mulligan Indoor gjennom hele sesongen.",
    ],
    erfaring: [
      "Egen spillerbakgrunn fra junior- og amatørgolf",
      "Co-trener på WANG Toppidrett Fredrikstad",
      "Spesialisert på kortspill og putting",
    ],
    spesialiteter: [
      "Korte slag — wedge under 100 m",
      "Putting-teknikk og lesning av greener",
      "Junior- og nybegynner-coaching",
      "Gruppetreninger med tydelig progresjon",
    ],
  },
];

export function generateStaticParams() {
  return COACHER.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = COACHER.find((x) => x.slug === slug);
  if (!c) return { title: "Coach ikke funnet" };
  return {
    title: `${c.navn} — AK Golf Academy`,
    description: c.intro,
  };
}

export default async function CoachProfilSide({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = COACHER.find((x) => x.slug === slug);
  if (!c) notFound();

  return (
    <div>
      <section className="bg-gradient-to-b from-background to-secondary/40 px-6 py-20 sm:py-28">
        <div className="mx-auto grid max-w-5xl gap-10 sm:grid-cols-[auto_1fr] sm:items-center">
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-secondary text-4xl font-semibold text-primary">
            {c.initialer}
          </div>
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
              Coach
            </span>
            <h1 className="mt-4 font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              {c.navn}
            </h1>
            <p className="mt-4 flex items-center gap-2 text-base text-muted-foreground">
              <GraduationCap className="h-5 w-5" aria-hidden="true" />
              {c.tittel}
            </p>
            <p className="mt-6 max-w-2xl text-lg text-foreground">
              {c.intro}
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="space-y-6 text-base leading-relaxed text-foreground">
            {c.bio.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-8">
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-8">
            <h2 className="flex items-center gap-4 font-display text-xl font-semibold tracking-tight">
              <Trophy className="h-5 w-5 text-primary" aria-hidden="true" />
              Erfaring
            </h2>
            <ul className="mt-6 space-y-4 text-sm text-foreground">
              {c.erfaring.map((e) => (
                <li key={e} className="flex gap-4">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {e}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-card p-8">
            <h2 className="flex items-center gap-4 font-display text-xl font-semibold tracking-tight">
              <GraduationCap
                className="h-5 w-5 text-primary"
                aria-hidden="true"
              />
              Spesialiteter
            </h2>
            <ul className="mt-6 space-y-4 text-sm text-foreground">
              {c.spesialiteter.map((s) => (
                <li key={s} className="flex gap-4">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-secondary/40 p-12 text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight">
            Book med {c.navn.split(" ")[0]}
          </h2>
          <p className="mt-4 text-muted-foreground">
            Velg tid som passer deg — bekreftelse på e-post umiddelbart.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Book time
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a
              href="mailto:post@akgolf.no"
              className="inline-flex items-center gap-2 rounded-md border border-input bg-card px-6 py-4 text-sm font-medium text-foreground hover:border-primary hover:text-primary"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              Send melding
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
