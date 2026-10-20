// FO06Coach — Precision Athletics. Data og handlinger er beholdt.
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
import { velgGodkjentBarn } from "@/lib/forelder";
import { ForelderBarnValg, ForelderBarnAvvist } from "@/components/forelder/ForelderBarnValg";
import { prisma } from "@/lib/prisma";
import { ForelderSkall } from "@/components/precision/ForelderSkall";
import {
  ForelderCoachV2,
  type ForelderCoachData,
} from "@/components/portal/v2/ForelderCoachV2";

export const dynamic = "force-dynamic";

const SUPPORT_EPOST = "support@akgolf.no";

export default async function ForelderCoachPage({ searchParams }: { searchParams?: Promise<{ barn?: string }> } = {}) {
  const user = await requirePortalUser({ allow: ["PARENT"] });
  const valgt = (await searchParams)?.barn;
  const { alle: barn, fokus } = await velgGodkjentBarn(user.id, valgt);
  const valgListe = barn.map((b) => ({ id: b.child.id, navn: b.child.name }));
  if (valgt && !fokus) return <ForelderSkall><ForelderBarnAvvist barn={valgListe} /></ForelderSkall>;

  if (!fokus) {
    const data: ForelderCoachData = {
      antallBarn: 0,
      parentName: user.name,
      childFirstName: null,
      coachNavn: null,
      coachAvatarUrl: null,
      coachEpost: null,
      sisteMelding: null,
      supportEpost: SUPPORT_EPOST,
    };
    return (
      <ForelderSkall>
        <ForelderCoachV2 data={data} />
      </ForelderSkall>
    );
  }

  const childId = fokus.child.id;
  const childName = fokus.child.name;
  const childFirstName = childName.split(" ")[0] ?? childName;
  const now = new Date();

  const [nesteBookingRad, sisteBookingMedCoachRad] =
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
    ]);

  const coach = nesteBookingRad?.coach ?? sisteBookingMedCoachRad?.coach ?? null;

  const data: ForelderCoachData = {
    antallBarn: barn.length,
    parentName: user.name,
    childFirstName,
    coachNavn: coach?.name ?? null,
    coachAvatarUrl: coach?.avatarUrl ?? null,
    coachEpost: coach?.email ?? null,
    // Barnets egne innboksvarsler er ikke en forelderdialog. Meldinger til
    // forelder vises på /forelder/varsler med forelder som faktisk mottaker.
    sisteMelding: null,
    supportEpost: SUPPORT_EPOST,
  };

  return (
    <ForelderSkall barnId={fokus.child.id}>
      <ForelderBarnValg barn={valgListe} valgt={fokus.child.id} />
      <ForelderCoachV2 data={data} />
    </ForelderSkall>
  );
}
