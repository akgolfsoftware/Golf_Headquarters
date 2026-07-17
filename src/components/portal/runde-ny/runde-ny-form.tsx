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
 * D6a (17. juli 2026): hull-for-hull-steget er nå VALGFRITT — spilleren kan
 * logge kun totalscore, velge 9 eller 18 hull, justere par per hull (3/4/5)
 * og valgfritt logge putter + fairway/GIR per hull (HullEditor, delt med
 * redigeringen på runde-detaljen). Totalen auto-summeres fra hullene
 * (brutto score — aldri netto).
 *
 * Strokes Gained (valgfritt) + Notat beholdes fra eksisterende form — de mater
 * lagringen og er ikke en del av fasit-strukturen, men fjernes ikke (lagrings-
 * logikken er uendret).
 *
 * Lagringslogikk EKSAKT som før (logRoundManual) + det additive hullDetaljer-
 * feltet. DS-tokens kun — ingen hardkodet hex, ingen emoji (kun lucide).
 * Ingen falske tall: putter/FW/GIR sendes kun når detalj-steget er på.
 */

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Check, Minus, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { logRoundManual } from "@/app/portal/mal/runder/ny/actions";
import { parTemplate } from "@/lib/portal-runder/par-template";
import {
  HullEditor,
  nyeHull,
  summerHull,
  scoreTextClass,
  tilParLabel,
  type HullVerdi,
} from "./hull-editor";

type Course = { id: string; name: string; par: number };

