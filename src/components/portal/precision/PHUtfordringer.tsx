"use client";

/**
 * PlayerHQ Utfordringer, Én utfordring og Ny utfordring — nytt design, pakke 16 (utkast 1, 16.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/utfordringer.html.
 * Regler: deltakere bare fra egne grupper (coach også fra stallen), ingen delbar lenke, bare eier og
 * valgte deltakere kan åpne (beslutninger.md §VENNER SKJULES …, 16.10). «Opprett utfordring» er grafitt;
 * rust bare i dialogen «Avslutt utfordringen» (§PRØVEUKE …, 16.10). Statusordet er «Avsluttet».
 * Utfordringer teller ikke som trening.
 *
 * Avvik:
 *   - Fargen og bildet kommer fra øvelsens pyramide (FYS, TEK, SLAG, SPILL, TURN). Uten øvelse er
 *     kortet grafitt uten bilde.
 *   - «Av 5 · 31 poeng» viser scoren uten enhet: utfordringen lagrer ikke enheten.
 *   - «Seks dager igjen» står som sluttdato, og lederen vises med navn og score.
 *   - Øvelsen velges i en nedtrekksliste fra Øvelsesbanken (samme tilgang som banken), ikke med «Bytt».
 *   - «Fra gruppa» filtrerer lista på én gruppe; «Velg alle» velger alle som vises.
 */
import { useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Check, ChevronLeft, ChevronRight, X } from "lucide-react";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-meg.css";
import "@/styles/playerhq-ny-utfordringer.css";

export type UtfAkse = "fys" | "tek" | "slag" | "spill" | "turn" | null;
const BILDE: Record<Exclude<UtfAkse, null>, string> = {
  fys: "/images/playerhq/fys-styrke.jpg", tek: "/images/playerhq/tek-video.jpg", slag: "/images/playerhq/naerspill-wedge.jpg",
  spill: "/images/playerhq/spill-bane.jpg", turn: "/images/playerhq/turn-tee.jpg",
};
const tall = (n: number | null | undefined) => (n == null ? "—" : n.toLocaleString("nb-NO", { maximumFractionDigits: 2 }));
const initialer = (navn: string) => navn.split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "—";

/* ---------- Liste ---------- */

export type UtfKort = {
  id: string; navn: string; akse: UtfAkse; ovelse: string | null; antall: number;
  minPlass: number | null; minScore: number | null; slutter: string | null; avsluttetDato: string | null;
};

