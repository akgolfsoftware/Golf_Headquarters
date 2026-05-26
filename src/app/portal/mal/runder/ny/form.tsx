"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Check, Sun, Cloud, CloudRain, Wind, X } from "lucide-react";
import { logRoundManual } from "./actions";

type Course = { id: string; name: string; par: number };
type Tee = "white" | "yellow" | "blue" | "red";
type ScoreMode = "hole" | "total";

const PAR_TEMPLATE: number[] = [4, 5, 3, 4, 4, 4, 5, 3, 4, 4, 4, 3, 5, 4, 4, 5, 3, 4];

const TEE_OPTIONS: Array<{ id: Tee; label: string; color: string }> = [
  { id: "white", label: "Hvit", color: "bg-white border-foreground/40" },
  { id: "yellow", label: "Gul", color: "bg-[#E8C939]" },
  { id: "blue", label: "Blå", color: "bg-[#3B6FB8]" },
  { id: "red", label: "Rød", color: "bg-[#C2403E]" },
];

const WEATHER_OPTIONS: Array<{ id: string; label: string; icon: typeof Sun }> = [
  { id: "sol", label: "Sol", icon: Sun },
  { id: "skyet", label: "Skyet", icon: Cloud },
  { id: "regn", label: "Regn", icon: CloudRain },
  { id: "vind", label: "Lett vind", icon: Wind },
];

const SPILLTYPE_OPTIONS = ["Single", "Foursome", "Scramble", "Comp", "Trening"];

