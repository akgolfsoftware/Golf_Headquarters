"use client";

import { useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, Check, Plus } from "lucide-react";
import { logSymptom } from "./actions";
import { AthleticButton } from "@/components/athletic/button";

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
  const [moveTriggers, setMoveTriggers] = useState<string[]>(["Svingbevegelse"]);
  const [timeTriggers, setTimeTriggers] = useState<string[]>(["Kveld"]);
  const [note, setNote] = useState(
    "Begynner å kjenne det etter range-økt på 60+ baller, særlig drivere. Stivner over natten, løsner etter 5 min oppvarming neste dag. Ingen smerte i hvile.",
  );
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
    <>
      {/* Stepper */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((i, idx) => (
          <div key={i} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (i <= step) setStep(i as 1 | 2 | 3);
              }}
              aria-label={`Steg ${i}`}
              className={`relative flex h-9 w-9 items-center justify-center rounded-full font-mono text-xs font-bold ${
                i < step
                  ? "bg-primary text-primary-foreground"
                  : i === step
                    ? "bg-foreground text-accent"
                    : "border border-border bg-card text-muted-foreground"
              }`}
            >
              {i < step ? <Check size={14} strokeWidth={2.5} /> : i}
            </button>
            {idx < 2 && (
              <span
                className={`h-px w-12 ${
                  i < step ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
        <span className="ml-2 font-mono text-[11px] text-muted-foreground">
          Steg <strong className="text-foreground">{step}</strong> av 3 ·{" "}
          {step === 1 && "Kroppskart"}
          {step === 2 && "Intensitet"}
          {step === 3 && "Trigger"}
        </span>
      </div>

      {/* STEP 1 — body map */}
      {step === 1 && (
        <section className="space-y-6">
          <div>
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Kroppskart · steg 1
            </span>
            <h2 className="mt-2 font-display text-2xl font-semibold leading-tight">
              Hvor <em className="italic text-primary">kjenner du det</em>?
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Klikk på området der du har symptomet. Toggle for- / baksiden om
              nødvendig — vi spør deg om side og detaljer rett under.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 rounded-2xl border border-border bg-card p-6 lg:grid-cols-[1fr_280px]">
            <div className="flex flex-col items-center gap-2">
              <div className="inline-flex rounded-full border border-border bg-background p-1">
                {(["front", "back"] as View[]).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setView(v)}
                    className={`rounded-full px-4 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] ${
                      view === v
                        ? "bg-foreground text-accent"
                        : "text-muted-foreground"
                    }`}
                  >
                    {v === "front" ? "Forfra" : "Bakfra"}
                  </button>
                ))}
              </div>
              <svg viewBox="0 0 200 440" className="h-80 w-auto">
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
              <p className="text-center font-mono text-[10px] text-muted-foreground">
                Trykk på et område — du kan endre side i panelet til høyre
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                  Valgt område
                </span>
                <p className="mt-1 text-xs text-muted-foreground">
                  Velg området som rammes mest. Smerten kan stråle ut — vi spør om
                  radius på neste steg.
                </p>
              </div>
              <div className="flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/[0.04] p-4">
                <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-primary" />
                <div>
                  <div className="text-sm">
                    <em className="font-display italic text-primary">{side}</em>{" "}
                    {region?.label.toLowerCase()} · fremre del
                  </div>
                  <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                    {region?.label} · Deltoideus anterior
                  </div>
                </div>
              </div>
              <div>
                <span className="mb-2 block font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                  Side *
                </span>
                <div className="flex flex-wrap gap-2">
                  {(["Venstre", "Høyre", "Midt / begge"] as Side[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSide(s)}
                      className={`rounded-full border px-4 py-2 text-xs font-semibold ${
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
          </div>
        </section>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <section className="space-y-6">
          <div>
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Intensitet · varighet · steg 2
            </span>
            <h2 className="mt-2 font-display text-2xl font-semibold leading-tight">
              Hvor <em className="italic text-primary">vondt</em> — og hvor lenge?
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              VAS-skalaen er en standard 0–10. Vær ærlig — coach og fysio bruker
              tallet til å prioritere oppfølging.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-2 flex items-baseline justify-between">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                Intensitet (VAS 0–10)
              </span>
              <span className="font-mono text-3xl font-semibold tabular-nums">
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
            />
            <div className="mt-1 flex justify-between font-mono text-[10px] text-muted-foreground tabular-nums">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <span key={n}>{n}</span>
              ))}
            </div>
            <div className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
              <span>Ingen smerte</span>
              <span>Verst tenkelig</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <span className="mb-2 block font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                Varighet *
              </span>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { id: "Akutt" as const, sub: "Under 1 uke" },
                    { id: "Kronisk" as const, sub: "Over 1 uke · ~2 uker" },
                  ]
                ).map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setVarighet(o.id)}
                    className={`rounded-lg border p-4 text-left ${
                      varighet === o.id
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card"
                    }`}
                  >
                    <div className="font-display text-sm font-semibold">
                      {o.id}
                    </div>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                      {o.sub}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="mb-2 block font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
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
                    className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-left text-sm ${
                      occurence === o.id
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card"
                    }`}
                  >
                    <span className="font-semibold">{o.id}</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                      {o.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <section className="space-y-6">
          <div>
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Triggere · notat · steg 3
            </span>
            <h2 className="mt-2 font-display text-2xl font-semibold leading-tight">
              Hva <em className="italic text-primary">utløser</em> det?
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Velg alle som passer — multivalg gir bedre mønstergjenkjenning over
              tid.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <span className="mb-2 block font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                Bevegelses-utløsere
              </span>
              <div className="flex flex-wrap gap-2">
                {MOVE_TRIGGERS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setMoveTriggers((p) => toggle(p, t))}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-semibold ${
                      moveTriggers.includes(t)
                        ? "border-foreground bg-foreground text-accent"
                        : "border-border bg-card text-muted-foreground"
                    }`}
                  >
                    <Plus size={11} strokeWidth={2.5} />
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="mb-2 block font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                Tidspunkt på døgnet
              </span>
              <div className="flex flex-wrap gap-2">
                {TIME_TRIGGERS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTimeTriggers((p) => toggle(p, t))}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-semibold ${
                      timeTriggers.includes(t)
                        ? "border-foreground bg-foreground text-accent"
                        : "border-border bg-card text-muted-foreground"
                    }`}
                  >
                    <Plus size={11} strokeWidth={2.5} />
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <span className="mb-2 block font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Fritt notat ·{" "}
              <span className="text-muted-foreground/70 normal-case">valgfritt</span>
            </span>
            <div className="relative">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, 500))}
                rows={5}
                placeholder="Skriv kort hva du opplever — hjelper coach og fysio prioritere"
                className="w-full rounded-md border border-input bg-card px-4 py-2 text-sm outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
              <span className="absolute bottom-2 right-3 font-mono text-[10px] text-muted-foreground">
                {note.length} / 500
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setRequestFysio((v) => !v)}
            className={`flex w-full items-center gap-2 rounded-lg border p-4 text-left ${
              requestFysio
                ? "border-primary bg-primary/[0.04]"
                : "border-border bg-card"
            }`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-sm border ${
                requestFysio
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border"
              }`}
            >
              {requestFysio && <Check size={11} strokeWidth={2.5} />}
            </span>
            <div className="flex-1">
              <div className="font-display text-sm font-semibold">
                Be om time hos <em className="italic">fysio</em>
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                Vi sender forespørsel til medisinsk team — de kontakter deg innen
                24 t med ledige tider.
              </div>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
              ~24 t respons
            </span>
          </button>
        </section>
      )}

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Footer */}
      <footer className="sticky bottom-0 -mx-4 mt-4 flex items-center gap-2 border-t border-border bg-card/95 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6">
        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/40"
          >
            <ArrowLeft size={14} strokeWidth={1.75} /> Tilbake
          </button>
        )}
        <span className="font-mono text-[11px] text-muted-foreground">
          {side} {region?.label.toLowerCase()} · VAS{" "}
          <strong className="text-foreground">{vas} / 10</strong> ·{" "}
          {varighet.toLowerCase()} · {occurence.toLowerCase()}
        </span>
        <div className="ml-auto">
          <AthleticButton
            type="button"
            variant="lime"
            onClick={next}
            disabled={pending}
            className="shadow-lg shadow-accent/20"
          >
            {step < 3 ? "Neste" : pending ? "Lagrer…" : "Lagre symptom"}
            <ArrowRight size={14} strokeWidth={2.2} />
          </AthleticButton>
        </div>
      </footer>
    </>
  );
}
