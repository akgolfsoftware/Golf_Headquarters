"use client";

/**
 * PH-IUP-02 Sesongevaluering (og utviklingssjekk med fritt valg av periode) i nytt design (pakke 9 IUP og gameplan).
 * Fasit: docs/design-system/utkast-playerhq/iup.html, skjermene «sesong» og «sesonglevert». Stil: src/styles/playerhq-ny-iup.css.
 * Reell lagring med revisjoner. Kildeåret og datoene velges eksplisitt.
 * IupSvarFelt brukes også av treneren (trener-iup-svar.tsx). Uten `steg` vises alt som før.
 *
 * Avvik:
 *   - Sesongevalueringen går i fire steg som i tegningen. Utviklingssjekken på denne siden viser områdene som åpne/lukkede
 *     grupper på én side; fireukerssjekken (PH-IUP-01) er den stegvise utgaven.
 *   - Tidsfordelingen føres i tallfelt per akse (0–100, desimaler tillatt), ikke med ±5-knapper. Stablet stolpe og sum vises som i tegningen.
 *     «Faktisk» foreslås ikke fra treningsdataene: forslaget er åpent hos Anders og finnes ikke i koden.
 *   - Avkrysningen «Prosessmål» per forbedringspunkt er ikke med: evalueringen har ikke feltet, og punktene legges ikke i Målsetninger.
 *     Levert-skjermen viser derfor antall forbedringspunkter, ikke «nye prosessmål».
 *   - Valget av kildeår, nivå og periode før en ny besvarelse står foran stegene (tegningen har ikke dette steget).
 *   - Ingen riggrad i tests/visual/skjerm-mapping.ts; målt med tests/visual/precision/maal.mjs PH-IUP-02.
 */
import { cloneElement, useEffect, useId, useState, useTransition, type ReactElement, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft } from "lucide-react";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { lagreIupAction, finnIupAction, hentIupHistorikkAction } from "@/app/portal/mal/evaluering/actions";
import { IUP_NIVAAER, IUP_VERSJONER, IUP_KATEGORIER, UTVIKLINGSSJEKK_SKALA, hentUtviklingssporsmal, lesIupBesvarelse, type IupBesvarelse } from "@/lib/iup/utviklingssjekk";
import { IUP_FORDELINGSOMRAADER, hentSesongsporsmal, lesSesongevaluering, type IupSesongevaluering } from "@/lib/iup/sesongevaluering";
import { desimal } from "@/lib/iup/fireukerssjekk";
import { IupValgSchema, type IupValg } from "@/lib/iup/valg";
import type { hentEgenIupOversikt } from "@/lib/iup/oversikt";
import type { hentEgenIup } from "@/lib/iup/lagring";
import "@/styles/iup-evaluering.css";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-iup.css";

type Historikk = NonNullable<Awaited<ReturnType<typeof hentEgenIup>>>;
type Oversikt = NonNullable<Awaited<ReturnType<typeof hentEgenIupOversikt>>>;
type Svar = IupBesvarelse | IupSesongevaluering;
type Type = IupValg["type"];
const NAVN: Record<string, string> = { UTVIKLINGSSJEKK: "Utviklingssjekk", SESONGEVALUERING: "Sesongevaluering", UNG: "Ung", JUNIOR: "Junior", AMATOR: "Amatør", PROFESJONELL: "Profesjonell", ALLE: "Alle nivåer", UTKAST: "Utkast", LEVERT: "Levert" };
const dato = (s: string) => new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(s));
const kildeaar = (s: string) => s.replace("iup-", "");
const prosent = (v: number) => new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 3 }).format(v);
const sum = (f: Record<string, number>) => Object.values(f).reduce((a, b) => a + b, 0);
const er100 = (f: Record<string, number>) => Math.abs(sum(f) - 100) <= 1e-9;
const AKSE_KLASSE: Record<string, string> = { FYS: "akse-fys", TEK: "akse-tek", SLAG: "akse-slag", SPILL: "akse-spill", TURN: "akse-turn" };
const SESONG_STEG = ["Sesongen din", "Påstandene", "Tidsfordeling", "Forbedringspunkter"] as const;

