"use client";

/**
 * PlayerHQ Delte planer — v2 (retning C «Presis»). Rekomponert fra den ekte
 * skjermen src/app/portal/coach/plans/page.tsx (coach-delte treningsplaner:
 * TrainingPlan + sessions), men i det mørke v2-språket. Kun v2-komponenter fra
 * "@/components/v2"; ingen ad-hoc UI, ingen rå hex (kun T.*).
 *
 * FUNKSJON bevart 1:1: Pro-gating (GRATIS ser låst tilstand), samme
 * kolonne-inndeling (Aktiv · Fullført · Pause) som filter, gjennomførings-
 * prosent per plan (fullførte / totale økter), og gjennomklikk til den ekte
 * plan-detaljen (/portal/coach/plans/[planId]). Ærlig tom-tilstand når ingen
 * plan finnes — ingenting fabrikkeres.
 *
 * V2Shell (montert i (v2preview)/v2-coach-planer/page.tsx) eier chrome-en —
 * denne komponenten rendrer bare den indre innholds-stacken.
 */

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Tier } from "@/generated/prisma/client";
import {
  T,
  Caps,
  Tittel,
  Kort,
  KpiFlis,
  StatusPill,
  PillTabs,
  CTAPill,
  ProgresjonsBar,
  TomTilstand,
  Icon,
  type StatusTone,
} from "@/components/v2";

/* ── Datakontrakt ──────────────────────────────────────────────────── */

export type PlanKolonne = "aktiv" | "fullfort" | "pause";

export type CoachPlanRad = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date | null;
  isActive: boolean;
  fullfort: number;
  total: number;
  pct: number;
  kolonne: PlanKolonne;
};

export type CoachPlanerData = {
  tier: Tier;
  coachNavn: string | null;
  planer: CoachPlanRad[];
};

/* ── Rene hjelpere (norsk bokmål) ──────────────────────────────────── */

function fmtDato(d: Date): string {
  return d.toLocaleDateString("nb-NO", { month: "short", year: "2-digit" });
}

function periode(start: Date, slutt: Date | null): string {
  return slutt ? `${fmtDato(start)} – ${fmtDato(slutt)}` : `Fra ${fmtDato(start)}`;
}

const KOL: Record<PlanKolonne, { l: string; tone: StatusTone }> = {
  aktiv: { l: "Aktiv", tone: "lime" },
  fullfort: { l: "Fullført", tone: "up" },
  pause: { l: "På pause", tone: "warn" },
};

/** true på klient etter mount når viewport < 768px (styrer kun tallstørrelser). */
function useMobile(): boolean {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const oppdater = () => setM(mq.matches);
    oppdater();
    mq.addEventListener("change", oppdater);
    return () => mq.removeEventListener("change", oppdater);
  }, []);
  return m;
}

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function CoachPlanerV2({ data }: { data: CoachPlanerData }) {
  const mobile = useMobile();
  const { tier, coachNavn, planer } = data;

  const antall = useMemo(
    () => ({
      alle: planer.length,
      aktiv: planer.filter((p) => p.kolonne === "aktiv").length,
      fullfort: planer.filter((p) => p.kolonne === "fullfort").length,
      pause: planer.filter((p) => p.kolonne === "pause").length,
    }),
    [planer],
  );

  const [filter, setFilter] = useState<"alle" | PlanKolonne>("alle");
  const synlige = filter === "alle" ? planer : planer.filter((p) => p.kolonne === filter);

  const hode = (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
      <div>
        <Caps>Coach · Delte planer</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel mobile={mobile} em="planer">Mine</Tittel>
        </div>
        {coachNavn && <Caps size={9} style={{ marginTop: 8 }}>Fra {coachNavn}</Caps>}
      </div>
      {tier !== "GRATIS" && (
        <Link href="/portal/onskeligokt" style={{ textDecoration: "none" }}>
          <CTAPill icon="plus" ghost>Be om plan</CTAPill>
        </Link>
      )}
    </div>
  );

  // Pro-gating — coach-laget plan er en del av Pro (låst, ærlig tekst).
  if (tier === "GRATIS") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        {hode}
        <Kort tint>
          <TomTilstand
            icon="lock"
            title="Krever PlayerHQ Pro"
            sub="Coach-laget plan er en del av Pro-abonnementet (299 kr/mnd). Oppgrader for å se planene coachen deler med deg."
          />
        </Kort>
      </div>
    );
  }

  // Ingen planer ennå — ærlig tom-tilstand.
  if (planer.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        {hode}
        <Kort>
          <TomTilstand
            icon="list"
            title="Ingen planer fra coach"
            sub="Når coachen lager en plan til deg, dukker den opp her."
          />
          <div style={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
            <Link href="/portal/gjennomfore" style={{ textDecoration: "none" }}>
              <CTAPill icon="arrow-up-right" ghost>Til mine økter</CTAPill>
            </Link>
          </div>
        </Kort>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}

      {/* Sammendrag — planer per status */}
      <div className="grid grid-cols-3" style={{ gap: T.gap }}>
        <KpiFlis label="Aktive" value={String(antall.aktiv)} tint={antall.aktiv > 0} />
        <KpiFlis label="Fullført" value={String(antall.fullfort)} />
        <KpiFlis label="På pause" value={String(antall.pause)} />
      </div>

      {/* Filter — samme inndeling som kanban-kolonnene i den ekte skjermen */}
      <PillTabs
        tabs={[
          { id: "alle", l: `Alle · ${antall.alle}` },
          { id: "aktiv", l: `Aktiv · ${antall.aktiv}` },
          { id: "fullfort", l: `Fullført · ${antall.fullfort}` },
          { id: "pause", l: `Pause · ${antall.pause}` },
        ]}
        value={filter}
        onChange={(id) => setFilter(id as "alle" | PlanKolonne)}
      />

      {/* Plan-liste */}
      {synlige.length === 0 ? (
        <Kort>
          <TomTilstand icon="circle" title="Ingen planer her" sub="Bytt filter for å se andre planer." />
        </Kort>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: T.gap }}>
          {synlige.map((p) => (
            <PlanKort key={p.id} plan={p} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Plan-kort ─────────────────────────────────────────────────────── */

function PlanKort({ plan }: { plan: CoachPlanRad }) {
  const status = KOL[plan.kolonne];
  return (
    <Link
      href={`/portal/coach/plans/${plan.id}`}
      style={{ textDecoration: "none", color: "inherit", display: "block" }}
    >
      <Kort hover>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <StatusPill tone={status.tone}>{status.l}</StatusPill>
          <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.mut, whiteSpace: "nowrap" }}>
            {periode(plan.startDate, plan.endDate)}
          </span>
        </div>

        <div
          style={{
            fontFamily: T.disp,
            fontWeight: 700,
            fontSize: 17,
            color: T.fg,
            lineHeight: 1.25,
            marginTop: 12,
            display: "flex",
            alignItems: "center",
            gap: 8,
            justifyContent: "space-between",
          }}
        >
          <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>{plan.name}</span>
          <Icon name="chevron-right" size={16} style={{ color: T.mut, flex: "none" }} />
        </div>

        <div style={{ marginTop: 14 }}>
          <ProgresjonsBar variant="bar" value={plan.pct} max={100} label="Gjennomføring" />
          <Caps size={9} style={{ marginTop: 8 }}>
            {plan.fullfort} / {plan.total} økter fullført
          </Caps>
        </div>
      </Kort>
    </Link>
  );
}
