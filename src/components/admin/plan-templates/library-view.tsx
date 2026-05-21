"use client";

/**
 * Bibliotek-view for /admin/plan-templates.
 * Filter, sortering, grid (5x3) eller liste.
 *
 * Tar inn alle templates som JSON-friendly objekter (serialiserbare props).
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { Filter, LayoutGrid, List, Search, Sparkles } from "lucide-react";
import {
  KATEGORI_ALLE,
  KATEGORI_LABEL,
  KATEGORI_PRIMARY,
  FASE_ALLE,
  FASE_LABEL,
  donutGradient,
  type DisciplinFordeling,
} from "./shared";
import type { LPhase, NgfKategori } from "@/generated/prisma/client";

export type TemplateRow = {
  id: string;
  name: string;
  description: string | null;
  kategori: NgfKategori;
  lPhase: LPhase;
  varighetUker: number;
  ukentligOktAntall: number;
  fordeling: DisciplinFordeling;
  minAlder: number | null;
  maxAlder: number | null;
  approved: boolean;
  usageCount: number;
  effectivenessAvg: number | null;
  sessionCount: number;
  updatedAt: string; // ISO
  isSpecial: boolean; // ikke i 5x3-rutenettet
};

type SortKey = "nivaa" | "effekt" | "brukt" | "endret";

type Props = {
  templates: TemplateRow[];
};

function isSpecial(t: TemplateRow): boolean {
  return t.isSpecial;
}

function sortTemplates(rows: TemplateRow[], key: SortKey): TemplateRow[] {
  const copy = [...rows];
  switch (key) {
    case "effekt":
      copy.sort((a, b) => (b.effectivenessAvg ?? -Infinity) - (a.effectivenessAvg ?? -Infinity));
      break;
    case "brukt":
      copy.sort((a, b) => b.usageCount - a.usageCount);
      break;
    case "endret":
      copy.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      break;
    case "nivaa":
    default:
      copy.sort((a, b) => {
        const aI = KATEGORI_ALLE.indexOf(a.kategori);
        const bI = KATEGORI_ALLE.indexOf(b.kategori);
        if (aI !== bI) return aI - bI;
        const faseI = FASE_ALLE.indexOf(a.lPhase) - FASE_ALLE.indexOf(b.lPhase);
        if (faseI !== 0) return faseI;
        return a.name.localeCompare(b.name);
      });
  }
  return copy;
}

export function LibraryView({ templates }: Props) {
  const [valgtKategorier, setValgtKategorier] = useState<Set<NgfKategori>>(new Set());
  const [valgtFaser, setValgtFaser] = useState<Set<LPhase>>(new Set());
  const [kunSpecial, setKunSpecial] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("nivaa");
  const [sok, setSok] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filtered = useMemo(() => {
    let rows = templates;
    if (valgtKategorier.size > 0) {
      rows = rows.filter((r) => valgtKategorier.has(r.kategori));
    }
    if (valgtFaser.size > 0) {
      rows = rows.filter((r) => valgtFaser.has(r.lPhase));
    }
    if (kunSpecial) {
      rows = rows.filter(isSpecial);
    }
    if (sok.trim()) {
      const q = sok.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          (r.description ?? "").toLowerCase().includes(q)
      );
    }
    return sortTemplates(rows, sortKey);
  }, [templates, valgtKategorier, valgtFaser, kunSpecial, sok, sortKey]);

  function toggleKategori(k: NgfKategori) {
    setValgtKategorier((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  }

  function toggleFase(f: LPhase) {
    setValgtFaser((prev) => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f);
      else next.add(f);
      return next;
    });
  }

  const standard = filtered.filter((t) => !isSpecial(t));
  const specials = filtered.filter(isSpecial);

  // Bygg 5x3 grid-lookup
  const gridMap = useMemo(() => {
    const m = new Map<string, TemplateRow[]>();
    for (const t of standard) {
      const key = `${t.kategori}::${t.lPhase}`;
      const list = m.get(key) ?? [];
      list.push(t);
      m.set(key, list);
    }
    return m;
  }, [standard]);

  return (
    <section className="flex flex-col gap-6">
      {/* Filter-bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
            <Filter className="h-3.5 w-3.5" strokeWidth={1.75} />
            Filter
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`flex h-9 items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition ${
                viewMode === "grid"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:bg-secondary"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" strokeWidth={1.75} />
              Grid
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`flex h-9 items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition ${
                viewMode === "list"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:bg-secondary"
              }`}
            >
              <List className="h-3.5 w-3.5" strokeWidth={1.75} />
              Liste
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
              Nivå
            </div>
            <div className="flex flex-wrap gap-1.5">
              {KATEGORI_ALLE.map((k) => {
                const aktiv = valgtKategorier.has(k);
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => toggleKategori(k)}
                    title={KATEGORI_LABEL[k]}
                    className={`flex h-8 min-w-[36px] items-center justify-center rounded-full border px-3 font-mono text-xs font-semibold transition ${
                      aktiv
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground hover:bg-secondary"
                    }`}
                  >
                    {k}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
              Fase
            </div>
            <div className="flex flex-wrap gap-1.5">
              {FASE_ALLE.map((f) => {
                const aktiv = valgtFaser.has(f);
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => toggleFase(f)}
                    className={`flex h-8 items-center rounded-full border px-4 text-xs font-medium transition ${
                      aktiv
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground hover:bg-secondary"
                    }`}
                  >
                    {FASE_LABEL[f]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={kunSpecial}
              onChange={(e) => setKunSpecial(e.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            Vis kun special-templates
          </label>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
                strokeWidth={1.75}
              />
              <input
                type="text"
                value={sok}
                onChange={(e) => setSok(e.target.value)}
                placeholder="Søk i navn eller beskrivelse"
                className="h-9 w-full rounded-md border border-input bg-card pl-8 pr-3 text-xs placeholder:text-muted-foreground focus:border-primary focus:outline-none sm:w-64"
              />
            </div>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="h-9 rounded-md border border-input bg-card px-3 text-xs"
            >
              <option value="nivaa">Sortér: Nivå (default)</option>
              <option value="effekt">Sortér: Effekt</option>
              <option value="brukt">Sortér: Brukt mest</option>
              <option value="endret">Sortér: Sist endret</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resultater */}
      {viewMode === "grid" ? (
        <GridView gridMap={gridMap} specials={specials} />
      ) : (
        <ListView rows={filtered} />
      )}

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">
          Ingen maler matchet filteret.
        </div>
      )}
    </section>
  );
}

