/**
 * AgencyOS Økt-detalj (coach-context) — Train-lock-port (T6, 27.08.2026).
 *
 * Fasit: `A-14 iPhone Okt-ark Filip.dc.html` (bunnark-look), samme idiom som
 * spillerens `OktArk` (src/components/portal/workbench/OktArk.tsx). Selve
 * presentasjonen ligger i `OktArkV2` (src/components/admin/v2/OktArkV2.tsx)
 * — denne fila er kun loader: auth, Prisma-henting og statusutledning fra
 * tid er bevart 1:1 fra legacy (Booking-modellen, ikke WorkbenchSession).
 *
 * NB: SESSION_DRILLS, prep-notater og "etter økt"-rating er fortsatt
 * plassholder-innhold portet fra det opprinnelige design-bundlet (ikke
 * min endring — bevart 1:1, flagges separat for datakobling).
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { calculateAge } from "@/lib/auth/minor";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { OktArkV2, type OktArkData, type OktStatus } from "@/components/admin/v2/OktArkV2";

export const dynamic = "force-dynamic";

const SESSION_DRILLS = [
  { name: "Oppvarming · 5m putts", category: "PUTT", mins: "4 min", reps: "20", done: 20, target: 20 },
  { name: "Gate-putt med start-linje", category: "PUTT", mins: "5 min", reps: "8 av 10", done: 7, target: 10 },
  { name: "Lag-på-lag stige 1m → 3m", category: "PUTT", mins: "6 min", reps: "8 av 10", done: 4, target: 10 },
  { name: "Speed-kontroll 6m", category: "PUTT", mins: "3 min", reps: "70% inn ±0,5m", done: 0, target: 10 },
  { name: "Free-throw · 3 av 5 fra 2,5m", category: "PUTT", mins: "2 min", reps: "3 av 5", done: 0, target: 5 },
];

function deriveStatus(start: Date, durationMin: number): OktStatus {
  const now = Date.now();
  const startMs = start.getTime();
  const endMs = startMs + durationMin * 60 * 1000;
  if (now < startMs) return "OM 2 TIMER";
  if (now >= startMs && now <= endMs) return "AKTIV NÅ";
  return "GJENNOMFØRT";
}

function initialer(navn: string): string {
  return navn
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((d) => d[0]?.toUpperCase() ?? "")
    .join("");
}

export default async function OktDetaljPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const coach = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true, hcp: true, dateOfBirth: true, wagrSnapshot: { select: { rank: true } } },
      },
    },
  });

  if (!booking || !booking.user) notFound();

  const facility = booking.facilityId
    ? await prisma.facility.findUnique({ where: { id: booking.facilityId }, select: { id: true, name: true } }).catch(() => null)
    : null;

  const durationMin = Math.round((booking.endAt.getTime() - booking.startAt.getTime()) / 60000);
  const status = deriveStatus(booking.startAt, durationMin);
  const dateLabel = booking.startAt.toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long" });
  const startTime = booking.startAt.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
  const endTime = booking.endAt.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });

  const spiller = booking.user;
  const fornavn = spiller.name.split(" ")[0];

  const alder = calculateAge(spiller.dateOfBirth);
  const wagrRank = spiller.wagrSnapshot?.rank ?? null;
  const spillerMeta = [
    `HCP ${spiller.hcp != null ? spiller.hcp : "—"}`,
    wagrRank != null ? `WAGR ${wagrRank.toLocaleString("nb-NO")}` : null,
    alder != null ? `${alder} år` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const data: OktArkData = {
    bookingId: booking.id,
    status,
    spillerNavn: spiller.name,
    spillerInitialer: initialer(spiller.name),
    spillerMeta,
    fornavn,
    dateLabel,
    startTime,
    endTime,
    facilityLabel: facility?.name ?? "Studio",
    durationMin,
    trainingSessionV2Id: booking.trainingSessionV2Id ?? null,
    drills: SESSION_DRILLS,
    prepNotat: `${fornavn} klagde forrige uke over at start-linja vandret på lange putts. Kjør gate-drill først for å re-kalibrere — så bygge tilbake til speed-kontroll.`,
    onsketNotat: "Vil ha hjelp med å lese rake-greener — Olyo Tour på Larvik har mye sidefall.",
    etterOkt:
      status === "GJENNOMFØRT"
        ? {
            rating: 4,
            oppsummering: "Solid økt — start-linje 1,4° SD (mål 1,5°). Speed-drill skummelt på 6m, bør gjentas neste uke.",
            nesteOktLabel: "onsdag 04.06",
          }
        : null,
    siste5: [
      { bokstav: "P", dato: "25.05" },
      { bokstav: "T", dato: "22.05" },
      { bokstav: "P", dato: "20.05" },
      { bokstav: "F", dato: "17.05" },
      { bokstav: "P", dato: "15.05" },
    ],
  };

  return (
    <V2Shell bredde="kolonne" aktiv="kalender" nav={AGENCYOS_NAV} navn={coach.name} avatarUrl={coach.avatarUrl}>
      <div style={{ paddingBottom: 40 }}>
        <OktArkV2 data={data} />
      </div>
    </V2Shell>
  );
}
