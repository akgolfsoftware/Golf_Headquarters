"use client";

/**
 * AG-16 Grupper i Precision Athletics (Claude Design 7d7c2994,
 * ui_kits/agencyos/screens/AG-mer.jsx, runde 30 — den tegningen vinner over
 * den eldre AG-16.jsx fordi screen.html laster den sist).
 *
 * Data uendret fra src/app/admin/grupper/page.tsx (GrupperData: grupper,
 * medlemstall, faste tider fra GroupSchedule, neste økt). Tegningens
 * medlemsliste med navn, «Legg til spillere»-ark og «Tildelt gruppa» har
 * ingen data i denne laster — de bor på gruppesiden (/admin/grupper/[id]) og
 * er parkert her, se PR-teksten. Skjermen lenker til undersidene i stedet for
 * å late som funksjonen er duplisert: gruppe, Workbench, timeplan og årsplan.
 */
import { useState, type ReactNode } from "react";
import { Users, ArrowRight, Layers, CalendarDays, CalendarRange } from "lucide-react";
import { Sidehode, TomTilstand, KnappLenke, Meta } from "@/components/precision/pa";
import type { GrupperData, GruppeV2 } from "@/components/admin/v2/GrupperV2";
import "@/styles/precision-a5.css";

export type AG16Tilstand = "data" | "tom";
export type AG16Props = {
  tilstand: AG16Tilstand;
  data: GrupperData;
  nyGruppeKnapp: ReactNode;
  gfgkBootstrapKnapp: ReactNode | null;
};

function Seksjon({ k, meta, children }: { k: string; meta?: string; children: ReactNode }) {
  return <section aria-label={k} className="pa-card" style={{ padding: 16, gap: 8, minWidth: 0 }}>
    <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
      <span className="kicker" style={{ flex: "1 1 auto", minWidth: 0 }}>{k}</span>
      {meta && <Meta>{meta}</Meta>}
    </div>
    {children}
  </section>;
}

function Rad({ a, b, forste }: { a: string; b: ReactNode; forste?: boolean }) {
  return <div role="listitem" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,auto)", gap: 12, alignItems: "center", minHeight: 52, borderTop: forste ? "none" : "1px solid var(--border-hairline)", padding: "6px 0", minWidth: 0 }}>
    <span style={{ font: "500 14px/1.3 var(--font-sans)", color: "var(--text-primary)", minWidth: 0 }}>{a}</span>
    <span style={{ font: "600 13px/1.3 var(--font-mono)", color: "var(--text-primary)", textAlign: "right", overflowWrap: "anywhere", minWidth: 0 }}>{b}</span>
  </div>;
}

const spillere = (n: number) => `${n} ${n === 1 ? "SPILLER" : "SPILLERE"}`;

function GruppeValgt({ g }: { g: GruppeV2 }) {
  const medlemmer = <Seksjon k={`Medlemmer · ${g.navn}`} meta={spillere(g.antallMedlemmer)}>
    <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)", textWrap: "pretty" }}>
      {g.antallMedlemmer === 0 ? "Ingen medlemmer ennå. Legg til spillere på gruppesiden." : "Medlemslisten og innmelding ligger på gruppesiden."}
    </p>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <KnappLenke size="sm" href={`/admin/grupper/${g.id}`} icon={Users} iconName="users">Åpne gruppen</KnappLenke>
    </div>
  </Seksjon>;
  const plan = <Seksjon k="Timeplan og årsplan" meta="GRUPPEPLAN I WORKBENCH">
    <div role="list">
      <Rad forste a="Faste tider" b={g.faste.length === 0 ? "—" : g.faste.map((f) => `${f.dag} ${f.tid}`).join(" · ")} />
      <Rad a="Neste økt" b={g.nesteOkt ?? "—"} />
    </div>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <KnappLenke size="sm" variant="secondary" href={`/admin/grupper/${g.id}/workbench`} icon={Layers} iconName="layers" iconRight={ArrowRight}>Åpne gruppeplanen i Workbench</KnappLenke>
      <KnappLenke size="sm" variant="ghost" href={`/admin/grupper/${g.id}/timeplan`} icon={CalendarDays} iconName="calendar-days">Timeplan</KnappLenke>
      <KnappLenke size="sm" variant="ghost" href={`/admin/grupper/${g.id}/arsplan`} icon={CalendarRange} iconName="calendar-range">Årsplan</KnappLenke>
    </div>
  </Seksjon>;
  return <div className="pa-a5-grid pa-a5-grid--2">
    <div className="pa-a5-stack">{medlemmer}</div>
    <div className="pa-a5-stack">{plan}</div>
  </div>;
}

export function AG16Grupper({ tilstand, data, nyGruppeKnapp, gfgkBootstrapKnapp }: AG16Props) {
  const [valgtId, setValgtId] = useState<string | null>(data.grupper[0]?.id ?? null);
  const valgt = data.grupper.find((g) => g.id === valgtId) ?? data.grupper[0] ?? null;
  const totalt = data.grupper.reduce((s, g) => s + g.antallMedlemmer, 0);
  return <div className="pa-side">
    <Sidehode kicker="Mer · Grupper" title="Grupper" />
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{nyGruppeKnapp}{gfgkBootstrapKnapp}</div>
    {tilstand === "tom" || !valgt ? <TomTilstand icon={Users} title="Ingen grupper ennå" text="Lag en gruppe og legg inn spillere. Gruppen styrer faste tider og årsplan." actions={<KnappLenke href="/admin/spillere" variant="secondary" icon={Users}>Åpne Stall</KnappLenke>} /> : <div className="pa-a5-stack">
      <div role="group" aria-label="Velg gruppe" style={{ display: "flex", gap: 8, flexWrap: "wrap", minWidth: 0 }}>
        {data.grupper.map((g) => <button key={g.id} type="button" aria-pressed={g.id === valgt.id} className="pa-choice pa-a5-choice" title={g.navn} onClick={() => setValgtId(g.id)}><span className="pa-a5-choice__tekst">{`${g.navn} · ${g.antallMedlemmer}`}</span></button>)}
      </div>
      <GruppeValgt g={valgt} />
      <Meta>{data.grupper.length} GRUPPER · {totalt} SPILLERE TOTALT</Meta>
    </div>}
  </div>;
}
