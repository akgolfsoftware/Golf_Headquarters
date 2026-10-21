"use client";

/**
 * PH-25 Meg › Innstillinger › Samtykker i nytt design: helsedata, deling med eksterne miljøer,
 * nedlasting av dataene og «Slett kontoen min» bak en dialog der spilleren skriver SLETT (rust bekreft).
 * Fasit: docs/design-system/utkast-playerhq/meg.html (utkast 1, «Innstillinger» og «Deling»).
 * Stil: src/styles/playerhq-ny-meg.css (brytere, liste, dialog).
 *
 * Samme logikk og samme server-handlinger som før (HelseSamtykkeKort, DelingSamtykkeKort,
 * PersonvernActions): settEgetHelseSamtykke, giDelingsSamtykke/trekkDelingsSamtykke,
 * exportUserData og opprettGdprForesporsel. Under 16 kan spilleren slå av, men ikke på (art. 7-3).
 *
 * Avvik:
 *   - WANGs test- og planforespørsel vises med sin egen komponent (WangTestforesporsel) i `ekstra`.
 *   - Begrunnelse for sletting er valgfri og beholdt fra forrige versjon.
 *   - Ingen riggrad i tests/visual/skjerm-mapping.ts; målt med tests/visual/precision/maal.mjs PH-25-PERSONVERN.
 */
import { useRef, useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft, Download, HeartPulse, Share2, ShieldCheck } from "lucide-react";
import type { HelseSamtykkeType } from "@/lib/health/samtykke-regler";
import { settEgetHelseSamtykke } from "@/app/portal/meg/innstillinger/personvern/helse-samtykke-actions";
import { giDelingsSamtykke, trekkDelingsSamtykke } from "@/app/portal/meg/innstillinger/personvern/deling-samtykke-actions";
import { exportUserData } from "@/app/portal/meg/innstillinger/actions";
import { opprettGdprForesporsel } from "@/lib/moderering/actions";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-meg.css";
import { SkraFlyt, SkraTopp } from "@/components/precision/skra/Skra";
import "@/styles/playerhq-ny-idag.css";
import "@/styles/playerhq-ny-lister-skra.css";
import "@/styles/playerhq-ny-pakke5-skra.css";

export type PH25PersonvernHelse = {
  wearable: boolean;
  manuell: boolean;
  coachInnsyn: boolean;
  coachDetalj: boolean;
  /** ISO-dato for når et av innsamlings-samtykkene sist ble gitt. */
  sistGittAt: string | null;
  /** Under 16: bare foresatt kan slå helsesamtykket på. */
  krevesForesatt: boolean;
};
export type PH25PersonvernGruppe = { gruppeId: string; gruppeNavn: string; testResultater: boolean; stats: boolean };
type Samtykketekst = { tittel: string; forklaring: string; punkter: string[] };
export type PH25PersonvernData = {
  helse: PH25PersonvernHelse;
  /** Fra HELSE_SAMTYKKE_TEKST og DELING_SAMTYKKE_TEKST: samme tekst som versjonen som lagres. */
  tekst: { helse: Record<HelseSamtykkeType, Samtykketekst>; deling: Record<"TEST_RESULTATER" | "STATS", Samtykketekst> };
  grupper: PH25PersonvernGruppe[];
  /** Under 16: bare foresatt kan slå delingen på. */
  delingKrevesForesatt: boolean;
};

type Valg = { wearable: boolean; manuell: boolean; coachInnsyn: boolean; coachDetalj: boolean };
const FELT: Record<HelseSamtykkeType, keyof Valg> = {
  WEARABLE_HELSE: "wearable",
  MANUELL_HELSE: "manuell",
  COACH_INNSYN: "coachInnsyn",
  COACH_DETALJ: "coachDetalj",
};
type EmbedScope = "TEST_RESULTATER" | "STATS";
const SCOPE_FELT: Record<EmbedScope, "testResultater" | "stats"> = { TEST_RESULTATER: "testResultater", STATS: "stats" };

/** Speiler avhengighetene serveren håndhever (beregnSamtykkeStatus), så bryterne ikke blinker. */
function ryddValg(v: Valg): Valg {
  const coachInnsyn = (v.wearable || v.manuell) && v.coachInnsyn;
  return { ...v, coachInnsyn, coachDetalj: coachInnsyn && v.coachDetalj };
}

const formatDato = (iso: string) => new Date(iso).toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Oslo" });
const Pille = ({ paa }: { paa: boolean }) => <span className={`phn-pille ${paa ? "ok" : "noy"}`}><i />{paa ? "På" : "Av"}</span>;