export function LeggTilRundeForm({
  userName,
  courses,
}: {
  userName: string;
  courses: Course[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "");
  const [scoreMode, setScoreMode] = useState<ScoreMode>("hole");
  const [tee, setTee] = useState<Tee>("white");
  const [holeScores, setHoleScores] = useState<number[]>(
    PAR_TEMPLATE.map((p) => p),
  );
  const [totalScore, setTotalScore] = useState<string>("73");
  const [stableford, setStableford] = useState<string>("37");
  const [playedAt, setPlayedAt] = useState(today);
  const [startTime, setStartTime] = useState("09:24");
  const [weather, setWeather] = useState<string[]>(["sol", "vind"]);
  const [spilltype, setSpilltype] = useState("Trening");
  const [partners, setPartners] = useState<string[]>(["Tim", "Espen"]);
  const [partnerInput, setPartnerInput] = useState("");
  const [fir, setFir] = useState({ hits: "11", of: "14" });
  const [gir, setGir] = useState({ hits: "13", of: "18" });
  const [putts, setPutts] = useState("30");
  const [sandSaves, setSandSaves] = useState("2 av 3");
  const [penalties, setPenalties] = useState("1");
  const [notes, setNotes] = useState(
    "God runde, kun ett trippel-bogey på 14. Driver fungerte fra start til slutt.",
  );
  const [tellHandicap, setTellHandicap] = useState(true);

  const par = useMemo(
    () => courses.find((c) => c.id === courseId)?.par ?? 72,
    [courseId, courses],
  );

  const computedTotal = useMemo(
    () => holeScores.reduce((s, n) => s + (n || 0), 0),
    [holeScores],
  );
  const computedDiff = computedTotal - par;
  const front = holeScores.slice(0, 9).reduce((s, n) => s + (n || 0), 0);
  const back = holeScores.slice(9, 18).reduce((s, n) => s + (n || 0), 0);

  function setHole(i: number, val: string) {
    const n = parseInt(val, 10);
    setHoleScores((prev) => {
      const next = [...prev];
      next[i] = isNaN(n) ? 0 : n;
      return next;
    });
  }

  function addPartner() {
    const v = partnerInput.trim();
    if (v && !partners.includes(v)) setPartners((p) => [...p, v]);
    setPartnerInput("");
  }

  function lagre() {
    if (!courseId) {
      setError("Velg bane.");
      return;
    }
    const score =
      scoreMode === "hole" ? computedTotal : parseInt(totalScore, 10) || 0;
    if (!score) {
      setError("Score må være et tall.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await logRoundManual({
          courseId,
          playedAt,
          score,
          holeScores: scoreMode === "hole" ? holeScores : undefined,
          tee,
          weather,
          spillType: spilltype,
          partners,
          fir: { hits: parseInt(fir.hits, 10) || 0, of: parseInt(fir.of, 10) || 0 },
          gir: { hits: parseInt(gir.hits, 10) || 0, of: parseInt(gir.of, 10) || 0 },
          putts: parseInt(putts, 10) || undefined,
          sandSaves: sandSaves || undefined,
          penalties: parseInt(penalties, 10) || undefined,
          notes: notes || undefined,
          tellHandicap,
        });
        router.push("/portal/mal/runder");
        router.refresh();
      } catch {
        setError("Kunne ikke lagre. Prøv igjen.");
      }
    });
  }

  return (
    <>
      {/* SEC 1: Bane */}
      <Section num="01" title="Bane">
        <Field label="Bane" required>
          <div className="relative">
            <MapPin
              size={14}
              strokeWidth={1.75}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className={`${inputCls} pl-10`}
            >
              {courses.length === 0 && <option value="">Ingen baner</option>}
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (par {c.par})
                </option>
              ))}
            </select>
          </div>
        </Field>
        <Field label="Tee" required>
          <div className="flex flex-wrap gap-2">
            {TEE_OPTIONS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTee(t.id)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] ${
                  tee === t.id
                    ? "border-foreground bg-foreground text-accent"
                    : "border-border bg-card text-muted-foreground"
                }`}
              >
                <span
                  className={`block h-2.5 w-2.5 rounded-full ${t.color}`}
                  aria-hidden="true"
                />
                {t.label}
              </button>
            ))}
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-0 overflow-hidden rounded-md border border-border bg-background sm:grid-cols-4">
          <MetaCell k="Slope" v="134" />
          <MetaCell k="CR" v="71,5" />
          <MetaCell k="Par" v={String(par)} />
          <MetaCell k="Lengde" v="6 184" unit="m" />
        </div>
      </Section>

      {/* SEC 2: Score */}
      <Section
        num="02"
        title="Score"
        headerExtra={
          <div className="ml-auto inline-flex gap-1 rounded-md border border-border bg-background p-1">
            {(["hole", "total"] as ScoreMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setScoreMode(m)}
                className={`rounded-md px-4 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] ${
                  scoreMode === m
                    ? "bg-foreground text-accent"
                    : "text-muted-foreground"
                }`}
              >
                {m === "hole" ? "Hull for hull" : "Bare total"}
              </button>
            ))}
          </div>
        }
      >
        {scoreMode === "hole" ? (
          <>
            <NineBlock
              label="Front 9"
              parTotal={36}
              scoreTotal={front}
              parTemplate={PAR_TEMPLATE.slice(0, 9)}
              startIdx={0}
              holeScores={holeScores}
              onChange={setHole}
            />
            <NineBlock
              label="Back 9"
              parTotal={36}
              scoreTotal={back}
              parTemplate={PAR_TEMPLATE.slice(9, 18)}
              startIdx={9}
              holeScores={holeScores}
              onChange={setHole}
            />
            <div className="grid grid-cols-3 gap-2 rounded-md border border-border bg-background p-4 sm:gap-4">
              <ScoreTot k="Total" v={String(computedTotal)} />
              <ScoreTot
                k="vs par"
                v={`${computedDiff > 0 ? "+" : ""}${computedDiff}`}
                accent
              />
              <ScoreTot k="Stableford" v="37" />
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Total score" required>
              <input
                type="number"
                value={totalScore}
                onChange={(e) => setTotalScore(e.target.value)}
                className={`${inputCls} font-mono tabular-nums`}
              />
            </Field>
            <Field label="Stableford">
              <input
                type="number"
                value={stableford}
                onChange={(e) => setStableford(e.target.value)}
                className={`${inputCls} font-mono tabular-nums`}
              />
            </Field>
          </div>
        )}
      </Section>

      {/* SEC 3: Kontekst */}
      <Section num="03" title="Kontekst">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Dato" required>
            <input
              type="date"
              value={playedAt}
              onChange={(e) => setPlayedAt(e.target.value)}
              className={`${inputCls} font-mono tabular-nums`}
            />
          </Field>
          <Field label="Starttid">
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={`${inputCls} font-mono tabular-nums`}
            />
          </Field>
        </div>

        <Field label="Vær">
          <div className="flex flex-wrap gap-2">
            {WEATHER_OPTIONS.map((w) => {
              const Icon = w.icon;
              const active = weather.includes(w.id);
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() =>
                    setWeather((prev) =>
                      prev.includes(w.id)
                        ? prev.filter((x) => x !== w.id)
                        : [...prev, w.id],
                    )
                  }
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium ${
                    active
                      ? "border-foreground bg-foreground text-accent"
                      : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  <Icon size={13} strokeWidth={1.75} />
                  {w.label}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Spilltype" required>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {SPILLTYPE_OPTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSpilltype(s)}
                className={`rounded-md border px-4 py-2 text-xs font-semibold ${
                  spilltype === s
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Partnere">
          <div className="flex flex-wrap items-center gap-2 rounded-md border border-input bg-card p-2">
            {partners.map((p) => (
              <span
                key={p}
                className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-4 py-1 text-xs font-medium text-foreground"
              >
                {p}
                <button
                  type="button"
                  onClick={() =>
                    setPartners((prev) => prev.filter((x) => x !== p))
                  }
                  aria-label={`Fjern ${p}`}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X size={11} strokeWidth={2.5} />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={partnerInput}
              onChange={(e) => setPartnerInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addPartner();
                }
              }}
              placeholder="Legg til partner …"
              className="min-w-[140px] flex-1 bg-transparent text-sm outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 placeholder:text-muted-foreground"
            />
          </div>
        </Field>
      </Section>

      {/* SEC 4: Detaljerte stats */}
      <Section
        num="04"
        title="Detaljerte stats"
        titleSuffix="VALGFRITT"
        collapsible
      >
        <div className="grid grid-cols-[1fr_70px_70px_70px] items-center gap-2">
          <div />
          <div className="text-center font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
            Treff
          </div>
          <div className="text-center font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
            av
          </div>
          <div className="text-center font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
            %
          </div>
        </div>
        {[
          { label: "Fairways i regulering", sub: "FIR", v: fir, setter: setFir },
          { label: "Greens i regulering", sub: "GIR", v: gir, setter: setGir },
        ].map((row) => {
          const pct =
            row.v.of && row.v.hits
              ? Math.round(
                  (parseInt(row.v.hits, 10) / parseInt(row.v.of, 10)) * 100,
                )
              : 0;
          return (
            <div
              key={row.sub}
              className="grid grid-cols-[1fr_70px_70px_70px] items-center gap-2"
            >
              <div className="text-sm">
                {row.label}
                <small className="ml-2 font-mono text-[10px] text-muted-foreground">
                  {row.sub}
                </small>
              </div>
              <input
                value={row.v.hits}
                onChange={(e) => row.setter({ ...row.v, hits: e.target.value })}
                className={`${inputCls} text-center font-mono`}
              />
              <input
                value={row.v.of}
                onChange={(e) => row.setter({ ...row.v, of: e.target.value })}
                className={`${inputCls} text-center font-mono`}
              />
              <div
                className={`${inputCls} text-center font-mono font-semibold text-primary`}
              >
                {pct}%
              </div>
            </div>
          );
        })}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Putts (total)">
            <input
              value={putts}
              onChange={(e) => setPutts(e.target.value)}
              className={`${inputCls} font-mono`}
            />
          </Field>
          <Field label="Sand-saves">
            <input
              value={sandSaves}
              onChange={(e) => setSandSaves(e.target.value)}
              className={`${inputCls} font-mono`}
            />
          </Field>
          <Field label="Penalties">
            <input
              value={penalties}
              onChange={(e) => setPenalties(e.target.value)}
              className={`${inputCls} font-mono`}
            />
          </Field>
        </div>
      </Section>

      {/* SEC 5: Notater */}
      <Section num="05" title="Notat">
        <Field label="">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value.slice(0, 500))}
            placeholder="Hva husker du fra runden? Slag du vil jobbe videre med?"
            rows={4}
            className={inputCls}
          />
          <div className="mt-1 text-right font-mono text-[10px] text-muted-foreground">
            {notes.length} / 500
          </div>
        </Field>
        <div className="flex items-center justify-between rounded-md border border-border bg-background px-4 py-2">
          <div>
            <div className="text-sm font-medium">Tell på handicap</div>
            <div className="font-mono text-[10px] text-muted-foreground">
              Sendes til GolfBox når lagret
            </div>
          </div>
          <button
            type="button"
            onClick={() => setTellHandicap((v) => !v)}
            aria-pressed={tellHandicap}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              tellHandicap ? "bg-primary" : "bg-border"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                tellHandicap ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      </Section>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      {/* Sticky footer */}
      <div className="sticky bottom-0 -mx-4 mt-4 flex items-center gap-2 border-t border-border bg-card px-4 py-2 sm:-mx-6 sm:px-6">
        <div className="font-mono text-[11px] text-muted-foreground">
          {courses.find((c) => c.id === courseId)?.name ?? "—"} ·{" "}
          <strong className="text-foreground">
            {computedTotal} ({computedDiff > 0 ? "+" : ""}
            {computedDiff})
          </strong>{" "}
          · {playedAt} · {spilltype.toLowerCase()} · {userName.split(" ")[0]}
        </div>
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
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            <Check size={14} strokeWidth={2} />
            {pending ? "Lagrer…" : "Lagre runde"}
          </button>
        </div>
      </div>
    </>
  );
}

