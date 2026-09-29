"use client";

/**
 * AG-04 Innboks i Precision Athletics (Claude Design 7d7c2994,
 * ui_kits/agencyos/screens/AG-innboks.jsx, runde 26/28, med AG-04-HASTER og
 * AG-04-OPP). Fanene Caddie-forslag og Datakvalitet følger AG-A08, AG-A05 og
 * AG-RD-02 (screens/AG-A2.jsx og AG-RD.jsx; plassering i _shared/ia.js).
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
import { useRouter } from "next/navigation";
import {
  Check, CheckCheck, ChevronDown, ChevronUp, Pencil, Reply, Send, Sparkles, Trash2, TriangleAlert, X,
} from "lucide-react";
import { FeilTilstand, Ikon, Knapp, KnappLenke, LasterTilstand, Meta, StatusPille, Tall, TomTilstand } from "@/components/precision/pa";
import { InlineVarsel, Nokkelverdi, ValgFelt } from "@/components/precision/pa-a5";
import { Avatar, SidehodeMedHandling, Tekstomrade, UtkastMerke, Valgpille } from "@/components/precision/pa-innboks";
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
import "@/styles/precision-a7.css";

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
  const sub = [p.kind, p.konto, p.at].filter(Boolean).join(" · ").toUpperCase();
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

  return <div role="listitem" className="pa-a7-sak" data-lost={p.lost || undefined} aria-busy={pending || undefined} {...dragProps}>
    <button type="button" aria-expanded={open} onClick={onOpen} className="pa-a7-sak__hode">
      <Avatar navn={p.fra} size={32} />
      <span className="pa-a7-sak__tekst">
        <span className="pa-a7-sak__linje">
          <span className="pa-a7-sak__fra">{p.fra}</span>
          {p.haster && <StatusPille tone="warn">Haster</StatusPille>}
          {p.oppf && <StatusPille>{OPPF_LABEL[p.oppf]}</StatusPille>}
          {p.merker.map((m) => <StatusPille key={m}>{m}</StatusPille>)}
          {p.lost && p.lostTekst && !p.oppf && <StatusPille tone="ok">{p.lostTekst}</StatusPille>}
          {visUtkast && <UtkastMerke>{"Utkast · " + p.utkast!.av}</UtkastMerke>}
        </span>
        <span className="pa-a7-sak__tittel">{p.tittel}</span>
        <Meta>{sub}</Meta>
      </span>
      <Ikon icon={open ? ChevronUp : ChevronDown} size={16} name={open ? "chevron-up" : "chevron-down"} />
    </button>
    {open && <div className="pa-a7-sak__kropp">
      <p className="pa-a7-p">{p.tekst}</p>
      {p.detaljer.length > 0 && <Nokkelverdi items={p.detaljer.map((d) => [d.label, d.tekst] as const)} />}
      {p.grunnlag.length > 0 && <Meta>{p.grunnlag.join(" · ").toUpperCase()}</Meta>}

      {visUtkast && <div className="pa-a7-blokk pa-a7-blokk--utkast">
        <Meta>{`UTKAST FRA ${p.utkast!.av.toUpperCase()} · SENDES IKKE UTEN TRYKK${p.konto ? " · FRA " + p.konto.toUpperCase() : ""}`}</Meta>
        {red ? <Tekstomrade rows={4} value={txt} aria-label="Rediger utkast" onChange={(e) => setTxt(e.target.value)} />
          : <p className="pa-a7-p pa-a7-p--dempet">{txt}</p>}
        {h.t === "epost" && <div className="pa-a7-knapper">
          <Knapp size="sm" icon={Send} iconName="send" disabled={pending || !txt.trim()} onClick={() => epostSend(txt)}>Send</Knapp>
          <Knapp size="sm" variant="secondary" icon={Pencil} iconName="pencil" onClick={() => setRed(!red)}>{red ? "Ferdig redigert" : "Rediger"}</Knapp>
          <Knapp size="sm" variant="ghost" icon={Trash2} iconName="trash-2" onClick={() => { setForkastet(true); setRed(false); }}>Forkast</Knapp>
        </div>}
        {h.t === "caddie" && <div className="pa-a7-knapper">
          <Knapp size="sm" icon={Send} iconName="send" disabled={pending} onClick={() => kjor(() => godkjennCaddieDraft(h.id), onBorte)}>Send</Knapp>
          <Knapp size="sm" variant="ghost" icon={Trash2} iconName="trash-2" disabled={pending} onClick={() => kjor(() => avvisProaktivtForslag(h.id), onBorte)}>Forkast</Knapp>
        </div>}
      </div>}

      {svar != null && <div className="pa-a7-blokk">
        <Tekstomrade rows={4} value={svar} aria-label={"Svar til " + p.fra} placeholder={"Svar til " + (p.fra.split(" ")[0] ?? p.fra)} onChange={(e) => setSvar(e.target.value)} />
        <Meta>DU SENDER · JARVIS LAGER BARE UTKAST</Meta>
        <div className="pa-a7-knapper">
          <Knapp size="sm" icon={Send} iconName="send" disabled={pending || !svar.trim()} onClick={() => sendSvar(svar)}>Send</Knapp>
          <Knapp size="sm" variant="secondary" icon={Sparkles} iconName="sparkles" disabled title="Jarvis lager ikke utkast på forespørsel ennå. Skriv svaret selv.">Lag utkast</Knapp>
          <Knapp size="sm" variant="ghost" onClick={() => setSvar(null)}>Avbryt</Knapp>
        </div>
      </div>}

      {grunn && <div className="pa-a7-blokk">
        <label className="pa-field">
          <span className="pa-field__label">Grunn (valgfritt)</span>
          <span className="pa-control"><input type="text" value={grunnTekst} maxLength={500} autoFocus
            onChange={(e) => setGrunnTekst(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") bekreftGrunn(); }} /></span>
        </label>
        <div className="pa-a7-knapper">
          <Knapp size="sm" variant="secondary" disabled={pending} onClick={bekreftGrunn}>{grunn.valg === "avvis" ? "Avvis" : "Bekreft"}</Knapp>
          <Knapp size="sm" variant="ghost" onClick={() => { setGrunn(null); setGrunnTekst(""); }}>Avbryt</Knapp>
        </div>
      </div>}

      {(feil || melding) && <InlineVarsel tone={feil ? "warn" : "info"}>{feil ?? melding}</InlineVarsel>}

      <div className="pa-a7-knapper">
        {h.t === "plan" && !grunn && <>
          <Knapp size="sm" icon={Check} iconName="check" disabled={pending} onClick={() => kjor(() => acceptPlanAction(h.id), onBorte)}>Godkjenn</Knapp>
          <Knapp size="sm" variant="secondary" disabled={pending} onClick={() => setGrunn({ valg: "avvis" })}>Avvis</Knapp>
        </>}
        {h.t === "foresporsel" && <>
          <Knapp size="sm" icon={Check} iconName="check" disabled={pending} onClick={() => kjor(() => foresporsel.markerSomPlanlagt(h.id), onBorte)}>Legg i kalenderen</Knapp>
          <Knapp size="sm" variant="secondary" disabled={pending} onClick={() => kjor(() => foresporsel.avslaaForespørsel(h.id), onBorte)}>Kan ikke</Knapp>
        </>}
        {h.t === "sak" && !grunn && <>
          {h.primaer && (h.primaer.label === "Kvitter ut"
            ? <Knapp size="sm" variant="ghost" icon={Check} iconName="check" disabled={pending} onClick={() => avgjorSak("godkjenn")}>Ferdig</Knapp>
            : <Knapp size="sm" disabled={pending} onClick={() => (h.primaer!.krevGrunn ? setGrunn({ valg: "godkjenn" }) : avgjorSak("godkjenn"))}>{h.primaer.label}</Knapp>)}
          {h.sekundaer && <Knapp size="sm" variant="secondary" disabled={pending} onClick={() => (h.sekundaer!.krevGrunn ? setGrunn({ valg: "avvis" }) : avgjorSak("avvis"))}>{h.sekundaer.label}</Knapp>}
        </>}
        {h.t === "caddieGruppe" && <Knapp size="sm" variant="secondary" onClick={() => onFilter("caddie")}>Se alle {h.antall} under Caddie-forslag</Knapp>}
        {(h.t === "epost" || h.t === "sporsmal") && p.kanSvare && (!p.utkast || forkastet) && svar == null &&
          <Knapp size="sm" variant="secondary" icon={Reply} iconName="reply" onClick={() => setSvar("")}>Svar</Knapp>}
        {p.lenker.map((l) => <KnappLenke key={l.href + l.label} size="sm" variant="secondary" href={l.href}>{l.label}</KnappLenke>)}
        {h.t === "epost" && !h.lukket && <Knapp size="sm" variant="ghost" icon={Check} iconName="check" disabled={pending} onClick={() => kjor(() => arkiverEpost(h.id), onBorte)}>Ferdig</Knapp>}
        {h.t === "oppf" && h.status !== "ok" && <Knapp size="sm" variant="ghost" icon={Check} iconName="check" disabled={pending} onClick={() => kjor(() => settOppfolgingsstatus(h.spillerId, "ok"))}>Ferdig</Knapp>}
      </div>
      {h.t === "oppf" && <div className="pa-a7-flytt">
        <label className="pa-field">
          <span className="pa-field__label">Flytt sak</span>
          <ValgFelt aria-label={`Flytt ${p.fra} til status`} value={h.status} disabled={pending}
            options={OPPF_STATUSER.map((o) => ({ value: o.id, label: o.label }))}
            onChange={(e) => { const s = e.target.value as OppfStatus; if (s !== h.status) kjor(() => settOppfolgingsstatus(h.spillerId, s)); }} />
        </label>
      </div>}
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
    <div className="pa-a7-rad">
      <Meta>{[
        `VENTER ${g.venter}`, `LAV RISIKO ${g.lavRisiko}`,
        `ELDSTE ${g.eldste ? `${g.eldste.dagerLabel.toUpperCase()} · ${g.eldste.who.toUpperCase()}` : "—"}`,
        `GODKJENT 7 DG ${tallTekst(g.godkjent7Dager)}`, `AVVIST ${tallTekst(g.avvist7Dager)}`,
      ].join(" · ")}</Meta>
      {g.lavRisiko > 0 && <Knapp size="sm" variant="secondary" icon={CheckCheck} iconName="check-check" loading={pending} loadingText="Godkjenner …"
        onClick={() => kjor(async () => { const r = await batchApproveLowRisk(); setMelding(`${r.godkjent} av ${g.lavRisiko} godkjent.`); return r; })}>
        {`Godkjenn ${g.lavRisiko} med lav risiko samlet`}
      </Knapp>}
    </div>
    {(feil || melding) && <InlineVarsel tone={feil ? "warn" : "ok"}>{feil ?? melding}</InlineVarsel>}
    {visRapport && g.ukesrapport && <section aria-label="Ukesrapport" className="pa-card pa-a7-kort">
      <div className="pa-a7-rad"><span className="kicker">{`Ukesrapport · uke ${g.ukesrapport.ukenummer}`}</span><Meta>{g.ukesrapport.when.toUpperCase()}</Meta></div>
      <p className="pa-a7-p pa-a7-p--dempet">Rapportagenten leser plan, logg, runder og tester. Den skriver aldri noe selv. Alt under er telt, ikke vurdert. Leses, godkjennes ikke.</p>
      <Nokkelverdi kolonner={2} items={g.ukesrapport.tall.map((t) => [t.key, t.verdi, t.nevner] as const)} />
      {g.ukesrapport.hvorfor.length > 0 && <details className="pa-a7-detaljer"><summary>Hvorfor?</summary>
        <ul>{g.ukesrapport.hvorfor.map((x, i) => <li key={i}>{x}</li>)}</ul></details>}
      <div className="pa-a7-knapper">
        <Knapp size="sm" variant="secondary" loading={deler.pending} loadingText="Deler …"
          onClick={() => deler.kjor(async () => { const r = await delUkesdigestAction(); setDigest(r.melding); return { ok: true }; })}>Del digest med spillere og foresatte</Knapp>
      </div>
      {(deler.feil || digest) && <InlineVarsel tone={deler.feil ? "warn" : "info"}>{deler.feil ?? digest}</InlineVarsel>}
    </section>}
  </>;
}

function GodkjennBunn({ g, lost }: { g: AG04Godkjenn; lost: InnboksPost[] }) {
  const lostIder = new Set(lost.map((p) => p.key.replace(/^lost:planAction:/, "")));
  const sjekk = g.lostSjekkpunkter.filter((l) => !lostIder.has(l.id));
  return <>
    {(lost.length > 0 || sjekk.length > 0) && <section aria-label="Løst nylig" className="pa-card pa-a7-kort">
      <div className="pa-a7-rad"><span className="kicker">Løst nylig</span><Meta>{`${lost.length + sjekk.length} SAKER`}</Meta></div>
      <div role="list">
        {lost.map((p) => <div role="listitem" key={p.key} className="pa-a7-linje">
          <span className="pa-a7-linje__tekst">{`${p.fra} · ${p.tittel}`}</span><Meta>{(p.lostTekst ?? "").toUpperCase()}</Meta>
        </div>)}
        {sjekk.map((l) => <div role="listitem" key={l.id} className="pa-a7-linje">
          <span className="pa-a7-linje__tekst">{`${l.who} · ${l.sjekkpunkt}`}</span><Meta>{l.when.toUpperCase()}</Meta>
        </div>)}
      </div>
    </section>}
    {g.andreKoer.length > 0 && <div className="pa-a7-rad pa-a7-rad--start">
      <Meta>ANDRE KØER</Meta>
      {g.andreKoer.map((k) => <KnappLenke key={k.href} size="sm" variant="ghost" href={k.href}>{k.label}</KnappLenke>)}
    </div>}
  </>;
}

/* ---------- Caddie-forslag (AG-A08) ---------- */
function CaddieKort({ p, onBorte }: { p: InnboksPost; onBorte: () => void }) {
  const { pending, feil, kjor } = useHandling();
  const [bekreft, setBekreft] = useState(false);
  const h = p.handling;
  if (h.t !== "caddie") return null;
  return <article className="pa-card pa-a7-kort">
    <div className="pa-a7-rad pa-a7-rad--start"><StatusPille>Utkast fra Caddie</StatusPille><Meta>{p.at.toUpperCase()}</Meta></div>
    <h3 className="pa-a7-h3">{p.tittel}</h3>
    <p className="pa-a7-p pa-a7-p--dempet"><b>Gjelder:</b> {p.fra}</p>
    <p className="pa-a7-p"><b>Utkast:</b> {p.utkast?.tekst ?? "—"}</p>
    {p.grunnlag.length > 0 && <Meta>{p.grunnlag.join(" · ").toUpperCase()}</Meta>}
    {feil && <InlineVarsel tone="warn">{feil}</InlineVarsel>}
    {bekreft ? <div className="pa-a7-blokk">
      <p className="pa-a7-p"><b>Godkjenne forslaget?</b> Utkastet utføres og sendes nå.</p>
      <div className="pa-a7-knapper">
        <Knapp size="sm" icon={Check} iconName="check" disabled={pending} onClick={() => kjor(() => godkjennCaddieDraft(h.id), onBorte)}>Godkjenn og utfør</Knapp>
        <Knapp size="sm" variant="ghost" onClick={() => setBekreft(false)}>Avbryt</Knapp>
      </div>
    </div> : <div className="pa-a7-knapper">
      <Knapp size="sm" icon={Check} iconName="check" disabled={pending} onClick={() => setBekreft(true)}>Godkjenn</Knapp>
      {p.lenker.map((l) => <KnappLenke key={l.href} size="sm" variant="secondary" href={l.href}>{l.label}</KnappLenke>)}
      <Knapp size="sm" variant="ghost" icon={X} iconName="x" disabled={pending} onClick={() => kjor(() => avvisProaktivtForslag(h.id), onBorte)}>Avvis</Knapp>
    </div>}
  </article>;
}

