/**
 * PlayerHQ · Talent · Mitt nivå (/portal/talent/mitt-niva) — v2.
 * v2-port 17. juli 2026 (Team D5): `TalentMittNivaV2` (RadarProfil + akse-
 * detaljer) erstatter athletic-skjermen, ruten flyttet ut av (legacy).
 * Feature-gate og «ikke i programmet»-sjekken fra den slettede (legacy)-
 * layouten håndheves nå her. Auth, Prisma-queries og kohort-snitt-
 * beregningen (computeAverage) er uendret — kun presentasjonslaget er nytt.
 */

import { notFound } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { FEATURES } from "@/lib/features";
import { prisma } from "@/lib/prisma";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import {
  TalentMittNivaV2,
  type TalentMittNivaData,
} from "@/components/portal/v2/TalentMittNivaV2";
import {
  TALENT_AKSE_KEYS,
  TALENT_AKSE_LABELS,
  TalentIkkeIProgrammet,
  type TalentAkseKey,
} from "@/components/portal/v2/TalentFellesV2";

function computeAverage(
  rows: Array<{
    fysisk: number | null;
    teknikk: number | null;
    taktikk: number | null;
    mental: number | null;
    motivasjon: number | null;
  }>,
): Record<TalentAkseKey, number> {
  const result: Record<TalentAkseKey, number> = {
    fysisk: 0,
    teknikk: 0,
    taktikk: 0,
    mental: 0,
    motivasjon: 0,
  };
  if (rows.length === 0) return result;
  for (const k of TALENT_AKSE_KEYS) {
    const vals = rows
      .map((r) => r[k])
      .filter((v): v is number => typeof v === "number");
    result[k] = vals.length === 0 ? 0 : vals.reduce((a, b) => a + b, 0) / vals.length;
  }
  return result;
}

export default async function MittNivaPage() {
  if (!FEATURES.TALENT) notFound();

  const user = await requirePortalUser({ allow: ["PLAYER"] });

  const tracking = await prisma.talentTracking.findUnique({
    where: { userId: user.id },
  });

  if (!tracking) {
    return (
      <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
        <TilbakeLenke href="/portal/talent">Talent</TilbakeLenke>
        <TalentIkkeIProgrammet />
      </V2Shell>
    );
  }

  // Kohort-snitt for samme nivå — ekskluderer egen rad.
  const kohort = await prisma.talentTracking.findMany({
    where: { niva: tracking.niva, NOT: { userId: user.id } },
    select: {
      fysisk: true,
      teknikk: true,
      taktikk: true,
      mental: true,
      motivasjon: true,
    },
  });

  const kohortSnitt = computeAverage(kohort);

  const data: TalentMittNivaData = {
    niva: tracking.niva,
    kohortAntall: kohort.length,
    akser: TALENT_AKSE_KEYS.map((k) => ({
      key: k,
      label: TALENT_AKSE_LABELS[k],
      verdi: tracking[k],
      kohort: kohortSnitt[k],
    })),
  };

  return (
    <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/talent">Talent</TilbakeLenke>
      <TalentMittNivaV2 data={data} />
    </V2Shell>
  );
}
