/**
 * PlayerHQ · Anlegg/lokasjon-detalj (/portal/booking/anlegg/[anleggId]).
 *
 * Viser ÉN ekte Location fra databasen. [anleggId] er Location.id (cuid) —
 * Location har ikke noe slug-felt, så detaljsiden slås opp på id.
 *
 * Honest data only:
 *   - Navn + adresse: Location.name / Location.address.
 *   - Fasiliteter: ekte Facility-rader (navn, type, innendørs, beskrivelse).
 *   - Tilgjengelighet: Location har ingen per-lokasjon ledig-tider-kilde
 *     (getAvailableSlots er koblet på serviceType, ikke lokasjon). Derfor
 *     lenker vi til den ekte booking-flyten i stedet for et faux time-grid.
 *
 * Rikt innhold som specs (hull/par/slope), rating og bio finnes IKKE på
 * Location-modellen og er bevisst utelatt — vi fabrikkerer ikke data.
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarPlus,
  Home,
  MapPin,
  Sun,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import type { FacilityType } from "@/generated/prisma/client";

type Props = {
  params: Promise<{ anleggId: string }>;
};

// Norske visnings-labels for fasilitet-typer. Tekstene speiler enum-
// kommentarene i prisma/schema.prisma (FacilityType) — ikke oppdiktet.
const FASILITET_TYPE_LABEL: Record<FacilityType, string> = {
  STUDIO: "Performance Studio",
  RANGE_1F: "Driving range (1. etg)",
  RANGE_2F: "Driving range (2. etg)",
  PUTTING_GREEN: "Putting green",
  SHORT_GAME: "Nærspillsområde",
  COURSE_9H: "9-hullsbane",
  COURSE_18H: "18-hullsbane",
  SPECIFIC_HOLES: "Utvalgte hull",
  GENERAL: "Fasilitet",
};

export default async function AnleggDetaljPage({ params }: Props) {
  await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const { anleggId } = await params;

  const anlegg = await prisma.location.findUnique({
    where: { id: anleggId },
    select: {
      id: true,
      name: true,
      address: true,
      facilities: {
        where: { active: true },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          type: true,
          isIndoor: true,
          description: true,
        },
      },
    },
  });

  if (!anlegg) notFound();

  return (
    <div className="mx-auto max-w-[1240px] space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <Link
        href="/portal/booking/ny"
        className="inline-flex items-center gap-1.5 font-mono text-[12px] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Tilbake til booking
      </Link>

      {/* HERO */}
      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <div
          className="relative h-44 sm:h-56"
          style={{
            background:
              "linear-gradient(135deg, #003A2A 0%, #005840 40%, #1A7D56 80%, #2C7D52 100%)",
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(209,248,67,0.18),transparent_60%)]" />
          <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-black/30 px-4 py-1 font-mono text-[10.5px] font-bold uppercase tracking-[0.12em] text-white/90 backdrop-blur-sm">
            <Building2 className="h-3 w-3" strokeWidth={2} />
            Anlegg
          </div>
          <div className="absolute bottom-6 left-5 right-5 sm:left-8">
            <h1 className="font-display text-[30px] font-medium leading-[1.05] -tracking-[0.02em] text-white sm:text-[42px]">
              {anlegg.name}
            </h1>
            <div className="mt-1.5 flex items-center gap-2 font-mono text-[12px] text-white/80">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" strokeWidth={2} />
                {anlegg.address}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        {/* FASILITETER */}
        <section>
          <h2 className="mb-2 font-display text-[18px] font-semibold -tracking-[0.01em] text-foreground">
            Fasiliteter
          </h2>
          {anlegg.facilities.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-8 text-center font-sans text-[13.5px] text-muted-foreground">
              Ingen fasiliteter er registrert på dette anlegget ennå.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {anlegg.facilities.map((f) => (
                <div
                  key={f.id}
                  className="relative flex items-start gap-2 rounded-xl border border-border bg-card p-4"
                >
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
                    {f.isIndoor ? (
                      <Home className="h-2.5 w-2.5" strokeWidth={2.25} />
                    ) : (
                      <Sun className="h-2.5 w-2.5" strokeWidth={2.25} />
                    )}
                    {f.isIndoor ? "Inne" : "Ute"}
                  </span>
                  <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-secondary">
                    <MapPin
                      className="h-4 w-4 text-foreground"
                      strokeWidth={1.75}
                    />
                  </div>
                  <div className="min-w-0 pr-12">
                    <div className="font-display text-[14px] font-semibold -tracking-[0.005em] text-foreground">
                      {f.name}
                    </div>
                    <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                      {FASILITET_TYPE_LABEL[f.type]}
                    </div>
                    {f.description && (
                      <p className="mt-1.5 font-sans text-[12px] leading-[1.45] text-muted-foreground">
                        {f.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* HØYRE: Booking-CTA (ekte flyt — ingen faux time-grid) */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-2 flex items-center gap-2">
              <CalendarPlus
                className="h-4 w-4 text-foreground"
                strokeWidth={1.75}
              />
              <h3 className="font-display text-[15px] font-semibold -tracking-[0.005em] text-foreground">
                Book på dette anlegget
              </h3>
            </div>
            <p className="mb-3 font-sans text-[12.5px] leading-[1.5] text-muted-foreground">
              Velg tjeneste og en ledig tid i booking-flyten. Ledige tider
              bekreftes mot coachens kalender.
            </p>
            <Link
              href="/portal/booking/ny"
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 font-sans text-[14px] font-semibold text-primary-foreground hover:opacity-90"
            >
              Velg tid i booking
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
