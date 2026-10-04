"use client";

/** Precision 7d7c2994, ui_kits/iup-komplett/v1.js (eksport 02.10.2026).
 * Reell lagring erstatter prototypens sessionStorage. Kildeåret og datoene
 * velges eksplisitt; den feilaktige 2025-etiketten 1–8 er ikke videreført.
 */
import { cloneElement, useEffect, useId, useState, useTransition, type ReactElement, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { Knapp, KnappLenke } from "@/components/precision/pa";
import { lagreIupAction, finnIupAction, hentIupHistorikkAction } from "@/app/portal/mal/evaluering/actions";
import { IUP_NIVAAER, IUP_VERSJONER, IUP_KATEGORIER, UTVIKLINGSSJEKK_SKALA, hentUtviklingssporsmal, lesIupBesvarelse, type IupBesvarelse } from "@/lib/iup/utviklingssjekk";
import { IUP_FORDELINGSOMRAADER, hentSesongsporsmal, lesSesongevaluering, type IupSesongevaluering } from "@/lib/iup/sesongevaluering";
import { IupValgSchema, type IupValg } from "@/lib/iup/valg";
import type { hentEgenIupOversikt } from "@/lib/iup/oversikt";
import type { hentEgenIup } from "@/lib/iup/lagring";
import "@/styles/iup-evaluering.css";

type Historikk = NonNullable<Awaited<ReturnType<typeof hentEgenIup>>>;
type Oversikt = NonNullable<Awaited<ReturnType<typeof hentEgenIupOversikt>>>;
type Svar = IupBesvarelse | IupSesongevaluering;
type Type = IupValg["type"];
const NAVN: Record<string, string> = { UTVIKLINGSSJEKK: "Utviklingssjekk", SESONGEVALUERING: "Sesongevaluering", UNG: "Ung", JUNIOR: "Junior", AMATOR: "Amatør", PROFESJONELL: "Profesjonell", ALLE: "Alle nivåer", UTKAST: "Utkast", LEVERT: "Levert" };
const dato = (s: string) => new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(s));
const kildeaar = (s: string) => s.replace("iup-", "");

function Panel({ children }: { children: ReactNode }) { return <section className="pa-card pa-card--pad iup-panel">{children}</section>; }
function Felt({ navn, children }: { navn: string; children: ReactElement<{ id?: string }> }) {
  const id = useId();
  return <div className="iup-felt"><label htmlFor={id}>{navn}</label>{cloneElement(children, { id })}</div>;
}

