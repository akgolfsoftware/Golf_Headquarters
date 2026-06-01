"use client";

import { useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, Check, Plus } from "lucide-react";
import { logSymptom } from "./actions";

type Side = "Venstre" | "Høyre" | "Midt / begge";
type View = "front" | "back";

const REGIONS = [
  { id: "hode", label: "Hode", side: null },
  { id: "skulder-h", label: "Skulder", side: "Høyre" as const },
  { id: "skulder-v", label: "Skulder", side: "Venstre" as const },
  { id: "bryst", label: "Bryst", side: null },
  { id: "albue-h", label: "Albue", side: "Høyre" as const },
  { id: "albue-v", label: "Albue", side: "Venstre" as const },
  { id: "haandledd-h", label: "Håndledd", side: "Høyre" as const },
  { id: "haandledd-v", label: "Håndledd", side: "Venstre" as const },
  { id: "hofte", label: "Hofte", side: null },
  { id: "kne-h", label: "Kne", side: "Høyre" as const },
  { id: "kne-v", label: "Kne", side: "Venstre" as const },
  { id: "ankel-h", label: "Ankel", side: "Høyre" as const },
  { id: "ankel-v", label: "Ankel", side: "Venstre" as const },
];

const MOVE_TRIGGERS = ["Svingbevegelse", "Sittende", "Gå", "Løft", "Bøy"];
const TIME_TRIGGERS = ["Morgen", "Etter trening", "Kveld", "Natt"];

const STEG_LABEL: Record<1 | 2 | 3, string> = {
  1: "Kroppskart",
  2: "Intensitet",
  3: "Trigger",
};

