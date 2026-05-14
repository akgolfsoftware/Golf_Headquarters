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
      <section className="border-b border-border bg-secondary/40 px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Anlegg · AK Golf Group
          </div>
          <h1 className="mt-4 max-w-3xl font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            To anlegg —{" "}
            <em className="font-normal italic text-primary">året rundt</em>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Innendørs på Mulligan i Horten når været ikke samarbeider, utendørs
            på GFGK Bossum i sesongen. Samme coacher, samme plan, sømløs
            booking.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" strokeWidth={1.5} />
              Horten + Fredrikstad
            </span>
            <span className="inline-flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-primary" strokeWidth={1.5} />
              Booking åpen 24/7
            </span>
          </div>
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
                      <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-4">
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
