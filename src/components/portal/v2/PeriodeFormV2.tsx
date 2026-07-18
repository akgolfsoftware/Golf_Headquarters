"use client";

/**
 * Delt periode-skjema (v2) for både `/periode/ny` og `/periode/[id]/rediger`.
 *
 * v2-port 18. juli 2026: erstatter presentasjonen i
 * `src/app/portal/(legacy)/tren/aarsplan/periode/periode-form.tsx`. KUN
 * presentasjonslaget er nytt (v2-primitiver + T-tokens). All datalogikk er
 * uendret: samme felt (lPhase, datoer, ukevolum, fokus, notater), samme
 * server actions (opprettPeriode / oppdaterPeriode / slettPeriode), samme
 * anbefalings-varsler (aldri sperrer — perioden lagres uansett).
 *
 * Constraint-visningen leser samme CANON-taxonomi (PERIODE_TYPER + L_FASER)
 * som `PeriodeConstraintBadges`, re-presentert med v2-chips.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { LPhase } from "@/generated/prisma/client";
import { T, Caps, Kort, Knapp, StatusPill } from "@/components/v2";
import { Inndata, TekstOmraade } from "@/components/v2/skjema";
import { Icon } from "@/components/v2/icon";
import { HjelpTips } from "@/components/v2/hjelp";
import { PERIODE_TYPER, L_FASER } from "@/lib/taxonomy";
import { CANON_PERIOD_ADJUSTMENT } from "@/lib/workbench/canon-period-adjustment";
import {
  opprettPeriode,
  oppdaterPeriode,
  slettPeriode,
} from "@/app/portal/(legacy)/tren/aarsplan/periode/actions";

/** «CANON anbefaler: FYS opp · SPILL ned» — kun retninger som avviker fra «lik». */
function canonHintFor(lPhase: LPhase): string | null {
  const retninger = CANON_PERIOD_ADJUSTMENT[lPhase];
  const deler = Object.entries(retninger)
    .filter(([, retning]) => retning !== "lik")
    .map(([area, retning]) => `${area} ${retning}`);
  return deler.length > 0 ? `CANON anbefaler: ${deler.join(" · ")}` : null;
}

const LPHASE_META: Record<LPhase, string> = {
  GRUNN: "Grunnperiode",
  SPESIAL: "Spesialisering",
  TURNERING: "Turneringsperiode",
  TESTUKE: "Testuke",
  FERIE: "Ferie",
  TRENINGSSAMLING: "Treningssamling",
  HELDAGSSAMLING: "Heldagssamling",
};
const LPHASE_ORDER: LPhase[] = [
  "GRUNN",
  "SPESIAL",
  "TURNERING",
  "TESTUKE",
  "FERIE",
  "TRENINGSSAMLING",
  "HELDAGSSAMLING",
];

export type PeriodeFormV2Initial = {
  lPhase: LPhase;
  startDate: string;
  endDate: string;
  focus: string | null;
  notes: string | null;
  weeklyVolMin: number | null;
  weeklyVolMax: number | null;
};

type Props =
  | { mode: "ny"; seasonPlanId: string; periodeId?: undefined; initial?: undefined }
  | {
      mode: "rediger";
      seasonPlanId?: undefined;
      periodeId: string;
      initial: PeriodeFormV2Initial;
    };

/** Enkel-valgt periodetype-pille (v2-idiom: valgt = lime, ellers panel + border). */
function TypePille({
  aktiv,
  onClick,
  children,
}: {
  aktiv: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className="v2-press v2-focus"
      onClick={onClick}
      style={{
        appearance: "none",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        height: 32,
        padding: "0 14px",
        borderRadius: 9999,
        background: aktiv ? T.lime : T.panel3,
        border: `1px solid ${aktiv ? "transparent" : T.borderS}`,
        color: aktiv ? T.onLime : T.fg,
        fontFamily: T.ui,
        fontSize: 12.5,
        fontWeight: aktiv ? 600 : 500,
        whiteSpace: "nowrap",
      }}
    >
      {aktiv && <Icon name="check" size={12} />}
      {children}
    </button>
  );
}

