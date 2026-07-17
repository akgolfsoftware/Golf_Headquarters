/**
 * PlayerHQ · Coach SG-hub (/portal/coach/sg-hub) — v2.
 * v2-port 17. juli 2026 (Team D3): `CoachSgHubV2` erstatter hybrid-designet,
 * ruten flyttet ut av (legacy). Auth-guard (PLAYER + COACH + ADMIN), Prisma-
 * queries (siste BrukerSgInput + coach-oppslag), de statiske coach-
 * referanseverdiene og størst-gap-utregningen er uendret — kun presentasjons-
 * laget er nytt.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import {
  CoachSgHubV2,
  type CoachSgHubV2Data,
} from "@/components/portal/v2/CoachSgHubV2";

// Coach-referanseverdier — statisk til coach har BrukerSgInput-data
const COACH_SG = { ott: 0.8, app: 0.9, arg: 0.2, putt: 0.6 } as const;

type SgKey = keyof typeof COACH_SG;

const SG_KATEGORIER: { key: SgKey; label: string; navn: string }[] = [
  { key: "ott", label: "OTT", navn: "Tee-slag" },
  { key: "app", label: "APP", navn: "Innspill" },
  { key: "arg", label: "ARG", navn: "Nærspill" },
  { key: "putt", label: "PUTT", navn: "Putting" },
];

export default async function CoachSgHubPage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  // Siste SG-input for spilleren
  const sgInput = await prisma.brukerSgInput.findFirst({
    where: { userId: user.id },
    orderBy: { dato: "desc" },
  });

  const spillerSG = {
    ott: sgInput?.sgOtt ?? 0,
    app: sgInput?.sgApp ?? 0,
    arg: sgInput?.sgArg ?? 0,
    putt: sgInput?.sgPutt ?? 0,
  };

  const ingenData = !sgInput;

  // Coach-profil
  const coach = await prisma.user.findFirst({
    where: { role: "COACH" },
    select: { id: true, name: true },
  });
  const coachNavn = coach?.name ?? "Anders Kristiansen";
  const coachFirst = coachNavn.split(" ")[0];
  const coachLast = coachNavn.split(" ").slice(1).join(" ");

  // Finn kategorien med størst gap
  let storsteGap = SG_KATEGORIER[0];
  let storsteGapVerdi = 0;
  for (const cat of SG_KATEGORIER) {
    const gap = COACH_SG[cat.key] - spillerSG[cat.key];
    if (gap > storsteGapVerdi) {
      storsteGapVerdi = gap;
      storsteGap = cat;
    }
  }

  const data: CoachSgHubV2Data = {
    coachNavn,
    coachFornavn: coachFirst,
    coachEtternavn: coachLast,
    spillerFornavn: user.name.split(" ")[0],
    ingenData,
    kategorier: SG_KATEGORIER.map((k) => ({
      label: k.label,
      navn: k.navn,
      mine: spillerSG[k.key],
      coach: COACH_SG[k.key],
    })),
    storsteGap:
      storsteGapVerdi > 0
        ? { navn: storsteGap.navn, label: storsteGap.label, verdi: storsteGapVerdi }
        : null,
    hrefUtstyr: "/portal/mal/sg-hub/equipment",
    hrefPerKolle: "/portal/mal/sg-hub",
  };

  return (
    <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/coach">Coach</TilbakeLenke>
      <CoachSgHubV2 data={data} />
    </V2Shell>
  );
}
