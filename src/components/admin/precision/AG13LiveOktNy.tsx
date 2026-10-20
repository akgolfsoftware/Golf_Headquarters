"use client";

/**
 * AG-13 Live coachingøkt og AG-13-U (uten samtykke til opptak) i nytt design
 * (pakke 5). Alltid lys (beslutninger.md §LIVE-ØKTENE ER ALLTID LYSE, 14.10).
 * Fasit: docs/design-system/utkast-agencyos/live.html, «AG-13 Live» og «AG-13-U».
 * Rute: /admin/agencyos/live/[sessionId]. Stil: src/styles/agencyos-ny-live.css.
 *
 * Som før (lastLiveOktData, live-okt-actions): melding til spilleren nå,
 * fokuspunkt før økta, vurdering etter økta, øvelsene med logget-status,
 * opptakets status, transkript og analyse, «Start opptak» mot /admin/recording.
 * Nytt: opptak krever lydsamtykke (hentLydSamtykkeStatus). Uten GITT vises
 * sperren (AG-13-U) og «Start opptak» finnes ikke.
 *
 * Avvik:
 *   - Notater med klokkeslett under økta: lagres ikke. Det som lagres er meldingen
 *     til spilleren og transkriptet fra opptaket.
 *   - Video og bilder «fra iPhone» kan ikke tas her; antall videoer fra økta
 *     vises for Workbench-økter, ellers «—».
 *   - «Legg i planen» (hjemmelekse) er en lenke til spillerens uke i Workbench.
 *   - «Avslutt økta» og «Pause» finnes ikke for coachen. Klokka teller fra
 *     planlagt start, og «Live» vises bare innenfor planlagt tid.
 *   - Kategori A–K og siste runde med SG på spillerkortet venter på kobling; HCP vises.
 *
 * Designløftet 20.10 (canvas «AgencyOS nøkkelskjermer», rad 7 Live, godkjent av Anders):
 * lys topp med Live-pillen som eneste rust, fanene «Under økta» og «Etter økta» (etter
 * planlagt tid åpner «Etter økta»), opptaket øverst, øvelsene med fremdriftsstrek.
 * Avvik: tellerne per øvelse (Uten ball · Lav hastighet · Automatikk · Slag) og Club Path
 * fra TrackMan i økta har ingen data i live-økta i dag og er ikke med.
 */
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { Check, ChevronLeft, Lock, Mic, Star, Video } from "lucide-react";
import { Pille } from "@/components/admin/agencyos-ny/ny";
import { sendLiveMelding, sendBriefTilSpiller, lagreCoachVurdering } from "@/lib/agencyos/live-okt-actions";
import type { LiveOktData } from "@/lib/agencyos/live-okt-data";
import "@/styles/agencyos-ny-live.css";

export type LiveSamtykke = { tillatt: true } | { tillatt: false; status: "VENTER" | "TRUKKET" | "MANGLER" };
export type LiveTekniskOppgave = { planId: string; pNummer: string; posisjon: string; tittel: string; gjort: number; maal: number | null };

export type AG13NyProps = {
  data: LiveOktData;
  samtykke: LiveSamtykke;
  hcp: number | null;
  oppgave: LiveTekniskOppgave | null;
};

const OSLO = "Europe/Oslo";
const fmtVar = (sek: number | null) => (sek == null ? "—" : `${Math.floor(sek / 60)}:${String(sek % 60).padStart(2, "0")}`);
const OPPTAK_STATUS: Record<string, string> = { RECORDING: "Opptak pågår", PROCESSING: "Behandles", DONE: "Ferdig", FAILED: "Feilet", ABORTED: "Avbrutt", PENDING: "Venter" };
const AKSER = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];
type Fase = "under" | "etter";