export function SymptomWizard() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [view, setView] = useState<View>("front");
  const [selectedRegion, setSelectedRegion] = useState("skulder-h");
  const [side, setSide] = useState<Side>("Høyre");
  const [vas, setVas] = useState(4);
  const [varighet, setVarighet] = useState<"Akutt" | "Kronisk">("Kronisk");
  const [occurence, setOccurence] = useState<"Kun trening" | "Kun spill" | "Alltid">(
    "Kun spill",
  );
  const [moveTriggers, setMoveTriggers] = useState<string[]>([]);
  const [timeTriggers, setTimeTriggers] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [requestFysio, setRequestFysio] = useState(true);

  const region = REGIONS.find((r) => r.id === selectedRegion);

  function toggle(arr: string[], v: string): string[] {
    return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
  }

  function next() {
    if (step < 3) {
      setStep((s) => (s + 1) as 1 | 2 | 3);
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await logSymptom({
          region: region?.label ?? "",
          side,
          vas,
          varighet,
          occurence,
          triggers: moveTriggers,
          daytimeTriggers: timeTriggers,
          note: note || undefined,
          requestFysio,
        });
      } catch {
        setError("Kunne ikke lagre symptom.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Stepper */}
      <div className="flex items-center gap-1.5">
        {([1, 2, 3] as const).map((i, idx) => (
          <div key={i} className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                if (i <= step) setStep(i);
              }}
              aria-label={`Steg ${i}`}
              className={`flex h-8 w-8 items-center justify-center rounded-full font-mono text-xs font-bold ${
                i < step
                  ? "bg-primary text-accent"
                  : i === step
                    ? "bg-foreground text-accent"
                    : "border border-border bg-card text-muted-foreground"
              }`}
            >
              {i < step ? <Check size={14} strokeWidth={2.5} aria-hidden /> : i}
            </button>
            {idx < 2 && (
              <span className={`h-px w-6 ${i < step ? "bg-primary" : "bg-border"}`} />
            )}
          </div>
        ))}
        <span className="ml-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
          {step} / 3 · {STEG_LABEL[step]}
        </span>
      </div>

      {/* STEP 1 — body map */}
      {step === 1 && (
        <section className="flex flex-col gap-4">
          <div>
            <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
              Kroppskart · steg 1
            </span>
            <h2 className="mt-1.5 font-display text-2xl font-bold leading-tight tracking-[-0.015em] text-foreground">
              Hvor <em className="font-normal italic text-primary">kjenner du det</em>?
            </h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
              Trykk på området der du har symptomet. Bytt for-/bakside ved behov.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 rounded-[14px] border border-border bg-card p-4">
            <div className="inline-flex rounded-full border border-border bg-background p-1">
              {(["front", "back"] as View[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  className={`rounded-full px-4 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.06em] ${
                    view === v ? "bg-foreground text-accent" : "text-muted-foreground"
                  }`}
                >
                  {v === "front" ? "Forfra" : "Bakfra"}
                </button>
              ))}
            </div>
            <svg viewBox="0 0 200 440" className="h-72 w-auto">
              <path
                d="M100 8c-15 0-26 11-26 26 0 9 4 17 11 22-3 4-5 8-7 12-12 4-22 10-22 18v36c0 4 2 7 5 9l1 86c-7 4-11 11-11 18v62c0 14 11 25 25 25h.5v92c0 9 7 16 16 16 9 0 16-7 16-16v-92m14 0v92c0 9 7 16 16 16 9 0 16-7 16-16v-92h.5c14 0 25-11 25-25v-62c0-7-4-14-11-18l1-86c3-2 5-5 5-9V86c0-8-10-14-22-18-2-4-4-8-7-12 7-5 11-13 11-22 0-15-11-26-26-26z"
                fill="hsl(var(--muted))"
                stroke="hsl(var(--border))"
                strokeWidth="1.5"
              />
              {[
                { id: "hode", cx: 100, cy: 34, type: "ellipse", rx: 22, ry: 24 },
                { id: "skulder-h", cx: 128, cy: 92, type: "ellipse", rx: 18, ry: 14 },
                { id: "skulder-v", cx: 72, cy: 92, type: "ellipse", rx: 18, ry: 14 },
                { id: "bryst", cx: 100, cy: 127, type: "rect", w: 48, h: 38 },
                { id: "albue-h", cx: 148, cy: 160, type: "circle", r: 10 },
                { id: "albue-v", cx: 52, cy: 160, type: "circle", r: 10 },
                { id: "haandledd-h", cx: 155, cy: 218, type: "circle", r: 9 },
                { id: "haandledd-v", cx: 45, cy: 218, type: "circle", r: 9 },
                { id: "hofte", cx: 100, cy: 224, type: "rect", w: 56, h: 32 },
                { id: "kne-h", cx: 118, cy: 320, type: "circle", r: 11 },
                { id: "kne-v", cx: 82, cy: 320, type: "circle", r: 11 },
                { id: "ankel-h", cx: 118, cy: 412, type: "ellipse", rx: 8, ry: 11 },
                { id: "ankel-v", cx: 82, cy: 412, type: "ellipse", rx: 8, ry: 11 },
              ].map((r) => {
                const sel = selectedRegion === r.id;
                const cls = sel
                  ? "fill-primary stroke-primary"
                  : "fill-background stroke-muted-foreground/50 hover:fill-primary/20";
                const common = {
                  className: `cursor-pointer ${cls}`,
                  strokeWidth: 1.5,
                  onClick: () => {
                    setSelectedRegion(r.id);
                    if (r.id.endsWith("-h")) setSide("Høyre");
                    else if (r.id.endsWith("-v")) setSide("Venstre");
                    else setSide("Midt / begge");
                  },
                };
                if (r.type === "circle") {
                  return <circle key={r.id} cx={r.cx} cy={r.cy} r={r.r} {...common} />;
                }
                if (r.type === "ellipse") {
                  return (
                    <ellipse key={r.id} cx={r.cx} cy={r.cy} rx={r.rx} ry={r.ry} {...common} />
                  );
                }
                return (
                  <rect
                    key={r.id}
                    x={r.cx - (r.w ?? 0) / 2}
                    y={r.cy - (r.h ?? 0) / 2}
                    width={r.w}
                    height={r.h}
                    rx="6"
                    {...common}
                  />
                );
              })}
            </svg>
          </div>

          {/* Valgt område */}
          <div className="flex flex-col gap-3 rounded-[14px] border border-border bg-card p-4">
            <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
              Valgt område
            </span>
            <div className="flex items-start gap-2 rounded-[12px] border border-primary/30 bg-primary/[0.04] p-3.5">
              <span className="mt-1 inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
              <div>
                <div className="text-sm text-foreground">
                  <em className="font-display italic text-primary">{side}</em>{" "}
                  {region?.label.toLowerCase()}
                </div>
                <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
                  {region?.label}
                </div>
              </div>
            </div>
            <div>
              <span className="mb-2 block font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
                Side *
              </span>
              <div className="flex flex-wrap gap-2">
                {(["Venstre", "Høyre", "Midt / begge"] as Side[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSide(s)}
                    className={`rounded-full border px-3.5 py-2 text-[13px] font-semibold ${
                      side === s
                        ? "border-foreground bg-foreground text-accent"
                        : "border-border bg-card text-muted-foreground"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <section className="flex flex-col gap-4">
          <div>
            <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
              Intensitet · varighet · steg 2
            </span>
            <h2 className="mt-1.5 font-display text-2xl font-bold leading-tight tracking-[-0.015em] text-foreground">
              Hvor <em className="font-normal italic text-primary">vondt</em> — og hvor lenge?
            </h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
              VAS-skalaen er 0–10. Vær ærlig — coach og fysio bruker tallet til å
              prioritere oppfølging.
            </p>
          </div>

          <div className="rounded-[14px] border border-border bg-card p-4">
            <div className="mb-2 flex items-baseline justify-between">
              <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
                Intensitet (VAS 0–10)
              </span>
              <span className="font-mono text-3xl font-bold tabular-nums text-foreground">
                {vas}
                <small className="text-base text-muted-foreground"> / 10</small>
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={10}
              value={vas}
              onChange={(e) => setVas(parseInt(e.target.value, 10))}
              className="w-full accent-primary"
              aria-label="Intensitet VAS 0 til 10"
            />
            <div className="mt-2 flex justify-between font-mono text-[9px] uppercase tracking-[0.04em] text-muted-foreground">
              <span>Ingen smerte</span>
              <span>Verst tenkelig</span>
            </div>
          </div>

          <div>
            <span className="mb-2 block font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
              Varighet *
            </span>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: "Akutt" as const, sub: "Under 1 uke" },
                  { id: "Kronisk" as const, sub: "Over 1 uke" },
                ]
              ).map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setVarighet(o.id)}
                  className={`rounded-[12px] border p-3.5 text-left ${
                    varighet === o.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="font-display text-sm font-bold text-foreground">
                    {o.id}
                  </div>
                  <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
                    {o.sub}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="mb-2 block font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
              Når kjenner du det? *
            </span>
            <div className="grid grid-cols-1 gap-2">
              {(
                [
                  { id: "Kun trening" as const, desc: "Range / gym" },
                  { id: "Kun spill" as const, desc: "På banen" },
                  { id: "Alltid" as const, desc: "Også i hvile" },
                ]
              ).map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setOccurence(o.id)}
                  className={`flex items-center gap-2 rounded-[12px] border px-3.5 py-3 text-left text-sm ${
                    occurence === o.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card"
                  }`}
                >
                  <span className="font-semibold text-foreground">{o.id}</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
                    {o.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <section className="flex flex-col gap-4">
          <div>
            <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
              Triggere · notat · steg 3
            </span>
            <h2 className="mt-1.5 font-display text-2xl font-bold leading-tight tracking-[-0.015em] text-foreground">
              Hva <em className="font-normal italic text-primary">utløser</em> det?
            </h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
              Velg alle som passer — multivalg gir bedre mønstergjenkjenning over tid.
            </p>
          </div>

          <div>
            <span className="mb-2 block font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
              Bevegelses-utløsere
            </span>
            <div className="flex flex-wrap gap-2">
              {MOVE_TRIGGERS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setMoveTriggers((p) => toggle(p, t))}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] font-semibold ${
                    moveTriggers.includes(t)
                      ? "border-foreground bg-foreground text-accent"
                      : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  <Plus size={11} strokeWidth={2.5} aria-hidden />
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="mb-2 block font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
              Tidspunkt på døgnet
            </span>
            <div className="flex flex-wrap gap-2">
              {TIME_TRIGGERS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTimeTriggers((p) => toggle(p, t))}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] font-semibold ${
                    timeTriggers.includes(t)
                      ? "border-foreground bg-foreground text-accent"
                      : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  <Plus size={11} strokeWidth={2.5} aria-hidden />
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="mb-2 block font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
              Fritt notat ·{" "}
              <span className="font-normal normal-case text-muted-foreground/70">valgfritt</span>
            </span>
            <div className="relative">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, 500))}
                rows={5}
                placeholder="Skriv kort hva du opplever — hjelper coach og fysio prioritere"
                className="w-full rounded-[11px] border border-input bg-card px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors focus-visible:outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
              <span className="absolute bottom-2 right-3 font-mono text-[10px] text-muted-foreground">
                {note.length} / 500
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setRequestFysio((v) => !v)}
            className={`flex w-full items-center gap-3 rounded-[12px] border p-3.5 text-left ${
              requestFysio ? "border-primary bg-primary/[0.04]" : "border-border bg-card"
            }`}
          >
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border ${
                requestFysio
                  ? "border-primary bg-primary text-accent"
                  : "border-input"
              }`}
            >
              {requestFysio && <Check size={11} strokeWidth={2.5} aria-hidden />}
            </span>
            <div className="flex-1">
              <div className="font-display text-sm font-bold text-foreground">
                Be om time hos <em className="italic">fysio</em>
              </div>
              <div className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
                Vi sender forespørsel til medisinsk team — de kontakter deg innen 24 t.
              </div>
            </div>
          </button>
        </section>
      )}

      {error && (
        <div className="rounded-[12px] border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-[13px] text-destructive">
          {error}
        </div>
      )}

      {/* Footer — sticky handlingsbar */}
      <footer className="sticky bottom-0 -mx-2 flex items-center gap-2 border-t border-border bg-card/95 px-3 py-3 backdrop-blur">
        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
            disabled={pending}
            className="inline-flex h-11 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
          >
            <ArrowLeft size={14} strokeWidth={1.75} aria-hidden /> Tilbake
          </button>
        )}
        <span className="min-w-0 flex-1 truncate font-mono text-[10px] tracking-[0.02em] text-muted-foreground">
          {side} {region?.label.toLowerCase()} · VAS{" "}
          <strong className="text-foreground">{vas}/10</strong>
        </span>
        <button
          type="button"
          onClick={next}
          disabled={pending}
          className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-accent px-5 font-mono text-[11px] font-extrabold uppercase tracking-[0.08em] text-primary shadow-[0_6px_14px_hsl(var(--accent)/0.25)] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:opacity-50"
        >
          {step < 3 ? "Neste" : pending ? "Lagrer…" : "Lagre"}
          <ArrowRight size={14} strokeWidth={2.2} aria-hidden />
        </button>
      </footer>
    </div>
  );
}
