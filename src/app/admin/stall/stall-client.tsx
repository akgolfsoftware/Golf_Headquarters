"use client";

/**
 * StallClient — hybrid terminal design.
 * Venstre: spiller-roster-tabell (søk + filter-pills).
 * Høyre: 360°-panel med SG-strip, pyramide-balanse og siste aktivitet.
 * Port av "AgencyOS Stall (hybrid).dc.html".
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Search, SendHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { AgPage } from "@/components/admin/agencyos/ui";

// ─────────────────────────────────────────────── Types ──

export type StallSpiller = {
  id: string;
  name: string;
  initials: string;
  group: string;
  hcp: string;
  sg: string;
  sgDir: "up" | "down" | null;
  last: string;
  tone: "up" | "warn" | "down" | "guide";
  pyr: { label: string; pct: number }[];
  adh: string;
};

type Filter = "alle" | "aktiv" | "oppf" | "junior";

// ─────────────────────────────────────────────── Tone tokens ──

const TONE_COLOR: Record<StallSpiller["tone"], string> = {
  up: "hsl(var(--success))",
  warn: "hsl(var(--warning))",
  down: "hsl(var(--destructive))",
  guide: "hsl(var(--accent))",
};

const TONE_BG: Record<StallSpiller["tone"], string> = {
  up: "rgba(79,208,138,.12)",
  warn: "rgba(232,180,60,.12)",
  down: "rgba(240,104,62,.12)",
  guide: "rgba(209,248,67,.1)",
};

const TONE_LABEL: Record<StallSpiller["tone"], string> = {
  up: "Aktiv",
  warn: "Trenger oppfølging",
  down: "Inaktiv",
  guide: "Veiledet",
};

// Pyramid-farge per lag
const PYR_COLORS = [
  "hsl(var(--warning))",
  "hsl(var(--info))",
  "hsl(var(--success))",
  "hsl(var(--primary))",
  "hsl(var(--accent))",
];

// ─────────────────────────────────────────────── StatusChip ──

function StatusChip({ tone }: { tone: StallSpiller["tone"] }) {
  return (
    <span
      className="rounded-full px-[9px] py-[3px] font-mono text-[8.5px] font-bold uppercase tracking-[0.04em]"
      style={{ color: TONE_COLOR[tone], background: TONE_BG[tone] }}
    >
      {TONE_LABEL[tone]}
    </span>
  );
}

// ─────────────────────────────────────────────── FilterPill ──

function FilterPill({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-[7px] rounded-full border px-3 py-[6px] text-[11.5px] font-semibold transition",
        active
          ? "border-accent bg-accent/10 text-foreground"
          : "border-border bg-card text-foreground hover:border-accent/40",
      )}
    >
      {label}
      <span
        className={cn(
          "rounded-full px-[6px] py-[1px] font-mono text-[9px] font-bold",
          active
            ? "bg-accent text-accent-foreground"
            : "bg-secondary text-muted-foreground",
        )}
      >
        {count}
      </span>
    </button>
  );
}

// ─────────────────────────────────────────────── 360 Panel ──

function Panel360({ spiller }: { spiller: StallSpiller }) {
  const sgPos = !spiller.sg.startsWith("−") && spiller.sg !== "—";

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      {/* Header */}
      <div className="border-b border-border p-[20px]">
        <div className="flex items-center gap-[13px]">
          <span
            className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border-[2px] border-accent font-mono text-[17px] font-bold text-accent"
            style={{ background: "rgba(0,88,64,.2)" }}
          >
            {spiller.initials}
          </span>
          <div>
            <h2 className="font-display text-[18px] font-bold text-foreground">
              {spiller.name}
            </h2>
            <p className="mt-[2px] font-mono text-[10px] text-muted-foreground">
              {spiller.group} · HCP {spiller.hcp}
            </p>
          </div>
        </div>

        <div className="mt-[14px] flex gap-[7px]">
          <Link
            href={`/admin/spillere/${spiller.id}`}
            className="flex flex-1 items-center justify-center rounded-[8px] bg-accent py-[9px] font-mono text-[10px] font-bold uppercase text-accent-foreground transition hover:opacity-90"
          >
            Åpne 360°
          </Link>
          <Link
            href="/admin/innboks"
            className="flex items-center justify-center rounded-[8px] border border-border bg-secondary px-[12px] py-[9px] text-muted-foreground transition hover:text-foreground"
          >
            <SendHorizontal className="h-[15px] w-[15px]" strokeWidth={1.8} />
          </Link>
        </div>
      </div>

      {/* SG mini-strip */}
      <div className="grid grid-cols-2 gap-[9px] p-[18px_20px] pb-0">
        <div className="rounded-[6px] border border-border bg-secondary p-3">
          <div className="font-mono text-[8px] uppercase tracking-[0.1em] text-muted-foreground">
            SG TOTALT
          </div>
          <div
            className={cn(
              "mt-[5px] font-mono text-[20px] font-semibold tabular-nums",
              spiller.sg === "—"
                ? "text-muted-foreground"
                : sgPos
                  ? "text-success"
                  : "text-destructive",
            )}
          >
            {spiller.sg}
          </div>
        </div>
        <div
          className="rounded-[6px] border p-3"
          style={{
            background: "rgba(209,248,67,.08)",
            borderColor: "rgba(209,248,67,.2)",
          }}
        >
          <div
            className="font-mono text-[8px] uppercase tracking-[0.1em]"
            style={{ color: "rgba(209,248,67,.6)" }}
          >
            ADHERENCE
          </div>
          <div className="mt-[5px] font-mono text-[20px] font-semibold tabular-nums text-accent">
            {spiller.adh}
          </div>
        </div>
      </div>

      {/* Pyramide-balanse */}
      <div className="px-[20px] pt-[16px]">
        <span className="mb-[10px] block font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
          Pyramide-balanse
        </span>
        <div className="flex flex-col gap-[7px]">
          {spiller.pyr.map((b, i) => (
            <div key={b.label} className="flex items-center gap-[9px]">
              <span className="w-[38px] font-mono text-[9px] text-muted-foreground">
                {b.label}
              </span>
              <div className="h-[6px] flex-1 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${b.pct}%`,
                    background: PYR_COLORS[i] ?? "hsl(var(--muted-foreground))",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Siste aktivitet */}
      <div className="px-[20px] pt-[16px] pb-[20px]">
        <span className="mb-[10px] block font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
          Siste aktivitet
        </span>
        <div className="flex gap-[9px] text-[12px] text-muted-foreground">
          <span className="w-[40px] shrink-0 font-mono text-muted-foreground">
            {spiller.last}
          </span>
          Siste registrerte aktivitet
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────── Main ──

export function StallClient({ spillere }: { spillere: StallSpiller[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("alle");
  const [q, setQ] = useState("");
  const [selId, setSelId] = useState<string | null>(spillere[0]?.id ?? null);

  const filtered = spillere.filter((p) => {
    const matchQ = p.name.toLowerCase().includes(q.toLowerCase());
    const matchF =
      filter === "alle" ||
      (filter === "aktiv" && p.tone === "up") ||
      (filter === "oppf" && (p.tone === "warn" || p.tone === "down")) ||
      (filter === "junior" && p.group.toLowerCase().includes("junior"));
    return matchQ && matchF;
  });

  const filterCounts: Record<Filter, number> = {
    alle: spillere.length,
    aktiv: spillere.filter((p) => p.tone === "up").length,
    oppf: spillere.filter((p) => p.tone === "warn" || p.tone === "down").length,
    junior: spillere.filter((p) => p.group.toLowerCase().includes("junior")).length,
  };

  const sel = filtered.find((p) => p.id === selId) ?? filtered[0] ?? null;

  return (
    <AgPage className="max-w-full px-0 pt-0 pb-0">
      <div className="flex min-h-0" style={{ height: "calc(100vh - 64px)" }}>
        {/* LEFT: roster */}
        <div className="flex min-w-0 flex-1 flex-col border-r border-border">
          {/* Header */}
          <div className="flex shrink-0 items-center gap-[14px] border-b border-border px-[22px] py-[16px]">
            <div>
              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                AgencyOS · Stall
              </span>
              <h1 className="font-display text-[18px] font-bold text-foreground">
                Spillere{" "}
                <span className="font-normal text-muted-foreground">
                  {spillere.length}
                </span>
              </h1>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <label className="flex w-[180px] items-center gap-2 rounded-[8px] border border-border bg-card px-3 py-2 text-muted-foreground">
                <Search className="h-[14px] w-[14px] shrink-0" strokeWidth={1.8} />
                <input
                  type="search"
                  placeholder="Søk …"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="flex-1 bg-transparent text-[12px] text-foreground outline-none placeholder:text-muted-foreground"
                />
              </label>
              <button
                type="button"
                onClick={() => router.push("/admin/spillere/ny")}
                className="flex items-center gap-[6px] rounded-[8px] bg-accent px-[13px] py-2 font-mono text-[10.5px] font-bold uppercase text-accent-foreground transition hover:opacity-90"
              >
                <Plus className="h-[13px] w-[13px]" strokeWidth={2.4} />
                Ny spiller
              </button>
            </div>
          </div>

          {/* Filter pills */}
          <div className="flex shrink-0 flex-wrap gap-[7px] border-b border-border px-[22px] py-3">
            {(
              [
                ["alle", "Alle"],
                ["aktiv", "Aktive"],
                ["oppf", "Trenger oppfølging"],
                ["junior", "Junior"],
              ] as const
            ).map(([k, label]) => (
              <FilterPill
                key={k}
                label={label}
                count={filterCounts[k]}
                active={filter === k}
                onClick={() => setFilter(k)}
              />
            ))}
          </div>

          {/* Table header */}
          <div
            className="sticky top-0 z-[2] grid shrink-0 border-b border-border px-[22px] py-[10px] font-mono text-[8.5px] font-bold uppercase tracking-[0.06em] text-muted-foreground"
            style={{
              gridTemplateColumns: "1.6fr 0.7fr 0.7fr 1fr 0.95fr",
              background: "hsl(var(--card))",
            }}
          >
            <span>Spiller</span>
            <span>HCP</span>
            <span>SG</span>
            <span>Siste økt</span>
            <span className="text-right">Status</span>
          </div>

          {/* Rows */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-[22px] py-12 text-center text-[13px] text-muted-foreground">
                Ingen spillere matcher filteret.
              </div>
            ) : (
              filtered.map((p) => {
                const isOn = p.id === sel?.id;
                const sgPos = !p.sg.startsWith("−") && p.sg !== "—";
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelId(p.id)}
                    className={cn(
                      "grid w-full cursor-pointer items-center border-b border-border px-[22px] py-[11px] text-left transition hover:bg-secondary",
                      isOn && "bg-accent/10",
                    )}
                    style={{
                      gridTemplateColumns: "1.6fr 0.7fr 0.7fr 1fr 0.95fr",
                      borderLeft: `2px solid ${isOn ? "hsl(var(--accent))" : "transparent"}`,
                    }}
                  >
                    {/* Spiller */}
                    <div className="flex min-w-0 items-center gap-[11px]">
                      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary font-display text-[11px] font-bold text-foreground">
                        {p.initials}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-semibold text-foreground">
                          {p.name}
                        </div>
                        <div className="font-mono text-[9.5px] text-muted-foreground">
                          {p.group}
                        </div>
                      </div>
                    </div>
                    {/* HCP */}
                    <span className="flex items-center font-mono text-[12.5px] tabular-nums text-foreground">
                      {p.hcp}
                    </span>
                    {/* SG */}
                    <span
                      className={cn(
                        "flex items-center font-mono text-[12.5px] font-bold tabular-nums",
                        p.sg === "—"
                          ? "text-muted-foreground font-normal"
                          : sgPos
                            ? "text-success"
                            : "text-destructive",
                      )}
                    >
                      {p.sg}
                    </span>
                    {/* Siste økt */}
                    <span className="flex items-center font-mono text-[10.5px] text-muted-foreground">
                      {p.last}
                    </span>
                    {/* Status */}
                    <span className="flex items-center justify-end">
                      <StatusChip tone={p.tone} />
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT: 360 panel */}
        <div
          className="flex w-[340px] shrink-0 flex-col"
          style={{ background: "hsl(var(--card))" }}
        >
          {sel ? (
            <Panel360 spiller={sel} />
          ) : (
            <div className="flex flex-1 items-center justify-center p-6">
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                Velg en spiller
              </span>
            </div>
          )}
        </div>
      </div>
    </AgPage>
  );
}
