"use client";

/**
 * NyOktWizard — "Bygg din økt" builder (two-state client component)
 *
 * State 1 — EMPTY: template grid + "Start blank" button
 * State 2 — BUILDING: summary strip + drill list + save CTAs
 *
 * Ported from PlayerHQ Ny Økt (hybrid).dc.html, route /portal/ny-okt.
 * No backend yet — client-side state only.
 */

import { useState } from "react";
import { ArrowLeft, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";
import Link from "next/link";

// ── Data ──────────────────────────────────────────────────────────────────────

interface Template {
  cat: string;
  name: string;
  meta: string;
  drills: Drill[];
}

export interface Drill {
  id: string;
  name: string;
  meta: string;
  cat: string;
}

export type NyOktPreloadedDrill = Drill;

const TEMPLATES: Template[] = [
  {
    cat: "ARG",
    name: "Wedge-fokus",
    meta: "3 drills · 45 min",
    drills: [
      { id: "arg-1", name: "50m pitch med landingssone", meta: "15 min", cat: "ARG" },
      { id: "arg-2", name: "Flop fra rough", meta: "15 min", cat: "ARG" },
      { id: "arg-3", name: "Kloss-bunkers", meta: "15 min", cat: "ARG" },
    ],
  },
  {
    cat: "OTT",
    name: "Driver-dag",
    meta: "2 drills · 30 min",
    drills: [
      { id: "ott-1", name: "Svingtempoøvelse", meta: "15 min", cat: "OTT" },
      { id: "ott-2", name: "Fairway-presisjon", meta: "15 min", cat: "OTT" },
    ],
  },
  {
    cat: "PUTT",
    name: "Putting-serie",
    meta: "2 drills · 40 min",
    drills: [
      { id: "putt-1", name: "Kortputt-gate (60 cm)", meta: "20 min", cat: "PUTT" },
      { id: "putt-2", name: "Lengdeputt 6–12 m", meta: "20 min", cat: "PUTT" },
    ],
  },
  {
    cat: "MIX",
    name: "Full økt",
    meta: "5 drills · 90 min",
    drills: [
      { id: "mix-1", name: "Oppvarming — korte slag", meta: "10 min", cat: "MIX" },
      { id: "mix-2", name: "Driver-presisjon", meta: "20 min", cat: "OTT" },
      { id: "mix-3", name: "Innspill 100–150 m", meta: "20 min", cat: "APP" },
      { id: "mix-4", name: "Chip og pitch rundt green", meta: "20 min", cat: "ARG" },
      { id: "mix-5", name: "Kortputt-serie", meta: "20 min", cat: "PUTT" },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function totalMinutes(drills: Drill[]): number {
  return drills.reduce((sum, d) => {
    const match = d.meta.match(/(\d+)\s*min/);
    return sum + (match ? parseInt(match[1], 10) : 0);
  }, 0);
}

function focusLabel(drills: Drill[]): string {
  const counts: Record<string, number> = {};
  for (const d of drills) {
    counts[d.cat] = (counts[d.cat] ?? 0) + 1;
  }
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return top ? top[0] : "—";
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface TemplateCardProps {
  template: Template;
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
  drill: Drill;
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

export function NyOktWizard({
  preloadedDrill = null,
}: {
  preloadedDrill?: NyOktPreloadedDrill | null;
}) {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [drills, setDrills] = useState<Drill[]>(() =>
    preloadedDrill ? [preloadedDrill] : [],
  );
  const [saved, setSaved] = useState(false);

  const isBuilding = drills.length > 0;

  function handleSelectTemplate(template: Template) {
    setSelectedTemplate(template);
    setDrills(template.drills);
    setSaved(false);
  }

  function handleStartBlank() {
    setSelectedTemplate(null);
    setDrills([{ id: "blank-1", name: "Ny drill", meta: "20 min", cat: "MIX" }]);
    setSaved(false);
  }

  function handleRemoveDrill(id: string) {
    setDrills((prev) => prev.filter((d) => d.id !== id));
  }

  function handleAddDrill() {
    const newId = `custom-${Date.now()}`;
    setDrills((prev) => [
      ...prev,
      { id: newId, name: "Ny drill", meta: "15 min", cat: "MIX" },
    ]);
  }

  function handleReset() {
    setSelectedTemplate(null);
    setDrills([]);
    setSaved(false);
  }

  function handleSaveAndStart() {
    setSaved(true);
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
            <AthleticEyebrow>Varighet</AthleticEyebrow>
            <span className="font-mono mt-1 text-2xl font-bold text-foreground">
              {mins}
              <span className="ml-0.5 text-sm font-normal text-muted-foreground">
                min
              </span>
            </span>
          </div>
          <div className="flex flex-col items-center py-4">
            <AthleticEyebrow>Drills</AthleticEyebrow>
            <span className="font-mono mt-1 text-2xl font-bold text-foreground">
              {drills.length}
            </span>
          </div>
          <div className="flex flex-col items-center py-4">
            <AthleticEyebrow>Fokus</AthleticEyebrow>
            <span className="font-mono mt-1 text-2xl font-bold text-foreground">
              {focus}
            </span>
          </div>
        </div>

        {/* Drill list */}
        <div>
          <AthleticEyebrow className="mb-2 block">Drills i økt</AthleticEyebrow>
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

        {/* Add drill */}
        <button
          type="button"
          onClick={handleAddDrill}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <Plus size={16} strokeWidth={2} aria-hidden />
          Legg til drill
        </button>

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
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleSaveAndStart}
              className="flex-1 rounded-full bg-accent py-3 text-sm font-bold uppercase tracking-wide text-accent-foreground transition-opacity hover:opacity-90"
            >
              Lagre og start økt
            </button>
            <button
              type="button"
              onClick={handleSaveAndStart}
              className="flex-1 rounded-full border border-border py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              Lagre som mal
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
      <div>
        <AthleticEyebrow className="mb-3 block">Maler</AthleticEyebrow>
        <div className="grid grid-cols-2 gap-3">
          {TEMPLATES.map((t) => (
            <TemplateCard
              key={t.name}
              template={t}
              selected={selectedTemplate?.name === t.name}
              onSelect={() => handleSelectTemplate(t)}
            />
          ))}
        </div>
      </div>

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