export function PHUtfordringer({ aktive, avsluttede, kanOpprette }: { aktive: UtfKort[]; avsluttede: UtfKort[]; kanOpprette: boolean }) {
  return <div className="phn phn-meg phn-utf"><div className="side">
    <div className="topp">
      <Link className="tilbake" href="/portal/meg"><ChevronLeft size={18} aria-hidden />Meg</Link>
      <div className="topp-rad"><div><div className="phn-dato">Meg · utfordringer</div><h1 className="phn-tittel">Utfordringer</h1></div>
        {kanOpprette && <Link className="phn-knapp pri" href="/portal/utfordringer/ny">Ny utfordring</Link>}</div>
    </div>
    {aktive.length === 0 && avsluttede.length === 0
      ? <div className="phn-kort dempet"><b className="phn-undertittel">Ingen utfordringer ennå</b><p className="phn-forklar">Lag en utfordring med en øvelse, og velg hvem i gruppa di som skal være med. De får varsel i appen.</p>
        {kanOpprette ? <div className="phn-knapper"><Link className="phn-knapp pri" href="/portal/utfordringer/ny">Ny utfordring</Link></div> : <p className="phn-kilde">Å lage utfordringer krever nivået Full. <Link href="/portal/meg/abonnement">Se abonnement</Link></p>}</div>
      : <>
        {aktive.length > 0 && <section className="phn-seksjon" aria-labelledby="utf-aktive">
          <div className="phn-sek-topp"><h2 id="utf-aktive">Aktive</h2><span className="phn-kilde">{aktive.length}</span></div>
          <div className="utf-liste aktive">{aktive.map((u) => <Link key={u.id} href={`/portal/utfordringer/${u.id}`} className={`utf ${u.akse ?? "fri"}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {u.akse && <img src={BILDE[u.akse]} alt="" />}
            <span className="t">
              <span className="utf-merke"><i aria-hidden />{u.akse ? u.akse.toUpperCase() : "FRI"}{u.ovelse ? ` · ${u.ovelse}` : ""}</span>
              <b>{u.navn}</b>
              <span className="plass"><strong>{u.minPlass != null ? `${u.minPlass}.` : "—"}</strong><span>av {u.antall}{u.minScore != null ? ` · ${tall(u.minScore)}` : " · ingen score ennå"}</span></span>
              {u.slutter && <span className="slutter">Slutter {u.slutter}</span>}
            </span>
          </Link>)}</div>
        </section>}
        {avsluttede.length > 0 && <section className="phn-seksjon" aria-labelledby="utf-avsl">
          <div className="phn-sek-topp"><h2 id="utf-avsl">Avsluttet</h2><span className="phn-kilde">{avsluttede.length}</span></div>
          <div className="utf-liste">{avsluttede.map((u) => <Link key={u.id} href={`/portal/utfordringer/${u.id}`} className="utf avsluttet">
            <span className="t"><b>{u.navn}</b><span className="phn-kilde">Avsluttet{u.avsluttetDato ? ` ${u.avsluttetDato}` : ""} · {u.antall} {u.antall === 1 ? "deltaker" : "deltakere"}</span></span>
            <span className="plass"><strong>{u.minPlass != null ? `${u.minPlass}.` : "—"}</strong></span>
          </Link>)}</div>
        </section>}
      </>}
    <p className="phn-kilde">Utfordringer teller ikke som trening og vises ikke i planen eller Stats.</p>
  </div></div>;
}

/* ---------- Én utfordring ---------- */

export type UtfDeltaker = { id: string; navn: string; erMeg: boolean; rank: number | null; score: number | null; notes: string | null };
export type UtfDetalj = {
  navn: string; beskrivelse: string | null; eierNavn: string; ovelse: string | null; akse: UtfAkse;
  avsluttet: boolean; periode: string | null; erEier: boolean; erDeltaker: boolean; higherIsBetter: boolean;
  minScore: number | null; minNotes: string | null; deltakere: UtfDeltaker[];
};
export type UtfDetaljHandlinger = {
  avslutt: () => Promise<void>;
  registrerScore: (score: number, notes: string | null) => Promise<void>;
};

export function PHUtfordring({ data, handlinger }: { data: UtfDetalj; handlinger: UtfDetaljHandlinger }) {
  const router = useRouter();
  const ark = useRef<HTMLDialogElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [score, setScore] = useState(data.minScore != null ? String(data.minScore).replace(".", ",") : "");
  const [notat, setNotat] = useState(data.minNotes ?? "");
  const [feil, setFeil] = useState<string | null>(null);
  const [jobber, start] = useTransition();
  const medScore = data.deltakere.filter((d) => d.score != null);
  const leder = medScore.find((d) => d.rank === 1) ?? null;
  const meg = data.deltakere.find((d) => d.erMeg) ?? null;

  function lagre() {
    const n = Number(score.replace(",", ".").trim());
    if (!score.trim() || !Number.isFinite(n)) { setFeil("Skriv scoren som et tall."); return; }
    setFeil(null);
    start(async () => {
      try { await handlinger.registrerScore(n, notat.trim() || null); ark.current?.close(); router.refresh(); }
      catch { setFeil("Scoren kunne ikke lagres. Prøv igjen."); }
    });
  }
  function avslutt() {
    start(async () => {
      try { await handlinger.avslutt(); dialog.current?.close(); router.refresh(); }
      catch { setFeil("Utfordringen kunne ikke avsluttes. Prøv igjen."); }
    });
  }

  return <div className="phn phn-meg phn-utf"><div className="side">
    <Link className="tilbake" href="/portal/utfordringer"><ChevronLeft size={18} aria-hidden />Utfordringer</Link>
    <div className="to-del">
      <div>
        <div className={`utf-topp ${data.akse ?? ""}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {data.akse && <img src={BILDE[data.akse]} alt="" />}
          <div className="ft">
            <span className="utf-merke"><i aria-hidden />{data.akse ? data.akse.toUpperCase() : "FRI"}{data.ovelse ? ` · ${data.ovelse}` : ""}</span>
            <h1 className="phn-tittel">{data.navn}</h1>
            <span className="info">{data.periode && <span>{data.periode}</span>}<span>Laget av {data.eierNavn.split(" ")[0] || "—"}</span>{data.avsluttet && <span>Avsluttet</span>}</span>
            <span className="utf-retning">{data.higherIsBetter ? <ArrowUp size={16} aria-hidden /> : <ArrowDown size={16} aria-hidden />}{data.higherIsBetter ? "Høyest score vinner" : "Lavest score vinner"}</span>
          </div>
        </div>
        {data.beskrivelse && <p className="phn-forklar utf-regler">{data.beskrivelse}</p>}
        <section className="phn-seksjon" aria-labelledby="utf-res">
          <div className="phn-sek-topp"><h2 id="utf-res">Resultatlisten</h2><span className="phn-kilde">{data.deltakere.length} {data.deltakere.length === 1 ? "deltaker" : "deltakere"} · {medScore.length} med score</span></div>
          <ol className="utf-tabell">{data.deltakere.map((d) => <li key={d.id} className={d.erMeg ? "meg" : undefined}>
            <span className="nr">{d.rank ?? "—"}</span>
            <span className={`avatar liten${d.erMeg ? " meg" : ""}`} aria-hidden>{initialer(d.navn)}</span>
            <span><b>{d.erMeg ? "Deg" : d.navn}</b>{d.notes && <span className="phn-kilde notat">{d.notes}</span>}</span>
            <span className={d.score == null ? "ingen" : "score"}>{d.score == null ? "Ingen score" : tall(d.score)}</span>
          </li>)}</ol>
        </section>
      </div>
      <div>
        {data.erDeltaker && <section className="phn-kort">
          <div className="phn-hoved"><strong>{tall(meg?.score)}</strong><span className="phn-forklar">{meg?.score != null ? `din score${meg.rank ? ` · ${meg.rank}. plass` : ""}` : "ingen score registrert"}</span></div>
          {leder && <p className="phn-forklar">{leder.erMeg ? "Du leder." : `${leder.navn.split(" ")[0]} leder med ${tall(leder.score)}.`}</p>}
          {!data.avsluttet && <button type="button" className="phn-knapp pri stor" onClick={() => { setFeil(null); ark.current?.showModal(); }}>Registrer score</button>}
          <p className="phn-kilde">{data.higherIsBetter ? "Høyest score vinner." : "Lavest score vinner."} Den siste scoren du registrerer, teller.</p>
        </section>}
        {data.erEier && !data.avsluttet && <div className="phn-kort dempet">
          <b className="phn-undertittel">Du laget utfordringen</b>
          <p className="phn-forklar">Avslutt den når alle er ferdige. Resultatlisten låses.</p>
          <div className="phn-knapper"><button type="button" className="phn-knapp sek" onClick={() => dialog.current?.showModal()}>Avslutt utfordringen</button></div>
        </div>}
        {feil && <div className="utf-melding" role="alert">{feil}</div>}
      </div>
    </div>

    <dialog ref={ark} className="phn-ark" aria-labelledby="utf-ark-t">
      <div className="phn-ark-kropp">
        <div className="phn-ark-topp"><h2 id="utf-ark-t">Registrer score</h2><button type="button" className="phn-lukk" aria-label="Lukk" onClick={() => ark.current?.close()}><X size={20} aria-hidden /></button></div>
        <label className="phn-felt">Score<input inputMode="decimal" value={score} onChange={(e) => setScore(e.target.value)} /></label>
        <label className="phn-felt">Notat <span className="phn-kilde valgfri">valgfritt, deltakerne ser det</span><textarea rows={3} maxLength={500} value={notat} onChange={(e) => setNotat(e.target.value)} /></label>
        {feil && <div className="utf-melding" role="alert">{feil}</div>}
        <button type="button" className="phn-knapp pri stor" onClick={lagre} disabled={jobber}>{jobber ? "Lagrer …" : "Lagre score"}</button>
      </div>
    </dialog>
    <dialog ref={dialog} className="phn-ark" role="alertdialog" aria-labelledby="utf-av-t">
      <div className="phn-ark-kropp">
        <h2 id="utf-av-t" className="utf-dialog-tittel">Avslutte utfordringen?</h2>
        <p className="phn-forklar">Resultatlisten låses, og ingen kan registrere mer.{data.deltakere.length > 1 ? ` De ${data.deltakere.length - 1} andre deltakerne får beskjed.` : ""}</p>
        <div className="phn-ark-fot"><button type="button" className="phn-knapp rust stor" onClick={avslutt} disabled={jobber}>{jobber ? "Avslutter …" : "Avslutt utfordringen"}</button><button type="button" className="phn-knapp sek stor" onClick={() => dialog.current?.close()}>La den gå</button></div>
      </div>
    </dialog>
  </div></div>;
}

/* ---------- Ny utfordring ---------- */

export type UtfValg = { id: string; navn: string; kilde: string; grupper: string[] };
export type UtfOvelse = { id: string; navn: string; akse: UtfAkse; higherIsBetter: boolean | null };
export type UtfNyInput = { name: string; description: string | null; drillId: string | null; startAt: string | null; endAt: string | null; higherIsBetter: boolean; deltakerIds: string[] };

export function PHNyUtfordring({ deltakere, grupper, ovelser, opprett }: {
  deltakere: UtfValg[]; grupper: string[]; ovelser: UtfOvelse[]; opprett: (input: UtfNyInput) => Promise<void>;
}) {
  const [navn, setNavn] = useState("");
  const [ovelseId, setOvelseId] = useState("");
  const [hoyest, setHoyest] = useState(true);
  const [fra, setFra] = useState("");
  const [til, setTil] = useState("");
  const [regler, setRegler] = useState("");
  const [gruppe, setGruppe] = useState("");
  const [valgt, setValgt] = useState<Set<string>>(new Set());
  const [feil, setFeil] = useState<string | null>(null);
  const [jobber, start] = useTransition();
  const ovelse = ovelser.find((o) => o.id === ovelseId) ?? null;
  const last = ovelse?.higherIsBetter ?? null;
  const vist = useMemo(() => (gruppe ? deltakere.filter((d) => d.grupper.includes(gruppe)) : deltakere), [gruppe, deltakere]);

  function veksle(id: string) {
    setValgt((v) => { const n = new Set(v); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }
  function send() {
    if (!navn.trim()) { setFeil("Gi utfordringen et navn."); return; }
    if (fra && til && til < fra) { setFeil("Sluttdatoen må være etter startdatoen."); return; }
    setFeil(null);
    start(async () => {
      try {
        await opprett({ name: navn.trim(), description: regler.trim() || null, drillId: ovelseId || null, startAt: fra || null, endAt: til || null, higherIsBetter: last ?? hoyest, deltakerIds: [...valgt] });
      } catch (err) {
        // redirect() kastes som en egen feil og skal ikke vises.
        if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) throw err;
        setFeil(err instanceof Error ? err.message : "Utfordringen kunne ikke lages.");
      }
    });
  }

  return <div className="phn phn-meg phn-utf"><div className="side">
    <div className="topp">
      <Link className="tilbake" href="/portal/utfordringer"><ChevronLeft size={18} aria-hidden />Utfordringer</Link>
      <div><div className="phn-dato">Utfordringer · ny</div><h1 className="phn-tittel">Ny utfordring</h1></div>
    </div>
    <div className="to-del">
      <div>
        <label className="phn-felt">Navn<input value={navn} maxLength={200} onChange={(e) => setNavn(e.target.value)} placeholder="For eksempel 8-ball, flest poeng" /></label>
        <label className="phn-felt">Øvelse
          <select value={ovelseId} onChange={(e) => setOvelseId(e.target.value)}>
            <option value="">Ingen øvelse (fri utfordring)</option>
            {ovelser.map((o) => <option key={o.id} value={o.id}>{o.navn}{o.akse ? ` · ${o.akse.toUpperCase()}` : ""}</option>)}
          </select>
          <span className="hjelp">Fra Øvelsesbanken. Uten øvelse blir det en fri utfordring.</span>
        </label>
        <div className="phn-felt"><span>Hvem vinner?</span>
          <div className="utf-retning-valg" role="group" aria-label="Hvem vinner?">
            <button type="button" aria-pressed={(last ?? hoyest) === true} disabled={last === false} onClick={() => setHoyest(true)}><b>Høyest score</b><span>{last === true ? "Bestemt av øvelsen" : "For eksempel flest poeng"}</span></button>
            <button type="button" aria-pressed={(last ?? hoyest) === false} disabled={last === true} onClick={() => setHoyest(false)}><b>Lavest score</b><span>{last === false ? "Bestemt av øvelsen" : "For eksempel færrest putter"}</span></button>
          </div>
        </div>
        <div className="utf-to-felt"><label className="phn-felt">Fra<input type="date" value={fra} onChange={(e) => setFra(e.target.value)} /></label><label className="phn-felt">Til<input type="date" value={til} onChange={(e) => setTil(e.target.value)} /></label></div>
        <label className="phn-felt">Regler <span className="phn-kilde valgfri">valgfritt</span><textarea rows={3} maxLength={4000} value={regler} onChange={(e) => setRegler(e.target.value)} /></label>
      </div>
      <div>
        <section className="phn-seksjon" aria-labelledby="utf-dlt">
          <div className="phn-sek-topp"><h2 id="utf-dlt">Deltakere</h2><span className="phn-kilde">{valgt.size} valgt</span></div>
          {deltakere.length === 0
            ? <div className="phn-kort dempet"><b className="phn-undertittel">Ingen å velge</b><p className="phn-forklar">Du er ikke med i en gruppe ennå. Du kan likevel lage utfordringen og registrere egen score.</p></div>
            : <>
              {grupper.length > 1 && <label className="phn-felt">Fra gruppa<select value={gruppe} onChange={(e) => setGruppe(e.target.value)}><option value="">Alle</option>{grupper.map((g) => <option key={g} value={g}>{g}</option>)}</select></label>}
              <div className="utf-deltakere">{vist.map((d) => <label key={d.id}><input type="checkbox" checked={valgt.has(d.id)} onChange={() => veksle(d.id)} aria-label={d.navn} /><span className="boks" aria-hidden><Check size={16} strokeWidth={3} /></span><span className="avatar liten" aria-hidden>{initialer(d.navn)}</span><span><b>{d.navn}</b><span className="phn-kilde">{d.kilde}</span></span></label>)}</div>
              <div className="phn-knapper"><button type="button" className="phn-knapp sek" onClick={() => setValgt((v) => new Set([...v, ...vist.map((d) => d.id)]))}>Velg alle{gruppe ? " i gruppa" : ""}</button></div>
            </>}
          <div className="utf-vilkaar"><b>Bare de du velger</b><span>De får varsel i appen og kan åpne utfordringen. Du er med automatisk.</span></div>
        </section>
        {feil && <div className="utf-melding" role="alert">{feil}</div>}
        <button type="button" className="phn-knapp pri stor" onClick={send} disabled={jobber}>{jobber ? "Lager …" : "Opprett utfordring"}<ChevronRight size={18} aria-hidden /></button>
      </div>
    </div>
  </div></div>;
}
