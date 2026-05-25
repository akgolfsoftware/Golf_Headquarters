"use client";

import { useState, useTransition } from "react";
import { AlertCircle, Loader2 } from "lucide-react";

export type RefSpiller = {
  dgPlayerId: number;
  name: string;
  country: string | null;
  sgTotal: number;
  year: number;
};

type Modus = "FRA_SNITT" | "MANUELL_SG";

export function SgStartSkjema({
  referanseSpillere,
  action,
  feil,
}: {
  referanseSpillere: RefSpiller[];
  action: (formData: FormData) => Promise<void>;
  feil?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [refDgPlayerId, setRefDgPlayerId] = useState<number>(
    referanseSpillere[0]?.dgPlayerId ?? 0,
  );
  const [modus, setModus] = useState<Modus>("FRA_SNITT");
  const [snittScore, setSnittScore] = useState("78");
  const [antallRunder, setAntallRunder] = useState("20");
  const [sgOtt, setSgOtt] = useState("0");
  const [sgApp, setSgApp] = useState("0");
  const [sgArg, setSgArg] = useState("0");
  const [sgPutt, setSgPutt] = useState("0");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("refDgPlayerId", String(refDgPlayerId));
    fd.set("modus", modus);
    if (modus === "FRA_SNITT") {
      fd.set("snittScore", snittScore);
      fd.set("antallRunder", antallRunder);
    } else {
      fd.set("sgOtt", sgOtt);
      fd.set("sgApp", sgApp);
      fd.set("sgArg", sgArg);
      fd.set("sgPutt", sgPutt);
    }

    startTransition(async () => {
      await action(fd);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {feil && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive-foreground">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <span>{feil}</span>
        </div>
      )}

      {/* Steg 1 — Referansespiller */}
      <fieldset className="rounded-lg border border-border bg-card p-6">
        <legend className="px-2 font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
          Steg 1
        </legend>
        <h2 className="font-display text-xl font-semibold tracking-tight">
          Velg referansespiller
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Topp 100 på PGA Tour etter SG Total
        </p>
        <select
          value={refDgPlayerId}
          onChange={(e) => setRefDgPlayerId(Number(e.target.value))}
          className="mt-4 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {referanseSpillere.map((s) => (
            <option key={s.dgPlayerId} value={s.dgPlayerId}>
              {s.name} {s.country ? `(${s.country})` : ""} · SG{" "}
              {s.sgTotal >= 0 ? "+" : ""}
              {s.sgTotal.toFixed(2)}
            </option>
          ))}
        </select>
      </fieldset>

      {/* Steg 2 — Modus + tall */}
      <fieldset className="rounded-lg border border-border bg-card p-6">
        <legend className="px-2 font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
          Steg 2
        </legend>
        <h2 className="font-display text-xl font-semibold tracking-tight">
          Legg inn dine tall
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Velg om du vil oppgi snittscore (vi estimerer SG) eller dine egne
          SG-tall direkte.
        </p>

        <div className="mt-4 inline-flex rounded-md border border-border bg-secondary p-1">
          <button
            type="button"
            onClick={() => setModus("FRA_SNITT")}
            className={`rounded-sm px-3 py-1.5 text-xs font-medium transition-colors ${
              modus === "FRA_SNITT"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Bruk snittscore
          </button>
          <button
            type="button"
            onClick={() => setModus("MANUELL_SG")}
            className={`rounded-sm px-3 py-1.5 text-xs font-medium transition-colors ${
              modus === "MANUELL_SG"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Jeg har egne SG-tall
          </button>
        </div>

        {modus === "FRA_SNITT" ? (
          <div className="mt-6 grid grid-cols-2 gap-4">
            <Field label="Snittscore (brutto)" htmlFor="snittScore" required>
              <input
                id="snittScore"
                type="number"
                step="0.1"
                min="60"
                max="140"
                value={snittScore}
                onChange={(e) => setSnittScore(e.target.value)}
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </Field>
            <Field label="Antall runder" htmlFor="antallRunder">
              <input
                id="antallRunder"
                type="number"
                min="1"
                max="500"
                value={antallRunder}
                onChange={(e) => setAntallRunder(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </Field>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <Field label="SG: OTT" htmlFor="sgOtt">
              <input
                id="sgOtt"
                type="number"
                step="0.01"
                min="-10"
                max="10"
                value={sgOtt}
                onChange={(e) => setSgOtt(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm tabular-nums shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </Field>
            <Field label="SG: APP" htmlFor="sgApp">
              <input
                id="sgApp"
                type="number"
                step="0.01"
                min="-10"
                max="10"
                value={sgApp}
                onChange={(e) => setSgApp(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm tabular-nums shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </Field>
            <Field label="SG: ARG" htmlFor="sgArg">
              <input
                id="sgArg"
                type="number"
                step="0.01"
                min="-10"
                max="10"
                value={sgArg}
                onChange={(e) => setSgArg(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm tabular-nums shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </Field>
            <Field label="SG: PUTT" htmlFor="sgPutt">
              <input
                id="sgPutt"
                type="number"
                step="0.01"
                min="-10"
                max="10"
                value={sgPutt}
                onChange={(e) => setSgPutt(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm tabular-nums shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </Field>
          </div>
        )}
      </fieldset>

      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Beregner ...
            </>
          ) : (
            "Se min sammenligning"
          )}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="space-y-1.5">
      <span className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </span>
      {children}
    </label>
  );
}