/* ---------- helpers ---------- */
const inputCls =
  "w-full rounded-md border border-input bg-card px-4 py-2.5 text-sm text-foreground outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30";

function Section({
  num,
  title,
  titleSuffix,
  children,
  headerExtra,
  collapsible,
}: {
  num: string;
  title: string;
  titleSuffix?: string;
  children: React.ReactNode;
  headerExtra?: React.ReactNode;
  collapsible?: boolean;
}) {
  const [open, setOpen] = useState(true);
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          {num}
        </span>
        <h2 className="font-display text-base font-semibold tracking-tight">
          {title}
          {titleSuffix && (
            <span className="ml-2 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              {titleSuffix}
            </span>
          )}
        </h2>
        {headerExtra}
        {collapsible && !headerExtra && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="ml-auto font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground hover:text-foreground"
          >
            {open ? "Skjul" : "Vis"}
          </button>
        )}
      </div>
      {(open || !collapsible) && (
        <div className="flex flex-col gap-4">{children}</div>
      )}
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
      {label && (
        <span className="mb-1.5 block font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </span>
      )}
      {children}
    </label>
  );
}

function MetaCell({ k, v, unit }: { k: string; v: string; unit?: string }) {
  return (
    <div className="border-b border-border px-4 py-2 last:border-r-0 sm:border-b-0 sm:border-r">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {k}
      </div>
      <div className="mt-1 font-mono text-sm font-semibold text-foreground tabular-nums">
        {v}
        {unit && <small className="ml-1 text-muted-foreground"> {unit}</small>}
      </div>
    </div>
  );
}

