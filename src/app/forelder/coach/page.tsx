/**
 * Foreldreportal · Coach. En ekte toveis coach-dialog for foreldre finnes ikke
 * i datamodellen ennå — CoachingSession er spiller↔coach, ikke forelder↔coach.
 * Siden viser derfor en mindre ambisiøs, men ekte, versjon: hvem barnets coach
 * er (fra siste/kommende booking), siste faktiske melding coachen har sendt
 * (Notification type="melding" — samme kilde som coachNote i
 * hentForelderUkerapport), og en kontakt-CTA. Ingen fabrikerte tall eller
 * påstander om fremtidig lanseringsdato.
 *
 * Auth følger samme mønster som resten av foreldreportalen: kun PARENT slippes
 * inn (forelder/layout.tsx), barn hentes via hentBarnForForelder (samtykke-
 * respekterende kobling via ParentRelation).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentBarnForForelder } from "@/lib/forelder";
import { prisma } from "@/lib/prisma";
import { V2Shell, FORELDER_NAV } from "@/components/v2/shell";
import {
  ForelderCoachV2,
  type ForelderCoachData,
} from "@/components/portal/v2/ForelderCoachV2";

export const dynamic = "force-dynamic";

const SUPPORT_EPOST = "support@akgolf.no";

const NB_DATO = new Intl.DateTimeFormat("nb-NO", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function ForelderCoachPage() {
  const user = await requirePortalUser({ allow: ["PARENT"] });
  const barn = await hentBarnForForelder(user.id);

  if (barn.length === 0) {
    const data: ForelderCoachData = {
      antallBarn: 0,
      childFirstName: null,
      coachNavn: null,
      coachAvatarUrl: null,
      coachEpost: null,
      nesteBooking: null,
      sisteMelding: null,
      supportEpost: SUPPORT_EPOST,
    };
    return (
      <V2Shell aktiv="coach" nav={FORELDER_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
        <ForelderCoachV2 data={data} />
      </V2Shell>
    );
  }

  const childId = barn[0].child.id;
  const childName = barn[0].child.name;
  const childFirstName = childName.split(" ")[0] ?? childName;
  const now = new Date();

  const [nesteBookingRad, sisteBookingMedCoachRad, sisteMeldingRad] =
    await Promise.all([
      // Neste kommende booking med tildelt coach.
      prisma.booking.findFirst({
        where: {
          userId: childId,
          startAt: { gte: now },
          status: { in: ["PENDING", "CONFIRMED"] },
          coachId: { not: null },
        },
        orderBy: { startAt: "asc" },
        select: {
          startAt: true,
          serviceType: { select: { name: true } },
          coach: { select: { name: true, avatarUrl: true, email: true } },
        },
      }),
      // Fallback: siste bookingen (uansett tid) som faktisk har en coach —
      // slik at vi kan vise hvem coachen er selv uten kommende timer.
      prisma.booking.findFirst({
        where: { userId: childId, coachId: { not: null } },
        orderBy: { startAt: "desc" },
        select: {
          startAt: true,
          serviceType: { select: { name: true } },
          coach: { select: { name: true, avatarUrl: true, email: true } },
        },
      }),
      // Siste faktiske melding coachen har sendt (samme kilde som
      // coachNote i hentForelderUkerapport).
      prisma.notification.findFirst({
        where: { userId: childId, type: "melding" },
        orderBy: { createdAt: "desc" },
        select: { title: true, body: true, createdAt: true },
      }),
    ]);

  const coach = nesteBookingRad?.coach ?? sisteBookingMedCoachRad?.coach ?? null;

  const data: ForelderCoachData = {
    antallBarn: barn.length,
    childFirstName,
    coachNavn: coach?.name ?? null,
    coachAvatarUrl: coach?.avatarUrl ?? null,
    coachEpost: coach?.email ?? null,
    nesteBooking: nesteBookingRad
      ? {
          dato: NB_DATO.format(nesteBookingRad.startAt),
          serviceName: nesteBookingRad.serviceType.name,
        }
      : null,
    sisteMelding: sisteMeldingRad
      ? {
          title: sisteMeldingRad.title,
          body: sisteMeldingRad.body,
          dato: NB_DATO.format(sisteMeldingRad.createdAt),
        }
      : null,
    supportEpost: SUPPORT_EPOST,
  };

  return (
    <V2Shell aktiv="coach" nav={FORELDER_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <ForelderCoachV2 data={data} />
    </V2Shell>
  );
}
