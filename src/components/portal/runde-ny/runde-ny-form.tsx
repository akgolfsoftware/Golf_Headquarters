"use client";

/**
 * PlayerHQ · Runder · Ny — Loggfør runde.
 *
 * Visuelt portet FRA fersk Claude Design-fasit:
 *   (historisk juni-fasit, fjernet fra repo) playerhq-app/ph-screens.jsx
 *   (LogRoundScreen): Bane + Dato (2-kol md) → accent-kort med LIVE to-par
 *   (stor farget to-par + «{total} slag» + «Par {par} · 18 hull») → hull-grid
 *   UT/INN med −/+ per hull (3-kol mobil / 9-kol md) → primær full-bredde
 *   «Lagre runde» m/ check. Eyebrow + h1 eies av siden (ny/page.tsx).
 *
 * Strokes Gained (valgfritt) + Notat beholdes fra eksisterende form — de mater
 * lagringen og er ikke en del av fasit-strukturen, men fjernes ikke (lagrings-
 * logikken er uendret).
 *
 * Lagringslogikk/state EKSAKT som før: logRoundManual, par-mal per bane,
 * score starter på par, norsk desimal-parsing for SG. DS-tokens kun — ingen
 * hardkodet hex, ingen emoji (kun lucide). Ingen falske tall.
 */

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Check, Minus, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { logRoundManual } from "@/app/portal/mal/runder/ny/actions";
import { parTemplate } from "@/lib/portal-runder/par-template";

type Course = { id: string; name: string; par: number };

const MIN_SCORE = 1;
const MAX_SCORE = 12;

/** Birdie/par/bogey/dobbel+ — fasitens fargekoding (kun tekstfarge). */
function scoreTextClass(diff: number): string {
  if (diff <= -1) return "text-success";
  if (diff === 0) return "text-foreground";
  if (diff === 1) return "text-warning";
  return "text-destructive";
}

function toParLabel(diff: number): string {
  if (diff === 0) return "E";
  return diff > 0 ? `+${diff}` : `−${Math.abs(diff)}`;
}

