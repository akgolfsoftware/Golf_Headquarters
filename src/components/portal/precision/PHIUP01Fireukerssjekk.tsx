"use client";

/**
 * PH-IUP-01 Fireukerssjekk (04.10.2026). Design: docs/design-handoff/design/playerhq/PH-IUP.jsx.txt (FT).
 * Bare for aktive WANG-/Team Norway-medlemmer; siden sjekker tilgangen på serveren.
 * Hvert svar lagres som en revisjon via lagreIupAction. Feiler lagringen, ligger
 * forespørselen i kø på enheten (localStorage) og sendes med samme requestId ved
 * «Prøv igjen», så serveren aldri lagrer den to ganger.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, CloudOff, Loader, RotateCw, Send } from "lucide-react";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { Knapp, Meta, Sidehode, StatusPille, Tall } from "@/components/precision/pa";
import { usePaToast } from "@/components/precision/pa-toast";
import { lagreIupAction } from "@/app/portal/mal/evaluering/actions";
import {
  FIREUKER_VERSJON, NIVA_NAVN, PROSESS_NAVN, PROSESS_SVAR, desimal, endring, fireukerOmraader, snitt,
  type ProsessSvar,
} from "@/lib/iup/fireukerssjekk";
import { UTVIKLINGSSJEKK_SKALA, type IupBesvarelse } from "@/lib/iup/utviklingssjekk";
import type { FireukerData } from "@/lib/iup/fireukerssjekk-data";
import "@/styles/precision-iup.css";

type Forespørsel = {
  type: "UTVIKLINGSSJEKK"; periodeStart: string; periodeSlutt: string;
  forventetRevisjon: number; requestId: string; besvarelse: IupBesvarelse;
};
type Lagring = { s: "ny" } | { s: "lagrer" } | { s: "lagret"; t: string } | { s: "ko" } | { s: "konflikt" };

const SKALA_TEKST = UTVIKLINGSSJEKK_SKALA.map((s) => s.tekst);
const klokke = () => new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", hour: "2-digit", minute: "2-digit" }).format(new Date());
const datoNo = (iso: string) => iso.split("-").reverse().join(".");

function Kort({ k, meta, label, children }: { k: string; meta?: string; label?: string; children: React.ReactNode }) {
  return <section aria-label={label ?? k} className="pa-card iup27-kort">
    <div className="iup27-hode"><span className="kicker">{k}</span>{meta != null && <Meta>{meta}</Meta>}</div>
    {children}
  </section>;
}

function Skala({ tekst, verdi, velg, forrige }: { tekst: string; verdi?: number; velg: (n: number) => void; forrige?: number | null }) {
  return <div role="group" aria-label={tekst} style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
    <span className="iup27-spm">{tekst}</span>
    <div className="iup27-skala">{[1, 2, 3, 4, 5].map((n) =>
      <button key={n} type="button" aria-pressed={verdi === n} aria-label={`${n} av 5 · ${SKALA_TEKST[n - 1]}`} onClick={() => velg(n)}>{n}</button>)}
    </div>
    <Meta>{verdi ? `${verdi} · ${SKALA_TEKST[verdi - 1].toUpperCase()}` : "IKKE BESVART"}{forrige != null ? ` · FORRIGE ${forrige}` : ""}</Meta>
  </div>;
}

function Lagrelinje({ st, provIgjen }: { st: Lagring; provIgjen: () => void }) {
  if (st.s === "ko") return <div role="alert" className="iup27-ko">
    <CloudOff size={16} aria-hidden /><span>Ikke lagret. Svarene ligger i kø på denne enheten og sendes når du prøver igjen.</span>
    <Knapp variant="secondary" size="sm" icon={RotateCw} iconName="rotate-cw" onClick={provIgjen}>Prøv igjen</Knapp>
  </div>;
  if (st.s === "konflikt") return <div role="alert" className="iup27-ko">
    <CloudOff size={16} aria-hidden /><span>Svarene er endret på en annen enhet. Last siden på nytt for å se siste versjon.</span>
    <Knapp variant="secondary" size="sm" icon={RotateCw} iconName="rotate-cw" onClick={() => window.location.reload()}>Last på nytt</Knapp>
  </div>;
  return <div role="status" className="iup27-lagret">
    {st.s === "lagrer" ? <Loader size={14} aria-hidden /> : <Check size={14} aria-hidden />}
    <Meta>{st.s === "lagrer" ? "LAGRER …" : st.s === "lagret" ? `LAGRET ${st.t}` : "LAGRES MENS DU SVARER"}</Meta>
  </div>;
}

export function PHIUP01Fireukerssjekk({ data, uleste, startSteg = 0 }: { data: FireukerData; uleste: number; startSteg?: number }) {
  const router = useRouter();
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
  const alle = [...steg_, { k: "Lever", n: 0, ferdig: 0, qs: null, lever: true as const }];
  const besvart = omraader.reduce((a, o) => a + o.sporsmal.filter((s) => svar[s.id]).length, 0);
  const mangler = steg_.filter((s) => s.ferdig < s.n);
  const naa = alle[steg];
  const forrigeSvar = data.forrige?.besvarelse.svar ?? null;
  const forrigePm = data.forrige?.besvarelse.prosessmal ?? null;
  const serSvarene = data.serSvarene?.toUpperCase() ?? null;

  const lever = async () => {
    setProvd(true);
    if (mangler.length) return;
    if (tidtaker.current) clearTimeout(tidtaker.current);
    if (underveis.current || ventende.current) { setLagring({ s: "ko" }); return; }
    const ok = await send("LEVERT");
    if (!ok) return;
    setLevert(new Date().toISOString().slice(0, 10));
    toast.vis("Fireukerssjekken er levert", serSvarene ?? undefined);
    window.scrollTo({ top: 0 });
  };

  const hode = <Sidehode kicker="I dag · Fireukerssjekk" title={`Fireukerssjekk · uke ${runde.ukeFra}–${runde.ukeTil}`}
    sub={`Prosessmål og utviklingssjekk. Nivå ${NIVA_NAVN[niva]}, ${total} spørsmål i ${omraader.length} områder, skala 1–5.`} />;
  const neste = (() => { const s = new Date(`${runde.periodeSlutt}T00:00:00Z`); s.setUTCDate(s.getUTCDate() + 1); return s; })();

  if (levert) {
    const rader = omraader.map((o) => [o.kategori, snitt(o.sporsmal, svar), snitt(o.sporsmal, forrigeSvar)] as const);
    return <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
      <div className="pa-side iup27-side">
        {hode}
        <Kort k="Levert" meta={datoNo(levert)}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <StatusPille tone="ok">Levert</StatusPille>
            <span className="iup27-tittel">{data.serSvarene ? `${data.serSvarene}. ` : ""}Neste runde starter {datoNo(neste.toISOString().slice(0, 10))}.</span>
          </div>
        </Kort>
        <div className="iup27-levert">
          <Kort k="Utvikling per område" meta={data.forrige ? `SNITT MOT UKE ${data.forrige.runde.ukeFra}–${data.forrige.runde.ukeTil}` : "FØRSTE RUNDE"}>
            <div role="table" aria-label="Utvikling per område">
              <div role="row" className="iup27-tabell-hode">{["OMRÅDE", "NÅ", "FORRIGE", "ENDRING"].map((h, i) => <span key={h} role="columnheader" className={i ? "iup27-hoyre" : undefined}><Meta>{h}</Meta></span>)}</div>
              {rader.map(([t, a, b]) => <div role="row" key={t} className="iup27-tabell-rad">
                <span role="cell" className="iup27-navn">{t}</span>
                <span role="cell" className="iup27-hoyre"><Tall>{desimal(a)}</Tall></span>
                <span role="cell" className="iup27-hoyre"><Tall style={{ color: "var(--text-secondary)" }}>{desimal(b)}</Tall></span>
                <span role="cell" className="iup27-hoyre"><Tall>{endring(a, b)}</Tall></span>
              </div>)}
            </div>
            <Meta>SKALA 1–5 · IUP 2027</Meta>
          </Kort>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
            <Kort k="Prosessmål">
              {data.prosessmal.length === 0 ? <p className="iup27-muted">Ingen aktive prosessmål.</p> : data.prosessmal.map((m) => <div key={m.id} className="iup27-pm">
                <span style={{ font: "400 14px/1.35 var(--font-sans)", color: "var(--text-primary)", textWrap: "pretty" }}>{m.tittel}</span>
                <Meta style={{ color: "var(--text-primary)" }}>{pm[m.id] ? PROSESS_NAVN[pm[m.id]].toUpperCase() : "—"}</Meta>
              </div>)}
            </Kort>
            <Kort k="Historikk">
              {data.historikk.length === 0 ? <p className="iup27-muted">Dette er første leverte runde.</p> : data.historikk.map((h, i) => <div key={`${h.versjon}-${h.levert}-${i}`} style={{ display: "flex", flexDirection: "column", gap: 2, paddingTop: i ? 8 : 0, borderTop: i ? "1px solid var(--border-hairline)" : "none" }}>
                <span className="iup27-navn">Uke {h.ukeFra}–{h.ukeTil} · IUP {h.versjon.replace("iup-", "")}</span>
                <Meta>{datoNo(h.levert)}{h.versjon === "iup-2025" ? " · EGET SPØRSMÅLSSETT. SAMMENLIGNES IKKE MED 2027." : ""}</Meta>
              </div>)}
            </Kort>
          </div>
        </div>
        <div><Knapp variant="secondary" icon={ArrowLeft} iconName="arrow-left" onClick={() => router.push("/portal")}>Til I dag</Knapp></div>
      </div>
      {toast.el}
    </PlayerHQSkall>;
  }

  const navRad = <div className="iup27-nav">
    {steg > 0 && <Knapp variant="ghost" icon={ArrowLeft} iconName="arrow-left" onClick={() => setSteg(steg - 1)}>Forrige</Knapp>}
    <span className="iup27-fyll" />
    {!("lever" in naa) && <Knapp variant={naa.ferdig === naa.n ? "primary" : "secondary"} iconRight={ArrowRight} onClick={() => setSteg(steg + 1)}>
      {"lever" in alle[steg + 1] ? "Gå til levering" : `Neste: ${alle[steg + 1].k}`}
    </Knapp>}
  </div>;

  let innhold: React.ReactNode;
  if (steg === 0) innhold = <Kort k="Prosessmål" meta={`${naa.ferdig} AV ${naa.n}`}>
    <p className="iup27-muted">Har du fulgt prosessmålene de fire siste ukene?</p>
    {data.prosessmal.length === 0 && <p className="iup27-muted">Ingen aktive prosessmål. Legg dem inn i Workbench › Målsetninger.</p>}
    {data.prosessmal.map((m) => <div key={m.id} role="group" aria-label={m.tittel} className="iup27-rad">
      <span className="iup27-spm">{m.tittel}</span>
      <div className="iup27-valg">{PROSESS_SVAR.map((o) => <button key={o} type="button" aria-pressed={pm[m.id] === o} onClick={() => velgPm(m.id, o)}>{PROSESS_NAVN[o]}</button>)}</div>
      {forrigePm?.[m.id] && <Meta>FORRIGE {PROSESS_NAVN[forrigePm[m.id]].toUpperCase()}</Meta>}
    </div>)}
    {navRad}
  </Kort>;
  else if (!("lever" in naa) && naa.qs) innhold = <Kort k={naa.k} meta={`${naa.ferdig} AV ${naa.n} BESVART`}>
    <Meta>1 IKKE I DET HELE TATT OPPFYLT · 3 MODERAT · 5 HELT OPPFYLT</Meta>
    {naa.qs.map((s) => <div key={s.id} className="iup27-rad">
      <Skala tekst={s.tekst} verdi={svar[s.id]} velg={(n) => velgSvar(s.id, n)} forrige={forrigeSvar?.[s.id] ?? null} />
    </div>)}
    {navRad}
  </Kort>;
  else innhold = <Kort k="Lever" meta={`${besvart} AV ${total} SVAR`}>
    <div role="list">{steg_.map((s, i) => <button role="listitem" type="button" key={s.k} className="iup27-leverrad" onClick={() => setSteg(i)}>
      <span className="iup27-navn">{s.k}</span>
      <Meta style={{ color: s.ferdig < s.n ? "var(--signal-ink)" : undefined }}>{s.ferdig} AV {s.n}</Meta>
      {s.qs ? <Tall style={{ minWidth: 32, textAlign: "right" }}>{desimal(snitt(s.qs, svar))}</Tall> : <span style={{ minWidth: 32 }} />}
    </button>)}</div>
    {provd && mangler.length > 0 && <Meta style={{ color: "var(--signal-ink)" }}>SVAR PÅ ALT FØR DU LEVERER · {mangler.map((s) => s.k.toUpperCase()).join(", ")}</Meta>}
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ font: "500 13px/1.3 var(--font-sans)", color: "var(--text-secondary)" }}>Noe trenerne bør vite? (valgfritt)</span>
      <textarea className="iup27-tekstfelt" aria-label="Noe trenerne bør vite" rows={3} maxLength={2000} value={notat} placeholder="Mye skole i uke 38." onChange={(e) => skrivNotat(e.target.value)} />
    </label>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Knapp size="lg" icon={Send} iconName="send" onClick={() => void lever()} loading={lagring.s === "lagrer"} loadingText="Lagrer …">Lever fireukerssjekken</Knapp>
      <Knapp variant="ghost" onClick={() => router.push("/portal")}>Fortsett senere</Knapp>
    </div>
    {serSvarene && <Meta>{serSvarene} NÅR DU LEVERER</Meta>}
  </Kort>;

  const stegliste = <Kort k="Steg" meta={`${besvart} AV ${total} SVAR`} label="Steg">
    <div role="list" style={{ display: "flex", flexDirection: "column" }}>{alle.map((s, i) => {
      const ok = !("lever" in s) && s.n > 0 && s.ferdig === s.n;
      return <button key={s.k} role="listitem" type="button" className="iup27-steg" aria-current={i === steg ? "step" : undefined} onClick={() => setSteg(i)}>
        <span>{s.k}</span>{!("lever" in s) && <Meta>{s.ferdig} AV {s.n}</Meta>}
        <span style={{ width: 16, display: "inline-flex", color: "var(--text-primary)" }}>{ok && <Check size={14} aria-hidden />}</span>
      </button>;
    })}</div>
  </Kort>;

  return <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
    <div className="pa-side iup27-side">
      {hode}
      <Lagrelinje st={lagring} provIgjen={provIgjen} />
      <div className="iup27-mobbar">
        <Meta>STEG {steg + 1} AV {alle.length} · {naa.k.toUpperCase()} · {besvart} AV {total} SVAR</Meta>
        <div aria-hidden="true" className="iup27-fremdrift"><div style={{ width: `${Math.round((steg / (alle.length - 1)) * 100)}%` }} /></div>
      </div>
      <div className="iup27-kol">
        <div className="iup27-stegliste">{stegliste}</div>
        {innhold}
      </div>
    </div>
    {toast.el}
  </PlayerHQSkall>;
}
