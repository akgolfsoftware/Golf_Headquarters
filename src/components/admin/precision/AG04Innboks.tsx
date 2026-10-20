"use client";

/**
 * AG-04 Innboks, designløftet 20.10.2026. Fasit: canvaset «AgencyOS
 * nøkkelskjermer» (https://claude.ai/artifact/SLdHBGbdK1hiJcep9e42Cy), tavlene
 * Innboks, Innboks-mobil og Innboks-sak-mobil, godkjent av Anders 20.10.
 * PC: lista (Haster · I dag · Tidligere) til venstre og valgt sak til høyre.
 * Mobil: lista, og saken som egen flate. Fanene Caddie-forslag og
 * Datakvalitet følger jarvis.html (AG-A08, AG-A05) i full bredde.
 * «Uka hans hvis du sier ja» fra tegningen vises ikke ennå: ingen sak bærer
 * spillerens uke, og designet krever at den bare vises når data finnes.
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
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { Avatar, Feil, Knapp, KnappLenke, Laster, Nokkelverdier, Pille, Tom, Varsel } from "@/components/admin/agencyos-ny/ny";
import {
  INNBOKS_FILTRE, OPPF_STATUSER, innboksHref, type InnboksFilterId, type OppfStatus,
} from "@/lib/admin/innboks/filter";
import { iFilter, sorterInnboks, tellFilter, type GodkjennKilde, type InnboksPost } from "@/lib/admin/innboks/bygg-innboks";
import { grupperInnboks } from "@/lib/admin/innboks/grupper";
import type { DatakvalitetData } from "@/lib/admin/innboks/last-datakvalitet";
import type { AdminUkesrapportKort } from "@/lib/admin/ko/typer";
import { avgjorInnboksSak } from "@/app/admin/innboks/actions";
import { acceptPlanAction, rejectPlanAction } from "@/lib/agents/actions";
import { avvisProaktivtForslag, godkjennCaddieDraft } from "@/app/admin/agencyos/caddie/dashbord/actions";
// Navnerom-import: måleverktøyets stubb for «use server»-moduler kjenner bare ASCII-navn.
import * as foresporsel from "@/app/admin/(legacy)/foresporsler/actions";
import { batchApproveLowRisk } from "@/app/admin/(legacy)/approvals/actions";
import { delUkesdigestAction } from "@/app/admin/godkjenninger/del-digest-action";
import { settOppfolgingsstatus } from "@/app/admin/queue/actions";
import { svarPaSporsmal } from "@/app/portal/(legacy)/coach/sporsmal/actions";
import { arkiverEpost, lagEpostUtkast, sendGodkjentSvar } from "@/lib/innboks/actions";
import "@/styles/agencyos-ny-cockpit.css";
import "@/styles/agencyos-ny-innboks.css";

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

/** Lead fra Lead-tabellen (NEW/CONTACTED). Bare head coach, som e-posten. */
export type AG04Lead = { id: string; navn: string | null; epost: string; kilde: string; status: string; dato: string };

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
  /** Leads under Oppfølging. null = ikke head coach (vises ikke). */
  leads?: AG04Lead[] | null;
  /** Åpne Leads under Oppfølging (?filter=oppfolging&o=leads). */
  startLeads?: boolean;
  /** Søkeparametre fra adressen, beholdes når fanen byttes. */
  sok?: Record<string, string>;
  /** Saken som åpnes med en gang (?sak=<nøkkel>), også på mobil. */
  startSak?: string | null;
};

const OPPF_LABEL: Record<OppfStatus, string> = Object.fromEntries(OPPF_STATUSER.map((o) => [o.id, o.label])) as Record<OppfStatus, string>;
const KILDE_LABEL: Record<GodkjennKilde, string> = { motor: "Motoren", caddie: "Caddie", foresporsel: "Forespørsler" };
const DND = "application/x-akgolf-oppfolging";
const LEAD_KILDE: Record<string, string> = {
  "provetime-booking": "Prøvetime uten konto", "guide-download": "Guide", newsletter: "Nyhetsbrev",
  "demo-request": "Demo", "for-klubber": "For klubber",
};
const LEAD_STATUS: Record<string, string> = { NEW: "Ny", CONTACTED: "Kontaktet" };
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

