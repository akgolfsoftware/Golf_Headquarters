"use client";

/**
 * AG-TP-01 Oppgaveskjema, Precision Athletics. Tegning: Claude Design 7d7c2994,
 * ui_kits/agencyos/screens/AG-TP.jsx (etag 1790543766173263).
 *
 * Over 1024 px: forhåndsvisning til venstre og inspektør 340 px til høyre.
 * 1024 og smalere: forhåndsvisning og skjemaet i ark nedenfra («Åpne skjemaet»).
 * AK-formelen står øverst i skjemaet og følger hvert valg.
 *
 * Avvik fra tegningen (dataene finnes ikke i basen, se tp-deler.tsx):
 * - Ett læringssteg (steget spilleren er på) i stedet for flere valgte steg;
 *   rep-mål settes per steg (Uten ball · Lav hastighet · Automatikk).
 * - Miljø: ett hovedmiljø for formelen, rep-mål for alle fire miljøer (0 = ikke i planen).
 * - «Publiser til spiller» publiserer planen (TechnicalPlan.status). Publisering per
 *   oppgave og publiseringsdato finnes ikke (tillegg D4).
 * - «Slett oppgave» er beholdt fra dagens coachside, bak bekreftelse.
 */
import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Pencil, Plus, Send, Trash2 } from "lucide-react";
import { Knapp, KnappLenke } from "@/components/precision/pa";
import { Ark, Dialogboks, Nedtrekk, Tekstfelt } from "@/components/precision/pa-a4";
import { Formel, Meta, OppgaveKort, Teller, Valg, desimal, tall } from "@/components/precision/teknisk-plan/tp-deler";
import { lagreOppgave, slettOppgave } from "@/app/admin/spillere/[id]/plan/[planId]/oppgave-actions";
import { publiserTekniskPlan } from "@/app/admin/spillere/[id]/plan/[planId]/plan-actions";
import {
  PROTOKOLL_NAVN, RADAR_UTSTYR, TM_PARAMETRE, TP_POSISJONER, familieFor, formelFor, protokollTekst, tmParameter,
  type Protokolltype, type TpOppgave, type TpSkjema,
} from "@/lib/teknisk-plan/tp-visning";
import {
  BELASTNING_KODER, BELASTNING_LABEL, DIMENSJON_LABEL, MAALEUTSTYR_KODER, MAALEUTSTYR_LABEL, MOTORIKK_KODER,
  MOTORIKK_LABEL, OMRAADER, PRESS_KODER, PRESS_LABEL, SAND_TRINN_KODER, SAND_TRINN_LABEL, omraadeDef, type OmraadeKode,
} from "@/lib/domain/ak-formel-v2";
import { dimensjonerFor } from "@/lib/domain/omrade-relevans";
import { KOLLER, pNavn } from "@/components/teknisk-plan/constants";

type Familie = "Fullsving" | "Nærspill" | "Bunker" | "Putting";
const FAMILIER: Record<Familie, OmraadeKode[]> = {
  Fullsving: OMRAADER.filter((o) => o.familie === "FULLSVING").map((o) => o.kode),
  "Nærspill": ["CHIP", "PITCH", "LOB"],
  Bunker: ["BUNKER"],
  Putting: OMRAADER.filter((o) => o.familie === "PUTT").map((o) => o.kode),
};
const familieAv = (k: OmraadeKode | null): Familie | null =>
  k ? ((Object.keys(FAMILIER) as Familie[]).find((f) => FAMILIER[f].includes(k)) ?? null) : null;

type Status = "ny" | "uendret" | "endret" | "lagrer" | "lagret" | "publisert";

export type AGTP01Props = {
  planId: string;
  spillerId: string;
  spillerNavn: string;
  planAktiv: boolean;
  skjema: TpSkjema;
  /** Oppgaven slik den er lagret (gjort-tall og målinger til forhåndsvisningen). null for ny. */
  base: TpOppgave | null;
};

function Gruppe({ navn, hint, children }: { navn: string; hint?: string; children: ReactNode }) {
  return <fieldset className="tp-gruppe">
    <legend className="tp-gruppe__navn">{navn}</legend>
    {hint && <Meta>{hint}</Meta>}
    {children}
  </fieldset>;
}

