"use client";

import { useEffect, useRef, useState } from "react";

import {
  DIMENSJON_LABEL,
  hastighetForMotorikk,
  MOTORIKK_KODER,
  MOTORIKK_LABEL,
  PRESS_KODER,
  PRESS_LABEL,
  SAND_TRINN_KODER,
  SAND_TRINN_LABEL,
  type MotorikkKode,
} from "@/lib/domain/ak-formel-v2";
import { AREA_LABEL, PYRAMID_LABEL, UI } from "@/lib/domain/workbench/labels";
import {
  feltForOvelse,
  MAALEUTSTYR,
  MAALEUTSTYR_LABEL,
  MENGDE_ENHET_LABEL,
  STED_DELVALG,
  STED_HOVED_LABEL,
  stedRekkefolge,
  TRENINGSMAATE,
  TRENINGSMAATE_LABEL,
  type StedHoved,
} from "@/lib/domain/workbench/ovelse-detaljer";
import { byggOvelse, tommeUtkast, type GrenUtkast, type OvelseInput } from "@/lib/domain/workbench/ovelse-utkast";
import type { PyramidArea, TrainingArea } from "@/lib/domain/workbench/types";

const PYRAMIDER: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];

type Props = {
  /** Pyramiden økten har; brukes som første valg. */
  standardPyramide: PyramidArea;
  disabled: boolean;
  /** Kalles med øvelsen. `ferdig` tømmer skjemaet og skal kalles først når lagringen har lyktes. */
  onSubmit: (ovelse: OvelseInput, ferdig: () => void) => void;
  /** «panel» er utfellbar seksjon i inspektøren (desktop). «ark» er bunnark på mobil. */
  modus?: "panel" | "ark";
  /** Kun for «ark»: om arket er åpent. Utkastet beholdes når det lukkes. */
  apen?: boolean;
  onLukk?: () => void;
};

/**
 * Øvelsesskjemaet i åtte trinn (masteren kap. 9–17). Området styrer hvilke felt som
 * vises, og pyramiden filtrerer bort felt som ikke hører hjemme i grenen. Hver gren har
 * sitt eget utkast, så et valg i én gren aldri overskriver en annen.
 */
