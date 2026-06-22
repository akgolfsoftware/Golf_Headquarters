/**
 * AgencyOS — Tester-matrise (/admin/tester)
 * Port av public/design-handover/agencyos/components-agency-tests.html.
 *
 * Spillere (rader) × tester (kolonner) ytelse-matrise:
 *   - Sticky første kolonne (spiller) + sticky header (test-navn + enhet)
 *   - Celle = siste måling (mono) + delta vs forrige + relativ dato
 *   - Toolbar med gruppe-filter (fra homeClub) + handlinger
 *   - Legende + footer-summary + 2 KPI-kort (gruppe-snitt · trender)
 *   - Tildel-test-knapp per rad → /admin/tester/tildel/[spillerId]
 *
 * DATAGAP (ærlig): TestDefinition har ingen strukturert numerisk mål, så
 * over/nær/under-fargekoding er IKKE mulig. Målte celler vises nøytralt
 * (forest-tint = målt), ikke-testede skravert. Se info-stripe i legende.
 *
 * Bygget med DS-tokens + lucide. Ingen hardkodet hex, ingen emoji.
 */

import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  Download,
  Info,
  LayoutTemplate,
  Minus,
  Plus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  TesterMatrixData,
  TesterAxis,
  MatrixCell,
  DeltaTone,
} from "@/lib/admin/tester-matrix-data";

const axisDotClass: Record<TesterAxis, string> = {
  fys: "bg-pyr-fys",
  tek: "bg-pyr-tek",
  slag: "bg-pyr-slag",
  spill: "bg-pyr-spill",
  turn: "bg-pyr-turn",
};

const avatarToneClass = {
  default: "bg-secondary text-foreground",
  primary: "bg-primary text-primary-foreground",
  accent: "bg-accent text-primary",
} as const;

const deltaToneClass: Record<DeltaTone, string> = {
  up: "text-success",
  down: "text-destructive",
  flat: "text-muted-foreground",
};

const deltaIcon = { up: ArrowUp, down: ArrowDown, flat: Minus } as const;

function MonoLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "font-mono text-[10px] font-extrabold uppercase tracking-[0.12em]",
        className,
      )}
    >
      {children}
    </span>
  );
}

function ScoreCell({ cell }: { cell: MatrixCell }) {
  if (cell.tone === "untested") {
    return (
      <div
        className="flex h-16 flex-col items-center justify-center gap-0.5 bg-[repeating-linear-gradient(135deg,hsl(var(--secondary))_0_8px,hsl(var(--card))_8px_16px)]"
        title="Ikke testet ennå. Bruk Tildel for å planlegge."
      >
        <span className="font-mono text-[13px] font-bold text-muted-foreground">—</span>
        <span className="font-mono text-[8px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
          ikke testet
        </span>
      </div>
    );
  }

  const DeltaIcon = cell.delta ? deltaIcon[cell.delta.tone] : null;
  const inner = (
    <div className="flex h-16 flex-col items-center justify-center gap-0.5 bg-[hsl(var(--primary)/0.07)] transition-transform duration-100 ease-out hover:z-10 hover:scale-[1.04]">
      <span className="font-mono text-[15px] font-extrabold leading-none tracking-[-0.01em] tabular-nums text-foreground">
        {cell.value}
      </span>
      {cell.delta && DeltaIcon && (
        <span
          className={cn(
            "inline-flex items-center gap-0.5 font-mono text-[9px] font-bold tabular-nums tracking-[0.04em]",
            deltaToneClass[cell.delta.tone],
          )}
        >
          <DeltaIcon className="h-2.5 w-2.5" strokeWidth={2.5} aria-hidden />
          {cell.delta.text}
        </span>
      )}
      <span className="font-mono text-[8px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
        {cell.when}
      </span>
    </div>
  );

  return cell.href ? (
    <Link href={cell.href} className="block">
      {inner}
    </Link>
  ) : (
    inner
  );
}

function TbButton({
  children,
  primary,
}: {
  children: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-full px-3 font-mono text-[10px] font-extrabold uppercase tracking-[0.1em]",
        primary
          ? "border border-primary bg-primary text-primary-foreground hover:opacity-90"
          : "border border-border bg-card text-foreground hover:bg-secondary",
      )}
    >
      {children}
    </button>
  );
}