function CaddieForslag({ poster, onBorte }: { poster: InnboksPost[]; onBorte: (k: string) => void }) {
  if (!poster.length) return <TomTilstand icon={Sparkles} title="Ingen forslag nå" text="Caddie foreslår når data viser et avvik. Forslagene kommer hit." />;
  return <>
    <InlineVarsel tone="info" tittel="Du godkjenner alt.">Caddie og Jarvis lager bare utkast. Godkjenn, åpne i Caddie eller avvis.</InlineVarsel>
    <div className="pa-a7-grid">{poster.map((p) => <CaddieKort key={p.key} p={p} onBorte={() => onBorte(p.key)} />)}</div>
  </>;
}

/* ---------- Datakvalitet (AG-A05 og AG-RD-02) ---------- */
function Datakvalitet({ d }: { d: DatakvalitetData }) {
  return <>
    {d.runder.length === 0
      ? <TomTilstand icon={Check} title="Alle runder har grunnlag" text="Ingen runder de siste 28 dagene mangler slagdata eller SG." />
      : <>
        <InlineVarsel tone="info" tittel={`${d.runder.length} ${d.runder.length === 1 ? "runde mangler" : "runder mangler"} grunnlag.`}>SG vises som «—» for disse til spilleren legger inn slag-for-slag med avstand.</InlineVarsel>
        <div className="pa-a7-grid">{d.runder.map((r) => <article key={r.id} className="pa-card pa-a7-kort">
          <div className="pa-a7-rad"><span className="pa-a7-h3">{r.spiller}</span><StatusPille>Mangler grunnlag</StatusPille></div>
          <Meta>{r.runde.toUpperCase()}</Meta>
          <p className="pa-a7-p">{r.hvorfor}</p>
          <p className="pa-a7-p pa-a7-p--dempet"><b>Trengs:</b> {r.trengs}</p>
          <div className="pa-a7-knapper pa-a7-knapper--skille"><KnappLenke size="sm" variant="secondary" href={`/admin/spillere/${r.spillerId}`}>Spiller 360</KnappLenke></div>
        </article>)}</div>
      </>}
    <Meta>{`SISTE 28 DAGER · ${d.sjekket} RUNDER SJEKKET · BRUTTO SCORE`}</Meta>
    <div className="pa-a7-grid pa-a7-grid--2">
      <section aria-label="Importer" className="pa-card pa-a7-kort">
        <div className="pa-a7-rad"><span className="kicker">Importer siste 7 dager</span><Meta>TRACKMAN · GOLFBOX</Meta></div>
        <Tall>—</Tall>
        <p className="pa-a7-p pa-a7-p--dempet">Appen fører ingen importlogg ennå. Status per import vises her når den finnes.</p>
      </section>
      <section aria-label="Mulige dubletter" className="pa-card pa-a7-kort">
        <div className="pa-a7-rad"><span className="kicker">Mulige turneringsdubletter</span><Meta>MANUELT LAGT INN</Meta></div>
        <Tall>{tallTekst(d.muligeDubletter)}</Tall>
        <p className="pa-a7-p pa-a7-p--dempet">Turneringer spillere har lagt inn selv, som ikke er slått sammen med en kjent kilde.</p>
        <div className="pa-a7-knapper"><KnappLenke size="sm" variant="secondary" href="/admin/ko?fane=dubletter">Slå sammen</KnappLenke></div>
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

  const slipp = (s: OppfStatus) => (e: DragEvent) => {
    e.preventDefault(); setOver(null);
    const id = e.dataTransfer.getData(DND);
    if (id) flytt.kjor(() => settOppfolgingsstatus(id, s));
  };

  const underfilter: ReactNode = visOppf
    ? <div role="group" aria-label="Oppfølging" className="pa-a7-under">
      {OPPF_STATUSER.map((s) => <Valgpille key={s.id} valgt={o === s.id} data-over={over === s.id || undefined}
        onClick={() => setO(o === s.id ? null : s.id)}
        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; if (over !== s.id) setOver(s.id); }}
        onDragLeave={() => setOver((v) => (v === s.id ? null : v))}
        onDrop={slipp(s.id)}>{`${s.label} · ${iFane.filter((p) => p.oppf === s.id).length}`}</Valgpille>)}
    </div>
    : f === "godkjenn"
      ? <div role="group" aria-label="Kilde" className="pa-a7-under">
        {(["motor", "caddie", "foresporsel"] as const).map((k) => <Valgpille key={k} valgt={kilde === k} onClick={() => setKilde(kilde === k ? null : k)}>
          {`${KILDE_LABEL[k]} · ${iFane.filter((p) => !p.lost && p.godkjennKilde === k).length}`}</Valgpille>)}
        {godkjenn.ukesrapport && <Valgpille valgt={kilde === "rapport"} onClick={() => setKilde(kilde === "rapport" ? null : "rapport")}>Rapport · 1</Valgpille>}
      </div>
      : f === "epost"
        ? <div role="group" aria-label="E-post" className="pa-a7-under">
          <KnappLenke size="sm" variant={visSendt ? "ghost" : "secondary"} href={innboksHref("epost", Object.fromEntries(Object.entries(sok ?? {}).filter(([k]) => k !== "vis")))}>{`Venter · ${iFane.filter((p) => !p.lost).length}`}</KnappLenke>
          <KnappLenke size="sm" variant={visSendt ? "secondary" : "ghost"} href={innboksHref("epost", { ...(sok ?? {}), vis: "sendt" })}>Sendt og arkivert</KnappLenke>
          <KnappLenke size="sm" variant="ghost" href="/admin/kommunikasjon?fane=maler">Maler</KnappLenke>
        </div>
        : null;

  const tomTekst = f === "alle"
    ? "Nye saker fra spillere, e-post, motoren og varsler kommer hit."
    : f === "epost" && !harEpost
      ? "E-postinnboksen (post@akgolf.no) er bare for head coach."
      : `Ingen saker under ${INNBOKS_FILTRE.find((x) => x.id === f)?.label ?? f}${visOppf && o ? " · " + OPPF_LABEL[o] : ""}.`;

  const hovedliste = liste.length === 0
    ? <TomTilstand icon={CheckCheck} title="Alt er håndtert." text={tomTekst} />
    : <section aria-label="Saker" className="pa-card pa-a7-liste">
      <div role="list">{liste.map((p) => <Sak key={p.key} p={p} open={open === p.key}
        onOpen={() => setOpen(open === p.key ? null : p.key)} onBorte={() => borteFra(p.key)} onFilter={velg} dra={visOppf} />)}</div>
    </section>;

  return <div className="pa-side pa-a7-side">
    <SidehodeMedHandling kicker={`Innboks · ${dagLabel}`} tittel="Innboks"
      handlinger={<KnappLenke variant="secondary" icon={Sparkles} iconName="sparkles" href="/admin/jarvis">Jarvis</KnappLenke>} />
    {tilstand === "laster" ? <LasterTilstand text="Henter innboksen …" />
      : tilstand === "feil" ? <FeilTilstand icon={TriangleAlert} title="Innboksen kunne ikke hentes" text="E-post og meldinger hentes på nytt når du prøver igjen. Ingenting er sendt." code="FEIL · INNBOKS" />
        : <>
          <div role="group" aria-label="Filter" className="pa-a7-filter">
            {INNBOKS_FILTRE.map((x) => { const n = antall(x.id); return <Valgpille key={x.id} valgt={f === x.id} onClick={() => velg(x.id)}>{x.label + (n ? " · " + n : "")}</Valgpille>; })}
          </div>
          {underfilter}
          {flytt.feil && <InlineVarsel tone="warn">{flytt.feil}</InlineVarsel>}
          {f === "caddie" ? <CaddieForslag poster={iFane.filter((p) => !p.lost)} onBorte={borteFra} />
            : f === "datakvalitet" ? <Datakvalitet d={datakvalitet} />
              : <>
                {f === "godkjenn" && <GodkjennTopp g={godkjenn} visRapport={!kilde || kilde === "rapport"} />}
                {!(f === "godkjenn" && kilde === "rapport") && hovedliste}
                {f === "godkjenn" && <GodkjennBunn g={godkjenn} lost={lost} />}
                {f !== "godkjenn" && !visOppf && lost.length > 0 && <section aria-label="Løst" className="pa-card pa-a7-kort">
                  <div className="pa-a7-rad"><span className="kicker">{f === "epost" && visSendt ? "Sendt og arkivert" : "Løst siste 7 dager"}</span><Meta>{`${lost.length} SAKER`}</Meta></div>
                  <div role="list">{lost.map((p) => <Sak key={p.key} p={p} open={open === p.key}
                    onOpen={() => setOpen(open === p.key ? null : p.key)} onBorte={() => borteFra(p.key)} onFilter={velg} dra={false} />)}</div>
                </section>}
                {visOppf && <div className="pa-a7-rad">
                  <Meta>{`DRA EN SAK TIL RISIKO, FØLG MED, SJEKK ELLER LØST · AV ${tallTekst(oppfolgingSpillere)} SPILLERE TOTALT`}</Meta>
                  <KnappLenke size="sm" variant="ghost" href="/admin/oppsett">Justere regler</KnappLenke>
                </div>}
              </>}
          <Meta>HASTER FØRST, DERETTER NYESTE · SPØRSMÅL FRA SPILLER UBESVART I 24 T MERKES HASTER · RISIKO ER FILTER UNDER OPPFØLGING · JARVIS-CHATTEN HAR EGEN SIDE</Meta>
        </>}
  </div>;
}

