/**
 * PILOT — TemplateSelector modal
 * URL: /template-selector-demo
 * Bygd fra wireframe/design-files-v2/modaler-A/09-template-selector.html
 */

import Link from "next/link";
import { ChevronDown, Search, X } from "lucide-react";

type DonutSlice = { color: string; value: number };
type Template = {
  id: string;
  title: string;
  sub: string;
  tags: string[];
  stripe: { width: number; color: string }[];
  donut: DonutSlice[];
  selected?: boolean;
};

const TEMPLATES: Template[] = [
  {
    id: "putting-foundation",
    title: "Putting Foundation",
    sub: "8 uker · 24 økter · 16 t total",
    tags: ["PUTTE", "8U", "BEGYNNER"],
    stripe: [
      { width: 10, color: "#16A34A" },
      { width: 60, color: "#005840" },
      { width: 20, color: "#D1F843" },
      { width: 10, color: "#F4C430" },
    ],
    donut: [
      { color: "#005840", value: 60 },
      { color: "#D1F843", value: 20 },
      { color: "#16A34A", value: 10 },
      { color: "#F4C430", value: 10 },
    ],
  },
  {
    id: "driver-toppform",
    title: "Driver Toppform",
    sub: "6 uker · 22 økter · 18 t total",
    tags: ["DRIVER", "6U", "AVANSERT"],
    selected: true,
    stripe: [
      { width: 15, color: "#16A34A" },
      { width: 25, color: "#005840" },
      { width: 45, color: "#D1F843" },
      { width: 10, color: "#F4C430" },
      { width: 5, color: "#5E5C57" },
    ],
    donut: [
      { color: "#D1F843", value: 45 },
      { color: "#005840", value: 25 },
      { color: "#16A34A", value: 15 },
      { color: "#F4C430", value: 10 },
      { color: "#5E5C57", value: 5 },
    ],
  },
  {
    id: "mental-game-4u",
    title: "Mental Game 4u",
    sub: "4 uker · 12 økter · 8 t total",
    tags: ["MENTAL", "4U", "MIDDELS"],
    stripe: [
      { width: 5, color: "#16A34A" },
      { width: 15, color: "#005840" },
      { width: 20, color: "#D1F843" },
      { width: 50, color: "#F4C430" },
      { width: 10, color: "#5E5C57" },
    ],
    donut: [
      { color: "#F4C430", value: 50 },
      { color: "#D1F843", value: 20 },
      { color: "#005840", value: 15 },
      { color: "#5E5C57", value: 10 },
      { color: "#16A34A", value: 5 },
    ],
  },
  {
    id: "sommer-toppform",
    title: "Sommer-toppform",
    sub: "8 uker · 32 økter · 24 t total",
    tags: ["FULLSWING", "8U", "AVANSERT"],
    stripe: [
      { width: 15, color: "#16A34A" },
      { width: 40, color: "#005840" },
      { width: 25, color: "#D1F843" },
      { width: 15, color: "#F4C430" },
      { width: 5, color: "#5E5C57" },
    ],
    donut: [
      { color: "#005840", value: 40 },
      { color: "#D1F843", value: 25 },
      { color: "#16A34A", value: 15 },
      { color: "#F4C430", value: 15 },
      { color: "#5E5C57", value: 5 },
    ],
  },
  {
    id: "chip-pitch-pro",
    title: "Chip & Pitch Pro",
    sub: "6 uker · 18 økter · 12 t total",
    tags: ["CHIP", "6U", "MIDDELS"],
    stripe: [
      { width: 10, color: "#16A34A" },
      { width: 65, color: "#005840" },
      { width: 15, color: "#D1F843" },
      { width: 10, color: "#F4C430" },
    ],
    donut: [
      { color: "#005840", value: 65 },
      { color: "#D1F843", value: 15 },
      { color: "#F4C430", value: 10 },
      { color: "#16A34A", value: 10 },
    ],
  },
  {
    id: "iron-lab",
    title: "Iron Lab",
    sub: "8 uker · 24 økter · 18 t total",
    tags: ["IRON", "8U", "MIDDELS"],
    stripe: [
      { width: 10, color: "#16A34A" },
      { width: 55, color: "#005840" },
      { width: 25, color: "#D1F843" },
      { width: 10, color: "#F4C430" },
    ],
    donut: [
      { color: "#005840", value: 55 },
      { color: "#D1F843", value: 25 },
      { color: "#16A34A", value: 10 },
      { color: "#F4C430", value: 10 },
    ],
  },
  {
    id: "turn-prep-12u",
    title: "Turnerings-prep 12u",
    sub: "12 uker · 44 økter · 36 t total",
    tags: ["FULLSWING", "12U", "AVANSERT"],
    stripe: [
      { width: 5, color: "#16A34A" },
      { width: 15, color: "#005840" },
      { width: 30, color: "#D1F843" },
      { width: 35, color: "#F4C430" },
      { width: 15, color: "#5E5C57" },
    ],
    donut: [
      { color: "#F4C430", value: 35 },
      { color: "#D1F843", value: 30 },
      { color: "#005840", value: 15 },
      { color: "#5E5C57", value: 15 },
      { color: "#16A34A", value: 5 },
    ],
  },
  {
    id: "vintergrunnlag",
    title: "Vintergrunnlag",
    sub: "12 uker · 36 økter · 28 t total",
    tags: ["FULLSWING", "12U", "BEGYNNER"],
    stripe: [
      { width: 45, color: "#16A34A" },
      { width: 35, color: "#005840" },
      { width: 15, color: "#D1F843" },
      { width: 5, color: "#F4C430" },
    ],
    donut: [
      { color: "#16A34A", value: 45 },
      { color: "#005840", value: 35 },
      { color: "#D1F843", value: 15 },
      { color: "#F4C430", value: 5 },
    ],
  },
  {
    id: "return-to-play",
    title: "Return-to-play 4u",
    sub: "4 uker · 16 økter · 10 t total",
    tags: ["FYS", "4U", "REHAB"],
    stripe: [
      { width: 40, color: "#16A34A" },
      { width: 40, color: "#005840" },
      { width: 15, color: "#D1F843" },
      { width: 5, color: "#5E5C57" },
    ],
    donut: [
      { color: "#005840", value: 40 },
      { color: "#16A34A", value: 40 },
      { color: "#D1F843", value: 15 },
      { color: "#5E5C57", value: 5 },
    ],
  },
];

