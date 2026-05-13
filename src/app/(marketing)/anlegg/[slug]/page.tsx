import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Clock, Users, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";

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

const APNINGSTIDER = [
  { dag: "Mandag–fredag", tid: "07:00–22:00" },
  { dag: "Lørdag", tid: "08:00–20:00" },
  { dag: "Søndag", tid: "09:00–20:00" },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const locations = await prisma.location.findMany({ where: { active: true } });
  const loc = locations.find((l) => slugify(l.name) === slug);
  if (!loc) return { title: "Anlegg ikke funnet" };
  return {
    title: `${loc.name} — AK Golf Academy`,
    description: `Tren hos AK Golf Academy på ${loc.name}, ${loc.address}.`,
  };
}

export default async function AnleggDetalj({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locations = await prisma.location.findMany({
    where: { active: true },
    include: { facilities: { where: { active: true } } },
  });
  const loc = locations.find((l) => slugify(l.name) === slug);
  if (!loc) notFound();

  const heroImage = HERO_IMAGES[slug] ?? "/images/akademy/walking-bag.jpg";

  return (
    <div>
      <section className="relative">
        <div className="relative aspect-[16/7] w-full overflow-hidden bg-secondary">
          <Image
            src={heroImage}
            alt={`Hero-bilde fra ${loc.name}`}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
        </div>
        <div className="mx-auto max-w-5xl px-6 -mt-24 relative">
          <div className="rounded-2xl border border-border bg-card p-8 sm:p-12">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
              Anlegg
            </span>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
              {loc.name}
            </h1>
            <p className="mt-4 flex items-center gap-2 text-base text-muted-foreground">
              <MapPin className="h-5 w-5" aria-hidden="true" />
              {loc.address}
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-8">
            <h2 className="flex items-center gap-3 font-display text-2xl font-semibold tracking-tight">
              <Clock className="h-5 w-5 text-primary" aria-hidden="true" />
              Åpningstider
            </h2>
            <ul className="mt-6 space-y-3 text-sm">
              {APNINGSTIDER.map((a) => (
                <li
                  key={a.dag}
                  className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <span className="text-foreground">{a.dag}</span>
                  <span className="font-mono text-muted-foreground">
                    {a.tid}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs text-muted-foreground">
              Tider kan variere ved arrangementer og helligdager.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="relative aspect-[4/3] w-full bg-gradient-to-br from-primary/10 via-accent/10 to-secondary">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <MapPin
                    className="mx-auto h-10 w-10 text-primary"
                    aria-hidden="true"
                  />
                  <p className="mt-3 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Kart
                  </p>
                  <p className="mt-2 max-w-xs px-6 text-sm text-foreground">
                    {loc.address}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-display text-3xl font-semibold tracking-tight">
            <em className="font-normal text-primary md:italic">Fasiliteter</em>
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Hver fasilitet på {loc.name} kan bookes individuelt — fra korte
            øvelsesøkter til lengre coachingøkter.
          </p>

          {loc.facilities.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground">
              Ingen fasiliteter er publisert på dette anlegget ennå.
            </div>
          ) : (
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {loc.facilities.map((f) => (
                <div
                  key={f.id}
                  className="rounded-2xl border border-border bg-card p-6"
                >
                  <h3 className="font-display text-lg font-semibold tracking-tight">
                    {f.name}
                  </h3>
                  <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" aria-hidden="true" />
                    Kapasitet: {f.capacity}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-secondary/40 p-12 text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight">
            Klar for å trene hos oss?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Book en time på {loc.name} eller ta kontakt for å høre om hva som
            passer best for deg.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Book på dette anlegget
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/anlegg"
              className="inline-flex items-center gap-2 rounded-md border border-input bg-card px-6 py-3 text-sm font-medium text-foreground hover:border-primary hover:text-primary"
            >
              Se alle anlegg
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
