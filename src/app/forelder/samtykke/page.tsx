/**
 * v2-forhåndsvisning — Foreldreportal · Samtykke (retning C). Egen top-level
 * route-group (v2preview) som IKKE arver forelder-layouten — kun root-layout.
 * V2Shell leverer chrome-en (IkonRail/BunnNav med FORELDER_NAV), ForelderSamtykkeV2
 * rendrer innholds-stacken.
 *
 * Auth + dataloader gjenbrukt 1:1 fra den ekte siden (src/app/forelder/samtykke/page.tsx):
 * kun PARENT slippes inn, relasjoner + siste slette-forespørsel hentes uendret, og
 * samtykke-håndhevelsen bor uendret i server-actionene komponenten kaller.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, FORELDER_NAV } from "@/components/v2/shell";
import { hentSamtykkeStatus } from "@/lib/health/samtykke";
import {
  grupperMedEksterneLesereForSpiller,
  hentDelingsStatus,
} from "@/lib/deling/samtykke";
import {
  ForelderSamtykkeV2,
  type ForelderSamtykkeData,
} from "@/components/portal/v2/ForelderSamtykkeV2";
import {
  DelingSamtykkeKort,
  type DelingGruppeStatus,
} from "@/components/portal/v2/DelingSamtykkeKort";

export const dynamic = "force-dynamic";

export default async function V2ForelderSamtykkePreviewPage() {
  const user = await requirePortalUser({ allow: ["PARENT"] });

  const relasjoner = await prisma.parentRelation.findMany({
    where: { parentId: user.id, approved: true },
    include: {
      child: {
        select: { id: true, name: true, email: true, preferences: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const sisteSletting = await prisma.dataExportRequest.findFirst({
    where: { userId: user.id, type: "DELETE" },
    orderBy: { createdAt: "desc" },
    select: { type: true, status: true, createdAt: true },
  });

  // Alle påkrevde samtykker aktive på alle barn. GDPR-personvern vinner:
  // manglende/udefinert samtykke-pref regnes som IKKE gitt (samme semantikk
  // som ForelderSamtykkeV2 sin `prefs[key] ?? false`), ikke som aktiv.
  const requiredKeys = ["dataDeling", "fotoBruk", "thirdParty"];
  const alleAktive =
    relasjoner.length > 0 &&
    relasjoner.every((r) => {
      const prefs =
        (r.child.preferences as Record<string, boolean> | null) ?? {};
      return requiredKeys.every((k) => prefs[k] === true);
    });

  const barnNavn =
    relasjoner.length === 1
      ? (relasjoner[0]?.child.name.split(" ")[0] ?? "barnet") + "s"
      : "barnas";

  // Helsedata-samtykkene bor i egen tabell (sporbare rader), ikke i
  // preferences — hentes derfor per barn.
  const helsePerBarn = new Map(
    await Promise.all(
      relasjoner.map(
        async (r) =>
          [r.child.id, await hentSamtykkeStatus(r.child.id)] as const,
      ),
    ),
  );

  // T8: delingssamtykke (Team Norway/WANG) per barn — kun grupper der en
  // aktiv ekstern leser finnes. For mindreårige er foresatt-raden herfra den
  // eneste som teller i ekstern-leser-scopet.
  const delingPerBarn = new Map<
    string,
    { navn: string; grupper: DelingGruppeStatus[] }
  >(
    await Promise.all(
      relasjoner.map(async (r) => {
        const grupper = await grupperMedEksterneLesereForSpiller(r.child.id);
        const status = await hentDelingsStatus(
          r.child.id,
          grupper.map((g) => g.id),
        );
        const kart = new Map(status.map((s) => [s.gruppeId, s]));
        return [
          r.child.id,
          {
            navn: r.child.name,
            grupper: grupper.map((g) => ({
              gruppeId: g.id,
              gruppeNavn: g.name,
              testResultater: kart.get(g.id)?.testResultater ?? false,
              stats: kart.get(g.id)?.stats ?? false,
            })),
          },
        ] as const;
      }),
    ),
  );

  const data: ForelderSamtykkeData = {
    barn: relasjoner.map((r) => ({
      id: r.child.id,
      name: r.child.name,
      email: r.child.email,
      prefs: (r.child.preferences as Record<string, boolean> | null) ?? {},
      helse: {
        wearable: helsePerBarn.get(r.child.id)?.wearable ?? false,
        manuell: helsePerBarn.get(r.child.id)?.manuell ?? false,
        coachInnsyn: helsePerBarn.get(r.child.id)?.coachInnsyn ?? false,
        coachDetalj: helsePerBarn.get(r.child.id)?.coachDetalj ?? false,
      },
    })),
    barnNavn,
    alleAktive,
    sisteSletting: sisteSletting
      ? {
          type: sisteSletting.type,
          status: sisteSletting.status,
          createdAt: sisteSletting.createdAt.toISOString(),
        }
      : null,
  };

  return (
    <V2Shell
      bredde="kolonne"
      aktiv="oversikt"
      nav={FORELDER_NAV}
      navn={user.name}
      avatarUrl={user.avatarUrl}
    >
      <ForelderSamtykkeV2 data={data} />
      {/* T8: delingssamtykke per barn — funksjonelt, merkes for fasit-runde. */}
      {relasjoner.map((r) => {
        const deling = delingPerBarn.get(r.child.id);
        if (!deling || deling.grupper.length === 0) return null;
        return (
          <div key={r.child.id} style={{ maxWidth: 720, margin: "16px auto 0", width: "100%" }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
              Deling for {deling.navn}
            </div>
            <DelingSamtykkeKort
              grupper={deling.grupper}
              modus={{ type: "foresatt", childId: r.child.id }}
            />
          </div>
        );
      })}
    </V2Shell>
  );
}
