/**
 * AG-19 Jarvis › én agent i nytt design — /admin/agents/[agentId].
 * Erstatter AgenticosRamme + AdminAgenticosRunDetalj (Train-lock AO-04).
 * Samme data (AgentDetaljData). Viser i tillegg tellerne, forslagene og
 * godkjenningsraten som siden alt regnet ut, men den gamle visningen ikke viste.
 * Manuell kjøring (plan-revisjon, peaking) bruker AgentRunPanel som før.
 */
import Link from "next/link";
import { KnappLenke, Pille, Seksjon, Tom, Varsel } from "@/components/admin/agencyos-ny/ny";
import { AgentRunPanel } from "@/app/admin/agents/[agentId]/agent-run-panel";
import type { AgentDetaljData } from "@/lib/agencyos/agent-detalj-typer";
import "@/styles/agencyos-ny-mer.css";

const STATUS: Record<AgentDetaljData["statusBadge"], string> = { aktiv: "Aktiv", beta: "Beta", planlagt: "Planlagt" };
const TONE = { warn: "vent", up: "ok", info: "noy" } as const;

export function AG19AgentDetalj({ data }: { data: AgentDetaljData }) {
  const venter = data.forslag.filter((f) => f.pending);
  const feilet = data.tilstand === "feilet";

  return (
    <>
      {feilet && data.feil && (
        <Varsel tone="advarsel" tittel={`${data.navn} svarer ikke`}>
          {data.feil.melding ?? "Siste kjøring feilet."} {data.feil.naarTekst}. {data.feil.sidenTekst}.
        </Varsel>
      )}

      <div className="knapper">
        {venter[0] && <KnappLenke variant="pri" href={`/admin/agenticos/godkjenn?sak=${venter[0].id}`}>Godkjenn resultat</KnappLenke>}
        <KnappLenke href={data.godkjenningerHref}>Åpne godkjenninger</KnappLenke>
        {feilet && <KnappLenke variant="spok" href={data.feilloggHref}>Feilloggen</KnappLenke>}
      </div>

      <div className="teller-rad">
        <div className="teller"><span className="e">Kjøringer · 30 d</span><b className="t">{data.kpi.kjoringer30d}</b><span className="s">{data.kpi.kjoringerSub}</span></div>
        <div className="teller"><span className="e">Snittid</span><b className="t">{data.kpi.snittTidTekst}</b></div>
        <div className="teller"><span className="e">Forslag</span><b className="t">{data.kpi.forslagLaget}</b><span className="s">{data.kpi.forslagSub}</span></div>
        <div className={venter.length > 0 ? "teller signal" : "teller"}><span className="e">Eldste i kø</span><b className="t">{data.panel.eldsteIKoTekst}</b><span className="s">{data.panel.eldsteSub}</span></div>
      </div>

      <div className="to-del bred-v">
        <div>
          <Seksjon tittel="Siste kjøring" kilde={data.sisteSteg?.naarTekst}>
            {data.sisteSteg ? (
              <div className="kort rader">
                {data.sisteSteg.steg.map((s, i) => (
                  <div key={`${s.rolle}-${i}`} className="mer-rad">
                    <span className="mono kilde">{s.rolle}</span>
                    <span style={{ overflowWrap: "anywhere" }}>{s.tekst}</span>
                    <span className="hoyre">{s.ok ? <Pille tone="ok">OK</Pille> : <Pille tone="feil">Feil</Pille>}</span>
                  </div>
                ))}
              </div>
            ) : <Tom tittel="Ingen kjøring ennå" tekst="Agenten har ikke kjørt i vinduet." />}
            <p className="kilde">Resultatet legges i godkjenningene. Ingenting lagres i plan eller bibliotek før du godkjenner.</p>
          </Seksjon>

          {data.manuell && (
            <Seksjon tittel="Kjør manuelt">
              <AgentRunPanel agentId={data.agentId} plans={data.manuell.plans} players={data.manuell.players} tournaments={data.manuell.tournaments} />
            </Seksjon>
          )}

          <Seksjon tittel={`Forslag · ${data.forslag.length}`}>
            {data.forslag.length === 0 ? <Tom tittel="Ingen forslag ennå" /> : (
              <div className="kort rader">
                {data.forslag.map((f) => (
                  <div key={f.id} className="mer-rad">
                    <span className="mono kilde">{f.naar}</span>
                    <span>
                      <b>{f.actionTypeLabel} · <Link href={`/admin/spillere/${f.playerId}`} style={{ color: "inherit" }}>{f.brukerNavn}</Link></b>
                      {f.forklaring && <span className="kilde" style={{ overflowWrap: "anywhere" }}>{f.forklaring}</span>}
                    </span>
                    <span className="hoyre"><Pille tone={TONE[f.tone]}>{f.statusLabel}</Pille></span>
                  </div>
                ))}
              </div>
            )}
          </Seksjon>
        </div>

        <div>
          <Seksjon tittel="Om agenten" hoyre={<Pille tone={data.statusBadge === "aktiv" ? "ok" : "noy"}>{STATUS[data.statusBadge]}</Pille>}>
            <div className="kort" style={{ display: "grid", gap: 10 }}>
              <p className="forklar">{data.beskrivelse}</p>
              <dl className="nv">
                <div><dt>Starter</dt><dd>{data.trigger}</dd></div>
                <div><dt>Godkjent</dt><dd>{data.panel.godkjentRateTekst}<span className="kilde"> {data.panel.godkjentSub}</span></dd></div>
              </dl>
            </div>
          </Seksjon>

          <Seksjon tittel="Kjøringer" kilde={data.kjoringerVindusTekst}>
            {data.kjoringer.length === 0 ? <Tom tittel="Ingen kjøringer i vinduet" /> : (
              <div className="kort rader">
                {data.kjoringer.map((k) => (
                  <div key={k.id} className="mer-rad">
                    <span className="mono kilde">{k.naar}</span>
                    <span><b>{k.ok ? "Fullført" : "Feil"}</b>{k.outputTekst && <span className="kilde" style={{ overflowWrap: "anywhere" }}>{k.outputTekst}</span>}</span>
                    <span className="hoyre mono kilde">{k.varighetTekst}</span>
                  </div>
                ))}
              </div>
            )}
          </Seksjon>
        </div>
      </div>
    </>
  );
}
