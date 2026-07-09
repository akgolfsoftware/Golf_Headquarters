"use client";

/**
 * AgencyOS Treningsplaner — v2 (retning C «Presis»). Coach-kontekst: alle
 * treningsplaner (TrainingPlan) fordelt på tre faser — Utkast · Aktiv ·
 * Fullført — med snarvei til Workbench. Ingen mockup fantes for denne flaten;
 * komponert utelukkende av v2-biblioteket (src/components/v2), ingen ad-hoc UI,
 * ingen rå hex (kun T.*).
 *
 * Funksjon/data bevart 1:1 fra den ekte skjermen (src/app/admin/plans/page.tsx):
 *   - Samme fase-bucketing (Fullført = arkivert/utløpt · Aktiv = i drift ·
 *     Utkast = resten) og samme meta-tekster (prosent, uke-spenn, status).
 *   - «Ny plan» → Workbench for spilleren med dagens økt (fasit-beslutning);
 *     wizarden er bevisst fjernet, /admin/plans/new lenkes ikke herfra.
 *   - «Maler» → /admin/plan-templates. Hver rad → plan-detaljen /admin/plans/{id}.
 *   - Template-placeholder-brukerens FYS-malplaner er allerede filtrert i loaderen.
 *
 * Desktop: hode → KPI (3 faser) → kanban med tre kolonner.
 * Mobil: hode → mobil-handlinger → KPI (2-kol) → faneveksler + én kolonne-stabel
 *   (3-kolonne-kanban komprimeres til fane + liste — ekte mobil-layout, ikke
 *   krympet desktop).
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Caps,
  Tittel,
  Kort,
  Rad,
  KpiFlis,
  AvatarInit,
  StatusPill,
  CTAPill,
  PillTabs,
  InnsiktChip,
  TomTilstand,
  T,
  type StatusTone,
} from "@/components/v2";

// ── Datakontrakt (mappes fra TrainingPlan i ruten) ──────────────
export type PlanFase = "utkast" | "aktiv" | "fullfort";
export interface AdminPlanKort {
  id: string;
  navn: string;
  spiller: string;
  meta: string;
  fase: PlanFase;
}
export interface AdminPlansData {
  /** Klarspråks-tittel, f.eks. «Fem planer» / «23 planer». */
  tittel: string;
  antall: number;
  /** Antall per fase (ekte tellinger). */
  utkast: number;
  aktive: number;
  fullfort: number;
  /** «Ny plan» → Workbench for spiller med dagens økt (fallback: stall). */
  nyPlanHref: string;
  kort: AdminPlanKort[];
}

const MALER_HREF = "/admin/plan-templates";

const FASER: { id: PlanFase; label: string; tone: StatusTone; tint: boolean }[] = [
  { id: "utkast", label: "Utkast", tone: "info", tint: false },
  { id: "aktiv", label: "Aktiv", tone: "lime", tint: true },
  { id: "fullfort", label: "Fullført", tone: "info", tint: false },
];

const pl = (n: number, en: string, flere: string) => `${n} ${n === 1 ? en : flere}`;

