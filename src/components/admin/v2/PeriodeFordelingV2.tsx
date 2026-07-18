"use client";

/**
 * AgencyOS · Innstillinger · Periode-fordeling (fase 1, godkjent 2026-07-18).
 * Coach setter global pyramide-fordeling (min/maks-%) per periode. Presentasjon
 * i v2 (Kort/Caps/Tittel/StatusPill + T-tokens); mutasjoner via server actions.
 * Fordelingen er ANBEFALING (styrer hva invariantene varsler om), aldri sperre.
 * Tom overstyring → dagens default vises. Kun T-tokens, ingen rå hex.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  T, Caps, Tittel, Kort, StatusPill, Knapp, HjelpTips, Icon,
} from "@/components/v2";
import type { PyramidArea } from "@/generated/prisma/client";
import {
  lagrePeriodeFordeling,
  tilbakestillPeriodeFordeling,
  type PeriodeFordelingRad,
} from "@/app/admin/settings/periode-fordeling/actions";

const OMRADER: { key: PyramidArea; navn: string }[] = [
  { key: "FYS", navn: "Fysisk" },
  { key: "TEK", navn: "Teknikk" },
  { key: "SLAG", navn: "Slag" },
  { key: "SPILL", navn: "Spill" },
  { key: "TURN", navn: "Turnering" },
];

function sum(rec: Record<PyramidArea, number>): number {
  return OMRADER.reduce((s, o) => s + (rec[o.key] || 0), 0);
}

export function PeriodeFordelingV2({ rader }: { rader: PeriodeFordelingRad[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap, maxWidth: 900 }}>
      <div>
        <Caps>Metodikk</Caps>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
          <Tittel em="-fordeling">Periode</Tittel>
          <HjelpTips k="pyramideAkse" />
        </div>
        <p style={{ fontFamily: T.ui, fontSize: 13.5, color: T.mut, lineHeight: 1.55, margin: "10px 0 0", maxWidth: 680 }}>
          Sett minimum og maksimum andel (%) per pyramide-område for hver periode. Verdiene
          styrer hva planleggings-varslene reagerer på — de er anbefalinger, aldri sperrer.
          En periode uten egne verdier bruker standard-fordelingen. Etter hvert kommer
          data-drevne forslag du kan godta eller overstyre.
        </p>
      </div>

      {rader.map((rad) => (
        <PeriodeKort key={rad.periodeType} rad={rad} />
      ))}
    </div>
  );
}

function PeriodeKort({ rad }: { rad: PeriodeFordelingRad }) {
  const router = useRouter();
  const [min, setMin] = useState<Record<PyramidArea, number>>(rad.min);
  const [max, setMax] = useState<Record<PyramidArea, number>>(rad.max);
  const [feil, setFeil] = useState<string | null>(null);
  const [lagret, setLagret] = useState(false);
  const [pending, start] = useTransition();

  const minSum = sum(min);
  const maxSum = sum(max);
  const minForHoy = minSum > 100;

  function settFelt(kind: "min" | "max", omr: PyramidArea, verdi: string) {
    const n = Math.max(0, Math.min(100, Math.round(Number(verdi) || 0)));
    if (kind === "min") setMin((p) => ({ ...p, [omr]: n }));
    else setMax((p) => ({ ...p, [omr]: n }));
    setLagret(false);
    setFeil(null);
  }

  function lagre() {
    for (const o of OMRADER) {
      if (min[o.key] > max[o.key]) {
        setFeil(`${o.navn}: minimum kan ikke være større enn maksimum.`);
        return;
      }
    }
    if (minForHoy) {
      setFeil(`Minimumene summerer til ${minSum} % (over 100 %) — umulig å oppfylle samtidig.`);
      return;
    }
    setFeil(null);
    start(async () => {
      try {
        await lagrePeriodeFordeling({ periodeType: rad.periodeType, min, max });
        setLagret(true);
        router.refresh();
      } catch (e) {
        setFeil(e instanceof Error ? e.message : "Kunne ikke lagre.");
      }
    });
  }

  function tilbakestill() {
    start(async () => {
      try {
        await tilbakestillPeriodeFordeling(rad.periodeType);
        router.refresh();
      } catch (e) {
        setFeil(e instanceof Error ? e.message : "Kunne ikke tilbakestille.");
      }
    });
  }

  return (
    <Kort pad="18px 20px">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 17, color: T.fg }}>{rad.label}</span>
          {rad.erOverstyrt ? <StatusPill tone="lime">Overstyrt</StatusPill> : <StatusPill tone="info">Standard</StatusPill>}
        </div>
        <span style={{ fontFamily: T.mono, fontSize: 11, color: minForHoy ? T.warn : T.mut, fontVariantNumeric: "tabular-nums" }}>
          Sum min {minSum} % · maks {maxSum} %
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
        {OMRADER.map((o) => (
          <div key={o.key} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.mut }}>
              {o.navn}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <ProsentFelt label="min" verdi={min[o.key]} onChange={(v) => settFelt("min", o.key, v)} />
              <span style={{ color: T.mut, fontSize: 12 }}>–</span>
              <ProsentFelt label="maks" verdi={max[o.key]} onChange={(v) => settFelt("max", o.key, v)} />
            </div>
          </div>
        ))}
      </div>

      {minForHoy && (
        <p style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: T.ui, fontSize: 12, color: T.warn, margin: "12px 0 0" }}>
          <Icon name="triangle-alert" size={13} />
          Minimumene summerer til over 100 % — juster før du lagrer.
        </p>
      )}
      {feil && <p style={{ fontFamily: T.mono, fontSize: 11, color: T.down, margin: "12px 0 0" }}>{feil}</p>}

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16 }}>
        <Knapp onClick={lagre} disabled={pending}>{pending ? "Lagrer…" : "Lagre"}</Knapp>
        {rad.erOverstyrt && (
          <Knapp ghost onClick={tilbakestill} disabled={pending}>Tilbakestill til standard</Knapp>
        )}
        {lagret && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: T.mono, fontSize: 11, color: T.up }}>
            <Icon name="check" size={13} /> Lagret
          </span>
        )}
      </div>
    </Kort>
  );
}

function ProsentFelt({ label, verdi, onChange }: { label: string; verdi: number; onChange: (v: string) => void }) {
  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <input
        type="number"
        min={0}
        max={100}
        step={5}
        value={verdi}
        aria-label={label}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: 62,
          borderRadius: 9,
          border: `1px solid ${T.border}`,
          background: T.panel2,
          padding: "7px 20px 7px 10px",
          fontSize: 13,
          color: T.fg,
          outline: "none",
          fontVariantNumeric: "tabular-nums",
          boxSizing: "border-box",
        }}
      />
      <span style={{ position: "absolute", right: 8, fontFamily: T.mono, fontSize: 11, color: T.mut, pointerEvents: "none" }}>%</span>
    </span>
  );
}
