"use client";
import { TL } from "@/lib/v2/train-lock";
/**
 * PlayerHQ · SG-hub · Utstyr-helsesjekk (equipment fit) — v2 Presis + B-pakke (status + én primær CTA, tom = vei).
 * T.* only. Lys PlayerHQ.
 */

import Link from "next/link";
import { Caps, Kort, StatusPill, type StatusTone, TilbakeLenke, Tittel, TomTilstand, HjelpTips, Icon } from "@/components/v2";
import type { HjelpNokkel } from "@/lib/v2/hjelpetekster";
import type {
  ClubFitReport,
  FitMetric,
  FitStatus,
} from "@/lib/sg-hub/equipment-fit";

export interface UtstyrHelseV2Props {
  backHref: string;
  spillerNavn?: string;
  reports: ClubFitReport[];
}

// Status → v2-signal. Data-signaler bruker up/warn/down (aldri lime på data);
// «missing» er nøytralt (info).
const STATUS_TONE: Record<FitStatus, StatusTone> = {
  ok: "up",
  warn: "warn",
  critical: "down",
  missing: "info",
};
const STATUS_IKON: Record<FitStatus, string> = {
  ok: "check-circle",
  warn: "triangle-alert",
  critical: "x-circle",
  missing: "help-circle",
};
const STATUS_FARGE: Record<FitStatus, string> = {
  ok: TL.ok,
  warn: TL.warn,
  critical: TL.danger,
  missing: TL.mute,
};
const STATUS_LABEL: Record<FitStatus, string> = {
  ok: "I target",
  warn: "Utenfor target",
  critical: "Kritisk avvik",
  missing: "Data mangler",
};

// Faguttrykk med hjelpetekst i tekstbanken. Launch og Spin har ingen nøkkel
// ennå (rapportert, ikke oppfunnet lokalt) — kun Smash har «smashFactor».
const METRIC_HJELP: Record<string, HjelpNokkel> = {
  Smash: "smashFactor",
};

export function UtstyrHelseV2({ backHref, spillerNavn, reports }: UtstyrHelseV2Props) {
  return (
    <div data-paper-portal-utstyr-helse style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
      <TilbakeLenke href={backHref}>SG-hub</TilbakeLenke>

      {/* Topptekst */}
      <div>
        <Caps>Fase 5 · equipment fit</Caps>
        <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <Tittel mobile em="-helsesjekk">
            Utstyr
            {spillerNavn ? <span style={{ color: TL.mute, fontWeight: 500 }}> · {spillerNavn}</span> : null}
          </Tittel>
          <HjelpTips k="trackman" />
        </div>
        <p style={{ fontFamily: TL.font.sans, fontSize: 13.5, color: TL.mute, lineHeight: 1.55, margin: "10px 0 0", maxWidth: 620 }}>
          Launch, spin og smash sjekkes mot optimale target-vinduer per kølletype.
          Avvik kan tyde på feil køllevalg, oppsett eller ball-fitting — og er ofte
          raskere å fikse enn teknikk.
        </p>
      </div>

      {/* Tegnforklaring */}
      <Kort pad="14px 18px">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {(["ok", "warn", "critical", "missing"] as FitStatus[]).map((s) => (
            <span key={s} style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
              <StatusMerke status={s} />
              <span style={{ fontFamily: TL.font.sans, fontSize: 12, color: TL.mute }}>{STATUS_LABEL[s]}</span>
            </span>
          ))}
        </div>
      </Kort>

      {reports.length === 0 ? (
        <Kort>
          <TomTilstand
            icon="wrench"
            title="Ingen TrackMan-data ennå"
            sub="Importer din første økt for å aktivere equipment-helsesjekk."
          />
          <div style={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
            <Link href="/portal/mal/trackman" style={{ textDecoration: "none" }}>
              <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 48, width: "100%", padding: "10px 16px",
            borderRadius: 10, background: TL.fill, color: TL.onFill, fontFamily: TL.font.sans, fontSize: 14, fontWeight: 600,
          }}>Importer din første økt</span>
            </Link>
          </div>
        </Kort>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {reports.map((r) => (
            <KolleKort key={r.clubId} report={r} />
          ))}
        </div>
      )}
    </div>
  );
}

function KolleKort({ report }: { report: ClubFitReport }) {
  return (
    <Kort pad="16px 18px">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 14 }}>
        <div>
          <Caps size={9}>{categoryLabel(report.category)}</Caps>
          <div style={{ fontFamily: TL.font.sans, fontSize: 19, fontWeight: 700, letterSpacing: "-0.01em", color: TL.text, marginTop: 5 }}>
            {report.clubId}
          </div>
        </div>
        <StatusPill tone={STATUS_TONE[report.overall]}>{STATUS_LABEL[report.overall]}</StatusPill>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {report.metrics.length === 0 ? (
          <p style={{ fontFamily: TL.font.sans, fontSize: 12, color: TL.mute, margin: 0 }}>
            Ingen target-vinduer definert for denne køllen.
          </p>
        ) : (
          report.metrics.map((m, i) => <MetrikkRad key={i} metric={m} />)
        )}
      </div>

      <p style={{ fontFamily: TL.font.mono, fontSize: 10, letterSpacing: "0.04em", color: TL.mute, margin: "14px 0 0" }}>
        Basert på {report.shotCount} slag
      </p>
    </Kort>
  );
}

function MetrikkRad({ metric }: { metric: FitMetric }) {
  const hjelp = METRIC_HJELP[metric.label];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        padding: "9px 12px",
        borderRadius: 10,
        background: TL.dock,
        border: `1px solid ${TL.hair}`,
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: 7, minWidth: 0 }}>
        <StatusMerke status={metric.status} />
        <span style={{ fontFamily: TL.font.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: TL.mute }}>
          {metric.label}
        </span>
        {hjelp && <HjelpTips k={hjelp} size={11} />}
      </span>
      <span style={{ textAlign: "right", flex: "none" }}>
        <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 13, fontWeight: 600, color: TL.text, fontVariantNumeric: "tabular-nums" }}>
          {metric.value === null ? "—" : `${formatValue(metric.value, metric.unit)}${metric.unit}`}
        </span>
        {metric.target && (
          <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 10, color: TL.mute, marginTop: 2 }}>
            Target: {formatNum(metric.target.min)}–{formatNum(metric.target.max)}
            {metric.unit}
          </span>
        )}
      </span>
    </div>
  );
}

function StatusMerke({ status }: { status: FitStatus }) {
  return <Icon name={STATUS_IKON[status]} size={15} style={{ color: STATUS_FARGE[status], flex: "none" }} />;
}

// --- Presentasjonshjelpere (uendret logikk fra original, komma-desimal for norsk) ---

function formatValue(value: number, unit: string): string {
  if (unit === "rpm") return Math.round(value).toString();
  if (unit === "°") return value.toFixed(1).replace(".", ",");
  return value.toFixed(2).replace(".", ",");
}

function formatNum(value: number): string {
  return String(value).replace(".", ",");
}

function categoryLabel(category: ClubFitReport["category"]): string {
  switch (category) {
    case "driver":
      return "Driver";
    case "iron":
      return "Jern";
    case "wedge":
      return "Wedge";
    case "wood":
      return "Trefelg";
    case "putter":
      return "Putter";
    default:
      return "Annet";
  }
}
