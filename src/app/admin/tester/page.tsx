/**
 * v2-forhåndsvisning — AgencyOS Tester (retning C). Egen top-level route-group
 * (v2preview) som IKKE arver AdminShell — kun root-layout. V2Shell leverer
 * chrome-en (IkonRail/BunnNav), AdminTesterV2 rendrer innholds-stacken.
 *
 * Auth + dataloader speiler den ekte /admin/tester-flaten 1:1:
 *   - prisma.testSession (IN_PROGRESS) → «Pågår»-rader
 *   - prisma.testResult (siste 20)     → resultat-rader m/ delta + status
 *   - count siste 30 d / 7 d           → KPI «Tester utført» / «Sist uke»
 *   - snitt score siste 30 d           → KPI «Snitt-score»
 *
 * All mapping til AdminTesterV2Data skjer her (serverside) så klientkomponenten
 * er ren presentasjon. Ingen fabrikerte tall — mangler i schemaet vises ærlig.
 */

import { requireCapability } from "@/lib/auth/requireCapability";
import { Capability } from "@/lib/auth/cbac";
import { hentAdminTestData } from "@/lib/portal-tester/admin-resultat-data";
import { formaterLagretTestResultat, sammenlignLagredeTestresultater } from "@/lib/portal-tester/resultat-visning";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AG15Tester } from "@/components/admin/precision/AG15Tester";

import type {
  AdminTesterV2Data,
  AdminTesterV2Rad,
  AdminTesterStatus,
} from "@/components/admin/v2/AdminTesterV2";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tester · AgencyOS" };

function datoLabel(d: Date): string {
  return d.toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit" });
}

/**
 * Er endringen for liten til å bety noe? Terskelen må være relativ, ikke
 * absolutt: den gamle grensen på 0,05 tilsvarte 5 prosentpoeng for en
 * PEI-test — nesten hele spennet fra Scratch til PGA-nivå ble «Stabilt» —
 * mens den var meningsløst streng for en drivertest målt i meter.
 */
function erUbetydelig(diff: number, forrige: number): boolean {
  if (forrige === 0) return diff === 0;
  return Math.abs(diff / forrige) < 0.01;
}

export default async function V2AdminTesterPage() {
  // G6: MANAGE_TESTS ligger i COACH-defaulten — kan trekkes per trener.
  const user = await requireCapability(Capability.MANAGE_TESTS);

  const { paagaaende, resultater, antall30, antall7, d30 } = await hentAdminTestData(user);

  // Antall ULIKE tester i bruk siste 30 d. Her sto tidligere en «Snitt-score»
  // som summerte score på tvers av alle tester og delte på antallet — den
  // blandet PEI-brøker, kilo, meter, poeng og sekunder i ett tall og var
  // meningsløst uansett scoring-type. Et snitt over ulike måleenheter finnes
  // ikke; dekningen gjør det.
  const siste30 = resultater.filter((r) => r.takenAt >= d30);
  const testerIBruk = new Set(siste30.map((r) => r.test.name)).size;

  const rader: AdminTesterV2Rad[] = [
    ...paagaaende.map(
      (s): AdminTesterV2Rad => ({
        key: `s-${s.id}`,
        spillerId: s.user.id,
        navn: s.user.name,
        test: s.test.name,
        resultat: "—",
        delta: null,
        deltaDir: null,
        dato: datoLabel(s.startedAt),
        status: "Pågår",
      }),
    ),
    ...resultater.slice(0, 14).map((r, index): AdminTesterV2Rad => {
      // Each row compares with its own predecessor, never itself or a namesake test.
      const forrige = resultater.slice(index + 1).find(x => x.user.id === r.user.id && x.testId === r.testId);
      const endring = forrige ? sammenlignLagredeTestresultater(
        { ...r, protocol: r.test.protocol },
        { ...forrige, protocol: forrige.test.protocol },
      ) : null;
      let delta: string | null = null;
      let deltaDir: "up" | "down" | null = null;
      let status: AdminTesterStatus = "Ferdig";
      if (endring && forrige) {
        const diff = endring.diff;
        if (erUbetydelig(diff, forrige.score)) {
          status = "Stabilt";
        } else {
          const forbedring = endring.lavereErBedre ? diff < 0 : diff > 0;
          delta = endring.tekst;
          deltaDir = forbedring ? "up" : "down";
          status = forbedring ? "Bedre" : "Svakere";
        }
      }
      return {
        key: `r-${r.id}`,
        spillerId: r.user.id,
        navn: r.user.name,
        test: r.test.name,
        resultat: formaterLagretTestResultat({ ...r, protocol: r.test.protocol }),
        delta,
        deltaDir,
        dato: datoLabel(r.takenAt),
        status,
      };
    }),
  ];

  const tester = Array.from(new Set(rader.map((r) => r.test)));

  const data: AdminTesterV2Data = {
    kpis: [
      { label: "Tester utført", value: String(antall30) },
      { label: "Tester i bruk", value: testerIBruk > 0 ? String(testerIBruk) : "—", accent: true },
      { label: "Sist uke", value: String(antall7) },
      { label: "Pågår nå", value: String(paagaaende.length), varsle: paagaaende.length > 0 },
    ],
    tester,
    rader,
  };

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <AG15Tester data={data} />
    </AgencyOSSkall>
  );
}