function Bryter({ paa, tittel, kilde, punkter, onChange, laast }: { paa: boolean; tittel: string; kilde: string; punkter?: string[]; onChange: (v: boolean) => void; laast?: boolean }) {
  return <div className="bryter-rad">
    <span>
      <b>{tittel}</b><span className="phn-kilde">{kilde}</span>
      {punkter && punkter.length > 0 && <ul className="phn-kilde" style={{ margin: "6px 0 0", paddingLeft: 18 }}>{punkter.map((p) => <li key={p}>{p}</li>)}</ul>}
    </span>
    <button type="button" className="bryter" role="switch" aria-checked={paa} aria-label={tittel} disabled={laast} onClick={() => onChange(!paa)} />
  </div>;
}

function Kvittering({ pending, feil, lagret, hvile }: { pending: boolean; feil: string | null; lagret: boolean; hvile: string }) {
  return <p className={feil ? "phn-melding" : "phn-kilde"} role={feil ? "alert" : "status"}>
    {pending ? "Lagrer …" : feil ?? (lagret ? "Samtykke lagret. Endringen er logget." : hvile)}
  </p>;
}

function Helse({ data, tekster }: { data: PH25PersonvernHelse; tekster: Record<HelseSamtykkeType, Samtykketekst> }) {
  const [valg, setValg] = useState<Valg>({ wearable: data.wearable, manuell: data.manuell, coachInnsyn: data.coachInnsyn, coachDetalj: data.coachDetalj });
  const [feil, setFeil] = useState<string | null>(null);
  const [lagret, setLagret] = useState(false);
  const [pending, start] = useTransition();
  const harKilde = valg.wearable || valg.manuell;

  function endre(type: HelseSamtykkeType, ny: boolean) {
    if (pending) return;
    if (data.krevesForesatt && ny) return; // under 16: kan ikke slå på selv
    setFeil(null); setLagret(false);
    const forrige = valg;
    setValg(ryddValg({ ...valg, [FELT[type]]: ny }));
    start(async () => {
      try {
        const svar = await settEgetHelseSamtykke(type, ny);
        if (!svar.ok) { setValg(forrige); setFeil(svar.feil); return; }
        setLagret(true);
      } catch { setValg(forrige); setFeil("Kunne ikke lagre. Prøv igjen."); }
    });
  }

  const bryter = (type: HelseSamtykkeType) => {
    const t = tekster[type];
    const paa = valg[FELT[type]];
    return <Bryter key={type} paa={paa} tittel={t.tittel} kilde={t.forklaring} punkter={t.punkter} laast={data.krevesForesatt && !paa} onChange={(v) => endre(type, v)} />;
  };

  return <section className="phn-seksjon" aria-labelledby="pv-helse">
    <div className="phn-sek-topp"><h2 id="pv-helse"><HeartPulse size={18} aria-hidden style={{ verticalAlign: "-3px", marginRight: 6 }} />Helsedata</h2><Pille paa={harKilde} /></div>
    <p className="phn-forklar">Søvn, puls og restitusjon er sensitive opplysninger, enten klokka måler dem eller du fyller dem ut selv. Du bestemmer hva vi lagrer og hva coachen din får se, og kan ombestemme deg når som helst.</p>
    {data.krevesForesatt && <div className="u16-merke" role="note"><ShieldCheck size={22} aria-hidden /><span><b>Under 16 år</b><span className="phn-forklar">En foresatt må godkjenne dette i foreldreportalen før vi kan hente helsedata. Du kan alltid slå det av selv.</span></span></div>}
    <div className="boks">
      {bryter("WEARABLE_HELSE")}
      {bryter("MANUELL_HELSE")}
      {harKilde && bryter("COACH_INNSYN")}
      {valg.coachInnsyn && bryter("COACH_DETALJ")}
    </div>
    <Kvittering pending={pending} feil={feil} lagret={lagret} hvile={harKilde && data.sistGittAt ? `Samtykke gitt ${formatDato(data.sistGittAt)}. Endringer logges.` : "Endringer logges i revisjonsloggen."} />
  </section>;
}

