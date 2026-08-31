/**
 * AgencyOS — Plan-maler (full liste), flyttet fra /admin/plan-templates
 * (MASTERPLAN 15.9). Samme PlanTemplate-spørring den alltid har brukt
 * (mest brukt → navn), med usageCount og økt-antall (_count.sessions).
 * `/admin/plan-templates` er nå en redirect hit; `/ny`, `/[id]` og
 * `/[id]/rediger` forblir uendret på sine gamle adresser.
 *
 * Nås fra Plan-hubens rader «Ukemaler»/«Treningsprogram» (/admin/plan) —
 * komponenten har ikke en type-filter-dimensjon for ukemaler/program (den
 * filtrerer på fase/status), så begge radene lenker hit uten forsøk på et
 * `?type=`-filter komponenten ikke støtter (ikke bygg om selve
 * planleggingsarbeidet, jf. STEG 15.9-oppgaveteksten).
 *
 * Ingen egen Train-lock-fasit finnes for CRUD-flatene rundt plan-maler
 * (Klasse A-porting, prinsipp-JA fra Anders, se
 * `docs/natt/D-LYS-OG-5T-BESLUTNING.md` §2.2) — dette er en token/skall-jobb,
 * ikke en funksjons-ombygging. `TL_SCOPE` skygger de gamle Paper-fargene
 * (`--v2-*`) om til Train-lock (`--tl-*`) uten å røre komponent-internt
 * markup — samme mønster som Workbench-uka (se
 * `src/components/workbench/wb-tl-scope.ts`).
 *
 * Akse-fordeling: disciplinFordeling er en Json-kolonne — validert med zod
 * (safeParse) før visning, aldri `as`-castet. Ugyldig/ manglende blob → ærlig
 * tom fordeling på det kortet.
 *
 * Server component.
 */

import { z } from "zod";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import {
  AdminPlanMalerV2,
  type AdminPlanMalerData,
  type PlanMalFordeling,
} from "@/components/admin/v2/AdminPlanMalerV2";
import type { AkseKey } from "@/lib/v2/format";
import { TilbakeLenke } from "@/components/v2";
import { bygUkeOversikt } from "@/lib/domain/plan-uke-oversikt";
import { TL_SCOPE } from "@/components/workbench/wb-tl-scope";

export const dynamic = "force-dynamic";
export const metadata = { title: "Plan-maler · AgencyOS" };

// Pyramide-rekkefølge topp→base (TURN øverst, FYS i bunn).
const AKSE_ORDEN: AkseKey[] = ["TURN", "SPILL", "SLAG", "TEK", "FYS"];

// disciplinFordeling: { FYS: 0.15, TEK: 0.25, ... } — andeler (0–1).
const FordelingSchema = z.record(z.string(), z.number());

function tilFordeling(blob: unknown): PlanMalFordeling[] {
  const parsed = FordelingSchema.safeParse(blob);
  if (!parsed.success) return [];
  return AKSE_ORDEN.flatMap((akse) => {
    const andel = parsed.data[akse];
    if (typeof andel !== "number" || !Number.isFinite(andel)) return [];
    return [{ akse, value: Math.round(andel * 100) }];
  });
}

export default async function AdminPlanMalerPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  // Samme select-kontrakt + sortering som den ekte plan-maler-indeksen, utvidet
  // med feltene inspektørpanelet trenger (uke-for-uke + effekt) — se
  // AdminPlanMalerV2 §PlanMalInspektor.
  const rader = await prisma.planTemplate.findMany({
    orderBy: [{ usageCount: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      kategori: true,
      lPhase: true,
      varighetUker: true,
      ukentligOktAntall: true,
      usageCount: true,
      disciplinFordeling: true,
      approved: true,
      effectivenessAvg: true,
      sessions: { select: { ukeNr: true, pyramidArea: true } },
      _count: { select: { sessions: true, effectiveness: true } },
    },
  });

  const data: AdminPlanMalerData = {
    maler: rader.map((m) => ({
      id: m.id,
      navn: m.name,
      kategori: m.kategori,
      fase: m.lPhase,
      varighetUker: m.varighetUker,
      ukentligOktAntall: m.ukentligOktAntall,
      usageCount: m.usageCount,
      oktAntall: m._count.sessions,
      fordeling: tilFordeling(m.disciplinFordeling),
      godkjent: m.approved,
      ukeOversikt: bygUkeOversikt(m.sessions, m.varighetUker),
      effektAvg: m.effectivenessAvg,
      effektAntall: m._count.effectiveness,
    })),
  };

  return (
    <div style={TL_SCOPE}>
      {/* "full" (ikke "kolonne"): inspektørpanelet på ≥1024px er en andre
          kolonne ved siden av lista (fasitens `<aside class="panel">`,
          380px) — samme mønster som AdminGodkjenningerV2 sin «Køen i tall». */}
      <V2Shell bredde="full" aktiv="planlegge" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
        <TilbakeLenke href="/admin/plan">Plan</TilbakeLenke>
        <AdminPlanMalerV2 data={data} />
      </V2Shell>
    </div>
  );
}