function useKlokke(startISO: string, varighetMin: number) {
  const [naa, setNaa] = useState<number | null>(null);
  useEffect(() => {
    const f = setTimeout(() => setNaa(Date.now()), 0);
    const t = setInterval(() => setNaa(Date.now()), 1000);
    return () => { clearTimeout(f); clearInterval(t); };
  }, []);
  const start = Date.parse(startISO);
  if (naa == null) return { tekst: "—", live: false, fase: "for" as const, om: 0 };
  const sek = Math.floor((naa - start) / 1000);
  if (sek < 0) return { tekst: "—", live: false, fase: "for" as const, om: Math.ceil(-sek / 60) };
  const live = naa <= start + varighetMin * 60_000;
  const m = Math.floor(sek / 60), s = sek % 60;
  return { tekst: m >= 100 ? `${m} min` : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`, live, fase: live ? ("na" as const) : ("etter" as const), om: 0 };
}

function Melding({ sessionId }: { sessionId: string }) {
  const [tekst, setTekst] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const [sendt, setSendt] = useState(false);
  const [venter, start] = useTransition();
  const send = () => {
    const t = tekst.trim();
    if (!t) { setFeil("Skriv en melding først"); return; }
    setFeil(null); setSendt(false);
    start(async () => { const r = await sendLiveMelding(sessionId, t); if (!r.ok) setFeil(r.error); else { setTekst(""); setSendt(true); } });
  };
  return <div className="seksjon" style={{ gap: 6 }}>
    <div className="notat-felt">
      <input aria-label="Melding til spilleren nå" placeholder="Skriv en rask melding til spilleren" value={tekst} onChange={(e) => { setTekst(e.target.value); setSendt(false); }}
        onKeyDown={(e) => { if (e.key === "Enter" && !venter) { e.preventDefault(); send(); } }} disabled={venter} />
      <button type="button" className="knapp sek" onClick={send} disabled={venter}>{venter ? "Sender …" : "Send"}</button>
    </div>
    {feil && <span className="feiltekst" style={{ color: "var(--rust-tekst)", fontWeight: 600, fontSize: 13 }}>{feil}</span>}
    {sendt && !venter && <span className="kilde" style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><Check className="ikon" aria-hidden style={{ width: 14, height: 14 }} />Sendt til spilleren</span>}
  </div>;
}

function Fokuspunkt({ sessionId, initial }: { sessionId: string; initial: string }) {
  const [tekst, setTekst] = useState(initial);
  const [feil, setFeil] = useState<string | null>(null);
  const [sendt, setSendt] = useState(false);
  const [venter, start] = useTransition();
  const send = () => {
    const t = tekst.trim();
    if (!t) { setFeil("Skriv et fokuspunkt først"); return; }
    setFeil(null); setSendt(false);
    start(async () => { const r = await sendBriefTilSpiller(sessionId, t); if (!r.ok) setFeil(r.error); else setSendt(true); });
  };
  return <div className="felt"><label htmlFor="fokus">Fokuspunkt før økta</label>
    <textarea id="fokus" rows={2} value={tekst} onChange={(e) => { setTekst(e.target.value); setSendt(false); }} disabled={venter} placeholder="Hva skal spilleren tenke på før økta starter?" />
    <div className="knapper" style={{ alignItems: "center" }}>
      <button type="button" className="knapp sek" onClick={send} disabled={venter}>{venter ? "Sender …" : "Send til spilleren"}</button>
      {feil && <span style={{ color: "var(--rust-tekst)", fontWeight: 600, fontSize: 13 }}>{feil}</span>}{sendt && !venter && <span className="kilde">Sendt</span>}
    </div>
  </div>;
}

function Vurdering({ sessionId, initial }: { sessionId: string; initial: number | null }) {
  const [rating, setRating] = useState(initial ?? 0);
  const [notat, setNotat] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const [lagret, setLagret] = useState(false);
  const [venter, start] = useTransition();
  const lagre = () => {
    if (rating < 1) { setFeil("Velg 1–5 først"); return; }
    setFeil(null); setLagret(false);
    start(async () => { const r = await lagreCoachVurdering(sessionId, rating, notat.trim()); if (!r.ok) setFeil(r.error); else setLagret(true); });
  };
  return <section className="seksjon" aria-label="Vurder økta">
    <div className="sek-topp"><h2>Vurder økta</h2><span className="kilde">Bare for deg</span></div>
    <div className="stjerner" role="group" aria-label="Vurdering 1–5">{[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" aria-pressed={n <= rating} aria-label={`${n} av 5`} onClick={() => { setRating(n); setLagret(false); }}><Star className="ikon" aria-hidden /></button>)}</div>
    <textarea className="notat-tekst" rows={2} value={notat} onChange={(e) => { setNotat(e.target.value); setLagret(false); }} disabled={venter} placeholder="Notat om økta (valgfritt)" aria-label="Notat om økta" />
    <div className="knapper" style={{ alignItems: "center" }}>
      <button type="button" className="knapp sek" onClick={lagre} disabled={venter}>{venter ? "Lagrer …" : "Lagre vurdering"}</button>
      {feil && <span style={{ color: "var(--rust-tekst)", fontWeight: 600, fontSize: 13 }}>{feil}</span>}{lagret && !venter && <span className="kilde">Lagret</span>}
    </div>
  </section>;
}

export function AG13LiveOktNy({ data, samtykke, hcp, oppgave }: AG13NyProps) {
  const k = useKlokke(data.startTime, data.varighetPlanlagtMin);
  const fornavn = (data.spillerNavn ?? "spilleren").split(" ")[0];
  const startKl = new Date(data.startTime).toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit", timeZone: OSLO });
  const videoer = data.driller.reduce((s, d) => s + (d.videoer ?? 0), 0);
  const logget = data.driller.filter((d) => d.logget).length;
  const spillerId = data.spillerId ?? null;
  const opptakPaagaar = data.opptak?.status === "RECORDING";

  const [valgtFase, setFase] = useState<Fase | null>(null);
  const fase: Fase = valgtFase ?? (k.fase === "etter" ? "etter" : "under");

  const opptak = <section className="seksjon" aria-label="Opptak">
    {data.opptak
      ? <div className={`opptak${opptakPaagaar ? "" : " sperret"}`}>
        <span className="boelge" aria-hidden>{[12, 22, 16, 26, 10].map((h, i) => <i key={i} style={{ height: h, animationDelay: `${i * 0.1}s`, animationPlayState: opptakPaagaar ? "running" : "paused" }} />)}</span>
        <span><b>{OPPTAK_STATUS[data.opptak.status] ?? data.opptak.status}{data.opptak.durationSec != null ? ` · ${fmtVar(data.opptak.durationSec)}` : ""}</b><span className="kilde">{opptakPaagaar ? `${fornavn} ser «Opptak pågår» i appen` : "Transkript og analyse kommer når opptaket er behandlet"}</span></span>
      </div>
      : samtykke.tillatt
        ? <div className="opptak"><span className="ikonboks"><Mic className="ikon" aria-hidden /></span><span><b>Ingen opptak ennå</b><span className="kilde">Alt du sier blir transkript, analyse og utkast til sammendrag. {fornavn} ser «Opptak pågår».</span></span><Link href={`/admin/recording?okt=${data.id}`} className="knapp pri">Start opptak</Link></div>
        : <div className="opptak sperret"><span className="ikonboks"><Lock className="ikon" aria-hidden /></span><span><b>Ingen opptak i denne økta</b><span className="kilde">Samtykke mangler. Se forklaringen over.</span></span></div>}
  </section>;

  const ovelser = <section className="seksjon" aria-label="Øvelsene i økta">
    <div className="sek-topp"><h2>Øvelsene</h2><span className="kilde">{data.driller.length ? `${logget} av ${data.driller.length} logget` : "—"}</span></div>
    {data.driller.length > 0 && <div className="live-fremdrift" role="img" aria-label={`${logget} av ${data.driller.length} øvelser logget`}>{data.driller.map((d) => <i key={d.id} className={d.logget ? "ferdig" : ""} />)}</div>}
    {data.driller.length === 0 ? <p className="kilde">Ingen øvelser på denne økta ennå.</p> : <div className="liste">{data.driller.map((d) => <div key={d.id}>
      <span className={`akse-prikk a-${AKSER.includes(d.pyramide) ? d.pyramide.toLowerCase() : "noy"}`} aria-hidden />
      <span><b>{d.navn}</b><span className="kilde">{[`${d.varighetMin} min`, d.reps != null ? `${d.reps} reps` : null, d.videoer ? `${d.videoer} video` : null].filter(Boolean).join(" · ")}{d.kommentar ? ` · ${fornavn}: ${d.kommentar}` : ""}</span></span>
      {d.logget ? <Pille tone="ok">Logget</Pille> : <Pille tone="noy">Ikke logget</Pille>}
    </div>)}</div>}
  </section>;

  const teknisk = <section className="seksjon" aria-label="Teknisk plan">
    <div className="sek-topp"><h2>Teknisk plan</h2>{spillerId && <Link className="lenke" href={oppgave ? `/admin/spillere/${spillerId}/plan/${oppgave.planId}` : `/admin/spillere/${spillerId}/plan`}>Hele planen</Link>}</div>
    {oppgave && spillerId
      ? <Link href={`/admin/spillere/${spillerId}/plan/${oppgave.planId}`} className="oppgave-kort"><div><span className="akse-merke" style={{ justifySelf: "start" }}><i aria-hidden />TEK</span><b>{oppgave.pNummer} {oppgave.posisjon}</b><span>{oppgave.tittel}</span><span className="tall">{oppgave.gjort}{oppgave.maal != null ? ` / ${oppgave.maal}` : ""} rep</span></div></Link>
      : <p className="kilde">Ingen aktiv oppgave i teknisk plan.</p>}
    <p className="kilde">Kvalitetssjekken vises bare og sperrer aldri neste steg.</p>
  </section>;

  const spillerkort = <section className="seksjon spillerkort" aria-label="Spilleren">
    <div className="sek-topp"><h2>Spilleren</h2><span className="kilde">{data.tittel}</span></div>
    <div className="fakta">
      <div><b>{hcp != null ? hcp.toLocaleString("nb-NO", { maximumFractionDigits: 1 }) : "—"}</b><span>HCP</span></div>
      <div><b>{data.driller.length ? `${logget}/${data.driller.length}` : "—"}</b><span>øvelser logget</span></div>
      <div><b>{data.varighetPlanlagtMin}</b><span>min planlagt</span></div>
    </div>
    {data.malsetning && <div className="kort" style={{ gap: 0, paddingTop: 6, paddingBottom: 6 }}><div className="malsetning"><span>{data.malsetning}</span><Pille tone="vent">Målsetning</Pille></div></div>}
  </section>;

  const meldinger = <section className="seksjon" aria-label="Melding til spilleren">
    <div className="sek-topp"><h2>Melding til {fornavn} nå</h2></div>
    {data.kilde === "v2" ? <Melding sessionId={data.id} /> : <p className="kilde">Melding under økta finnes bare for coachingøkter, ikke for Workbench-økter.</p>}
    {data.kilde === "v2" && <Fokuspunkt sessionId={data.id} initial={data.coachBrief} />}
  </section>;

  const sammendrag = <section className="seksjon" aria-label="Sammendrag">
    <div className="sek-topp"><h2>Sammendrag til {fornavn}</h2><Pille tone="noy">Utkast · ikke sendt</Pille></div>
    {data.opptak?.coachAnalyse
      ? <div className="utkast-ark"><span className="hode">Utkast fra opptaket</span><p className="forklar" style={{ whiteSpace: "pre-wrap" }}>{data.opptak.coachAnalyse}</p><p className="personvern"><Lock className="ikon" aria-hidden />Navn tas ut før teksten sendes til AI. Ingenting sendes før du godkjenner i øktarket.</p></div>
      : <p className="kilde">{data.opptak ? "Sammendraget lages når opptaket er behandlet." : "Ingen opptak i økta, så det finnes ikke noe utkast. Skriv oppfølgingen i øktarket."}</p>}
    {data.opptak?.transcript && <details className="detaljer"><summary>Transkript</summary><p className="forklar" style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{data.opptak.transcript}</p></details>}
  </section>;

  const media = <section className="seksjon" aria-label="Video og bilder">
    <div className="sek-topp"><h2>Video og bilder</h2><span className="kilde">{videoer ? `${videoer} fra økta` : "—"}</span></div>
    <div className="media">{videoer === 0
      ? <div className="bilde"><Video className="ikon" aria-hidden /><span>Ingen video fra økta ennå</span></div>
      : data.driller.filter((d) => d.videoer).map((d) => <div key={d.id} className="bilde"><Video className="ikon" aria-hidden /><span>{d.navn}</span><span className="tid">{d.videoer} video</span></div>)}</div>
    <p className="kilde">Spilleren legger video på øvelsen i PlayerHQ. Den vises her og i teknisk plan.</p>
  </section>;

  const hjemmelekse = <section className="seksjon" aria-label="Hjemmelekse">
    <div className="sek-topp"><h2>Hjemmelekse</h2></div>
    <p className="forklar">Hjemmelekse legges inn som en økt i {fornavn}s uke i Workbench, i aksefargen.</p>
    {spillerId && <Link href={`/admin/workbench/${spillerId}`} className="knapp sek" style={{ justifySelf: "start" }}>Åpne uka i Workbench</Link>}
  </section>;

  return <div className="agn-s">
    <Link href="/admin/agencyos/live" className="ag-tilbake"><ChevronLeft className="ikon" aria-hidden />Tavla</Link>
    <div className="live-topp">
      <div style={{ display: "grid", gap: 6, minWidth: 0 }}>
        <div className="rad">
          {k.live ? <span className="live-pille"><i aria-hidden />Live</span>
            : <span className="live-pille stille"><i aria-hidden />{k.fase === "for" ? (k.om > 0 ? `Starter om ${k.om} min` : "Planlagt") : "Planlagt tid er over"}</span>}
          <span className="klokke">{k.fase === "for" ? startKl : k.tekst}<small>{k.fase === "for" ? ` start · ${data.varighetPlanlagtMin} min` : ` av ${data.varighetPlanlagtMin} min`}</small></span>
        </div>
        <h1 className="navn">{data.spillerNavn ?? data.tittel}</h1>
        <span className="meta">{[data.tittel, data.type, data.sted].filter((x) => x && x !== "—").join(" · ")}</span>
      </div>
      <div className="knapper">
        <div className="valg" role="tablist" aria-label="Fase">
          <button type="button" role="tab" aria-selected={fase === "under"} onClick={() => setFase("under")}>Under økta</button>
          <button type="button" role="tab" aria-selected={fase === "etter"} onClick={() => setFase("etter")}>Etter økta</button>
        </div>
        <Link href="/admin/kalender" className="knapp sek">Kalender</Link>{spillerId && <Link href={`/admin/spillere/${spillerId}`} className="knapp sek">Spiller 360</Link>}
      </div>
    </div>

    {!samtykke.tillatt && <div className="sperre" role="status">
      <Lock className="ikon" aria-hidden />
      <span><b>Opptak er sperret</b><span className="forklar">{samtykke.status === "TRUKKET" ? `${fornavn} har trukket samtykket til opptak i coachingøkt.` : `${fornavn} har ikke gitt samtykke til opptak i coachingøkt, eller samtykket venter på foresatt.`} Samtykket gis i PlayerHQ under Meg › Personvern. Melding, fokuspunkt og øvelsene virker som vanlig.</span></span>
    </div>}

    {fase === "under"
      ? <div className="to-del">
        <div>{opptak}{ovelser}{teknisk}</div>
        <div>{meldinger}{spillerkort}</div>
      </div>
      : <div className="to-del">
        <div>{sammendrag}{media}</div>
        <div>{data.kilde === "v2" && <Vurdering sessionId={data.id} initial={data.coachRating} />}{hjemmelekse}{spillerkort}</div>
      </div>}
  </div>;
}