function Deling({ grupper, krevesForesatt, tekster }: { grupper: PH25PersonvernGruppe[]; krevesForesatt: boolean; tekster: Record<EmbedScope, Samtykketekst> }) {
  const [status, setStatus] = useState(grupper);
  const [feil, setFeil] = useState<string | null>(null);
  const [lagret, setLagret] = useState(false);
  const [pending, start] = useTransition();
  const noeDelt = status.some((g) => g.testResultater || g.stats);

  function endre(gruppeId: string, scope: EmbedScope, ny: boolean) {
    if (pending) return;
    if (krevesForesatt && ny) return; // foresatt gjør det i foreldreportalen
    setFeil(null); setLagret(false);
    const forrige = status;
    setStatus((prev) => prev.map((g) => g.gruppeId === gruppeId ? { ...g, [SCOPE_FELT[scope]]: ny } : g));
    start(async () => {
      try {
        const svar = ny ? await giDelingsSamtykke(scope, gruppeId) : await trekkDelingsSamtykke(scope, gruppeId);
        if (!svar.ok) { setStatus(forrige); setFeil(svar.feil); return; }
        setLagret(true);
      } catch { setStatus(forrige); setFeil("Kunne ikke lagre. Prøv igjen."); }
    });
  }

  return <section className="phn-seksjon" aria-labelledby="pv-deling">
    <div className="phn-sek-topp"><h2 id="pv-deling"><Share2 size={18} aria-hidden style={{ verticalAlign: "-3px", marginRight: 6 }} />Deling med eksterne miljøer</h2><Pille paa={noeDelt} /></div>
    <p className="phn-forklar">Miljøer som Team Norway og WANG kan be om innsyn i testresultater og statistikk. Ingenting deles uten samtykke her. Gruppemedlemskap alene gir aldri deling, og du kan ombestemme deg når som helst.</p>
    {krevesForesatt && <div className="u16-merke" role="note"><ShieldCheck size={22} aria-hidden /><span><b>Under 16 år</b><span className="phn-forklar">En foresatt må godkjenne delingen i foreldreportalen før noe deles. Du kan alltid slå det av selv.</span></span></div>}
    {status.length === 0
      ? <div className="phn-kort dempet"><p className="phn-forklar">Ingen eksterne miljøer har bedt om innsyn ennå. Når et miljø får lesetilgang til en av gruppene dine, dukker valget opp her.</p></div>
      : status.map((g) => <div key={g.gruppeId} className="phn-seksjon">
        <b className="phn-undertittel">{g.gruppeNavn}</b>
        <div className="boks">
          {(Object.keys(SCOPE_FELT) as EmbedScope[]).map((scope) => {
            const t = tekster[scope];
            const paa = g[SCOPE_FELT[scope]];
            return <Bryter key={scope} paa={paa} tittel={t.tittel} kilde={t.forklaring} laast={krevesForesatt && !paa} onChange={(v) => endre(g.gruppeId, scope, v)} />;
          })}
        </div>
      </div>)}
    <Kvittering pending={pending} feil={feil} lagret={lagret} hvile="Endringer logges i revisjonsloggen." />
    <Link className="lenke" href="/portal/meg/innstillinger/personvern/deling">Se hvem som ser profilen din</Link>
  </section>;
}

