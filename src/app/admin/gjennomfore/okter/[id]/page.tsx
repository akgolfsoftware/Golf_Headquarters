/**
 * AgencyOS — Øktark (AG-12 i Precision Athletics, /admin/gjennomfore/okter/[id]).
 *
 * Tegning: Claude Design 7d7c2994, ui_kits/agencyos/screens/AG-cockpit.jsx › AG12
 * («Øktark etter live»). Visningen er AG12Oktark.
 *
 * Laster som før: auth (COACH/ADMIN), Booking med spiller, sted og status
 * utledet fra tid. Nytt: når bookingen er koblet til en live-økt
 * (Booking.trainingSessionV2Id) hentes øvelser, opptak, fokuspunkt og
 * vurdering med lastLiveOktData — samme laster som live-konsollen bruker.
 * Plassholderinnholdet fra den gamle siden (oppdiktede øvelser og notater) er
 * fjernet. Handlingene (startOkt, kansellerBooking) er uendret i actions.ts.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { calculateAge } from "@/lib/auth/minor";
import { prisma } from "@/lib/prisma";
import { coachBookingScope } from "@/lib/auth/booking-scope";
import { lastLiveOktData } from "@/lib/agencyos/live-okt-data";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AG12Oktark, type OktarkData, type OktarkStatus } from "@/components/admin/precision/AG12Oktark";

export const dynamic = "force-dynamic";
export const metadata = { title: "Øktark · AgencyOS" };

function deriveStatus(start: Date, durationMin: number): OktarkStatus {
  const now = Date.now();
  const startMs = start.getTime();
  const endMs = startMs + durationMin * 60 * 1000;
  if (now < startMs) return "PLANLAGT";
  if (now <= endMs) return "AKTIV";
  return "GJENNOMFORT";
}

const OSLO = "Europe/Oslo";

export default async function OktDetaljPage({ params }: { params: Promise<{ id: string }> }) {
  const coach = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;

  // Coach-scope: head coach (ADMIN) ser alle, assistant coach bare egne bookinger.
  const booking = await prisma.booking.findFirst({
    where: { id, ...coachBookingScope(coach) },
    include: {
      user: {
        select: { id: true, name: true, hcp: true, dateOfBirth: true, wagrSnapshot: { select: { rank: true } } },
      },
    },
  });

  if (!booking || !booking.user) notFound();

  const [facility, live] = await Promise.all([
    booking.facilityId
      ? prisma.facility.findUnique({ where: { id: booking.facilityId }, select: { id: true, name: true } }).catch(() => null)
      : null,
    booking.trainingSessionV2Id ? lastLiveOktData(booking.trainingSessionV2Id) : null,
  ]);

  const durationMin = Math.round((booking.endAt.getTime() - booking.startAt.getTime()) / 60000);
  const spiller = booking.user;
  const alder = calculateAge(spiller.dateOfBirth);
  const wagrRank = spiller.wagrSnapshot?.rank ?? null;
  const tid = (d: Date) => d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit", timeZone: OSLO });

  const data: OktarkData = {
    bookingId: booking.id,
    status: deriveStatus(booking.startAt, durationMin),
    spillerNavn: spiller.name,
    spillerMeta: [
      `HCP ${spiller.hcp != null ? spiller.hcp : "—"}`,
      wagrRank != null ? `WAGR ${wagrRank.toLocaleString("nb-NO")}` : null,
      alder != null ? `${alder} år` : null,
    ].filter(Boolean).join(" · "),
    fornavn: spiller.name.split(" ")[0] ?? spiller.name,
    dateLabel: booking.startAt.toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long", timeZone: OSLO }),
    startTime: tid(booking.startAt),
    endTime: tid(booking.endAt),
    facilityLabel: facility?.name ?? null,
    durationMin,
    trainingSessionV2Id: booking.trainingSessionV2Id ?? null,
    okt: live
      ? {
          tittel: live.tittel,
          malsetning: live.malsetning,
          driller: live.driller,
          opptak: live.opptak
            ? { status: live.opptak.status, durationSec: live.opptak.durationSec, harAvskrift: !!live.opptak.transcript, sammendrag: live.opptak.coachAnalyse }
            : null,
          coachBrief: live.coachBrief,
          coachRating: live.coachRating,
        }
      : null,
  };

  return (
    <AgencyOSSkall navn={coach.name ?? "Coach"}>
      <AG12Oktark data={data} />
    </AgencyOSSkall>
  );
}
