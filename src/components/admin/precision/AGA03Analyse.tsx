/**
 * AG-A03 Gruppeanalyse (Stall › Grupper › Stats) og Etterlevelse i Precision
 * Athletics (Claude Design 7d7c2994, ui_kits/agencyos/screens/AG-A1.jsx).
 *
 * Rute: /admin/analyse (fanene spiller · stall · treningsdata · etterlevelse).
 * «Stall» og «Etterlevelse» er portert her. «Spiller» og «Treningsdata» er ikke
 * tegnet som egne skjermer i AG-A1 og vises uendret (eldre komponenter) i
 * innholdsfeltet `eldre`, inne i samme skall.
 *
 * Etterlevelse = gjennomførte minutter / planlagte minutter siste 4 uker,
 * bare forfalte økter. Mangler forfalte økter vises «—».
 * Ingen rangering: rader er alfabetiske. ACWR er ikke med (ingen målt kilde).
 */
import type { ReactNode } from "react";
import Link from "next/link";
import { Users, TrendingUp, CircleAlert } from "lucide-react";
import { Sidehode, TomTilstand, KnappLenke, Meta } from "@/components/precision/pa";
import { Tabell, InlineVarsel, Nokkelverdi, Kort } from "@/components/precision/pa-a5";
import { ANALYSE_FANER, analyseHref, type AnalyseFaneId } from "@/lib/admin/analyse/faner";
import type { GruppeAnalyseData, GruppeAnalyseRad, SpillerEtterlevelseRad } from "@/lib/admin/analyse/gruppe-analyse";
import type { InnsiktHubV2Data } from "@/components/admin/v2/InnsiktHubV2";
import "@/styles/precision-a5.css";

export type AGA03Tilstand = "data" | "tom";
export type AGA03Props = {
  tilstand: AGA03Tilstand;
  fane: AnalyseFaneId;
  hub: InnsiktHubV2Data | null;
  analyse: GruppeAnalyseData;
  /** Innhold for faner som ikke er tegnet ennå (spiller, treningsdata, trend, detalj). */
  eldre?: ReactNode;
};

const pst = (v: number | null) => (v == null ? "—" : `${v} %`);
const min = (v: number) => `${v.toLocaleString("nb-NO")} min`;

function Bar({ label, verdi, mal }: { label: string; verdi: number | null; mal: number }) {
  return <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 4, minWidth: 0 }}>
    <span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)", minWidth: 0 }}>{label}</span>
    <span style={{ font: "600 13px/1.3 var(--font-mono)" }}>{pst(verdi)}</span>
    <div style={{ gridColumn: "1 / -1", position: "relative", height: 6, borderRadius: 3, background: "var(--surface-flat)", border: "1px solid var(--border-hairline)" }} role="img" aria-label={`${label} ${pst(verdi)}, mål ${mal} %`}>
      {verdi != null && <div style={{ width: `${Math.min(100, verdi)}%`, height: "100%", borderRadius: 3, background: "var(--text-primary)" }} />}
      <span aria-hidden style={{ position: "absolute", left: `${mal}%`, top: -3, bottom: -3, width: 2, background: "var(--text-muted)" }} />
    </div>
  </div>;
}

/** Faner som valgpiller (tegning AG-A1: nav med ChoicePill, aktiv side har aria-current). */
export function Fanerad({ aktiv }: { aktiv: AnalyseFaneId | null }) {
  return <nav aria-label="Innsikt" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
    {ANALYSE_FANER.map((f) => {
      const erAktiv = f.id === aktiv;
      return <Link key={f.id} href={analyseHref(f.id)} aria-current={erAktiv ? "page" : undefined} className="pa-choice"
        style={{ minWidth: 44, textDecoration: "none", ...(erAktiv ? { background: "var(--primary)", borderColor: "var(--primary)", color: "var(--text-on-primary)" } : {}) }}>
        {f.label}
      </Link>;
    })}
  </nav>;
}

