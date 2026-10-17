"use client";

/**
 * AG-12 Øktark etter live i nytt design (pakke 5).
 * Fasit: docs/design-system/utkast-agencyos/live.html, skjerm «AG-12 Øktark».
 * Rute: /admin/gjennomfore/okter/[id] (id er bookingen). Stil: agencyos-ny-live.css.
 *
 * Som før (actions.ts): status fra tid, start økt / åpne live-økta (startOkt),
 * avlys med bekreftelse (kansellerBooking), flytt via bookinger. Fra live-økta
 * (lastLiveOktData): øvelsene med logget-status, sammendraget fra opptaket som
 * utkast til coachen, fokuspunktet og vurderingen.
 *
 * Avvik fra utkastet, fordi appen ikke har det:
 *   - «Godkjenn og send til spilleren» finnes ikke som handling. Knappen vises
 *     sperret med forklaring; utkastet kan ikke sendes herfra.
 *   - TrackMan fra økta og «Bruk som startverdi»: ingen TrackMan-data er knyttet
 *     til økta. Tabellen viser «—».
 *   - Hjemmelekse i planen: ingen kobling fra økta til en økt i Workbench.
 *   - Filer fra økta: bare opptaket er registrert.
 *   - Avlys er rust i dialogen (en dialog er egen flate, §SLETTEDIALOG KAN VÆRE RUST).
 */
import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Lock, Mic, Sparkles } from "lucide-react";
import { Pille } from "@/components/admin/agencyos-ny/ny";
import { kansellerBooking, startOkt } from "@/app/admin/gjennomfore/okter/[id]/actions";
import type { OktarkData, OktarkStatus } from "./AG12Oktark";
import "@/styles/agencyos-ny-live.css";

const STATUS: Record<OktarkStatus, { tekst: string; tone: "noy" | "feil" | "ok" }> = {
  PLANLAGT: { tekst: "Planlagt", tone: "noy" }, AKTIV: { tekst: "Pågår nå", tone: "feil" }, GJENNOMFORT: { tekst: "Gjennomført", tone: "ok" },
};
const OPPTAK_STATUS: Record<string, string> = { RECORDING: "Tar opp", PROCESSING: "Behandles", DONE: "Ferdig", FAILED: "Feilet", ABORTED: "Avbrutt", PENDING: "Venter" };
const varighet = (sek: number | null) => (sek == null ? "—" : `${Math.floor(sek / 60)} min`);
const AKSER = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];

