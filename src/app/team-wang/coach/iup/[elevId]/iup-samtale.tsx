"use client";

/**
 * IUP-samtalen — tre steg i én skjerm.
 *
 * Samtalen skjedde før i et dokument ved siden av produktet: fokusområdene som
 * ble avtalt havnet aldri i årsplanen eleven ser, og evalueringen av forrige
 * periode fantes bare som notat hos treneren.
 *
 * Skjermen er delt mellom elev og trener i samme rom — derfor står
 * egenvurdering og trenervurdering ved siden av hverandre, ikke i hver sin
 * visning. Én primær handling: «Lagre og del med eleven».
 */

import { useRef, useState, useTransition, type ReactNode } from "react";
import { Plus, Trash2 } from "lucide-react";
import { wangHref } from "@/components/wang/wang-felles";
import { WangElevTopp } from "@/components/wang/WangElevTopp";

import {
  AKSE_REKKEFOLGE,
  STATUS_TEKST,
  formaterEgentid,
  type AkAkse,
  type MaalStatus,
} from "../../../_components/ak-primitiver";
import { lagreIupSamtale } from "./actions";

export interface IupPeriode {
  id: string;
  navn: string;
  startIso: string;
  sluttIso: string;
  fokus: string | null;
}

export interface IupMaaling {
  id: string;
  navn: string;
  akse: AkAkse;
  /**
   * Ferdig formatert måling med enhet («3,80 %», «7 OK av 10»). Var tidligere
   * et rått tall, som ble rendret som «0.038» — med punktum, og uten at noen
   * kunne se at det egentlig betød 3,8 %.
   */
  verdi: string;
  datoIso: string;
}

interface EvalRad {
  id: string;
  akse: AkAkse;
  tittel: string;
  egentidMinUke: number;
  maalemetode: string | null;
  status: MaalStatus;
  egenvurdering: number | null;
  trenervurdering: number | null;
  kommentar: string | null;
}

interface NyRad {
  akse: AkAkse;
  tittel: string;
  egentidMinUke: number;
  maalemetode: string | null;
}

const STEG = ["Evaluer perioden", "Målt i perioden", "Neste periode"];
const STATUSER: MaalStatus[] = ["IKKE_STARTET", "PAA_VEI", "NAADD"];

function kortDato(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  const mnd = [
    "jan",
    "feb",
    "mar",
    "apr",
    "mai",
    "jun",
    "jul",
    "aug",
    "sep",
    "okt",
    "nov",
    "des",
  ];
  return `${d}. ${mnd[m - 1]}`;
}

