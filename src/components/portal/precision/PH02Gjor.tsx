"use client";

/**
 * PH-02 Gjør nå — Precision Athletics (7d7c2994).
 * Tegningen ui_kits/playerhq/screens/PH-02.jsx ligger ikke i git.
 *
 * Bevarer markering, runde-innganger og fysisk logging. Oppgaver fra coach
 * finnes ikke som egen liste i denne datamodellen.
 */
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { CalendarRange, CircleAlert, Flag, List, Play, Upload } from "lucide-react";
import { AkseMerke, FeilTilstand, Knapp, KnappLenke, Meta, Sidehode, StatusPille, Tall, TomTilstand, type Akse } from "@/components/precision/pa";
import { markerOktStatus } from "@/lib/portal-gjennomfore/okt-status-actions";
import { formaterVarighet } from "@/lib/format-tall";
import type { GjennomforeData, GjennomforeOkt } from "@/lib/portal-gjennomfore/gjennomfore-data";
import { FortsettRundeCta } from "@/components/portal/runde-logg/fortsett-runde-cta";

const AKSE: Record<string, Akse> = { FYS: "fys", TEK: "tek", SLAG: "slag", SPILL: "spill", TURN: "turn" };
const LAGRET: Record<string, string> = { trening: "Treningsøkten er lagret." };

export function PH02Gjor({ data, tilstand = "data" }: { data: GjennomforeData; tilstand?: "data" | "feil" }) {
  const router = useRouter();
  const lagret = LAGRET[useSearchParams().get("lagret") ?? ""];
  const { antall, totalMin, nesteOkt, resteAvDagen, fullfortIdag } = data;
  const [pending, start] = useTransition();
  const [aktivId, setAktivId] = useState<string | null>(null);
  const live = nesteOkt?.status === "now";
  const prosent = antall > 0 ? Math.round((fullfortIdag.length / antall) * 100) : 0;

  function marker(o: { id: string; kilde: "v2" | "plan" }, status: "COMPLETED" | "SKIPPED") {
    setAktivId(o.id);
    start(async () => {
      await markerOktStatus({ id: o.id, kilde: o.kilde, status });
      router.refresh();
    });
  }

  return <div className="pa-side ph02">
    <Sidehode kicker={data.datoTekst || "I dag"} title="Gjør nå" sub={antall === 0 ? "Ingen økter i dag." : `${fullfortIdag.length} av ${antall} fullført · ${formaterVarighet(totalMin)} planlagt`} />
    {tilstand === "feil" ? <FeilTilstand icon={CircleAlert} title="Kunne ikke hente dagens økter" text="Ingenting er endret. Prøv igjen." code="FEIL · GJØR" retry={<Knapp variant="secondary" onClick={() => router.refresh()}>Prøv igjen</Knapp>} /> : <>
      {lagret && <p role="status" className="ph02-lagret"><StatusPille tone="ok">Lagret</StatusPille> {lagret}</p>}
      <div className="ph02-tall">
        <TallKort label="Økter" verdi={antall === 0 ? "0" : String(antall)} />
        <TallKort label="Tid" verdi={antall === 0 ? "—" : formaterVarighet(totalMin)} />
        <TallKort label="Fullført" verdi={antall === 0 ? "Hvile" : `${fullfortIdag.length}/${antall}`} />
      </div>
      {antall === 0 ? <>
        <TomTilstand icon={CalendarRange} title="Ingen økter i dag" text="Nyt hviledagen, eller planlegg fra Workbench." actions={<KnappLenke href="/portal/planlegge/workbench?zoom=uke">Åpne Workbench</KnappLenke>} />
        <KnappLenke variant="ghost" href="/portal/analysere">Se form og finn fokus</KnappLenke>
        <Annet />
      </> : <>
        <div className="ph10-fremdrift" aria-label="Dagens gjennomføring">
          <div><span>Dagens gjennomføring</span><Tall>{prosent} %</Tall></div>
          <div className="ph10-spor" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={prosent}><span style={{ width: `${prosent}%` }} /></div>
        </div>
        {nesteOkt && <KnappLenke href={nesteOkt.href} icon={Play} iconName="play" fullWidth size="lg">{live ? "Fortsett økt" : "Start økt"}</KnappLenke>}
        <div className="ph02-brett">
          <div className="ph02-hoved">
            {nesteOkt && <section className="pa-card ph02-kort" aria-label={live ? "Aktiv økt" : "Neste økt"}>
              <Meta>{live ? "Aktiv økt" : "Neste økt"}</Meta>
              <h2>{nesteOkt.tittel}</h2>
              <p className="ph02-meta"><Tall>{nesteOkt.varighet}</Tall> min · {nesteOkt.sted} · {nesteOkt.coachNavn}</p>
              <div className="ph02-merker">
                <AkseMerke axis={AKSE[nesteOkt.pyramidArea] ?? "tek"} />
                <StatusPille tone={live ? "live" : "neutral"}>{live ? `Live · kl ${nesteOkt.tid}` : nesteOkt.relTidTekst}</StatusPille>
              </div>
              <Marker o={nesteOkt} pending={pending && aktivId === nesteOkt.id} onMarker={marker} />
              <KnappLenke variant="ghost" href={`${nesteOkt.href}?logg=1`}>Avslutt og send</KnappLenke>
              <Ovelser o={nesteOkt} />
            </section>}
            {resteAvDagen.length > 0 && <section className="pa-card ph02-kort" aria-label="Resten av dagen">
              <Meta>Resten av dagen · {resteAvDagen.length}</Meta>
              {resteAvDagen.map((o) => <OktRad key={o.id} o={o} pending={pending && aktivId === o.id} onMarker={marker} onOpen={() => router.push(o.href)} />)}
            </section>}
            {fullfortIdag.length > 0 && <section className="pa-card ph02-kort" aria-label="Fullført i dag">
              <Meta>Fullført i dag · {fullfortIdag.length}</Meta>
              {fullfortIdag.map((o) => <button type="button" key={o.id} className="ph02-radknapp ph02-radknapp--full" onClick={() => router.push(o.trengerLogg ? `${o.href}?logg=1` : o.href)}>
                <span><strong>{o.tittel}</strong><Meta>{o.tid} · {o.varighet} min</Meta></span>
                <StatusPille tone={o.trengerLogg ? "warn" : "ok"}>{o.trengerLogg ? "Trenger logg" : "Logget"}</StatusPille>
              </button>)}
            </section>}
          </div>
          <Annet />
        </div>
      </>}
    </>}
  </div>;
}