/** Oppgavekortet slik spilleren vil se det, bygget fra skjemaet og det som er lagret. */
function forhandsvisning(f: TpSkjema, base: TpOppgave | null): TpOppgave {
  const fam = familieFor(f.omraadeKode);
  const gjortSteg = (i: number) => (base && base.familie === fam ? base.steg[i]?.gjort ?? 0 : 0);
  const steg = fam === "FULLSVING"
    ? MOTORIKK_KODER.map((m, i) => ({ navn: MOTORIKK_LABEL[m], gjort: gjortSteg(i), maal: f.repSteg[m] > 0 ? f.repSteg[m] : null }))
    : [{ navn: fam === "BUNKER" && f.sandTrinn ? `Repetisjoner · ${SAND_TRINN_LABEL[f.sandTrinn]}` : "Repetisjoner", gjort: base ? base.gjort : 0, maal: f.rep > 0 ? f.rep : null }];
  const utstyr = f.maaleutstyr;
  return {
    id: "forhand",
    pNummer: f.pNummer ?? "—",
    hovedP: f.pNummer ?? "",
    posisjonNavn: f.pNummer ? pNavn(f.pNummer) : "—",
    tittel: f.tittel.trim() || "Uten tittel",
    slag: f.slagNavn.trim() || "—",
    omraade: f.omraadeKode ? omraadeDef(f.omraadeKode).label : "—",
    fokus: f.dimensjon ? DIMENSJON_LABEL[f.dimensjon] : "—",
    status: base ? base.status : "Ikke startet",
    formel: formelFor({ pyramide: "TEK", omraadeKode: f.omraadeKode, motorikk: f.motorikk, belastning: f.belastning, press: f.press }),
    familie: fam,
    steg,
    miljo: BELASTNING_KODER.map((b) => {
      const n = f.repMiljo[b] ?? 0;
      return { kode: b, navn: BELASTNING_LABEL[b], gjort: base?.miljo.find((m) => m.kode === b)?.gjort ?? 0, maal: n > 0 ? n : null };
    }),
    gjort: steg.reduce((s, x) => s + x.gjort, 0),
    maal: steg.reduce((s, x) => s + (x.maal ?? 0), 0),
    kilde: base?.kilde ?? "INGEN REGISTRERINGER ENNÅ",
    utstyr: utstyr ? MAALEUTSTYR_LABEL[utstyr] : null,
    harRadar: !!utstyr && RADAR_UTSTYR.includes(utstyr),
    tm: f.tm.map((r, i) => {
      const lagret = r.id ? base?.tm.find((x) => x.id === r.id) : undefined;
      const p = tmParameter(r.metric);
      const samme = lagret && lagret.navn === p.navn;
      return {
        id: r.id ?? `ny-${i}`, navn: p.navn, enhet: p.enhet, desimaler: p.desimaler, fra: r.fra, til: r.til,
        utgangspunkt: samme ? lagret.utgangspunkt : null, naa: samme ? lagret.naa : null,
        innenfor: samme && lagret.naa != null ? lagret.naa >= r.fra && lagret.naa <= r.til : null,
        klubb: f.kolle ?? "Alle køller", utgangspunktDato: samme ? lagret.utgangspunktDato : "—", sistMaalt: samme ? lagret.sistMaalt : "—",
      };
    }),
    protokoll: f.protokoll
      ? { type: f.protokoll.type, navn: PROTOKOLL_NAVN[f.protokoll.type], tekst: protokollTekst(f.protokoll.type, f.protokoll.type === "STREAK" ? null : f.protokoll.antall, f.protokoll.treff), naa: base?.protokoll?.type === f.protokoll.type ? base.protokoll.naa : "—" }
      : null,
  };
}

