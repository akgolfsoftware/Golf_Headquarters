"use client";

/**
 * PlayerHQ · Drill-bibliotek (mobil-first, 430px) — presentasjonell.
 *
 * Port av fasiten public/design-handover/_screens/pl-drills.png
 * (rendret variant av components-drill-bibliotek.html).
 *
 * Anatomi:
 *   Header: «Drill-bibliotek» (bibliotek i primary) + «N AV M DRILLS».
 *   Søkefelt · akse-pills (Alle/FYS/TEK/SLAG/SPILL/TURN med ærlige tellere) ·
 *   nivå-pills (sliders-ikon + Alle nivå/Lett/Middels/Hard) ·
 *   anlegg-pills (Alle anlegg + fasiliteter).
 *   Drill-kort: venstre akse-farge-kant + akse-eyebrow + tittel + meta +
 *   valgfri nivå-badge + valgfri CS-koblings-badge. Klikk → /portal/drills/[id].
 *
 * Ingen stjerne-rating: fasiten har ingen aggregert rating, falske tall er
 * forbudt. Komponenten er props-drevet — preview leverer demo-data, ekte bruk
 * leverer DrillCard[] fra databasen.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, Zap } from "lucide-react";
import { FilterPillBar, type FilterPill } from "@/components/athletic/filter-pill-bar";
import { cn } from "@/lib/utils";

// ── Typer (selvstendige — ingen Prisma-avhengighet i preview) ──
export type DrillAxis = "fys" | "tek" | "slag" | "spill" | "turn";
export type DrillDifficulty = "lett" | "middels" | "hard";

export type DrillCard = {
  id: string;
  axis: DrillAxis;
  /** Mono-caps eyebrow, f.eks. "SLAG · TILNÆRMING". */
  axisLabel: string;
  title: string;
  /** Korte meta-fragmenter (varighet, sett/reps, CS) i visningsrekkefølge. */
  meta: string[];
  difficulty: DrillDifficulty | null;
  /** Fasilitets-koder (matcher anlegg-pill-key). */
  fasilitet: string[];
  /** Sann for FYS-drills med CS-target — vises som CS-koblings-badge. */
  chsLink: boolean;
};

const AXIS_BORDER: Record<DrillAxis, string> = {
  fys: "border-l-pyr-fys",
  tek: "border-l-pyr-tek",
  slag: "border-l-pyr-slag",
  spill: "border-l-pyr-spill",
  turn: "border-l-pyr-turn",
};

const AXIS_DOT: Record<DrillAxis, string> = {
  fys: "bg-pyr-fys",
  tek: "bg-pyr-tek",
  slag: "bg-pyr-slag",
  spill: "bg-pyr-spill",
  turn: "bg-pyr-turn",
};

const DIFFICULTY_LABEL: Record<DrillDifficulty, string> = {
  lett: "Lett",
  middels: "Middels",
  hard: "Hard",
};

// Trafikklys etter vanskelighetsgrad (ikke akse): grønn → gul → rød.
const DIFFICULTY_DOT: Record<DrillDifficulty, string> = {
  lett: "bg-success",
  middels: "bg-warning",
  hard: "bg-destructive",
};

const FASILITET_LABEL: Record<string, string> = {
  BANE: "Bane",
  LOPEBANE: "Løpebane",
  RADAR: "Radar",
  MAT_NET: "Matte + nett",
  DRIVING_RANGE: "Range",
  SHORT_GAME_AREA: "Nærspill",
  PUTTING_GREEN_KORT: "Green (kort)",
  BUNKER: "Bunker",
  KAMERA: "Kamera",
  PUTTING_GREEN_LANG: "Green (lang)",
  SIMULATOR: "Simulator",
  VEKTSTANG: "Vektstang",
  TRAPBAR: "Trapbar",
  MED_BALL: "Medisinball",
};

