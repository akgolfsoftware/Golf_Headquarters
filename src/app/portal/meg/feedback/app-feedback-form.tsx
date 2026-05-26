"use client";

import { useState, useTransition } from "react";
import { Bug, Lightbulb, Heart, HelpCircle, EyeOff, MapPin, Send } from "lucide-react";
import { submitFeedback } from "./actions";

type Type = "bug" | "forslag" | "ros" | "sporsmal";

const SEGMENT_LABEL: Record<"detractor" | "passive" | "promoter", string> = {
  detractor: "Kritiker",
  passive: "Passiv",
  promoter: "Ambassadør",
};

function segOf(v: number): "detractor" | "passive" | "promoter" {
  if (v <= 6) return "detractor";
  if (v <= 8) return "passive";
  return "promoter";
}

function labelOf(v: number): string {
  if (v <= 6) return "Hva burde vi forbedre?";
  if (v <= 8) return "Hva mangler for å gi 10?";
  return "Hva liker du best?";
}

export function AppFeedbackForm() {
  const [nps, setNps] = useState<number>(9);
  const [type, setType] = useState<Type>("forslag");
  const [tekst, setTekst] = useState(
    "Hadde vært kult å kunne dele PR-en min direkte til Instagram-story med stats påklistret — gjerne med pyramide-figuren og siste rundes scorecard som et lite kort over.",
  );
  const [anonym, setAnonym] = useState(false);
  const [pending, startTransition] = useTransition();

  function send() {
    startTransition(async () => {
      await submitFeedback({ nps, type, tekst, anonym });
    });
  }

  const seg = segOf(nps);

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
    >
      {/* NPS */}
      <section className="overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <h3 className="font-display text-sm font-semibold text-foreground">
            Hvor sannsynlig er det at du anbefaler PlayerHQ til en venn?
          </h3>
          <span className="rounded-full bg-destructive/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-destructive">
            Påkrevd
          </span>
        </div>

        <div className="grid grid-cols-11 gap-1.5">
          {Array.from({ length: 11 }, (_, i) => i).map((v) => {
            const inSeg = segOf(v) === seg;
            const selected = v === nps;
            return (
              <button
                key={v}
                type="button"
                onClick={() => setNps(v)}
                aria-label={`${v} av 10`}
                className={`grid h-10 place-items-center rounded-md border font-mono text-sm tabular-nums transition-colors ${
                  selected
                    ? seg === "promoter"
                      ? "border-primary bg-primary text-primary-foreground"
                      : seg === "passive"
                        ? "border-[color:rgb(217_119_6)] bg-[color:rgb(217_119_6)] text-white"
                        : "border-destructive bg-destructive text-destructive-foreground"
                    : inSeg
                      ? "border-primary/30 bg-primary/5 text-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40"
                }`}
              >
                {v}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex items-center justify-between font-mono text-[10.5px] uppercase tracking-[0.06em] text-muted-foreground">
          <span>Ikke i det hele tatt</span>
          <span className="text-foreground">
            Valgt: <strong>{nps}</strong>{" "}
            <span
              className={`ml-1 rounded-full px-2 py-0.5 ${
                seg === "promoter"
                  ? "bg-primary/15 text-primary"
                  : seg === "passive"
                    ? "bg-[color:rgb(217_119_6)]/15 text-[color:rgb(217_119_6)]"
                    : "bg-destructive/15 text-destructive"
              }`}
            >
              {SEGMENT_LABEL[seg]}
            </span>
          </span>
          <span>Helt sikkert</span>
        </div>
      </section>

      {/* Type chips */}
      <section className="overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h3 className="font-display text-sm font-semibold text-foreground">
            Type tilbakemelding
          </h3>
          <span className="rounded-full bg-destructive/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-destructive">
            Påkrevd
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {([
            { id: "bug", navn: "Bug", Icon: Bug },
            { id: "forslag", navn: "Forslag", Icon: Lightbulb },
            { id: "ros", navn: "Ros", Icon: Heart },
            { id: "sporsmal", navn: "Spørsmål", Icon: HelpCircle },
          ] as { id: Type; navn: string; Icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }[]).map(
            (c) => {
              const valgt = type === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setType(c.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    valgt
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:border-primary/40"
                  }`}
                >
                  <c.Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                  {c.navn}
                </button>
              );
            },
          )}
        </div>
      </section>

      {/* Dynamic textarea */}
      <section className="overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-3 flex items-baseline justify-between">
          <h3 className="font-display text-sm font-semibold text-foreground">
            {labelOf(nps)}
          </h3>
          <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
            Valgfritt
          </span>
        </div>
        <textarea
          rows={5}
          maxLength={500}
          value={tekst}
          onChange={(e) => setTekst(e.target.value)}
          placeholder="Skriv her — så detaljert eller kort du vil."
          className="w-full rounded-md border border-input bg-card px-4 py-3 text-sm text-foreground outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
        <div className="mt-2 flex items-center justify-between text-[10.5px]">
          <span className="text-muted-foreground/80">
            Hjelper teamet å forstå hva som funker
          </span>
          <span className="font-mono tabular-nums text-muted-foreground">
            {tekst.length} / 500
          </span>
        </div>
      </section>

      {/* Anonym */}
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
        <input
          type="checkbox"
          checked={anonym}
          onChange={(e) => setAnonym(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-border accent-primary"
        />
        <div>
          <div className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
            <EyeOff className="h-3.5 w-3.5" strokeWidth={1.75} />
            Send anonymt
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            Vi kobler ikke svaret til kontoen din. Da kan vi heller ikke følge opp direkte.
          </div>
        </div>
      </label>

      {/* Footer */}
      <div className="flex items-center gap-3 border-t border-border pt-4">
        <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] text-muted-foreground">
          <MapPin className="h-3 w-3" strokeWidth={1.75} />
          Fra <span className="text-foreground">/portal/statistikk</span> · v0.9.4
        </span>
        <button
          type="submit"
          disabled={pending}
          className="ml-auto inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5" strokeWidth={1.75} />
          {pending ? "Sender …" : "Send"}
        </button>
      </div>
    </form>
  );
}
