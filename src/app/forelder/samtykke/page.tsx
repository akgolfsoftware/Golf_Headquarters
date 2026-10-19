/**
 * Foreldreportal · Samtykke (FO-05) i Precision Athletics, i ForelderSkall.
 * Kun PARENT slippes inn. Relasjoner og siste slette-forespørsel hentes uendret, og
 * samtykke-håndhevelsen bor uendret i server-handlingene komponentene kaller.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { ForelderSkall } from "@/components/precision/ForelderSkall";
import "@/styles/flater-ny-forelder-profil.css";
import { hentSamtykkeStatus } from "@/lib/health/samtykke";
import {
  grupperMedEksterneLesereForSpiller,
  hentDelingsStatus,
} from "@/lib/deling/samtykke";
import {
  FO05Samtykke,
  type ForelderSamtykkeData,
} from "@/components/forelder/FO05Samtykke";
import {
  FO05DelingSamtykke,
  type DelingGruppeStatus,
} from "@/components/forelder/FO05DelingSamtykke";
import { hentWangTestdeling, type WangTestdeling } from "@/lib/portal-tester/wang-resultat-tilgang";
import { WangTestforesporsel } from "@/components/portal/precision/WangTestforesporsel";

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
  // som FO05Samtykke sin `prefs[key] ?? false`), ikke som aktiv.
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
    { navn: string; grupper: DelingGruppeStatus[]; wangTestdeling: WangTestdeling[]; wangPlandeling: WangTestdeling[] }
  >(
    await Promise.all(
      relasjoner.map(async (r) => {
        const grupper = await grupperMedEksterneLesereForSpiller(r.child.id);
        const wangTestdeling = await hentWangTestdeling(r.child.id);
        const wangPlandeling = await hentWangTestdeling(r.child.id, "TRENINGSPLAN");
        const status = await hentDelingsStatus(
          r.child.id,
          grupper.map((g) => g.id),
        );
        const kart = new Map(status.map((s) => [s.gruppeId, s]));
        return [
          r.child.id,
          {
            navn: r.child.name,
            wangTestdeling,
            wangPlandeling,
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
    parentName: user.name,
    sisteSletting: sisteSletting
      ? {
          type: sisteSletting.type,
          status: sisteSletting.status,
          createdAt: sisteSletting.createdAt.toISOString(),
        }
      : null,
  };

  return (
    <ForelderSkall>
      <FO05Samtykke data={data} />
      {/* T8: delingssamtykke per barn. */}
      {relasjoner.map((r) => {
        const deling = delingPerBarn.get(r.child.id);
        if (!deling || (deling.grupper.length === 0 && deling.wangTestdeling.length === 0)) return null;
        return (
          <div key={r.child.id} className="fo-side" style={{ marginTop: 16 }}>
            <section className="fop-seksjon">
              <h2>Deling for {deling.navn}</h2>
              {deling.wangTestdeling.map((d) => (
                <WangTestforesporsel key={d.gruppeId} {...d} modus={{ type: "foresatt", childId: r.child.id, barnNavn: deling.navn }} />
              ))}
              {deling.wangPlandeling.map((d) => (
                <WangTestforesporsel key={`plan-${d.gruppeId}`} {...d} modus={{ type: "foresatt", childId: r.child.id, barnNavn: deling.navn }} omfang="TRENINGSPLAN" />
              ))}
              {deling.grupper.length > 0 && (
                <FO05DelingSamtykke grupper={deling.grupper} modus={{ type: "foresatt", childId: r.child.id }} />
              )}
            </section>
          </div>
        );
      })}
    </ForelderSkall>
  );
}