export function PHIupEvaluering({ oversikt, historikk, nyType, uleste }: {
  oversikt: Oversikt; historikk: Historikk | null; nyType: Type | null; uleste: number;
}) {
  const [ny, setNy] = useState<IupValg | null>(null);
  const siste = historikk?.revisjoner[0];
  // Velg bare de offentlige kontraktfeltene; strict-skjemaet avviser metadata.
  const lagretValg = historikk ? IupValgSchema.safeParse({ type: historikk.type, versjon: historikk.versjon, niva: historikk.niva, periodeStart: historikk.periodeStart, periodeSlutt: historikk.periodeSlutt }) : null;
  const neste = oversikt.nesteSide;
  return <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
    <div className="pa-side iup-side">
      <header className="pa-pagehead">
        <Link href="/portal/mal" className="iup-tilbake">Målsetning</Link>
        <span className="kicker">PlayerHQ · Målsetning</span>
        <h1 className="pa-pagehead__title">{nyType ? NAVN[nyType] : historikk ? NAVN[historikk.type] ?? "Evaluering" : "Evaluering"}</h1>
        <p className="pa-pagehead__sub">Her fyller du ut utviklingssjekk og sesongevaluering og finner tidligere svar.</p>
      </header>
      {!oversikt.kanSvare && <Panel><p>Spørsmålssjekkene gjelder aktive spillere i WANG eller Team Norway. Tidligere besvarelser er fortsatt tilgjengelige for deg.</p></Panel>}
      {historikk ? <>
        {!siste?.innhold || !lagretValg?.success || siste.revisjon !== historikk.revisjon ? <Panel><p role="alert">Denne besvarelsen har et kilde- eller formatavvik. Den kan ikke redigeres før avviket er avklart.</p></Panel> :
          <IupSkjema valg={lagretValg.data} initial={siste.innhold} id={historikk.id} revisjon={historikk.revisjon} kanSvare={oversikt.kanSvare} />}
        <IupHistorikk initial={historikk} />
        <KnappLenke variant="secondary" href="/portal/mal/evaluering">Til evalueringene</KnappLenke>
      </> : nyType && oversikt.kanSvare ? ny ?
        <IupSkjema valg={ny} initial={tomtSvar(ny)} id={null} revisjon={0} kanSvare /> :
        <NyttValg type={nyType} onVelg={setNy} /> : <>
        {oversikt.kanSvare && <div className="iup-handlinger">
          <KnappLenke href="/portal/mal/evaluering?ny=UTVIKLINGSSJEKK">Ny utviklingssjekk</KnappLenke>
          <KnappLenke variant="secondary" href="/portal/mal/evaluering?ny=SESONGEVALUERING">Ny sesongevaluering</KnappLenke>
        </div>}
        <Panel><h2>Dine besvarelser</h2>
          {oversikt.besvarelser.length === 0 ? <p>Ingen besvarelser på denne siden.</p> : <ul className="iup-liste">{oversikt.besvarelser.map((b) => <li key={b.id}>
            <Link href={`/portal/mal/evaluering?id=${encodeURIComponent(b.id)}`}>
              <strong>{NAVN[b.type] ?? b.type} · {NAVN[b.niva] ?? b.niva}</strong>
              <span>{dato(b.periodeStart)}–{dato(b.periodeSlutt)} · IUP {kildeaar(b.versjon)}</span>
              <span>{NAVN[b.status] ?? "Ukjent status"} · revisjon {b.revisjon} · lagret {dato(b.sistLagret)}</span>
            </Link>
          </li>)}</ul>}
          {neste && <KnappLenke variant="secondary" href={`/portal/mal/evaluering?${new URLSearchParams(neste)}`}>Eldre besvarelser</KnappLenke>}
        </Panel>
      </>}
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
    <form onSubmit={(e) => { e.preventDefault(); const v = IupValgSchema.safeParse({ ...felter, type }); if (!v.success) { setFeil("Velg kildeår, nivå og en gyldig periode."); return; }
      start(async () => { try { const r = await finnIupAction(v.data); if (!r.ok) { setFeil("Valgene kunne ikke leses. Kontroller perioden."); return; } if (r.id) router.push(`/portal/mal/evaluering?id=${encodeURIComponent(r.id)}`); else onVelg(v.data); } catch { setFeil("Besvarelsen kunne ikke åpnes. Prøv igjen."); } });
    }}>
      <fieldset disabled={pending} className="iup-valg">
        <Felt navn="Kildeår"><select value={felter.versjon} onChange={(e) => endre("versjon", e.target.value)}>{IUP_VERSJONER.map((v) => <option key={v} value={v}>IUP {kildeaar(v)}</option>)}</select></Felt>
        {type === "UTVIKLINGSSJEKK" && <Felt navn="Nivå"><select required value={felter.niva} onChange={(e) => endre("niva", e.target.value)}><option value="">Velg nivå</option>{IUP_NIVAAER.map((n) => <option key={n} value={n}>{NAVN[n]}</option>)}</select></Felt>}
        <Felt navn="Fra dato"><input type="date" required value={felter.periodeStart} onChange={(e) => endre("periodeStart", e.target.value)} /></Felt>
        <Felt navn="Til dato"><input type="date" required min={felter.periodeStart || undefined} value={felter.periodeSlutt} onChange={(e) => endre("periodeSlutt", e.target.value)} /></Felt>
      </fieldset>
      {feil && <p role="alert">{feil}</p>}
      <Knapp type="submit" loading={pending} loadingText="Åpner …">Fortsett</Knapp>
    </form>
  </Panel>;
}

