/**
 * AgencyOS — Workbench (uke / måned / år).
 *
 * Uke er redigerflaten. Måned og år er leseflater (C1): klikk dag/uke
 * åpner uken, årscelle åpner måneden — ingen redigering der.
 */

import { notFound } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { mondayOf, monthStartOf } from "@/lib/domain/workbench/operations";
import type { WorkbenchMode } from "@/lib/domain/workbench/types";
import { loadMonth, loadSources, loadWeek, loadYear } from "@/lib/workbench/wb-actions";
import { UI } from "@/lib/domain/workbench/labels";
import { parseVisning } from "@/lib/workbench/visning-url";
import { WorkbenchUke } from "@/components/workbench/WorkbenchUke";
import { WorkbenchLeseflate } from "@/components/workbench/WorkbenchLeseflate";
import { WorkbenchFeil } from "@/components/workbench/WorkbenchFeil";
import { TL_SCOPE } from "@/components/workbench/wb-tl-scope";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ playerId: string }>;
  searchParams: Promise<{ vis?: string; uke?: string; maned?: string; aar?: string }>;
};

const ISO_DATO = /^\d{4}-\d{2}-\d{2}$/;
const ISO_MANED = /^\d{4}-\d{2}$/;
const ISO_AAR = /^\d{4}$/;

function osloIdag(): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date());
}

export default async function WorkbenchUkePage({ params, searchParams }: Props) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { playerId } = await params;
  const sp = await searchParams;
  const visning = parseVisning(sp.vis);

  const spiller = await prisma.user.findFirst({
    where: { AND: [coachScopedPlayerWhere(user), { id: playerId }] },
    select: { id: true, name: true },
  });
  if (!spiller) notFound();

  const idag = osloIdag();
  const mode: WorkbenchMode = { kind: "AGENCY", subjectId: playerId, sources: ["OEKTER"] };
  const navn = spiller.name ?? UI.unnamedPlayer;

  if (visning === "maned") {
    const raw = sp.maned && ISO_MANED.test(sp.maned) ? `${sp.maned}-01` : monthStartOf(idag);
    const manedRes = await loadMonth({ monthStart: raw, mode, playerId });
    return (
      <div style={TL_SCOPE}>
        <V2Shell aktiv="planlegge" nav={AGENCYOS_NAV} navn={user.name ?? undefined}>
          {manedRes.ok ? (
            <WorkbenchLeseflate
              playerId={playerId}
              spillerNavn={navn}
              visning="maned"
              maned={manedRes.data}
              aar={null}
            />
          ) : (
            <WorkbenchFeil melding={manedRes.error} />
          )}
        </V2Shell>
      </div>
    );
  }

  if (visning === "aar") {
    const year = sp.aar && ISO_AAR.test(sp.aar) ? Number(sp.aar) : Number(idag.slice(0, 4));
    const aarRes = await loadYear({ year, mode, playerId });
    return (
      <div style={TL_SCOPE}>
        <V2Shell aktiv="planlegge" nav={AGENCYOS_NAV} navn={user.name ?? undefined}>
          {aarRes.ok ? (
            <WorkbenchLeseflate
              playerId={playerId}
              spillerNavn={navn}
              visning="aar"
              maned={null}
              aar={aarRes.data}
            />
          ) : (
            <WorkbenchFeil melding={aarRes.error} />
          )}
        </V2Shell>
      </div>
    );
  }

  const weekStart = mondayOf(sp.uke && ISO_DATO.test(sp.uke) ? sp.uke : idag);

  const [ukeRes, kilderRes] = await Promise.all([
    loadWeek({ weekStart, mode, playerId }),
    loadSources({ playerId, weekStart }),
  ]);

  return (
    <div style={TL_SCOPE}>
      <V2Shell aktiv="planlegge" nav={AGENCYOS_NAV} navn={user.name ?? undefined}>
        {ukeRes.ok ? (
          <WorkbenchUke
            playerId={playerId}
            spillerNavn={navn}
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
