/**
 * PlayerHQ · Live-økt (preview) — delte typer + akse-helper.
 *
 * Standalone, presentasjonelt sett for /playerhq-preview/live-*. INGEN
 * Prisma/DB/auth-avhengigheter — kun props + demo-data. Speiler den visuelle
 * fasiten i public/design-handover/_screens/pl-live-{brief,active,summary}.png.
 */

export type LiveAxis = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";

/** Én drill i live-økta (preview). */
export type LiveDrill = {
  index: number;
  axis: LiveAxis;
  /** Visningsnavn på drillen. */
  name: string;
  /** Planlagte reps for drillen. */
  plannedReps: number;
  /** Fri etikett, f.eks. "22 min Z2 reps". */
  metaLabel: string;
};

/** Komplett demo-økt delt mellom brief/active/summary. */
export type LiveSessionDemo = {
  /** Eyebrow over tittel, f.eks. "ONS 05 MAI · 02:00 · FYSISK". */
  eyebrow: string;
  /** Kortere dato-eyebrow til summary, f.eks. "ONS 05 MAI · FYSISK". */
  dateEyebrow: string;
  /** Økt-tittel (display). */
  title: string;
  /** Primær-akse for økta (brukes til pille på active). */
  axis: LiveAxis;
  /** Planlagt varighet i minutter. */
  durationMin: number;
  /** Drills i økta. */
  drills: LiveDrill[];
  /** Mål-punkter for økta (én linje per punkt). */
  goals: string[];
  /** Følelse/vurdering etter økt (skala 1–5) — del av demo-data. */
  feeling: { value: number; max: number; label: string };
};

/** Sum av planlagte reps på tvers av drills. */
export function totalPlannedReps(s: LiveSessionDemo): number {
  return s.drills.reduce((sum, d) => sum + d.plannedReps, 0);
}

/**
 * Akse-farge på forest-flate. FYS/SPILL bruker lime (forest-grønn ville
 * druknet); øvrige bruker pyramide-fargen. Refererer CSS-vars fra globals.css.
 */
export function axisColor(axis: LiveAxis): string {
  switch (axis) {
    case "FYS":
    case "SPILL":
      return "hsl(var(--accent))";
    case "TEK":
      return "var(--pyr-tek)";
    case "SLAG":
      return "var(--pyr-slag)";
    case "TURN":
      return "var(--pyr-turn)";
  }
}

/** Sekunder → "MM:SS". */
export function fmtMSS(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
