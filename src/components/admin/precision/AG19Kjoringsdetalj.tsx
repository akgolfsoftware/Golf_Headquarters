"use client";

/**
 * AG-19 Kjøringsdetalj i Precision Athletics — porting av /admin/agents/[agentId].
 * Tegning: 7d7c2994 · ui_kits/agencyos/screens/AG-19.jsx («Kjøringsdetalj»,
 * fane Kø). Tegningen viser én kjøring; koden viser én agent med siste
 * kjøring, forslag i kø og kjøringene siste 30 dager (avvik, se PR).
 *
 * Alt er uendret fra dagens loader: samme tall, samme manuelle kjøring
 * (AgentRunPanel), samme lenker til godkjenn-køen. Jarvis sender ingenting.
 */
import { ArrowLeft } from "lucide-react";
import { Sidehode, KnappLenke, StatusPille, Meta } from "@/components/precision/pa";
import { Kolonner, Stabel, Nokkelverdi } from "@/components/precision/pa-a4";
import { InlineVarsel, KortHode, Kort } from "@/components/precision/pa-a5";
import { AgentRunPanel } from "@/app/admin/agents/[agentId]/agent-run-panel";
import type { AgentDetaljData } from "@/components/admin/v2/AdminAgentDetaljV2";
import "@/styles/precision-a5.css";

const tilstandTekst = { aktiv: "Aktiv", feilet: "Feilet", manuell: "Manuell", ingen: "Ingen kjøring ennå" } as const;

export function AG19Kjoringsdetalj({ data }: { data: AgentDetaljData }) {
  const venter = data.forslag.filter((f) => f.pending);
  const feilet = data.tilstand === "feilet";
  return <div className="pa-side" style={{ maxWidth: 1200 }}>
    <Sidehode kicker="Jarvis · agent" title={data.navn} sub={data.beskrivelse} />
    <Stabel gap={16}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <KnappLenke variant="ghost" size="sm" href={data.agentDetaljHref} icon={ArrowLeft} iconName="arrow-left">Tilbake til Jarvis</KnappLenke>
        <StatusPille tone={feilet ? "warn" : data.tilstand === "aktiv" ? "ok" : "neutral"}>{tilstandTekst[data.tilstand]}</StatusPille>
        <Meta>{data.trigger.toUpperCase()}</Meta>
      </div>

      {feilet && data.feil && <InlineVarsel tone="warn" tittel={`${data.navn} svarer ikke.`}>
        {data.feil.melding ?? "Siste kjøring feilet."} {data.feil.naarTekst}. {data.feil.sidenTekst}.
      </InlineVarsel>}

      <Kolonner mal="repeat(auto-fit, minmax(min(100%, 340px), 1fr))" gap={16}>
        <Kort style={{ minWidth: 0 }}>
          <KortHode tittel="Siste kjøring" aside={data.sisteSteg?.naarTekst} />
          {data.sisteSteg ? <div>
            {data.sisteSteg.steg.map((s, i) => <div key={`${s.rolle}-${i}`} style={{ display: "grid", gridTemplateColumns: "72px minmax(0,1fr)", gap: 10, padding: "8px 0", borderTop: i ? "1px solid var(--border-hairline)" : "none" }}>
              <Meta>{s.rolle}</Meta>
              <span style={{ font: "var(--type-body-s)", overflowWrap: "anywhere", minWidth: 0, color: s.ok ? "var(--text-primary)" : "var(--text-secondary)" }}>{s.tekst}</span>
            </div>)}
          </div> : <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>Ingen kjøring i vinduet ennå.</p>}
          <Meta>JARVIS SENDER OG ENDRER INGENTING SELV. RESULTATET LIGGER I GODKJENN-KØEN.</Meta>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {venter[0] && <KnappLenke href={`/admin/ko?fane=agentgodkjenn&sak=${venter[0].id}`}>Se og godkjenn</KnappLenke>}
            <KnappLenke variant="secondary" href={data.godkjenningerHref}>Godkjenninger</KnappLenke>
            <KnappLenke variant="ghost" href={data.feilloggHref}>Feillogg</KnappLenke>
          </div>
        </Kort>

        <Kort style={{ minWidth: 0 }}>
          <KortHode tittel="Tall" aside={data.kjoringerVindusTekst.toUpperCase()} />
          <Nokkelverdi items={[
            ["Kjøringer", `${data.kpi.kjoringer30d} · ${data.kpi.kjoringerSub}`, { mono: true }],
            ["Snitt varighet", data.kpi.snittTidTekst, { mono: true }],
            ["Forslag laget", `${data.kpi.forslagLaget} · ${data.kpi.forslagSub}`, { mono: true }],
            ["Godkjent-rate", `${data.panel.godkjentRateTekst} · ${data.panel.godkjentSub}`, { mono: true }],
            ["Eldste i køen", `${data.panel.eldsteIKoTekst} · ${data.panel.eldsteSub}`, { mono: true }],
          ]} />
        </Kort>
      </Kolonner>

      {data.manuell && <AgentRunPanel agentId={data.agentId} plans={data.manuell.plans} players={data.manuell.players} tournaments={data.manuell.tournaments} />}

      <Kort style={{ minWidth: 0 }}>
        <KortHode tittel="Forslag" aside={`${venter.length} VENTER`} />
        {data.forslag.length === 0 ? <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>Ingen forslag fra denne agenten ennå.</p>
          : <div>{data.forslag.map((f, i) => <div key={f.id} style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", padding: "10px 0", borderTop: i ? "1px solid var(--border-hairline)" : "none", minWidth: 0 }}>
            <span style={{ flex: "1 1 220px", minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ font: "500 14px/1.3 var(--font-sans)", overflowWrap: "anywhere" }}>{f.actionTypeLabel} · {f.brukerNavn}</span>
              {f.forklaring && <span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)", overflowWrap: "anywhere" }}>{f.forklaring}</span>}
              <Meta>{f.naar}</Meta>
            </span>
            <StatusPille tone={f.pending ? "neutral" : f.tone === "up" ? "ok" : "neutral"}>{f.statusLabel}</StatusPille>
          </div>)}</div>}
      </Kort>

      <Kort style={{ minWidth: 0 }}>
        <KortHode tittel="Siste kjøringer" aside={data.kjoringerVindusTekst.toUpperCase()} />
        {data.kjoringer.length === 0 ? <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>Ingen kjøringer i vinduet.</p>
          : <div>{data.kjoringer.map((k, i) => <div key={k.id} style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", padding: "10px 0", borderTop: i ? "1px solid var(--border-hairline)" : "none", minWidth: 0 }}>
            <span style={{ flex: "1 1 220px", minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
              <Meta>{k.naar} · {k.varighetTekst}</Meta>
              {k.outputTekst && <span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)", overflowWrap: "anywhere" }}>{k.outputTekst}</span>}
            </span>
            <StatusPille tone={k.ok ? "ok" : "warn"}>{k.ok ? "Fullført" : "Feilet"}</StatusPille>
          </div>)}</div>}
      </Kort>
    </Stabel>
  </div>;
}