const FILTER_CHIPS = [
  { label: "Alle 9", active: true },
  { label: "Putte" },
  { label: "Chip" },
  { label: "Iron" },
  { label: "Driver" },
  { label: "Fullswing" },
  { label: "Mental" },
];

const DURATION_CHIPS = [{ label: "4u" }, { label: "6u" }, { label: "8u" }, { label: "12u" }];

export default function TemplateSelectorDemo() {
  return (
    <div className="min-h-screen bg-[var(--surface,#FAFAF7)]">
      <div className="fixed inset-0 bg-[rgba(10,31,24,0.5)]" aria-hidden="true" />

      <div
        className="relative mx-auto my-8 max-w-[880px] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        style={{ maxHeight: "calc(100vh - 32px)" }}
      >
        {/* Header */}
        <header className="flex items-start justify-between gap-4 border-b border-border px-8 py-6">
          <div className="flex-1">
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              CoachHQ · maler-bibliotek
            </div>
            <h2 className="mt-1 font-display text-[22px] font-bold leading-tight tracking-tight">
              Velg plan-mal
            </h2>
            <p className="mt-1.5 text-[13px] leading-[1.5] text-muted-foreground">
              9 maler tilgjengelige — valg pre-fyller wizard-steg 3 med øvelser og pyramide.
            </p>
          </div>
          <Link
            href="/"
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Lukk"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </Link>
        </header>

        {/* Filter row */}
        <div className="flex items-center gap-2.5 border-b border-border bg-[var(--surface-alt,#F1EEE5)] px-8 py-3.5">
          <div className="flex max-w-[280px] flex-1 items-center gap-2.5 rounded-full border-2 border-border bg-card px-3.5 py-2">
            <Search className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={2} />
            <input
              type="text"
              placeholder="Søk maler …"
              className="flex-1 border-none bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {FILTER_CHIPS.map((c) => (
              <FilterChip key={c.label} label={c.label} active={c.active} />
            ))}
            <span className="mx-1 h-4 w-px bg-border" />
            {DURATION_CHIPS.map((c) => (
              <FilterChip key={c.label} label={c.label} />
            ))}
          </div>
        </div>

        {/* Result meta */}
        <div className="flex items-baseline justify-between px-8 pt-4">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            9 maler
          </span>
          <span className="inline-flex cursor-pointer items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
            Sorter — populært
            <ChevronDown className="h-3 w-3" strokeWidth={1.75} />
          </span>
        </div>

        {/* Body — grid */}
        <div
          className="overflow-y-auto px-8 pb-7 pt-3.5"
          style={{ maxHeight: "calc(100vh - 320px)" }}
        >
          <div className="grid grid-cols-3 gap-3.5">
            {TEMPLATES.map((t) => (
              <TemplateCard key={t.id} template={t} />
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between gap-3 border-t border-border bg-[var(--surface-alt,#F1EEE5)] px-8 py-4">
          <Link
            href="/"
            className="rounded-md px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
          >
            Avbryt
          </Link>
          <button className="rounded-md bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90">
            Bruk valgt mal — Driver Toppform →
          </button>
        </footer>
      </div>
    </div>
  );
}

function FilterChip({ label, active }: { label: string; active?: boolean }) {
  return (
    <button
      className={`rounded-full border px-3 py-1 font-mono text-[12px] font-semibold transition-colors ${
        active
          ? "border-primary bg-primary text-accent"
          : "border-border bg-card text-muted-foreground hover:border-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

function TemplateCard({ template }: { template: Template }) {
  return (
    <div
      className={`relative flex min-h-[230px] cursor-pointer flex-col overflow-hidden rounded-xl border-2 bg-[var(--surface,#FAFAF7)] transition-all hover:-translate-y-0.5 hover:shadow-md ${
        template.selected ? "border-primary bg-[var(--brand-primary-soft,rgba(0,88,64,0.08))]" : "border-border hover:border-muted-foreground"
      }`}
    >
      {template.selected && (
        <span className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full bg-primary text-accent">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3 w-3"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
      )}

      {/* Stripe */}
      <div className="flex h-1">
        {template.stripe.map((s, i) => (
          <span
            key={i}
            className="block h-full"
            style={{ width: `${s.width}%`, background: s.color }}
          />
        ))}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div className="font-display text-[14px] font-semibold leading-tight tracking-tight text-foreground">
          {template.title}
        </div>
        <div className="font-mono text-[11px] tabular-nums text-muted-foreground">
          {template.sub}
        </div>
        <div className="flex flex-wrap gap-1">
          {template.tags.map((tag) => (
            <span
              key={tag}
              className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-auto flex items-end justify-between">
          <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-primary">
            Forhåndsvis →
          </span>
          <MiniDonut slices={template.donut} />
        </div>
      </div>
    </div>
  );
}

function computeDonutSegments(
  slices: DonutSlice[],
): (DonutSlice & { offset: number })[] {
  let acc = 0;
  return slices.map((s) => {
    const seg = { ...s, offset: acc };
    acc -= s.value;
    return seg;
  });
}

function MiniDonut({ slices }: { slices: DonutSlice[] }) {
  const segments = computeDonutSegments(slices);
  return (
    <div className="relative h-12 w-12 flex-shrink-0">
      <svg viewBox="0 0 42 42" className="h-full w-full" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="21" cy="21" r="15.9" fill="none" stroke="var(--color-border,#E5E3DD)" strokeWidth="6" />
        {segments.map((s, i) => (
          <circle
            key={i}
            cx="21"
            cy="21"
            r="15.9"
            fill="none"
            stroke={s.color}
            strokeWidth="6"
            strokeDasharray={`${s.value} ${100 - s.value}`}
            strokeDashoffset={s.offset}
          />
        ))}
      </svg>
    </div>
  );
}
