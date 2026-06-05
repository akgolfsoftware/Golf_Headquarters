/**
 * PlayerHQ Analysere (/portal/analysere) — v10-design.
 *
 * Rendrer <AnalyseHub> (v10-fasit fra pl-analyse, jf. _screens/pl-analyse.png)
 * med EKTE data fra hentTreningsanalyse (Prisma). mapAnalyseData aggregerer den
 * flate økt-loggen til per-akse-dekomponering (timer + andel) og kobler netto-SG
 * som KPI. Tom-tilstand når ingen økter er loggført — aldri liksom-tall.
 *
 * Server component. Auth-guard via requirePortalUser. Skall (sidebar/bunn-nav)
 * eies av layout — denne siden rendrer kun innholdet.
 *
 * SG-ærlighet (jf. treningsanalyse-data.ts): SG finnes KUN per SG-kategori i
 * datamodellen, ikke per pyramide-akse. Derfor settes per-akse-SG til 0 (flat)
 * og netto-SG vises separat i KPI-stripen — ingen utdiktet SG per akse.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import {
  hentTreningsanalyse,
  type TreningsanalyseData,
  type AkseKey,
} from "@/lib/portal-analyse/treningsanalyse-data";
import {
  AnalyseHub,
  type AnalyseHubData,
  type AkseRad,
} from "@/components/portal/analyse/analyse-hub";

export const dynamic = "force-dynamic";

/** Periode-vindu som matcher v10-fasiten (KPI-etikett «30 dager»). */
const PERIODE_DAGER = 30;
const PERIODE_LABEL = "30 dager";

/** Pyramide-akse → kort/full label (samme som Treningsanalyse-grupperingen). */
const AKSE_LABEL: Record<AkseKey, { kort: string; full: string }> = {
  fys: { kort: "FYS", full: "Fysisk" },
  tek: { kort: "TEK", full: "Teknikk" },
  slag: { kort: "SLAG", full: "Slag" },
  spill: { kort: "SPILL", full: "Spill" },
  turn: { kort: "TURN", full: "Turnering" },
};

const AKSE_REKKEFOLGE: AkseKey[] = ["fys", "tek", "slag", "spill", "turn"];

/** Kort visningsnavn «Øyvind R.» fra fullt navn. */
function kortNavn(navn: string): string {
  const deler = navn.trim().split(/\s+/).filter(Boolean);
  if (deler.length === 0) return "Spiller";
  const fornavn = deler[0];
  const etternavnInitialer = deler
    .slice(1)
    .map((d) => `${d[0].toUpperCase()}.`)
    .join("");
  return etternavnInitialer ? `${fornavn} ${etternavnInitialer}` : fornavn;
}

/**
 * Oversetter ekte TreningsanalyseData → v10 AnalyseHubData.
 * Aggregerer den flate økt-loggen (siste 30 d) per pyramide-akse.
 * Tom logg → akser: [] (bevarer tom-tilstand). Per-akse-SG = 0 (se SG-ærlighet).
 */
function mapAnalyseData(
  data: TreningsanalyseData,
  spillerNavn: string,
): AnalyseHubData {
  const iPeriode = data.okter.filter((o) => o.d <= PERIODE_DAGER);

  // Timer + antall økter per akse.
  const timerPerAkse = new Map<AkseKey, number>();
  for (const o of iPeriode) {
    timerPerAkse.set(o.axis, (timerPerAkse.get(o.axis) ?? 0) + o.t);
  }

  const totalTimer = iPeriode.reduce((sum, o) => sum + o.t, 0);

  const akser: AkseRad[] = AKSE_REKKEFOLGE.filter(
    (k) => (timerPerAkse.get(k) ?? 0) > 0,
  ).map((k) => {
    const timer = timerPerAkse.get(k) ?? 0;
    return {
      akse: k,
      kort: AKSE_LABEL[k].kort,
      full: AKSE_LABEL[k].full,
      timer,
      maalTimer: null,
      // SG finnes kun per SG-kategori, ikke per akse → 0 (flat), netto vises i KPI.
      sg: 0,
      andel: totalTimer > 0 ? Math.round((timer / totalTimer) * 100) : 0,
    };
  });

  return {
    spillerNavn,
    periodeLabel: PERIODE_LABEL,
    totalTimer,
    nettoSg: data.sgNetto ?? 0,
    antallOkter: iPeriode.length,
    akser,
    hrefs: {
      sgHub: "/portal/mal/sg-hub",
      planlegge: "/portal/planlegge",
    },
  };
}

export default async function AnalyserePage() {
  const user = await requirePortalUser();
  const treningsanalyse = await hentTreningsanalyse(user.id);

  return (
    <AnalyseHub data={mapAnalyseData(treningsanalyse, kortNavn(user.name))} />
  );
}
