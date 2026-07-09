/**
 * v2-forhåndsvisning — AgencyOS Spiller-analyse (retning C). Egen top-level
 * route-group (v2preview) som IKKE arver AdminShell — kun root-layout — så
 * V2Shell leverer chrome-en (IkonRail/BunnNav) i mørk v2-scope.
 *
 * Coach-speilet av PlayerHQ «Analysere»: samme loadere som den ekte
 * /admin/spillere/[id]/analyse-siden (loadMinGolf i «elite»-dybde +
 * loadAnalyticsWorkbenchData). Detaljruten trenger en spiller — vi henter en
 * EKTE eksempel-spiller fra coachens egen stall (loadStallen) og fullt navn fra
 * Prisma (kanon: alltid fullt navn). Ingen spillere → ærlig tom-tilstand.
 *
 * Server component.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { loadStallen } from "@/lib/admin/stallen-data";
import { loadMinGolf } from "@/lib/min-golf/load-min-golf";
import { loadAnalyticsWorkbenchData } from "@/app/portal/analysere/actions";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { Kort, Caps, Tittel, TomTilstand } from "@/components/v2";
import { AdminSpillerAnalyseV2 } from "@/components/admin/v2/AdminSpillerAnalyseV2";

export const dynamic = "force-dynamic";

export default async function V2SpillerAnalysePage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  // Eksempel-spiller: en EKTE spiller fra coachens egen stall (ingen fabrikering).
  // Foretrekk en med registrerte runder så forhåndsvisningen viser den faktiske
  // rekomposisjonen (grafer/stolper), ikke bare tom-tilstander — faller ellers
  // tilbake til første i stallen, og til ærlig tomt om coachen ikke har spillere.
  const stall = await loadStallen({ id: user.id, role: user.role }, {});
  const rosterIds = stall.rows.map((r) => r.id);
  const medRunde = rosterIds.length
    ? await prisma.round.findFirst({
        where: { userId: { in: rosterIds } },
        orderBy: { playedAt: "desc" },
        select: { userId: true },
      })
    : null;
  const eksempelId = medRunde?.userId ?? stall.rows[0]?.id ?? null;

  // Fullt navn fra kilden (loadStallen forkorter — kanon krever fullt navn).
  const spiller = eksempelId
    ? await prisma.user.findUnique({
        where: { id: eksempelId, role: "PLAYER" },
        select: { id: true, name: true },
      })
    : null;

  if (!spiller) {
    return (
      <V2Shell aktiv="spillere" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
        <div>
          <Caps>Coach-dybde · Spiller-analyse</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel em="analyse">Spiller</Tittel>
          </div>
        </div>
        <Kort>
          <TomTilstand
            icon="users"
            title="Ingen spillere i stallen"
            sub="Koble en spiller til deg for å se full analyse i coach-dybde."
          />
        </Kort>
      </V2Shell>
    );
  }

  // Coach ser alltid full dekomponering → «elite»-dybde (som den ekte siden).
  const [minGolf, workbench] = await Promise.all([
    loadMinGolf(spiller.id, "elite"),
    loadAnalyticsWorkbenchData(spiller.id),
  ]);

  return (
    <V2Shell aktiv="spillere" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <AdminSpillerAnalyseV2
        navn={spiller.name ?? "Spiller"}
        spillerId={spiller.id}
        data={{ minGolf, workbench }}
      />
    </V2Shell>
  );
}
