"use client";

/**
 * AgencyOS Plan-maler — v2 Presis + B-pakke (status + én primær CTA, tom = vei).
 * T.* only. Mørk AgencyOS. Gjenbrukbare plan-skjeletter.
 */

import Link from "next/link";
import { useState } from "react";
import {
  Caps,
  Kort,
  KpiFlis,
  FilterChips,
  CTAPill,
  Knapp,
  StatusPill,
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
  /** Godkjent kan rulles ut til grupper/spillere. Utkast kan ikke (fasit: agencyos-planbibliotek). */
  godkjent: boolean;
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

/** Rader per gruppe før «Vis N til». Holder mobilsiden på én skjermlengde. */
const VIS_ANTALL = 8;

const pl = (n: number, en: string, flere: string) => `${n} ${n === 1 ? en : flere}`;

/**
 * Kompakt malrad — fasitens `.rad` i `agencyos-planbibliotek.html`:
 * navn, én metalinje, tynn andelsstripe og prosentnøkler. Ikke et kort.
 * Utkast vises uten stripe (fasit viser den kun for godkjente maler).
 */
function MalRad({ m, last }: { m: PlanMalRad; last?: boolean }) {
  const bruk =
    m.usageCount === 0 ? "aldri brukt" : `brukt ${pl(m.usageCount, "gang", "ganger")}`;
  const meta = `${pl(m.oktAntall, "økt", "økter")} · ${bruk} · ${m.godkjent ? "godkjent" : "utkast"}`;
  const andeler = m.fordeling.filter((f) => f.value > 0);
  const visStripe = m.godkjent && andeler.length > 0;
  // Fasit viser alle andelene, største først, og lar linja brytes.
  const nokler = andeler.slice().sort((a, b) => b.value - a.value);

  return (
    <Link
      href={`/admin/plan-templates/${m.id}`}
      className="v2-row-h"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "11px 10px",
        margin: "0 -10px",
        borderRadius: T.rRow,
        borderBottom: last ? "none" : `1px solid ${T.border}`,
        textDecoration: "none",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 32,
          height: 32,
          flex: "none",
          borderRadius: 9,
          background: T.panel3,
          border: `1px solid ${T.border}`,
        }}
      >
        <Icon name={FASE_IKON[m.fase]} size={16} style={{ color: T.lime }} />
      </span>

      {/* minWidth 0: uten den sprenger nowrap-teksten kolonnen (gotcha 10.08) */}
      <span style={{ flex: 1, minWidth: 0, display: "block" }}>
        <span
          style={{
            display: "block",
            fontFamily: T.ui,
            fontSize: 13.5,
            fontWeight: 600,
            color: T.fg,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {m.navn}
        </span>
        <span
          style={{
            display: "block",
            fontFamily: T.ui,
            fontSize: 11.5,
            color: T.mut,
            marginTop: 2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {meta}
        </span>

        {visStripe && (
          <>
            <span
              style={{ display: "flex", gap: 2, height: 6, borderRadius: 999, overflow: "hidden", marginTop: 7 }}
              aria-hidden
            >
              {andeler.map((f) => (
                <span key={f.akse} style={{ display: "block", flex: f.value, background: T.ax[f.akse] }} />
              ))}
            </span>
            <span
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                marginTop: 5,
                fontFamily: T.mono,
                fontSize: 10,
                color: T.mut,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {nokler.map((f) => (
                <span key={f.akse}>
                  {f.akse} <b style={{ fontWeight: 500, color: T.fg }}>{f.value} %</b>
                </span>
              ))}
            </span>
          </>
        )}
      </span>

      <Icon name="chevron-right" size={14} style={{ color: T.mut, flex: "none" }} />
    </Link>
  );
}

/** Gruppeseksjon med tittel, teller og forklaringsnotat — fasitens `.grp`. */
function Gruppe({
  tittel,
  teller,
  notat,
  maler,
}: {
  tittel: string;
  teller: string;
  notat: string;
  maler: PlanMalRad[];
}) {
  const [visAlle, setVisAlle] = useState(false);
  const synlige = visAlle ? maler : maler.slice(0, VIS_ANTALL);
  const skjulte = maler.length - synlige.length;

  return (
    <Kort>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
        <h2 style={{ margin: 0, fontFamily: T.disp, fontSize: 14, fontWeight: 600, color: T.fg }}>{tittel}</h2>
        <span style={{ fontFamily: T.mono, fontSize: 10.5, color: T.mut, fontVariantNumeric: "tabular-nums" }}>
          {teller}
        </span>
      </div>
      <p style={{ margin: "6px 0 4px", fontFamily: T.ui, fontSize: 11.5, lineHeight: 1.45, color: T.mut }}>
        {notat}
      </p>
      <div style={{ minWidth: 0 }}>
        {synlige.map((m, i) => (
          <MalRad key={m.id} m={m} last={i === synlige.length - 1 && skjulte === 0} />
        ))}
      </div>
      {skjulte > 0 && (
        <Knapp icon="chevron-down" ghost full onClick={() => setVisAlle(true)}>
          Vis {skjulte} til
        </Knapp>
      )}
    </Kort>
  );
}

const STATUS_FILTRE = ["Godkjent", "Utkast"] as const;

export function AdminPlanMalerV2({ data }: { data: AdminPlanMalerData }) {
  const [fase, setFase] = useState<string[]>([]);
  const [status, setStatus] = useState<string[]>([]);

  const toggle = (x: string) =>
    setFase((arr) => (arr.indexOf(x) !== -1 ? arr.filter((y) => y !== x) : arr.concat(x)));
  const toggleStatus = (x: string) =>
    setStatus((arr) => (arr.indexOf(x) !== -1 ? arr.filter((y) => y !== x) : arr.concat(x)));

  const total = data.maler.length;
  const totalBruk = data.maler.reduce((sum, m) => sum + m.usageCount, 0);
  const totalGodkjent = data.maler.filter((m) => m.godkjent).length;

  // Fasit merker status-pillene med antall (Godkjent 18 / Utkast 6).
  // Etiketten ER filterverdien, så teller og valg aldri kan komme i utakt.
  const statusEtikett = {
    godkjent: `${STATUS_FILTRE[0]} ${totalGodkjent}`,
    utkast: `${STATUS_FILTRE[1]} ${total - totalGodkjent}`,
  };

  const filtrert = data.maler.filter(
    (m) =>
      (fase.length === 0 || fase.indexOf(FASE_LABEL[m.fase]) !== -1) &&
      (status.length === 0 ||
        status.indexOf(m.godkjent ? statusEtikett.godkjent : statusEtikett.utkast) !== -1),
  );
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
        <div data-paper-pattern-topp data-paper-slug="agencyos-planbibliotek">
          <h1 style={{ margin: 0, fontFamily: T.disp, fontSize: 17, fontWeight: 600, color: T.fg }}>Planmaler</h1>
          <span style={{ display: "block", fontFamily: T.mono, fontSize: 10.5, color: T.mut, marginTop: 2 }}>AgencyOS</span>
        </div>
      </div>
      <StatusPill tone={statusTone}>{statusTekst}</StatusPill>
    </div>
  );

  // B: én primær CTA
  const primaerCta = (
    <Link href="/admin/plan-templates/ny" style={{ textDecoration: "none", display: "block" }}>
      <CTAPill icon="plus" full enTing>
        Ny mal
      </CTAPill>
    </Link>
  );

  if (total === 0) {
    return (
      <div data-paper-wave-h="plan-maler" data-paper-pattern style={{ display: "flex", flexDirection: "column", gap: T.gap, maxWidth: 960, margin: "0 auto", width: "100%" }}>
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

  // ── KPI-flis (4) ──────────────────────────────────────────────
  const kpi = (
    <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: T.gap }}>
      <KpiFlis label="Maler" value={total} />
      <KpiFlis label="Godkjent" value={totalGodkjent} tint />
      <KpiFlis label="Total bruk" value={totalBruk} />
      <KpiFlis label="Snitt lengde (uker)" value={snittUker} />
    </div>
  );

  // ── Status- og fase-filter ──────────────────────────────────────
  const filtre = (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <Caps size={9} style={{ width: 64, flex: "none" }}>Status</Caps>
        <FilterChips
          items={[statusEtikett.godkjent, statusEtikett.utkast]}
          active={status}
          onToggle={toggleStatus}
        />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <Caps size={9} style={{ width: 64, flex: "none" }}>Fase</Caps>
        <FilterChips items={[...FASE_FILTRE]} active={fase} onToggle={toggle} />
      </div>
    </div>
  );

  // ── Grupper: Mest brukt (godkjent) + Utkast — fasitens `.grp` ──
  const godkjente = filtrert.filter((m) => m.godkjent);
  const utkast = filtrert.filter((m) => !m.godkjent);

  const liste =
    filtrert.length === 0 ? (
      <Kort>
        <TomTilstand icon="filter" title="Ingen maler her" sub="Ingen maler passer filteret akkurat nå." />
      </Kort>
    ) : (
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap, minWidth: 0 }}>
        {godkjente.length > 0 && (
          <Gruppe
            tittel="Mest brukt"
            teller={pl(godkjente.length, "godkjent", "godkjente")}
            notat="Rekkefølgen følger bruk, ikke navn — malen du rullet ut sist ligger derfor ikke nødvendigvis øverst."
            maler={godkjente}
          />
        )}
        {utkast.length > 0 && (
          <Gruppe
            tittel="Utkast"
            teller={String(utkast.length)}
            notat="Utkast kan ikke rulles ut til grupper. De må godkjennes først."
            maler={utkast}
          />
        )}
      </div>
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}
      {primaerCta}
      {kpi}
      {filtre}
      {liste}
    </div>
  );
}