function NineBlock({
  label,
  parTotal,
  scoreTotal,
  parTemplate,
  startIdx,
  holeScores,
  onChange,
}: {
  label: string;
  parTotal: number;
  scoreTotal: number;
  parTemplate: number[];
  startIdx: number;
  holeScores: number[];
  onChange: (i: number, v: string) => void;
}) {
  return (
    <div className="rounded-md border border-border bg-background p-4">
      <div className="mb-2 flex items-center justify-between font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        <span>{label}</span>
        <span>
          Par {parTotal} · Score{" "}
          <strong className="text-foreground tabular-nums">{scoreTotal}</strong>
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-9">
        {parTemplate.map((p, i) => {
          const idx = startIdx + i;
          const v = holeScores[idx];
          const diff = (v || 0) - p;
          const bg =
            v === 0
              ? "bg-card"
              : diff < 0
                ? "bg-primary/10"
                : diff === 0
                  ? "bg-card"
                  : diff === 1
                    ? "bg-accent/30"
                    : "bg-destructive/15";
          return (
            <div
              key={idx}
              className={`flex flex-col items-center gap-1 rounded-md border border-border p-2 ${bg}`}
            >
              <span className="font-mono text-[10px] font-semibold text-muted-foreground">
                {idx + 1}
              </span>
              <span className="font-mono text-[9px] text-muted-foreground">
                par <span>{p}</span>
              </span>
              <input
                type="number"
                value={v || ""}
                onChange={(e) => onChange(idx, e.target.value)}
                className="w-full rounded-sm border-0 bg-transparent text-center font-mono text-base font-semibold tabular-nums outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ScoreTot({
  k,
  v,
  accent,
}: {
  k: string;
  v: string;
  accent?: boolean;
}) {
  return (
    <div className="text-center">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {k}
      </div>
      <div
        className={`mt-1 font-mono text-2xl font-semibold tabular-nums ${
          accent ? "text-primary" : "text-foreground"
        }`}
      >
        {v}
      </div>
    </div>
  );
}
