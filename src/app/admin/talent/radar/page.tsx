/**
 * v2-forhåndsvisning — AgencyOS Talent-radar (retning C). Egen top-level
 * route-group (v2preview) som IKKE arver AdminShell — kun root-layout — så
 * V2Shell leverer all chrome (IkonRail/BunnNav) i mørk v2-scope.
 *
 * Auth + dataloading følger de ekte skjermene
 * src/app/admin/talent/radar/page.tsx (liste) + /[playerId] (pentagon-radar):
 * samme requirePortalUser-guard (ADMIN/COACH), samme TalentTracking-kilde og
 * samme peer-snitt-logikk (snitt av andre talenter på samme nivå). Klient-
 * komponenten holder spiller-valget; alle talenter lastes én gang her.
 * Ærlig tom-tilstand hvis ingen talenter — aldri fabrikerte tall.
 *
 * Server component.
 */

import {} from "@/components/v2";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import {
  AdminTalentRadarV2,
  type TalentRadarData,
  type TalentRadarSpiller,
} from "@/components/admin/v2/AdminTalentRadarV2";

export const dynamic = "force-dynamic";

/** De fem faste radar-aksene (TalentTracking-felt → norsk aksenavn). */
const AKSER = [
  { key: "fysisk", label: "Fysisk" },
  { key: "teknikk", label: "Teknikk" },
  { key: "taktikk", label: "Taktikk" },
  { key: "mental", label: "Mental" },
  { key: "motivasjon", label: "Motivasjon" },
] as const;

/** Snitt av ikke-null-verdier (identisk med detaljskjermen). */
function snitt(v: Array<number | null | undefined>): number | null {
  const tall = v.filter((n): n is number => typeof n === "number");
  if (tall.length === 0) return null;
  return tall.reduce((a, b) => a + b, 0) / tall.length;
}

export default async function V2AdminTalentRadarPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  // Alle talenter i programmet (samme filter som liste-skjermen).
  const talenter = await prisma.talentTracking.findMany({
    where: { user: { deletedAt: null } },
    select: {
      niva: true,
      region: true,
      klubb: true,
      fysisk: true,
      teknikk: true,
      taktikk: true,
      mental: true,
      motivasjon: true,
      user: { select: { id: true, name: true, hcp: true } },
    },
  });

  // Rå-verdier per talent, justert mot AKSER-rekkefølgen.
  const raa = talenter.map((t) => ({
    userId: t.user.id,
    navn: t.user.name,
    niva: t.niva,
    region: t.region,
    klubb: t.klubb,
    hcp: t.user.hcp,
    verdier: [t.fysisk, t.teknikk, t.taktikk, t.mental, t.motivasjon] as (number | null)[],
  }));

  const spillere: TalentRadarSpiller[] = raa.map((r) => {
    // Peers = andre talenter på samme nivå (samme som detaljskjermen).
    const peers = raa.filter((p) => p.userId !== r.userId && p.niva === r.niva);
    const peerSnitt = AKSER.map((_, i) => snitt(peers.map((p) => p.verdier[i])));
    const vurdert = r.verdier.filter((v): v is number => typeof v === "number");
    return {
      userId: r.userId,
      navn: r.navn,
      niva: r.niva,
      region: r.region,
      klubb: r.klubb,
      hcp: r.hcp,
      verdier: r.verdier,
      sum: vurdert.reduce((a, b) => a + b, 0),
      antallVurdert: vurdert.length,
      snitt: snitt(r.verdier),
      peerSnitt,
      peerAntall: peers.length,
      peerTotalSnitt: snitt(peerSnitt),
    };
  });

  // Sortering: mest vurdert/sterkest først, uvurderte sist, deretter navn.
  spillere.sort((a, b) => {
    if (a.sum !== b.sum) return b.sum - a.sum;
    return a.navn.localeCompare(b.navn, "nb");
  });

  const data: TalentRadarData = {
    coachNavn: user.name ?? "Coach",
    akser: AKSER.map((a) => ({ key: a.key, label: a.label })),
    spillere,
  };

  return (
    <V2Shell aktiv="spillere" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <TilbakeLenke href="/admin/spillere">Stall</TilbakeLenke>
      <AdminTalentRadarV2 data={data} />
    </V2Shell>
  );
}
