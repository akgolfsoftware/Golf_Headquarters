"use client";

/**
 * AG-16 Grupper i Precision Athletics (Claude Design 7d7c2994,
 * ui_kits/agencyos/screens/AG-16.jsx).
 *
 * Slår sammen to eksisterende, uendrede datakilder:
 *  - GrupperData (src/app/admin/grupper/page.tsx) — grupper, medlemstall,
 *    faste tider fra GroupSchedule.
 *  - AkStigenData (src/lib/agencyos/ak-stigen-data.ts) — AK-stigens fire
 *    trinn (Mini → Basis → Utvikling → Elite) og «ved siden av stigen»
 *    (Knøtt, WANG Toppidrett).
 *
 * Undersidene (medlemmer, faste tider, årsplan, skoledata) lever fortsatt på
 * sine egne, uendrede adresser (/admin/grupper/[id], .../timeplan,
 * .../arsplan, .../arsplan/skoledata) — se PR-teksten §Parkert. Denne
 * skjermen lenker dit i stedet for å late som funksjonen er duplisert her.
 */
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Users, ChevronRight } from "lucide-react";
import { Sidehode, TomTilstand, Ikon, KnappLenke } from "@/components/precision/pa";
import { Tabell, InlineVarsel, Kort, KortHode, type Kolonne } from "@/components/precision/pa-a5";
import type { GrupperData, GruppeV2 } from "@/components/admin/v2/GrupperV2";
import type { AkStigenData, AkStigenTrinn } from "@/lib/agencyos/ak-stigen-data";
import "@/styles/precision-a5.css";

export type AG16Tilstand = "data" | "tom";
export type AG16Props = {
  tilstand: AG16Tilstand;
  data: GrupperData;
  stigen: AkStigenData;
  nyGruppeKnapp: ReactNode;
  gfgkBootstrapKnapp: ReactNode | null;
};

function StigeTrinn({ trinn, medlemmer }: { trinn: AkStigenTrinn; medlemmer: number | null }) {
  return <div className="pa-a5-stige__trinn">
    <span className="pa-a5-stige__nr">{trinn.kode}</span>
    <span className="pa-a5-stige__navn">{trinn.navn}</span>
    <span style={{ font: "var(--type-meta)", letterSpacing: ".04em", color: "var(--text-muted)" }}>
      {trinn.alder.toUpperCase()} · {medlemmer == null ? "—" : `${medlemmer} SPILLERE`}
    </span>
  </div>;
}

function VedSidenAv({ vedSidenAv }: { vedSidenAv: AkStigenData["vedSidenAv"] }) {
  if (vedSidenAv.length === 0) return null;
  return <div style={{ borderTop: "1px solid var(--border-hairline)", paddingTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
    <span style={{ font: "var(--type-meta)", letterSpacing: ".04em", color: "var(--text-muted)" }}>VED SIDEN AV STIGEN · IKKE TRINN</span>
    <div className="pa-a5-stige">
      {vedSidenAv.map((g) => <div key={g.id} className="pa-a5-stige__trinn" style={{ cursor: "default" }}>
        <span className="pa-a5-stige__navn">{g.navn}</span>
        <span style={{ font: "var(--type-meta)", letterSpacing: ".04em", color: "var(--text-muted)" }}>{g.medlemmer} SPILLERE</span>
      </div>)}
    </div>
  </div>;
}

function GruppeTabell({ grupper }: { grupper: readonly GruppeV2[] }) {
  const router = useRouter();
  const cols: Kolonne<GruppeV2>[] = [
    { key: "navn", label: "Gruppe", render: (g) => g.navn },
    { key: "n", label: "Spillere", mono: true, align: "right", render: (g) => String(g.antallMedlemmer) },
    { key: "tid", label: "Faste tider", render: (g) => g.faste.length === 0 ? "—" : g.faste.map((f) => `${f.dag} ${f.tid}`).join(" · ") },
    { key: "neste", label: "Neste økt", mono: true, render: (g) => g.nesteOkt ?? "—" },
    { key: "aapne", label: "", render: () => <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--text-muted)" }}>Åpne<Ikon icon={ChevronRight} size={16} /></span> },
  ];
  return <Tabell caption={`Alle grupper · ${grupper.length}`} columns={cols} rows={grupper}
    onSelect={(g) => router.push(`/admin/grupper/${g.id}`)} tomTekst="Ingen grupper ennå." />;
}

export function AG16Grupper({ tilstand, data, stigen, nyGruppeKnapp, gfgkBootstrapKnapp }: AG16Props) {
  const totalt = data.grupper.reduce((s, g) => s + g.antallMedlemmer, 0);
  return <div className="pa-side">
    <Sidehode kicker="Grupper" title="Grupper" sub="AK-stigen har fire trinn. Knøtt og WANG Toppidrett er egne grupper ved siden av stigen." />
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{nyGruppeKnapp}{gfgkBootstrapKnapp}</div>
    {tilstand === "tom" ? <TomTilstand icon={Users} title="Ingen spillere i gruppene" text="Legg spillere inn fra Stall. Gruppen styrer faste tider og årsplan." actions={<KnappLenke href="/admin/spillere" variant="secondary" icon={Users}>Åpne Stall</KnappLenke>} /> : <div className="pa-a5-stack">
      <Kort>
        <KortHode tittel="AK-stigen" aside="FIRE TRINN" />
        <div className="pa-a5-stige">
          {stigen.trinn.map((t) => <StigeTrinn key={t.kode} trinn={t} medlemmer={stigen.grupper[t.gruppeNavn]?.medlemmer ?? null} />)}
        </div>
        <VedSidenAv vedSidenAv={stigen.vedSidenAv} />
        {stigen.ukartlagt.length > 0 && <InlineVarsel tone="warn" tittel="Ukartlagt">{stigen.ukartlagt.length} {stigen.ukartlagt.length === 1 ? "gruppe har" : "grupper har"} spillere uten et trinn i stigen: {stigen.ukartlagt.map((g) => g.navn).join(", ")}.</InlineVarsel>}
      </Kort>
      <GruppeTabell grupper={data.grupper} />
      <span style={{ font: "var(--type-meta)", letterSpacing: ".04em", color: "var(--text-muted)" }}>{data.grupper.length} GRUPPER · {totalt} SPILLERE TOTALT</span>
    </div>}
  </div>;
}
