/**
 * Etterlevelse — én delt teller/nevner for ukesrapport og digest (D3).
 *
 * Fasitene krever at coachens rapport, spillerens digest og foreldrenes
 * ukerapport viser SAMME tall med SAMME nevner i klartekst («14/16 · publiserte
 * økter med passert slutt»). Regelen bor derfor ett sted.
 *
 * Forskjellen fra `adherencePct` i src/lib/workbench/compliance.ts: den er
 * minutt-vektet prosent og brukes av plan-motoren. Her telles ØKTER, fordi
 * fasitene viser «4/5», ikke «83 %». Begge bygger på samme `oktCompliance`,
 * så de kan aldri komme i utakt om hva som er gjennomført.
 *
 * Hoppet vs. ulogget: hoppet er et aktivt nei fra spilleren, ulogget er
 * stillhet. Begge er utenfor telleren, men de rapporteres hver for seg —
 * fasitens D1c-regel, og digesten sier eksplisitt at hoppet «telles, det
 * gjemmes ikke».
 */

import type { SessionStatus, SessionStatusV2 } from "@/generated/prisma/client";

/**
 * Appen har to adskilte status-enums: `SessionStatus` (eldre
 * TrainingPlanSession) og `SessionStatusV2` (TrainingSessionV2). De deler alle
 * verdiene som betyr noe her — COMPLETED, SKIPPED, CANCELLED — og skiller seg
 * bare i de pågående/avbrutte tilstandene. Etterlevelse skal telle begge
 * slags økter, så modulen tar imot begge enum-typene framfor å tvinge fram en
 * konvertering hos hver konsument.
 */
export type OktStatus = SessionStatus | SessionStatusV2;

export type EtterlevelseOkt = {
  scheduledAt: Date;
  durationMin: number;
  status: OktStatus;
};

/** Aktivt nei fra spilleren — felles for begge enumene. */
const AVVIK: ReadonlySet<string> = new Set(["SKIPPED", "ABANDONED", "CANCELLED"]);

type Bøtte = "gjennomfort" | "hoppet" | "ulogget" | "fremtidig";

function bøtte(okt: EtterlevelseOkt, now: Date): Bøtte {
  if (okt.status === "COMPLETED") return "gjennomfort";
  if (AVVIK.has(okt.status)) return "hoppet";
  const sluttMs = okt.scheduledAt.getTime() + okt.durationMin * 60_000;
  return sluttMs > now.getTime() ? "fremtidig" : "ulogget";
}

export type Etterlevelse = {
  /** Gjennomførte økter. */
  teller: number;
  /** Publiserte økter med passert sluttid. Fremtidige økter teller aldri. */
  nevner: number;
  /** Aktivt nei fra spilleren (SKIPPED/ABANDONED/CANCELLED). */
  hoppet: number;
  /** Forfalt uten logging — stillhet, ikke et nei. */
  ulogget: number;
};

/** Nevner-teksten fasitene bruker ordrett. Vises alltid ved siden av tallet. */
export const NEVNER_TEKST = "publiserte økter med passert slutt";

/**
 * Teller økter i fire bøtter. Fremtidige økter holdes helt utenfor — de kan
 * ennå gjennomføres på plan, så å telle dem som «ikke gjennomført» ville gjort
 * nevneren uærlig tidlig i uka.
 */
export function etterlevelse(
  okter: readonly EtterlevelseOkt[],
  now: Date,
): Etterlevelse {
  let teller = 0;
  let hoppet = 0;
  let ulogget = 0;

  for (const okt of okter) {
    switch (bøtte(okt, now)) {
      case "fremtidig":
        continue;
      case "gjennomfort":
        teller += 1;
        break;
      case "hoppet":
        hoppet += 1;
        break;
      case "ulogget":
        ulogget += 1;
        break;
    }
  }

  return { teller, nevner: teller + hoppet + ulogget, hoppet, ulogget };
}

/**
 * «4/5» — eller null når ingen økter er forfalt ennå. Null betyr «ikke målt»,
 * ikke «null gjennomført»; flatene skal vise tom tilstand, aldri «0/0».
 */
export function etterlevelseTekst(e: Etterlevelse): string | null {
  if (e.nevner === 0) return null;
  return `${e.teller}/${e.nevner}`;
}