export function IupSamtale({
  elevId,
  elevNavn,
  avsluttende,
  neste,
  evalueringer: startEval,
  nyeStart,
  maalinger,
  sideinnhold,
}: {
  elevId: string;
  elevNavn: string;
  avsluttende: IupPeriode | null;
  neste: IupPeriode | null;
  evalueringer: EvalRad[];
  nyeStart: NyRad[];
  maalinger: IupMaaling[];
  /** Leverte IUP-svar og trenerforslaget, i høyre kolonne under målingene (canvas rad 10). */
  sideinnhold?: ReactNode;
}) {
  const [rader, setRader] = useState<EvalRad[]>(startEval);
  const [nye, setNye] = useState<NyRad[]>(nyeStart);
  const [melding, setMelding] = useState<string | null>(null);
  const [feil, setFeil] = useState<string | null>(null);
  const [lagrer, start] = useTransition();
  const requestId = useRef(crypto.randomUUID());

  const fornavn = elevNavn.split(" ")[0];
  const sumEgentid = nye.reduce((s, n) => s + n.egentidMinUke, 0);

  const settEval = (id: string, endring: Partial<EvalRad>) =>
    setRader((r) => r.map((x) => (x.id === id ? { ...x, ...endring } : x)));

  const lagre = () => {
    setMelding(null);
    setFeil(null);
    if (!neste) {
      setFeil("Fant ingen neste periode å avtale fokusområder for.");
      return;
    }
    if (nye.some((n) => !n.tittel.trim())) {
      setFeil("Alle fokusområder må ha en tittel.");
      return;
    }
    start(async () => {
      const svar = await lagreIupSamtale({
        elevId,
        evalueringer: rader.map((r) => ({
          id: r.id,
          egenvurdering: r.egenvurdering,
          trenervurdering: r.trenervurdering,
          status: r.status,
          kommentar: r.kommentar,
        })),
        nestePeriodeId: neste.id,
        nestePeriodeNavn: neste.navn,
        requestId: requestId.current,
        nyeFokus: nye.map((n) => ({
          akse: n.akse,
          tittel: n.tittel.trim(),
          egentidMinUke: n.egentidMinUke,
          maalemetode: n.maalemetode?.trim() || null,
        })),
      });
      if (svar.ok) {
        setMelding(`Vurderingen er lagret. Fokusområdene ligger som forslag i ${fornavn}s Workbench og endrer ikke årsplanen før godkjenning.`);
        requestId.current = crypto.randomUUID();
      }
      else setFeil(svar.feil);
    });
  };

  const akseKlasse = (a: AkAkse) => `wg-akse wg-akse-${a.toLowerCase()}`;

  return (
    <div className="wg-iup">
      <WangElevTopp
        tilbake={{ href: wangHref("elever", "elev", elevId), tekst: elevNavn }}
        navn={elevNavn}
        overtittel={`IUP-samtale · ${elevNavn}`}
        tittel={`${avsluttende?.navn ?? "Ingen periode"} → ${neste?.navn ?? "ingen neste periode"}`}
        undertekst={
          avsluttende
            ? `Perioden ${kortDato(avsluttende.startIso)}–${kortDato(avsluttende.sluttIso)} evalueres.${neste ? ` Neste periode starter ${kortDato(neste.startIso)}.` : ""}`
            : undefined
        }
        tall={[]}
      />
      <ol className="wg-iup-steg" aria-label="Tre steg">
        {STEG.map((s, i) => (
          <li key={s}><b>{i + 1}</b>{s}</li>
        ))}
      </ol>

      <div className="wg-iup-grid">
        <div className="wg-iup-kol">
          {/* Steg 1: evaluering */}
          <section className="wg-seksjon wg-iup-r1" aria-label="Steg 1, evaluer perioden">
            <div className="wg-sek-topp">
              <h2>1 · Evaluer {avsluttende?.navn.toLowerCase() ?? "perioden"}</h2>
              <span className="wg-kilde">{rader.length} {rader.length === 1 ? "målsetning" : "målsetninger"}</span>
            </div>
            {rader.length === 0 ? (
              <div className="wg-kort wg-iup-tom"><p className="wg-forklar">Ingen fokusområder å evaluere i denne perioden. Avtal de første i steg 3.</p></div>
            ) : (
              rader.map((r) => (
                <article key={r.id} className="wg-kort wg-iup-maal" style={{ borderTopColor: `var(--wg-${r.akse.toLowerCase()})` }}>
                  <div className="wg-iup-maal-topp">
                    <span className={akseKlasse(r.akse)}>{r.akse}</span>
                    <span className="wg-iup-maal-tekst">
                      <b>{r.tittel}</b>
                      <span className="wg-kilde">
                        {[`Egentid ${formaterEgentid(r.egentidMinUke)}/uke`, r.maalemetode ? `måles med ${r.maalemetode}` : null].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                  </div>
                  <div className="wg-iup-skalaer">
                    <Skala label="Eleven" verdi={r.egenvurdering} onVelg={(v) => settEval(r.id, { egenvurdering: v })} />
                    <Skala label="Din vurdering" verdi={r.trenervurdering} onVelg={(v) => settEval(r.id, { trenervurdering: v })} />
                  </div>
                  <div className="wg-iup-felt">
                    <span className="wg-iup-etikett">Status</span>
                    <span role="group" aria-label={`Status for ${r.tittel}`} className="wg-iup-valg">
                      {STATUSER.map((st) => (
                        <button
                          key={st}
                          type="button"
                          aria-pressed={r.status === st}
                          onClick={() => settEval(r.id, { status: st })}
                          className="wg-iup-valgknapp"
                        >
                          {STATUS_TEKST[st]}
                        </button>
                      ))}
                    </span>
                  </div>
                  <label className="wg-iup-felt">
                    <span className="wg-iup-etikett">Kommentar til eleven</span>
                    <textarea
                      rows={2}
                      maxLength={2000}
                      value={r.kommentar ?? ""}
                      onChange={(e) => settEval(r.id, { kommentar: e.target.value || null })}
                      placeholder="Hva gikk bra, og hva tar dere med videre?"
                      className="wg-iup-input"
                    />
                  </label>
                </article>
              ))
            )}
          </section>

          {/* Steg 3: nye fokusområder + den ene primære handlingen */}
          <section className="wg-seksjon wg-iup-r3" aria-label="Steg 3, neste periode">
            <div className="wg-sek-topp">
              <h2>3 · {neste?.navn ?? "Neste periode"}, fokus</h2>
              <span className="wg-kilde">{formaterEgentid(sumEgentid)} egentid/uke</span>
            </div>
            {nye.map((n, i) => (
              <div key={i} className="wg-kort wg-iup-ny" style={{ borderTopColor: `var(--wg-${n.akse.toLowerCase()})` }}>
                <label className="wg-iup-felt">
                  <span className="wg-iup-etikett">Akse</span>
                  <select
                    value={n.akse}
                    onChange={(e) => setNye((v) => v.map((x, j) => (j === i ? { ...x, akse: e.target.value as AkAkse } : x)))}
                    aria-label="Pyramideakse"
                    className="wg-iup-input"
                  >
                    {AKSE_REKKEFOLGE.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </label>
                <label className="wg-iup-felt wg-iup-bred">
                  <span className="wg-iup-etikett">Fokusområde</span>
                  <input
                    value={n.tittel}
                    onChange={(e) => setNye((v) => v.map((x, j) => (j === i ? { ...x, tittel: e.target.value } : x)))}
                    placeholder="Hva skal eleven jobbe med?"
                    aria-label="Fokusområde"
                    className="wg-iup-input"
                  />
                </label>
                <label className="wg-iup-felt">
                  <span className="wg-iup-etikett">Egentid</span>
                  <select
                    value={n.egentidMinUke}
                    onChange={(e) => setNye((v) => v.map((x, j) => (j === i ? { ...x, egentidMinUke: Number(e.target.value) } : x)))}
                    className="wg-iup-input"
                  >
                    {[30, 60, 90, 120, 150, 180, 240].map((m) => <option key={m} value={m}>{formaterEgentid(m)}/uke</option>)}
                  </select>
                </label>
                <label className="wg-iup-felt wg-iup-bred">
                  <span className="wg-iup-etikett">Måles med</span>
                  <input
                    value={n.maalemetode ?? ""}
                    onChange={(e) => setNye((v) => v.map((x, j) => (j === i ? { ...x, maalemetode: e.target.value } : x)))}
                    placeholder="Hvordan måles det?"
                    aria-label="Målemetode"
                    className="wg-iup-input"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setNye((v) => v.filter((_, j) => j !== i))}
                  aria-label="Fjern fokusområde"
                  className="wg-iup-fjern"
                >
                  <Trash2 size={18} strokeWidth={1.8} aria-hidden />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setNye((v) => [...v, { akse: "TEK", tittel: "", egentidMinUke: 120, maalemetode: null }])}
              className="wg-btn wg-btn-secondary wg-iup-legg-til"
            >
              <Plus size={16} strokeWidth={2.2} aria-hidden /> Legg til fokusområde
            </button>
            <div className="wg-iup-lagre">
              <button
                type="button"
                onClick={lagre}
                disabled={lagrer || !neste}
                className="wg-btn wg-btn-primary"
              >
                {lagrer ? "Lagrer …" : `Lagre og del med ${fornavn}`}
              </button>
              <span className="wg-kilde">Spilleren får se før og etter i PlayerHQ og velger selv om forslaget skal inn i årsplanen.</span>
            </div>
            {melding ? <p role="status" className="wg-iup-kvittering">{melding}</p> : null}
            {feil ? <p role="alert" className="wg-iup-feil">{feil}</p> : null}
          </section>
        </div>

        <div className="wg-iup-kol">
          {/* Steg 2: målte tall */}
          <section className="wg-seksjon wg-iup-r2" aria-label="Steg 2, målt i perioden">
            <div className="wg-sek-topp"><h2>2 · Målt i perioden</h2><span className="wg-kilde">Ekte testresultater</span></div>
            {maalinger.length === 0 ? (
              <div className="wg-kort wg-iup-tom">
                <p className="wg-forklar">Ingen testresultater registrert i denne perioden. Vurderingen hviler da på observasjon alene. Noter gjerne hvorfor.</p>
              </div>
            ) : (
              <div className="wg-kort">
                {maalinger.map((m) => (
                  <div key={m.id} className="wg-iup-maaling">
                    <span className={akseKlasse(m.akse)}>{m.akse}</span>
                    <span className="wg-iup-maal-tekst"><b>{m.navn}</b><span className="wg-kilde">{kortDato(m.datoIso)}</span></span>
                    <b className="wg-iup-verdi">{m.verdi}</b>
                  </div>
                ))}
              </div>
            )}
            {avsluttende ? <span className="wg-kilde">Bare tester tatt mellom {kortDato(avsluttende.startIso)} og {kortDato(avsluttende.sluttIso)}.</span> : null}
          </section>
          <div className="wg-iup-r4">{sideinnhold}</div>
        </div>
      </div>
    </div>
  );
}

// ---- Deler -------------------------------------------------------------

/** 1–5 som firkantede knapper på 44 px. Trykk på valgt verdi igjen nullstiller den. */
function Skala({ label, verdi, onVelg }: { label: string; verdi: number | null; onVelg: (v: number | null) => void }) {
  return (
    <span className="wg-iup-felt">
      <span className="wg-iup-etikett">{label}</span>
      <span role="group" aria-label={label} className="wg-iup-skala">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => onVelg(verdi === i ? null : i)}
            aria-label={`${label} ${i} av 5`}
            aria-pressed={verdi === i}
          >
            {i}
          </button>
        ))}
      </span>
    </span>
  );
}