function Annet() {
  return <section className="pa-card ph02-kort" aria-label="Annet i dag">
    <Meta>Annet i dag</Meta>
    <FortsettRundeCta />
    <KnappLenke variant="ghost" href="/portal/runde/live" icon={Flag} iconName="flag">Før runde slag for slag</KnappLenke>
    <KnappLenke variant="ghost" href="/portal/runde/logg" icon={List} iconName="list">Logg tidligere runde</KnappLenke>
    <KnappLenke variant="ghost" href="/portal/mal/runder/ny" icon={Upload} iconName="upload">Hurtig score eller importer runde</KnappLenke>
    <KnappLenke variant="ghost" href="/portal/fysisk">Logg fysisk økt</KnappLenke>
  </section>;
}

function TallKort({ label, verdi }: { label: string; verdi: string }) {
  return <div className="pa-card ph02-tallkort"><Meta>{label}</Meta><Tall>{verdi}</Tall></div>;
}

function Marker({ o, pending, onMarker }: { o: GjennomforeOkt; pending: boolean; onMarker: (o: GjennomforeOkt, status: "COMPLETED" | "SKIPPED") => void }) {
  return <div className="ph02-marker">
    <Knapp variant="secondary" disabled={pending} loading={pending} loadingText="Lagrer …" onClick={() => onMarker(o, "COMPLETED")}>Gjort</Knapp>
    <Knapp variant="ghost" disabled={pending} onClick={() => onMarker(o, "SKIPPED")}>Hopp over</Knapp>
  </div>;
}

function Ovelser({ o }: { o: GjennomforeOkt }) {
  return <div>
    <Meta>Øvelser · {o.antallDrills}</Meta>
    {o.drillNavn.length === 0 ? <p className="ph02-meta">Ingen øvelser lagt til. Coachen legger dem i Workbench.</p> : <ol className="ph02-ovelser">{o.drillNavn.map((navn, i) => <li key={`${o.id}-${i}`}>{navn}</li>)}</ol>}
  </div>;
}

function OktRad({ o, pending, onMarker, onOpen }: { o: GjennomforeOkt; pending: boolean; onMarker: (o: GjennomforeOkt, status: "COMPLETED" | "SKIPPED") => void; onOpen: () => void }) {
  return <div className="ph02-rad">
    <button type="button" className="ph02-radknapp" onClick={onOpen}>
      <Meta>{o.tid}</Meta>
      <strong>{o.tittel}</strong>
      <span className="ph02-meta">{o.meta}</span>
    </button>
    <AkseMerke axis={AKSE[o.pyramidArea] ?? "tek"} size="sm" />
    <Marker o={o} pending={pending} onMarker={onMarker} />
  </div>;
}
