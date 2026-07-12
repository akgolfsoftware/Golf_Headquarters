/**
 * PlayerHQ FYS-plan-hub — v2. Liste over fysiske treningsplaner med
 * fremdrift (uke i planen / totale uker). Prisma-spørring uendret
 * (FysiskPlan → uker → okter).
 *
 * FYS-resultatformelen er IKKE låst — FYS-score-seksjonen er et ærlig
 * plassholder-kort uten fabrikkerte tall (jf. låst beslutning).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { T } from "@/lib/v2/tokens";
import { Caps, Tittel, Kort, MikroMeta, TomTilstand, TilbakeLenke } from "@/components/v2";
import { NyPlanKnapp } from "./ny-plan-knapp";
import { FysPlanKort, type FysPlanKortData } from "./fys-plan-kort";

export const dynamic = "force-dynamic";

type RawFysPlan = {
  id: string;
  navn: string;
  status: string;
  startDato: Date;
  sluttDato: Date | null;
  uker: { okter: { id: string }[] }[];
};

// Modulnivå-helper: Date.now() kan ikke kalles i render-body (react-hooks/purity).
function enrichPlaner(planer: RawFysPlan[]): FysPlanKortData[] {
  const now = Date.now();
  return planer.map((p) => {
    const ukerCount = p.uker.length;
    const okterCount = p.uker.reduce((s, u) => s + u.okter.length, 0);
    const start = p.startDato.getTime();
    const weeksElapsed = Math.max(0, Math.floor((now - start) / (7 * 24 * 60 * 60 * 1000)));
    const currentWeek = Math.min(weeksElapsed + 1, ukerCount);
    const pct = ukerCount > 0 ? Math.min(100, Math.round((currentWeek / ukerCount) * 100)) : 0;
    const status: FysPlanKortData["status"] =
      p.status === "ACTIVE" ? "ACTIVE" : p.status === "ARCHIVED" ? "ARCHIVED" : "DRAFT";
    return { id: p.id, navn: p.navn, status, ukerCount, okterCount, pct, currentWeek };
  });
}

export default async function FysPlanListePage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  const planer = await prisma.fysiskPlan.findMany({
    where: { userId: user.id },
    orderBy: { startDato: "desc" },
    include: {
      uker: {
        select: {
          id: true,
          okter: { select: { id: true } },
        },
      },
    },
  });

  const enriched = enrichPlaner(planer);
  const aktive = enriched.filter((p) => p.status !== "ARCHIVED");
  const arkiverte = enriched.filter((p) => p.status === "ARCHIVED");
  const harNoen = enriched.length > 0;

  return (
    <V2Shell aktiv="plan" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/tren">Tren</TilbakeLenke>
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        {/* Hode */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <Caps>Tren · Fysisk plan</Caps>
            <div style={{ marginTop: 10 }}>
              <Tittel em="-plan">FYS</Tittel>
            </div>
          </div>
          <NyPlanKnapp variant="header" />
        </div>

        {/* FYS-score — ærlig plassholder til formelen er låst */}
        <Kort pad="14px 18px">
          <MikroMeta icon="info">
            FYS-score per område kommer — resultatformelen er ikke låst ennå.
          </MikroMeta>
        </Kort>

        {/* Aktive planer */}
        {aktive.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Caps>Aktive ({aktive.length})</Caps>
            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: T.gap }}>
              {aktive.map((p) => (
                <FysPlanKort key={p.id} plan={p} />
              ))}
            </div>
          </div>
        )}

        {/* Arkiverte planer */}
        {arkiverte.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Caps>Arkiverte ({arkiverte.length})</Caps>
            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: T.gap }}>
              {arkiverte.map((p) => (
                <FysPlanKort key={p.id} plan={p} />
              ))}
            </div>
          </div>
        )}

        {/* Tom tilstand */}
        {!harNoen && (
          <Kort>
            <TomTilstand
              icon="dumbbell"
              title="Ingen aktiv plan"
              sub="Lag din første fysiske treningsplan for å begynne å logge styrke- og kondisjonsøkter."
            />
            <div style={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
              <NyPlanKnapp variant="empty-state" />
            </div>
          </Kort>
        )}
      </div>
    </V2Shell>
  );
}
