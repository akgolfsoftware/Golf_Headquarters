"use client";

/**
 * AgencyOS — Stallen-tabell (klientdelen av /admin/spillere).
 *
 * Port av fasit `agencyos-app/screens-stable.jsx` → PlayersScreen (mørkt tema,
 * desktop 1280): PageHead m/ Eksport + Ny spiller, toolbar (søk + gruppe-seg +
 * status-filter + treff-teller), bulk-seleksjon m/ bulk-bar, og spillertabell
 * med SG-sparkline og status-dot. All data kommer ferdig formatert fra
 * page.tsx (server) — her skjer kun filtrering, seleksjon og navigasjon.
 */

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bot,
  Check,
  CheckCheck,
  ClipboardList,
  Download,
  FilterX,
  Loader2,
  MessageSquare,
  Search,
  SlidersHorizontal,
  UserPlus,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  AgAvatar,
  AgMobileRow,
  AgPage,
  AgPageHead,
  AgPlayerCell,
  AgSpark,
  AgStatusDot,
  AgTable,
  AgTableToolbar,
  AgTd,
  AgTh,
  agBtnClass,
  agTrClass,
} from "@/components/admin/agencyos/ui";

export type SpillerRad = {
  id: string;
  name: string;
  initials: string;
  /** Mono-sub under navnet (gruppe-bucket eller gruppenavn). */
  groupLabel: string;
  /** Bucket for seg-filteret. null = vises kun under «Alle». */
  bucket: "WANG" | "GFGK" | "Junior" | null;
  hcp: string;
  /** SG-serie (eldst → nyest). Færre enn 2 punkter = vis «—». */
  sg: number[];
  sgVal: string;
  sgDir: "up" | "down" | null;
  last: string;
  status: "ok" | "warn" | "alert";
  statusLbl: string;
  next: string;
};

const GRUPPER = ["Alle", "WANG", "GFGK", "Junior"] as const;

function RadCheckbox({
  on,
  label,
  onToggle,
}: {
  on: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className="inline-flex cursor-pointer border-0 bg-transparent p-0"
      aria-label={label}
      aria-pressed={on}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
    >
      <span
        className={cn(
          "inline-flex h-[17px] w-[17px] items-center justify-center rounded-[5px] border-[1.5px] transition-colors",
          on
            ? "border-primary bg-primary text-primary-foreground"
            : "border-input bg-card text-transparent hover:border-primary",
        )}
      >
        <Check size={11} strokeWidth={2.5} />
      </span>
    </button>
  );
}

