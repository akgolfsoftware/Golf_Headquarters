/**
 * v2-forhåndsvisning — PlayerHQ Meg (retning C). Egen top-level route-group
 * (v2preview) som IKKE arver PortalShell — kun root-layout. V2Shell leverer
 * chrome-en (IkonRail/BunnNav), MegV2 rendrer innholds-stacken.
 *
 * Auth + dataloader gjenbruker den ekte /portal/meg-siden: hentProfil for profil,
 * getGoals for sesongmål, Round-aggregat for «Sesongen i tall» (brutto score).
 *
 * Steg 7 PR4 (Paper-port, designsystem/paper/fase1/playerhq-meg.html): lagt til
 * identitet (school/playingYears/ambition/prevSeasonAvgScore/dateOfBirth,
 * playerFacilities), aktiv coach/program (PlayerEnrollment) og et
 * abonnements-sammendrag (getAbonnementData) — alt lest direkte fra
 * eksisterende felt, ingen nye modeller.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentProfil } from "@/app/portal/meg/actions";
import { getGoals } from "@/app/portal/actions";
import { prisma } from "@/lib/prisma";
import { getAbonnementData } from "@/lib/portal-abonnement/abonnement-data";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { MegV2, type MegData } from "@/components/portal/v2/MegV2";
import { hentLydSamtykkeStatus } from "@/lib/recording/lyd-samtykke";
import { pakkeNavn } from "@/lib/domain/abonnement";
import { FEATURES } from "@/lib/features";

export const dynamic = "force-dynamic";

export default async function V2MegPreviewPage() {
  const user = await requirePortalUser({ kreverTilgang: "INGEN" });
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const [profil, goals, agg, identitet, aktivEnrollment, abo, lydSjekk, talentRad] = await Promise.all([
    hentProfil(),
    getGoals(user.id, 3),
    prisma.round.aggregate({
      where: { userId: user.id },
      _count: { _all: true },
      _min: { score: true },
      _avg: { score: true, sgTotal: true },
    }),
    prisma.user.findUnique({
      where: { id: user.id },
      select: {
        school: true,
        schoolYear: true,
        playingYears: true,
        ambition: true,
        prevSeasonAvgScore: true,
        dateOfBirth: true,
        playerFacilities: { select: { name: true }, orderBy: { sortOrder: "asc" } },
      },
    }),
    // Nyeste aktive enrollering med en ekte coach — PLATFORM_ONLY har ingen
    // coach og skal ikke gi et «Coach og program»-kort.
    prisma.playerEnrollment.findFirst({
      where: { userId: user.id, endedAt: null, coachId: { not: null } },
      orderBy: { enrolledAt: "desc" },
      select: { program: true, enrolledAt: true, coach: { select: { name: true } } },
    }),
    getAbonnementData(user.id),
    hentLydSamtykkeStatus(user.id),
    // Talentprofil-inngangen vises kun når featuren er på OG spilleren
    // faktisk har en TalentTracking-rad — aldri en lenke til en tom side.
    FEATURES.TALENT ? prisma.talentTracking.findUnique({ where: { userId: user.id }, select: { userId: true } }) : null,
  ]);

  const data: MegData = {
    navn: profil.user.name,
    avatarUrl: profil.user.avatarUrl,
    hcp: profil.user.hcp,
    homeClub: profil.user.homeClub,
    goals,
    sesong: {
      runder: agg._count._all,
      besteRunde: agg._min.score,
      snittScore: agg._avg.score,
      sgSnitt: agg._avg.sgTotal,
    },
    identitet: {
      school: identitet?.school ?? null,
      schoolYear: identitet?.schoolYear ?? null,
      playingYears: identitet?.playingYears ?? null,
      ambition: identitet?.ambition ?? null,
      prevSeasonAvgScore: identitet?.prevSeasonAvgScore ?? null,
      dateOfBirth: identitet?.dateOfBirth ?? null,
      fasiliteter: identitet?.playerFacilities.map((f) => f.name) ?? [],
    },
    program: aktivEnrollment
      ? {
          coachNavn: aktivEnrollment.coach!.name,
          program: aktivEnrollment.program,
          enrolledAt: aktivEnrollment.enrolledAt,
        }
      : null,
    abo: {
      erPro: abo.erPro,
      // Samme utledning som /portal/meg/abonnement/page.tsx — pakke (credits) vinner over ren Pro.
      planNavn: pakkeNavn(abo.monthlyCredits),
      status: abo.status,
      nesteTrekk: abo.nesteTrekk,
    },
    notif: profil.preferences.notif,
    lydSamtykke: {
      tillatt: lydSjekk.tillatt,
      status: lydSjekk.status,
      gittAt: lydSjekk.gittAt,
    },
    visTalent: talentRad != null,
  };

  return (
    <V2Shell aktiv="meg" bredde="kolonne" nav={PLAYERHQ_NAV} navn={data.navn} avatarUrl={data.avatarUrl}>
      <MegV2 data={data} />
    </V2Shell>
  );
}