export function AG12OktarkNy({ data }: { data: OktarkData }) {
  const router = useRouter();
  const [venter, start] = useTransition();
  const [handling, setHandling] = useState<"start" | "avlys" | null>(null);
  const [feil, setFeil] = useState<string | null>(null);
  const [avlysApen, setAvlysApen] = useState(false);
  const s = STATUS[data.status];
  const okt = data.okt;
  const logget = okt ? okt.driller.filter((d) => d.logget).length : 0;
  const liveHref = data.trainingSessionV2Id ? `/admin/agencyos/live/${data.trainingSessionV2Id}` : null;
  const sammendrag = okt?.opptak?.sammendrag ?? null;

  const startLive = () => { setFeil(null); setHandling("start"); start(async () => { const r = await startOkt(data.bookingId); if (r.ok && r.sessionId) router.push(`/admin/agencyos/live/${r.sessionId}`); else setFeil(r.error ?? "Kunne ikke starte økta. Prøv igjen."); }); };
  const bekreftAvlys = () => { setFeil(null); setHandling("avlys"); start(async () => { const r = await kansellerBooking(data.bookingId); if (r.ok) { setAvlysApen(false); router.refresh(); } else setFeil(r.error ?? "Avlysningen feilet. Prøv igjen."); }); };

  return <div className="agn-s">
    <Link href="/admin/kalender" className="ag-tilbake"><ChevronLeft className="ikon" aria-hidden />Kalender</Link>
    <div className="topp">
      <div className="topp-rad">
        <div><div className="dato">{data.spillerNavn} · {data.dateLabel} · {data.startTime}–{data.endTime}</div><h1 className="tittel">Øktark</h1></div>
        {sammendrag ? <Pille tone="vent">Utkast · ikke sendt</Pille> : <Pille tone={s.tone}>{s.tekst}</Pille>}
      </div>
      <p className="kilde">{okt?.tittel ?? "Coaching"}{data.facilityLabel ? ` · ${data.facilityLabel}` : ""} · {data.durationMin} min{data.spillerMeta ? ` · ${data.spillerMeta}` : ""}</p>
      <div className="knapper">
        {data.status !== "GJENNOMFORT" && <button type="button" className="knapp pri" onClick={startLive} disabled={venter}>{venter && handling === "start" ? "Starter …" : data.status === "AKTIV" ? "Åpne live-økta" : "Start økt"}</button>}
        {data.status === "GJENNOMFORT" && liveHref && <Link href={liveHref} className="knapp sek">Åpne live-økta</Link>}
        {data.status !== "GJENNOMFORT" && <Link href="/admin/bookinger" className="knapp sek">Flytt</Link>}
        {data.status !== "GJENNOMFORT" && <button type="button" className="knapp spok" onClick={() => setAvlysApen(true)} disabled={venter}>Avlys</button>}
      </div>
      {feil && <div className="varsel advarsel" role="alert"><b className="undertittel">Handlingen feilet</b><p className="forklar">{feil}</p></div>}
    </div>

    <div className="to-del">
      <div>
        <section className="seksjon" aria-label="Sammendrag">
          <div className="sek-topp"><h2>Sammendrag</h2></div>
          {sammendrag ? <>
            <div className="utkast-ark">
              <span className="hode"><Sparkles className="ikon" aria-hidden />Utkast fra opptaket</span>
              <textarea aria-label="Sammendrag" readOnly value={sammendrag} />
              <p className="personvern"><Lock className="ikon" aria-hidden />Navn tas ut før teksten sendes til AI. Teksten er skrevet fra opptaket{okt?.opptak?.durationSec != null ? ` (${varighet(okt.opptak.durationSec)})` : ""}.</p>
            </div>
            <div className="knapper"><button type="button" className="knapp pri" disabled title="Sending til spilleren er ikke bygget ennå">Godkjenn og send til {data.fornavn}</button>{liveHref && <Link href={liveHref} className="knapp sek">Skriv oppfølging i live-økta</Link>}</div>
            <p className="kilde">Sending til spilleren kommer. Til da sender du et fokuspunkt som melding i live-økta.</p>
          </> : <div className="kort dempet"><b className="undertittel">Ingen sammendrag ennå</b><p className="forklar">{okt ? "Sammendraget lages av opptaket når økta er ferdig behandlet." : "Bookingen er ikke koblet til en økt ennå. Start økta for å koble den."}</p>{liveHref && <div className="knapper"><Link href={liveHref} className="knapp sek">Åpne live-økta</Link></div>}</div>}
          {okt?.coachBrief && <div className="kort dempet"><b className="undertittel">Fokuspunkt sendt til {data.fornavn}</b><p className="forklar">{okt.coachBrief}</p></div>}
        </section>
        <section className="seksjon" aria-label="Hjemmelekse">
          <div className="sek-topp"><h2>Hjemmelekse</h2><Pille tone="noy">Ikke lagt i planen</Pille></div>
          <p className="forklar">Ingen hjemmelekse er lagt i planen fra denne økta. Legg den inn som økt i Workbench.</p>
        </section>
      </div>
      <div>
        <section className="seksjon" aria-label="Øvelser i økta">
          <div className="sek-topp"><h2>Øvelser i økta</h2><span className="kilde">{okt && okt.driller.length ? `${logget} av ${okt.driller.length} logget` : "—"}</span></div>
          {!okt || okt.driller.length === 0 ? <p className="kilde">{okt ? "Ingen øvelser i økta." : "Bookingen er ikke koblet til en økt ennå."}</p>
            : <div className="liste">{okt.driller.map((d) => <div key={d.id}><span className={`akse-prikk a-${AKSER.includes(d.pyramide) ? d.pyramide.toLowerCase() : "noy"}`} aria-hidden /><span><b>{d.navn}</b><span className="kilde">{d.varighetMin} min</span></span>{d.logget ? <Pille tone="ok">Logget</Pille> : <Pille tone="noy">Ikke logget</Pille>}</div>)}</div>}
          {okt?.malsetning && <p className="kilde">Målsetning · {okt.malsetning}</p>}
          {okt?.coachRating != null && <p className="kilde">Din vurdering · {okt.coachRating}/5</p>}
        </section>
        <section className="seksjon" aria-label="TrackMan fra økta">
          <div className="sek-topp"><h2>TrackMan fra økta</h2><span className="kilde">—</span></div>
          <div className="tm-tabell">
            <div className="tm-rad hode"><span>Parameter</span><span style={{ textAlign: "right" }}>Start</span><span style={{ textAlign: "right" }}>Slutt</span></div>
            <div className="tm-rad"><span>Ingen TrackMan-data knyttet til økta</span><span className="v">—</span><span className="v">—</span></div>
          </div>
        </section>
        <section className="seksjon" aria-label="Filer fra økta">
          <div className="sek-topp"><h2>Filer fra økta</h2><span className="kilde">{okt?.opptak ? "1" : "—"}</span></div>
          {okt?.opptak
            ? <div className="filer"><div className="fil"><span className="ikonboks"><Mic className="ikon" aria-hidden /></span><span><b>Opptak</b><span className="kilde">{varighet(okt.opptak.durationSec)} · {OPPTAK_STATUS[okt.opptak.status] ?? okt.opptak.status}{okt.opptak.harAvskrift ? " · avskrift klar" : ""} · bare for deg</span></span><Pille tone="noy">Deles ikke</Pille></div></div>
            : <p className="kilde">Ingen opptak knyttet til økta.</p>}
        </section>
      </div>
    </div>

    {avlysApen && <div className="dialog-lag" role="presentation" onClick={(e) => { if (e.target === e.currentTarget && !venter) setAvlysApen(false); }}>
      <div className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="avlys-tittel">
        <h2 id="avlys-tittel">Avlyse økta?</h2>
        <p className="forklar">Økta avlyses og {data.fornavn} får et varsel. Dette kan ikke angres herfra. En ny økt må bookes på nytt.</p>
        <div className="knapper"><button type="button" className="knapp rust stor" onClick={bekreftAvlys} disabled={venter}>{venter && handling === "avlys" ? "Avlyser …" : "Avlys økta"}</button><button type="button" className="knapp sek stor" onClick={() => setAvlysApen(false)} disabled={venter}>Behold økta</button></div>
      </div>
    </div>}
  </div>;
}
