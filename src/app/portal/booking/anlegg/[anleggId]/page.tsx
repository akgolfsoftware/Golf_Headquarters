/**
 * PlayerHQ · Anlegg/lokasjon-detalj (/portal/booking/anlegg/[anleggId]) — v2.
 * v2-port 17. juli 2026 (Team G-B): `BookingAnleggV2` erstatter legacy-siden,
 * ruten flyttet ut av (legacy). All logikk uendret:
 * - [anleggId] er Location.id (cuid) — Location har ikke slug-felt.
 * - Honest data only: navn + adresse fra Location, ekte Facility-rader.
 *   Specs (hull/par/slope), rating og bio finnes IKKE på modellen og er
 *   BEVISST utelatt — vi fabrikkerer ikke data (beholdt fra legacy).
 * - Ingen per-lokasjon ledig-tider-kilde → CTA lenker til den ekte
 *   booking-flyten i stedet for et faux time-grid.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import type { FacilityType } from "@/generated/prisma/client";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import { BookingAnleggV2 } from "@/components/portal/v2/BookingAnleggV2";

export const dynamic = "force-dynamic";

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
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
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
    // Ingen eksplisitt aktiv-nøkkel: booking-hubben (/portal/booking) lar
    // V2Shell auto-utlede fra pathname — samme her.
    <V2Shell nav={PLAYERHQ_NAV} navn={user.name ?? undefined} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/booking">Booking</TilbakeLenke>
      <BookingAnleggV2
        data={{
          navn: anlegg.name,
          adresse: anlegg.address,
          fasiliteter: anlegg.facilities.map((f) => ({
            id: f.id,
            navn: f.name,
            typeLabel: FASILITET_TYPE_LABEL[f.type],
            inne: f.isIndoor,
            beskrivelse: f.description,
          })),
        }}
      />
    </V2Shell>
  );
}
