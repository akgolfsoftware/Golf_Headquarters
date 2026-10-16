"use client";

/**
 * Øvelsesvelgeren i Workbench (beslutning 16.10.2026, punkt 2–5).
 * Fasit: docs/design-system/utkast-playerhq/workbench-ovelser.html (godkjent 16.10).
 *
 * Søket går mot alle øvelser brukeren har tilgang til (serverside, `sokOvelser`), med
 * forsinkelse mens det skrives. Uten søkeord står de mest brukte øverst, talt i alle
 * spillerens økter i Workbench. Pluss åpner «Ny øvelse», som lagres i Øvelsesbanken.
 *
 * Avvik:
 *   - Antallet («14× lagt inn») står under området, ikke i egen høyrekolonne: biblioteket er
 *     bare 210–248 px bredt på PC, og en egen kolonne ville presset navnet.
 *   - Raden har i tillegg «Plasser i uka» (lager ny økt fra øvelsen), som biblioteket hadde fra før.
 *   - Uten valgt økt er pluss på raden av; teksten over lista sier at en økt må velges.
 *   - Lista viser de 40 første treffene; resten nås med søk eller «Hele øvelsesbanken».
 */
import Link from "next/link";
import { useEffect, useRef, useState, useTransition, type CSSProperties, type ReactNode } from "react";
import { toast } from "sonner";
import { Check, ChevronRight, Plus, Search } from "lucide-react";
import { Ark } from "@/components/precision/pa-a4";
import { InlineVarsel } from "@/components/precision/pa-a5";
import { OvelseSkjema } from "./OvelseSkjema";
import type { PyramidArea, SourceItem, WorkbenchSession } from "@/lib/domain/workbench/types";
import { drillSourceId } from "@/lib/workbench/sources-map";
import { bruktTekst, type VelgerOvelse, type VelgerResultat } from "@/lib/workbench/ovelse-velger";
import { opprettOvelseIBank, sokOvelser } from "@/lib/workbench/ovelse-bank-actions";
import "@/styles/playerhq-ny-wb-ovelser.css";

const AKSER: readonly PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];
const VENT_MS = 250;

function merk(navn: string, q: string): ReactNode {
  const s = q.trim();
  const i = s ? navn.toLocaleLowerCase("nb-NO").indexOf(s.toLocaleLowerCase("nb-NO")) : -1;
  if (i < 0) return navn;
  return <>{navn.slice(0, i)}<mark>{navn.slice(i, i + s.length)}</mark>{navn.slice(i + s.length)}</>;
}

const akseStil = (p: PyramidArea) => ({ "--wbo-akse": `var(--axis-${p.toLowerCase()})` }) as CSSProperties;

type VelgerProps = {
  playerId: string;
  rolle: "player" | "coach";
  q: string;
  onQ: (q: string) => void;
  akse: PyramidArea | null;
  onAkse: (a: PyramidArea | null) => void;
  /** Økta pluss på raden legger øvelsen i. Null: ingen økt valgt. */
  okt: WorkbenchSession | null;
  travel: boolean;
  /** Øk tallet for å hente lista på nytt (etter at en øvelse er lagret eller lagt inn). */
  oppdatert: number;
  onLeggIOkt: (sourceId: string, ferdig: () => void) => void;
  onPlasser?: (kilde: SourceItem) => void;
  onNy: (navn: string) => void;
};

/** Henter øvelsene (med forsinkelse mens det skrives) og viser dem i `OvelseVelgerVisning`. */
export function OvelseVelger(props: VelgerProps) {
  const { playerId, q, akse, oppdatert } = props;
  const [res, setRes] = useState<VelgerResultat | null>(null);
  const [feil, setFeil] = useState<string | null>(null);
  const [nytt, setNytt] = useState(0);
  const forsok = useRef(0);

  useEffect(() => {
    const nr = ++forsok.current;
    const t = setTimeout(() => {
      sokOvelser({ playerId, q, pyramide: akse })
        .then((r) => {
          if (nr !== forsok.current) return;
          if (r.ok) { setRes(r.data); setFeil(null); } else setFeil(r.error);
        })
        .catch(() => { if (nr === forsok.current) setFeil("Øvelsene kunne ikke hentes."); });
    }, VENT_MS);
    return () => clearTimeout(t);
  }, [playerId, q, akse, oppdatert, nytt]);

  return <OvelseVelgerVisning {...props} res={res} feil={feil} onHentPaaNytt={() => setNytt((n) => n + 1)} />;
}