export function AGTP01Oppgaveskjema({ planId, spillerId, spillerNavn, planAktiv, skjema, base }: AGTP01Props) {
  const router = useRouter();
  const [f, setF] = useState<TpSkjema>(skjema);
  const [st, setSt] = useState<Status>(skjema.id ? "uendret" : "ny");
  const [lagretKl, setLagretKl] = useState<string | null>(null);
  const [feil, setFeil] = useState<string | null>(null);
  const [ark, setArk] = useState(true);
  const [slett, setSlett] = useState(false);
  const [pending, start] = useTransition();
  const planHref = `/admin/spillere/${spillerId}/plan/${planId}`;

  const opp = (p: Partial<TpSkjema>) => { setF((o) => ({ ...o, ...p })); setSt("endret"); };
  const fam = familieAv(f.omraadeKode);
  const fullsving = fam === "Fullsving", bunker = fam === "Bunker";
  const radar = !!f.maaleutstyr && RADAR_UTSTYR.includes(f.maaleutstyr);
  const sumSteg = fullsving ? MOTORIKK_KODER.reduce((s, m) => s + f.repSteg[m], 0) : f.rep;
  const sumMiljo = BELASTNING_KODER.reduce((s, b) => s + (f.repMiljo[b] ?? 0), 0);
  const formel = formelFor({ pyramide: "TEK", omraadeKode: f.omraadeKode, motorikk: f.motorikk, belastning: f.belastning, press: f.press });
  const kanLagre = !!f.pNummer && !!f.tittel.trim() && !!f.omraadeKode;

  const lagre = () => {
    if (!kanLagre) { setFeil("Oppgaven mangler posisjon, tittel eller område."); return; }
    setSt("lagrer");
    start(async () => {
      try {
        const svar = await lagreOppgave(planId, f);
        if (!svar.ok) { setFeil(svar.feil); setSt("endret"); return; }
        setFeil(null);
        setSt("lagret");
        setLagretKl(new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", hour: "2-digit", minute: "2-digit" }).format(new Date()));
        if (!f.id) { setF((o) => ({ ...o, id: svar.taskId })); router.replace(`${planHref}?oppgave=${svar.taskId}`); }
        router.refresh();
      } catch (e) {
        setFeil(e instanceof Error ? e.message : "Oppgaven ble ikke lagret.");
        setSt("endret");
      }
    });
  };
  const publiser = () => start(async () => {
    try { await publiserTekniskPlan(planId); setSt("publisert"); setFeil(null); router.refresh(); }
    catch (e) { setFeil(e instanceof Error ? e.message : "Planen ble ikke publisert."); }
  });
  const slettNaa = () => start(async () => {
    if (!f.id) return;
    try { await slettOppgave(planId, f.id); router.push(planHref); router.refresh(); }
    catch (e) { setFeil(e instanceof Error ? e.message : "Oppgaven ble ikke slettet."); setSlett(false); }
  });

  const statusTekst = {
    ny: "Ikke lagret",
    uendret: planAktiv ? "Lagret · planen er publisert" : "Lagret · planen er ikke publisert",
    endret: "Endret · ikke lagret",
    lagrer: "Lagrer …",
    lagret: `Lagret ${lagretKl ?? ""} · ${planAktiv ? "planen er publisert" : "planen er ikke publisert"}`,
    publisert: `Lagret ${lagretKl ?? ""} · planen er publisert`,
  }[st];

  const settTm = (i: number, p: Partial<TpSkjema["tm"][number]>) => opp({ tm: f.tm.map((r, j) => (j === i ? { ...r, ...p } : r)) });

  const skjemaInnhold = <>
    <div className="tp-formelhode"><Meta>AK-FORMELEN · OPPDATERES FOR HVERT VALG</Meta><Formel stor>{formel ?? "—"}</Formel></div>
    <Gruppe navn="Posisjon">
      <div className="tp-fem">{TP_POSISJONER.map((p) => <Valg key={p.pNummer} mono valgt={f.pNummer === p.pNummer} onClick={() => opp({ pNummer: p.pNummer })}>{p.pNummer}</Valg>)}</div>
      <Meta>{f.pNummer ? `${f.pNummer} · ${pNavn(f.pNummer).toUpperCase()}` : "IKKE VALGT"}</Meta>
    </Gruppe>
    <Gruppe navn="Tittel"><Tekstfelt value={f.tittel} onChange={(v) => opp({ tittel: v })} placeholder="Hendene foran ballen i treff" /></Gruppe>
    <Gruppe navn="Slag" hint="FRITEKST · F.EKS. 7-JERN LAV FADE"><Tekstfelt value={f.slagNavn} onChange={(v) => opp({ slagNavn: v })} placeholder="7-jern lav fade" /></Gruppe>
    <Gruppe navn="Område">
      <div className="tp-rad">{(Object.keys(FAMILIER) as Familie[]).map((k) => <Valg key={k} valgt={fam === k} onClick={() => opp({ omraadeKode: FAMILIER[k][0], dimensjon: null })}>{k}</Valg>)}</div>
      {fam && FAMILIER[fam].length > 1 && <div className="tp-rad">{FAMILIER[fam].map((k) => <Valg key={k} valgt={f.omraadeKode === k} onClick={() => opp({ omraadeKode: k, dimensjon: null })}>{omraadeDef(k).label}</Valg>)}</div>}
    </Gruppe>
    {fullsving && <Gruppe navn="Læringssteg" hint="BARE FULLSVING · FORMELEN VISER STEGET SPILLEREN ER PÅ">
      <div className="tp-rad">{MOTORIKK_KODER.map((m) => <Valg key={m} valgt={f.motorikk === m} onClick={() => opp({ motorikk: f.motorikk === m ? null : m })}>{MOTORIKK_LABEL[m]}</Valg>)}</div>
    </Gruppe>}
    {bunker && <Gruppe navn="Sandtrinn" hint="UTEN BALL I SANDEN · MED BALL">
      <div className="tp-rad">{SAND_TRINN_KODER.map((s) => <Valg key={s} valgt={f.sandTrinn === s} onClick={() => opp({ sandTrinn: f.sandTrinn === s ? null : s })}>{SAND_TRINN_LABEL[s]}</Valg>)}</div>
    </Gruppe>}
    <Gruppe navn="Teknisk fokus" hint={f.omraadeKode ? "LISTEN FØLGER OMRÅDET · MAKS ETT" : "VELG OMRÅDE FØRST"}>
      {f.omraadeKode && <div className="tp-rad">{dimensjonerFor(f.omraadeKode).map((d) => <Valg key={d} valgt={f.dimensjon === d} onClick={() => opp({ dimensjon: f.dimensjon === d ? null : d })}>{DIMENSJON_LABEL[d]}</Valg>)}</div>}
    </Gruppe>
    <Gruppe navn="Kølle">
      <Nedtrekk value={f.kolle ?? ""} onChange={(v) => opp({ kolle: v || null })} options={[{ value: "", label: "—" }, ...KOLLER.map((k) => ({ value: k, label: k }))]} />
    </Gruppe>
    <Gruppe navn="Miljø og press" hint="HOVEDMILJØET STÅR I FORMELEN · REP-MÅL PER MILJØ SETTES UNDER">
      <div className="tp-rad">{BELASTNING_KODER.map((b) => <Valg key={b} valgt={f.belastning === b} onClick={() => opp({ belastning: f.belastning === b ? null : b })}>{BELASTNING_LABEL[b]}</Valg>)}</div>
      <div className="tp-rad">{PRESS_KODER.map((p) => <Valg key={p} valgt={f.press === p} onClick={() => opp({ press: f.press === p ? null : p })}>{PRESS_LABEL[p]}</Valg>)}</div>
    </Gruppe>
    <Gruppe navn="Måleutstyr">
      <div className="tp-rad">{MAALEUTSTYR_KODER.map((m) => <Valg key={m} valgt={f.maaleutstyr === m} onClick={() => opp({ maaleutstyr: f.maaleutstyr === m ? null : m })}>{MAALEUTSTYR_LABEL[m]}</Valg>)}</div>
    </Gruppe>
    {radar && <Gruppe navn="TrackMan-mål" hint="NEDRE OG ØVRE GRENSE · UTGANGSPUNKT HENTES FRA SISTE TRACKMAN-ØKT">
      {f.tm.map((r, i) => {
        const p = tmParameter(r.metric), steg = p.desimaler === 2 ? 0.01 : p.desimaler === 0 ? 50 : 0.5;
        const lagret = r.id ? base?.tm.find((x) => x.id === r.id && x.navn === p.navn) : undefined;
        return <div key={r.id ?? `ny-${i}`} style={{ display: "flex", flexDirection: "column", gap: 8, padding: 10, border: "1px solid var(--border-hairline)", borderRadius: "var(--radius)" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 160px", minWidth: 0 }}>
              <Nedtrekk value={r.metric} onChange={(v) => settTm(i, { metric: v })} options={TM_PARAMETRE.map((x) => ({ value: x.metric, label: x.navn }))} />
            </div>
            <Knapp size="sm" variant="ghost" icon={Trash2} iconName="trash-2" aria-label={`Fjern ${p.navn}`} onClick={() => opp({ tm: f.tm.filter((_, j) => j !== i) })}>Fjern</Knapp>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 8 }}>
            <Teller label="Nedre" verdi={r.fra} steg={steg} min={-10000} maks={r.til} format={(v) => desimal(v, p.desimaler)} onEndre={(v) => settTm(i, { fra: v })} />
            <Teller label="Øvre" verdi={r.til} steg={steg} min={r.fra} maks={10000} format={(v) => desimal(v, p.desimaler)} onEndre={(v) => settTm(i, { til: v })} />
          </div>
          <Meta>{lagret ? `UTGANGSPUNKT ${desimal(lagret.utgangspunkt, p.desimaler)} · ${lagret.utgangspunktDato}` : "UTGANGSPUNKT HENTES VED LAGRING · — UTEN TRACKMAN-ØKT"}</Meta>
        </div>;
      })}
      <div><Knapp size="sm" variant="secondary" icon={Plus} iconName="plus" disabled={f.tm.length >= 8}
        onClick={() => opp({ tm: [...f.tm, { id: null, metric: "club_path_mean", fra: -1, til: 1 }] })}>Legg til parameter</Knapp></div>
    </Gruppe>}
    <Gruppe navn="Rep-mål" hint={fullsving ? "PER LÆRINGSSTEG OG PER MILJØ · 0 = IKKE I PLANEN" : "ÉN REP-STREK · PER MILJØ · 0 = IKKE I PLANEN"}>
      {fullsving
        ? MOTORIKK_KODER.map((m) => <Teller key={m} label={MOTORIKK_LABEL[m]} verdi={f.repSteg[m]} steg={10} maks={10000} onEndre={(v) => opp({ repSteg: { ...f.repSteg, [m]: v } })} />)
        : <Teller label="Repetisjoner" verdi={f.rep} steg={10} maks={10000} onEndre={(v) => opp({ rep: v })} />}
      {BELASTNING_KODER.map((b) => <Teller key={b} label={BELASTNING_LABEL[b]} verdi={f.repMiljo[b] ?? 0} steg={10} maks={10000} onEndre={(v) => opp({ repMiljo: { ...f.repMiljo, [b]: v } })} />)}
      <Meta>SUM STEG {tall(sumSteg)} · SUM MILJØ {tall(sumMiljo)}{sumSteg !== sumMiljo ? " · ULIK SUM, LAGRES LIKEVEL" : " · LIK SUM"}</Meta>
    </Gruppe>
    <Gruppe navn="Treffprotokoll" hint="VISER STATUS · LÅSER IKKE NESTE STEG">
      <div className="tp-rad">
        <Valg valgt={!f.protokoll} onClick={() => opp({ protokoll: null })}>Ingen</Valg>
        {(Object.keys(PROTOKOLL_NAVN) as Protokolltype[]).map((k) => <Valg key={k} valgt={f.protokoll?.type === k}
          onClick={() => opp({ protokoll: { type: k, antall: f.protokoll?.antall ?? (k === "SESSION_GATE" ? 5 : 20), treff: f.protokoll?.treff ?? (k === "SESSION_GATE" ? 3 : 16) } })}>{PROTOKOLL_NAVN[k]}</Valg>)}
      </div>
      {f.protokoll && <>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 8 }}>
          {f.protokoll.type !== "STREAK" && <Teller label={f.protokoll.type === "SESSION_GATE" ? "Antall økter" : "Antall slag"} verdi={f.protokoll.antall} min={f.protokoll.treff} maks={100}
            onEndre={(v) => opp({ protokoll: { ...f.protokoll!, antall: v } })} />}
          <Teller label={f.protokoll.type === "SESSION_GATE" ? "Økter innenfor" : "Antall treff"} verdi={f.protokoll.treff} min={1} maks={f.protokoll.type === "STREAK" ? 100 : f.protokoll.antall}
            onEndre={(v) => opp({ protokoll: { ...f.protokoll!, treff: v } })} />
        </div>
        <p style={{ margin: 0, font: "500 14px/1.4 var(--font-sans)", color: "var(--text-primary)" }}>
          {protokollTekst(f.protokoll.type, f.protokoll.type === "STREAK" ? null : f.protokoll.antall, f.protokoll.treff)}
        </p>
        {radar && f.tm.length > 0 && <Meta>MÅLBOKSEN ER {tmParameter(f.tm[0].metric).navn.toUpperCase()}</Meta>}
      </>}
    </Gruppe>
  </>;

  const bunnlinje = <>
    <div aria-live="polite" style={{ font: "var(--type-meta)", letterSpacing: ".04em", color: "var(--text-secondary)", textTransform: "uppercase", minHeight: 16 }}>{statusTekst}</div>
    {feil && <p role="alert" className="a4-feil" style={{ margin: 0 }}>{feil}</p>}
    <Knapp fullWidth icon={Check} iconName="check" loading={st === "lagrer"} onClick={lagre}>Lagre oppgave</Knapp>
    {!planAktiv && <Knapp variant="secondary" fullWidth icon={Send} iconName="send" disabled={pending || !(st === "lagret" || st === "uendret")} onClick={publiser}>Publiser til spiller</Knapp>}
    {f.id && <Knapp variant="ghost" fullWidth icon={Trash2} iconName="trash-2" onClick={() => setSlett(true)}>Slett oppgave</Knapp>}
  </>;

  const tittel = skjema.id ? "Rediger oppgave" : "Ny oppgave";
  return <>
    <header className="pa-pagehead">
      <div className="pa-pagehead__row">
        <div className="pa-pagehead__text">
          <span className="kicker pa-pagehead__kicker">Teknisk plan · {spillerNavn} · {tittel}</span>
          <h1 className="pa-pagehead__title">{skjema.id ? skjema.tittel : "Ny oppgave"}</h1>
          <p className="pa-pagehead__sub">Skjemaet følger AK-formelen. Et ledd som ikke gjelder, utelates. Ingen regel sperrer neste steg.</p>
        </div>
        <div className="pa-pagehead__actions"><KnappLenke variant="secondary" icon={ArrowLeft} iconName="arrow-left" href={planHref}>Teknisk plan</KnappLenke></div>
      </div>
    </header>
    {!skjema.id && !base && <div className="pa-alert pa-alert--info"><span className="pa-alert__title">Ny oppgave</span><span>Velg posisjon og område, så fylles formelen ut.</span></div>}
    <div className="tp-flate">
      <div className="tp-skjemaflate">
        <div className="tp-forhand" style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
          <Meta>FORHÅNDSVISNING · SLIK SER {spillerNavn.toUpperCase()} OPPGAVEN</Meta>
          <OppgaveKort o={forhandsvisning(f, base)} aapen />
          <div className="tp-skjemaknapp"><Knapp variant="secondary" icon={Pencil} iconName="pencil" onClick={() => setArk(true)}>Åpne skjemaet</Knapp></div>
        </div>
        <aside className="tp-inspektor" aria-label="Oppgaveskjema">
          <div className="pa-sheet__head"><div className="pa-sheet__titles"><span className="kicker">Oppgaveskjema</span><span className="pa-sheet__title">{tittel}</span></div></div>
          <div className="pa-sheet__body">{skjemaInnhold}</div>
          <div className="pa-sheet__foot">{bunnlinje}</div>
        </aside>
      </div>
    </div>
    <div className="tp-skjemaark">
      <Ark open={ark} onClose={() => setArk(false)} kicker="Oppgaveskjema" title={tittel} footer={bunnlinje}>{skjemaInnhold}</Ark>
    </div>
    <Dialogboks open={slett} onClose={() => setSlett(false)} title="Slette oppgaven?"
      footer={<><Knapp variant="ghost" onClick={() => setSlett(false)}>Avbryt</Knapp><Knapp variant="secondary" icon={Trash2} iconName="trash-2" loading={pending} loadingText="Sletter …" onClick={slettNaa}>Slett oppgave</Knapp></>}>
      <p style={{ margin: 0 }}>Oppgaven og alle registreringene på den forsvinner fra planen. Det kan ikke angres.</p>
    </Dialogboks>
  </>;
}