/* ---------- Én rad i lista ---------- */
function SakRad({ p, valgt, onVelg, dra }: { p: InnboksPost; valgt: boolean; onVelg: () => void; dra: boolean }) {
  const h = p.handling;
  const dragProps = dra && h.t === "oppf" ? {
    draggable: true,
    onDragStart: (e: DragEvent) => { e.dataTransfer.setData(DND, h.spillerId); e.dataTransfer.effectAllowed = "move"; },
  } : {};
  const etikett = p.oppf ? OPPF_LABEL[p.oppf] : (p.lost && p.lostTekst) || p.merker[0] || p.konto || null;
  return <div role="listitem"><button type="button" aria-pressed={valgt} onClick={onVelg} className={`ibx-rad${p.lost ? " lost" : ""}`} {...dragProps}>
    <span className="ibx-rad-meta"><span className="meta">{p.kind}{etikett ? ` · ${etikett}` : ""}</span><time>{p.at}</time></span>
    <span className="ibx-rad-emne"><b>{p.fra}</b><span>{p.tittel}</span></span>
    <span className="ibx-rad-tekst"><span>{p.tekst}</span>{p.utkast && !p.lost && <span className="ibx-utkast-pille">Utkast klart</span>}</span>
  </button></div>;
}

/* ---------- Den åpne saken ---------- */
function SakDetalj({ p, onBorte, onFilter, onTilbake }: {
  p: InnboksPost; onBorte: () => void; onFilter: (f: InnboksFilterId) => void; onTilbake: () => void;
}) {
  const { pending, feil, kjor } = useHandling();
  const h = p.handling;
  const [txt, setTxt] = useState(p.utkast?.tekst ?? "");
  const [forkastet, setForkastet] = useState(false);
  const [svar, setSvar] = useState<string | null>(null);
  const [grunn, setGrunn] = useState<{ valg: "godkjenn" | "avvis" } | null>(null);
  const [grunnTekst, setGrunnTekst] = useState("");
  const [melding, setMelding] = useState<string | null>(null);
  const visUtkast = p.utkast && !forkastet && svar == null && !p.lost;
  const profil = p.lenker.find((l) => l.label === "Spiller 360") ?? null;
  const andreLenker = p.lenker.filter((l) => l !== profil);
  const meta = [p.kind, p.oppf ? OPPF_LABEL[p.oppf] : null, ...p.merker, p.at].filter(Boolean).join(" · ");

  const epostSend = (tekst: string) => {
    if (h.t !== "epost") return;
    kjor(async () => {
      const res = await sendGodkjentSvar(h.id, tekst);
      setMelding(res.melding);
      if (res.sendtReelt) onBorte();
      return { ok: true };
    });
  };
  const sendSvar = (tekst: string) => {
    if (h.t === "epost") epostSend(tekst);
    else if (h.t === "sporsmal") kjor(() => svarPaSporsmal(h.id, tekst), onBorte);
  };
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

  // «Ferdig» står øverst til høyre, som i tegningen: kvitter ut, arkiver e-post, oppfølging løst.
  const ferdig = p.lost ? null
    : h.t === "epost" && !h.lukket ? () => kjor(() => arkiverEpost(h.id), onBorte)
      : h.t === "oppf" && h.status !== "ok" ? () => kjor(() => settOppfolgingsstatus(h.spillerId, "ok"))
        : h.t === "sak" && h.primaer?.label === "Kvitter ut" && !grunn ? () => avgjorSak("godkjenn")
          : null;

  return <article className="ibx-sak" aria-busy={pending || undefined} aria-label={p.tittel}>
    <button type="button" className="ag-tilbake ibx-tilbake" onClick={onTilbake}><ArrowLeft className="ikon" aria-hidden />Innboks</button>
    <header className="ibx-sak-topp">
      <div className="ibx-sak-tittel">
        <span className="meta">{meta}</span>
        <h2>{p.tittel}</h2>
        {profil ? <Link href={profil.href} className="ibx-profil">{p.fra} · Spiller 360 <ArrowRight className="ikon" aria-hidden /></Link>
          : <span className="ibx-fra">{p.fra}{p.konto ? ` · ${p.konto}` : ""}</span>}
      </div>
      {ferdig && <button type="button" className="knapp sek ibx-ferdig" disabled={pending} onClick={ferdig}><Check className="ikon" aria-hidden />Ferdig</button>}
    </header>

    {p.tekst && <div className="ibx-melding">
      <Avatar navn={p.fra} liten lys />
      <div className="ibx-boble"><p>{p.tekst}</p><span className="num">{p.at}{p.konto ? ` · ${p.konto}` : ""}</span></div>
    </div>}
    {p.detaljer.length > 0 && <Nokkelverdier rader={p.detaljer.map((d) => [d.label, d.tekst] as const)} />}
    {p.grunnlag.length > 0 && <p className="kilde">{p.grunnlag.join(" · ")}</p>}

    {visUtkast && <section aria-label="Utkast" className="ibx-utkast">
      <span className="ibx-utkast-hode"><Sparkles className="ikon" aria-hidden />{p.utkast!.av} har laget utkastet. Ingenting sendes før du trykker Send.</span>
      {h.t === "epost"
        ? <textarea value={txt} aria-label={`Svar til ${p.fra}`} onChange={(e) => setTxt(e.target.value)} />
        : <p className="ibx-utkast-tekst">{txt}</p>}
      <div className="ibx-utkast-knapper">
        {h.t === "epost" && <Knapp stor disabled={pending || !txt.trim()} onClick={() => epostSend(txt)}>Send</Knapp>}
        {h.t === "caddie" && <Knapp stor disabled={pending} onClick={() => kjor(() => godkjennCaddieDraft(h.id), onBorte)}>Send</Knapp>}
        {h.t === "caddie"
          ? <Knapp variant="sek" disabled={pending} onClick={() => kjor(() => avvisProaktivtForslag(h.id), onBorte)}>Forkast utkast</Knapp>
          : <Knapp variant="sek" onClick={() => setForkastet(true)}>Forkast utkast</Knapp>}
      </div>
    </section>}

    {svar != null && <section aria-label="Svar" className="ibx-utkast">
      <label className="felt"><span className="etikett">Svar til {p.fra}</span>
        <textarea value={svar} placeholder={"Svar til " + (p.fra.split(" ")[0] ?? p.fra)} onChange={(e) => setSvar(e.target.value)} /></label>
      <span className="kilde">Du sender. Jarvis lager bare utkast.</span>
      <div className="ibx-utkast-knapper">
        <Knapp stor disabled={pending || !svar.trim()} onClick={() => sendSvar(svar)}>Send</Knapp>
        {h.t === "epost"
          ? <Knapp variant="sek" disabled={pending} onClick={() => kjor(async () => {
            const r = await lagEpostUtkast(h.id);
            if (r.ok) setSvar(r.tekst);
            return r;
          })}><Sparkles className="ikon" aria-hidden />{pending ? "Lager utkast …" : "Lag utkast"}</Knapp>
          : <Knapp variant="sek" disabled title="Jarvis lager ikke utkast til spørsmål fra spillere ennå. Skriv svaret selv.">Lag utkast</Knapp>}
        <Knapp variant="spok" onClick={() => setSvar(null)}>Avbryt</Knapp>
      </div>
    </section>}

    {grunn && <section aria-label="Grunn" className="ibx-utkast">
      <label className="felt"><span className="etikett">Grunn (valgfritt)</span>
        <input type="text" value={grunnTekst} maxLength={500} autoFocus
          onChange={(e) => setGrunnTekst(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") bekreftGrunn(); }} /></label>
      <div className="knapper">
        <Knapp variant="sek" disabled={pending} onClick={bekreftGrunn}>{grunn.valg === "avvis" ? "Avvis" : "Bekreft"}</Knapp>
        <Knapp variant="spok" onClick={() => { setGrunn(null); setGrunnTekst(""); }}>Avbryt</Knapp>
      </div>
    </section>}

    {(feil || melding) && <Varsel tone={feil ? "advarsel" : "info"}>{feil ?? melding}</Varsel>}

    <div className="knapper">
      {h.t === "plan" && !grunn && !p.lost && <>
        <Knapp disabled={pending} onClick={() => kjor(() => acceptPlanAction(h.id), onBorte)}>Godkjenn</Knapp>
        <Knapp variant="sek" disabled={pending} onClick={() => setGrunn({ valg: "avvis" })}>Avvis</Knapp>
      </>}
      {h.t === "foresporsel" && <>
        <Knapp disabled={pending} onClick={() => kjor(() => foresporsel.markerSomPlanlagt(h.id), onBorte)}>Legg i kalenderen</Knapp>
        <Knapp variant="sek" disabled={pending} onClick={() => kjor(() => foresporsel.avslaaForespørsel(h.id), onBorte)}>Kan ikke</Knapp>
      </>}
      {h.t === "sak" && !grunn && <>
        {h.primaer && h.primaer.label !== "Kvitter ut" &&
          <Knapp disabled={pending} onClick={() => (h.primaer!.krevGrunn ? setGrunn({ valg: "godkjenn" }) : avgjorSak("godkjenn"))}>{h.primaer.label}</Knapp>}
        {h.sekundaer && <Knapp variant="sek" disabled={pending} onClick={() => (h.sekundaer!.krevGrunn ? setGrunn({ valg: "avvis" }) : avgjorSak("avvis"))}>{h.sekundaer.label}</Knapp>}
      </>}
      {h.t === "caddieGruppe" && <Knapp variant="sek" onClick={() => onFilter("caddie")}>Se alle {h.antall} under Caddie-forslag</Knapp>}
      {(h.t === "epost" || h.t === "sporsmal") && p.kanSvare && (!p.utkast || forkastet) && svar == null &&
        <Knapp variant="sek" onClick={() => setSvar("")}>Svar</Knapp>}
      {andreLenker.map((l) => <KnappLenke key={l.href + l.label} href={l.href}>{l.label}</KnappLenke>)}
    </div>
    {h.t === "oppf" && <label className="felt flytt">
      <span className="etikett">Flytt sak</span>
      <select aria-label={`Flytt ${p.fra} til status`} value={h.status} disabled={pending}
        onChange={(e) => { const st = e.target.value as OppfStatus; if (st !== h.status) kjor(() => settOppfolgingsstatus(h.spillerId, st)); }}>
        {OPPF_STATUSER.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
    </label>}
  </article>;
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
  const { tilstand, startFilter, startOppf, dagLabel, visSendt, harEpost, godkjenn, oppfolgingSpillere, datakvalitet, sok, leads = null, startLeads = false, startSak = null } = props;
  const [visLeads, setVisLeads] = useState(startLeads && !!leads);
  const [f, setF] = useState<InnboksFilterId>(startFilter);
  const [o, setO] = useState<OppfStatus | null>(startOppf);
  const [kilde, setKilde] = useState<GodkjennKilde | "rapport" | null>(null);
  const [borte, setBorte] = useState<ReadonlySet<string>>(new Set());
  const poster = useMemo(() => sorterInnboks(props.poster.filter((p) => !borte.has(p.key))), [props.poster, borte]);
  // Valgt sak vises i høyre rute på PC. På mobil åpnes den først når coachen trykker (mobilAapen).
  const [valgt, setValgt] = useState<string | null>(startSak);
  const [mobilAapen, setMobilAapen] = useState(!!startSak);
  const [over, setOver] = useState<OppfStatus | null>(null);
  const flytt = useHandling();

  const velg = (neste: InnboksFilterId) => {
    setF(neste); setO(null); setKilde(null); setVisLeads(false); setValgt(null); setMobilAapen(false);
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
  const helBredde = f === "caddie" || f === "datakvalitet";
  const synligLost = f !== "godkjenn" && !visOppf ? lost : [];
  const kandidater = visLeads ? [] : [...liste, ...synligLost];
  const aapen = kandidater.find((p) => p.key === valgt) ?? (helBredde || (f === "godkjenn" && kilde === "rapport") ? null : liste[0] ?? null);

  const velgSak = (k: string) => {
    setValgt(k); setMobilAapen(true);
    try { if (window.matchMedia("(max-width: 899px)").matches) window.scrollTo({ top: 0 }); } catch { /* bare bekvemmelighet */ }
  };
  const fjern = (k: string) => { borteFra(k); setValgt(null); setMobilAapen(false); };

  const slipp = (st: OppfStatus) => (e: DragEvent) => {
    e.preventDefault(); setOver(null);
    const id = e.dataTransfer.getData(DND);
    if (id) flytt.kjor(() => settOppfolgingsstatus(id, st));
  };

  const underfilter: ReactNode = visOppf
    ? <div role="group" aria-label="Oppfølging" className="under-filter">
      {OPPF_STATUSER.map((st) => <button type="button" key={st.id} aria-pressed={o === st.id} data-over={over === st.id || undefined}
        onClick={() => { setVisLeads(false); setO(o === st.id ? null : st.id); }}
        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; if (over !== st.id) setOver(st.id); }}
        onDragLeave={() => setOver((v) => (v === st.id ? null : v))}
        onDrop={slipp(st.id)}>{st.label} <b>{iFane.filter((p) => p.oppf === st.id).length}</b></button>)}
      {leads && <button type="button" aria-pressed={visLeads} onClick={() => { setO(null); setVisLeads(!visLeads); }}>Leads <b>{leads.length}</b></button>}
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

  const rad = (p: InnboksPost, dra: boolean) => <SakRad key={p.key} p={p} valgt={aapen?.key === p.key} onVelg={() => velgSak(p.key)} dra={dra} />;

  const leadListe = visOppf && visLeads && leads
    ? leads.length === 0
      ? <Tom tittel="Ingen nye leads." tekst="Prøvetimer uten konto og forespørsler fra nettsiden kommer hit." />
      : <div className="ibx-leads" role="list" aria-label="Leads">{leads.map((l) => <div role="listitem" key={l.id} className="folg-rad">
        <Avatar navn={l.navn ?? l.epost} liten />
        <span><b>{l.navn ?? l.epost}</b>
          <span className="status-rad"><span className="status-merke lead">Lead</span><span className="type">{LEAD_STATUS[l.status] ?? l.status}</span><span className="kilde">{LEAD_KILDE[l.kilde] ?? (l.kilde || "—")} · {l.dato}</span></span>
        </span>
        <a className="knapp sek" href={`mailto:${l.epost}`}>Skriv e-post</a>
      </div>)}</div>
    : null;

  const hovedliste = leadListe ?? (liste.length === 0
    ? <p className="ibx-tom">{f === "alle" ? "Alt er håndtert her." : tomTekst}{f === "alle" && <><br /><span className="kilde">{tomTekst}</span></>}</p>
    : <div className="ibx-grupper">{grupperInnboks(liste).map((g) => <section key={g.navn} aria-label={g.navn} className="ibx-gruppe">
      <div className="ibx-gruppe-topp"><span className={g.navn === "Haster" ? "haster-pille" : "ibx-gruppe-navn"}>{g.navn}</span><span className="num">{g.poster.length}</span></div>
      <div role="list">{g.poster.map((p) => rad(p, visOppf))}</div>
    </section>)}</div>);

  const topp = <header className="ibx-topp">
    <span className="meta">{dagLabel} · haster først</span>
    <div className="ibx-topp-rad"><h1>Innboks</h1><span className="num">{venterTotalt} {venterTotalt === 1 ? "sak" : "saker"}</span></div>
  </header>;

  if (tilstand === "laster") return <div className="agn-s">{topp}<Laster tekst="Henter innboksen …" /></div>;
  if (tilstand === "feil") return <div className="agn-s">{topp}<Feil tittel="Innboksen kunne ikke hentes" tekst="E-post og meldinger hentes på nytt når du prøver igjen. Ingenting er sendt." kode="FEIL · INNBOKS" /></div>;

  return <div className={`agn-s ibx${helBredde ? " hel" : ""}`} data-mobil-aapen={mobilAapen && aapen ? "" : undefined}>
    <div className="ibx-liste">
      {topp}
      <div role="group" aria-label="Vis" className="chips ibx-filter">
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
            {synligLost.length > 0 && !visLeads && <section aria-label="Løst" className="ibx-gruppe">
              <div className="ibx-gruppe-topp"><span className="ibx-gruppe-navn">{f === "epost" && visSendt ? "Sendt og arkivert" : "Løst siste 7 dager"}</span><span className="num">{synligLost.length}</span></div>
              <div role="list">{synligLost.map((p) => rad(p, false))}</div>
            </section>}
            {visOppf && <div className="sek-topp ibx-hint">
              <span className="kilde">Dra en sak til Risiko, Følg med, Sjekk eller Løst · av {tallTekst(oppfolgingSpillere)} spillere totalt</span>
              <Link className="lenke" href="/admin/oppsett">Justere regler</Link>
            </div>}
          </>}
    </div>
    {!helBredde && <div className="ibx-rute">
      {aapen
        ? <SakDetalj key={aapen.key} p={aapen} onBorte={() => fjern(aapen.key)} onFilter={velg} onTilbake={() => setMobilAapen(false)} />
        : <p className="ibx-ingen">{visLeads ? "Leads besvares på e-post." : "Velg en sak i lista."}</p>}
    </div>}
  </div>;
}
