"use client";

/**
 * AgencyOS Spiller-plan — v2 (retning C «Presis»). Coach-kontekst: oversikt
 * over en spillers tekniske utviklingsplaner (TechnicalPlan) med snarvei til
 * Workbench. Ingen mockup fantes — komponert utelukkende av v2-biblioteket
 * (src/components/v2), ingen ad-hoc UI, ingen rå hex (kun T.*).
 *
 * Funksjon/data bevart 1:1 fra den ekte skjermen
 * (src/app/admin/spillere/[id]/plan/page.tsx):
 *   - TechnicalPlan-liste (navn/status/start-/sluttdato) med samme sortering:
 *     ACTIVE → DRAFT → ARCHIVED, nyeste (updatedAt) først innen hver gruppe.
 *   - Status-etiketter Aktiv/Utkast/Arkivert.
 *   - Ærlig tom-tilstand med «Lag plan» → Workbench når spilleren har 0 planer.
 *   - Hver rad lenker til plan-detaljen; footer lenker til Workbench.
 *
 * Merk: den ekte ruten redirecter til detaljen når spilleren har nøyaktig én
 * plan. Det er ruteatferd, ikke komponentatferd — komponenten viser alltid en
 * ærlig liste (også ved én plan) så forhåndsvisningen er komplett.
 */

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Caps,
  Tittel,
  Kort,
  Rad,
  KpiFlis,
  StatusPill,
  CTAPill,
  TilbakeLenke,
  Knapp,
  InnsiktChip,
  TomTilstand,
  Icon,
  T,
  type StatusTone,
} from "@/components/v2";
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

  // ── Hode ──────────────────────────────────────────────────────
  const hode = (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
      <div>
        <Caps>{spiller.navn} · AgencyOS · Utviklingsplaner</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="planer.">Tekniske</Tittel>
        </div>
      </div>
      <div className="hidden md:inline-flex" style={{ gap: 8 }}>
        <TilbakeLenke href={`/admin/spillere/${spiller.id}`}>Tilbake til {spiller.navn}</TilbakeLenke>
        <Link href={workbenchHref} style={{ textDecoration: "none" }}>
          <CTAPill icon="plus">Lag plan</CTAPill>
        </Link>
      </div>
    </div>
  );

  // ── KPI-flis (kun når det finnes planer) ──────────────────────
  const kpi =
    sortert.length > 0 ? (
      <div className="grid grid-cols-3" style={{ gap: T.gap }}>
        <KpiFlis label="Planer" value={sortert.length} />
        <KpiFlis label="Aktive" value={aktive} />
        <KpiFlis label="Utkast" value={utkast} />
      </div>
    ) : null;

  // ── Plan-liste / tom-tilstand ─────────────────────────────────
  const liste =
    sortert.length === 0 ? (
      <Kort>
        <TomTilstand
          icon="file-text"
          title="Ingen utviklingsplaner ennå"
          sub={`${spiller.navn} har ingen tekniske planer. Lag en plan i Workbench for å sette mål, periodisering og drills.`}
        />
        <div style={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
          <Knapp icon="plus" onClick={() => router.push(workbenchHref)}>
            Lag plan
          </Knapp>
        </div>
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
            leading={<Icon name="file-text" size={17} style={{ color: T.mut, flex: "none" }} />}
            title={plan.navn}
            sub={datoStreng(plan.startDato, plan.sluttDato)}
            meta={<StatusPill tone={STATUS_TONE[plan.status]}>{STATUS_LABEL[plan.status]}</StatusPill>}
            last={i === sortert.length - 1}
          />
        ))}
      </Kort>
    );

  // ── AI-innsikt → Workbench ────────────────────────────────────
  const innsiktTekst =
    sortert.length === 0
      ? `${spiller.navn} mangler en utviklingsplan — sett mål og periodisering samlet i Workbench.`
      : aktive === 0
        ? "Ingen aktiv plan akkurat nå — publiser et utkast eller bygg videre i Workbench."
        : `${pl(aktive, "aktiv plan", "aktive planer")} — juster mål, drills og periodisering i Workbench.`;
  const innsikt = <InnsiktChip cta="Planlegg i Workbench" href={workbenchHref}>{innsiktTekst}</InnsiktChip>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}
      {kpi}
      {liste}
      {innsikt}
    </div>
  );
}
