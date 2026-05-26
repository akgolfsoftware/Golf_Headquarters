"use client";

/**
 * SpillerDNAPanel — CoachHQ-komponent for å vise og redigere spillerens
 * DNA-profil: dominant feilretning, SG-breakdown, prioriterte fokusområder
 * og svakhetsprofil med styrke-sliders.
 *
 * Brukes i /admin/spillere/[id] under "Presisjonstreningsplan"-seksjonen.
 */

import { useState, useTransition } from "react";
import {
  ChevronDown,
  Check,
  Plus,
  Save,
  Target,
  X,
  Zap,
} from "lucide-react";
import { lagreSpillerDNA } from "@/app/admin/spillere/[id]/actions";

// ─── Konstanter ──────────────────────────────────────────────────────────────

const DOMINANT_MISS_OPTIONS = [
  { value: "HOOK", label: "Hook" },
  { value: "SLICE", label: "Slice" },
  { value: "PUSH", label: "Push" },
  { value: "PULL", label: "Pull" },
  { value: "FAT", label: "Fat" },
  { value: "THIN", label: "Thin" },
  { value: "HIGH", label: "High" },
  { value: "LOW", label: "Low" },
] as const;

const SKILL_AREA_OPTIONS = [
  { value: "TEE_TOTAL", label: "Tee" },
  { value: "TILNAERMING", label: "Tilnærming" },
  { value: "AROUND_GREEN", label: "Nærspill" },
  { value: "PUTTING", label: "Putting" },
  { value: "SPILL", label: "Spill" },
] as const;

const DRILL_SVAKHET_LABELS: Record<string, string> = {
  OTT_SWING: "Over-the-top swing",
  EARLY_EXTENSION: "Tidlig extension",
  SLICE_DRIVER: "Slice på driver",
  HOOK_DRIVER: "Hook på driver",
  DRIVER_DISTANSE: "Driver distanse",
  DRIVER_PRESISJON: "Driver presisjon",
  JERN_DISTANSE: "Jernkontroll distanse",
  JERN_RETNING: "Jernkontroll retning",
  LANGE_JERN: "Lange jern",
  MELLOM_JERN: "Mellomjern",
  BALL_FLIGHT_LAW: "Ballbane-forståelse",
  CHIP_TEKNIKK: "Chip-teknikk",
  PITCH_DISTANSE: "Pitch-distanse",
  LOB_KONTROLL: "Lob-kontroll",
  BUMP_AND_RUN: "Bump and run",
  WET_SHORT_GAME: "Nærspill i våt bane",
  WEDGE_50_YARD: "Wedge 50 yard",
  WEDGE_75_YARD: "Wedge 75 yard",
  WEDGE_100_YARD: "Wedge 100 yard",
  WEDGE_SPIN: "Wedge spinn",
  WEDGE_TRAJECTORY: "Wedge ballbane",
  BUNKER_EXIT: "Bunker exit",
  BUNKER_DISTANSE: "Bunker distanse",
  KORT_PUTT: "Korte putts (<2m)",
  MEDIUM_PUTT: "Medium putts (2-5m)",
  LAG_PUTT: "Lag-putts (10m+)",
  GREEN_LESING: "Green-lesing",
  PUTT_RYTME: "Putt-rytme",
  STRESS_PUTT: "Putts under press",
  KURS_MANAGEMENT: "Kurs-management",
  PRESSURE_SHOTS: "Slag under press",
};

const ALLE_SVAKHETER = Object.keys(DRILL_SVAKHET_LABELS);

// ─── Typer ───────────────────────────────────────────────────────────────────

type DominantMiss =
  | "HOOK"
  | "SLICE"
  | "PUSH"
  | "PULL"
  | "FAT"
  | "THIN"
  | "HIGH"
  | "LOW";

type SkillArea =
  | "TEE_TOTAL"
  | "TILNAERMING"
  | "AROUND_GREEN"
  | "PUTTING"
  | "SPILL";

