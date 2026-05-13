import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { POSTS } from "./posts";

export const metadata: Metadata = {
  title: "Blogg — AK Golf Academy",
  description:
    "Tanker fra coachene i AK Golf Academy om trening, struktur, kortspill og hva som faktisk flytter scoren.",
};

const DATO_FORMAT = new Intl.DateTimeFormat("nb-NO", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default function BloggListe() {
  const sortert = [...POSTS].sort((a, b) => b.dato.localeCompare(a.dato));

  return (
    <div>
      <section className="bg-gradient-to-b from-background to-secondary/40 px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            Blogg
          </span>
          <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            Skrevet av{" "}
            <em className="font-normal text-primary md:italic">coachene</em>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Erfaringer, observasjoner og prinsipper fra hverdagen på rangen og
            i timene.
          </p>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {sortert.map((p) => (
            <Link
              key={p.slug}
              href={`/blogg/${p.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-secondary">
                <Image
                  src={p.bilde}
                  alt={p.tittel}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  <Calendar className="h-3 w-3" aria-hidden="true" />
                  {DATO_FORMAT.format(new Date(p.dato))}
                </p>
                <h2 className="mt-3 font-display text-xl font-semibold leading-tight tracking-tight">
                  {p.tittel}
                </h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {p.ingress}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3">
                  Les mer
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