function Panel({ children }: { children: ReactNode }) { return <section className="pa-card pa-card--pad iup-panel">{children}</section>; }
function Felt({ navn, children }: { navn: string; children: ReactElement<{ id?: string }> }) {
  const id = useId();
  return <div className="iup-felt"><label htmlFor={id}>{navn}</label>{cloneElement(children, { id })}</div>;
}

export function PHIupEvaluering({ oversikt, historikk, nyType, uleste, startSteg = 0 }: {
  oversikt: Oversikt; historikk: Historikk | null; nyType: Type | null; uleste: number; startSteg?: number;
}) {
  const [ny, setNy] = useState<IupValg | null>(null);
  const siste = historikk?.revisjoner[0];
  // Velg bare de offentlige kontraktfeltene; strict-skjemaet avviser metadata.
  const lagretValg = historikk ? IupValgSchema.safeParse({ type: historikk.type, versjon: historikk.versjon, niva: historikk.niva, periodeStart: historikk.periodeStart, periodeSlutt: historikk.periodeSlutt }) : null;
  const neste = oversikt.nesteSide;
  const tittel = nyType ? NAVN[nyType] : historikk ? `${NAVN[historikk.type] ?? "Evaluering"}${historikk.type === "SESONGEVALUERING" && siste?.status === "LEVERT" ? " levert" : ""}` : "Evaluering";
  return <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
    <div className="phn phn-iup" data-od-id="playerhq-iup-evaluering">
      <div className="smal">
        <div className="topp">
          <Link href="/portal/mal" className="tilbake"><ChevronLeft size={20} aria-hidden />Målsetning</Link>
          <div>
            <span className="iup-merke">IUP</span>
            <h1 className="phn-tittel">{tittel}</h1>
          </div>
          <p className="phn-forklar">Her fyller du ut utviklingssjekk og sesongevaluering og finner tidligere svar.</p>
        </div>
        {!oversikt.kanSvare && <Panel><p>Spørsmålssjekkene gjelder aktive spillere i WANG eller Team Norway. Tidligere besvarelser er fortsatt tilgjengelige for deg.</p></Panel>}
        {historikk ? <>
          {!siste?.innhold || !lagretValg?.success || siste.revisjon !== historikk.revisjon ? <Panel><p role="alert">Denne besvarelsen har et kilde- eller formatavvik. Den kan ikke redigeres før avviket er avklart.</p></Panel> :
            <IupSkjema valg={lagretValg.data} initial={siste.innhold} id={historikk.id} revisjon={historikk.revisjon} kanSvare={oversikt.kanSvare} startSteg={startSteg} />}
          <IupHistorikk initial={historikk} />
          <div className="phn-knapper"><Link className="phn-knapp sek" href="/portal/mal/evaluering">Til evalueringene</Link></div>
        </> : nyType && oversikt.kanSvare ? ny ?
          <IupSkjema valg={ny} initial={tomtSvar(ny)} id={null} revisjon={0} kanSvare /> :
          <NyttValg type={nyType} onVelg={setNy} /> : <>
          {oversikt.kanSvare && <div className="phn-knapper">
            <Link className="phn-knapp pri" href="/portal/mal/evaluering?ny=SESONGEVALUERING">Ny sesongevaluering</Link>
            <Link className="phn-knapp sek" href="/portal/mal/evaluering?ny=UTVIKLINGSSJEKK">Ny utviklingssjekk</Link>
          </div>}
          <section className="phn-seksjon" aria-label="Dine besvarelser">
            <div className="phn-sek-topp"><h2>Dine besvarelser</h2></div>
            {oversikt.besvarelser.length === 0 ? <p className="phn-forklar">Ingen besvarelser på denne siden.</p> : <ul className="iup-liste">{oversikt.besvarelser.map((b) => <li key={b.id}>
              <Link href={`/portal/mal/evaluering?id=${encodeURIComponent(b.id)}`}>
                <strong>{NAVN[b.type] ?? b.type} · {NAVN[b.niva] ?? b.niva}</strong>
                <span>{dato(b.periodeStart)}–{dato(b.periodeSlutt)} · IUP {kildeaar(b.versjon)}</span>
                <span>{NAVN[b.status] ?? "Ukjent status"} · revisjon {b.revisjon} · lagret {dato(b.sistLagret)}</span>
              </Link>
            </li>)}</ul>}
            {neste && <div className="phn-knapper"><Link className="phn-knapp sek" href={`/portal/mal/evaluering?${new URLSearchParams(neste)}`}>Eldre besvarelser</Link></div>}
          </section>
        </>}
      </div>
    </div>
  </PlayerHQSkall>;
}

