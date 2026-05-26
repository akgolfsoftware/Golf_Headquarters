"use client";

import { useState, useTransition } from "react";
import { X, Dumbbell, Zap, Target, Globe, Trophy, Check } from "lucide-react";
import { createSessionsForPeriod } from "@/app/portal/page-actions";
import type { PeriodVolumes } from "@/app/portal/page-actions";

// ---------------------------------------------------------------------------
// MAL_PROSENT fra periodiserings-agent — default-verdier for feltene
// ---------------------------------------------------------------------------

const MAL_PROSENT = {
  FYS: 15,
  TEK: 20,
  SLAG: 35,
  SPILL: 20,
  TURN: 10,
} as const;

// ---------------------------------------------------------------------------
// Typer
// ---------------------------------------------------------------------------

type PeriodeInfo = {
  id: string;
  label: string;
  uker: number;
};

type PeriodiseringPopupProps = {
  periode: PeriodeInfo | null;
  onClose: () => void;
};

// ---------------------------------------------------------------------------
// Ikonmapping
// ---------------------------------------------------------------------------

const ICONS: Record<keyof PeriodVolumes, React.ElementType> = {
  FYS: Dumbbell,
  TEK: Zap,
  SLAG: Target,
  SPILL: Globe,
  TURN: Trophy,
};

const FARGER: Record<keyof PeriodVolumes, string> = {
  FYS: "hsl(var(--success))",
  TEK: "hsl(var(--primary))",
  SLAG: "hsl(var(--accent))",
  SPILL: "#6FA686",
  TURN: "hsl(var(--destructive))",
};

const FARGE_FG: Record<keyof PeriodVolumes, string> = {
  FYS: "#fff",
  TEK: "hsl(var(--accent))",
  SLAG: "hsl(var(--foreground))",
  SPILL: "#fff",
  TURN: "#fff",
};

// ---------------------------------------------------------------------------
// Komponent
// ---------------------------------------------------------------------------

export function PeriodiseringPopup({ periode, onClose }: PeriodiseringPopupProps) {
  const [volumes, setVolumes] = useState<PeriodVolumes>({
    FYS: 1,
    TEK: 2,
    SLAG: 3,
    SPILL: 2,
    TURN: 1,
  });
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; melding: string } | null>(null);

  if (!periode) return null;

  const totalPerUke = Object.values(volumes).reduce((s, v) => s + v, 0);
  const totalt = totalPerUke * periode.uker;

  function handleVolume(key: keyof PeriodVolumes, value: number) {
    setVolumes((prev) => ({ ...prev, [key]: Math.max(0, Math.min(7, value)) }));
  }

  function handleOpprett() {
    if (!periode) return;
    const periodeSnapshot = periode;
    startTransition(async () => {
      setResult(null);
      const res = await createSessionsForPeriod(periodeSnapshot.id, volumes);
      if (res.ok) {
        setResult({ ok: true, melding: `${res.sessionsCreated} økter opprettet for ${periodeSnapshot.uker} uker.` });
      } else {
        setResult({ ok: false, melding: res.error });
      }
    });
  }

  return (
    <div className="pdp-overlay" role="dialog" aria-modal="true" aria-label="Periodisering-innstillinger">
      <div className="pdp-panel">

        {/* Header */}
        <div className="pdp-header">
          <div>
            <div className="pdp-eyebrow">PERIODISERING</div>
            <h2 className="pdp-title">{periode.label}</h2>
            <p className="pdp-sub">{periode.uker} uker · Velg antall økter per type per uke</p>
          </div>
          <button
            type="button"
            className="pdp-close"
            onClick={onClose}
            aria-label="Lukk"
          >
            <X size={16} aria-hidden />
          </button>
        </div>

        {/* Volum-felter */}
        <div className="pdp-fields">
          {(["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const).map((area) => {
            const Icon = ICONS[area];
            const malProsent = MAL_PROSENT[area];
            return (
              <div key={area} className="pdp-field-row">
                <div className="pdp-field-icon" style={{ background: FARGER[area], color: FARGE_FG[area] }}>
                  <Icon size={14} aria-hidden />
                </div>
                <div className="pdp-field-body">
                  <div className="pdp-field-label">{area}</div>
                  <div className="pdp-field-hint">Anbefalt {malProsent}%</div>
                </div>
                <div className="pdp-field-stepper">
                  <button
                    type="button"
                    className="pdp-step-btn"
                    onClick={() => handleVolume(area, volumes[area] - 1)}
                    aria-label={`Reduser ${area}`}
                    disabled={volumes[area] === 0}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    className="pdp-step-input"
                    value={volumes[area]}
                    min={0}
                    max={7}
                    onChange={(e) => handleVolume(area, parseInt(e.target.value, 10) || 0)}
                    aria-label={`${area} økter per uke`}
                  />
                  <button
                    type="button"
                    className="pdp-step-btn"
                    onClick={() => handleVolume(area, volumes[area] + 1)}
                    aria-label={`Øk ${area}`}
                    disabled={volumes[area] === 7}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Oppsummering */}
        <div className="pdp-summary">
          <span className="pdp-sum-lbl">Totalt per uke</span>
          <span className="pdp-sum-val">{totalPerUke} økter</span>
          <span className="pdp-sum-lbl">Totalt for perioden</span>
          <span className="pdp-sum-val">{totalt} økter</span>
        </div>

        {/* Resultat-melding */}
        {result && (
          <div className={`pdp-result ${result.ok ? "ok" : "feil"}`}>
            {result.ok && <Check size={14} aria-hidden />}
            {result.melding}
          </div>
        )}

        {/* CTA */}
        <div className="pdp-actions">
          <button
            type="button"
            className="pdp-btn-cancel"
            onClick={onClose}
          >
            Avbryt
          </button>
          <button
            type="button"
            className="pdp-btn-opprett"
            onClick={handleOpprett}
            disabled={isPending || totalPerUke === 0 || (result?.ok ?? false)}
          >
            {isPending
              ? "Oppretter..."
              : result?.ok
              ? "Opprettet"
              : `Opprett ${totalt} økter for ${periode.uker} uker`}
          </button>
        </div>

      </div>
    </div>
  );
}
