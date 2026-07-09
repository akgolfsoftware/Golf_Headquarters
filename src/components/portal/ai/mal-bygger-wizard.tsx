"use client";

/**
 * PlayerHQ · AI mål-bygger — 3-stegs SMART-wizard (mobile-first, 430px).
 *
 * Steg 1: ambisjon (kategori-fokus + tidshorisont).
 * Steg 2: velg + tilpass SMART-mål. Spilleren fyller egne verdier — vi dikter
 *         ALDRI opp tall. Forslagene er strukturerte rammer, ikke fasit.
 * Steg 3: bekreft + lagre (lagreMalForslag → Goal-rader).
 *
 * DS-tokens hele veien, kun lucide, norsk bokmål.
 */

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { lagreMalForslag, type MalForslagInput } from "@/app/portal/(legacy)/ai/mal-bygger/actions";

type Horizon = "SESONG" | "KVARTAL" | "MANED";
type Focus = "RESULTAT" | "PROSESS" | "BALANSERT";

const HORIZONS: { key: Horizon; label: string; sub: string }[] = [
  { key: "MANED", label: "Denne måneden", sub: "Kort, konkret fokus" },
  { key: "KVARTAL", label: "Dette kvartalet", sub: "3 måneders blokk" },
  { key: "SESONG", label: "Hele sesongen", sub: "Langsiktig retning" },
];

const FOCUS: { key: Focus; label: string; sub: string }[] = [
  { key: "RESULTAT", label: "Resultatmål", sub: "Hva du vil oppnå (HCP, plassering)" },
  { key: "PROSESS", label: "Prosessmål", sub: "Hva du gjør (trening, repetisjoner)" },
  { key: "BALANSERT", label: "Begge deler", sub: "En miks av resultat og prosess" },
];

type Template = {
  id: string;
  type: string;
  category: "OUTCOME" | "PROCESS";
  categoryLabel: string;
  /** Mal-tittel med {…}-plassholdere spilleren fyller. */
  title: string;
  fields: { key: string; label: string; placeholder: string }[];
  hint: string;
};

const TEMPLATES: Template[] = [
  {
    id: "hcp",
    type: "HCP_TARGET",
    category: "OUTCOME",
    categoryLabel: "Resultat",
    title: "Senke handicapet til {mål} innen sesongslutt",
    fields: [{ key: "mål", label: "Mål-HCP", placeholder: "f.eks. 4,5" }],
    hint: "Et tydelig resultatmål gir retning til all treningen.",
  },
  {
    id: "rounds",
    type: "ROUNDS_PER_MONTH",
    category: "PROCESS",
    categoryLabel: "Prosess",
    title: "Spille {antall} tellende runder hver måned",
    fields: [{ key: "antall", label: "Runder / mnd", placeholder: "f.eks. 6" }],
    hint: "Volum på banen er det som flytter handicapet over tid.",
  },
  {
    id: "putt",
    type: "FREE_TEXT",
    category: "PROCESS",
    categoryLabel: "Prosess",
    title: "Trene {antall} putter i uka på 1–3 meter",
    fields: [{ key: "antall", label: "Putter / uke", placeholder: "f.eks. 90" }],
    hint: "Korte putter er den raskeste veien til lavere score.",
  },
  {
    id: "test",
    type: "FREE_TEXT",
    category: "PROCESS",
    categoryLabel: "Prosess",
    title: "Ta {antall} ferdighetstester i {område} dette kvartalet",
    fields: [
      { key: "antall", label: "Antall tester", placeholder: "f.eks. 4" },
      { key: "område", label: "Område", placeholder: "f.eks. nærspill" },
    ],
    hint: "Tester gir deg en baseline og viser om treningen virker.",
  },
];

type SelectedGoal = {
  template: Template;
  values: Record<string, string>;
  targetDate: string;
};

function fillTitle(template: Template, values: Record<string, string>): string {
  return template.title.replace(/\{(\w+)\}/g, (_m, key: string) => {
    const v = values[key]?.trim();
    return v && v.length > 0 ? v : `[${key}]`;
  });
}

function isComplete(g: SelectedGoal): boolean {
  return g.template.fields.every((f) => (g.values[f.key]?.trim().length ?? 0) > 0);
}

function StepDot({
  n,
  label,
  state,
}: {
  n: number;
  label: string;
  state: "done" | "active" | "todo";
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1">
      <span
        className={cn(
          "inline-flex h-7 w-7 items-center justify-center rounded-full font-mono text-[11px] font-bold",
          state === "done" && "bg-primary text-accent",
          state === "active" && "bg-accent text-primary",
          state === "todo" && "bg-secondary text-muted-foreground",
        )}
      >
        {state === "done" ? <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden /> : n}
      </span>
      <span
        className={cn(
          "font-mono text-[8px] font-extrabold uppercase tracking-[0.10em]",
          state === "todo" ? "text-muted-foreground" : "text-foreground",
        )}
      >
        {label}
      </span>
    </div>
  );
}