function tomtSvar(v: IupValg): Svar {
  return v.type === "UTVIKLINGSSJEKK"
    ? { versjon: v.versjon, niva: v.niva, status: "UTKAST", svar: {} }
    : { versjon: v.versjon, sesongStart: v.periodeStart, sesongSlutt: v.periodeSlutt, status: "UTKAST", fritekst: {}, vurderinger: {}, fordelingFaktisk: {}, fordelingPlanlagt: {}, forbedringspunkter: ["", "", ""] };
}

function NyttValg({ type, onVelg }: { type: Type; onVelg: (v: IupValg) => void }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);
  const [felter, setFelter] = useState({ versjon: "iup-2025", niva: type === "SESONGEVALUERING" ? "ALLE" : "", periodeStart: "", periodeSlutt: "" });
  const endre = (k: keyof typeof felter, v: string) => setFelter((s) => ({ ...s, [k]: v }));
  return <Panel><h2>Velg periode og spørsmål</h2>
    <p>Bruk samme kildeår, nivå og periode som oppfølgingen din. En eksisterende besvarelse åpnes igjen.</p>
    <form style={{ display: "grid", gap: 16 }} onSubmit={(e) => { e.preventDefault(); const v = IupValgSchema.safeParse({ ...felter, type }); if (!v.success) { setFeil("Velg kildeår, nivå og en gyldig periode."); return; }
      start(async () => { try { const r = await finnIupAction(v.data); if (!r.ok) { setFeil("Valgene kunne ikke leses. Kontroller perioden."); return; } if (r.id) router.push(`/portal/mal/evaluering?id=${encodeURIComponent(r.id)}`); else onVelg(v.data); } catch { setFeil("Besvarelsen kunne ikke åpnes. Prøv igjen."); } });
    }}>
      <fieldset disabled={pending} className="iup-valg">
        <Felt navn="Kildeår"><select value={felter.versjon} onChange={(e) => endre("versjon", e.target.value)}>{IUP_VERSJONER.map((v) => <option key={v} value={v}>IUP {kildeaar(v)}</option>)}</select></Felt>
        {type === "UTVIKLINGSSJEKK" && <Felt navn="Nivå"><select required value={felter.niva} onChange={(e) => endre("niva", e.target.value)}><option value="">Velg nivå</option>{IUP_NIVAAER.map((n) => <option key={n} value={n}>{NAVN[n]}</option>)}</select></Felt>}
        <Felt navn="Fra dato"><input type="date" required value={felter.periodeStart} onChange={(e) => endre("periodeStart", e.target.value)} /></Felt>
        <Felt navn="Til dato"><input type="date" required min={felter.periodeStart || undefined} value={felter.periodeSlutt} onChange={(e) => endre("periodeSlutt", e.target.value)} /></Felt>
      </fieldset>
      {feil && <p role="alert" className="phn-melding">{feil}</p>}
      <div className="phn-knapper"><button type="submit" className="phn-knapp pri" disabled={pending}>{pending ? "Åpner …" : "Fortsett"}</button></div>
    </form>
  </Panel>;
}

