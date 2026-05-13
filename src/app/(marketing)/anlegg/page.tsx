import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Anlegg — AK Golf Academy",
  description:
    "Våre treningsanlegg i Fredrikstad — Gamle Fredrikstad Golfklubb og Mulligan Indoor Golf Simulators.",
};

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "oe")
    .replace(/å/g, "aa")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const HERO_IMAGES: Record<string, string> = {
  default: "/images/akademy/walking-bag.jpg",
};

export default async function AnleggListe() {
  const locations = await prisma.location.findMany({
    where: { active: true },
    include: { facilities: { where: { active: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <section className="bg-gradient-to-b from-background to-secondary/40 px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            Anlegg
          </span>
          <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            Tren på{" "}
            <em className="font-normal text-primary md:italic">våre</em>{" "}
            fasiliteter
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            AK Golf Academy holder til på to anlegg i Fredrikstad — utendørs
            bane og innendørs simulatorer — slik at vi kan trene hele året.
          </p>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          {locations.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground">
              Ingen anlegg er publisert ennå. Ta kontakt på{" "}
              <a
                href="mailto:post@akgolf.no"
                className="text-primary underline"
              >
                post@akgolf.no
              </a>
              .
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2">
              {locations.map((loc) => {
                const slug = slugify(loc.name);
                return (
                  <Link
                    key={loc.id}
                    href={`/anlegg/${slug}`}
                    className="group overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary"
                  >
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-secondary">
                      <Image
                        src={HERO_IMAGES[slug] ?? "/images/akademy/walking-bag.jpg"}
                        alt={`Bilde fra ${loc.name}`}
                        fill
                        sizes="(max-width: 640px) 100vw, 50vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-8">
                      <h2 className="font-display text-2xl font-semibold tracking-tight">
                        {loc.name}
                      </h2>
                      <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" aria-hidden="true" />
                        {loc.address}
                      </p>
                      <p className="mt-4 text-sm text-foreground">
                        {loc.facilities.length}{" "}
                        {loc.facilities.length === 1
                          ? "fasilitet"
                          : "fasiliteter"}{" "}
                        tilgjengelig
                      </p>
                      <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3">
                        Se anlegget
                        <ArrowRight
                          className="h-4 w-4 transition-transform"
                          aria-hidden="true"
                        />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