export function MalByggerWizard({
  playerFirstName,
  defaultYearEnd,
}: {
  playerFirstName: string;
  defaultYearEnd: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [focus, setFocus] = useState<Focus | null>(null);
  const [horizon, setHorizon] = useState<Horizon | null>(null);
  const [selected, setSelected] = useState<Record<string, SelectedGoal>>({});
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const visibleTemplates = useMemo(() => {
    if (focus === "RESULTAT") return TEMPLATES.filter((t) => t.category === "OUTCOME");
    if (focus === "PROSESS") return TEMPLATES.filter((t) => t.category === "PROCESS");
    return TEMPLATES;
  }, [focus]);

  const chosen = Object.values(selected);
  const readyCount = chosen.filter(isComplete).length;

  function toggle(template: Template) {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[template.id]) {
        delete next[template.id];
      } else {
        next[template.id] = {
          template,
          values: {},
          targetDate: defaultYearEnd,
        };
      }
      return next;
    });
  }

  function setValue(id: string, key: string, value: string) {
    setSelected((prev) => ({
      ...prev,
      [id]: { ...prev[id], values: { ...prev[id].values, [key]: value } },
    }));
  }

  function setDate(id: string, value: string) {
    setSelected((prev) => ({ ...prev, [id]: { ...prev[id], targetDate: value } }));
  }

  function save() {
    setError(null);
    const payload: MalForslagInput[] = chosen.filter(isComplete).map((g) => {
      const numericField = g.template.fields.find((f) => /^\d/.test(g.values[f.key]?.trim() ?? ""));
      const rawNum = numericField
        ? Number(g.values[numericField.key].replace(",", "."))
        : NaN;
      return {
        type: g.template.type,
        category: g.template.category === "OUTCOME" ? "OUTCOME" : "PROCESS",
        title: fillTitle(g.template, g.values),
        targetValue: Number.isFinite(rawNum) ? rawNum : null,
        targetDate: g.targetDate || null,
      };
    });
    if (payload.length === 0) {
      setError("Fyll inn verdiene i minst ett mål før du lagrer.");
      return;
    }
    startTransition(async () => {
      try {
        await lagreMalForslag(payload);
        router.push("/portal/mal");
      } catch {
        setError("Kunne ikke lagre målene. Prøv igjen.");
      }
    });
  }

  return (
    <div className="mx-auto max-w-[430px] space-y-5 px-4 pb-24 md:pb-8">
      <header>
        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
          <Sparkles className="h-3 w-3 text-primary" strokeWidth={2} aria-hidden />
          PlayerHQ · AI · Mål-bygger
        </span>
        <h1 className="mt-1.5 font-display text-2xl font-bold leading-tight tracking-tight">
          La oss sette{" "}
          <em
            className="font-normal not-italic"
            style={{
              fontFamily: "var(--font-familjen-grotesk), sans-serif",
              fontStyle: "italic",
              color: "hsl(var(--primary))",
            }}
          >
            målene dine
          </em>
          , {playerFirstName}
        </h1>
      </header>

      {/* Stepper */}
      <div className="flex items-start gap-1 rounded-xl border border-border bg-card px-3 py-3">
        <StepDot n={1} label="Ambisjon" state={step > 1 ? "done" : step === 1 ? "active" : "todo"} />
        <span className="mt-3 h-px flex-1 bg-border" aria-hidden />
        <StepDot n={2} label="Velg mål" state={step > 2 ? "done" : step === 2 ? "active" : "todo"} />
        <span className="mt-3 h-px flex-1 bg-border" aria-hidden />
        <StepDot n={3} label="Lagre" state={step === 3 ? "active" : "todo"} />
      </div>

      {/* STEG 1 */}
      {step === 1 && (
        <div className="space-y-5">
          <section>
            <h2 className="mb-2 font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-foreground">
              Hva vil du fokusere på?
            </h2>
            <div className="flex flex-col gap-2">
              {FOCUS.map((f) => (
                <OptionCard
                  key={f.key}
                  label={f.label}
                  sub={f.sub}
                  selected={focus === f.key}
                  onClick={() => setFocus(f.key)}
                />
              ))}
            </div>
          </section>
          <section>
            <h2 className="mb-2 font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-foreground">
              Hvilken tidshorisont?
            </h2>
            <div className="flex flex-col gap-2">
              {HORIZONS.map((h) => (
                <OptionCard
                  key={h.key}
                  label={h.label}
                  sub={h.sub}
                  selected={horizon === h.key}
                  onClick={() => setHorizon(h.key)}
                />
              ))}
            </div>
          </section>
          <button
            type="button"
            disabled={!focus || !horizon}
            onClick={() => setStep(2)}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary py-3.5 font-mono text-[11px] font-extrabold uppercase tracking-[0.10em] text-accent transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            Foreslå SMART-mål
            <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
          </button>
        </div>
      )}

      {/* STEG 2 */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-3">
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            </span>
            <p className="font-mono text-[10px] leading-snug tracking-[0.02em] text-muted-foreground">
              Velg de målene som passer, og fyll inn{" "}
              <span className="font-bold text-foreground">dine egne tall</span>. Vi dikter ingenting opp for deg.
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            {visibleTemplates.map((t) => {
              const sel = selected[t.id];
              const open = !!sel;
              return (
                <div
                  key={t.id}
                  className={cn(
                    "rounded-xl border bg-card p-3.5 transition-colors",
                    open ? "border-primary ring-2 ring-primary/15" : "border-border",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggle(t)}
                    className="flex w-full items-start gap-3 text-left"
                    aria-pressed={open}
                  >
                    <span
                      className={cn(
                        "mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-[1.5px]",
                        open ? "border-primary bg-primary text-accent" : "border-input bg-card text-transparent",
                      )}
                    >
                      {open && <Check className="h-3 w-3" strokeWidth={3} aria-hidden />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "inline-block rounded-full px-1.5 py-0.5 font-mono text-[8px] font-extrabold uppercase tracking-[0.10em]",
                          t.category === "OUTCOME"
                            ? "bg-[var(--color-pyr-spill-track)] text-primary"
                            : "bg-secondary text-muted-foreground",
                        )}
                      >
                        {t.categoryLabel}
                      </span>
                      <span className="mt-1 block text-[14px] font-bold leading-snug tracking-[-0.01em] text-foreground">
                        {open ? fillTitle(t, sel.values) : t.title.replace(/\{(\w+)\}/g, "…")}
                      </span>
                      <span className="mt-1 block text-[11px] leading-snug text-muted-foreground">
                        {t.hint}
                      </span>
                    </span>
                  </button>

                  {open && (
                    <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-3">
                      {t.fields.map((f) => (
                        <label key={f.key} className="flex flex-col gap-1">
                          <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
                            {f.label}
                          </span>
                          <input
                            value={sel.values[f.key] ?? ""}
                            onChange={(e) => setValue(t.id, f.key, e.target.value)}
                            placeholder={f.placeholder}
                            className="h-10 rounded-lg border border-input bg-card px-3 text-[13px] text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                          />
                        </label>
                      ))}
                      <label className="col-span-2 flex flex-col gap-1">
                        <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
                          Frist
                        </span>
                        <input
                          type="date"
                          value={sel.targetDate}
                          onChange={(e) => setDate(t.id, e.target.value)}
                          className="h-10 rounded-lg border border-input bg-card px-3 text-[13px] text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      </label>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-4 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-foreground transition-colors hover:bg-secondary"
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
              Tilbake
            </button>
            <button
              type="button"
              disabled={readyCount === 0}
              onClick={() => setStep(3)}
              className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-accent transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              Se gjennom ({readyCount})
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
            </button>
          </div>
        </div>
      )}

      {/* STEG 3 */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-foreground">
            Klar til å lagre
          </h2>
          <div className="flex flex-col gap-2.5">
            {chosen.filter(isComplete).map((g) => (
              <div key={g.template.id} className="rounded-xl border border-border bg-card p-3.5">
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                    <Target className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "inline-block rounded-full px-1.5 py-0.5 font-mono text-[8px] font-extrabold uppercase tracking-[0.10em]",
                        g.template.category === "OUTCOME"
                          ? "bg-[var(--color-pyr-spill-track)] text-primary"
                          : "bg-secondary text-muted-foreground",
                      )}
                    >
                      {g.template.categoryLabel}
                    </span>
                    <p className="mt-1 text-[14px] font-bold leading-snug tracking-[-0.01em] text-foreground">
                      {fillTitle(g.template, g.values)}
                    </p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
                      Frist{" "}
                      {g.targetDate
                        ? new Date(g.targetDate).toLocaleDateString("nb-NO", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "ingen"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-[12px] text-destructive"
            >
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={pending}
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-4 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
              Tilbake
            </button>
            <button
              type="button"
              onClick={save}
              disabled={pending}
              className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-accent px-4 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {pending ? "Lagrer …" : "Lagre målene"}
              <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function OptionCard({
  label,
  sub,
  selected,
  onClick,
}: {
  label: string;
  sub: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex items-start gap-3 rounded-xl border bg-card px-3.5 py-3 text-left transition-colors",
        selected ? "border-primary ring-2 ring-primary/15" : "border-border hover:border-primary/40",
      )}
    >
      <span
        className={cn(
          "mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border-2",
          selected ? "border-primary" : "border-border",
        )}
      >
        {selected && <span className="h-2 w-2 rounded-full bg-primary" />}
      </span>
      <span>
        <span className="block text-[14px] font-bold leading-tight tracking-[-0.01em] text-foreground">
          {label}
        </span>
        <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">{sub}</span>
      </span>
    </button>
  );
}