function IupSkjema({ valg, initial, id, revisjon, kanSvare, startSteg = 0 }: { valg: IupValg; initial: Svar; id: string | null; revisjon: number; kanSvare: boolean; startSteg?: number }) {
  const router = useRouter();
  const [svar, setSvar] = useState(initial);
  const [aktivRevisjon, setAktivRevisjon] = useState(revisjon);
  const [aktivId, setAktivId] = useState(id);
  const [lagretStatus, setLagretStatus] = useState(initial.status);
  const [endret, setEndret] = useState(false);
  const [redigerer, setRedigerer] = useState(initial.status === "UTKAST");
  const [pending, start] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);
  const [konflikt, setKonflikt] = useState(false);
  const [ukjentUtfall, setUkjentUtfall] = useState(false);
  const [steg, setSteg] = useState(startSteg);
  type Foresporsel = { type: Type; periodeStart: string; periodeSlutt: string; forventetRevisjon: number; requestId: string; besvarelse: Svar };
  const [ventende, setVentende] = useState<Foresporsel | null>(null);
  const laast = !kanSvare || !redigerer || pending || ukjentUtfall || konflikt;
  const endre = (nytt: Svar) => { setSvar({ ...nytt, status: "UTKAST" }); setEndret(true); setFeil(null); };
  const klar = "niva" in svar ? lesIupBesvarelse({ ...svar, status: "LEVERT" }) : lesSesongevaluering({ ...svar, status: "LEVERT" });
  useEffect(() => {
    if (!endret && !pending && !ukjentUtfall) return;
    const advar = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    const lenke = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || !(e.target instanceof Element)) return;
      const a = e.target.closest<HTMLAnchorElement>("a[href]");
      if (!a || a.target === "_blank" || a.hasAttribute("download") || a.getAttribute("href")?.startsWith("#")) return;
      if (!window.confirm(pending || ukjentUtfall ? "Lagringen er ikke bekreftet. Vil du forlate siden?" : "Du har endringer som ikke er lagret. Vil du forlate siden?")) { e.preventDefault(); e.stopPropagation(); }
    };
    window.addEventListener("beforeunload", advar);
    document.addEventListener("click", lenke, true);
    return () => { window.removeEventListener("beforeunload", advar); document.removeEventListener("click", lenke, true); };
  }, [endret, pending, ukjentUtfall]);
  const lagre = (status: "UTKAST" | "LEVERT") => {
    const p = ventende ?? { type: valg.type, periodeStart: valg.periodeStart, periodeSlutt: valg.periodeSlutt, forventetRevisjon: aktivRevisjon, requestId: crypto.randomUUID(), besvarelse: { ...svar, status } };
    setVentende(p); setFeil(null);
    start(async () => {
      try {
        const r = await lagreIupAction(p);
        setVentende(null); setUkjentUtfall(false);
        if (!r.ok) { setFeil(r.melding); setKonflikt(r.kode === "KONFLIKT"); return; }
        setEndret(false); setAktivId(r.id); setAktivRevisjon(r.revisjon); setLagretStatus(p.besvarelse.status); setSvar(p.besvarelse); setRedigerer(p.besvarelse.status === "UTKAST");
        if (r.gjeldendeRevisjon !== r.revisjon) { setKonflikt(true); setFeil("Lagringen er bekreftet, men en nyere revisjon finnes. Hent siste versjon før du endrer mer."); }
        if (aktivId) router.refresh(); else router.replace(`/portal/mal/evaluering?id=${encodeURIComponent(r.id)}`);
      } catch { setFeil("Endringene kunne ikke lagres. Prøv igjen. Den samme lagringen kontrolleres før du redigerer videre."); setUkjentUtfall(true); }
    });
  };

  const erSesong = !("niva" in svar);
  const visLevert = erSesong && lagretStatus === "LEVERT" && !redigerer;
  const stegvis = erSesong && !visLevert;
  const sisteSteg = SESONG_STEG.length - 1;
  // Neste fra tidsfordelingen krever 100 % i begge, som i tegningen. Låst visning kan alltid bla.
  const sperretFordeling = !laast && !("niva" in svar) && steg === 2 && !(er100(svar.fordelingFaktisk) && er100(svar.fordelingPlanlagt));
  const gaaTil = (i: number) => { setSteg(i); window.scrollTo({ top: 0 }); };
  const statusTekst = pending ? "Lagrer …" : endret || ukjentUtfall ? "Ikke lagret" : aktivId ? `Lagret · ${NAVN[lagretStatus]} · revisjon ${aktivRevisjon}` : "Ikke lagret";

  return <div className="flyt">
    <div className="steg-topp">
      <div className="rad">
        <span className="phn-kilde">{NAVN[valg.type]} · {NAVN[valg.niva]} · IUP {kildeaar(valg.versjon)} · {dato(valg.periodeStart)}–{dato(valg.periodeSlutt)}</span>
        <span className={`lagring${pending ? "" : endret || ukjentUtfall ? " feil" : aktivId ? " ok" : ""}`} role="status">{!pending && !endret && !ukjentUtfall && aktivId && <Check size={16} aria-hidden />}{statusTekst}</span>
      </div>
      {stegvis && <>
        <span className="phn-kilde">Steg {steg + 1} av {SESONG_STEG.length} · {SESONG_STEG[steg]}</span>
        <div className="stolpe" aria-hidden="true"><span style={{ width: `${((steg + 1) / SESONG_STEG.length) * 100}%` }} /></div>
      </>}
      {lagretStatus === "LEVERT" && !redigerer && kanSvare && <div className="phn-knapper"><button type="button" className="phn-knapp sek" disabled={konflikt} onClick={() => { setRedigerer(true); setSteg(0); endre({ ...svar, status: "UTKAST" }); }}>Rediger besvarelse</button></div>}
      {lagretStatus === "LEVERT" && redigerer && <p className="phn-forklar">Tidligere levering beholdes. Endringene lagres som en ny revisjon.</p>}
    </div>
    {visLevert && !("niva" in svar) ? <SesongLevert svar={svar} /> : <div className="steg">
      <IupSvarFelt svar={svar} laast={laast} onEndre={endre} steg={stegvis ? steg : undefined} />
    </div>}
    {((redigerer && kanSvare) || konflikt || feil) && <div className="steg">
      {redigerer && !klar.ok && (!stegvis || steg === sisteSteg) && <p className="advarsel">{klar.melding}</p>}
      {feil && <p role="alert" className="advarsel">{feil}</p>}
      {sperretFordeling && <p className="phn-forklar">Begge fordelingene må bli 100 % før du kan gå videre.</p>}
      <div className={stegvis ? "navigasjon" : "phn-knapper"}>
        {stegvis && steg > 0 && <button type="button" className="phn-knapp sek" onClick={() => gaaTil(steg - 1)}>Tilbake</button>}
        {redigerer && kanSvare && (ukjentUtfall ? <button type="button" className="phn-knapp pri" disabled={pending} onClick={() => lagre(ventende?.besvarelse.status ?? "UTKAST")}>{pending ? "Lagrer …" : "Prøv igjen"}</button> : <>
          <button type="button" className="phn-knapp sek" onClick={() => lagre("UTKAST")} disabled={pending || konflikt || (!endret && aktivId !== null)}>Lagre utkast</button>
          {stegvis && steg < sisteSteg
            ? <button type="button" className="phn-knapp pri" disabled={sperretFordeling} onClick={() => gaaTil(steg + 1)}>Neste</button>
            : <button type="button" className="phn-knapp pri" onClick={() => lagre("LEVERT")} disabled={!klar.ok || pending || konflikt}>{pending ? "Lagrer …" : erSesong ? "Lever evalueringen" : "Lever besvarelse"}</button>}
        </>)}
        {konflikt && <button type="button" className="phn-knapp sek" onClick={() => {
          if (!window.confirm("Dette erstatter endringene i skjemaet med siste lagrede besvarelse. Vil du fortsette?")) return;
          if (aktivId) router.refresh(); else start(async () => { try { const r = await finnIupAction(valg); if (r.ok && r.id) router.replace(`/portal/mal/evaluering?id=${encodeURIComponent(r.id)}`); else setFeil("Siste versjon kunne ikke hentes. Prøv igjen."); } catch { setFeil("Siste versjon kunne ikke hentes. Prøv igjen."); } });
        }}>Hent siste versjon</button>}
      </div>
      <p className="phn-kilde">Å lagre eller levere endrer ikke hvem som har tilgang til profilen din.</p>
    </div>}
    {stegvis && !((redigerer && kanSvare) || konflikt || feil) && <div className="navigasjon">
      {steg > 0 && <button type="button" className="phn-knapp sek" onClick={() => gaaTil(steg - 1)}>Tilbake</button>}
      {steg < sisteSteg && <button type="button" className="phn-knapp pri" onClick={() => gaaTil(steg + 1)}>Neste</button>}
    </div>}
  </div>;
}

