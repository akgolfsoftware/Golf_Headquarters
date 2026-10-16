"use client";

/**
 * AG-04 Innboks i nytt design (designbrevet 13.10.2026). Fasit:
 * docs/design-system/utkast-agencyos/cockpit.html, skjermene «AG-04 Innboks»,
 * «Sak med utkast», «AG-04-HASTER» og «Oppfølging». Fanene Caddie-forslag og
 * Datakvalitet følger jarvis.html (AG-A08, AG-A05).
 *
 * Én liste for alt som før lå på tre sider. Handlingene er de samme:
 *   Kommunikasjon — avgjorInnboksSak (varsler, tilbakemeldinger, Jarvis-triage),
 *                   sendGodkjentSvar og arkiverEpost (e-post)
 *   Kø            — acceptPlanAction/rejectPlanAction (avvis med grunn),
 *                   godkjennCaddieDraft/avvisProaktivtForslag,
 *                   markerSomPlanlagt/avslaaForespørsel, batchApproveLowRisk,
 *                   delUkesdigestAction
 *   Oppfølgingskø — settOppfolgingsstatus (dra-og-slipp eller statusvalg)
 * Nytt: åpne spørsmål fra spillere besvares med svarPaSporsmal.
 *
 * Jarvis og Caddie lager bare utkast. Ingenting sendes uten at coachen trykker.
 */
import { useMemo, useState, useTransition, type DragEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { Avatar, Feil, HasterPille, Knapp, KnappLenke, Laster, Nokkelverdier, Pille, Tom, Topp, Varsel } from "@/components/admin/agencyos-ny/ny";
import {
  INNBOKS_FILTRE, OPPF_STATUSER, innboksHref, type InnboksFilterId, type OppfStatus,
} from "@/lib/admin/innboks/filter";
import { iFilter, sorterInnboks, tellFilter, type GodkjennKilde, type InnboksPost } from "@/lib/admin/innboks/bygg-innboks";
import type { DatakvalitetData } from "@/lib/admin/innboks/last-datakvalitet";
import type { AdminUkesrapportKort } from "@/components/admin/v2/AdminGodkjenningerV2";
import { avgjorInnboksSak } from "@/app/admin/innboks/actions";
import { acceptPlanAction, rejectPlanAction } from "@/lib/agents/actions";
import { avvisProaktivtForslag, godkjennCaddieDraft } from "@/app/admin/agencyos/caddie/dashbord/actions";
// Navnerom-import: måleverktøyets stubb for «use server»-moduler kjenner bare ASCII-navn.
import * as foresporsel from "@/app/admin/(legacy)/foresporsler/actions";
import { batchApproveLowRisk } from "@/app/admin/(legacy)/approvals/actions";
import { delUkesdigestAction } from "@/app/admin/godkjenninger/del-digest-action";
import { settOppfolgingsstatus } from "@/app/admin/queue/actions";
import { svarPaSporsmal } from "@/app/portal/(legacy)/coach/sporsmal/actions";
import { arkiverEpost, sendGodkjentSvar } from "@/lib/innboks/actions";
import "@/styles/agencyos-ny-cockpit.css";

export type AG04Tilstand = "data" | "laster" | "feil";

export type AG04Godkjenn = {
  venter: number;
  lavRisiko: number;
  eldste: { dagerLabel: string; who: string } | null;
  godkjent7Dager: number | null;
  avvist7Dager: number | null;
  ukesrapport: AdminUkesrapportKort | null;
  lostSjekkpunkter: { id: string; who: string; sjekkpunkt: string; when: string }[];
  /** Kø-faner som ikke er Innboks (agent-kø, tester, dubletter, moderering), etter tilgang. */
  andreKoer: { label: string; href: string }[];
};

export type AG04Props = {
  tilstand: AG04Tilstand;
  poster: InnboksPost[];
  startFilter: InnboksFilterId;
  startOppf: OppfStatus | null;
  dagLabel: string;
  /** Sendt og arkivert e-post er lastet (E-post › Sendt). */
  visSendt: boolean;
  /** E-post (post@akgolf.no) er bare for head coach, som før. */
  harEpost: boolean;
  godkjenn: AG04Godkjenn;
  oppfolgingSpillere: number | null;
  datakvalitet: DatakvalitetData;
  /** Søkeparametre fra adressen, beholdes når fanen byttes. */
  sok?: Record<string, string>;
};

const OPPF_KLASSE: Record<OppfStatus, string> = { risk: "risiko", watch: "folg", check: "sjekk", ok: "lost" };
const OPPF_LABEL: Record<OppfStatus, string> = Object.fromEntries(OPPF_STATUSER.map((o) => [o.id, o.label])) as Record<OppfStatus, string>;
const KILDE_LABEL: Record<GodkjennKilde, string> = { motor: "Motoren", caddie: "Caddie", foresporsel: "Forespørsler" };
const DND = "application/x-akgolf-oppfolging";
const tallTekst = (n: number | null) => (n == null ? "—" : String(n));

type Kjor = (fn: () => Promise<unknown>, etter?: () => void) => void;

function useHandling(): { pending: boolean; feil: string | null; kjor: Kjor; setFeil: (f: string | null) => void } {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);
  const kjor: Kjor = (fn, etter) => start(async () => {
    setFeil(null);
    try {
      const res = await fn();
      const r = res as { ok?: boolean; feil?: string; error?: string } | undefined;
      if (r && r.ok === false) { setFeil(r.feil ?? r.error ?? "Handlingen gikk ikke gjennom."); return; }
      etter?.();
      router.refresh();
    } catch (e) {
      setFeil(e instanceof Error && e.message ? `Handlingen gikk ikke gjennom (${e.message}).` : "Handlingen gikk ikke gjennom.");
    }
  });
  return { pending, feil, kjor, setFeil };
}