type SgBreakdown = {
  ott: number | null;
  app: number | null;
  arg: number | null;
  putt: number | null;
};

type SvakhetItem = {
  svakhet: string;
  styrke: number;
};

export type SpillerDNAProps = {
  userId: string;
  initial: {
    dominantMiss: DominantMiss | null;
    sgBreakdown: SgBreakdown | null;
    prioritertFokus: SkillArea[];
    svakhetProfil: SvakhetItem[];
  };
};

// ─── Hjelpefunksjoner ────────────────────────────────────────────────────────

function sgFormatert(v: number | null): string {
  if (v === null) return "—";
  const sign = v >= 0 ? "+" : "";
  return `${sign}${v.toFixed(1)}`;
}

function sgBarBredde(v: number | null): number {
  if (v === null) return 0;
  return Math.min(100, Math.abs(v) * (100 / 3));
}

// ─── Hoved-komponent ─────────────────────────────────────────────────────────

export function SpillerDNAPanel({ userId, initial }: SpillerDNAProps) {
  const [dominantMiss, setDominantMiss] = useState<DominantMiss | null>(
    initial.dominantMiss,
  );
  const [sgBreakdown, setSgBreakdown] = useState<SgBreakdown>(
    initial.sgBreakdown ?? { ott: null, app: null, arg: null, putt: null },
  );
  const [prioritertFokus, setPrioritertFokus] = useState<SkillArea[]>(
    initial.prioritertFokus ?? [],
  );
  const [svakhetProfil, setSvakhetProfil] = useState<SvakhetItem[]>(
    initial.svakhetProfil ?? [],
  );

  const [leggTilSvakhet, setLeggTilSvakhet] = useState<string>("");
  const [visSvakhetVelger, setVisSvakhetVelger] = useState(false);

  const [feilmelding, setFeilmelding] = useState<string | null>(null);
  const [lagretOk, setLagretOk] = useState(false);
  const [isPending, startTransition] = useTransition();

  function toggleFokus(area: SkillArea) {
    setPrioritertFokus((prev) => {
      if (prev.includes(area)) return prev.filter((a) => a !== area);
      if (prev.length >= 3) return prev;
      return [...prev, area];
    });
  }

  function leggTilSvakhetItem(svakhet: string) {
    if (!svakhet) return;
    if (svakhetProfil.some((s) => s.svakhet === svakhet)) return;
    setSvakhetProfil((prev) => [...prev, { svakhet, styrke: 5 }]);
    setLeggTilSvakhet("");
    setVisSvakhetVelger(false);
  }

  function fjernSvakhet(svakhet: string) {
    setSvakhetProfil((prev) => prev.filter((s) => s.svakhet !== svakhet));
  }

  function oppdaterStyrke(svakhet: string, styrke: number) {
    setSvakhetProfil((prev) =>
      prev.map((s) => (s.svakhet === svakhet ? { ...s, styrke } : s)),
    );
  }

  function oppdaterSg(felt: keyof SgBreakdown, verdi: string) {
    const num = verdi === "" ? null : Number(verdi);
    setSgBreakdown((prev) => ({ ...prev, [felt]: num }));
  }

  function lagre() {
    setFeilmelding(null);
    setLagretOk(false);
    startTransition(async () => {
      const res = await lagreSpillerDNA(userId, {
        dominantMiss,
        sgBreakdown:
          sgBreakdown.ott === null &&
          sgBreakdown.app === null &&
          sgBreakdown.arg === null &&
          sgBreakdown.putt === null
            ? null
            : sgBreakdown,
        prioritertFokus,
        svakhetProfil,
      });
      if (res.ok) {
        setLagretOk(true);
        setTimeout(() => setLagretOk(false), 3000);
      } else {
        setFeilmelding(res.error);
      }
    });
  }

  const tilgjengeligeSvakheter = ALLE_SVAKHETER.filter(
    (s) => !svakhetProfil.some((p) => p.svakhet === s),
  );

  return (
    <section
      aria-label="Spiller-DNA"
      className="rounded-lg border border-border bg-card"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-2">
          <Target size={16} strokeWidth={1.75} className="text-primary" />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            Spiller-DNA
          </span>
        </div>
        <button
          onClick={lagre}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {lagretOk ? (
            <>
              <Check size={12} strokeWidth={2} />
              Lagret
            </>
          ) : (
            <>
              <Save size={12} strokeWidth={1.75} />
              Lagre
            </>
          )}
        </button>
      </div>

      <div className="space-y-6 p-6">
        {feilmelding && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-[13px] text-destructive">
            {feilmelding}
          </div>
        )}

        {/* Dominant Miss */}
        <div>
          <label className="mb-2 block font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            Dominant Miss
          </label>
          <div className="relative">
            <select
              value={dominantMiss ?? ""}
              onChange={(e) =>
                setDominantMiss(
                  (e.target.value as DominantMiss) || null,
                )
              }
              className="w-full appearance-none rounded-md border border-input bg-background px-4 py-2 pr-8 text-[13px] text-foreground focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-ring"
            >
              <option value="">Ikke satt</option>
              {DOMINANT_MISS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              strokeWidth={1.75}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
          </div>
        </div>

        {/* SG Breakdown */}
        <div>
          <div className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            SG-Breakdown (vs. scratch)
          </div>
          <div className="space-y-2">
            {(
              [
                { key: "ott", label: "OTT" },
                { key: "app", label: "APP" },
                { key: "arg", label: "ARG" },
                { key: "putt", label: "PUTT" },
              ] as { key: keyof SgBreakdown; label: string }[]
            ).map(({ key, label }) => {
              const verdi = sgBreakdown[key];
              return (
                <div key={key} className="flex items-center gap-2">
                  <span className="w-10 shrink-0 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-foreground">
                    {label}
                  </span>
                  <input
                    type="number"
                    step="0.1"
                    min="-3"
                    max="3"
                    value={verdi ?? ""}
                    onChange={(e) => oppdaterSg(key, e.target.value)}
                    placeholder="—"
                    className="w-20 rounded-md border border-input bg-background px-2 py-1.5 text-center font-mono text-[12px] tabular-nums text-foreground focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-ring"
                  />
                  {/* Bar */}
                  <div className="flex flex-1 items-center gap-1">
                    {/* Negativ side */}
                    <div className="flex flex-1 justify-end">
                      {verdi !== null && verdi < 0 && (
                        <div
                          className="h-2 rounded-full bg-destructive transition-all"
                          style={{ width: `${sgBarBredde(verdi)}%` }}
                        />
                      )}
                    </div>
                    {/* Midtlinje */}
                    <div className="h-3 w-px bg-border" />
                    {/* Positiv side */}
                    <div className="flex-1">
                      {verdi !== null && verdi > 0 && (
                        <div
                          className="h-2 rounded-full bg-primary transition-all"
                          style={{ width: `${sgBarBredde(verdi)}%` }}
                        />
                      )}
                    </div>
                  </div>
                  <span
                    className={`w-12 shrink-0 text-right font-mono text-[12px] tabular-nums ${
                      verdi === null
                        ? "text-muted-foreground"
                        : verdi > 0
                          ? "text-primary"
                          : "text-destructive"
                    }`}
                  >
                    {sgFormatert(verdi)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Prioritert fokus — max 3 chips */}
        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Prioritert fokus
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              {prioritertFokus.length}/3
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SKILL_AREA_OPTIONS.map((opt) => {
              const aktiv = prioritertFokus.includes(opt.value);
              const deaktivert = !aktiv && prioritertFokus.length >= 3;
              return (
                <button
                  key={opt.value}
                  onClick={() => toggleFokus(opt.value)}
                  disabled={deaktivert}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] transition-colors ${
                    aktiv
                      ? "bg-primary text-primary-foreground"
                      : deaktivert
                        ? "cursor-not-allowed bg-muted text-muted-foreground opacity-40"
                        : "border border-border bg-secondary text-foreground hover:border-primary hover:bg-secondary"
                  }`}
                >
                  {aktiv && <Check size={10} strokeWidth={2.5} />}
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Svakhetsprofil */}
        <div>
          <div className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            Svakhetsprofil
          </div>

          {svakhetProfil.length === 0 ? (
            <div className="mb-2 rounded-md border border-dashed border-border bg-muted/40 p-4 text-[12px] text-muted-foreground">
              Ingen svakheter lagt til ennå.
            </div>
          ) : (
            <ul className="mb-4 space-y-2">
              {svakhetProfil.map((item) => (
                <li key={item.svakhet} className="flex items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <span className="truncate text-[12px] font-medium text-foreground">
                        {DRILL_SVAKHET_LABELS[item.svakhet] ?? item.svakhet}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-[11px] tabular-nums text-foreground">
                          {item.styrke}
                        </span>
                        <button
                          onClick={() => fjernSvakhet(item.svakhet)}
                          className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          aria-label={`Fjern ${DRILL_SVAKHET_LABELS[item.svakhet]}`}
                        >
                          <X size={12} strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={item.styrke}
                      onChange={(e) =>
                        oppdaterStyrke(item.svakhet, Number(e.target.value))
                      }
                      className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-primary"
                    />
                    <div className="mt-0.5 flex justify-between font-mono text-[9px] text-muted-foreground">
                      <span>1 svak</span>
                      <span>10 sterk</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Legg til svakhet */}
          <div className="relative">
            {!visSvakhetVelger ? (
              <button
                onClick={() => setVisSvakhetVelger(true)}
                disabled={tilgjengeligeSvakheter.length === 0}
                className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-border px-4 py-2 text-[12px] font-medium text-muted-foreground transition-colors hover:border-primary hover:text-foreground disabled:opacity-40"
              >
                <Plus size={12} strokeWidth={2} />
                Legg til svakhet
              </button>
            ) : (
              <div className="rounded-md border border-border bg-background shadow-sm">
                <div className="flex items-center gap-2 border-b border-border px-4 py-2">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Søk svakhet..."
                    aria-label="Søk svakhet"
                    value={leggTilSvakhet}
                    onChange={(e) => setLeggTilSvakhet(e.target.value)}
                    className="flex-1 bg-transparent text-[12px] text-foreground outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 placeholder:text-muted-foreground"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setVisSvakhetVelger(false);
                      setLeggTilSvakhet("");
                    }}
                    aria-label="Lukk svakhet-velger"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X size={12} strokeWidth={2} aria-hidden />
                  </button>
                </div>
                <ul className="max-h-48 overflow-y-auto py-1">
                  {tilgjengeligeSvakheter
                    .filter((s) =>
                      leggTilSvakhet === ""
                        ? true
                        : (DRILL_SVAKHET_LABELS[s] ?? s)
                            .toLowerCase()
                            .includes(leggTilSvakhet.toLowerCase()),
                    )
                    .map((s) => (
                      <li key={s}>
                        <button
                          onClick={() => leggTilSvakhetItem(s)}
                          className="flex w-full items-center gap-2 px-4 py-2 text-left text-[12px] text-foreground hover:bg-secondary"
                        >
                          <Zap
                            size={10}
                            strokeWidth={1.75}
                            className="shrink-0 text-accent-foreground"
                          />
                          {DRILL_SVAKHET_LABELS[s] ?? s}
                        </button>
                      </li>
                    ))}
                  {tilgjengeligeSvakheter.filter((s) =>
                    leggTilSvakhet === ""
                      ? true
                      : (DRILL_SVAKHET_LABELS[s] ?? s)
                          .toLowerCase()
                          .includes(leggTilSvakhet.toLowerCase()),
                  ).length === 0 && (
                    <li className="px-4 py-2 text-[12px] text-muted-foreground">
                      Ingen treff
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