function Stablet({ fordeling }: { fordeling: Record<string, number> }) {
  const s = sum(fordeling);
  return <div className="stablet" aria-hidden="true">{IUP_FORDELINGSOMRAADER.map((a) =>
    <i key={a} className={AKSE_KLASSE[a]} style={{ width: `${s > 0 ? ((fordeling[a] ?? 0) / Math.max(s, 100)) * 100 : 0}%` }} />)}</div>;
}

function Tegnforklaring() {
  return <div className="phn-lg-rad">{IUP_FORDELINGSOMRAADER.map((a) => <span key={a} className="phn-lg"><i className={AKSE_KLASSE[a]} />{a}</span>)}</div>;
}

/** Levert sesongevaluering: tegningens «Evaluering levert». */
function SesongLevert({ svar }: { svar: IupSesongevaluering }) {
  const punkter = svar.forbedringspunkter.map((p) => p.trim()).filter(Boolean);
  const vurderinger = Object.values(svar.vurderinger);
  const snittV = vurderinger.length ? vurderinger.reduce((a, b) => a + b, 0) / vurderinger.length : null;
  return <div className="to-del">
    <div>
      <section className="phn-kort" aria-label="Levert">
        <span className="hake"><Check size={28} strokeWidth={2.5} aria-hidden /></span>
        <div className="phn-hoved"><strong>{punkter.length}</strong><span className="phn-forklar">forbedringspunkter</span></div>
        <p className="phn-kilde">Sesongen {dato(svar.sesongStart)}–{dato(svar.sesongSlutt)} · IUP {kildeaar(svar.versjon)}.</p>
      </section>
      <section className="phn-seksjon" aria-label="Forbedringspunkter">
        <div className="phn-sek-topp"><h2>Forbedringspunkter</h2></div>
        {punkter.length === 0 ? <p className="phn-forklar">—</p> : <ul className="historikk">{punkter.map((p, i) => <li key={i}><span>{p}</span><b>{i + 1}</b></li>)}</ul>}
      </section>
    </div>
    <div>
      <section className="phn-seksjon" aria-label="Tidsfordeling">
        <div className="phn-sek-topp"><h2>Tidsfordeling</h2></div>
        <div style={{ display: "grid", gap: 6 }}><span className="phn-kilde">Faktisk · {prosent(sum(svar.fordelingFaktisk))} %</span><Stablet fordeling={svar.fordelingFaktisk} /></div>
        <div style={{ display: "grid", gap: 6 }}><span className="phn-kilde">Ønsket · {prosent(sum(svar.fordelingPlanlagt))} %</span><Stablet fordeling={svar.fordelingPlanlagt} /></div>
        <Tegnforklaring />
      </section>
      <section className="phn-seksjon" aria-label="Påstandene">
        <div className="phn-sek-topp"><h2>Påstandene</h2><span className="phn-kilde">Snitt, skala 1–4</span></div>
        <div className="phn-hoved"><strong>{desimal(snittV)}</strong><span className="phn-forklar">av 4 · {vurderinger.length} påstander</span></div>
      </section>
    </div>
  </div>;
}

