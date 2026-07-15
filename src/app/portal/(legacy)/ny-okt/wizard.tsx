"use client";

/**
 * NyOktWizard — "Bygg din økt" builder (two-state client component)
 *
 * State 1 — EMPTY: template grid + "Start blank" button
 * State 2 — BUILDING: summary strip + drill list + save CTAs
 *
 * Ported from PlayerHQ Ny Økt (hybrid).dc.html, route /portal/ny-okt.
 * Maler og drills er ekte ExerciseDefinition-rader (levert av page.tsx) —
 * "Lagre og start økt" kaller createAdHocSession og lagrer en ekte
 * TrainingPlanSession.
 */

import { useState, useTransition } from "react";
import { ArrowLeft, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { createAdHocSession } from "./actions";

// ── Data ──────────────────────────────────────────────────────────────────────

export interface WizardTemplate {
  cat: string;
  name: string;
  meta: string;
  drills: WizardDrill[];
}

export interface WizardDrill {
  id: string;
  name: string;
  meta: string;
  cat: string;
  durationMin: number;
}

interface NyOktWizardProps {
  templates: WizardTemplate[];
  alleOvelser: WizardDrill[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function totalMinutes(drills: WizardDrill[]): number {
  return drills.reduce((sum, d) => sum + d.durationMin, 0);
}

function focusLabel(drills: WizardDrill[]): string {
  const counts: Record<string, number> = {};
  for (const d of drills) {
    counts[d.cat] = (counts[d.cat] ?? 0) + 1;
  }
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return top ? top[0] : "—";
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface TemplateCardProps {
  template: WizardTemplate;
  selected: boolean;
  onSelect: () => void;
}

function TemplateCard({ template, selected, onSelect }: TemplateCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group w-full rounded-xl border bg-card p-4 text-left transition-all",
        "hover:-translate-y-0.5 hover:border-primary hover:shadow-sm",
        selected
          ? "border-2 border-accent bg-accent/[0.06]"
          : "border-border",
      )}
    >
      <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-primary">
        {template.cat}
      </span>
      <p className="mt-1 text-[13px] font-semibold text-foreground">
        {template.name}
      </p>
      <p className="font-mono mt-1 text-[10px] text-muted-foreground">
        {template.meta}
      </p>
    </button>
  );
}

interface DrillRowProps {
  drill: WizardDrill;
  onRemove: () => void;
}

function DrillRow({ drill, onRemove }: DrillRowProps) {
  return (
    <div className="flex items-center gap-3 py-3">
      <span
        className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary"
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {drill.name}
        </p>
        <p className="font-mono text-[10px] text-muted-foreground">
          {drill.meta}
        </p>
      </div>
      <span className="flex-shrink-0 rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-primary">
        {drill.cat}
      </span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Fjern ${drill.name}`}
        className="flex-shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-border hover:text-foreground"
      >
        <X size={14} strokeWidth={2} aria-hidden />
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

const FEIL_TEKST: Record<string, string> = {
  "upgrade-required": "Egendefinerte økter krever Pro. Oppgrader for å lagre.",
  "no-drills": "Legg til minst én drill før du lagrer.",
};

export function NyOktWizard({ templates, alleOvelser }: NyOktWizardProps) {
  const [started, setStarted] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WizardTemplate | null>(null);
  const [drills, setDrills] = useState<WizardDrill[]>([]);
  const [saved, setSaved] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const isBuilding = started;
  const tilgjengeligeOvelser = alleOvelser.filter(
    (o) => !drills.some((d) => d.id === o.id),
  );

  function handleSelectTemplate(template: WizardTemplate) {
    setSelectedTemplate(template);
    setDrills(template.drills);
    setStarted(true);
    setSaved(false);
    setFeil(null);
  }

  function handleStartBlank() {
    setSelectedTemplate(null);
    setDrills([]);
    setStarted(true);
    setSaved(false);
    setFeil(null);
  }

  function handleRemoveDrill(id: string) {
    setDrills((prev) => prev.filter((d) => d.id !== id));
  }

  function handleAddDrill(exerciseId: string) {
    const ovelse = alleOvelser.find((o) => o.id === exerciseId);
    if (!ovelse) return;
    setDrills((prev) => [...prev, ovelse]);
  }

  function handleReset() {
    setSelectedTemplate(null);
    setDrills([]);
    setStarted(false);
    setSaved(false);
    setFeil(null);
  }

  function handleSaveAndStart() {
    setFeil(null);
    startTransition(async () => {
      try {
        await createAdHocSession({
          title: selectedTemplate ? selectedTemplate.name : "Egen økt",
          pyramidArea: "SLAG",
          scheduledAt: new Date().toISOString(),
          durationMin: totalMinutes(drills),
          exerciseIds: drills.map((d) => d.id),
        });
        setSaved(true);
      } catch (e) {
        const melding = e instanceof Error ? e.message : "ukjent";
        setFeil(FEIL_TEKST[melding] ?? "Kunne ikke lagre økten. Prøv igjen.");
      }
    });
  }

  const mins = totalMinutes(drills);
  const focus = focusLabel(drills);

  // ── BUILDING state ─────────────────────────────────────────────────────────
  if (isBuilding) {
    return (
      <div className="space-y-6">
        {/* Back */}
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} strokeWidth={2} aria-hidden />
          Tilbake
        </button>

        {/* Tier pill + heading */}
        <div>
          <span className="inline-block rounded-full bg-accent px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-accent-foreground">
            PRO
          </span>
          <h1 className="font-display mt-2 text-2xl font-semibold text-foreground">
            Bygg din{" "}
            <em className="font-normal italic text-primary">økt</em>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {selectedTemplate ? selectedTemplate.name : "Blank økt"} — tilpass
            etter behov.
          </p>
        </div>

        {/* Summary strip */}
        <div className="grid grid-cols-3 divide-x divide-border rounded-xl border border-border bg-card">
          <div className="flex flex-col items-center py-4">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">Varighet</span>
            <span className="font-mono mt-1 text-2xl font-bold text-foreground">
              {mins}
              <span className="ml-0.5 text-sm font-normal text-muted-foreground">
                min
              </span>
            </span>
          </div>
          <div className="flex flex-col items-center py-4">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">Drills</span>
            <span className="font-mono mt-1 text-2xl font-bold text-foreground">
              {drills.length}
            </span>
          </div>
          <div className="flex flex-col items-center py-4">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">Fokus</span>
            <span className="font-mono mt-1 text-2xl font-bold text-foreground">
              {focus}
            </span>
          </div>
        </div>

        {/* Drill list */}
        <div>
          <span className="mb-2 block font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">Drills i økt</span>
          <div className="divide-y divide-border rounded-xl border border-border bg-card px-4">
            {drills.map((drill) => (
              <DrillRow
                key={drill.id}
                drill={drill}
                onRemove={() => handleRemoveDrill(drill.id)}
              />
            ))}
          </div>
        </div>

        {/* Add drill — ekte øvelser, ikke lenger tilgjengelig når alt er lagt til */}
        {tilgjengeligeOvelser.length > 0 && (
          <label className="flex w-full items-center gap-2 rounded-xl border border-dashed border-border py-3 px-3 text-sm font-medium text-muted-foreground transition-colors focus-within:border-primary">
            <Plus size={16} strokeWidth={2} aria-hidden />
            <select
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) handleAddDrill(e.target.value);
                e.target.value = "";
              }}
              className="w-full bg-transparent text-sm outline-none"
            >
              <option value="" disabled>
                Legg til drill …
              </option>
              {tilgjengeligeOvelser.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.cat} · {o.name} ({o.meta})
                </option>
              ))}
            </select>
          </label>
        )}

        {/* CTAs */}
        {saved ? (
          <div className="rounded-xl border border-success/30 bg-success/10 p-4 text-center text-sm font-medium text-success">
            Økt lagret! Du kan starte den fra{" "}
            <Link href="/portal/gjennomfore" className="underline underline-offset-2">
              Gjennomfør
            </Link>
            .
          </div>
        ) : (
          <div className="space-y-2">
            {feil && (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
                {feil}
              </p>
            )}
            <button
              type="button"
              onClick={handleSaveAndStart}
              disabled={pending}
              className="w-full rounded-full bg-accent py-3 text-sm font-bold uppercase tracking-wide text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {pending ? "Lagrer …" : "Lagre og start økt"}
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── EMPTY state (template selection) ──────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href="/portal/gjennomfore"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft size={16} strokeWidth={2} aria-hidden />
        Tilbake
      </Link>

      {/* Tier pill + heading */}
      <div>
        <span className="inline-block rounded-full bg-accent px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-accent-foreground">
          PRO
        </span>
        <h1 className="font-display mt-2 text-2xl font-semibold text-foreground">
          Bygg din{" "}
          <em className="font-normal italic text-primary">økt</em>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Velg en mal eller start blank.
        </p>
      </div>

      {/* Template grid */}
      {templates.length > 0 && (
        <div>
          <span className="mb-3 block font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">Maler</span>
          <div className="grid grid-cols-2 gap-3">
            {templates.map((t) => (
              <TemplateCard
                key={t.name}
                template={t}
                selected={selectedTemplate?.name === t.name}
                onSelect={() => handleSelectTemplate(t)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Start blank */}
      <button
        type="button"
        onClick={handleStartBlank}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
      >
        <Plus size={16} strokeWidth={2} aria-hidden />
        Start blank økt
      </button>
    </div>
  );
}