const MIN_TOTAL = 1;
const MAX_TOTAL = 199;

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
const segmentCls = (aktiv: boolean) =>
  cn(
    "h-9 rounded-lg px-3 font-mono text-[10px] font-bold uppercase tracking-[0.08em] transition-colors",
    aktiv
      ? "bg-primary text-primary-foreground"
      : "text-muted-foreground hover:bg-secondary",
  );

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

  // D6a: hull-for-hull er valgfritt — «hull» (dagens oppførsel, default)
  // eller «total» (kun totalscore, ingen HoleScore-rader).
  const [modus, setModus] = useState<"hull" | "total">("hull");
  const [antallHull, setAntallHull] = useState<9 | 18>(18);
  const [visDetaljer, setVisDetaljer] = useState(false);

  // Hull-state — starter på par for hvert hull (spilleren stepper opp/ned).
  const [hull, setHull] = useState<HullVerdi[]>(() => nyeHull(parTemplate(72)));
  // Kun-total-modus: fri totalscore (tekst-state for redigerbart felt).
  const [totalTekst, setTotalTekst] = useState("72");

  // Re-baselinjer hull + total når banen (og dermed par-malen) endres.
  const parKey = pars.join(",");
  const [lastParKey, setLastParKey] = useState(parKey);
  if (parKey !== lastParKey) {
    setHull(nyeHull(pars.slice(0, antallHull)));
    setTotalTekst(String(pars.slice(0, antallHull).reduce((a, b) => a + b, 0)));
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
  const parMal = pars.slice(0, antallHull).reduce((a, b) => a + b, 0);
  const totalScore = Number.parseInt(totalTekst, 10);
  const hullSum = summerHull(hull);
  const total = modus === "hull" ? hullSum.score : Number.isFinite(totalScore) ? totalScore : 0;
  const parTotal = modus === "hull" ? hullSum.par : parMal;
  const diff = total - parTotal;

  function endreHull(nr: number, patch: Partial<HullVerdi>) {
    setHull((prev) => prev.map((h) => (h.nr === nr ? { ...h, ...patch } : h)));
  }

  function velgAntall(n: 9 | 18) {
    setAntallHull(n);
    // Behold det spilleren alt har tastet på hull 1–9; bygg 10–18 fra malen.
    setHull((prev) =>
      n === 9
        ? prev.filter((h) => h.nr <= 9)
        : [...prev.filter((h) => h.nr <= 9), ...nyeHull(pars.slice(9), 10)],
    );
    setTotalTekst(String(pars.slice(0, n).reduce((a, b) => a + b, 0)));
  }

  function stegTotal(delta: number) {
    const basis = Number.isFinite(totalScore) ? totalScore : parMal;
    setTotalTekst(
      String(Math.max(MIN_TOTAL, Math.min(MAX_TOTAL, basis + delta))),
    );
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
    if (modus === "total" && (!Number.isInteger(totalScore) || totalScore < MIN_TOTAL || totalScore > MAX_TOTAL)) {
      setError("Oppgi en gyldig totalscore.");
      return;
    }
    if (modus === "hull" && !total) {
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
          // Hull-for-hull kun i hull-modus. Detaljer (putter/FW/GIR) sendes
          // kun når detalj-steget er PÅ — skjulte verdier lagres aldri.
          hullDetaljer:
            modus === "hull"
              ? hull.map((h) => ({
                  nr: h.nr,
                  par: h.par,
                  strokes: h.strokes,
                  putts: visDetaljer ? h.putts : null,
                  fairway: visDetaljer ? h.fairway : null,
                  gir: visDetaljer ? h.gir : null,
                }))
              : undefined,
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

      {/* Modus — hull-for-hull (valgfritt, dagens default) eller kun total */}
      <div className="mt-4 grid grid-cols-2 gap-1 rounded-xl border border-border bg-card p-1">
        <button
          type="button"
          onClick={() => setModus("hull")}
          aria-pressed={modus === "hull"}
          className={segmentCls(modus === "hull")}
        >
          Hull for hull
        </button>
        <button
          type="button"
          onClick={() => setModus("total")}
          aria-pressed={modus === "total"}
          className={segmentCls(modus === "total")}
        >
          Kun totalscore
        </button>
      </div>

      {/* 9/18 hull + detalj-toggle */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <div className="grid grid-cols-2 gap-1 rounded-xl border border-border bg-card p-1">
          <button
            type="button"
            onClick={() => velgAntall(9)}
            aria-pressed={antallHull === 9}
            className={segmentCls(antallHull === 9)}
          >
            9 hull
          </button>
          <button
            type="button"
            onClick={() => velgAntall(18)}
            aria-pressed={antallHull === 18}
            className={segmentCls(antallHull === 18)}
          >
            18 hull
          </button>
        </div>
        {modus === "hull" && (
          <button
            type="button"
            onClick={() => setVisDetaljer((v) => !v)}
            aria-pressed={visDetaljer}
            className={cn(
              "h-9 rounded-xl border px-3 font-mono text-[10px] font-bold uppercase tracking-[0.08em] transition-colors",
              visDetaljer
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:bg-secondary",
            )}
          >
            Putter · FW · GIR · valgfritt
          </button>
        )}
      </div>

      {/* Accent-kort — LIVE to-par (jf. fasit) */}
      <div className="mt-4 flex items-center gap-3.5 rounded-xl border border-border border-l-[3px] border-l-accent bg-card px-4 py-3.5">
        <span
          className={cn(
            "font-mono text-[30px] font-extrabold leading-none tracking-[-0.03em] tabular-nums",
            scoreTextClass(diff),
          )}
        >
          {tilParLabel(diff)}
        </span>
        <div className="flex-1">
          <div className="font-mono text-base font-extrabold tabular-nums text-foreground">
            {total} slag
          </div>
          <div className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
            Par {parTotal} · {antallHull} hull
          </div>
        </div>
      </div>

      {modus === "hull" ? (
        <HullEditor hull={hull} visDetaljer={visDetaljer} onEndre={endreHull} />
      ) : (
        /* Kun totalscore — brutto slag, ingen hull-data lagres */
        <div className="mt-4 flex items-center justify-center gap-4 rounded-2xl border border-border bg-card px-4 py-5">
          <button
            type="button"
            onClick={() => stegTotal(-1)}
            disabled={Number.isInteger(totalScore) && totalScore <= MIN_TOTAL}
            aria-label="Trekk fra totalscore"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-background text-foreground transition-colors active:bg-secondary disabled:pointer-events-none disabled:opacity-35"
          >
            <Minus className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          </button>
          <input
            type="text"
            inputMode="numeric"
            value={totalTekst}
            onChange={(e) =>
              setTotalTekst(e.target.value.replace(/[^0-9]/g, "").slice(0, 3))
            }
            aria-label="Totalscore (brutto slag)"
            className="w-24 border-0 bg-transparent p-0 text-center font-mono text-[34px] font-extrabold tabular-nums text-foreground outline-none"
          />
          <button
            type="button"
            onClick={() => stegTotal(1)}
            disabled={Number.isInteger(totalScore) && totalScore >= MAX_TOTAL}
            aria-label="Legg til totalscore"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-background text-foreground transition-colors active:bg-secondary disabled:pointer-events-none disabled:opacity-35"
          >
            <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          </button>
        </div>
      )}

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