function GridView({
  gridMap,
  specials,
}: {
  gridMap: Map<string, TemplateRow[]>;
  specials: TemplateRow[];
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          {/* Header */}
          <div className="grid grid-cols-[120px_repeat(3,1fr)] gap-2 pb-2">
            <div />
            {FASE_ALLE.map((f) => (
              <div
                key={f}
                className="rounded-md bg-secondary px-3 py-2 text-center font-mono text-[10px] uppercase tracking-[0.1em] text-secondary-foreground"
              >
                {FASE_LABEL[f]}
              </div>
            ))}
          </div>

          {/* Rader */}
          {KATEGORI_PRIMARY.map((k) => (
            <div
              key={k}
              className="grid grid-cols-[120px_repeat(3,1fr)] gap-2 border-t border-border py-2"
            >
              <div className="flex items-center px-2">
                <div>
                  <div className="font-mono text-lg font-bold leading-none">{k}</div>
                  <div className="mt-1 text-[10px] leading-tight text-muted-foreground">
                    {KATEGORI_LABEL[k].split(" — ")[1]}
                  </div>
                </div>
              </div>
              {FASE_ALLE.map((f) => {
                const cell = gridMap.get(`${k}::${f}`) ?? [];
                return (
                  <div key={f} className="flex flex-col gap-2">
                    {cell.length === 0 ? (
                      <div className="flex min-h-[80px] items-center justify-center rounded-lg border border-dashed border-border bg-background/50 text-[10px] text-muted-foreground">
                        Ingen mal
                      </div>
                    ) : (
                      cell.map((t) => <GridCard key={t.id} template={t} />)
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {specials.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
          <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} />
            Special-templates
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {specials.map((t) => (
              <GridCard key={t.id} template={t} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function GridCard({ template }: { template: TemplateRow }) {
  return (
    <Link
      href={`/admin/plan-templates/${template.id}`}
      className="group flex min-h-[80px] flex-col justify-between rounded-lg border border-border bg-card p-3 transition hover:border-primary hover:shadow-sm"
      title={template.description ?? template.name}
    >
      <div className="flex items-start gap-2">
        <div
          aria-hidden="true"
          className="mt-0.5 h-8 w-8 shrink-0 rounded-full"
          style={{ background: donutGradient(template.fordeling) }}
        />
        <div className="min-w-0 flex-1">
          <div className="line-clamp-2 font-display text-xs font-semibold leading-tight tracking-tight group-hover:text-primary">
            {template.name}
          </div>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
        <span className="font-mono">
          Brukt {template.usageCount}x
          {template.effectivenessAvg != null
            ? ` · ${template.effectivenessAvg >= 0 ? "+" : ""}${template.effectivenessAvg.toFixed(1)}`
            : ""}
        </span>
        {!template.approved && (
          <span className="rounded-sm bg-destructive/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-destructive">
            Utkast
          </span>
        )}
      </div>
    </Link>
  );
}

function ListView({ rows }: { rows: TemplateRow[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full min-w-[820px] text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary text-left font-mono text-[10px] uppercase tracking-[0.1em] text-secondary-foreground">
            <th className="px-4 py-3">Navn</th>
            <th className="px-3 py-3">Nivå</th>
            <th className="px-3 py-3">Fase</th>
            <th className="px-3 py-3 text-right">Uker</th>
            <th className="px-3 py-3 text-right">Økt/uke</th>
            <th className="px-3 py-3 text-right">Brukt</th>
            <th className="px-3 py-3 text-right">Effekt</th>
            <th className="px-3 py-3">Sist endret</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => (
            <tr
              key={t.id}
              className="border-b border-border last:border-0 hover:bg-secondary/30"
            >
              <td className="px-4 py-3">
                <Link
                  href={`/admin/plan-templates/${t.id}`}
                  className="font-medium text-foreground hover:text-primary"
                >
                  {t.name}
                </Link>
                {!t.approved && (
                  <span className="ml-2 rounded-sm bg-destructive/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-destructive">
                    Utkast
                  </span>
                )}
              </td>
              <td className="px-3 py-3 font-mono text-xs">{t.kategori}</td>
              <td className="px-3 py-3 text-xs">{FASE_LABEL[t.lPhase]}</td>
              <td className="px-3 py-3 text-right font-mono text-xs">{t.varighetUker}</td>
              <td className="px-3 py-3 text-right font-mono text-xs">{t.ukentligOktAntall}</td>
              <td className="px-3 py-3 text-right font-mono text-xs">{t.usageCount}</td>
              <td className="px-3 py-3 text-right font-mono text-xs">
                {t.effectivenessAvg != null
                  ? `${t.effectivenessAvg >= 0 ? "+" : ""}${t.effectivenessAvg.toFixed(2)}`
                  : "—"}
              </td>
              <td className="px-3 py-3 text-xs text-muted-foreground">
                {new Date(t.updatedAt).toLocaleDateString("nb-NO", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

