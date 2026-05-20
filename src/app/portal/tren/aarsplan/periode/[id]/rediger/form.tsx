"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus, X, AlertTriangle, Trash2 } from "lucide-react";
import { updatePeriode, deletePeriode } from "./actions";

const SG_OPTIONS = ["Tee", "Approach", "Rundt green", "Putting", "Total"];
const PYR_OPTIONS = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];
const COLORS: Array<{ id: string; label: string; cls: string }> = [
  { id: "lime", label: "Lime", cls: "bg-accent" },
  { id: "forest", label: "Forest dyp", cls: "bg-primary" },
  { id: "cream", label: "Cream varm", cls: "bg-[#E9DCC2]" },
  { id: "muted", label: "Muted", cls: "bg-muted-foreground" },
];

const TURNERINGER = [
  { id: "nmj", name: "NM Junior 2026", badge: "A-event", dates: "18.06 – 21.06" },
  { id: "gfgk", name: "GFGK Open", dates: "10.06 – 12.06" },
  { id: "sl", name: "Sørlandsåpent Junior", dates: "26.06 – 28.06" },
  { id: "larvik", name: "Larvik Trofé", dates: "05.06" },
];

export function PeriodeRedigerForm({ periodeId }: { periodeId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("Konkurranse-blokk juni");
  const [type, setType] = useState<
    "Forberedelse" | "Konkurranse" | "Restitusjon" | "Off-season"
  >("Konkurranse");
  const [color, setColor] = useState("forest");
  const [startDate, setStartDate] = useState("2026-06-01");
  const [endDate, setEndDate] = useState("2026-06-30");
  const [sgFocus, setSgFocus] = useState<string[]>(["Tee", "Putting"]);
  const [pyrFocus, setPyrFocus] = useState<string[]>(["TEK", "SLAG"]);
  const [goals, setGoals] = useState<string[]>([
    "Topp 10 NM Junior",
    "Sub-72 snitt i 4 runder",
  ]);
  const [newGoal, setNewGoal] = useState("");
  const [volume, setVolume] = useState(6);
  const [load, setLoad] = useState(7);
  const [selectedTurns, setSelectedTurns] = useState<string[]>(["nmj", "gfgk"]);
  const [coachNote, setCoachNote] = useState(
    "Reduser TEK-fokus, hold form. Mer SPILL — særlig før GFGK Open og NM Junior.",
  );

  function toggle<T>(arr: T[], v: T): T[] {
    return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
  }

  function addGoal() {
    const v = newGoal.trim();
    if (v) setGoals((g) => [...g, v]);
    setNewGoal("");
  }

  function lagre() {
    setError(null);
    startTransition(async () => {
      try {
        await updatePeriode({
          id: periodeId,
          name,
          type,
          color,
          startDate,
          endDate,
          sgFocus,
          pyramidFocus: pyrFocus,
          goals,
          volume,
          load,
          tournamentIds: selectedTurns,
          coachNote,
        });
      } catch {
        setError("Kunne ikke lagre endringer.");
      }
    });
  }

  function slett() {
    if (!confirm("Slette denne perioden? Dette kan ikke angres.")) return;
    startTransition(async () => {
      try {
        await deletePeriode(periodeId);
      } catch {
        setError("Kunne ikke slette periode.");
      }
    });
  }

  return (
    <>
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-3 flex items-baseline justify-between">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            Plassering i årsplan 2026
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">
            12 mnd · uke 22 – 26 (aktiv)
          </span>
        </div>
        <div className="relative h-3 overflow-hidden rounded-full bg-background">
          <div className="absolute left-0 top-0 h-full w-[8%] bg-muted-foreground/40" />
          <div className="absolute left-[8%] top-0 h-full w-[12%] bg-muted-foreground/60" />
          <div className="absolute left-[20%] top-0 h-full w-[20%] bg-primary/40" />
          <div className="absolute left-[40%] top-0 h-full w-[10%] bg-primary" />
          <div className="absolute left-[50%] top-0 h-full w-[15%] bg-muted-foreground/40" />
          <div className="absolute left-[65%] top-0 h-full w-[35%] bg-muted-foreground/30" />
        </div>
        <div className="mt-2 grid grid-cols-12 font-mono text-[9px] text-muted-foreground">
          {["JAN", "FEB", "MAR", "APR", "MAI", "JUN", "JUL", "AUG", "SEP", "OKT", "NOV", "DES"].map(
            (m) => (
              <span
                key={m}
                className={`text-center ${m === "JUN" ? "font-bold text-foreground" : ""}`}
              >
                {m}
              </span>
            ),
          )}
        </div>
      </div>

      <Section num="01" title="Periode">
        <Field label="Navn på periode" required>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
          />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Type">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as typeof type)}
              className={inputCls}
            >
              <option>Forberedelse</option>
              <option>Konkurranse</option>
              <option>Restitusjon</option>
              <option>Off-season</option>
            </select>
          </Field>
          <Field label="Farge">
            <div className="flex items-center gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.id)}
                  aria-label={c.label}
                  className={`h-8 w-8 rounded-full border-2 ${c.cls} ${
                    color === c.id ? "ring-2 ring-foreground ring-offset-2" : ""
                  }`}
                />
              ))}
              <span className="ml-2 font-mono text-[11px] text-muted-foreground">
                Valgt:{" "}
                <strong className="text-foreground">
                  {COLORS.find((c) => c.id === color)?.label}
                </strong>
              </span>
            </div>
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Startdato" required>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`${inputCls} font-mono`}
            />
          </Field>
          <Field label="Sluttdato" required>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={`${inputCls} font-mono`}
            />
          </Field>
        </div>
      </Section>

      <Section num="02" title="Fokus">
        <Field label="SG-områder">
          <div className="flex flex-wrap gap-2">
            {SG_OPTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSgFocus((p) => toggle(p, s))}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  sgFocus.includes(s)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Pyramide-fokus">
          <div className="flex flex-wrap gap-2">
            {PYR_OPTIONS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPyrFocus((prev) => toggle(prev, p))}
                className={`rounded-full border px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] ${
                  pyrFocus.includes(p)
                    ? "border-foreground bg-foreground text-accent"
                    : "border-border bg-card text-muted-foreground"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Mål for perioden">
          <div className="flex flex-wrap gap-2">
            {goals.map((g, i) => (
              <span
                key={g}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs"
              >
                <span className="font-mono text-[10px] font-bold text-muted-foreground">
                  {i + 1}
                </span>
                {g}
                <button
                  type="button"
                  onClick={() => setGoals((p) => p.filter((x) => x !== g))}
                  aria-label="Fjern"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X size={10} strokeWidth={2.5} />
                </button>
              </span>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addGoal();
                }
              }}
              placeholder="Legg til mål for perioden …"
              className={inputCls}
            />
            <button
              type="button"
              onClick={addGoal}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
            >
              <Plus size={11} strokeWidth={2.5} /> Legg til
            </button>
          </div>
        </Field>
      </Section>

      <Section num="03" title="Intensitet">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Slider label="Volum · økter/uke" value={volume} onChange={setVolume} />
          <Slider label="Belastning · fys" value={load} onChange={setLoad} />
        </div>
        <div className="flex items-start gap-3 rounded-md border border-accent/40 bg-accent/15 p-4 text-sm">
          <AlertTriangle
            size={16}
            strokeWidth={1.75}
            className="mt-0.5 flex-shrink-0 text-accent-foreground"
          />
          <div>
            <strong>Overlapper «Spesialisering»</strong> som slutter 03.06.2026.
            Vurder å justere én av periodene før lagring.
          </div>
        </div>
      </Section>

      <Section num="04" title="Vedlegg og notat">
        <Field label="Tilknyttede turneringer">
          <div className="space-y-2">
            {TURNERINGER.map((t) => {
              const active = selectedTurns.includes(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTurns((p) => toggle(p, t.id))}
                  className={`flex w-full items-center gap-3 rounded-md border px-4 py-3 text-left text-sm ${
                    active
                      ? "border-primary bg-primary/[0.04]"
                      : "border-border bg-card"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-sm border ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border"
                    }`}
                  >
                    {active && <Check size={11} strokeWidth={2.5} />}
                  </span>
                  <span className="flex-1 font-medium">{t.name}</span>
                  {t.badge && (
                    <span className="rounded-full bg-accent px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-accent-foreground">
                      {t.badge}
                    </span>
                  )}
                  <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                    {t.dates}
                  </span>
                </button>
              );
            })}
          </div>
        </Field>
        <Field label="Coach-notat">
          <textarea
            value={coachNote}
            onChange={(e) => setCoachNote(e.target.value)}
            rows={4}
            className={inputCls}
          />
        </Field>
      </Section>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <footer className="sticky bottom-0 -mx-4 mt-4 flex items-center gap-3 border-t border-border bg-card/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <button
          type="button"
          onClick={slett}
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10"
        >
          <Trash2 size={12} strokeWidth={1.75} /> Slett periode
        </button>
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={pending}
            className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/40"
          >
            Avbryt
          </button>
          <button
            type="button"
            onClick={lagre}
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            <Check size={14} strokeWidth={2} />
            {pending ? "Lagrer…" : "Lagre endringer"}
          </button>
        </div>
      </footer>
    </>
  );
}

const inputCls =
  "w-full rounded-md border border-input bg-card px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30";

function Section({
  num,
  title,
  children,
}: {
  num: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          {num}
        </span>
        <h2 className="font-display text-base font-semibold tracking-tight">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </span>
      {children}
    </label>
  );
}

function Slider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="rounded-md border border-border bg-background p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          {label}
        </span>
        <span className="font-mono text-2xl font-semibold tabular-nums">
          {value}
          <small className="text-sm text-muted-foreground"> / 10</small>
        </span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="w-full accent-primary"
      />
      <div className="mt-1 flex justify-between font-mono text-[9px] text-muted-foreground tabular-nums">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <span key={n}>{n}</span>
        ))}
      </div>
    </div>
  );
}