function Skala({ tekst, celle, verdi, maks, laast, onVelg }: { tekst: string; celle: string; verdi: number | undefined; maks: number; laast: boolean; onVelg: (v: number | undefined) => void }) {
  const navn = useId();
  return <fieldset className="iup-sporsmal" disabled={laast}>
    <legend>{tekst} <small>· {celle}</small></legend>
    <div className="iup-skala">{Array.from({ length: maks }, (_, i) => i + 1).map((n) => <label key={n} className="iup-radio">
      <input type="radio" name={navn} value={n} checked={verdi === n} onChange={() => onVelg(n)} /><span>{n}</span>
    </label>)}{verdi !== undefined && !laast && <button type="button" className="iup-nullstill" onClick={() => onVelg(undefined)}>Fjern svar</button>}</div>
  </fieldset>;
}

/**
 * Felles spørsmålsvisning; alle tekster og ID-er kommer fra kildekatalogen.
 * `steg` (bare sesongevaluering) viser ett av fire steg: 0 fritekst, 1 påstander, 2 tidsfordeling, 3 forbedringspunkter.
 */
export function IupSvarFelt({ svar, laast, onEndre, steg }: { svar: Svar; laast: boolean; onEndre: (v: Svar) => void; steg?: number }) {
  const byttTall = (felt: Record<string, number>, id: string, verdi: number | undefined) => { const n = { ...felt }; if (verdi === undefined) delete n[id]; else n[id] = verdi; return n; };
  if ("niva" in svar) {
    const sporsmal = hentUtviklingssporsmal(svar.versjon, svar.niva);
    return <>
      <Panel><p>{Object.keys(svar.svar).length} av {sporsmal.length} besvart · skala 1–5</p><p>{UTVIKLINGSSJEKK_SKALA.map((s) => `${s.verdi}: ${s.tekst}`).join(" · ")}</p></Panel>
      {IUP_KATEGORIER.map((kategori, index) => <details className="pa-card pa-card--pad iup-kategori" key={kategori} open={index === 0}>
        <summary><strong>{kategori}</strong><span>{sporsmal.filter((s) => s.kategori === kategori && Object.hasOwn(svar.svar, s.id)).length} / {sporsmal.filter((s) => s.kategori === kategori).length}</span></summary>
        {sporsmal.filter((s) => s.kategori === kategori).map((s) => <Skala key={s.id} tekst={s.tekst} celle={s.celle} verdi={svar.svar[s.id]} maks={5} laast={laast} onVelg={(v) => onEndre({ ...svar, svar: byttTall(svar.svar, s.id, v) })} />)}
      </details>)}
    </>;
  }
  const vis = (n: number) => steg === undefined || steg === n;
  const sporsmal = hentSesongsporsmal(svar.versjon);
  const antallPastander = sporsmal.filter((s) => s.type !== "FRITEKST").length;
  return <>
    {(vis(0) || vis(1)) && <Panel>
      <h2>{steg === undefined ? "Sesongens erfaringer" : steg === 0 ? "Sesongen din" : `${antallPastander} påstander`}</h2>
      {steg === undefined ? <p>Tre fritekstspørsmål og ti vurderinger på skala 1–4. Årstall i originalspørsmålene er kildehistorikk; datoperioden ovenfor gjelder besvarelsen.</p>
        : steg === 1 ? <p>{Object.keys(svar.vurderinger).length} av {antallPastander} besvart · 1 helt uenig, 4 helt enig. Årstall i spørsmålene er kildehistorikk.</p> : null}
      {sporsmal.map((s) => s.type === "FRITEKST" ? (vis(0) && <Felt key={s.id} navn={`${s.tekst} · ${s.celle}`}><textarea rows={4} maxLength={10000} disabled={laast} value={svar.fritekst[s.id] ?? ""} onChange={(e) => onEndre({ ...svar, fritekst: { ...svar.fritekst, [s.id]: e.target.value } })} /></Felt>) :
        (vis(1) && <Skala key={s.id} tekst={s.tekst} celle={s.celle} verdi={svar.vurderinger[s.id]} maks={4} laast={laast} onVelg={(v) => onEndre({ ...svar, vurderinger: byttTall(svar.vurderinger, s.id, v) })} />))}
    </Panel>}
    {vis(2) && <Panel><h2>Tidsfordeling</h2><p>{steg === undefined ? "Begge fordelinger skal ha fem verdier og sum 100 %. Null er en registrert verdi. Et tomt felt er ubesvart." : "Hvordan brukte du tiden denne sesongen, og hvordan vil du bruke den neste? Begge skal bli 100 %. Null er en registrert verdi, et tomt felt er ubesvart."}</p>
      {(["fordelingFaktisk", "fordelingPlanlagt"] as const).map((felt) => <fieldset key={felt} disabled={laast} className="iup-fordeling"><legend>{felt === "fordelingFaktisk" ? "Faktisk fordeling" : "Planlagt fordeling"}</legend>
        {steg !== undefined && <Stablet fordeling={svar[felt]} />}
        <div className="iup-valg">{IUP_FORDELINGSOMRAADER.map((akse) => <Felt key={akse} navn={`${akse} (%)`}><input type="number" min={0} max={100} step="any" inputMode="decimal" value={svar[felt][akse] ?? ""} onChange={(e) => onEndre({ ...svar, [felt]: byttTall(svar[felt], akse, e.target.value === "" ? undefined : e.target.valueAsNumber) })} /></Felt>)}</div>
        {steg === undefined ? <p>Sum: {prosent(sum(svar[felt]))} %</p>
          : <div className={`sum ${er100(svar[felt]) ? "ok" : "feil"}`}><span>Til sammen</span><span className="mono">{prosent(sum(svar[felt]))} %</span></div>}
      </fieldset>)}
      {steg !== undefined && <Tegnforklaring />}
    </Panel>}
    {vis(3) && <Panel><h2>Forbedringspunkter</h2><p>{steg === undefined ? "Oppgi minst tre konkrete punkter." : `Hva vil du bli bedre på neste sesong? ${svar.forbedringspunkter.filter((p) => p.trim()).length} av minst 3.`}</p>
      {svar.forbedringspunkter.map((punkt, i) => <Felt key={i} navn={`Punkt ${i + 1}`}><textarea rows={2} maxLength={2000} disabled={laast} value={punkt} onChange={(e) => onEndre({ ...svar, forbedringspunkter: svar.forbedringspunkter.map((v, j) => i === j ? e.target.value : v) })} /></Felt>)}
      {!laast && svar.forbedringspunkter.length < 20 && <div><button type="button" className="phn-knapp sek" onClick={() => onEndre({ ...svar, forbedringspunkter: [...svar.forbedringspunkter, ""] })}>Legg til punkt</button></div>}
    </Panel>}
  </>;
}

