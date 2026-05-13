import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, GraduationCap } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Coachene våre — AK Golf Academy",
  description:
    "Møt coachene i AK Golf Academy — Anders Kristiansen og Markus Røinås Pedersen.",
};

type CoachKort = {
  slug: string;
  navn: string;
  tittel: string;
  bio: string;
  initialer: string;
};

const FALLBACK_COACHER: CoachKort[] = [
  {
    slug: "anders",
    navn: "Anders Kristiansen",
    tittel: "Head Coach · CEO",
    bio: "Bygger Academy rundt målbar fremgang. Mer enn et tiår med spillere på alle nivåer — fra første time til turneringsspill.",
    initialer: "AK",
  },
  {
    slug: "markus",
    navn: "Markus Røinås Pedersen",
    tittel: "Assistent",
    bio: "Jobber tett med juniorprogrammet og spillere som vil ta neste steg. Sterk på korte slag og putting.",
    initialer: "MR",
  },
];

function utledSlug(navn: string): string {
  const first = navn.split(" ")[0]?.toLowerCase() ?? "";
  return first
    .replace(/æ/g, "ae")
    .replace(/ø/g, "oe")
    .replace(/å/g, "aa")
    .replace(/[^a-z]/g, "");
}

export default async function CoacherSide() {
  // Hentes som dokumentasjon — vi viser kuraterte kort uavhengig av om
  // databasen er fylt ut. Coacher i DB brukes hvis tilgjengelig.
  const dbCoacher = await prisma.user.findMany({
    where: { role: "COACH" },
    select: { id: true, name: true, avatarUrl: true },
  });

  const coacher: CoachKort[] =
    dbCoacher.length > 0
      ? dbCoacher.map((u) => {
          const fallback = FALLBACK_COACHER.find(
            (f) => utledSlug(u.name) === f.slug,
          );
          return {
            slug: utledSlug(u.name),
            navn: u.name,
            tittel: fallback?.tittel ?? "Coach",
            bio: fallback?.bio ?? "Coach i AK Golf Academy.",
            initialer: u.name
              .split(" ")
              .slice(0, 2)
              .map((n) => n.charAt(0).toUpperCase())
              .join(""),
          };
        })
      : FALLBACK_COACHER;

  return (
    <div>
      <section className="bg-gradient-to-b from-background to-secondary/40 px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            Coacher
          </span>
          <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            Møt{" "}
            <em className="font-normal text-primary md:italic">coachene</em>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            To trenere med komplementære styrker — felles plattform, samme
            forventning til kvalitet og oppfølging.
          </p>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-2">
          {coacher.map((c) => (
            <Link
              key={c.slug}
              href={`/coacher/${c.slug}`}
              className="group rounded-2xl border border-border bg-card p-8 transition-colors hover:border-primary"
            >
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-secondary text-2xl font-semibold text-primary">
                {c.initialer}
              </div>
              <h2 className="mt-6 font-display text-2xl font-semibold tracking-tight">
                {c.navn}
              </h2>
              <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <GraduationCap className="h-4 w-4" aria-hidden="true" />
                {c.tittel}
              </p>
              <p className="mt-4 text-base leading-relaxed text-foreground">
                {c.bio}
              </p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3">
                Les mer
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
