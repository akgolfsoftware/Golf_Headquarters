// PH-23 Anlegg — Precision Athletics, pakke 11 og 12 (utkast booking-meldinger.html, godkjent 16.10.2026).
/**
 * PlayerHQ · Anlegg/lokasjon-detalj (/portal/booking/anlegg/[anleggId]).
 * - [anleggId] er Location.id (cuid) — Location har ikke slug-felt.
 * - Bare ekte data: navn + adresse fra Location, aktive Facility-rader.
 *   Specs (hull/par/slope), rating og bio finnes ikke på modellen og vises ikke.
 * - Ingen ledige tider per lokasjon → knappen går til den ekte booking-flyten.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import type { FacilityType } from "@/generated/prisma/client";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH23Anlegg } from "@/components/portal/precision/PH23Anlegg";
import { getUnreadNotifications } from "@/app/portal/actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Anlegg · PlayerHQ" };

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

  const [anlegg, uleste] = await Promise.all([
    prisma.location.findUnique({
      where: { id: anleggId },
      select: {
        id: true,
        name: true,
        address: true,
        facilities: {
          where: { active: true },
          orderBy: { name: "asc" },
          select: { id: true, name: true, type: true, isIndoor: true, description: true },
        },
      },
    }),
    getUnreadNotifications(user.id, 1),
  ]);

  if (!anlegg) notFound();

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste.count}>
      <PH23Anlegg
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
    </PlayerHQSkall>
  );
}
