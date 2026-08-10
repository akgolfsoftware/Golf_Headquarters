/**
 * PlayerHQ · FYS-plan (/portal/tren/fys-plan) — Paper-port W1 (fase2).
 * Fasit: designsystem/paper/fase2/playerhq/playerhq-fys-plan.html.
 *
 * Struktur per fasit: «Én ting nå»-blokk med dagens FYS-økt (TrainingPlanSession,
 * akse FYS) → aktive planer (FysiskPlan → uker → økter) → ærlig FYS-score-
 * plassholder. FYS-resultatformelen er IKKE låst — aldri fabrikkerte tall.
 * Prisma-spørringen for planene er uendret.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "@/lib/uke-helpers";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { T } from "@/lib/v2/tokens";
import { Caps, Kort, TilbakeLenke } from "@/components/v2";
import { Icon } from "@/components/v2/icon";
import Link from "next/link";
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

const OSLO_TID = new Intl.DateTimeFormat("nb-NO", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Oslo",
});

export default async function FysPlanListePage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  const idag = new Date();
  const [planer, dagensFys] = await Promise.all([
    prisma.fysiskPlan.findMany({
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
    }),
    // Fasit: «Én ting nå» = dagens FYS-økt fra TrainingPlanSession (akse FYS).
    prisma.trainingPlanSession.findFirst({
      where: {
        plan: { userId: user.id },
        pyramidArea: "FYS",
        status: "PLANNED",
        scheduledAt: { gte: startOfDay(idag), lte: endOfDay(idag) },
      },
      orderBy: { scheduledAt: "asc" },
      select: { id: true, title: true, scheduledAt: true, durationMin: true, location: true },
    }),
  ]);

  const enriched = enrichPlaner(planer);
  const aktive = enriched.filter((p) => p.status !== "ARCHIVED");
  const arkiverte = enriched.filter((p) => p.status === "ARCHIVED");
  const harNoen = enriched.length > 0;

  return (
    <V2Shell bredde="kolonne" aktiv="plan" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/tren">Tren</TilbakeLenke>
      <div
        data-paper-slug="playerhq-fys-plan"
        data-od-id="playerhq-fys-plan"
        style={{ display: "flex", flexDirection: "column", gap: T.gap, maxWidth: 720, margin: "0 auto", width: "100%" }}
      >
        {/* Topp — fasit: FYS / Fysiske treningsplaner */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: 0, fontFamily: T.disp, fontSize: 17, fontWeight: 600, color: T.fg }}>FYS</h1>
            <span style={{ display: "block", fontFamily: T.mono, fontSize: 10.5, color: T.mut, marginTop: 2 }}>
              Fysiske treningsplaner
            </span>
          </div>
          {harNoen && <NyPlanKnapp variant="header" />}
        </div>

        {/* Én ting nå — dagens FYS-økt (kun når den finnes; aldri fabrikkert) */}
        {dagensFys && (
          <div
            style={{
              background: T.handlingSoft,
              border: `1px solid ${T.border}`,
              borderRadius: T.rCard,
              padding: 16,
            }}
          >
            <Caps>Én ting nå</Caps>
            <h3 style={{ margin: "8px 0", fontFamily: T.disp, fontSize: 15, fontWeight: 600, color: T.fg }}>
              {dagensFys.title}
              {" · "}
              <span style={{ fontFamily: T.mono, fontVariantNumeric: "tabular-nums" }}>
                {OSLO_TID.format(dagensFys.scheduledAt)}
              </span>
            </h3>
            <p style={{ margin: "0 0 16px", fontFamily: T.bodyFont, fontSize: 14, color: T.mut, maxWidth: "52ch" }}>
              {dagensFys.location ? `${dagensFys.location} · ` : ""}
              {dagensFys.durationMin} min. Økta ligger i planen din i dag.
            </p>
            {/* Kontrakt §3: skjermens ene aksenthandling */}
            <Link
              href={`/portal/gjennomfore/${dagensFys.id}`}
              data-od-id="fys-start"
              className="v2-press v2-focus"
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 56,
                width: "100%",
                borderRadius: T.rCard,
                background: T.handling,
                color: T.onHandling,
                fontFamily: T.ui,
                fontSize: 14,
                fontWeight: 600,
              }}
              data-paper-en-ting="true"
            >
              Start FYS-økta
            </Link>
          </div>
        )}

        {/* Aktive planer */}
        {aktive.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Caps>aktive planer · {aktive.length}</Caps>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {aktive.map((p) => (
                <FysPlanKort key={p.id} plan={p} />
              ))}
            </div>
          </div>
        )}

        {/* Arkiverte planer */}
        {arkiverte.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Caps>arkiverte · {arkiverte.length}</Caps>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {arkiverte.map((p) => (
                <FysPlanKort key={p.id} plan={p} />
              ))}
            </div>
          </div>
        )}

        {/* Tom tilstand — fasit-copy, én vei videre */}
        {!harNoen && (
          <div
            style={{
              padding: "24px 16px",
              background: T.panel2,
              border: `1px dashed ${T.border}`,
              borderRadius: T.rCard,
            }}
          >
            <h3 style={{ margin: "0 0 8px", fontFamily: T.disp, fontSize: 15, fontWeight: 600, color: T.fg }}>
              Ingen FYS-plan ennå
            </h3>
            <p style={{ margin: "0 0 12px", fontFamily: T.bodyFont, fontSize: 13.5, color: T.mut }}>
              Det ligger ingen fysisk plan for deg ennå. Lag en i Workbench — den teller i totalen
              sammen med golftreningen.
            </p>
            <NyPlanKnapp variant="empty-state" primary={!dagensFys} />
          </div>
        )}

        {/* FYS-score — ÆRLIG plassholder til formelen er låst (fasit-copy) */}
        {harNoen && (
          <div
            style={{
              display: "flex",
              gap: 12,
              padding: "12px 16px",
              borderRadius: T.rCard,
              background: T.panel2,
              border: `1px solid ${T.border}`,
              fontFamily: T.bodyFont,
              fontSize: 12.5,
              color: T.mut,
            }}
          >
            <Icon name="clock" size={16} style={{ color: T.mut, flex: "none", marginTop: 2 }} />
            <span>
              FYS-score kommer. Anders bekrefter referanseverdiene før tall vises her — vi viser
              heller ingenting enn tall som ikke stemmer.
            </span>
          </div>
        )}
      </div>
    </V2Shell>
  );
}
