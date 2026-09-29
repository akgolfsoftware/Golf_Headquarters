"use client";

/**
 * Teknisk plan · oversikt (/admin/plan/teknisk) i Precision Athletics. Én rad
 * per spiller i stallen med spillerens tekniske plan (TechnicalPlan). Ingen
 * egen tegning: rute nevnt under AG-10 i Claude Design 7d7c2994
 * (overlevering/teknisk-plan-progresjon-2026-09-27.md), bygget av tegningens
 * tabell og tilstander. Plan-maler (PlanTemplate) hører til treningsplanen og
 * ligger under /admin/plan/maler.
 */
import Link from "next/link";
import { ListChecks } from "lucide-react";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { KnappLenke, StatusPille, TomTilstand } from "@/components/precision/pa";
import { Tabell, type TabellKolonne } from "@/components/precision/pa-a4";
import { Meta, Strek, brok } from "@/components/precision/teknisk-plan/tp-deler";
import type { OversiktRad } from "@/lib/teknisk-plan/tp-oversikt";
import "@/styles/precision-a4.css";

const TONE = { Aktiv: "ok", Utkast: "neutral", Arkivert: "warn" } as const;

export function AG10Oversikt({ coachNavn, rader }: { coachNavn: string; rader: OversiktRad[] }) {
  const medPlan = rader.filter((r) => r.planId).length;
  const kolonner: TabellKolonne<OversiktRad>[] = [
    {
      key: "spiller", label: "Spiller", render: (r) => <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
        <Link href={r.planId ? `/admin/spillere/${r.id}/plan/${r.planId}` : `/admin/spillere/${r.id}/plan`} style={{ color: "var(--text-primary)", fontWeight: 600, display: "flex", alignItems: "center", minHeight: 44 }}>{r.navn}</Link>
        <Meta>{r.planNavn ? r.planNavn.toUpperCase() : "INGEN TEKNISK PLAN"}{r.antallPlaner > 1 ? ` · ${r.antallPlaner} PLANER` : ""}</Meta>
      </span>,
    },
    { key: "status", label: "Status", render: (r) => (r.status ? <StatusPille tone={TONE[r.status]}>{r.status}</StatusPille> : <Meta>—</Meta>) },
    { key: "oppgaver", label: "Oppgaver", mono: true, align: "right", render: (r) => (r.planId ? String(r.oppgaver) : "—") },
    {
      key: "fremdrift", label: "Repetisjoner", render: (r) => r.maal > 0
        ? <span style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 96 }}><span style={{ font: "500 13px/1.3 var(--font-mono)" }}>{brok(r.gjort, r.maal)}</span><Strek v={r.gjort} av={r.maal} tynn /></span>
        : <Meta>{r.gjort > 0 ? `${r.gjort} · INGEN MÅL` : "—"}</Meta>,
    },
    { key: "sist", label: "Sist registrert", mono: true, render: (r) => r.sistRegistrert },
  ];
  return <AgencyOSSkall navn={coachNavn}>
    <div className="pa-side">
      <header className="pa-pagehead">
        <div className="pa-pagehead__row">
          <div className="pa-pagehead__text">
            <span className="kicker pa-pagehead__kicker">Plan · Teknisk plan</span>
            <h1 className="pa-pagehead__title">Teknisk plan</h1>
            <p className="pa-pagehead__sub">Oppgaver per posisjon P1.0–P10.0 for hver spiller i stallen. Åpne en spiller for å se og endre planen.</p>
          </div>
          <div className="pa-pagehead__actions"><KnappLenke variant="secondary" href="/admin/plan">Plan</KnappLenke></div>
        </div>
      </header>
      {rader.length === 0
        ? <TomTilstand icon={ListChecks} title="Ingen spillere i stallen" text="Spillere du coacher, vises her med sin tekniske plan." />
        : <>
          <Meta>{rader.length} {rader.length === 1 ? "SPILLER" : "SPILLERE"} · {medPlan} MED TEKNISK PLAN</Meta>
          <Tabell columns={kolonner} rows={rader} />
        </>}
    </div>
  </AgencyOSSkall>;
}