/* ---------- Én sak i lista ---------- */
function Sak({ p, open, onOpen, onBorte, onFilter, dra }: {
  p: InnboksPost; open: boolean; onOpen: () => void; onBorte: () => void; onFilter: (f: InnboksFilterId) => void;
  dra: boolean;
}) {
  const { pending, feil, kjor } = useHandling();
  const h = p.handling;
  const [red, setRed] = useState(false);
  const [txt, setTxt] = useState(p.utkast?.tekst ?? "");
  const [forkastet, setForkastet] = useState(false);
  const [svar, setSvar] = useState<string | null>(null);
  const [grunn, setGrunn] = useState<{ valg: "godkjenn" | "avvis" } | null>(null);
  const [grunnTekst, setGrunnTekst] = useState("");
  const [melding, setMelding] = useState<string | null>(null);
  const sub = [p.kind, p.konto].filter(Boolean).join(" · ");
  const visUtkast = p.utkast && !forkastet;

  const sendSvar = (tekst: string) => {
    if (h.t === "epost") epostSend(tekst);
    else if (h.t === "sporsmal") kjor(() => svarPaSporsmal(h.id, tekst), onBorte);
  };
  const epostSend = (tekst: string) => {
    if (h.t !== "epost") return;
    kjor(async () => {
      const res = await sendGodkjentSvar(h.id, tekst);
      setMelding(res.melding);
      if (res.sendtReelt) onBorte();
      return { ok: true };
    });
  };

  const dragProps = dra && h.t === "oppf" ? {
    draggable: !pending,
    onDragStart: (e: DragEvent) => { e.dataTransfer.setData(DND, h.spillerId); e.dataTransfer.effectAllowed = "move"; },
  } : {};

  const avgjorSak = (valg: "godkjenn" | "avvis", g?: string) => {
    if (h.t !== "sak") return;
    kjor(() => avgjorInnboksSak(h.sakId, valg, g), onBorte);
  };

  function bekreftGrunn() {
    if (!grunn) return;
    const g = grunnTekst.trim() || undefined;
    if (h.t === "plan") kjor(() => rejectPlanAction(h.id, g), onBorte);
    else if (h.t === "sak") avgjorSak(grunn.valg, g);
  }

  return <div role="listitem" className={`sak${p.haster && !p.lost ? " haster" : ""}${p.lost ? " lost" : ""}`} aria-busy={pending || undefined} {...dragProps}>
    <button type="button" aria-expanded={open} onClick={onOpen} className="sak-topp sak-knapp">
      <Avatar navn={p.fra} liten />
      <span>
        <b>{p.fra}</b>
        <span className="fra">{p.tittel}</span>
        <span className="status-rad">
          {p.haster && !p.lost && <HasterPille />}
          {p.oppf && <span className={`status-merke ${OPPF_KLASSE[p.oppf]}`}>{OPPF_LABEL[p.oppf]}</span>}
          {p.merker.map((m) => <span key={m} className="type">{m}</span>)}
          {p.lost && p.lostTekst && !p.oppf && <Pille tone="ok">{p.lostTekst}</Pille>}
          {visUtkast && <span className="type">Utkast · {p.utkast!.av}</span>}
          {sub && <span className="kilde">{sub}</span>}
        </span>
      </span>
      <span className="sak-hoyre"><time>{p.at}</time>{open ? <ChevronUp className="ikon" aria-hidden /> : <ChevronDown className="ikon" aria-hidden />}</span>
    </button>
    {open && <div className="sak-kropp">
      <p className="sitat">{p.tekst}</p>
      {p.detaljer.length > 0 && <Nokkelverdier rader={p.detaljer.map((d) => [d.label, d.tekst] as const)} />}
      {p.grunnlag.length > 0 && <p className="kilde">{p.grunnlag.join(" · ")}</p>}

      {visUtkast && <div className="utkast">
        <span className="hode"><Sparkles className="ikon" aria-hidden />Utkast fra {p.utkast!.av} · sendes ikke uten trykk{p.konto ? ` · fra ${p.konto}` : ""}</span>
        {red ? <textarea value={txt} aria-label="Rediger utkast" onChange={(e) => setTxt(e.target.value)} /> : <p>{txt}</p>}
        {h.t === "epost" && <div className="knapper">
          <Knapp disabled={pending || !txt.trim()} onClick={() => epostSend(txt)}>Send</Knapp>
          <Knapp variant="sek" onClick={() => setRed(!red)}>{red ? "Ferdig redigert" : "Rediger"}</Knapp>
          <Knapp variant="spok" onClick={() => { setForkastet(true); setRed(false); }}>Forkast</Knapp>
        </div>}
        {h.t === "caddie" && <div className="knapper">
          <Knapp disabled={pending} onClick={() => kjor(() => godkjennCaddieDraft(h.id), onBorte)}>Send</Knapp>
          <Knapp variant="spok" disabled={pending} onClick={() => kjor(() => avvisProaktivtForslag(h.id), onBorte)}>Forkast</Knapp>
        </div>}
      </div>}

      {svar != null && <div className="utkast">
        <label className="felt"><span className="etikett">Svar til {p.fra}</span>
          <textarea value={svar} placeholder={"Svar til " + (p.fra.split(" ")[0] ?? p.fra)} onChange={(e) => setSvar(e.target.value)} /></label>
        <span className="kilde">Du sender. Jarvis lager bare utkast.</span>
        <div className="knapper">
          <Knapp disabled={pending || !svar.trim()} onClick={() => sendSvar(svar)}>Send</Knapp>
          <Knapp variant="sek" disabled title="Jarvis lager ikke utkast på forespørsel ennå. Skriv svaret selv.">Lag utkast</Knapp>
          <Knapp variant="spok" onClick={() => setSvar(null)}>Avbryt</Knapp>
        </div>
      </div>}

      {grunn && <div className="utkast">
        <label className="felt"><span className="etikett">Grunn (valgfritt)</span>
          <input type="text" value={grunnTekst} maxLength={500} autoFocus
            onChange={(e) => setGrunnTekst(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") bekreftGrunn(); }} /></label>
        <div className="knapper">
          <Knapp variant="sek" disabled={pending} onClick={bekreftGrunn}>{grunn.valg === "avvis" ? "Avvis" : "Bekreft"}</Knapp>
          <Knapp variant="spok" onClick={() => { setGrunn(null); setGrunnTekst(""); }}>Avbryt</Knapp>
        </div>
      </div>}

      {(feil || melding) && <Varsel tone={feil ? "advarsel" : "info"}>{feil ?? melding}</Varsel>}

      <div className="knapper">
        {h.t === "plan" && !grunn && <>
          <Knapp disabled={pending} onClick={() => kjor(() => acceptPlanAction(h.id), onBorte)}>Godkjenn</Knapp>
          <Knapp variant="sek" disabled={pending} onClick={() => setGrunn({ valg: "avvis" })}>Avvis</Knapp>
        </>}
        {h.t === "foresporsel" && <>
          <Knapp disabled={pending} onClick={() => kjor(() => foresporsel.markerSomPlanlagt(h.id), onBorte)}>Legg i kalenderen</Knapp>
          <Knapp variant="sek" disabled={pending} onClick={() => kjor(() => foresporsel.avslaaForespørsel(h.id), onBorte)}>Kan ikke</Knapp>
        </>}
        {h.t === "sak" && !grunn && <>
          {h.primaer && (h.primaer.label === "Kvitter ut"
            ? <Knapp variant="sek" disabled={pending} onClick={() => avgjorSak("godkjenn")}>Ferdig</Knapp>
            : <Knapp disabled={pending} onClick={() => (h.primaer!.krevGrunn ? setGrunn({ valg: "godkjenn" }) : avgjorSak("godkjenn"))}>{h.primaer.label}</Knapp>)}
          {h.sekundaer && <Knapp variant="sek" disabled={pending} onClick={() => (h.sekundaer!.krevGrunn ? setGrunn({ valg: "avvis" }) : avgjorSak("avvis"))}>{h.sekundaer.label}</Knapp>}
        </>}
        {h.t === "caddieGruppe" && <Knapp variant="sek" onClick={() => onFilter("caddie")}>Se alle {h.antall} under Caddie-forslag</Knapp>}
        {(h.t === "epost" || h.t === "sporsmal") && p.kanSvare && (!p.utkast || forkastet) && svar == null &&
          <Knapp variant="sek" onClick={() => setSvar("")}>Svar</Knapp>}
        {p.lenker.map((l) => <KnappLenke key={l.href + l.label} href={l.href}>{l.label}</KnappLenke>)}
        {h.t === "epost" && !h.lukket && <Knapp variant="spok" disabled={pending} onClick={() => kjor(() => arkiverEpost(h.id), onBorte)}>Ferdig</Knapp>}
        {h.t === "oppf" && h.status !== "ok" && <Knapp variant="spok" disabled={pending} onClick={() => kjor(() => settOppfolgingsstatus(h.spillerId, "ok"))}>Ferdig</Knapp>}
      </div>
      {h.t === "oppf" && <label className="felt flytt">
        <span className="etikett">Flytt sak</span>
        <select aria-label={`Flytt ${p.fra} til status`} value={h.status} disabled={pending}
          onChange={(e) => { const st = e.target.value as OppfStatus; if (st !== h.status) kjor(() => settOppfolgingsstatus(h.spillerId, st)); }}>
          {OPPF_STATUSER.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
      </label>}
    </div>}
  </div>;
}

/* ---------- Godkjenn: køen i tall, lav risiko samlet, ukesrapport ---------- */
function GodkjennTopp({ g, visRapport }: { g: AG04Godkjenn; visRapport: boolean }) {
  const { pending, feil, kjor } = useHandling();
  const [melding, setMelding] = useState<string | null>(null);
  const deler = useHandling();
  const [digest, setDigest] = useState<string | null>(null);
  return <>
    <div className="nokkel fire">
      <div><b>{g.venter}</b><span>venter</span></div>
      <div><b>{g.lavRisiko}</b><span>lav risiko</span></div>
      <div><b>{tallTekst(g.godkjent7Dager)}</b><span>godkjent 7 dager</span></div>
      <div><b>{tallTekst(g.avvist7Dager)}</b><span>avvist 7 dager</span></div>
    </div>
    <p className="kilde">Eldste: {g.eldste ? `${g.eldste.dagerLabel} · ${g.eldste.who}` : "—"}</p>
    {g.lavRisiko > 0 && <div className="knapper"><Knapp variant="sek" disabled={pending}
      onClick={() => kjor(async () => { const r = await batchApproveLowRisk(); setMelding(`${r.godkjent} av ${g.lavRisiko} godkjent.`); return r; })}>
      {pending ? "Godkjenner …" : `Godkjenn ${g.lavRisiko} med lav risiko samlet`}
    </Knapp></div>}
    {(feil || melding) && <Varsel tone={feil ? "advarsel" : "ok"}>{feil ?? melding}</Varsel>}
    {visRapport && g.ukesrapport && <section aria-label="Ukesrapport" className="kort">
      <div className="sek-topp"><h2>Ukesrapport · uke {g.ukesrapport.ukenummer}</h2><span className="kilde">{g.ukesrapport.when}</span></div>
      <p className="forklar">Rapportagenten leser plan, logg, runder og tester. Den skriver aldri noe selv. Alt under er telt, ikke vurdert. Leses, godkjennes ikke.</p>
      <Nokkelverdier rader={g.ukesrapport.tall.map((t) => [t.key, t.verdi, t.nevner] as const)} />
      {g.ukesrapport.hvorfor.length > 0 && <details className="detaljer"><summary>Hvorfor?</summary>
        <ul>{g.ukesrapport.hvorfor.map((x, i) => <li key={i}>{x}</li>)}</ul></details>}
      <div className="knapper">
        <Knapp variant="sek" disabled={deler.pending}
          onClick={() => deler.kjor(async () => { const r = await delUkesdigestAction(); setDigest(r.melding); return { ok: true }; })}>{deler.pending ? "Deler …" : "Del digest med spillere og foresatte"}</Knapp>
      </div>
      {(deler.feil || digest) && <Varsel tone={deler.feil ? "advarsel" : "info"}>{deler.feil ?? digest}</Varsel>}
    </section>}
  </>;
}

function GodkjennBunn({ g, lost }: { g: AG04Godkjenn; lost: InnboksPost[] }) {
  const lostIder = new Set(lost.map((p) => p.key.replace(/^lost:planAction:/, "")));
  const sjekk = g.lostSjekkpunkter.filter((l) => !lostIder.has(l.id));
  return <>
    {(lost.length > 0 || sjekk.length > 0) && <section aria-label="Løst nylig" className="seksjon">
      <div className="sek-topp"><h2>Løst nylig</h2><span className="kilde">{lost.length + sjekk.length} saker</span></div>
      <div className="liste" role="list">
        {lost.map((p) => <div role="listitem" key={p.key}><Avatar navn={p.fra} liten lys /><span><b>{p.fra}</b><span className="kilde">{p.tittel}</span></span><span className="kilde">{p.lostTekst ?? ""}</span></div>)}
        {sjekk.map((l) => <div role="listitem" key={l.id}><Avatar navn={l.who} liten lys /><span><b>{l.who}</b><span className="kilde">{l.sjekkpunkt}</span></span><span className="kilde">{l.when}</span></div>)}
      </div>
    </section>}
    {g.andreKoer.length > 0 && <div className="knapper"><span className="kilde" style={{ alignSelf: "center" }}>Andre køer</span>
      {g.andreKoer.map((k) => <KnappLenke key={k.href} variant="spok" href={k.href}>{k.label}</KnappLenke>)}
    </div>}
  </>;
}

/* ---------- Caddie-forslag (AG-A08) ---------- */
function CaddieKort({ p, onBorte }: { p: InnboksPost; onBorte: () => void }) {
  const { pending, feil, kjor } = useHandling();
  const [bekreft, setBekreft] = useState(false);
  const h = p.handling;
  if (h.t !== "caddie") return null;
  return <article className="kort">
    <div className="status-rad"><span className="type">Utkast fra Caddie</span><span className="kilde">{p.at}</span></div>
    <b className="undertittel" style={{ fontSize: 16 }}>{p.tittel}</b>
    <p className="forklar"><b>Gjelder:</b> {p.fra}</p>
    <div className="utkast"><span className="hode"><Sparkles className="ikon" aria-hidden />Utkast</span><p>{p.utkast?.tekst ?? "—"}</p></div>
    {p.grunnlag.length > 0 && <p className="kilde">{p.grunnlag.join(" · ")}</p>}
    {feil && <Varsel tone="advarsel">{feil}</Varsel>}
    {bekreft ? <div className="utkast">
      <p><b>Godkjenne forslaget?</b> Utkastet utføres og sendes nå.</p>
      <div className="knapper">
        <Knapp disabled={pending} onClick={() => kjor(() => godkjennCaddieDraft(h.id), onBorte)}>Godkjenn og utfør</Knapp>
        <Knapp variant="spok" onClick={() => setBekreft(false)}>Avbryt</Knapp>
      </div>
    </div> : <div className="knapper">
      <Knapp disabled={pending} onClick={() => setBekreft(true)}>Godkjenn</Knapp>
      {p.lenker.map((l) => <KnappLenke key={l.href} href={l.href}>{l.label}</KnappLenke>)}
      <Knapp variant="spok" disabled={pending} onClick={() => kjor(() => avvisProaktivtForslag(h.id), onBorte)}>Avvis</Knapp>
    </div>}
  </article>;
}

function CaddieForslag({ poster, onBorte }: { poster: InnboksPost[]; onBorte: (k: string) => void }) {
  if (!poster.length) return <Tom tittel="Ingen forslag nå" tekst="Caddie foreslår når data viser et avvik. Forslagene kommer hit." />;
  return <>
    <Varsel tittel="Du godkjenner alt.">Caddie og Jarvis lager bare utkast. Godkjenn, åpne i Caddie eller avvis.</Varsel>
    <div className="to-kort">{poster.map((p) => <CaddieKort key={p.key} p={p} onBorte={() => onBorte(p.key)} />)}</div>
  </>;
}

/* ---------- Datakvalitet (AG-A05 og AG-RD-02) ---------- */
function Datakvalitet({ d }: { d: DatakvalitetData }) {
  return <>
    {d.runder.length === 0
      ? <Tom tittel="Alle runder har grunnlag" tekst="Ingen runder de siste 28 dagene mangler slagdata eller SG." />
      : <>
        <Varsel tittel={`${d.runder.length} ${d.runder.length === 1 ? "runde mangler" : "runder mangler"} grunnlag.`}>SG vises som «—» for disse til spilleren legger inn slag-for-slag med avstand.</Varsel>
        <div className="to-kort">{d.runder.map((r) => <article key={r.id} className="kort">
          <div className="sek-topp"><b className="undertittel" style={{ fontSize: 16 }}>{r.spiller}</b><Pille tone="vent">Mangler grunnlag</Pille></div>
          <p className="kilde">{r.runde}</p>
          <p className="forklar">{r.hvorfor}</p>
          <p className="forklar"><b>Trengs:</b> {r.trengs}</p>
          {r.spillerId && <div className="knapper"><KnappLenke href={`/admin/spillere/${r.spillerId}`}>Spiller 360</KnappLenke></div>}
        </article>)}</div>
      </>}
    <p className="kilde">Siste 28 dager · {d.sjekket} runder sjekket · brutto score</p>
    <div className="to-kort">
      <section aria-label="Importer" className="kort">
        <div className="sek-topp"><h2>Importer siste 7 dager</h2><span className="kilde">TrackMan · GolfBox</span></div>
        <div className="hoved"><strong>—</strong></div>
        <p className="forklar">Appen fører ingen importlogg ennå. Status per import vises her når den finnes.</p>
      </section>
      <section aria-label="Mulige dubletter" className="kort">
        <div className="sek-topp"><h2>Mulige turneringsdubletter</h2><span className="kilde">Manuelt lagt inn</span></div>
        <div className="hoved"><strong>{tallTekst(d.muligeDubletter)}</strong></div>
        <p className="forklar">Turneringer spillere har lagt inn selv, som ikke er slått sammen med en kjent kilde.</p>
        <div className="knapper"><KnappLenke href="/admin/ko?fane=dubletter">Slå sammen</KnappLenke></div>
      </section>
    </div>
  </>;
}

/* ---------- Siden ---------- */
export function AG04Innboks(props: AG04Props) {
  const { tilstand, startFilter, startOppf, dagLabel, visSendt, harEpost, godkjenn, oppfolgingSpillere, datakvalitet, sok } = props;
  const [f, setF] = useState<InnboksFilterId>(startFilter);
  const [o, setO] = useState<OppfStatus | null>(startOppf);
  const [kilde, setKilde] = useState<GodkjennKilde | "rapport" | null>(null);
  const [borte, setBorte] = useState<ReadonlySet<string>>(new Set());
  const poster = useMemo(() => sorterInnboks(props.poster.filter((p) => !borte.has(p.key))), [props.poster, borte]);
  const forsteApne = poster.find((p) => iFilter(p, startFilter) && !p.lost)?.key ?? null;
  const [open, setOpen] = useState<string | null>(startFilter === "alle" ? forsteApne : null);
  const [over, setOver] = useState<OppfStatus | null>(null);
  const flytt = useHandling();

  const velg = (neste: InnboksFilterId) => {
    setF(neste); setO(null); setKilde(null);
    try {
      const q = new URLSearchParams(window.location.search);
      q.delete("o");
      window.history.replaceState(null, "", innboksHref(neste, q));
    } catch { /* adresselinjen er bare bekvemmelighet */ }
  };
  const borteFra = (k: string) => setBorte((s) => new Set(s).add(k));

  const antall = (id: InnboksFilterId) => (id === "datakvalitet" ? datakvalitet.runder.length : tellFilter(poster, id));
  const iFane = poster.filter((p) => iFilter(p, f));
  const apne = iFane.filter((p) => !p.lost && (f !== "godkjenn" || !kilde || kilde === "rapport" || p.godkjennKilde === kilde));
  const lost = iFane.filter((p) => p.lost);
  const visOppf = f === "oppfolging";
  const liste = visOppf ? (o ? iFane.filter((p) => p.oppf === o) : iFane.filter((p) => !p.lost)) : apne;
  const venterTotalt = poster.filter((p) => !p.lost).length;

  const slipp = (st: OppfStatus) => (e: DragEvent) => {
    e.preventDefault(); setOver(null);
    const id = e.dataTransfer.getData(DND);
    if (id) flytt.kjor(() => settOppfolgingsstatus(id, st));
  };

  const underfilter: ReactNode = visOppf
    ? <div role="group" aria-label="Oppfølging" className="under-filter">
      {OPPF_STATUSER.map((st) => <button type="button" key={st.id} aria-pressed={o === st.id} data-over={over === st.id || undefined}
        onClick={() => setO(o === st.id ? null : st.id)}
        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; if (over !== st.id) setOver(st.id); }}
        onDragLeave={() => setOver((v) => (v === st.id ? null : v))}
        onDrop={slipp(st.id)}>{st.label} <b>{iFane.filter((p) => p.oppf === st.id).length}</b></button>)}
    </div>
    : f === "godkjenn"
      ? <div role="group" aria-label="Kilde" className="under-filter">
        {(["motor", "caddie", "foresporsel"] as const).map((k) => <button type="button" key={k} aria-pressed={kilde === k} onClick={() => setKilde(kilde === k ? null : k)}>
          {KILDE_LABEL[k]} <b>{iFane.filter((p) => !p.lost && p.godkjennKilde === k).length}</b></button>)}
        {godkjenn.ukesrapport && <button type="button" aria-pressed={kilde === "rapport"} onClick={() => setKilde(kilde === "rapport" ? null : "rapport")}>Rapport <b>1</b></button>}
      </div>
      : f === "epost"
        ? <div role="group" aria-label="E-post" className="under-filter">
          <Link aria-current={visSendt ? undefined : "page"} href={innboksHref("epost", Object.fromEntries(Object.entries(sok ?? {}).filter(([k]) => k !== "vis")))}>Venter <b>{iFane.filter((p) => !p.lost).length}</b></Link>
          <Link aria-current={visSendt ? "page" : undefined} href={innboksHref("epost", { ...(sok ?? {}), vis: "sendt" })}>Sendt og arkivert</Link>
          <Link href="/admin/kommunikasjon?fane=maler">Maler</Link>
        </div>
        : null;

  const tomTekst = f === "alle"
    ? "Nye saker fra spillere, e-post, motoren og varsler kommer hit."
    : f === "epost" && !harEpost
      ? "E-postinnboksen (post@akgolf.no) er bare for head coach."
      : `Ingen saker under ${INNBOKS_FILTRE.find((x) => x.id === f)?.label ?? f}${visOppf && o ? " · " + OPPF_LABEL[o] : ""}.`;

  const hovedliste = liste.length === 0
    ? <Tom tittel="Alt er håndtert." tekst={tomTekst} />
    : <div className="saker" role="list" aria-label="Saker">{liste.map((p) => <Sak key={p.key} p={p} open={open === p.key}
      onOpen={() => setOpen(open === p.key ? null : p.key)} onBorte={() => borteFra(p.key)} onFilter={velg} dra={visOppf} />)}</div>;

  const topp = <Topp dato={`Innboks · ${dagLabel} · haster først`} tittel="Innboks"
    handlinger={<KnappLenke href="/admin/jarvis"><Sparkles className="ikon" aria-hidden />Jarvis</KnappLenke>} />;

  if (tilstand === "laster") return <div className="agn-s">{topp}<Laster tekst="Henter innboksen …" /></div>;
  if (tilstand === "feil") return <div className="agn-s">{topp}<Feil tittel="Innboksen kunne ikke hentes" tekst="E-post og meldinger hentes på nytt når du prøver igjen. Ingenting er sendt." kode="FEIL · INNBOKS" /></div>;

  return <div className="agn-s">
    {topp}
    <div className="innboks-grid">
      <div className="saker">
        <div className="hoved"><strong>{venterTotalt}</strong><span className="forklar">{venterTotalt === 1 ? "sak venter på deg" : "saker venter på deg"}</span></div>
        <div role="group" aria-label="Vis" className="chips">
          {INNBOKS_FILTRE.map((x) => { const n = antall(x.id); return <button type="button" key={x.id} aria-pressed={f === x.id} onClick={() => velg(x.id)}>{x.label}{n ? <b>{n}</b> : null}</button>; })}
        </div>
        {underfilter}
        {flytt.feil && <Varsel tone="advarsel">{flytt.feil}</Varsel>}
        {f === "caddie" ? <CaddieForslag poster={iFane.filter((p) => !p.lost)} onBorte={borteFra} />
          : f === "datakvalitet" ? <Datakvalitet d={datakvalitet} />
            : <>
              {f === "godkjenn" && <GodkjennTopp g={godkjenn} visRapport={!kilde || kilde === "rapport"} />}
              {!(f === "godkjenn" && kilde === "rapport") && hovedliste}
              {f === "godkjenn" && <GodkjennBunn g={godkjenn} lost={lost} />}
              {f !== "godkjenn" && !visOppf && lost.length > 0 && <section aria-label="Løst" className="seksjon">
                <div className="sek-topp"><h2>{f === "epost" && visSendt ? "Sendt og arkivert" : "Løst siste 7 dager"}</h2><span className="kilde">{lost.length} saker</span></div>
                <div className="saker" role="list">{lost.map((p) => <Sak key={p.key} p={p} open={open === p.key}
                  onOpen={() => setOpen(open === p.key ? null : p.key)} onBorte={() => borteFra(p.key)} onFilter={velg} dra={false} />)}</div>
              </section>}
              {visOppf && <div className="sek-topp">
                <span className="kilde">Dra en sak til Risiko, Følg med, Sjekk eller Løst · av {tallTekst(oppfolgingSpillere)} spillere totalt</span>
                <Link className="lenke" href="/admin/oppsett">Justere regler</Link>
              </div>}
            </>}
      </div>
      <aside aria-label="Om innboksen">
        <div className="kort dempet">
          <b className="undertittel">Slik er innboksen sortert</b>
          <p className="forklar">Haster først, deretter nyeste. Spørsmål fra spiller som er ubesvart i 24 timer, haster.</p>
          <p className="forklar">Jarvis forbereder utkast. Ingenting sendes før du trykker Send.</p>
          <div className="knapper"><KnappLenke href="/admin/jarvis">Spør Jarvis</KnappLenke></div>
        </div>
      </aside>
    </div>
  </div>;
}