function IupSkjema({ valg, initial, id, revisjon, kanSvare }: { valg: IupValg; initial: Svar; id: string | null; revisjon: number; kanSvare: boolean }) {
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
  return <div className="iup-skjema">
    <Panel><h2>{NAVN[valg.type]} · {NAVN[valg.niva]}</h2>
      <p>IUP {kildeaar(valg.versjon)} · {dato(valg.periodeStart)}–{dato(valg.periodeSlutt)}</p>
      <p role="status">{pending ? "Lagrer …" : endret || ukjentUtfall ? "Ikke lagret" : aktivId ? `Lagret · ${NAVN[lagretStatus]} · revisjon ${aktivRevisjon}` : "Ikke lagret"}</p>
      {lagretStatus === "LEVERT" && !redigerer && kanSvare && <Knapp variant="secondary" disabled={konflikt} onClick={() => { setRedigerer(true); endre({ ...svar, status: "UTKAST" }); }}>Rediger besvarelse</Knapp>}
      {lagretStatus === "LEVERT" && redigerer && <p>Tidligere levering beholdes. Endringene lagres som en ny revisjon.</p>}
    </Panel>
    <IupSvarFelt svar={svar} laast={laast} onEndre={endre} />
    {((redigerer && kanSvare) || konflikt || feil) && <Panel>
      {redigerer && !klar.ok && <p>{klar.melding}</p>}
      {feil && <p role="alert">{feil}</p>}
      <div className="iup-handlinger">
        {redigerer && kanSvare && (ukjentUtfall ? <Knapp onClick={() => lagre(ventende?.besvarelse.status ?? "UTKAST")} loading={pending}>Prøv igjen</Knapp> : <>
          <Knapp variant="secondary" onClick={() => lagre("UTKAST")} disabled={pending || konflikt || (!endret && aktivId !== null)}>Lagre utkast</Knapp>
          <Knapp onClick={() => lagre("LEVERT")} disabled={!klar.ok || pending || konflikt} loading={pending}>Lever besvarelse</Knapp>
        </>)}
        {konflikt && <Knapp variant="secondary" onClick={() => {
          if (!window.confirm("Dette erstatter endringene i skjemaet med siste lagrede besvarelse. Vil du fortsette?")) return;
          if (aktivId) router.refresh(); else start(async () => { try { const r = await finnIupAction(valg); if (r.ok && r.id) router.replace(`/portal/mal/evaluering?id=${encodeURIComponent(r.id)}`); else setFeil("Siste versjon kunne ikke hentes. Prøv igjen."); } catch { setFeil("Siste versjon kunne ikke hentes. Prøv igjen."); } });
        }}>Hent siste versjon</Knapp>}
      </div>
      <p>Å lagre eller levere endrer ikke hvem som har tilgang til profilen din.</p>
    </Panel>}
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

/** Felles spørsmålsvisning; alle tekster og ID-er kommer fra kildekatalogen. */
export function IupSvarFelt({ svar, laast, onEndre }: { svar: Svar; laast: boolean; onEndre: (v: Svar) => void }) {
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
  return <>
    <Panel><h2>Sesongens erfaringer</h2><p>Tre fritekstspørsmål og ti vurderinger på skala 1–4. Årstall i originalspørsmålene er kildehistorikk; datoperioden ovenfor gjelder besvarelsen.</p>
      {hentSesongsporsmal(svar.versjon).map((s) => s.type === "FRITEKST" ? <Felt key={s.id} navn={`${s.tekst} · ${s.celle}`}><textarea rows={4} maxLength={10000} disabled={laast} value={svar.fritekst[s.id] ?? ""} onChange={(e) => onEndre({ ...svar, fritekst: { ...svar.fritekst, [s.id]: e.target.value } })} /></Felt> :
        <Skala key={s.id} tekst={s.tekst} celle={s.celle} verdi={svar.vurderinger[s.id]} maks={4} laast={laast} onVelg={(v) => onEndre({ ...svar, vurderinger: byttTall(svar.vurderinger, s.id, v) })} />)}
    </Panel>
    <Panel><h2>Tidsfordeling</h2><p>Begge fordelinger skal ha fem verdier og sum 100 %. Null er en registrert verdi. Et tomt felt er ubesvart.</p>
      {(["fordelingFaktisk", "fordelingPlanlagt"] as const).map((felt) => <fieldset key={felt} disabled={laast} className="iup-fordeling"><legend>{felt === "fordelingFaktisk" ? "Faktisk fordeling" : "Planlagt fordeling"}</legend>
        <div className="iup-valg">{IUP_FORDELINGSOMRAADER.map((akse) => <Felt key={akse} navn={`${akse} (%)`}><input type="number" min={0} max={100} step="any" inputMode="decimal" value={svar[felt][akse] ?? ""} onChange={(e) => onEndre({ ...svar, [felt]: byttTall(svar[felt], akse, e.target.value === "" ? undefined : e.target.valueAsNumber) })} /></Felt>)}</div>
        <p>Sum: {new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 3 }).format(Object.values(svar[felt]).reduce((a, b) => a + b, 0))} %</p>
      </fieldset>)}
    </Panel>
    <Panel><h2>Forbedringspunkter</h2><p>Oppgi minst tre konkrete punkter.</p>
      {svar.forbedringspunkter.map((punkt, i) => <Felt key={i} navn={`Punkt ${i + 1}`}><textarea rows={2} maxLength={2000} disabled={laast} value={punkt} onChange={(e) => onEndre({ ...svar, forbedringspunkter: svar.forbedringspunkter.map((v, j) => i === j ? e.target.value : v) })} /></Felt>)}
      {!laast && svar.forbedringspunkter.length < 20 && <Knapp variant="secondary" onClick={() => onEndre({ ...svar, forbedringspunkter: [...svar.forbedringspunkter, ""] })}>Legg til punkt</Knapp>}
    </Panel>
  </>;
}