/** Visningsrekkefølge for anlegg-pills (matcher fasiten). */
const FASILITET_ORDER = [
  "BANE",
  "LOPEBANE",
  "RADAR",
  "MAT_NET",
  "DRIVING_RANGE",
  "SHORT_GAME_AREA",
  "PUTTING_GREEN_KORT",
  "BUNKER",
  "KAMERA",
  "PUTTING_GREEN_LANG",
  "SIMULATOR",
  "VEKTSTANG",
  "TRAPBAR",
  "MED_BALL",
];

type AxisFilter = "alle" | DrillAxis;
type DiffFilter = "alle" | DrillDifficulty;
type FasFilter = "alle" | string;

const AXIS_ORDER: DrillAxis[] = ["fys", "tek", "slag", "spill", "turn"];
const DIFF_ORDER: DrillDifficulty[] = ["lett", "middels", "hard"];

function DrillRow({ drill }: { drill: DrillCard }) {
  return (
    <Link
      href={`/portal/drills/${drill.id}`}
      className={cn(
        "block rounded-xl border border-l-[3px] border-border bg-card px-3.5 py-3 transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_10px_22px_rgba(10,31,23,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        AXIS_BORDER[drill.axis],
      )}
    >
      <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
        {drill.axisLabel}
      </span>
      <h3 className="mt-1 text-[15px] font-bold leading-tight tracking-[-0.015em] text-foreground">
        {drill.title}
      </h3>

      {drill.meta.length > 0 && (
        <p className="mt-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.02em] text-muted-foreground">
          {drill.meta.join(" · ")}
        </p>
      )}

      {(drill.difficulty || drill.chsLink) && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {drill.difficulty && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2 py-0.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.08em] text-muted-foreground">
              <span className={cn("h-1.5 w-1.5 rounded-full", DIFFICULTY_DOT[drill.difficulty])} aria-hidden />
              {DIFFICULTY_LABEL[drill.difficulty]}
            </span>
          )}
          {drill.chsLink && (
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-[var(--color-pyr-spill-track)] px-2 py-0.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.06em] text-primary">
              <Zap className="h-2.5 w-2.5" strokeWidth={2} aria-hidden />
              CS-kobling
            </span>
          )}
        </div>
      )}
    </Link>
  );
}