/** Selve velgeren, uten henting (brukes også av skjermprøven med syntetiske data). */
export function OvelseVelgerVisning({ rolle, q, onQ, akse, onAkse, okt, travel, onLeggIOkt, onPlasser, onNy, res, feil, onHentPaaNytt }:
  Omit<VelgerProps, "playerId" | "oppdatert"> & { res: VelgerResultat | null; feil: string | null; onHentPaaNytt: () => void }) {
  const [lagtInn, setLagtInn] = useState<ReadonlySet<string>>(new Set());
  const sok = q.trim();
  const leggInn = (o: VelgerOvelse) => {
    if (!okt) return;
    onLeggIOkt(drillSourceId(o.id), () => { setLagtInn((s) => new Set(s).add(`${okt.id}:${o.id}`)); onHentPaaNytt(); });
  };

  return (
    <div className="wbo" aria-label="Velg øvelse">
      <div className="wbo-sok-rad">
        <label className="wbo-sok">
          <Search className="wbo-ikon" aria-hidden />
          <span className="pa-sr">Søk i alle øvelser</span>
          <input type="search" value={q} placeholder="Søk i alle øvelser" autoComplete="off" onChange={(e) => onQ(e.target.value)} />
        </label>
        <button type="button" className="wbo-pluss" aria-label="Ny øvelse" disabled={travel} onClick={() => onNy(sok)}><Plus className="wbo-ikon" aria-hidden /></button>
      </div>
      <div className="wbo-akser" role="group" aria-label="Pyramide">
        <button type="button" aria-pressed={akse === null} onClick={() => onAkse(null)}>Alle</button>
        {AKSER.map((a) => <button key={a} type="button" data-akse={a.toLowerCase()} aria-pressed={akse === a} onClick={() => onAkse(akse === a ? null : a)}>{a}</button>)}
      </div>
      <div className="wbo-liste-topp">
        <b>{sok ? `${res?.antall ?? "—"} treff i alle øvelser` : "Mest brukt"}</b>
        <span className="wbo-kilde">{sok ? "Mest brukt først" : "Lagt inn i Workbench, alle økter"}</span>
      </div>
      {!okt && <p className="wbo-kilde">Velg en økt i kalenderen for å legge øvelser i den.</p>}

      {feil ? (
        <InlineVarsel tone="warn" tittel="Øvelsene kunne ikke hentes">{feil} <button type="button" className="pa-btn pa-btn--ghost" onClick={onHentPaaNytt}>Prøv igjen</button></InlineVarsel>
      ) : !res ? (
        <p className="wbo-kilde" role="status">Henter øvelsene …</p>
      ) : res.treff.length === 0 && sok ? (
        <div className="wbo-ingen">
          <b>Ingen øvelse heter «{sok}»</b>
          <p className="wbo-kilde">Sjekk stavemåten, eller lag den som ny øvelse.</p>
          <button type="button" className="pa-btn pa-btn--primary" disabled={travel} onClick={() => onNy(sok)}><Plus className="wbo-ikon" aria-hidden />Lag «{sok}»</button>
        </div>
      ) : res.treff.length === 0 ? (
        <div className="wbo-ingen">
          <b>{res.total === 0 ? "Ingen øvelser ennå" : "Ingen øvelser i denne aksen"}</b>
          <p className="wbo-kilde">Lag en øvelse med pluss, eller finn en i Øvelsesbanken.</p>
        </div>
      ) : (
        <ul className="wbo-liste">
          {res.treff.map((o) => {
            const inne = !!okt && lagtInn.has(`${okt.id}:${o.id}`);
            return (
              <li key={o.id} className="wbo-rad" style={akseStil(o.pyramide)}>
                <i className="wbo-stripe" aria-hidden />
                <span className="wbo-tekst">
                  <b>{merk(o.navn, sok)}{o.egen && <span className="wbo-egen">Egen</span>}</b>
                  <small>{o.pyramide} · {o.omraade ?? "—"}</small>
                  <small className="wbo-ganger">{bruktTekst(o.brukt)}{o.brukt === 0 ? " ikke brukt" : ""}</small>
                  {onPlasser && <button type="button" className="wbo-plasser" disabled={travel}
                    onClick={() => onPlasser({ id: drillSourceId(o.id), kind: "DRILL", title: o.navn, pyramid: o.pyramide, durationMinutes: o.min ?? undefined })}>Plasser i uka</button>}
                </span>
                <button type="button" className="wbo-legg" aria-pressed={inne} disabled={!okt || travel || inne}
                  aria-label={okt ? `Legg ${o.navn} i økta` : `Velg en økt for å legge ${o.navn} i den`} onClick={() => leggInn(o)}>
                  {inne ? <Check className="wbo-ikon" aria-hidden /> : <Plus className="wbo-ikon" aria-hidden />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {res && res.antall > res.treff.length && <p className="wbo-kilde">Viser {res.treff.length} av {res.antall}. Søk for å finne resten.</p>}
      <Link className="wbo-bank" href={rolle === "player" ? "/portal/drills" : "/admin/ovelser"}>
        <span><b>Hele øvelsesbanken</b><small>{res ? `${res.total} øvelser · ` : ""}filtrer på akse, område, miljø og press</small></span>
        <ChevronRight className="wbo-ikon" aria-hidden />
      </Link>
    </div>
  );
}

const klokke = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

/** Økta som planlegges og øvelsene som allerede ligger i den (toppen av «Legg til øvelse»). */
export function OktOvelser({ okt }: { okt: WorkbenchSession }) {
  const minutter = okt.drills.reduce((sum, d) => sum + d.durationMinutes, 0);
  const p = okt.pyramid.toLowerCase();
  return (
    <div className="wbo-okt" style={{ "--wbo-akse": `var(--axis-${p}-ink, var(--axis-${p}))` } as CSSProperties}>
      <div className="wbo-okt-kort"><small>{okt.pyramid}</small><b>{okt.title}</b><small>{klokke(okt.startMinute)} · {okt.durationMinutes} min{okt.location ? ` · ${okt.location}` : ""}</small></div>
      <div className="wbo-liste-topp"><b>I økta</b><span className="wbo-kilde">{okt.drills.length} {okt.drills.length === 1 ? "øvelse" : "øvelser"} · {minutter} min</span></div>
      {okt.drills.length ? <ol>{okt.drills.map((d, i) => <li key={d.id}><i>{i + 1}</i><b>{d.title}</b><span>{d.durationMinutes} min</span></li>)}</ol> : <p className="wbo-kilde">Ingen øvelser ennå.</p>}
    </div>
  );
}

/** «Ny øvelse»: de åtte trinnene, navn, beskrivelse og video. Lagres i Øvelsesbanken. */
export function NyOvelseArk({ playerId, rolle, okt, startNavn, standardPyramide, onLukk, onLagret }: {
  playerId: string;
  rolle: "player" | "coach";
  okt: WorkbenchSession | null;
  startNavn: string;
  standardPyramide: PyramidArea;
  onLukk: () => void;
  onLagret: () => void;
}) {
  const [lagrer, start] = useTransition();
  return (
    <Ark open onClose={onLukk} kicker={okt ? `Ny øvelse · ${okt.title}` : "Ny øvelse · Øvelsesbanken"} title="Ny øvelse">
      <OvelseSkjema utseende="precision" standardPyramide={standardPyramide} startTittel={startNavn} disabled={lagrer} onSubmit={() => undefined}
        bank={{
          kanLeggeIOkt: !!okt,
          synlighet: rolle === "player" ? "Lagres i Øvelsesbanken din. Du og coachen din ser den." : "Lagres i Øvelsesbanken. Alle spillerne dine ser den.",
          onLagre: (o, { videoUrl, iOkta }, ferdig) => start(async () => {
            const r = await opprettOvelseIBank({ playerId, sessionId: iOkta && okt ? okt.id : undefined, ovelse: { ...o, videoUrl } });
            if (!r.ok) { toast.error(r.error); return; }
            ferdig();
            if (r.data.feilIOkta) toast.error(`«${o.title}» er lagret i Øvelsesbanken, men ikke lagt i økta: ${r.data.feilIOkta}`);
            else toast.success(iOkta ? `«${o.title}» er lagret i Øvelsesbanken og lagt i økta.` : `«${o.title}» er lagret i Øvelsesbanken.`);
            onLagret();
          }),
        }} />
    </Ark>
  );
}