export function AdminPlansV2({ data }: { data: AdminPlansData }) {
  const router = useRouter();
  const [mobilFase, setMobilFase] = useState<PlanFase>("aktiv");

  const iFase = (f: PlanFase) => data.kort.filter((k) => k.fase === f);

  // ── Én kolonne (kanban-kort med rad-liste) ─────────────────────
  // Plain render-funksjon (ikke JSX-komponent) — unngår at en komponent
  // opprettes under render (react-hooks/static-components).
  const renderKolonne = (f: PlanFase, mobil?: boolean) => {
    const meta = FASER.find((x) => x.id === f)!;
    const rader = iFase(f);
    return (
      <Kort
        tint={meta.tint}
        eyebrow={meta.label}
        action={<Caps size={9}>{rader.length}</Caps>}
        style={mobil ? undefined : { alignSelf: "start" }}
      >
        {rader.length === 0 ? (
          <TomTilstand icon="file-text" title="Ingen planer her" sub={`Ingen planer i fasen «${meta.label}».`} />
        ) : (
          rader.map((k, i) => (
            <Rad
              key={k.id}
              onClick={() => router.push(`/admin/plans/${k.id}`)}
              leading={<AvatarInit navn={k.spiller} size={30} />}
              title={k.navn}
              sub={`${k.spiller} · ${k.meta}`}
              last={i === rader.length - 1}
            />
          ))
        )}
      </Kort>
    );
  };

  // ── Hode ───────────────────────────────────────────────────────
  const hode = (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
      <div>
        <Caps>Planlegge · Treningsplaner · AgencyOS</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="i drift.">{data.tittel}</Tittel>
        </div>
      </div>
      <div className="hidden md:inline-flex" style={{ gap: 8 }}>
        <Link href={MALER_HREF} style={{ textDecoration: "none" }}>
          <CTAPill ghost icon="copy">Maler</CTAPill>
        </Link>
        <Link href={data.nyPlanHref} style={{ textDecoration: "none" }}>
          <CTAPill icon="plus">Ny plan</CTAPill>
        </Link>
      </div>
    </div>
  );

  // ── Mobil-handlinger (full bredde, under hodet) ────────────────
  const mobilHandlinger = (
    <div className="md:hidden" style={{ display: "flex", gap: 8 }}>
      <Link href={MALER_HREF} style={{ textDecoration: "none", flex: 1 }}>
        <span style={{ display: "flex", justifyContent: "center" }}>
          <CTAPill ghost icon="copy">Maler</CTAPill>
        </span>
      </Link>
      <Link href={data.nyPlanHref} style={{ textDecoration: "none", flex: 1 }}>
        <span style={{ display: "flex", justifyContent: "center" }}>
          <CTAPill icon="plus">Ny plan</CTAPill>
        </span>
      </Link>
    </div>
  );

  // ── KPI (3 faser) ──────────────────────────────────────────────
  const kpi = (
    <div className="grid grid-cols-3" style={{ gap: T.gap }}>
      <KpiFlis label="Utkast" value={data.utkast} />
      <KpiFlis label="Aktive" value={data.aktive} tint />
      <KpiFlis label="Fullført" value={data.fullfort} />
    </div>
  );

  // ── AI-innsikt → Workbench ─────────────────────────────────────
  const innsiktTekst =
    data.aktive > 0
      ? `${pl(data.aktive, "aktiv plan driver", "aktive planer driver")} spillernes daglige program — juster mål og periodisering i Workbench.`
      : data.antall > 0
        ? "Ingen aktive planer akkurat nå — publiser et utkast eller bygg videre i Workbench."
        : "Ingen treningsplaner ennå — sett opp den første i Workbench.";
  const innsikt = (
    <Link href={data.nyPlanHref} style={{ textDecoration: "none" }}>
      <InnsiktChip cta="Planlegg i Workbench">{innsiktTekst}</InnsiktChip>
    </Link>
  );

  const mobilTabs = FASER.map((f) => ({ id: f.id, l: `${f.label} · ${iFase(f.id).length}` }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}
      {mobilHandlinger}
      {kpi}

      {/* Desktop: 3-kolonne kanban */}
      <div className="hidden md:grid md:grid-cols-3" style={{ gap: T.gap, alignItems: "start" }}>
        {FASER.map((f) => (
          <div key={f.id}>{renderKolonne(f.id)}</div>
        ))}
      </div>

      {/* Mobil: faneveksler + én kolonne-stabel */}
      <div className="md:hidden" style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <StatusPill tone="lime">Fase</StatusPill>
          <PillTabs tabs={mobilTabs} value={mobilFase} onChange={(id) => setMobilFase(id as PlanFase)} />
        </div>
        {renderKolonne(mobilFase, true)}
      </div>

      {innsikt}
    </div>
  );
}