function IupHistorikk({ initial }: { initial: Historikk }) {
  const [rader, setRader] = useState(initial.revisjoner);
  const [neste, setNeste] = useState(initial.nesteRevisjon);
  const [pending, start] = useTransition();
  const [feil, setFeil] = useState(false);
  return <section className="phn-seksjon" aria-label="Historikk">
    <div className="phn-sek-topp"><h2>Historikk</h2></div>
    <p className="phn-forklar">Hver lagring bevares som en revisjon. Tidligere svar kan leses her.</p>
    <div>{rader.map((r) => <IupRevisjon key={r.revisjon} rad={r} sisteLevering={initial.levertRevisjon} />)}</div>
    {feil && <p role="alert" className="phn-melding">Historikken kunne ikke hentes. Prøv igjen.</p>}
    {neste && <div className="phn-knapper"><button type="button" className="phn-knapp sek" disabled={pending} onClick={() => start(async () => { try { const mer = await hentIupHistorikkAction({ id: initial.id, forRevisjon: neste }); if (!mer) throw Error("mangler"); setRader((s) => [...s, ...mer.revisjoner]); setNeste(mer.nesteRevisjon); setFeil(false); } catch { setFeil(true); } })}>{pending ? "Henter …" : "Eldre revisjoner"}</button></div>}
  </section>;
}

function IupRevisjon({ rad, sisteLevering }: { rad: Historikk["revisjoner"][number]; sisteLevering: number | null }) {
  const [aapen, setAapen] = useState(false);
  return <details className="iup-historikk" onToggle={(e) => setAapen(e.currentTarget.open)}><summary>Revisjon {rad.revisjon} · {NAVN[rad.status] ?? "Ukjent status"} · {dato(rad.createdAt)}{rad.revisjon === sisteLevering ? " · siste levering" : ""}</summary>
    {aapen && (rad.innhold ? <IupSvarFelt svar={rad.innhold} laast onEndre={() => {}} /> : <p className="phn-forklar">Kilde- eller formatavvik. Ingen erstatningsverdier er lagt til.</p>)}
  </details>;
}
