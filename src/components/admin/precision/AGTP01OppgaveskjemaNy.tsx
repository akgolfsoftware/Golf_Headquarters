"use client";

/**
 * AG-TP-01 Oppgaveskjema i nytt design (pakke 6).
 * Fasit: docs/design-system/utkast-agencyos/teknisk.html, skjerm «AG-TP-01 Oppgaveskjema».
 * Stil: src/styles/agencyos-ny-teknisk.css. Lagring som før (lagreOppgave, slettOppgave, publiserTekniskPlan).
 *
 * Avvik:
 *   - Ett læringssteg (steget spilleren er på) i stedet for flere valgte steg; rep-mål settes per steg
 *     (Uten ball · Lav hastighet · Automatikk) og per miljø (0 = ikke i planen).
 *   - «Publiser til spiller» publiserer hele planen (TechnicalPlan.status). Publisering per oppgave
 *     og publiseringsdato finnes ikke i basen.
 *   - «Lagret 08:41» vises etter lagring; før første lagring står «Ikke lagret». Autolagring finnes ikke.
 *   - Forhåndsvisningen viser formel, posisjon og valgene i ord; selve oppgavekortet spilleren ser
 *     vises i teknisk plan etter lagring.
 *   - «Slett oppgave» er beholdt fra dagens coachside, bak bekreftelse.
 */
import Link from "next/link";
import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { lagreOppgave, slettOppgave } from "@/app/admin/spillere/[id]/plan/[planId]/oppgave-actions";
import { publiserTekniskPlan } from "@/app/admin/spillere/[id]/plan/[planId]/plan-actions";
import {
  PROTOKOLL_NAVN, RADAR_UTSTYR, TM_PARAMETRE, TP_POSISJONER, formelFor, protokollTekst, tmParameter,
  type Protokolltype, type TpOppgave, type TpSkjema,
} from "@/lib/teknisk-plan/tp-visning";
import {
  BELASTNING_KODER, BELASTNING_LABEL, DIMENSJON_LABEL, MAALEUTSTYR_KODER, MAALEUTSTYR_LABEL, MOTORIKK_KODER,
  MOTORIKK_LABEL, OMRAADER, PRESS_KODER, PRESS_LABEL, omraadeDef, type OmraadeKode,
} from "@/lib/domain/ak-formel-v2";
import { dimensjonerFor } from "@/lib/domain/omrade-relevans";
import { KOLLER, pNavn } from "@/components/teknisk-plan/constants";
import "@/styles/agencyos-ny-teknisk.css";

type Familie = "Fullsving" | "Nærspill" | "Bunker" | "Putting";
const FAMILIER: Record<Familie, OmraadeKode[]> = {
  Fullsving: OMRAADER.filter((o) => o.familie === "FULLSVING").map((o) => o.kode),
  "Nærspill": ["CHIP", "PITCH", "LOB"],
  Bunker: ["BUNKER"],
  Putting: OMRAADER.filter((o) => o.familie === "PUTT").map((o) => o.kode),
};
const familieAv = (k: OmraadeKode | null): Familie | null => (k ? ((Object.keys(FAMILIER) as Familie[]).find((f) => FAMILIER[f].includes(k)) ?? null) : null);
type Status = "ny" | "uendret" | "endret" | "lagrer" | "lagret" | "publisert";

export type AGTP01NyProps = {
  planId: string;
  spillerId: string;
  spillerNavn: string;
  planAktiv: boolean;
  skjema: TpSkjema;
  base: TpOppgave | null;
};

function Teller({ label, verdi, onEndre, min = 0, maks = 10000, steg = 10 }: { label: string; verdi: number; onEndre: (v: number) => void; min?: number; maks?: number; steg?: number }) {
  const sett = (v: number) => onEndre(Math.max(min, Math.min(maks, Math.round(v * 100) / 100)));
  return <div className="teller-felt" role="group" aria-label={label}>
    <span>{label}</span>
    <button type="button" aria-label={`Mindre ${label}`} disabled={verdi <= min} onClick={() => sett(verdi - steg)}>−</button>
    <output aria-live="polite">{verdi}</output>
    <button type="button" aria-label={`Mer ${label}`} disabled={verdi >= maks} onClick={() => sett(verdi + steg)}>+</button>
  </div>;
}

function Gruppe({ navn, hint, children }: { navn: string; hint?: string; children: ReactNode }) {
  return <div className="felt"><span className="etikett">{navn}</span>{hint && <span className="hjelp">{hint}</span>}{children}</div>;
}

