"use client";
import { TL } from "@/lib/v2/train-lock";
/**
 * AgencyOS Spiller-plan — v2 Presis + B-pakke (status + én primær «Lag plan»).
 * TechnicalPlan-liste · KPI · tom = Workbench. Kun T.* / v2.
 */

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Caps, Kort, Rad, KpiFlis, StatusPill, CTAPill, TilbakeLenke, InnsiktChip, TomTilstand, Icon, type StatusTone } from "@/components/v2";
import type { TechPlanStatus } from "@/generated/prisma/client";

// ── Datakontrakt (mappes fra TechnicalPlan i ruten) ─────────────
export interface SpillerPlanRad {
  id: string;
  navn: string;
  status: TechPlanStatus;
  startDato: Date;
  sluttDato: Date | null;
  updatedAt: Date;
}
export interface AdminSpillerPlanData {
  spiller: { id: string; navn: string };
  planer: SpillerPlanRad[];
}

// Etiketter + status-farge (klarspråk, aldri sperre-språk).
const STATUS_LABEL: Record<TechPlanStatus, string> = {
  DRAFT: "Utkast",
  ACTIVE: "Aktiv",
  ARCHIVED: "Arkivert",
};
const STATUS_TONE: Record<TechPlanStatus, StatusTone> = {
  ACTIVE: "lime",
  DRAFT: "warn",
  ARCHIVED: "info",
};
// ACTIVE øverst, så DRAFT, så ARCHIVED — nyeste først innen hver gruppe.
const STATUS_RANK: Record<TechPlanStatus, number> = {
  ACTIVE: 0,
  DRAFT: 1,
  ARCHIVED: 2,
};

const pl = (n: number, en: string, flere: string) => `${n} ${n === 1 ? en : flere}`;

function datoStreng(start: Date, slutt: Date | null): string {
  const fmt = (d: Date) =>
    d.toLocaleDateString("nb-NO", { day: "2-digit", month: "short" }).toUpperCase();
  return slutt ? `${fmt(start)} — ${fmt(slutt)}` : fmt(start);
}

export function AdminSpillerPlanV2({ data }: { data: AdminSpillerPlanData }) {
  const router = useRouter();
  const { spiller } = data;

  const sortert = [...data.planer].sort((a, b) => {
    const rank = STATUS_RANK[a.status] - STATUS_RANK[b.status];
    if (rank !== 0) return rank;
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  });

  const aktive = sortert.filter((p) => p.status === "ACTIVE").length;
  const utkast = sortert.filter((p) => p.status === "DRAFT").length;

  const workbenchHref = `/admin/spillere/${spiller.id}/workbench`;

  const statusTone: StatusTone =
    aktive > 0 ? "lime" : utkast > 0 ? "warn" : sortert.length > 0 ? "info" : "warn";
  const statusTekst =
    aktive > 0
      ? pl(aktive, "aktiv", "aktive")
      : utkast > 0
        ? pl(utkast, "utkast", "utkast")
        : sortert.length > 0
          ? "Kun arkivert"
          : "Ingen planer";

  // ── Hode — B: status ──────────────────────────────────────────
  const hode = (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <TilbakeLenke href={`/admin/spillere/${spiller.id}`}>Tilbake til {spiller.navn}</TilbakeLenke>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <div>
          <div data-paper-pattern-topp data-paper-slug="agencyos-planbibliotek">
          <h1 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 17, fontWeight: 600, color: TL.text }}>Spillerplan</h1>
          <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute, marginTop: 2 }}>AgencyOS</span>
        </div>
        </div>
        <StatusPill tone={statusTone}>{statusTekst}</StatusPill>
      </div>
    </div>
  );

  // ── KPI ───────────────────────────────────────────────────────
  const kpi = (
    <div className="grid grid-cols-3" style={{ gap: 16 }}>
      <KpiFlis label="Planer" value={sortert.length} />
      <KpiFlis label="Aktive" value={aktive} tint={aktive > 0} />
      <KpiFlis label="Utkast" value={utkast} />
    </div>
  );

  // B: én primær
  const primaerCta = (
    <Link href={workbenchHref} style={{ textDecoration: "none", display: "block" }}>
      <CTAPill icon="plus" full>
        {sortert.length === 0 ? "Lag første plan" : "Lag plan"}
      </CTAPill>
    </Link>
  );

  // ── Plan-liste / tom-tilstand ─────────────────────────────────
  const liste =
    sortert.length === 0 ? (
      <Kort>
        <TomTilstand
          icon="file-text"
          title="Ingen utviklingsplaner ennå"
          sub={`${spiller.navn} har ingen tekniske planer. Sett mål, periodisering og drills i Workbench.`}
        />
      </Kort>
    ) : (
      <Kort
        eyebrow="Utviklingsplaner"
        action={<Caps size={9}>{pl(sortert.length, "plan", "planer")}</Caps>}
      >
        {sortert.map((plan, i) => (
          <Rad
            key={plan.id}
            onClick={() => router.push(`/admin/spillere/${spiller.id}/plan/${plan.id}`)}
            leading={<Icon name="file-text" size={17} style={{ color: TL.mute, flex: "none" }} />}
            title={plan.navn}
            sub={datoStreng(plan.startDato, plan.sluttDato)}
            meta={<StatusPill tone={STATUS_TONE[plan.status]}>{STATUS_LABEL[plan.status]}</StatusPill>}
            last={i === sortert.length - 1}
          />
        ))}
      </Kort>
    );

  const innsiktTekst =
    sortert.length === 0
      ? `${spiller.navn} mangler en utviklingsplan — sett mål og periodisering samlet i Workbench.`
      : aktive === 0
        ? "Ingen aktiv plan akkurat nå — publiser et utkast eller bygg videre i Workbench."
        : `${pl(aktive, "aktiv plan", "aktive planer")} — juster mål, drills og periodisering i Workbench.`;

  return (
    <div data-paper-wave-h="spiller-plan" data-paper-pattern style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 960, margin: "0 auto", width: "100%" }}>
      {hode}
      {kpi}
      {primaerCta}
      {liste}
      <InnsiktChip cta="Planlegg i Workbench" href={workbenchHref}>{innsiktTekst}</InnsiktChip>
    </div>
  );
}