function Eksport() {
  const [pending, start] = useTransition();
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  function last() {
    start(async () => {
      setStatus(null);
      try {
        const r = await exportUserData();
        if (!r.ok || !r.data) { setStatus({ ok: false, msg: r.error ?? "Eksport feilet." }); return; }
        const url = URL.createObjectURL(new Blob([JSON.stringify(r.data, null, 2)], { type: "application/json" }));
        const a = document.createElement("a");
        a.href = url;
        a.download = `akgolf-data-export-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setStatus({ ok: true, msg: "Filen er lastet ned." });
      } catch { setStatus({ ok: false, msg: "Eksport feilet." }); }
    });
  }
  return <div className="phn-kort">
    <b className="phn-undertittel">Last ned dataene dine</b>
    <p className="phn-forklar">Få en fil med profil, runder, økter, mål, betalinger, varsler og meldinger.</p>
    <div className="phn-knapper"><button type="button" className="phn-knapp sek" onClick={last} disabled={pending}><Download size={16} aria-hidden />{pending ? "Lager filen …" : "Last ned dataene mine"}</button></div>
    <div aria-live="polite">{status && <p className={status.ok ? "phn-kilde" : "phn-melding"} role={status.ok ? "status" : "alert"}>{status.msg}</p>}</div>
  </div>;
}

function Slett() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [tekst, setTekst] = useState("");
  const [begrunnelse, setBegrunnelse] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const [sendt, setSendt] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function lukk() { setTekst(""); setBegrunnelse(""); setFeil(null); dialog.current?.close(); }
  function send() {
    setFeil(null);
    start(async () => {
      try {
        const r = await opprettGdprForesporsel(begrunnelse.trim() || undefined);
        if (!r.ok) { setFeil(r.error ?? "Kunne ikke sende forespørselen."); return; }
        setSendt(r.alleredeSendt ? "Du har allerede en åpen forespørsel." : "Forespørselen er sendt. Coachen eller AK Golf behandler den, og du får beskjed når det er gjort.");
        lukk();
      } catch { setFeil("Kunne ikke sende forespørselen. Prøv igjen."); }
    });
  }

  return <>
    <div className="phn-kort dempet">
      <b className="phn-undertittel">Slett kontoen din</b>
      {sendt
        ? <p className="phn-forklar" role="status">{sendt}</p>
        : <>
          <p className="phn-forklar">Forespørselen vurderes av coach eller admin. Ved godkjenning anonymiseres navn, e-post, telefon og bilde. Avidentifisert treningshistorikk beholdes.</p>
          <div className="phn-knapper"><button type="button" className="phn-knapp sek" onClick={() => { setFeil(null); dialog.current?.showModal(); }}>Slett kontoen min</button></div>
        </>}
    </div>
    <dialog ref={dialog} className="phn-ark dialog" role="alertdialog" aria-labelledby="pv-slett-tittel">
      <div className="phn-ark-kropp">
        <h2 id="pv-slett-tittel">Slette kontoen?</h2>
        <p className="phn-forklar">Forespørselen behandles av coach eller admin. Ved godkjenning anonymiseres navn, e-post, telefon og bilde. Det kan ikke angres.</p>
        <label className="phn-felt">Skriv SLETT for å bekrefte<input className="slett-felt" value={tekst} onChange={(e) => setTekst(e.target.value)} autoComplete="off" autoCapitalize="characters" /></label>
        <label className="phn-felt">Begrunnelse (valgfritt)<textarea value={begrunnelse} onChange={(e) => setBegrunnelse(e.target.value)} rows={3} maxLength={1000} /></label>
        <div aria-live="polite">{feil && <p className="phn-melding" role="alert">{feil}</p>}</div>
        <div className="phn-knapper">
          <button type="button" className="phn-knapp rust stor" onClick={send} disabled={pending || tekst.trim() !== "SLETT"}>{pending ? "Sender …" : "Send sletteforespørsel"}</button>
          <button type="button" className="phn-knapp sek stor" onClick={lukk} disabled={pending}>Avbryt</button>
        </div>
      </div>
    </dialog>
  </>;
}

export function PH25Personvern({ data, ekstra }: { data: PH25PersonvernData; ekstra?: ReactNode }) {
  return <div className="phn phn-meg phn-skra">
    <SkraTopp
      lav
      etikett="Meg"
      bilde="/images/playerhq/stats-topp.jpg" bildePosisjon="50% 50%"
      overlinje={<>Meg · innstillinger</>}
      tittel={<>Samtykker</>}
      handling={<span className="skra-tilbake"><Link className="tilbake" href="/portal/meg/innstillinger"><ChevronLeft size={18} aria-hidden />Innstillinger</Link></span>}
    />
    <SkraFlyt lav><div className="side">
    <p className="phn-forklar">Du kan endre frivillig deling her, når som helst. Ingenting deles uten at du eller foresatt godkjenner det.</p>

    <div className="to-del">
      <div>
        <Helse data={data.helse} tekster={data.tekst.helse} />
        {ekstra}
        <Deling grupper={data.grupper} krevesForesatt={data.delingKrevesForesatt} tekster={data.tekst.deling} />
      </div>
      <div>
        <Eksport />
        <section className="phn-seksjon" aria-labelledby="pv-behandling">
          <div className="phn-sek-topp"><h2 id="pv-behandling">Hvordan vi behandler dataene dine</h2></div>
          <ul className="vilkaar">
            <li><b>Lagring:</b> Alle data lagres kryptert i EU (Supabase).</li>
            <li><b>Betaling:</b> Kortdata håndteres bare av Stripe. Vi lagrer aldri kortnummer.</li>
            <li><b>E-post:</b> Bare nødvendige e-poster (booking, plan, varsler), ikke reklame uten samtykke.</li>
          </ul>
          <p className="phn-kilde">Mer i <Link href="/personvern">personvernerklæringen</Link>. Spørsmål? <a href="mailto:post@akgolf.no">post@akgolf.no</a></p>
        </section>
        <Slett />
      </div>
    </div>
  </div></SkraFlyt></div>;
}