export function AGTP01OppgaveskjemaNy({ planId, spillerId, spillerNavn, planAktiv, skjema, base }: AGTP01NyProps) {
  const router = useRouter();
  const [f, setF] = useState<TpSkjema>(skjema);
  const [st, setSt] = useState<Status>(skjema.id ? "uendret" : "ny");
  const [lagretKl, setLagretKl] = useState<string | null>(null);
  const [feil, setFeil] = useState<string | null>(null);
  const [slett, setSlett] = useState(false);
  const [pending, start] = useTransition();
  const planHref = `/admin/spillere/${spillerId}/plan/${planId}`;
  const opp = (p: Partial<TpSkjema>) => { setF((o) => ({ ...o, ...p })); setSt("endret"); };
  const fam = familieAv(f.omraadeKode);
  const fullsving = fam === "Fullsving";
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
        setFeil(null); setSt("lagret");
        setLagretKl(new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", hour: "2-digit", minute: "2-digit" }).format(new Date()));
        if (!f.id) { setF((o) => ({ ...o, id: svar.taskId })); router.replace(`${planHref}?oppgave=${svar.taskId}`); }
        router.refresh();
      } catch (e) { setFeil(e instanceof Error ? e.message : "Oppgaven ble ikke lagret."); setSt("endret"); }
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

  const pub = planAktiv ? "planen er publisert" : "planen er ikke publisert";
  const statusTekst = { ny: "Ikke lagret", uendret: `Lagret · ${pub}`, endret: "Endret · ikke lagret", lagrer: "Lagrer …", lagret: `Lagret ${lagretKl ?? ""} · ${pub}`, publisert: `Lagret ${lagretKl ?? ""} · planen er publisert` }[st];
  const settTm = (i: number, p: Partial<TpSkjema["tm"][number]>) => opp({ tm: f.tm.map((r, j) => (j === i ? { ...r, ...p } : r)) });
  const tittel = skjema.id ? "Rediger oppgave" : "Ny oppgave";

  return <div className="agn-s">
    <div className="topp">
      <Link href={planHref} className="ag-tilbake"><ChevronLeft className="ikon" aria-hidden />Teknisk plan</Link>
      <div className="topp-rad">
        <div><div className="dato">{spillerNavn} · {f.pNummer ? `${f.pNummer} ${pNavn(f.pNummer)}` : "velg posisjon"}</div><h1 className="tittel">{tittel}</h1></div>
        <span className="lagret" aria-live="polite">{statusTekst}</span>
      </div>
    </div>
    <div className="formel"><span>AK-formel v2</span><code>{formel ?? "—"}</code></div>
    {!skjema.id && !base && <div className="varsel"><b className="undertittel">Ny oppgave</b><p className="forklar">Velg posisjon og område, så fylles formelen ut.</p></div>}
    {feil && <div className="varsel advarsel" role="alert"><p className="forklar">{feil}</p></div>}

    <div className="to-del bred-v">
      <div className="skjema">
        <Gruppe navn="Posisjon">
          <div className="chips" role="group" aria-label="Posisjon">{TP_POSISJONER.map((p) => <button key={p.pNummer} type="button" aria-pressed={f.pNummer === p.pNummer} onClick={() => opp({ pNummer: p.pNummer })}>{p.pNummer}</button>)}</div>
          <span className="hjelp">{f.pNummer ? `${f.pNummer} · ${pNavn(f.pNummer)}` : "Ikke valgt"}</span>
        </Gruppe>
        <div className="to-felt">
          <label className="felt">Tittel<input value={f.tittel} onChange={(e) => opp({ tittel: e.target.value })} placeholder="Hendene foran ballen i treff" /></label>
          <label className="felt">Slag<input value={f.slagNavn} onChange={(e) => opp({ slagNavn: e.target.value })} placeholder="7-jern lav fade" /></label>
        </div>
        <Gruppe navn="Område">
          <div className="chips" role="group" aria-label="Områdetype">{(Object.keys(FAMILIER) as Familie[]).map((k) => <button key={k} type="button" aria-pressed={fam === k} onClick={() => opp({ omraadeKode: FAMILIER[k][0], dimensjon: null })}>{k}</button>)}</div>
          {fam && FAMILIER[fam].length > 1 && <div className="chips" role="group" aria-label="Område">{FAMILIER[fam].map((k) => <button key={k} type="button" aria-pressed={f.omraadeKode === k} onClick={() => opp({ omraadeKode: k, dimensjon: null })}>{omraadeDef(k).label}</button>)}</div>}
        </Gruppe>
        {fullsving && <Gruppe navn="Læringssteg" hint="Bare fullsving. Formelen viser steget spilleren er på.">
          <div className="chips" role="group" aria-label="Læringssteg">{MOTORIKK_KODER.map((m) => <button key={m} type="button" aria-pressed={f.motorikk === m} onClick={() => opp({ motorikk: f.motorikk === m ? null : m })}>{MOTORIKK_LABEL[m]}</button>)}</div>
        </Gruppe>}
        <Gruppe navn="Teknisk fokus" hint={f.omraadeKode ? "Listen følger området. Maks ett." : "Velg område først."}>
          {f.omraadeKode && <div className="chips" role="group" aria-label="Teknisk fokus">{dimensjonerFor(f.omraadeKode).map((d) => <button key={d} type="button" aria-pressed={f.dimensjon === d} onClick={() => opp({ dimensjon: f.dimensjon === d ? null : d })}>{DIMENSJON_LABEL[d]}</button>)}</div>}
        </Gruppe>
        <label className="felt">Kølle
          <select value={f.kolle ?? ""} onChange={(e) => opp({ kolle: e.target.value || null })}><option value="">—</option>{KOLLER.map((k) => <option key={k} value={k}>{k}</option>)}</select>
        </label>
        <Gruppe navn="Treningsmiljø" hint="Hovedmiljøet står i formelen. Rep-mål per miljø settes under.">
          <div className="chips" role="group" aria-label="Treningsmiljø">{BELASTNING_KODER.map((b) => <button key={b} type="button" aria-pressed={f.belastning === b} onClick={() => opp({ belastning: f.belastning === b ? null : b })}>{BELASTNING_LABEL[b]}</button>)}</div>
        </Gruppe>
        <Gruppe navn="Press"><div className="chips" role="group" aria-label="Press">{PRESS_KODER.map((p) => <button key={p} type="button" aria-pressed={f.press === p} onClick={() => opp({ press: f.press === p ? null : p })}>{PRESS_LABEL[p]}</button>)}</div></Gruppe>
        <Gruppe navn="Måleutstyr"><div className="chips" role="group" aria-label="Måleutstyr">{MAALEUTSTYR_KODER.map((m) => <button key={m} type="button" aria-pressed={f.maaleutstyr === m} onClick={() => opp({ maaleutstyr: f.maaleutstyr === m ? null : m })}>{MAALEUTSTYR_LABEL[m]}</button>)}</div></Gruppe>
        {radar && <Gruppe navn="TrackMan-mål" hint="Nedre og øvre grense. Utgangspunkt hentes fra siste TrackMan-økt.">
          {f.tm.map((r, i) => {
            const p = tmParameter(r.metric), steg = p.desimaler === 2 ? 0.01 : p.desimaler === 0 ? 50 : 0.5;
            return <div key={r.id ?? `ny-${i}`} className="tm-skjema">
              <div className="to-felt">
                <label className="felt">Parameter<select value={r.metric} onChange={(e) => settTm(i, { metric: e.target.value })}>{TM_PARAMETRE.map((x) => <option key={x.metric} value={x.metric}>{x.navn}</option>)}</select></label>
                <div className="knapper" style={{ alignItems: "end" }}><button type="button" className="knapp spok" onClick={() => opp({ tm: f.tm.filter((_, j) => j !== i) })}>Fjern</button></div>
              </div>
              <Teller label="Nedre" verdi={r.fra} steg={steg} min={-10000} maks={r.til} onEndre={(v) => settTm(i, { fra: v })} />
              <Teller label="Øvre" verdi={r.til} steg={steg} min={r.fra} maks={10000} onEndre={(v) => settTm(i, { til: v })} />
            </div>;
          })}
          <div><button type="button" className="knapp sek" disabled={f.tm.length >= 8} onClick={() => opp({ tm: [...f.tm, { id: null, metric: "club_path_mean", fra: -1, til: 1 }] })}>Legg til parameter</button></div>
        </Gruppe>}
        <Gruppe navn="Rep-mål" hint={fullsving ? "Per læringssteg og per miljø. 0 = ikke i planen." : "Én rep-strek og per miljø. 0 = ikke i planen."}>
          {fullsving ? MOTORIKK_KODER.map((m) => <Teller key={m} label={MOTORIKK_LABEL[m]} verdi={f.repSteg[m]} onEndre={(v) => opp({ repSteg: { ...f.repSteg, [m]: v } })} />) : <Teller label="Repetisjoner" verdi={f.rep} onEndre={(v) => opp({ rep: v })} />}
          {BELASTNING_KODER.map((b) => <Teller key={b} label={BELASTNING_LABEL[b]} verdi={f.repMiljo[b] ?? 0} onEndre={(v) => opp({ repMiljo: { ...f.repMiljo, [b]: v } })} />)}
          <span className="hjelp">Sum steg {sumSteg} · sum miljø {sumMiljo}{sumSteg !== sumMiljo ? " · ulik sum, lagres likevel" : " · lik sum"}</span>
        </Gruppe>
        <Gruppe navn="Treffprotokoll" hint="Viser status. Låser ikke neste steg.">
          <div className="chips" role="group" aria-label="Treffprotokoll">
            <button type="button" aria-pressed={!f.protokoll} onClick={() => opp({ protokoll: null })}>Ingen</button>
            {(Object.keys(PROTOKOLL_NAVN) as Protokolltype[]).map((k) => <button key={k} type="button" aria-pressed={f.protokoll?.type === k}
              onClick={() => opp({ protokoll: { type: k, antall: f.protokoll?.antall ?? (k === "SESSION_GATE" ? 5 : 20), treff: f.protokoll?.treff ?? (k === "SESSION_GATE" ? 3 : 16) } })}>{PROTOKOLL_NAVN[k]}</button>)}
          </div>
          {f.protokoll && <>
            {f.protokoll.type !== "STREAK" && <Teller label={f.protokoll.type === "SESSION_GATE" ? "Antall økter" : "Antall slag"} verdi={f.protokoll.antall} min={f.protokoll.treff} maks={100} steg={1} onEndre={(v) => opp({ protokoll: { ...f.protokoll!, antall: v } })} />}
            <Teller label={f.protokoll.type === "SESSION_GATE" ? "Økter innenfor" : "Antall treff"} verdi={f.protokoll.treff} min={1} maks={f.protokoll.type === "STREAK" ? 100 : f.protokoll.antall} steg={1} onEndre={(v) => opp({ protokoll: { ...f.protokoll!, treff: v } })} />
            <p className="forklar">{protokollTekst(f.protokoll.type, f.protokoll.type === "STREAK" ? null : f.protokoll.antall, f.protokoll.treff)}</p>
          </>}
        </Gruppe>
        <div className="knapper">
          <button type="button" className="knapp pri" disabled={pending} onClick={lagre}>{st === "lagrer" ? "Lagrer …" : "Lagre oppgave"}</button>
          {!planAktiv && <button type="button" className="knapp sek" disabled={pending || !(st === "lagret" || st === "uendret")} onClick={publiser}>Publiser til {spillerNavn.split(" ")[0]}</button>}
          {f.id && <button type="button" className="knapp spok" disabled={pending} onClick={() => setSlett(true)}>Slett oppgave</button>}
        </div>
      </div>
      <aside className="inspektor" aria-label="Slik ser spilleren oppgaven">
        <b className="undertittel">Slik ser {spillerNavn.split(" ")[0]} oppgaven</b>
        <div className="oppg" style={{ gap: 6 }}>
          <span className="akse-merke" style={{ justifySelf: "start" }}><i aria-hidden />TEK</span>
          <b className="n" style={{ fontSize: 16 }}>{f.pNummer ? `${f.pNummer} ${pNavn(f.pNummer)}` : "Velg posisjon"}</b>
          <span className="meta">{f.tittel.trim() || "Uten tittel"}</span>
          <span className="meta">{[f.omraadeKode ? omraadeDef(f.omraadeKode).label : null, f.motorikk ? MOTORIKK_LABEL[f.motorikk] : null, f.belastning ? BELASTNING_LABEL[f.belastning] : null, f.press ? PRESS_LABEL[f.press] : null].filter(Boolean).join(" · ") || "—"}</span>
          <span className="meta">Rep-mål {sumSteg || "—"}{f.dimensjon ? ` · fokus ${DIMENSJON_LABEL[f.dimensjon]}` : ""}</span>
        </div>
        <p className="kilde">Kvalitetssjekken vises bare. Den sperrer ikke neste steg.</p>
      </aside>
    </div>

    {slett && <div className="dialog-lag" role="presentation" onClick={(e) => { if (e.target === e.currentTarget && !pending) setSlett(false); }}>
      <div className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="slett-tittel">
        <h2 id="slett-tittel">Slette oppgaven?</h2>
        <p className="forklar">Oppgaven og alle registreringene på den forsvinner fra planen. Det kan ikke angres.</p>
        <div className="knapper"><button type="button" className="knapp rust stor" disabled={pending} onClick={slettNaa}>{pending ? "Sletter …" : "Slett oppgave"}</button><button type="button" className="knapp sek stor" disabled={pending} onClick={() => setSlett(false)}>Avbryt</button></div>
      </div>
    </div>}
  </div>;
}