/** Norsk desimal-parsing: «+0,32» / «−0,15» → tall. Tom → null. */
function parseSg(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  const normalized = trimmed.replace("−", "-").replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

const SG_FIELDS = [
  { key: "ott", label: "OTT" },
  { key: "app", label: "APP" },
  { key: "arg", label: "ARG" },
  { key: "putt", label: "PUTT" },
] as const;
type SgKey = (typeof SG_FIELDS)[number]["key"];

const lblCls =
  "font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground";
const inpCls =
  "flex h-12 w-full items-center gap-2.5 rounded-xl border border-input bg-card px-3.5 text-foreground transition-colors focus-within:border-primary focus-within:ring-[3px] focus-within:ring-ring/20";

export function RundeNyForm({
  courses,
}: {
  courses: Course[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const [courseId, setCourseId] = useState(courses[0]?.id ?? "");
  const [courseQuery, setCourseQuery] = useState(courses[0]?.name ?? "");
  const [courseOpen, setCourseOpen] = useState(false);
  const [playedAt, setPlayedAt] = useState(today);

  const course = useMemo(
    () => courses.find((c) => c.id === courseId) ?? null,
    [courseId, courses],
  );
  const coursePar = course?.par ?? 72;
  const pars = useMemo(() => parTemplate(coursePar), [coursePar]);

  // Score per hull — starter på par for hvert hull (spilleren stepper opp/ned).
  const [scores, setScores] = useState<number[]>(() => parTemplate(72));

  // Re-baselinjer scoren når banen (og dermed par-malen) endres.
  const parKey = pars.join(",");
  const [lastParKey, setLastParKey] = useState(parKey);
  if (parKey !== lastParKey) {
    setScores(pars.slice());
    setLastParKey(parKey);
  }

  const [sg, setSg] = useState<Record<SgKey, string>>({
    ott: "",
    app: "",
    arg: "",
    putt: "",
  });
  const [notes, setNotes] = useState("");

  // ── Beregninger (live) ─────────────────────────────────────────
  const parOut = pars.slice(0, 9).reduce((a, b) => a + b, 0);
  const parIn = pars.slice(9).reduce((a, b) => a + b, 0);
  const sOut = scores.slice(0, 9).reduce((a, b) => a + b, 0);
  const sIn = scores.slice(9).reduce((a, b) => a + b, 0);
  const total = sOut + sIn;
  const parTotal = parOut + parIn;
  const diff = total - parTotal;

  function step(i: number, delta: number) {
    setScores((prev) => {
      const next = prev.slice();
      next[i] = Math.max(MIN_SCORE, Math.min(MAX_SCORE, next[i] + delta));
      return next;
    });
  }

  function pickCourse(c: Course) {
    setCourseId(c.id);
    setCourseQuery(c.name);
    setCourseOpen(false);
  }

  const filtered = useMemo(() => {
    const q = courseQuery.trim().toLowerCase();
    if (q === "") return courses.slice(0, 8);
    return courses
      .filter((c) => c.name.toLowerCase().includes(q))
      .slice(0, 8);
  }, [courseQuery, courses]);

  function lagre() {
    if (!courseId) {
      setError("Velg en bane.");
      return;
    }
    if (!total) {
      setError("Registrer score for hullene.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await logRoundManual({
          courseId,
          playedAt,
          score: total,
          holeScores: scores,
          notes: notes.trim() || undefined,
          sgOtt: parseSg(sg.ott),
          sgApp: parseSg(sg.app),
          sgArg: parseSg(sg.arg),
          sgPutt: parseSg(sg.putt),
        });
        // logRoundManual redirigerer ved suksess; refresh som fallback.
        router.refresh();
      } catch {
        setError("Kunne ikke lagre runden. Prøv igjen.");
      }
    });
  }

  return (
    <div className="mt-4">
      {/* Bane + Dato — 2-kol på md (jf. fasit) */}
      <div className="grid gap-3.5 md:grid-cols-2">
        {/* Bane — autocomplete */}
        <div className="flex flex-col gap-1.5">
          <span className={lblCls}>Bane</span>
          <div className="relative">
            <label className={inpCls}>
              <Search
                className="h-4 w-4 shrink-0 text-muted-foreground"
                strokeWidth={1.5}
                aria-hidden
              />
              <input
                type="text"
                value={courseQuery}
                onChange={(e) => {
                  setCourseQuery(e.target.value);
                  setCourseOpen(true);
                }}
                onFocus={() => setCourseOpen(true)}
                onBlur={() => window.setTimeout(() => setCourseOpen(false), 120)}
                placeholder="Søk bane…"
                aria-label="Søk bane"
                className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
              />
            </label>

            {courseOpen && filtered.length > 0 && (
              <ul className="absolute left-0 right-0 top-[calc(100%+4px)] z-10 max-h-60 overflow-y-auto rounded-xl border border-border bg-card py-1 shadow-[0_12px_28px_rgba(10,31,23,0.12)]">
                {filtered.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => pickCourse(c)}
                      className={cn(
                        "flex w-full items-baseline justify-between gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-secondary",
                        c.id === courseId && "bg-secondary",
                      )}
                    >
                      <span className="truncate text-sm font-semibold text-foreground">
                        {c.name}
                      </span>
                      <span className="shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
                        Par {c.par}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {courses.length === 0 && (
            <p className="text-[11px] text-muted-foreground">
              Ingen baner registrert ennå.
            </p>
          )}
        </div>

        {/* Dato */}
        <div className="flex flex-col gap-1.5">
          <span className={lblCls}>Dato</span>
          <label className={inpCls}>
            <Calendar
              className="h-4 w-4 shrink-0 text-muted-foreground"
              strokeWidth={1.5}
              aria-hidden
            />
            <input
              type="date"
              value={playedAt}
              onChange={(e) => setPlayedAt(e.target.value)}
              aria-label="Dato spilt"
              className="min-w-0 flex-1 border-0 bg-transparent p-0 font-mono text-[15px] font-bold tabular-nums text-foreground outline-none"
            />
          </label>
        </div>
      </div>

      {/* Accent-kort — LIVE to-par (jf. fasit) */}
      <div className="mt-4 flex items-center gap-3.5 rounded-xl border border-border border-l-[3px] border-l-accent bg-card px-4 py-3.5">
        <span
          className={cn(
            "font-mono text-[30px] font-extrabold leading-none tracking-[-0.03em] tabular-nums",
            scoreTextClass(diff),
          )}
        >
          {toParLabel(diff)}
        </span>
        <div className="flex-1">
          <div className="font-mono text-base font-extrabold tabular-nums text-foreground">
            {total} slag
          </div>
          <div className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
            Par {parTotal} · 18 hull
          </div>
        </div>
      </div>

      {/* UT 1–9 */}
      <NineLabel
        title="UT · 1–9"
        parTotal={parOut}
        scoreTotal={sOut}
      />
      <HoleGrid
        pars={pars.slice(0, 9)}
        scores={scores.slice(0, 9)}
        startIdx={0}
        onStep={step}
      />

      {/* INN 10–18 */}
      <NineLabel
        title="INN · 10–18"
        parTotal={parIn}
        scoreTotal={sIn}
      />
      <HoleGrid
        pars={pars.slice(9)}
        scores={scores.slice(9)}
        startIdx={9}
        onStep={step}
      />

      {/* Seksjon — Strokes Gained (valgfritt) */}
      <SectionHead optional="· valgfritt">Strokes Gained</SectionHead>
      <div className="mb-4 grid grid-cols-2 gap-2.5">
        {SG_FIELDS.map((f) => (
          <div key={f.key} className="flex flex-col gap-1.5">
            <span className={lblCls}>{f.label}</span>
            <label className="flex h-[46px] items-center gap-1.5 rounded-xl border border-input bg-card px-2.5 transition-colors focus-within:border-primary focus-within:ring-[3px] focus-within:ring-ring/20">
              <input
                type="text"
                inputMode="decimal"
                value={sg[f.key]}
                onChange={(e) =>
                  setSg((prev) => ({ ...prev, [f.key]: e.target.value }))
                }
                placeholder="0,00"
                aria-label={`Strokes Gained ${f.label}`}
                className="min-w-0 flex-1 border-0 bg-transparent p-0 font-mono text-[15px] font-bold tabular-nums text-foreground outline-none placeholder:text-muted-foreground/60"
              />
              <span className="font-mono text-[10px] font-bold text-muted-foreground">
                SG
              </span>
            </label>
          </div>
        ))}
      </div>

      {/* Notat */}
      <div className="mb-4 flex flex-col gap-1.5">
        <span className={lblCls}>Notat · valgfritt</span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value.slice(0, 500))}
          placeholder="Beste runden i år, godt på innspill…"
          rows={3}
          className="min-h-[72px] w-full resize-none rounded-xl border border-input bg-card px-3.5 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-[3px] focus:ring-ring/20"
        />
      </div>

      {error && (
        <div
          role="alert"
          className="mb-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      {/* Primær full-bredde CTA (jf. fasit) */}
      <button
        type="button"
        onClick={lagre}
        disabled={pending}
        className="mt-6 inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-primary font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-primary-foreground shadow-[0_8px_20px_rgba(0,88,64,0.18)] transition hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-60"
      >
        <Check className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
        {pending ? "Lagrer…" : "Lagre runde"}
      </button>
    </div>
  );
}

/* ── Sub-komponenter ──────────────────────────────────────────── */

function SectionHead({
  children,
  optional,
}: {
  children: React.ReactNode;
  optional?: string;
}) {
  return (
    <div className="mb-2.5 mt-1.5 flex items-baseline gap-2.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
      <span className="inline-flex items-baseline gap-1.5">
        {children}
        {optional && <span className="font-bold">{optional}</span>}
      </span>
      <span className="h-px flex-1 bg-border" aria-hidden />
    </div>
  );
}

function NineLabel({
  title,
  parTotal,
  scoreTotal,
}: {
  title: string;
  parTotal: number;
  scoreTotal: number;
}) {
  return (
    <div className="mb-2 mt-4 flex items-baseline justify-between">
      <span className="font-mono text-[10px] font-extrabold tracking-[0.10em] text-foreground">
        {title}
      </span>
      <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
        Par {parTotal} · <b className="font-extrabold text-foreground">{scoreTotal}</b>
      </span>
    </div>
  );
}

function HoleGrid({
  pars,
  scores,
  startIdx,
  onStep,
}: {
  pars: number[];
  scores: number[];
  startIdx: number;
  onStep: (i: number, delta: number) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 md:grid-cols-6 lg:grid-cols-9">
      {pars.map((par, i) => {
        const idx = startIdx + i;
        const score = scores[i];
        const d = score - par;
        return (
          <div
            key={idx}
            className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-card px-1.5 py-2"
          >
            <div className="whitespace-nowrap font-mono text-[9px] text-muted-foreground">
              {idx + 1} · par {par}
            </div>
            <span
              className={cn(
                "font-mono text-[22px] font-extrabold leading-none tracking-[-0.03em] tabular-nums",
                scoreTextClass(d),
              )}
            >
              {score}
            </span>
            <div className="grid w-full grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => onStep(idx, -1)}
                disabled={score <= MIN_SCORE}
                aria-label={`Trekk fra hull ${idx + 1}`}
                className="inline-flex h-[34px] items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors active:bg-secondary disabled:pointer-events-none disabled:opacity-35"
              >
                <Minus className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => onStep(idx, 1)}
                disabled={score >= MAX_SCORE}
                aria-label={`Legg til hull ${idx + 1}`}
                className="inline-flex h-[34px] items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors active:bg-secondary disabled:pointer-events-none disabled:opacity-35"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
