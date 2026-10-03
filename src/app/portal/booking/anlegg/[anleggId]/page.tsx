/** PH23Anlegg — anleggdetalj i PlayerHQSkall.
 * [anleggId] er Location.id (cuid). Navn, adresse og aktive fasiliteter.
 * Hull, par, slope, rating og bio finnes ikke på modellen og vises ikke.
 * Ledige tider ligger i booking-flyten, ikke på anlegget.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import type { FacilityType } from "@/generated/prisma/client";
import { getUnreadNotifications } from "@/app/portal/actions";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
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
  const user = await requirePortalUser({ kreverTilgang: "TALENT", allow: ["PLAYER", "COACH", "ADMIN"] });
  const { anleggId } = await params;

  const [anlegg, ulest] = await Promise.all([
    prisma.location.findUnique({
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
    }),
    getUnreadNotifications(user.id, 1),
  ]);

  if (!anlegg) notFound();

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
      <div className="pa-side">
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
      </div>
    </PlayerHQSkall>
  );
}