export function DrillBibliotek({ drills }: { drills: DrillCard[] }) {
  const [query, setQuery] = useState("");
  const [axis, setAxis] = useState<AxisFilter>("alle");
  const [diff, setDiff] = useState<DiffFilter>("alle");
  const [fas, setFas] = useState<FasFilter>("alle");

  const total = drills.length;

  // Hvilke akser/nivå/anlegg finnes faktisk — skjul tomme valg.
  const present = useMemo(() => {
    const axes = new Set<DrillAxis>();
    const diffs = new Set<DrillDifficulty>();
    const facilities = new Set<string>();
    for (const d of drills) {
      axes.add(d.axis);
      if (d.difficulty) diffs.add(d.difficulty);
      for (const f of d.fasilitet) facilities.add(f);
    }
    return { axes, diffs, facilities };
  }, [drills]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return drills.filter((d) => {
      if (axis !== "alle" && d.axis !== axis) return false;
      if (diff !== "alle" && d.difficulty !== diff) return false;
      if (fas !== "alle" && !d.fasilitet.includes(fas)) return false;
      if (q && !d.title.toLowerCase().includes(q) && !d.axisLabel.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [drills, axis, diff, fas, query]);

  // Ærlige akse-tellere (uavhengig av aktivt akse-valg, men respekterer
  // søk/nivå/anlegg slik at tallene matcher det man faktisk kan se).
  const axisCounted = useMemo(() => {
    const q = query.trim().toLowerCase();
    return drills.filter((d) => {
      if (diff !== "alle" && d.difficulty !== diff) return false;
      if (fas !== "alle" && !d.fasilitet.includes(fas)) return false;
      if (q && !d.title.toLowerCase().includes(q) && !d.axisLabel.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [drills, diff, fas, query]);

  const axisPills: FilterPill[] = useMemo(() => {
    const pills: FilterPill[] = [
      { key: "alle", label: "Alle", count: axisCounted.length },
    ];
    for (const a of AXIS_ORDER) {
      if (!present.axes.has(a)) continue;
      pills.push({
        key: a,
        label: a.toUpperCase(),
        count: axisCounted.filter((d) => d.axis === a).length,
        dotClass: AXIS_DOT[a],
      });
    }
    return pills;
  }, [axisCounted, present.axes]);

  const diffPills: FilterPill[] = useMemo(() => {
    const pills: FilterPill[] = [{ key: "alle", label: "Alle nivå" }];
    for (const d of DIFF_ORDER) {
      if (present.diffs.has(d)) pills.push({ key: d, label: DIFFICULTY_LABEL[d] });
    }
    return pills;
  }, [present.diffs]);

  const fasPills: FilterPill[] = useMemo(() => {
    const pills: FilterPill[] = [{ key: "alle", label: "Alle anlegg" }];
    const ordered = FASILITET_ORDER.filter((f) => present.facilities.has(f));
    const extras = [...present.facilities].filter((f) => !FASILITET_ORDER.includes(f));
    for (const f of [...ordered, ...extras]) {
      pills.push({ key: f, label: FASILITET_LABEL[f] ?? f });
    }
    return pills;
  }, [present.facilities]);

  const showDiffRow = present.diffs.size > 0;
  const showFasRow = present.facilities.size > 1;

  return (
    <div className="mx-auto max-w-[430px] overflow-hidden rounded-2xl border border-border bg-card">
      {/* Header */}
      <div className="border-b border-border px-4 py-3.5">
        <h1 className="text-[20px] font-bold leading-tight tracking-[-0.02em] text-foreground">
          Drill-<em className="font-normal not-italic text-primary">bibliotek</em>
        </h1>
        <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
          <span className="text-foreground">{visible.length}</span> av {total} drills
        </p>
      </div>

      {/* Søk */}
      <div className="px-4 pt-3">
        <label className="flex h-11 items-center gap-2.5 rounded-xl border border-input bg-card px-3.5 focus-within:ring-2 focus-within:ring-ring">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Søk drill…"
            aria-label="Søk i drill-biblioteket"
            className="h-full w-full bg-transparent text-[14px] text-foreground outline-none placeholder:text-muted-foreground"
          />
        </label>
      </div>

      {/* Akse-filter */}
      <div className="px-4 pt-3">
        <FilterPillBar
          pills={axisPills}
          active={axis}
          onSelect={(k) => setAxis(k as AxisFilter)}
        />
      </div>

      {/* Nivå + anlegg */}
      {(showDiffRow || showFasRow) && (
        <div className="space-y-2 px-4 pt-2.5">
          {showDiffRow && (
            <div className="flex items-center gap-2">
              <SlidersHorizontal
                className="h-3 w-3 shrink-0 text-muted-foreground"
                strokeWidth={2}
                aria-hidden
              />
              <FilterPillBar
                pills={diffPills}
                active={diff}
                onSelect={(k) => setDiff(k as DiffFilter)}
              />
            </div>
          )}
          {showFasRow && (
            <FilterPillBar
              pills={fasPills}
              active={fas}
              onSelect={(k) => setFas(k as FasFilter)}
            />
          )}
        </div>
      )}

      {/* Liste */}
      {visible.length === 0 ? (
        <p className="px-4 py-12 text-center font-mono text-[11px] font-bold uppercase tracking-[0.04em] text-muted-foreground">
          {total === 0 ? "Ingen drills i biblioteket ennå." : "Ingen drills i dette filteret."}
        </p>
      ) : (
        <div className="flex flex-col gap-2.5 px-4 py-3.5">
          {visible.map((d) => (
            <DrillRow key={d.id} drill={d} />
          ))}
        </div>
      )}
    </div>
  );
}
