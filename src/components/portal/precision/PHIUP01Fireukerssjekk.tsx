"use client";

/**
 * PH-IUP-01 Fireukerssjekk i nytt design (pakke 9 IUP og gameplan).
 * Fasit: docs/design-system/utkast-playerhq/iup.html, skjermene «sjekk» og «levert». Stil: src/styles/playerhq-ny-iup.css.
 *
 * Bare for aktive WANG-/Team Norway-medlemmer; siden sjekker tilgangen på serveren.
 * Hvert svar lagres som en revisjon via lagreIupAction. Feiler lagringen, ligger
 * forespørselen i kø på enheten (localStorage) og sendes med samme requestId ved
 * «Prøv igjen», så serveren aldri lagrer den to ganger.
 *
 * Avvik:
 *   - Merket øverst sier «IUP · nivå» (Junior eller Ung), ikke gruppenavnet: dataene for sjekken har ikke gruppenavnet.
 *   - Alle spørsmål må fortsatt besvares før levering (som før). Tegningen lar spilleren levere med «—» på ubesvarte.
 *   - Skalaforklaringen bruker kildens ord (1 ikke i det hele tatt oppfylt · 5 helt oppfylt), ikke utkastets «svakt/sterkt»,
 *     som er åpent hos Anders.
 *   - «Se svarene» etter levering er ikke med: en levert runde åpnes ikke for endring her. Knappene er «Til I dag» og «Til målsetninger».
 *   - Knappen «Vis lagringsfeil (eksempel)» er en demoknapp i tegningen og er ikke med. Køen vises når lagringen faktisk feiler.
 *   - Ingen riggrad i tests/visual/skjerm-mapping.ts; målt med tests/visual/precision/maal.mjs PH-IUP-01.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Check, ChevronLeft, CloudOff, Loader } from "lucide-react";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { usePaToast } from "@/components/precision/pa-toast";
import { lagreIupAction } from "@/app/portal/mal/evaluering/actions";
import {
  FIREUKER_VERSJON, NIVA_NAVN, PROSESS_NAVN, PROSESS_SVAR, desimal, endring, fireukerOmraader, snitt,
  type ProsessSvar,
} from "@/lib/iup/fireukerssjekk";
import { UTVIKLINGSSJEKK_SKALA, type IupBesvarelse } from "@/lib/iup/utviklingssjekk";
import type { FireukerData } from "@/lib/iup/fireukerssjekk-data";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-iup.css";
import { SkraFlyt, SkraTopp } from "@/components/precision/skra/Skra";
import "@/styles/playerhq-ny-idag.css";
import "@/styles/playerhq-ny-lister-skra.css";
import "@/styles/playerhq-ny-pakke9-skra.css";

type Forespørsel = {
  type: "UTVIKLINGSSJEKK"; periodeStart: string; periodeSlutt: string;
  forventetRevisjon: number; requestId: string; besvarelse: IupBesvarelse;
};
type Lagring = { s: "ny" } | { s: "lagrer" } | { s: "lagret"; t: string } | { s: "ko" } | { s: "konflikt" };

const klokke = () => new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", hour: "2-digit", minute: "2-digit" }).format(new Date());
const datoNo = (iso: string) => iso.split("-").reverse().join(".");
const bredde = (v: number | null) => (v == null ? 0 : (v / 5) * 100);
const retning = (naa: number | null, forrige: number | null) =>
  naa == null || forrige == null ? "" : naa - forrige > 0.04 ? " opp" : naa - forrige < -0.04 ? " ned" : "";

function Topp({ niva, ukeFra, ukeTil, tittel }: { niva: string; ukeFra: number; ukeTil: number; tittel: string }) {
  return <SkraTopp
    lav
    etikett="Fireukerssjekk"
    bilde="/images/playerhq/stats-topp.jpg" bildePosisjon="50% 50%"
    overlinje={`IUP · ${niva} · uke ${ukeFra}–${ukeTil}`}
    tittel={tittel}
    handling={<span className="skra-tilbake"><Link href="/portal" className="tilbake"><ChevronLeft size={20} aria-hidden />I dag</Link></span>}
  />;
}

function Lagrestatus({ st }: { st: Lagring }) {
  if (st.s === "ko" || st.s === "konflikt") return <span className="lagring feil" role="status"><CloudOff size={16} aria-hidden />Ikke lagret</span>;
  if (st.s === "lagrer") return <span className="lagring" role="status"><Loader size={16} aria-hidden />Lagrer …</span>;
  if (st.s === "lagret") return <span className="lagring ok" role="status"><Check size={16} aria-hidden />Lagret {st.t}</span>;
  return <span className="lagring" role="status">Lagres mens du svarer</span>;
}

function Ko({ st, provIgjen }: { st: Lagring; provIgjen: () => void }) {
  if (st.s === "ko") return <div role="alert" className="ko">
    <AlertTriangle size={20} aria-hidden />
    <span><b>Svarene er ikke lagret</b><span className="phn-kilde">De ligger i kø på denne enheten og sendes når du prøver igjen.</span></span>
    <button type="button" className="phn-knapp sek" onClick={provIgjen}>Prøv igjen</button>
  </div>;
  if (st.s === "konflikt") return <div role="alert" className="ko">
    <AlertTriangle size={20} aria-hidden />
    <span><b>Svarene er endret på en annen enhet</b><span className="phn-kilde">Last siden på nytt for å se siste versjon.</span></span>
    <button type="button" className="phn-knapp sek" onClick={() => window.location.reload()}>Last på nytt</button>
  </div>;
  return null;
}

export function PHIUP01Fireukerssjekk({ data, uleste, startSteg = 0 }: { data: FireukerData; uleste: number; startSteg?: number }) {
  const toast = usePaToast();
  const { runde, niva } = data;
  const omraader = useMemo(() => fireukerOmraader(niva), [niva]);
  const total = omraader.reduce((a, o) => a + o.sporsmal.length, 0);
  const koNokkel = `iup27-fireuker-ko:${runde.periodeStart}:${niva}`;
  const start = data.lagret?.besvarelse;

  const [svar, setSvar] = useState<Record<string, number>>(start?.svar ?? {});
  const [pm, setPm] = useState<Record<string, ProsessSvar>>(start?.prosessmal ?? {});
  const [notat, setNotat] = useState(start?.notat ?? "");
  const [levert, setLevert] = useState<string | null>(data.lagret?.levert ?? null);
  const [steg, setSteg] = useState(startSteg);
  const [provd, setProvd] = useState(false);
  const [lagring, setLagring] = useState<Lagring>({ s: "ny" });

  const revisjon = useRef(data.revisjon);
  const ventende = useRef<Forespørsel | null>(null);
  const underveis = useRef(false);
  const skitten = useRef(false);
  const tidtaker = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Siste svar oppdateres i hendelsene, ikke under render.
  const siste = useRef({ svar: start?.svar ?? {}, pm: (start?.prosessmal ?? {}) as Record<string, ProsessSvar>, notat: start?.notat ?? "" });

  const bygg = useCallback((status: "UTKAST" | "LEVERT"): Forespørsel => ({
    type: "UTVIKLINGSSJEKK", periodeStart: runde.periodeStart, periodeSlutt: runde.periodeSlutt,
    forventetRevisjon: revisjon.current, requestId: crypto.randomUUID(),
    besvarelse: {
      versjon: FIREUKER_VERSJON, niva, status, svar: siste.current.svar, prosessmal: siste.current.pm,
      ...(siste.current.notat.trim() ? { notat: siste.current.notat.trim() } : {}),
    },
  }), [runde, niva]);

  const send = useCallback(async (status: "UTKAST" | "LEVERT" = "UTKAST"): Promise<boolean> => {
    if (underveis.current) { skitten.current = true; return false; }
    underveis.current = true;
    let neste: "UTKAST" | "LEVERT" = status;
    try {
      // Endringer som kom mens en lagring pågikk, sendes etterpå i samme løkke.
      for (;;) {
        const f = ventende.current ?? bygg(neste);
        ventende.current = f;
        try { localStorage.setItem(koNokkel, JSON.stringify(f)); } catch { /* privat modus */ }
        setLagring({ s: "lagrer" });
        const r = await lagreIupAction(f);
        if (!r.ok) {
          if (r.kode === "KONFLIKT") { ventende.current = null; setLagring({ s: "konflikt" }); return false; }
          setLagring({ s: "ko" });
          return false;
        }
        revisjon.current = r.revisjon;
        ventende.current = null;
        try { localStorage.removeItem(koNokkel); } catch { /* ingen kø */ }
        setLagring({ s: "lagret", t: klokke() });
        if (!skitten.current || f.besvarelse.status === "LEVERT") return true;
        skitten.current = false;
        neste = "UTKAST";
      }
    } catch {
      setLagring({ s: "ko" });
      return false;
    } finally {
      underveis.current = false;
    }
  }, [bygg, koNokkel]);

  // Kø fra en tidligere lagringsfeil på denne enheten: gjenopprett svarene og be om nytt forsøk.
  useEffect(() => {
    let lagret: Forespørsel | null = null;
    try { lagret = JSON.parse(localStorage.getItem(koNokkel) ?? "null"); } catch { lagret = null; }
    if (!lagret) return;
    if (lagret.forventetRevisjon !== data.revisjon) { try { localStorage.removeItem(koNokkel); } catch { /* */ } return; }
    const ko = lagret;
    ventende.current = ko;
    const pmKo = (ko.besvarelse.prosessmal ?? {}) as Record<string, ProsessSvar>;
    siste.current = { svar: ko.besvarelse.svar, pm: pmKo, notat: ko.besvarelse.notat ?? "" };
    // Lokal lagring er et eksternt system; tilstanden settes i en tilbakekalling.
    const t = setTimeout(() => { setSvar(ko.besvarelse.svar); setPm(pmKo); setNotat(ko.besvarelse.notat ?? ""); setLagring({ s: "ko" }); }, 0);
    return () => clearTimeout(t);
  }, [koNokkel, data.revisjon]);

  useEffect(() => {
    const vakt = (e: BeforeUnloadEvent) => { if (ventende.current || underveis.current) e.preventDefault(); };
    window.addEventListener("beforeunload", vakt);
    return () => window.removeEventListener("beforeunload", vakt);
  }, []);

  const planlegg = () => {
    if (tidtaker.current) clearTimeout(tidtaker.current);
    if (ventende.current) { skitten.current = true; return; } // venter på «Prøv igjen»
    tidtaker.current = setTimeout(() => { void send("UTKAST"); }, 600);
  };
  const velgSvar = (id: string, n: number) => { const ny = { ...siste.current.svar, [id]: n }; siste.current = { ...siste.current, svar: ny }; setSvar(ny); planlegg(); };
  const velgPm = (id: string, v: ProsessSvar) => { const ny = { ...siste.current.pm, [id]: v }; siste.current = { ...siste.current, pm: ny }; setPm(ny); planlegg(); };
  const skrivNotat = (v: string) => { siste.current = { ...siste.current, notat: v }; setNotat(v); planlegg(); };
  const provIgjen = () => { void send(ventende.current?.besvarelse.status ?? "UTKAST"); };

  const steg_ = [
    { k: "Prosessmål", n: data.prosessmal.length, ferdig: data.prosessmal.filter((m) => pm[m.id]).length, qs: null as null | typeof omraader[number]["sporsmal"] },
    ...omraader.map((o) => ({ k: o.kategori, n: o.sporsmal.length, ferdig: o.sporsmal.filter((s) => svar[s.id]).length, qs: o.sporsmal })),
  ];
  const antallSteg = steg_.length + 1;
  const erLever = steg >= steg_.length;
  const naa = steg_[Math.min(steg, steg_.length - 1)];
  const besvart = omraader.reduce((a, o) => a + o.sporsmal.filter((s) => svar[s.id]).length, 0);
  const mangler = steg_.filter((s) => s.ferdig < s.n);
  const forrigeSvar = data.forrige?.besvarelse.svar ?? null;
  const forrigePm = data.forrige?.besvarelse.prosessmal ?? null;
  const alleSporsmal = omraader.flatMap((o) => o.sporsmal);

  const gaaTil = (i: number) => { setSteg(i); window.scrollTo({ top: 0 }); };

  const lever = async () => {
    setProvd(true);
    if (mangler.length) return;
    if (tidtaker.current) clearTimeout(tidtaker.current);
    if (underveis.current || ventende.current) { setLagring({ s: "ko" }); return; }
    const ok = await send("LEVERT");
    if (!ok) return;
    setLevert(new Date().toISOString().slice(0, 10));
    toast.vis("Fireukerssjekken er levert", data.serSvarene ?? undefined);
    window.scrollTo({ top: 0 });
  };

  if (levert) {
    const rader = omraader.map((o) => [o.kategori, snitt(o.sporsmal, svar), snitt(o.sporsmal, forrigeSvar)] as const);
    const totalNaa = snitt(alleSporsmal, svar);
    const totalForrige = snitt(alleSporsmal, forrigeSvar);
    const tr = retning(totalNaa, totalForrige);
    return <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
      <div className="phn phn-iup phn-skra" data-od-id="playerhq-iup-fireuker-levert">
        <Topp niva={NIVA_NAVN[niva]} ukeFra={runde.ukeFra} ukeTil={runde.ukeTil} tittel="Fireukerssjekk levert" />
        <SkraFlyt lav>
        <div className="to-del">
          <div>
            <section className="phn-kort" aria-label="Levert">
              <span className="hake"><Check size={28} strokeWidth={2.5} aria-hidden /></span>
              <div className="phn-hoved">
                <strong>{desimal(totalNaa)}</strong>
                {data.forrige && <span className={`phn-trend${tr}`}>{endring(totalNaa, totalForrige)}</span>}
              </div>
              <p className="phn-forklar">Snitt av {total} svar, skala 1–5. {data.forrige ? `Forrige runde uke ${data.forrige.runde.ukeFra}–${data.forrige.runde.ukeTil}.` : "Dette er første runde, så det er ingen å sammenligne med."}</p>
              <p className="phn-kilde">Levert {datoNo(levert)}.{data.serSvarene ? ` ${data.serSvarene}.` : ""} Neste runde starter etter uke {runde.ukeTil}.</p>
            </section>
            <section className="phn-seksjon" aria-label="Prosessmål">
              <div className="phn-sek-topp"><h2>Prosessmål</h2></div>
              {data.prosessmal.length === 0 ? <p className="phn-forklar">Ingen aktive prosessmål.</p>
                : <ul className="historikk">{data.prosessmal.map((m) => <li key={m.id}><span>{m.tittel}</span><b>{pm[m.id] ? PROSESS_NAVN[pm[m.id]] : "—"}</b></li>)}</ul>}
            </section>
          </div>
          <div>
            <section className="phn-seksjon" aria-label="Per område">
              <div className="phn-sek-topp"><h2>Per område</h2>
                <span className="phn-lg-rad"><span className="phn-lg"><i style={{ background: "var(--phn-g900)" }} />Nå</span>
                  {data.forrige && <span className="phn-lg"><i style={{ background: "var(--phn-amber-700)", width: 3 }} />Uke {data.forrige.runde.ukeFra}–{data.forrige.runde.ukeTil}</span>}</span>
              </div>
              <div className="snitt-rader" role="list">
                {rader.map(([t, a, b]) => <div key={t} className="snitt-rad" role="listitem" aria-label={`${t}: nå ${desimal(a)}, forrige ${desimal(b)}`}>
                  <b>{t}</b>
                  <div className="snitt-spor" aria-hidden="true">
                    <span className="naa" style={{ width: `${bredde(a)}%` }} />
                    {b != null && <span className="forr" style={{ left: `${bredde(b)}%` }} />}
                  </div>
                  <span className="v">{desimal(a)}{b != null && <span className={`endr${retning(a, b)}`}>{endring(a, b)}</span>}</span>
                </div>)}
              </div>
              <p className="phn-kilde">Skala 1–5 · IUP 2027.</p>
            </section>
            <section className="phn-seksjon" aria-label="Historikk">
              <div className="phn-sek-topp"><h2>Tidligere runder</h2></div>
              {data.historikk.length === 0 ? <p className="phn-forklar">Dette er første leverte runde.</p> : <>
                {data.historikk.some((h) => h.versjon === "iup-2025") && <p className="phn-forklar">Spørsmålene var andre i 2025, så de tallene står for seg og sammenlignes ikke.</p>}
                <ul className="historikk">{data.historikk.map((h, i) => <li key={`${h.versjon}-${h.levert}-${i}`}>
                  <span>Uke {h.ukeFra}–{h.ukeTil} · IUP {h.versjon.replace("iup-", "")}</span><b>{datoNo(h.levert)}</b>
                </li>)}</ul>
              </>}
            </section>
            <div className="phn-knapper">
              <Link href="/portal" className="phn-knapp pri">Til I dag</Link>
              <Link href="/portal/mal" className="phn-knapp sek">Til målsetninger</Link>
            </div>
          </div>
        </div>
        </SkraFlyt>
      </div>
      {toast.el}
    </PlayerHQSkall>;
  }

  let innhold: React.ReactNode;
  if (steg === 0) innhold = <>
    <div className="omr-tittel"><h2>Prosessmål</h2><span className="phn-kilde">Siste fire uker</span></div>
    <p className="phn-forklar">Har du gjort det du satte deg fore? Målsetningene ligger i Workbench.</p>
    {data.prosessmal.length === 0 ? <p className="phn-forklar">Ingen aktive prosessmål. Legg dem inn i Workbench › Målsetninger.</p>
      : <div className="spm-liste">{data.prosessmal.map((m) => <div key={m.id} className={`spm${pm[m.id] ? " besvart" : ""}`}>
        <p>{m.tittel}</p>
        <div className="tre" role="group" aria-label={m.tittel}>{PROSESS_SVAR.map((o) =>
          <button key={o} type="button" aria-pressed={pm[m.id] === o} onClick={() => velgPm(m.id, o)}>{PROSESS_NAVN[o]}</button>)}</div>
        {forrigePm?.[m.id] && <span className="phn-kilde">Forrige runde: {PROSESS_NAVN[forrigePm[m.id]]}</span>}
      </div>)}</div>}
  </>;
  else if (!erLever && naa.qs) innhold = <>
    <div className="omr-tittel"><h2>{naa.k}</h2><span className="phn-kilde">{naa.ferdig} av {naa.n} besvart</span></div>
    <div className="skal-forklar"><span>1 {UTVIKLINGSSJEKK_SKALA[0].tekst.toLowerCase()}</span><span>5 {UTVIKLINGSSJEKK_SKALA[4].tekst.toLowerCase()}</span></div>
    {forrigeSvar && <p className="phn-kilde">Streken under et tall viser svaret ditt forrige runde.</p>}
    <div className="spm-liste">{naa.qs.map((s) => {
      const forrige = forrigeSvar?.[s.id] ?? null;
      return <div key={s.id} className={`spm${svar[s.id] ? " besvart" : ""}`}>
        <p>{s.tekst}</p>
        <div className="skal" role="group" aria-label={s.tekst}>{[1, 2, 3, 4, 5].map((n) =>
          <button key={n} type="button" aria-pressed={svar[s.id] === n} className={forrige === n ? "forrige" : undefined}
            title={forrige === n ? "Forrige svar" : undefined}
            aria-label={`${n} av 5 · ${UTVIKLINGSSJEKK_SKALA[n - 1].tekst}${forrige === n ? " · forrige svar" : ""}`}
            onClick={() => velgSvar(s.id, n)}>{n}</button>)}</div>
      </div>;
    })}</div>
  </>;
  else innhold = <>
    <div className="omr-tittel"><h2>Klar til å levere?</h2><span className="phn-kilde">{besvart} av {total} besvart</span></div>
    <p className="phn-forklar">{mangler.length ? "Svar på alt før du leverer. Trykk på et område for å gå dit." : "Alle spørsmålene er besvart."}{data.serSvarene ? ` ${data.serSvarene} når du leverer.` : ""}</p>
    <div className="omr-oversikt">{steg_.map((s, i) => <button key={s.k} type="button" onClick={() => gaaTil(i)}>
      <b>{s.k}</b>
      <span className={`n${s.ferdig < s.n ? " mangler" : ""}`}>{s.ferdig} / {s.n}</span>
      <span className="s">{s.qs ? desimal(snitt(s.qs, svar)) : ""}</span>
    </button>)}</div>
    {provd && mangler.length > 0 && <p className="advarsel" role="alert">Mangler svar i {mangler.map((s) => s.k).join(", ")}.</p>}
    <div className="phn-felt">
      <label htmlFor="iup-notat">Noe trenerne bør vite? (valgfritt)</label>
      <textarea id="iup-notat" rows={3} maxLength={2000} value={notat} placeholder="Mye skole i uke 38." onChange={(e) => skrivNotat(e.target.value)} />
    </div>
  </>;

  return <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
    <div className="phn phn-iup phn-skra" data-od-id="playerhq-iup-fireuker">
      <Topp niva={NIVA_NAVN[niva]} ukeFra={runde.ukeFra} ukeTil={runde.ukeTil} tittel="Fireukerssjekk" />
      <SkraFlyt lav>
      <div className="smal">
        <div className="flyt">
          <div className="steg-topp">
            <div className="rad">
              <span className="phn-kilde">Steg {steg + 1} av {antallSteg}{steg > 0 && !erLever ? ` · ${naa.k}` : ""} · {besvart} av {total} svar</span>
              <Lagrestatus st={lagring} />
            </div>
            <div className="stolpe" aria-hidden="true"><span style={{ width: `${((steg + 1) / antallSteg) * 100}%` }} /></div>
          </div>
          <Ko st={lagring} provIgjen={provIgjen} />
          <div className="steg">{innhold}</div>
          <div className="navigasjon">
            {steg > 0
              ? <button type="button" className="phn-knapp sek" onClick={() => gaaTil(steg - 1)}>Tilbake</button>
              : <Link href="/portal" className="phn-knapp sek">Fortsett senere</Link>}
            {erLever
              ? <button type="button" className="phn-knapp pri" disabled={lagring.s === "lagrer"} onClick={() => void lever()}>{lagring.s === "lagrer" ? "Lagrer …" : "Lever sjekken"}</button>
              : <button type="button" className="phn-knapp pri" onClick={() => gaaTil(steg + 1)}>Neste</button>}
          </div>
        </div>
      </div>
      </SkraFlyt>
    </div>
    {toast.el}
  </PlayerHQSkall>;
}