/** Sidehode og faner. Ported faner bruker tegningens tittel; øvrige faner beholder «Innsikt». */
export function AnalyseTopp({ fane, ported = true }: { fane: AnalyseFaneId | null; ported?: boolean }) {
  return <>
    <Sidehode kicker="Innsikt · Analyse av treningsdata"
      title={ported ? "Gruppeanalyse" : "Innsikt"}
      sub={ported ? "Nivå, datadekning, belastning og gjennomføring per gruppe. Ingen rangering av enkeltspillere."
        : "Referansen er spilleren selv. Kohortsammenligning er coachens verktøy og vises aldri til spiller eller forelder."} />
    <Fanerad aktiv={fane} />
  </>;
}

/** Kortoverskrift i store bokstaver (Head k=… i tegningen). */
function Overlinje({ tittel, aside }: { tittel: ReactNode; aside?: ReactNode }) {
  return <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", justifyContent: "space-between", minWidth: 0 }}>
    <span style={{ font: "var(--type-kicker)", letterSpacing: "var(--tracking-kicker)", textTransform: "uppercase", color: "var(--text-muted)", minWidth: 0, overflowWrap: "anywhere" }}>{tittel}</span>
    {aside && <span style={{ font: "var(--type-meta)", letterSpacing: ".04em", color: "var(--text-muted)" }}>{aside}</span>}
  </div>;
}

const gruppeKolonner = () => [
  { key: "navn", label: "Gruppe", render: (r: GruppeAnalyseRad) => <Link href={`/admin/grupper/${r.id}`} style={{ color: "inherit" }}>{r.navn}</Link> },
  { key: "n", label: "Spillere", mono: true, align: "right" as const, render: (r: GruppeAnalyseRad) => String(r.antallSpillere) },
  { key: "kat", label: "Kategori", mono: true, render: (r: GruppeAnalyseRad) => r.kategori ?? "—" },
  { key: "dekk", label: "Datadekning", mono: true, align: "right" as const, render: (r: GruppeAnalyseRad) => pst(r.datadekningPct) },
  /* Ingen målt ACWR-kilde på gruppenivå: «—», aldri gjetning. */
  { key: "acwr", label: "ACWR snitt", mono: true, align: "right" as const, render: () => "—" },
  { key: "etter", label: "Gjennomført", mono: true, align: "right" as const, render: (r: GruppeAnalyseRad) => pst(r.etterlevelsePct) },
  { key: "note", label: "Viktigst nå", render: () => "—" },
];

function Stall({ hub, analyse }: { hub: InnsiktHubV2Data | null; analyse: GruppeAnalyseData }) {
  return <div className="pa-a5-stack">
    <InlineVarsel tone="info" tittel="Sammenligning, ikke rangering">Tallene er gruppesnitt. Enkeltspillere vises bare for coacher med tilgang, og aldri som liste fra best til dårligst.</InlineVarsel>
    <Kort>
      <Tabell caption="Grupper" columns={gruppeKolonner()} rows={analyse.grupper} tomTekst="Ingen grupper med spillere." />
    </Kort>
    {analyse.grupper.length > 0 && <div className="pa-a5-grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,280px),1fr))" }}>
      {analyse.grupper.map((g) => <Kort key={g.id}>
        <Overlinje tittel={g.navn} aside={`${g.antallSpillere} ${g.antallSpillere === 1 ? "SPILLER" : "SPILLERE"}`} />
        <Bar label="Datadekning" verdi={g.datadekningPct} mal={80} />
        <Bar label="Gjennomført" verdi={g.etterlevelsePct} mal={85} />
        <Meta>{g.planlagtMin > 0 ? `${min(g.gjennomfortMin)} AV ${min(g.planlagtMin)}` : "INGEN FORFALTE ØKTER"}</Meta>
      </Kort>)}
    </div>}
    {hub && <div className="pa-a5-stat-grid">
      <div className="pa-a5-stat"><span className="pa-a5-stat__label">SG totalt, snitt</span><span className="pa-a5-stat__value">{hub.sgSnitt}</span><span className="pa-a5-stat__hint">RUNDER · {hub.periodeLabel.toUpperCase()}</span></div>
      <div className="pa-a5-stat"><span className="pa-a5-stat__label">Gjennomført denne uken</span><span className="pa-a5-stat__value">{hub.okterDenneUken}</span><span className="pa-a5-stat__hint">ØKTER · {hub.nSpillere} SPILLERE</span></div>
      <div className="pa-a5-stat"><span className="pa-a5-stat__label">Uten økt denne uken</span><span className="pa-a5-stat__value">{hub.udekket}</span><span className="pa-a5-stat__hint">SPILLERE</span></div>
      <div className="pa-a5-stat"><span className="pa-a5-stat__label">TrackMan-økter</span><span className="pa-a5-stat__value">{hub.trackmanOkter > 0 ? hub.trackmanOkter : "—"}</span><span className="pa-a5-stat__hint">{hub.periodeLabel.toUpperCase()}</span></div>
    </div>}
    {hub?.harKategoriData && <Kort>
      <Overlinje tittel="SG per kategori" aside={`STALLEN · ${hub.periodeLabel.toUpperCase()}`} />
      <Nokkelverdi items={hub.kategorier.map((k) => [k.label, k.verdi] as const)} />
      {hub.lekkasjeTekst && <Meta>{hub.lekkasjeTekst}</Meta>}
    </Kort>}
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <KnappLenke size="sm" variant="secondary" href="/admin/analyse?fane=stall&visning=trend" icon={TrendingUp} iconName="trending-up">Trend siste 8 uker</KnappLenke>
    </div>
  </div>;
}

