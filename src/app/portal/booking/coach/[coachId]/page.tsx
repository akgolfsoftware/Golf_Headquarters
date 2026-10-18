// PH-23 Coach — Precision Athletics, pakke 11 og 12 (utkast booking-meldinger.html, godkjent 16.10.2026).
/**
 * PlayerHQ · Book direkte med coach (/portal/booking/coach/[coachId]).
 * Beholdt fra forrige versjon:
 * - `resolveCoach()` cuid/fornavn-slug-fallback EKSAKT (inngående lenker kan sende fornavn-slug).
 * - Samtaleteller (coachingSession.count) og aktive tjenester per coach.
 * - Siden er et inngangspunkt: «Velg tid» går til /portal/booking/ny med tjenesten forhåndsvalgt.
 * Nytt: «Dere sammen» leser ekte bookinger med coachen og klippene i coaching-pakken.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH23Coach } from "@/components/portal/precision/PH23Coach";
import { getUnreadNotifications } from "@/app/portal/actions";
import { tilNaivVeggklokke } from "@/lib/google-calendar-tid";
import { AVBESTILLING_FRIST_TIMER } from "@/lib/booking/policy";

export const dynamic = "force-dynamic";
export const metadata = { title: "Coach · PlayerHQ" };

type Props = {
  params: Promise<{ coachId: string }>;
};

/**
 * Slår opp coach på [coachId]. Prøver cuid-oppslag først (kanonisk, brukt av
 * /portal/coach/[coachId]); faller tilbake til fornavn-match blant COACH-brukere
 * fordi inngående lenker kan sende fornavn-slug (f.eks. «anders»).
 */
async function resolveCoach(coachId: string) {
  const byId = await prisma.user.findUnique({
    where: { id: coachId },
    select: { id: true, name: true, email: true, role: true, ambition: true },
  });
  if (byId && byId.role === "COACH") return byId;

  const coaches = await prisma.user.findMany({
    where: { role: "COACH", deletedAt: null },
    select: { id: true, name: true, email: true, role: true, ambition: true },
  });
  const slug = coachId.toLowerCase();
  return (
    coaches.find((c) => c.name.split(" ")[0]?.toLowerCase() === slug) ?? null
  );
}

function initialer(navn: string): string {
  return navn.split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

/** Booking-tider er naiv veggklokke (se google-calendar-tid.ts): les med lokale gettere. */
const ddmm = (d: Date) => `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`;

export default async function BookingCoachPage({ params }: Props) {
  const user = await requirePortalUser({ kreverTilgang: "TALENT", allow: ["PLAYER", "COACH", "ADMIN"] });
  const { coachId } = await params;

  const coach = await resolveCoach(coachId);
  if (!coach) notFound();

  const naa = tilNaivVeggklokke(new Date());
  const maanedStart = new Date(naa.getFullYear(), naa.getMonth(), 1);
  const maanedSlutt = new Date(naa.getFullYear(), naa.getMonth() + 1, 1);
  const medCoach = { userId: user.id, coachId: coach.id };

  const [samtaler, services, timerSammen, forsteTime, timerIMaaned, nesteTime, pakke, uleste] = await Promise.all([
    // Samtaler i appen (delte coaching-sesjoner) — samme kilde som /portal/coach/[coachId].
    prisma.coachingSession.count({ where: { userId: user.id, coachId: coach.id } }),
    prisma.serviceType.findMany({ where: { coachUserId: coach.id, active: true }, orderBy: { durationMin: "asc" } }),
    prisma.booking.count({ where: { ...medCoach, status: { in: ["CONFIRMED", "COMPLETED"] }, startAt: { lte: naa } } }),
    prisma.booking.findFirst({ where: { ...medCoach, status: { in: ["CONFIRMED", "COMPLETED"] } }, orderBy: { startAt: "asc" }, select: { startAt: true } }),
    prisma.booking.count({ where: { ...medCoach, status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] }, startAt: { gte: maanedStart, lt: maanedSlutt } } }),
    prisma.booking.findFirst({ where: { ...medCoach, status: { in: ["PENDING", "CONFIRMED"] }, startAt: { gte: naa } }, orderBy: { startAt: "asc" }, select: { startAt: true } }),
    prisma.subscription.findUnique({ where: { userId_kind: { userId: user.id, kind: "COACHING" } }, select: { creditsRemaining: true } }),
    getUnreadNotifications(user.id, 1),
  ]);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste.count}>
      <PH23Coach
        data={{
          coachId: coach.id,
          navn: coach.name,
          initialer: initialer(coach.name),
          timerSammen,
          siden: forsteTime ? forsteTime.startAt.toLocaleDateString("nb-NO", { month: "long", year: "numeric" }) : null,
          maanedNavn: naa.toLocaleDateString("nb-NO", { month: "long" }),
          timerIMaaned,
          klippIgjen: pakke ? pakke.creditsRemaining : null,
          nesteTime: nesteTime ? ddmm(nesteTime.startAt) : null,
          samtaler,
          tjenester: services.map((s) => ({
            id: s.id,
            navn: s.name,
            varighetMin: s.durationMin,
            beskrivelse: s.description,
            pris: s.priceOre > 0 ? `${(s.priceOre / 100).toLocaleString("nb-NO")} kr` : "1 klipp",
          })),
          avbestillingTimer: AVBESTILLING_FRIST_TIMER,
          kreverFull: user.tier === "GRATIS",
        }}
      />
    </PlayerHQSkall>
  );
}
