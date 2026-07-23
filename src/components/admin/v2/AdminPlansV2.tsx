"use client";

/**
 * AgencyOS Treningsplaner — v2 Presis + B-pakke (status + én primær CTA, tom = vei).
 * T.* only. Mørk AgencyOS. Utkast · Aktiv · Fullført · Workbench for ny plan.
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

  // B: status-tone for stallen
  const statusTone: StatusTone =
    data.aktive > 0 ? "lime" : data.utkast > 0 ? "warn" : data.antall > 0 ? "info" : "warn";
  const statusTekst =
    data.aktive > 0
      ? `${pl(data.aktive, "aktiv", "aktive")}`
      : data.utkast > 0
        ? `${pl(data.utkast, "utkast", "utkast")}`
        : data.antall > 0
          ? "Kun fullført"
          : "Ingen planer";

  // ── Én kolonne (kanban-kort med rad-liste) ─────────────────────
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

  // ── Hode — B: status ───────────────────────────────────────────
  const hode = (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
      <div>
        <Caps>Planlegge · Treningsplaner · AgencyOS</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="i drift.">{data.tittel}</Tittel>
        </div>
      </div>
      <StatusPill tone={statusTone}>{statusTekst}</StatusPill>
    </div>
  );

  // ── B: én primær CTA ───────────────────────────────────────────
  const primaerCta = (
    <Link href={data.nyPlanHref} style={{ textDecoration: "none", display: "block" }}>
      <CTAPill icon="plus" full>
        Ny plan
      </CTAPill>
    </Link>
  );

  // Tom stalle — ærlig vei videre
  if (data.antall === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        {hode}
        <Kort>
          <TomTilstand
            icon="file-text"
            title="Ingen treningsplaner ennå"
            sub="Sett opp den første planen i Workbench — den dukker opp her som utkast eller aktiv."
          />
        </Kort>
        {primaerCta}
        <Link
          href={MALER_HREF}
          style={{
            textDecoration: "none",
            textAlign: "center",
            fontFamily: T.ui,
            fontSize: 12,
            fontWeight: 600,
            color: T.mut,
          }}
        >
          Eller start fra en mal →
        </Link>
      </div>
    );
  }

  // ── KPI (3 faser) ──────────────────────────────────────────────
  const kpi = (
    <div className="grid grid-cols-3" style={{ gap: T.gap }}>
      <KpiFlis label="Utkast" value={data.utkast} />
      <KpiFlis label="Aktive" value={data.aktive} tint />
      <KpiFlis label="Fullført" value={data.fullfort} />
    </div>
  );

  const innsiktTekst =
    data.aktive > 0
      ? `${pl(data.aktive, "aktiv plan driver", "aktive planer driver")} spillernes daglige program — juster i Workbench.`
      : data.utkast > 0
        ? "Ingen aktive planer — publiser et utkast eller bygg videre i Workbench."
        : "Ingen aktive planer akkurat nå — bygg videre i Workbench.";

  const mobilTabs = FASER.map((f) => ({ id: f.id, l: `${f.label} · ${iFase(f.id).length}` }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}
      {/* B: status/KPI først, deretter én primær */}
      {kpi}
      {primaerCta}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Link href={MALER_HREF} style={{ textDecoration: "none" }}>
          <CTAPill ghost icon="copy">
            Maler
          </CTAPill>
        </Link>
      </div>

      {/* Desktop: 3-kolonne kanban */}
      <div className="hidden md:grid md:grid-cols-3" style={{ gap: T.gap, alignItems: "start" }}>
        {FASER.map((f) => (
          <div key={f.id}>{renderKolonne(f.id)}</div>
        ))}
      </div>

      {/* Mobil: faneveksler + én kolonne-stabel */}
      <div className="md:hidden" style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <StatusPill tone="info">Fase</StatusPill>
          <PillTabs tabs={mobilTabs} value={mobilFase} onChange={(id) => setMobilFase(id as PlanFase)} />
        </div>
        {renderKolonne(mobilFase, true)}
      </div>

      <InnsiktChip cta="Planlegg i Workbench" href={data.nyPlanHref}>
        {innsiktTekst}
      </InnsiktChip>
    </div>
  );
}