export function TesterMatrix({ data }: { data: TesterMatrixData }) {
  const {
    rows,
    columns,
    groups,
    playerCount,
    testCount,
    measurementCount,
    missingCount,
    groupAverages,
    trends,
  } = data;

  // Tom-tilstand: ingen tester med målinger.
  if (columns.length === 0) {
    return (
      <div className="mx-auto max-w-[1200px]">
        <Header playerCount={playerCount} testCount={0} measurementCount={0} missingCount={0} />
        <div className="rounded-2xl border border-border bg-card p-16 text-center">
          <LayoutTemplate
            className="mx-auto h-8 w-8 text-muted-foreground/40"
            strokeWidth={1.5}
            aria-hidden
          />
          <h2 className="mt-4 font-display text-lg font-bold tracking-[-0.01em] text-foreground">
            Ingen testresultater ennå
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Matrisen fylles ut når spillere har registrert minst én måling. Tildel en test til en
            spiller for å komme i gang.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px]">
      <Header
        playerCount={playerCount}
        testCount={testCount}
        measurementCount={measurementCount}
        missingCount={missingCount}
      />

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {/* TOOLBAR — gruppe-filter + handlinger */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-background px-5 py-2.5">
          {groups.map((g, i) => (
            <span
              key={g.label}
              className={cn(
                "inline-flex h-7 cursor-default items-center gap-1.5 rounded-full px-3 font-mono text-[10px] font-bold uppercase tracking-[0.1em]",
                i === 0
                  ? "border border-primary bg-primary text-primary-foreground"
                  : "border border-border bg-card text-foreground",
              )}
            >
              {g.label}
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-1.5 py-px font-mono text-[9px] font-extrabold",
                  i === 0 ? "bg-accent/30 text-primary-foreground" : "bg-primary/10 text-muted-foreground",
                )}
              >
                {g.count}
              </span>
            </span>
          ))}

          <div className="ml-auto flex items-center gap-1.5">
            <TbButton>
              <Download className="h-3 w-3" strokeWidth={2} aria-hidden />
              Eksport CSV
            </TbButton>
            <TbButton>
              <LayoutTemplate className="h-3 w-3" strokeWidth={2} aria-hidden />
              Test-mal
            </TbButton>
            <TbButton primary>
              <Plus className="h-3 w-3" strokeWidth={2} aria-hidden />
              Ny test
            </TbButton>
          </div>
        </div>

        {/* LEGEND + datagap-info */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border bg-background px-5 py-2">
          <MonoLabel className="text-foreground">LEGENDE</MonoLabel>
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-[0.04em] text-muted-foreground">
            <span className="h-3.5 w-3.5 rounded-[3px] border border-primary/40 bg-[hsl(var(--primary)/0.10)]" />
            MÅLT
          </span>
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-[0.04em] text-muted-foreground">
            <span className="h-3.5 w-3.5 rounded-[3px] border border-border bg-[repeating-linear-gradient(135deg,hsl(var(--secondary))_0_4px,hsl(var(--card))_4px_8px)]" />
            IKKE TESTET
          </span>
          <span className="ml-auto inline-flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-[0.04em] text-warning">
            <Info className="h-3 w-3" strokeWidth={2} aria-hidden />
            MÅL-FARGEKODING KREVER DEFINERTE MÅL — IKKE SATT ENNÅ
          </span>
        </div>

        {/* MATRIX */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: 220 }} />
              {columns.map((c) => (
                <col key={c.testId} style={{ width: 120 }} />
              ))}
              <col style={{ width: 130 }} />
            </colgroup>
            <thead>
              <tr>
                <th className="sticky left-0 z-20 border-b border-border bg-card px-3.5 py-3 text-left align-bottom" />
                {columns.map((c) => (
                  <th
                    key={c.testId}
                    className="border-b border-l border-border bg-card px-2.5 py-3 text-center align-bottom"
                  >
                    <span
                      className={cn(
                        "mr-1.5 inline-block h-2 w-2 rounded-full align-middle",
                        axisDotClass[c.axis],
                      )}
                      aria-hidden
                    />
                    <span className="block text-[11px] font-extrabold tracking-[0.02em] text-foreground">
                      {c.name}
                    </span>
                    <span className="mt-1 block font-mono text-[9px] font-bold tracking-[0.04em] text-muted-foreground">
                      {c.unitLine}
                    </span>
                  </th>
                ))}
                <th className="border-b border-l border-border bg-card px-2.5 py-3 align-bottom" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.playerId} className="border-b border-border last:border-b-0">
                  {/* Spiller — sticky */}
                  <td className="sticky left-0 z-10 border-b border-border bg-card">
                    <div className="flex items-center gap-2.5 px-3.5 py-3 text-left">
                      <span
                        className={cn(
                          "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-display text-[10px] font-bold",
                          avatarToneClass[r.avatarTone],
                        )}
                      >
                        {r.initials}
                      </span>
                      <div className="min-w-0">
                        <span className="flex items-center gap-1 text-[13px] font-bold leading-tight tracking-[-0.005em] text-foreground">
                          {r.group && (
                            <span className="inline-flex h-3.5 items-center rounded-[3px] bg-[hsl(var(--primary)/0.10)] px-1 font-mono text-[8px] font-extrabold uppercase tracking-[0.1em] text-success">
                              {r.group}
                            </span>
                          )}
                          <span className="truncate">{r.name}</span>
                        </span>
                        <span className="mt-0.5 block font-mono text-[9px] font-bold tracking-[0.04em] text-muted-foreground">
                          {r.sub}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Måle-celler */}
                  {r.cells.map((cell, j) => (
                    <td key={j} className="border-l border-border p-0 text-center align-middle">
                      <ScoreCell cell={cell} />
                    </td>
                  ))}

                  {/* Tildel */}
                  <td className="border-l border-border p-0 align-middle">
                    <div className="flex justify-end px-2.5 py-2">
                      <Link
                        href={r.tildelHref}
                        className={cn(
                          "inline-flex h-[30px] items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.06em]",
                          r.missingCount > 0
                            ? "border border-primary bg-primary text-primary-foreground hover:opacity-90"
                            : "border border-border bg-card text-foreground hover:bg-secondary",
                        )}
                      >
                        <Plus className="h-2.5 w-2.5 shrink-0" strokeWidth={2} aria-hidden />
                        Tildel
                        {r.missingCount > 0 && (
                          <span className="ml-1 inline-flex h-3.5 items-center rounded-full bg-destructive px-1.5 font-mono text-[8px] font-extrabold text-[hsl(var(--card))]">
                            {r.missingCount}
                          </span>
                        )}
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER SUMMARY */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-background px-5 py-3">
          <span className="font-mono text-[11px] font-bold tracking-[0.04em] text-muted-foreground">
            {playerCount} spillere × {testCount} tester ={" "}
            <b className="text-foreground">{playerCount * testCount} celler</b> ·{" "}
            <b className="text-foreground">{measurementCount} målt</b> ·{" "}
            <b className="text-foreground">{missingCount} mangler</b>
          </span>
          <span className="font-mono text-[11px] font-bold tracking-[0.04em] text-muted-foreground">
            Klikk en celle for historikk · Klikk Tildel for å planlegge ny test
          </span>
        </div>
      </div>

      {/* 2 KPI-KORT: gruppe-snitt + trender */}
      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
        {/* Gruppe-snitt */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 pb-3">
            <MonoLabel className="text-foreground">GRUPPE-SNITT</MonoLabel>
            <span className="font-mono text-[10px] font-bold text-muted-foreground">
              SISTE MÅLING · ALLE SPILLERE
            </span>
          </div>
          <div className="flex flex-col gap-px">
            {groupAverages.map((g) => (
              <div
                key={g.testId}
                className="flex items-baseline justify-between border-t border-border py-2 first:border-t-0"
              >
                <span className="truncate text-[13px] tracking-[-0.005em] text-foreground">
                  {g.name}
                </span>
                <span className="ml-3 shrink-0 font-mono text-[15px] font-extrabold tabular-nums text-foreground">
                  {g.avg}
                  {g.unit && g.avg !== "—" && (
                    <span className="ml-1 text-[11px] font-bold text-muted-foreground">{g.unit}</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Trender */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 pb-3">
            <MonoLabel className="text-foreground">TRENDER</MonoLabel>
            <span className="font-mono text-[10px] font-bold text-muted-foreground">
              VS FORRIGE MÅLING
            </span>
          </div>
          <div className="flex flex-col gap-px">
            <TrendRow
              icon={<TrendingUp className="h-3.5 w-3.5 text-success" strokeWidth={2} aria-hidden />}
              label="Bedring"
              value={trends.improving}
              tone="text-success"
            />
            <TrendRow
              icon={<Minus className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={2} aria-hidden />}
              label="Stagnasjon"
              value={trends.flat}
              tone="text-muted-foreground"
            />
            <TrendRow
              icon={
                <TrendingDown className="h-3.5 w-3.5 text-destructive" strokeWidth={2} aria-hidden />
              }
              label="Tilbakegang"
              value={trends.declining}
              tone="text-destructive"
            />
          </div>
          {trends.improving + trends.flat + trends.declining === 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              Ingen spillere har nok historikk til å vise trend ennå (krever minst 2 målinger på
              samme test).
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function TrendRow({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="flex items-center justify-between border-t border-border py-2.5 first:border-t-0">
      <span className="inline-flex items-center gap-2 text-[13px] tracking-[-0.005em] text-foreground">
        {icon}
        {label}
      </span>
      <span className={cn("font-mono text-[15px] font-extrabold tabular-nums", tone)}>
        {value} {value === 1 ? "spiller" : "spillere"}
      </span>
    </div>
  );
}

function Header({
  playerCount,
  testCount,
  measurementCount,
  missingCount,
}: {
  playerCount: number;
  testCount: number;
  measurementCount: number;
  missingCount: number;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
      <div>
        <MonoLabel className="text-muted-foreground">TESTER</MonoLabel>
        <h1 className="mt-1 font-display text-[26px] font-bold leading-tight tracking-[-0.02em] text-foreground">
          Spillere <em className="font-normal italic text-primary">×</em> tester — ytelse-matrise
        </h1>
      </div>
      <div className="inline-flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] font-bold tracking-[0.04em] text-muted-foreground">
        <span>
          <b className="text-foreground">{playerCount}</b> spillere
        </span>
        <span aria-hidden>·</span>
        <span>
          <b className="text-foreground">{testCount}</b> tester
        </span>
        <span aria-hidden>·</span>
        <span>
          <b className="text-foreground">{measurementCount}</b> målinger
        </span>
        {missingCount > 0 && (
          <>
            <span aria-hidden>·</span>
            <span className="text-warning">
              <b>{missingCount}</b> mangler
            </span>
          </>
        )}
      </div>
    </div>
  );
}
