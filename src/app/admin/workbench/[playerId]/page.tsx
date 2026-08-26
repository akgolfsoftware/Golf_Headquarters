/**
 * AgencyOS — Workbench-uke på den nye økt-modellen (natt-plan A1–A4, Loop 2).
 *
 * Egen rute ved siden av den eksisterende coach-workbenchen
 * (`/admin/spillere/[id]/workbench`), som fortsatt kjører på den gamle
 * plan-modellen. De to deler ingen tabeller, så denne kan bygges ferdig uten
 * å røre noe som er i drift.
 *
 * Server component: auth + første uke-last. All skriving skjer i klienten via
 * server actions i `src/lib/workbench/wb-actions.ts`.
 */

import { notFound } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { mondayOf } from "@/lib/domain/workbench/operations";
import type { WorkbenchMode } from "@/lib/domain/workbench/types";
import { loadSources, loadWeek } from "@/lib/workbench/wb-actions";
import { UI } from "@/lib/domain/workbench/labels";
import { WorkbenchUke } from "@/components/workbench/WorkbenchUke";
import { WorkbenchFeil } from "@/components/workbench/WorkbenchFeil";
import { TL_SCOPE } from "@/components/workbench/wb-tl-scope";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ playerId: string }>;
  searchParams: Promise<{ uke?: string }>;
};

const ISO_DATO = /^\d{4}-\d{2}-\d{2}$/;

function osloIdag(): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date());
}

export default async function WorkbenchUkePage({ params, searchParams }: Props) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { playerId } = await params;
  const { uke } = await searchParams;

  const spiller = await prisma.user.findFirst({
    where: { AND: [coachScopedPlayerWhere(user), { id: playerId }] },
    select: { id: true, name: true },
  });
  if (!spiller) notFound();

  const weekStart = mondayOf(uke && ISO_DATO.test(uke) ? uke : osloIdag());
  const mode: WorkbenchMode = { kind: "AGENCY", subjectId: playerId, sources: ["OEKTER"] };

  const [ukeRes, kilderRes] = await Promise.all([
    loadWeek({ weekStart, mode, playerId }),
    loadSources({ playerId, weekStart }),
  ]);

  return (
    // Train-lock (D3): skygger --v2-*/--p-*/shadcn-basen for HELE skjermen
    // (rail inkludert, ikke bare innholdskolonnen) — se wb-tl-scope.ts.
    <div style={TL_SCOPE}>
      <V2Shell aktiv="planlegge" nav={AGENCYOS_NAV} navn={user.name ?? undefined}>
        {ukeRes.ok ? (
          <WorkbenchUke
            playerId={playerId}
            spillerNavn={spiller.name ?? UI.unnamedPlayer}
            uke={ukeRes.data}
            kilder={kilderRes.ok ? kilderRes.data : []}
          />
        ) : (
          <WorkbenchFeil melding={ukeRes.error} />
        )}
      </V2Shell>
    </div>
  );
}