export function SpillereTabell({
  rows,
  trengerDeg,
}: {
  rows: SpillerRad[];
  trengerDeg: number;
}) {
  const router = useRouter();
  const [group, setGroup] = useState<(typeof GRUPPER)[number]>("Alle");
  const [q, setQ] = useState("");
  const [att, setAtt] = useState(false);
  const [sel, setSel] = useState<Record<string, boolean>>({});
  const [genStatus, setGenStatus] = useState<null | { ok: number; feil: number }>(null);
  const [genLoading, setGenLoading] = useState(false);

  const filtered = rows.filter(
    (p) =>
      (group === "Alle" || p.bucket === group) &&
      p.name.toLowerCase().includes(q.toLowerCase()) &&
      (!att || p.status === "alert" || p.status === "warn"),
  );

  const selCt = Object.keys(sel).filter((id) => sel[id]).length;
  const allOn = filtered.length > 0 && filtered.every((p) => sel[p.id]);

  const toggle = (id: string) => setSel((s) => ({ ...s, [id]: !s[id] }));
  const toggleAll = () =>
    setSel((s) => {
      const n = { ...s };
      if (allOn) filtered.forEach((p) => delete n[p.id]);
      else filtered.forEach((p) => (n[p.id] = true));
      return n;
    });
  const clearSel = () => setSel({});

  async function genererPlanForslag() {
    const playerIds = Object.keys(sel).filter((id) => sel[id]);
    if (playerIds.length === 0) return;
    setGenLoading(true);
    setGenStatus(null);
    try {
      const res = await fetch("/api/admin/ai-plan/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerIds }),
      });
      const data = (await res.json()) as { ok: { playerId: string }[]; feil: { playerId: string; error: string }[] };
      setGenStatus({ ok: data.ok?.length ?? 0, feil: data.feil?.length ?? 0 });
      clearSel();
    } catch {
      setGenStatus({ ok: 0, feil: playerIds.length });
    } finally {
      setGenLoading(false);
    }
  }

  function eksporter() {
    const header = ["Spiller", "Gruppe", "HCP", "SG-trend", "Siste aktivitet", "Status", "Neste økt"];
    const lines = filtered.map((r) =>
      [r.name, r.groupLabel, r.hcp, r.sgVal, r.last, r.statusLbl, r.next]
        .map((v) => `"${String(v).replaceAll('"', '""')}"`)
        .join(";"),
    );
    const blob = new Blob(["﻿" + [header.join(";"), ...lines].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "spillere.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AgPage>
      <AgPageHead
        eyebrow="Stall · GFGK Akademi"
        title={`${rows.length} spillere,`}
        italic={`${trengerDeg} trenger deg.`}
        lead="Sortert på hastighet. Status-dot koder hvem som er på plan, advart eller bak skjema."
        actions={
          <>
            <button type="button" className={agBtnClass("ghost")} onClick={eksporter}>
              <Download size={16} strokeWidth={1.5} /> Eksport
            </button>
            <Link href="/admin/spillere/ny" className={agBtnClass("primary")}>
              <UserPlus size={16} strokeWidth={1.5} /> Ny spiller
            </Link>
          </>
        }
      />

      {genStatus && (
        <div
          className={cn(
            "mb-2 flex items-center gap-3 rounded-lg border px-4 py-3 text-sm",
            genStatus.feil === 0
              ? "border-primary/30 bg-primary/5 text-primary"
              : "border-warning/30 bg-warning/5 text-warning",
          )}
        >
          <Bot size={16} strokeWidth={1.5} />
          <span>
            {genStatus.ok > 0 && `${genStatus.ok} planforslag generert og lagt i godkjenningskøen.`}
            {genStatus.feil > 0 && ` ${genStatus.feil} feilet.`}
          </span>
          {genStatus.ok > 0 && (
            <Link
              href="/admin/approvals"
              className="ml-auto font-mono text-[11px] font-bold uppercase tracking-[0.08em] underline underline-offset-2"
            >
              Se køen →
            </Link>
          )}
          <button
            type="button"
            className="ml-1 text-muted-foreground hover:text-foreground"
            onClick={() => setGenStatus(null)}
          >
            ✕
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {selCt > 0 ? (
          <div className="flex flex-wrap items-center gap-[14px] border-b border-border bg-secondary px-3 py-[9px]">
            <span className="inline-flex shrink-0 items-center gap-[7px] font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-primary">
              <CheckCheck size={14} strokeWidth={1.5} />
              {selCt} valgt
            </span>
            <span className="flex flex-wrap gap-2">
              <button
                type="button"
                className={agBtnClass("primary", "sm")}
                onClick={genererPlanForslag}
                disabled={genLoading}
              >
                {genLoading ? (
                  <Loader2 size={14} strokeWidth={1.5} className="animate-spin" />
                ) : (
                  <Bot size={14} strokeWidth={1.5} />
                )}
                {genLoading ? "Genererer…" : "Generer plan"}
              </button>
              <Link href="/admin/plans" className={agBtnClass("secondary", "sm")}>
                <ClipboardList size={14} strokeWidth={1.5} /> Tildel plan
              </Link>
              <Link href="/admin/grupper" className={agBtnClass("secondary", "sm")}>
                <Users size={14} strokeWidth={1.5} /> Legg i gruppe
              </Link>
              <Link href="/admin/innboks" className={agBtnClass("secondary", "sm")}>
                <MessageSquare size={14} strokeWidth={1.5} /> Send melding
              </Link>
            </span>
            <button
              type="button"
              className={cn(agBtnClass("ghost", "sm"), "ml-auto")}
              onClick={clearSel}
            >
              Avbryt
            </button>
          </div>
        ) : (
          <AgTableToolbar>
            <span className="flex h-8 max-md:h-11 min-w-[200px] max-md:w-full items-center gap-2 rounded-lg border border-border bg-background px-3 text-muted-foreground">
              <Search size={14} strokeWidth={1.5} />
              <input
                className="flex-1 border-0 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
                placeholder="Søk spiller…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </span>
            <span className="inline-flex gap-[2px] rounded-lg bg-secondary p-[3px]">
              {GRUPPER.map((g) => (
                <button
                  key={g}
                  type="button"
                  className={cn(
                    "inline-flex h-[26px] max-md:h-11 cursor-pointer items-center rounded-md border-0 px-[11px] font-mono text-[10px] font-bold uppercase tracking-[0.06em] transition-colors",
                    group === g
                      ? "bg-card text-primary shadow-sm"
                      : "bg-transparent text-muted-foreground",
                  )}
                  onClick={() => setGroup(g)}
                >
                  {g}
                </button>
              ))}
            </span>
            <button
              type="button"
              className={cn(
                "inline-flex h-8 max-md:h-11 cursor-pointer items-center gap-[6px] rounded-lg border bg-card px-[11px] font-mono text-[10px] font-bold uppercase tracking-[0.06em] hover:bg-secondary",
                att ? "border-primary text-primary" : "border-border text-muted-foreground",
              )}
              onClick={() => setAtt((a) => !a)}
            >
              {att ? (
                <FilterX size={12} strokeWidth={1.5} />
              ) : (
                <SlidersHorizontal size={12} strokeWidth={1.5} />
              )}
              {att ? "Trenger deg" : "Status"}
            </button>
            <span className="ml-auto font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              {filtered.length} treff
            </span>
          </AgTableToolbar>
        )}

        {/* Mobil (< md): kort-rader — avatar, navn, gruppe-sub, status-dot, chevron */}
        <div className="divide-y divide-border md:hidden">
          {filtered.length === 0 && (
            <div className="px-4 py-10 text-center text-[13px] text-muted-foreground">
              Ingen spillere matcher filteret.
            </div>
          )}
          {filtered.map((p) => (
            <AgMobileRow
              key={p.id}
              href={`/admin/spillere/${p.id}`}
              leading={<AgAvatar initials={p.initials} size={36} />}
              title={p.name}
              sub={p.groupLabel}
              trailing={<AgStatusDot tone={p.status}>{p.statusLbl}</AgStatusDot>}
            />
          ))}
        </div>

        {/* Desktop (md+): full tabell */}
        <div className="hidden md:block">
        <AgTable>
          <thead>
            <tr>
              <AgTh className="w-[40px]">
                <RadCheckbox on={allOn} label="Velg alle" onToggle={toggleAll} />
              </AgTh>
              <AgTh>Spiller</AgTh>
              <AgTh num>HCP</AgTh>
              <AgTh num>SG-trend · 6 r</AgTh>
              <AgTh>Siste aktivitet</AgTh>
              <AgTh>Status</AgTh>
              <AgTh>Neste økt</AgTh>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-[14px] py-10 text-center text-[13px] text-muted-foreground"
                >
                  Ingen spillere matcher filteret.
                </td>
              </tr>
            )}
            {filtered.map((p) => (
              <tr
                key={p.id}
                className={cn(
                  agTrClass,
                  sel[p.id] &&
                    "bg-primary/5 [&>td:first-child]:shadow-[inset_3px_0_0_hsl(var(--primary))]",
                )}
                onClick={() => router.push(`/admin/spillere/${p.id}`)}
              >
                <AgTd>
                  <RadCheckbox
                    on={!!sel[p.id]}
                    label={`Velg ${p.name}`}
                    onToggle={() => toggle(p.id)}
                  />
                </AgTd>
                <AgTd className="pl-7">
                  <AgPlayerCell initials={p.initials} name={p.name} sub={p.groupLabel} />
                </AgTd>
                <AgTd num>{p.hcp}</AgTd>
                <AgTd num>
                  {p.sg.length >= 2 ? (
                    <span className="flex items-center justify-end gap-[10px]">
                      <AgSpark
                        points={p.sg}
                        color={
                          p.sgDir === "down" ? "hsl(var(--destructive))" : "hsl(var(--success))"
                        }
                      />
                      <span
                        className={cn(
                          "min-w-[44px] text-right font-mono text-xs font-semibold",
                          p.sgDir === "down" ? "text-destructive" : "text-success",
                        )}
                      >
                        {p.sgVal}
                      </span>
                    </span>
                  ) : (
                    <span className="font-normal text-muted-foreground">—</span>
                  )}
                </AgTd>
                <AgTd>
                  <span className="font-mono text-xs text-muted-foreground">{p.last}</span>
                </AgTd>
                <AgTd>
                  <AgStatusDot tone={p.status}>{p.statusLbl}</AgStatusDot>
                </AgTd>
                <AgTd>
                  <span
                    className={cn(
                      "font-mono text-xs font-semibold",
                      p.next === "Ingen" ? "text-destructive" : "text-foreground",
                    )}
                  >
                    {p.next}
                  </span>
                </AgTd>
              </tr>
            ))}
          </tbody>
        </AgTable>
        </div>
      </div>
    </AgPage>
  );
}