function IupHistorikk({ initial }: { initial: Historikk }) {
  const [rader, setRader] = useState(initial.revisjoner);
  const [neste, setNeste] = useState(initial.nesteRevisjon);
  const [pending, start] = useTransition();
  const [feil, setFeil] = useState(false);
  return <Panel><h2>Historikk</h2><p>Hver lagring bevares som en revisjon. Tidligere svar kan leses her.</p>
    {rader.map((r) => <IupRevisjon key={r.revisjon} rad={r} sisteLevering={initial.levertRevisjon} />)}
    {feil && <p role="alert">Historikken kunne ikke hentes. Prøv igjen.</p>}
    {neste && <Knapp variant="secondary" loading={pending} loadingText="Henter …" onClick={() => start(async () => { try { const mer = await hentIupHistorikkAction({ id: initial.id, forRevisjon: neste }); if (!mer) throw Error("mangler"); setRader((s) => [...s, ...mer.revisjoner]); setNeste(mer.nesteRevisjon); setFeil(false); } catch { setFeil(true); } })}>Eldre revisjoner</Knapp>}
  </Panel>;
}

function IupRevisjon({ rad, sisteLevering }: { rad: Historikk["revisjoner"][number]; sisteLevering: number | null }) {
  const [aapen, setAapen] = useState(false);
  return <details className="iup-historikk" onToggle={(e) => setAapen(e.currentTarget.open)}><summary>Revisjon {rad.revisjon} · {NAVN[rad.status] ?? "Ukjent status"} · {dato(rad.createdAt)}{rad.revisjon === sisteLevering ? " · siste levering" : ""}</summary>
    {aapen && (rad.innhold ? <IupSvarFelt svar={rad.innhold} laast onEndre={() => {}} /> : <p>Kilde- eller formatavvik. Ingen erstatningsverdier er lagt til.</p>)}
  </details>;
}
