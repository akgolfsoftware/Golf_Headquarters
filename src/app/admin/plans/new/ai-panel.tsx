"use client";

// AI-panel for plan-wizard. Lar coachen generere et plan-forslag via
// Anthropic Claude Sonnet 4.5, vise det, be om revisjon, og lagre det
// som ekte TrainingPlan via server-action.

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, RefreshCw, Check, Loader2, ChevronDown } from "lucide-react";
import type { PlanForslag } from "@/lib/ai-plan/schema";
import { opprettPlanFraAiForslag } from "./actions";

type Spiller = { id: string; name: string; hcp: number | null };

type GenererResultat = { forslag: PlanForslag; generationId: string };

function isoIDag(): string {
  return new Date().toISOString().slice(0, 10);
}

export function AiPlanPanel({ spillere }: { spillere: Spiller[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [spillerId, setSpillerId] = useState<string>("");
  const [sok, setSok] = useState("");
  const [prompt, setPrompt] = useState("");
  const [startDato, setStartDato] = useState(isoIDag());
  const [genererer, setGenererer] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);
  const [forslag, setForslag] = useState<PlanForslag | null>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [reviderer, setReviderer] = useState(false);
  const [lagrer, startLagring] = useTransition();

  const filtrerte = useMemo(() => {
    const s = sok.trim().toLowerCase();
    if (!s) return spillere;
    return spillere.filter((sp) => sp.name.toLowerCase().includes(s));
  }, [sok, spillere]);

  const valgtSpiller = useMemo(
    () => spillere.find((s) => s.id === spillerId) ?? null,
    [spillerId, spillere],
  );

  async function generer(iterationOf?: string, fb?: string) {
    setFeil(null);
    const settLoading = iterationOf ? setReviderer : setGenererer;
    settLoading(true);
    try {
      const res = await fetch("/api/ai-plan/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          userId: spillerId,
          brukerPrompt: prompt,
          iterationOf,
          feedback: fb,
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const data = (await res.json()) as GenererResultat;
      setForslag(data.forslag);
      setGenerationId(data.generationId);
      setFeedback("");
    } catch (err) {
      setFeil(err instanceof Error ? err.message : "Ukjent feil.");
    } finally {
      settLoading(false);
    }
  }

  function lagre(sendTilSpiller: boolean) {
    if (!forslag || !generationId || !spillerId) return;
    setFeil(null);
    startLagring(async () => {
      const res = await opprettPlanFraAiForslag({
        spillerId,
        startDato,
        generationId,
        forslag,
        sendTilSpiller,
      });
      if (res.ok) {
        router.push(`/admin/plans/${res.planId}`);
      } else {
        setFeil(res.feil);
      }
    });
  }

  const klarTilGenerering =
    spillerId.length > 0 && prompt.trim().length >= 5 && !genererer;

  return (
    <div className="rounded-2xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-6 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
            <Sparkles
              className="h-5 w-5 text-accent-foreground"
              strokeWidth={1.8}
            />
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              AI-coach
            </div>
            <h3 className="font-display text-lg leading-tight tracking-tight">
              Generer plan med{" "}
              <span className="font-display italic text-primary">AI</span>
            </h3>
          </div>
        </div>
        <ChevronDown
          className={`h-5 w-5 text-muted-foreground transition-transform ${
            open ? "rotate-180" : ""
          }`}
          strokeWidth={1.8}
        />
      </button>

      {open && (
        <div className="space-y-6 border-t border-border px-6 py-6">
          {!forslag ? (
            <>
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Spiller
                </label>
                <input
                  value={sok}
                  onChange={(e) => setSok(e.target.value)}
                  placeholder="Søk på navn…"
                  className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm"
                />
                <div className="grid max-h-48 grid-cols-1 gap-1.5 overflow-y-auto sm:grid-cols-2">
                  {filtrerte.slice(0, 24).map((sp) => {
                    const valgt = sp.id === spillerId;
                    return (
                      <button
                        key={sp.id}
                        type="button"
                        onClick={() => setSpillerId(sp.id)}
                        className={`flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm ${
                          valgt
                            ? "border-2 border-accent bg-accent/10"
                            : "border border-border hover:bg-secondary"
                        }`}
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                          {sp.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1 truncate">{sp.name}</div>
                        <div className="font-mono text-xs text-muted-foreground">
                          {sp.hcp ?? "–"}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Beskriv hva spilleren trenger
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={5}
                  placeholder="F.eks. 'Bygg en 6-ukers plan med fokus på putting under 3 meter og wedge-distansekontroll fra 50-100m. 4 økter per uke, 75 min hver. Spilleren har turnering i uke 6.'"
                  className="w-full rounded-md border border-input bg-background px-4 py-3 text-sm leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Startdato
                  </label>
                  <input
                    type="date"
                    value={startDato}
                    onChange={(e) => setStartDato(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm"
                  />
                </div>
              </div>

              {feil && (
                <div className="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {feil}
                </div>
              )}

              <button
                type="button"
                onClick={() => generer()}
                disabled={!klarTilGenerering}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {genererer ? (
                  <>
                    <Loader2
                      className="h-4 w-4 animate-spin"
                      strokeWidth={2}
                    />
                    Genererer…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" strokeWidth={2} />
                    Generer plan
                  </>
                )}
              </button>
            </>
          ) : (
            <ForslagVisning
              forslag={forslag}
              spillerNavn={valgtSpiller?.name ?? ""}
              feedback={feedback}
              setFeedback={setFeedback}
              reviderer={reviderer}
              lagrer={lagrer}
              feil={feil}
              onRevider={() => generer(generationId ?? undefined, feedback)}
              onLagreUtkast={() => lagre(false)}
              onSendSpiller={() => lagre(true)}
              onForkast={() => {
                setForslag(null);
                setGenerationId(null);
                setFeedback("");
                setFeil(null);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

function ForslagVisning({
  forslag,
  spillerNavn,
  feedback,
  setFeedback,
  reviderer,
  lagrer,
  feil,
  onRevider,
  onLagreUtkast,
  onSendSpiller,
  onForkast,
}: {
  forslag: PlanForslag;
  spillerNavn: string;
  feedback: string;
  setFeedback: (s: string) => void;
  reviderer: boolean;
  lagrer: boolean;
  feil: string | null;
  onRevider: () => void;
  onLagreUtkast: () => void;
  onSendSpiller: () => void;
  onForkast: () => void;
}) {
  // Grupper økter per uke
  const perUke = new Map<number, PlanForslag["okter"]>();
  for (const o of forslag.okter) {
    const liste = perUke.get(o.uke) ?? [];
    liste.push(o);
    perUke.set(o.uke, liste);
  }
  const uker = Array.from(perUke.keys()).sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-background p-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          AI-forslag for {spillerNavn}
        </div>
        <h4 className="mt-1 font-display text-2xl font-bold leading-tight tracking-tight">
          {forslag.navn}
        </h4>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {forslag.beskrivelse}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-accent px-3 py-1 font-mono text-xs font-semibold text-accent-foreground">
            {forslag.periodeUker} uker
          </span>
          <span className="rounded-full bg-secondary px-3 py-1 font-mono text-xs font-semibold text-secondary-foreground">
            {forslag.okter.length} økter
          </span>
          {forslag.fokusOmrader.map((f) => (
            <span
              key={f}
              className="rounded-full border border-border px-3 py-1 text-xs"
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {uker.map((u) => {
          const okter = perUke.get(u) ?? [];
          return (
            <div
              key={u}
              className="rounded-lg border border-border bg-card p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Uke {u}
                </div>
                <div className="font-mono text-xs text-muted-foreground tabular-nums">
                  {okter.length} økter
                </div>
              </div>
              <div className="space-y-2">
                {okter.map((o, idx) => (
                  <div
                    key={`${u}-${idx}`}
                    className="rounded-md border border-border bg-background p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-semibold uppercase tracking-wide text-primary">
                            {o.dag}
                          </span>
                          <span className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                            {o.type}
                          </span>
                          <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                            {o.varighetMin} min
                          </span>
                        </div>
                        <div className="mt-1 text-sm font-semibold">
                          {o.fokus}
                        </div>
                        {o.drills.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {o.drills.map((d, di) => (
                              <li
                                key={di}
                                className="text-xs text-muted-foreground"
                              >
                                · {d.navn}
                                {d.antallSet ? ` · ${d.antallSet} sett` : ""}
                                {d.antallRep ? ` · ${d.antallRep} rep` : ""}
                                {d.varighetMin ? ` · ${d.varighetMin} min` : ""}
                                {d.notat ? ` — ${d.notat}` : ""}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-3 rounded-lg border border-border bg-secondary/40 p-4">
        <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Be om revisjon (valgfritt)
        </label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={3}
          placeholder="F.eks. 'Bytt ut alle range-økter med kortere intensitet og legg til en lang putting-økt på fredager.'"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={onRevider}
          disabled={reviderer || feedback.trim().length < 5}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-xs font-medium transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-40"
        >
          {reviderer ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />
              Reviderer…
            </>
          ) : (
            <>
              <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} />
              Generer revidert forslag
            </>
          )}
        </button>
      </div>

      {feil && (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {feil}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <button
          type="button"
          onClick={onForkast}
          disabled={lagrer}
          className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-40"
        >
          Forkast og start på nytt
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onLagreUtkast}
            disabled={lagrer}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
          >
            {lagrer ? "Lagrer…" : "Lagre som utkast"}
          </button>
          <button
            type="button"
            onClick={onSendSpiller}
            disabled={lagrer}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Check className="h-4 w-4" strokeWidth={2} />
            {lagrer ? "Sender…" : "Send til spiller"}
          </button>
        </div>
      </div>
    </div>
  );
}