/** Liten constraint-chip (CS ≤ 70%, ≥ 2 hviledager …). */
function ConstraintChip({
  children,
  tone = "noytral",
}: {
  children: React.ReactNode;
  tone?: "noytral" | "warn";
}) {
  const farge = tone === "warn" ? T.warn : T.mut;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontFamily: T.mono,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.02em",
        color: farge,
        background: `color-mix(in srgb, ${farge} 12%, transparent)`,
        border: `1px solid color-mix(in srgb, ${farge} 26%, transparent)`,
        borderRadius: 9999,
        padding: "3px 9px",
      }}
    >
      {children}
    </span>
  );
}

/** Feltetikett i v2-stil (mono-caps), med valgfri HjelpTips og «påkrevd»-markør. */
function FeltEtikett({
  children,
  paakrevd,
  hjelp,
}: {
  children: React.ReactNode;
  paakrevd?: boolean;
  hjelp?: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
      <Caps size={9}>{children}</Caps>
      {paakrevd && (
        <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.down }}>*</span>
      )}
      {hjelp}
    </div>
  );
}

export function PeriodeFormV2(props: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  const initial = props.mode === "rediger" ? props.initial : undefined;
  const [lPhase, setLPhase] = useState<LPhase>(initial?.lPhase ?? "GRUNN");
  const [startDate, setStartDate] = useState(initial?.startDate ?? "");
  const [endDate, setEndDate] = useState(initial?.endDate ?? "");
  const [focus, setFocus] = useState(initial?.focus ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [volMin, setVolMin] = useState(initial?.weeklyVolMin?.toString() ?? "");
  const [volMax, setVolMax] = useState(initial?.weeklyVolMax?.toString() ?? "");

  const c = PERIODE_TYPER[lPhase];
  const canonHint = canonHintFor(lPhase);
  const lFaseLabels = c.lFaserTillatt
    .map((kode) => L_FASER.find((l) => l.kode === kode)?.label ?? kode)
    .join(", ");

  function lagre() {
    setError(null);
    setWarnings([]);
    startTransition(async () => {
      const felles = {
        lPhase,
        startDate,
        endDate,
        focus: focus.trim() || null,
        notes: notes.trim() || null,
        weeklyVolMin: volMin.trim() ? Number(volMin) : null,
        weeklyVolMax: volMax.trim() ? Number(volMax) : null,
      };
      const res =
        props.mode === "ny"
          ? await opprettPeriode({ seasonPlanId: props.seasonPlanId, ...felles })
          : await oppdaterPeriode({ id: props.periodeId, ...felles });
      if (!res.ok) {
        setError(res.error ?? "Kunne ikke lagre perioden.");
        return;
      }
      if (res.warnings?.length) setWarnings(res.warnings);
      router.push("/portal/tren/aarsplan");
      router.refresh();
    });
  }

  function slett() {
    if (props.mode !== "rediger") return;
    if (!confirm("Slette denne perioden? Dette kan ikke angres.")) return;
    startTransition(async () => {
      const res = await slettPeriode(props.periodeId);
      if (!res.ok) {
        setError(res.error ?? "Kunne ikke slette periode.");
        return;
      }
      router.push("/portal/tren/aarsplan");
      router.refresh();
    });
  }

  return (
    <div style={{ maxWidth: 720, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* ── Periodetype ─────────────────────────────────── */}
      <Kort eyebrow="Periodetype">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          {LPHASE_ORDER.map((p) => (
            <TypePille key={p} aktiv={lPhase === p} onClick={() => setLPhase(p)}>
              {LPHASE_META[p]}
            </TypePille>
          ))}
          <HjelpTips k="periodetype" />
        </div>

        {/* CANON-anbefalinger (aldri sperrer — kun veiledning). */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
          <ConstraintChip>CS ≤ {c.csMax}%</ConstraintChip>
          {c.maxVolumMin != null && <ConstraintChip>{c.maxVolumMin} min/uke</ConstraintChip>}
          {c.maxOkterUke != null && <ConstraintChip>≤ {c.maxOkterUke} økter/uke</ConstraintChip>}
          <ConstraintChip>≥ {c.minHviledager} hviledager</ConstraintChip>
          {c.turneringsLaas && <ConstraintChip tone="warn">Turneringslås</ConstraintChip>}
        </div>

        {lFaseLabels && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}>
            <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: T.mut }}>
              Tillatte L-faser: {lFaseLabels}
            </span>
            <HjelpTips k="lFase" />
          </div>
        )}

        {canonHint && (
          <p style={{ fontFamily: T.mono, fontSize: 10.5, fontWeight: 600, letterSpacing: "0.02em", color: T.lime, margin: "12px 0 0" }}>
            {canonHint}
          </p>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
          <div>
            <FeltEtikett paakrevd>Startdato</FeltEtikett>
            <Inndata label={null} type="date" value={startDate} onChange={setStartDate} mono />
          </div>
          <div>
            <FeltEtikett paakrevd>Sluttdato</FeltEtikett>
            <Inndata label={null} type="date" value={endDate} onChange={setEndDate} mono />
          </div>
        </div>
      </Kort>

      {/* ── Volum og fokus ──────────────────────────────── */}
      <Kort eyebrow="Volum og fokus">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <FeltEtikett hjelp={<HjelpTips k="ukevolum" />}>Min. min/uke</FeltEtikett>
            <Inndata label={null} type="number" value={volMin} onChange={setVolMin} placeholder="60" mono suffix="min" />
          </div>
          <div>
            <FeltEtikett>Maks min/uke</FeltEtikett>
            <Inndata label={null} type="number" value={volMax} onChange={setVolMax} placeholder="360" mono suffix="min" />
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <FeltEtikett>Fokus (valgfritt)</FeltEtikett>
          <Inndata label={null} value={focus} onChange={setFocus} placeholder="f.eks. «Putting + nærspill»" />
        </div>

        <div style={{ marginTop: 14 }}>
          <FeltEtikett>Notater (valgfritt)</FeltEtikett>
          <TekstOmraade label={null} value={notes} onChange={setNotes} rows={4} placeholder="Notater til denne perioden …" />
        </div>
      </Kort>

      {/* ── Anbefalings-varsler (aldri sperrer — perioden er lagret) ── */}
      {warnings.length > 0 && (
        <Kort style={{ border: `1px solid color-mix(in srgb, ${T.warn} 40%, transparent)` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <StatusPill tone="warn">Merk</StatusPill>
            <span style={{ fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: T.fg }}>
              Dette er kun en anbefaling — perioden er lagret.
            </span>
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
            {warnings.map((w) => (
              <li key={w} style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.5 }}>
                {w}
              </li>
            ))}
          </ul>
        </Kort>
      )}

      {error && (
        <div role="alert" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <StatusPill tone="down">Feil</StatusPill>
          <span style={{ fontFamily: T.ui, fontSize: 12.5, color: T.down }}>{error}</span>
        </div>
      )}

      {/* ── Handlinger ──────────────────────────────────── */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
        {props.mode === "rediger" && (
          <Knapp ghost icon="trash-2" disabled={pending} onClick={slett} style={{ color: T.down }}>
            Slett periode
          </Knapp>
        )}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Knapp ghost disabled={pending} onClick={() => router.back()}>
            Avbryt
          </Knapp>
          <Knapp icon="check" disabled={pending || !startDate || !endDate} onClick={lagre}>
            {pending ? "Lagrer …" : "Lagre periode"}
          </Knapp>
        </div>
      </div>
    </div>
  );
}
