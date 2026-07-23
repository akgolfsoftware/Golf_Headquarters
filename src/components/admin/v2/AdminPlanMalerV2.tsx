"use client";

/**
 * AgencyOS Plan-maler — v2 Presis + B-pakke (status + én primær CTA, tom = vei).
 * T.* only. Mørk AgencyOS. Gjenbrukbare plan-skjeletter.
 */

import Link from "next/link";
import { useState } from "react";
import {
  Caps,
  Tittel,
  Kort,
  KpiFlis,
  FilterChips,
  CTAPill,
  StatusPill,
  MikroMeta,
  Pyramide,
  TomTilstand,
  Icon,
  T,
} from "@/components/v2";
import type { AkseKey } from "@/lib/v2/tokens";
import type { LPhase } from "@/generated/prisma/enums";

// ── Datakontrakt (mappes fra PlanTemplate i ruten) ──────────────
export interface PlanMalFordeling {
  akse: AkseKey;
  /** Andel av planen for denne aksen, i prosent (0–100). */
  value: number;
}
export interface PlanMalRad {
  id: string;
  navn: string;
  /** NgfKategori (A–K) som streng. */
  kategori: string;
  fase: LPhase;
  varighetUker: number;
  ukentligOktAntall: number;
  usageCount: number;
  /** Antall øktrader i malen (PlanTemplateSession-count). */
  oktAntall: number;
  /** Disiplin-fordeling (topp→base av pyramiden). Tom = ingen gyldig kilde. */
  fordeling: PlanMalFordeling[];
}
export interface AdminPlanMalerData {
  maler: PlanMalRad[];
}

const FASE_IKON: Record<LPhase, string> = {
  GRUNN: "sprout",
  SPESIAL: "target",
  TURNERING: "trophy",
  TESTUKE: "badge-check",
  FERIE: "sun",
  TRENINGSSAMLING: "users",
  HELDAGSSAMLING: "clock",
};
const FASE_LABEL: Record<LPhase, string> = {
  GRUNN: "Grunnfase",
  SPESIAL: "Spesialfase",
  TURNERING: "Turneringsfase",
  TESTUKE: "Testuke",
  FERIE: "Ferie",
  TRENINGSSAMLING: "Treningssamling",
  HELDAGSSAMLING: "Heldagssamling",
};
const FASE_FILTRE = ["Grunnfase", "Spesialfase", "Turneringsfase"] as const;

const pl = (n: number, en: string, flere: string) => `${n} ${n === 1 ? en : flere}`;

function MalKort({ m }: { m: PlanMalRad }) {
  return (
    <Link href={`/admin/plan-templates/${m.id}`} style={{ textDecoration: "none" }}>
      <Kort hover style={{ height: "100%", gap: 12 }}>
        {/* Hode: fase-badge + bruk-teller */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 38,
              height: 38,
              flex: "none",
              borderRadius: 10,
              background: T.panel3,
              border: `1px solid ${T.border}`,
            }}
          >
            <Icon name={FASE_IKON[m.fase]} size={19} style={{ color: T.lime }} />
          </span>
          <span
            style={{
              fontFamily: T.mono,
              fontSize: 10,
              fontWeight: 700,
              color: m.usageCount > 0 ? T.lime : T.mut,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            Brukt {m.usageCount}×
          </span>
        </div>

        {/* Navn */}
        <span
          style={{
            fontFamily: T.disp,
            fontSize: 16,
            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: "-0.015em",
            color: T.fg,
          }}
        >
          {m.navn}
        </span>

        {/* Meta */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <MikroMeta icon={FASE_IKON[m.fase]}>{FASE_LABEL[m.fase]}</MikroMeta>
          <MikroMeta icon="flag">Kat. {m.kategori}</MikroMeta>
          <MikroMeta icon="calendar">{pl(m.varighetUker, "uke", "uker")}</MikroMeta>
          <MikroMeta icon="repeat">{m.ukentligOktAntall}/uke</MikroMeta>
        </div>

        {/* Akse-fordeling */}
        <div style={{ marginTop: "auto", paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
          <Caps size={9}>Akse-fordeling</Caps>
          <div style={{ marginTop: 10 }}>
            {m.fordeling.length > 0 ? (
              <Pyramide data={m.fordeling} max={100} showValues={false} />
            ) : (
              <span style={{ fontFamily: T.ui, fontSize: 12, color: T.mut }}>
                Ingen fordeling registrert.
              </span>
            )}
          </div>
        </div>
      </Kort>
    </Link>
  );
}

export function AdminPlanMalerV2({ data }: { data: AdminPlanMalerData }) {
  const [fase, setFase] = useState<string[]>([]);

  const toggle = (x: string) =>
    setFase((arr) => (arr.indexOf(x) !== -1 ? arr.filter((y) => y !== x) : arr.concat(x)));

  const filtrert = data.maler.filter(
    (m) => fase.length === 0 || fase.indexOf(FASE_LABEL[m.fase]) !== -1,
  );

  const total = data.maler.length;
  const totalBruk = data.maler.reduce((sum, m) => sum + m.usageCount, 0);
  const snittUker =
    total > 0 ? Math.round(data.maler.reduce((s, m) => s + m.varighetUker, 0) / total) : 0;

  // B: status
  const statusTone = total === 0 ? "warn" : totalBruk > 0 ? "up" : "info";
  const statusTekst =
    total === 0 ? "Ingen maler" : totalBruk > 0 ? `Brukt ${totalBruk}×` : pl(total, "mal", "maler");

  // ── Hode — B: status ──────────────────────────────────────────
  const hode = (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
      <div>
        <Caps>{pl(total, "mal", "maler")} · AgencyOS · Planlegge</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="plan-maler.">Dine</Tittel>
        </div>
      </div>
      <StatusPill tone={statusTone}>{statusTekst}</StatusPill>
    </div>
  );

  // B: én primær CTA
  const primaerCta = (
    <Link href="/admin/plan-templates/ny" style={{ textDecoration: "none", display: "block" }}>
      <CTAPill icon="plus" full>
        Ny mal
      </CTAPill>
    </Link>
  );

  if (total === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        {hode}
        <Kort>
          <TomTilstand
            icon="layers"
            title="Ingen maler ennå"
            sub="Opprett den første malen for å spare tid når du lager nye planer."
          />
        </Kort>
        {primaerCta}
      </div>
    );
  }

  // ── KPI-flis (3) ──────────────────────────────────────────────
  const kpi = (
    <div className="grid grid-cols-2 lg:grid-cols-3" style={{ gap: T.gap }}>
      <KpiFlis label="Maler" value={total} />
      <KpiFlis label="Total bruk" value={totalBruk} />
      <KpiFlis label="Snitt lengde (uker)" value={snittUker} />
    </div>
  );

  // ── Fase-filter ───────────────────────────────────────────────
  const filtre = (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <Caps size={9} style={{ width: 64, flex: "none" }}>Fase</Caps>
      <FilterChips items={[...FASE_FILTRE]} active={fase} onToggle={toggle} />
    </div>
  );

  // ── Grid / filtrert tom-tilstand ──────────────────────────────
  const grid =
    filtrert.length === 0 ? (
      <Kort>
        <TomTilstand icon="filter" title="Ingen maler her" sub="Ingen maler passer fase-filteret akkurat nå." />
      </Kort>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: T.gap, alignItems: "stretch" }}>
        {filtrert.map((m) => (
          <MalKort key={m.id} m={m} />
        ))}
      </div>
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}
      {primaerCta}
      {kpi}
      {filtre}
      {grid}
    </div>
  );
}
