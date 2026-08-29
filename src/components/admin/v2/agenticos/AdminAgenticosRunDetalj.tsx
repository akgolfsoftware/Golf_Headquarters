"use client";

/**
 * AO-04 Run-detalj. AgentRun er ferdig (OK|ERROR) — ingen falsk progresjon.
 * Godkjenn resultat er hvit primær når et forslag venter.
 */

import { TL } from "@/lib/v2/train-lock";
import { AgentRunPanel } from "@/app/admin/agents/[agentId]/agent-run-panel";
import type { AgentDetaljData } from "@/components/admin/v2/AdminAgentDetaljV2";
import { AoCaps, AoFeilKort, AoKnapp, AoKort, AoPrikk, AoRad, AoTittel, AoWarmHake } from "./tl-agenticos";

export function AdminAgenticosRunDetalj({ data }: { data: AgentDetaljData }) {
  const venter = data.forslag.filter((f) => f.pending);
  const siste = data.kjoringer[0] ?? null;
  const feilet = data.tilstand === "feilet";

  return (
    <div data-screen-label="AO-04 Run-detalj" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {feilet && data.feil ? (
        <AoFeilKort
          tittel={`${data.navn} svarer ikke`}
          tekst={data.feil.melding ?? "Siste kjøring feilet. Tidligere forslag står i køen — ingenting er mistet."}
          primaer={
            <AoKnapp variant={venter[0] ? undefined : "primaer"} href={data.godkjenningerHref}>
              Åpne godkjenn-kø
            </AoKnapp>
          }
          sekundaer={<AoKnapp href="/admin/agenticos">Tilbake til cockpit</AoKnapp>}
        />
      ) : null}

      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        {siste && siste.ok ? <AoWarmHake /> : <AoPrikk color={feilet ? TL.danger : TL.viz.target} />}
        <AoTittel size={20}>{data.navn}</AoTittel>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>
          {data.trigger}
          {siste ? ` · ${siste.naar}` : ""}
        </span>
      </div>

      <p style={{ margin: 0, fontSize: 13, color: TL.mute, lineHeight: 1.55 }}>{data.beskrivelse}</p>

      {data.sisteSteg ? (
        <AoKort pad="14px 16px" radius={14} style={{ gap: 8, fontSize: 12, fontVariantNumeric: "tabular-nums", lineHeight: 1.6 }}>
          {data.sisteSteg.steg.map((s, i) => (
            <div key={`${s.rolle}-${i}`} style={{ display: "flex", gap: 12, color: TL.mute }}>
              <span style={{ flexShrink: 0, color: TL.mute }}>{s.rolle}</span>
              <span style={{ color: s.ok ? TL.text : TL.warn }}>{s.tekst}</span>
            </div>
          ))}
        </AoKort>
      ) : (
        <AoKort pad="14px 16px" radius={14}>
          <p style={{ margin: 0, fontSize: 13, color: TL.mute }}>Ingen kjøring i vinduet ennå.</p>
        </AoKort>
      )}

      <p style={{ margin: 0, fontSize: 12, color: TL.mute, lineHeight: 1.6 }}>
        Resultatet legges i godkjenn-køen. Ingenting lagres i plan eller bibliotek før du godkjenner.
      </p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {venter[0] ? (
          <AoKnapp variant="primaer" href={`/admin/agenticos/godkjenn?sak=${venter[0].id}`}>
            Godkjenn resultat
          </AoKnapp>
        ) : null}
        <AoKnapp href="/admin/agenticos">Cockpit</AoKnapp>
      </div>

      {data.manuell ? (
        <div style={{ marginTop: 8 }}>
          <AoCaps>Kjør manuelt</AoCaps>
          <div style={{ marginTop: 10 }}>
            <AgentRunPanel
              agentId={data.agentId}
              plans={data.manuell.plans}
              players={data.manuell.players}
              tournaments={data.manuell.tournaments}
            />
          </div>
        </div>
      ) : null}

      <div>
        <AoCaps>Siste kjøringer · {data.kjoringerVindusTekst}</AoCaps>
        {data.kjoringer.length === 0 ? (
          <p style={{ margin: "10px 0 0", fontSize: 13, color: TL.mute }}>Ingen kjøringer i vinduet.</p>
        ) : (
          data.kjoringer.map((k, i) => (
            <AoRad key={k.id} last={i === data.kjoringer.length - 1}>
              {k.ok ? <AoWarmHake /> : <AoPrikk color={TL.danger} />}
              <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: TL.text }}>{k.ok ? "Fullført" : "Feil"}</span>
              <span style={{ fontSize: 11, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>
                {k.naar} · {k.varighetTekst}
              </span>
            </AoRad>
          ))
        )}
      </div>
    </div>
  );
}