function Etterlevelse({ analyse }: { analyse: GruppeAnalyseData }) {
  const spillerKolonner = [
    { key: "navn", label: "Spiller", render: (r: SpillerEtterlevelseRad) => r.navn },
    { key: "pst", label: "Gjennomført", mono: true, align: "right" as const, render: (r: SpillerEtterlevelseRad) => pst(r.etterlevelsePct) },
    { key: "min", label: "Minutter", mono: true, align: "right" as const, render: (r: SpillerEtterlevelseRad) => r.planlagtMin > 0 ? `${min(r.gjennomfortMin)} av ${min(r.planlagtMin)}` : "—" },
  ];
  return <div className="pa-a5-stack">
    <InlineVarsel tone="info" tittel="Slik regnes gjennomføring">Gjennomførte minutter delt på planlagte minutter, siste {analyse.uker} uker. Økter som ikke er forfalt teller ikke. Uten forfalte økter vises «—».</InlineVarsel>
    <div className="pa-a5-stat-grid">
      <div className="pa-a5-stat"><span className="pa-a5-stat__label">Stallen samlet</span><span className="pa-a5-stat__value">{pst(analyse.samlet.etterlevelsePct)}</span><span className="pa-a5-stat__hint">{analyse.samlet.antallSpillere} SPILLERE · {analyse.uker} UKER</span></div>
    </div>
    <Kort>
      <Tabell caption="Per gruppe" columns={gruppeKolonner()} rows={analyse.grupper} tomTekst="Ingen grupper med spillere." />
    </Kort>
    <Kort>
      <Tabell caption="Per spiller" columns={spillerKolonner} rows={analyse.spillere} tomTekst="Ingen spillere." />
    </Kort>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <KnappLenke size="sm" variant="secondary" href="/admin/analyse?fane=etterlevelse&visning=detalj" icon={CircleAlert} iconName="circle-alert">Spillerpanel og øvelser</KnappLenke>
    </div>
  </div>;
}

export function AGA03Analyse({ tilstand, fane, hub, analyse, eldre }: AGA03Props) {
  const ported = eldre == null;
  return <div className="pa-side">
    <AnalyseTopp fane={fane} ported={ported} />
    {!ported ? <div style={{ minWidth: 0 }}>{eldre}</div>
      : tilstand === "tom" ? <TomTilstand icon={Users} title="Ingen grupper med data" text="Legg spillere i en gruppe for å se gruppeanalysen." actions={<KnappLenke href="/admin/grupper" variant="secondary" icon={Users} iconName="users">Åpne grupper</KnappLenke>} />
      : fane === "etterlevelse" ? <Etterlevelse analyse={analyse} /> : <Stall hub={hub} analyse={analyse} />}
  </div>;
}