export function OvelseSkjema({ standardPyramide, disabled, onSubmit, modus = "panel", apen = false, onLukk }: Props) {
  const [pyramide, setPyramide] = useState<PyramidArea>(standardPyramide);
  const [utkast, setUtkast] = useState(tommeUtkast);
  const [title, setTitle] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [description, setDescription] = useState("");
  const [feil, setFeil] = useState<string | null>(null);

  const u = utkast[pyramide];
  const felt = feltForOvelse(pyramide, u.area);
  const motorikk = MOTORIKK_KODER.includes(u.motorikk as MotorikkKode) ? (u.motorikk as MotorikkKode) : undefined;
  const hastigheter = motorikk ? hastighetForMotorikk(motorikk) : [];
  const delvalg = u.stedHoved ? STED_DELVALG[u.stedHoved as StedHoved] : [];
  const enhet = felt.mengde.enheter.includes(u.enhet as never) ? u.enhet : felt.mengde.enheter[0];

  function sett<K extends keyof GrenUtkast>(nokkel: K, verdi: GrenUtkast[K]) {
    setUtkast((forrige) => ({ ...forrige, [pyramide]: { ...forrige[pyramide], [nokkel]: verdi } }));
  }

  function send() {
    const res = byggOvelse(pyramide, u, { title, durationMinutes, description });
    if (!res.ok) {
      setFeil(res.feil);
      return;
    }
    setFeil(null);
    onSubmit(res.ovelse, () => {
      setTitle("");
      setDescription("");
      setUtkast(tommeUtkast());
    });
  }

  const arkRef = useRef<HTMLDivElement>(null);
  const ark = modus === "ark";
  const lukkRef = useRef(onLukk);
  useEffect(() => { lukkRef.current = onLukk; });
  useEffect(() => {
    if (!ark || !apen) return;
    arkRef.current?.focus();
    const tidligere = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const tast = (e: KeyboardEvent) => { if (e.key === "Escape") lukkRef.current?.(); };
    window.addEventListener("keydown", tast);
    return () => {
      document.body.style.overflow = tidligere;
      window.removeEventListener("keydown", tast);
    };
  }, [ark, apen]);

  const felter = (
    <>
      <label>{UI.drillTitle}<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={UI.drillTitlePlaceholder} /></label>

      <span className="wb-kicker">1 · Hensikt</span>
      <label>Pyramide
        <select value={pyramide} onChange={(e) => { setPyramide(e.target.value as PyramidArea); setFeil(null); }}>
          {PYRAMIDER.map((p) => <option key={p} value={p}>{PYRAMID_LABEL[p]}</option>)}
        </select>
      </label>

      <span className="wb-kicker">2 · Treningsområde</span>
      <div>
        <label>{UI.drillArea}
          <select value={u.area} onChange={(e) => sett("area", e.target.value as TrainingArea)}>
            {Object.entries(AREA_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
        <label>{UI.drillDuration}<input type="number" min={1} max={600} value={durationMinutes} onChange={(e) => setDurationMinutes(Number(e.target.value))} /></label>
      </div>

      <span className="wb-kicker">3 · Sted og treningsmiljø</span>
      <div>
        <label>Sted
          <select value={u.stedHoved} onChange={(e) => setUtkast((f) => ({ ...f, [pyramide]: { ...f[pyramide], stedHoved: e.target.value, stedDelvalg: "" } }))}>
            <option value="">Ikke valgt</option>
            {stedRekkefolge(pyramide).map((h) => <option key={h} value={h}>{STED_HOVED_LABEL[h]}</option>)}
          </select>
        </label>
        {delvalg.length > 0 ? (
          <label>Konkret sted
            <select value={u.stedDelvalg} onChange={(e) => sett("stedDelvalg", e.target.value)}>
              <option value="">Ikke valgt</option>
              {delvalg.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </label>
        ) : null}
      </div>

      {felt.maaleutstyr ? (
        <>
          <span className="wb-kicker">4 · Måleutstyr</span>
          <label>Hvordan måles øvelsen?
            <select value={u.maaleutstyr} onChange={(e) => sett("maaleutstyr", e.target.value)}>
              <option value="">Ikke valgt</option>
              {MAALEUTSTYR.map((m) => <option key={m} value={m}>{MAALEUTSTYR_LABEL[m]}</option>)}
            </select>
          </label>
        </>
      ) : null}

      {felt.laeringssteg || felt.tekniskFokus.length > 0 || felt.sandTrinn || felt.treningsmaate ? (
        <span className="wb-kicker">5 · Gjennomføring</span>
      ) : null}
      {felt.laeringssteg ? (
        <div>
          <label>{UI.formelMotorikk}
            <select value={u.motorikk} onChange={(e) => setUtkast((f) => ({ ...f, [pyramide]: { ...f[pyramide], motorikk: e.target.value, hastighet: "" } }))}>
              <option value="">Ikke valgt</option>
              {MOTORIKK_KODER.map((m) => <option key={m} value={m}>{MOTORIKK_LABEL[m]}</option>)}
            </select>
          </label>
          {hastigheter.length > 0 ? (
            <label>Hastighet
              <select value={u.hastighet} onChange={(e) => sett("hastighet", e.target.value)}>
                <option value="">Ikke valgt</option>
                {hastigheter.map((h) => <option key={h} value={String(h)}>{h} % av Club Speed</option>)}
              </select>
            </label>
          ) : null}
        </div>
      ) : null}
      {felt.tekniskFokus.length > 0 ? (
        <label>Teknisk fokus
          <select value={u.tekniskFokus} onChange={(e) => sett("tekniskFokus", e.target.value)}>
            <option value="">Ikke valgt</option>
            {felt.tekniskFokus.map((d) => <option key={d} value={d}>{DIMENSJON_LABEL[d]}</option>)}
          </select>
        </label>
      ) : null}
      {felt.sandTrinn ? (
        <label>Sandtrinn
          <select value={u.sandTrinn} onChange={(e) => sett("sandTrinn", e.target.value)}>
            <option value="">Ikke valgt</option>
            {SAND_TRINN_KODER.map((s) => <option key={s} value={s}>{SAND_TRINN_LABEL[s]}</option>)}
          </select>
        </label>
      ) : null}
      {felt.treningsmaate ? (
        <label>Treningsmåte
          <select value={u.treningsmaate} onChange={(e) => sett("treningsmaate", e.target.value)}>
            <option value="">Ikke valgt</option>
            {TRENINGSMAATE.map((t) => <option key={t} value={t}>{TRENINGSMAATE_LABEL[t]}</option>)}
          </select>
        </label>
      ) : null}

      {felt.press ? (
        <>
          <span className="wb-kicker">6 · {UI.formelPress}</span>
          <label>Hvem ser på?
            <select value={u.press} onChange={(e) => sett("press", e.target.value)}>
              <option value="">Ikke valgt</option>
              {PRESS_KODER.map((p) => <option key={p} value={p}>{PRESS_LABEL[p]}</option>)}
            </select>
          </label>
        </>
      ) : null}

      <span className="wb-kicker">7 · Mengde</span>
      <div>
        {felt.mengde.enheter.length > 1 ? (
          <label>Enhet
            <select value={enhet} onChange={(e) => sett("enhet", e.target.value)}>
              {felt.mengde.enheter.map((m) => <option key={m} value={m}>{MENGDE_ENHET_LABEL[m]}</option>)}
            </select>
          </label>
        ) : null}
        <label>{MENGDE_ENHET_LABEL[(enhet as keyof typeof MENGDE_ENHET_LABEL)] ?? "Antall"}
          <input type="number" min={0} inputMode="numeric" value={u.antall} onChange={(e) => sett("antall", e.target.value)} />
        </label>
      </div>
      {felt.mengde.reps || felt.mengde.vekt || felt.mengde.rir || felt.mengde.pause ? (
        <div>
          {felt.mengde.reps ? <label>Repetisjoner<input type="number" min={0} inputMode="numeric" value={u.reps} onChange={(e) => sett("reps", e.target.value)} /></label> : null}
          {felt.mengde.vekt ? <label>Belastning (kg)<input type="number" min={0} inputMode="decimal" value={u.vektKg} onChange={(e) => sett("vektKg", e.target.value)} /></label> : null}
          {felt.mengde.rir ? <label>RIR<input type="number" min={0} max={10} inputMode="numeric" value={u.rir} onChange={(e) => sett("rir", e.target.value)} /></label> : null}
          {felt.mengde.pause ? <label>Pause (sek)<input type="number" min={0} inputMode="numeric" value={u.pauseSek} onChange={(e) => sett("pauseSek", e.target.value)} /></label> : null}
        </div>
      ) : null}

      <span className="wb-kicker">8 · Mål</span>
      <label>{UI.formelMal}<input value={u.malsetning} onChange={(e) => sett("malsetning", e.target.value)} placeholder="Hva øvelsen skal flytte" /></label>
      <label>Målemetode<input value={u.malemetode} onChange={(e) => sett("malemetode", e.target.value)} placeholder="For eksempel TrackMan: Launch Direction" /></label>
      <label>Resultatkrav<input value={u.resultatkrav} onChange={(e) => sett("resultatkrav", e.target.value)} placeholder="For eksempel 20 av 30 innenfor målområdet" /></label>
      <label>Notat<input value={u.notat} onChange={(e) => sett("notat", e.target.value)} /></label>
      <label>{UI.formelMate}<input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Hvordan øvelsen gjennomføres" /></label>

      {feil ? <p role="alert" className="wb-ovelse-feil">{feil}</p> : null}
      {ark ? null : <button type="button" className="wb-quiet" disabled={disabled || !title.trim()} onClick={send}>{UI.addDrill}</button>}
    </>
  );

  if (!ark) {
    return (
      <details className="wb-session-edit wb-ovelse">
        <summary>{UI.addDrill}</summary>
        {felter}
      </details>
    );
  }

  return (
    <div className="wb-ark" role="dialog" aria-modal="true" aria-label={UI.addDrill} hidden={!apen} ref={arkRef} tabIndex={-1}>
      <div className="wb-ark-hode">
        <b>{UI.addDrill}</b>
        <button type="button" className="wb-quiet" onClick={onLukk}>Lukk</button>
      </div>
      <div className="wb-ark-innhold wb-session-edit wb-ovelse">{felter}</div>
      <div className="wb-ark-fot">
        <button type="button" className="wb-publish" disabled={disabled || !title.trim()} onClick={send}>{UI.addDrill}</button>
      </div>
    </div>
  );
}
