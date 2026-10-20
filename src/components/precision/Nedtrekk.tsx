"use client";

/**
 * Felles nedtrekksmeny i AgencyOS (godkjent av Anders 20.10.2026, canvas
 * «AgencyOS nøkkelskjermer», Registrer test).
 *
 * PC (fra 900 px): meny rett under knappen, med søk og hake på valgt verdi.
 * Mobil: ark nedenfra med rader på 52 px og «Ferdig».
 * Har feltet bare to–fire valg, bruk knapper i stedet for denne komponenten.
 * Bevegelse bare med prefers-reduced-motion: no-preference (i CSS-modulen).
 */
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { filtrerValg, grupperValg, type NedtrekkValg } from "./nedtrekk-filter";
import s from "./Nedtrekk.module.css";

export type { NedtrekkValg };

const PC_FRA = "(min-width: 900px)";

function useErPc(): boolean {
  const [pc, setPc] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia(PC_FRA);
    const oppdater = () => setPc(mq.matches);
    oppdater();
    mq.addEventListener("change", oppdater);
    return () => mq.removeEventListener("change", oppdater);
  }, []);
  return pc;
}

type Props = {
  /** Synlig etikett foran verdien, f.eks. «Test» eller «Spiller». */
  etikett: string;
  valg: readonly NedtrekkValg[];
  verdi: string | null;
  onVelg: (verdi: string) => void;
  /** Søkefelt vises fra og med dette antallet valg. */
  sokFra?: number;
  sokPlassholder?: string;
  /** Tekst når ingen verdi er valgt. */
  tom?: string;
  /** Høyrejusterer PC-menyen mot knappen. */
  hoyre?: boolean;
  bred?: boolean;
};

export function Nedtrekk({ etikett, valg, verdi, onVelg, sokFra = 7, sokPlassholder, tom = "—", hoyre = false, bred = false }: Props) {
  const pc = useErPc();
  const [aapen, setAapen] = useState(false);
  const [sok, setSok] = useState("");
  const [aktiv, setAktiv] = useState(0);
  const knapp = useRef<HTMLButtonElement>(null);
  const boks = useRef<HTMLDivElement>(null);
  const sokFelt = useRef<HTMLInputElement>(null);
  const listeId = useId();

  const valgt = valg.find((v) => v.verdi === verdi) ?? null;
  const treff = useMemo(() => filtrerValg(valg, sok), [valg, sok]);
  const grupper = useMemo(() => grupperValg(treff), [treff]);
  const visSok = valg.length >= sokFra;

  const lukk = (tilbakeTilKnapp = true) => {
    setAapen(false);
    setSok("");
    if (tilbakeTilKnapp) knapp.current?.focus();
  };

  const aapne = () => {
    const i = Math.max(0, valg.findIndex((v) => v.verdi === verdi));
    setAktiv(i);
    setAapen(true);
  };

  const velg = (v: NedtrekkValg) => {
    onVelg(v.verdi);
    lukk();
  };

  useEffect(() => {
    if (!aapen) return;
    if (visSok && pc) sokFelt.current?.focus();
    else boks.current?.querySelector<HTMLButtonElement>('[aria-selected="true"], [role="option"]')?.focus();
    if (!pc) return;
    const ute = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!boks.current?.contains(t) && !knapp.current?.contains(t)) lukk(false);
    };
    document.addEventListener("pointerdown", ute);
    return () => document.removeEventListener("pointerdown", ute);
  }, [aapen, pc, visSok]);

  const tast = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      lukk();
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const n = treff.length;
      if (!n) return;
      const ny = (aktiv + (e.key === "ArrowDown" ? 1 : -1) + n) % n;
      setAktiv(ny);
      boks.current?.querySelectorAll<HTMLButtonElement>('[role="option"]')[ny]?.focus();
    } else if (e.key === "Enter" && e.target === sokFelt.current && treff[0]) {
      e.preventDefault();
      velg(treff[0]);
    }
  };

  const rader = (
    <>
      {grupper.map((g) => (
        <div key={g.gruppe || "_"} role="group" aria-label={g.gruppe || undefined} className={s.gruppe}>
          {g.gruppe ? <span className={s.gruppetittel}>{g.gruppe}</span> : null}
          {g.valg.map((v) => {
            const er = v.verdi === verdi;
            return (
              <button
                key={v.verdi}
                type="button"
                role="option"
                aria-selected={er}
                className={s.valg}
                onClick={() => velg(v)}
              >
                <span className={s.hake}>{er ? <Check size={16} strokeWidth={2.4} aria-hidden /> : null}</span>
                <span className={s.navn}>{v.navn}</span>
                {v.antall ? <span className={s.antall}>{v.antall}</span> : null}
              </button>
            );
          })}
        </div>
      ))}
      {treff.length === 0 ? <p className={s.ingen}>Ingen treff på «{sok}»</p> : null}
    </>
  );

  const sokFeltet = visSok ? (
    <label className={s.sok}>
      <Search size={15} aria-hidden />
      <input
        ref={sokFelt}
        type="search"
        value={sok}
        onChange={(e) => {
          setSok(e.target.value);
          setAktiv(0);
        }}
        placeholder={sokPlassholder ?? `Søk ${etikett.toLocaleLowerCase("nb-NO")}`}
        aria-label={sokPlassholder ?? `Søk ${etikett.toLocaleLowerCase("nb-NO")}`}
        aria-controls={listeId}
      />
    </label>
  ) : null;

  return (
    <div className={`${s.rot} ${bred ? s.bred : ""}`}>
      <button
        ref={knapp}
        type="button"
        className={s.knapp}
        aria-haspopup="listbox"
        aria-expanded={aapen}
        aria-controls={aapen ? listeId : undefined}
        onClick={() => (aapen ? lukk() : aapne())}
      >
        <span className={s.etikett}>{etikett}</span>
        <b className={s.verdi}>{valgt?.navn ?? tom}</b>
        <ChevronDown size={14} aria-hidden />
      </button>

      {aapen && pc ? (
        <div ref={boks} className={`${s.meny} ${hoyre ? s.hoyre : ""}`} onKeyDown={tast}>
          {sokFeltet}
          <div id={listeId} role="listbox" aria-label={etikett} className={s.liste}>
            {rader}
          </div>
        </div>
      ) : null}

      {aapen && !pc ? (
        <>
          <button type="button" aria-label="Lukk" className={s.slor} onClick={() => lukk()} />
          <div ref={boks} role="dialog" aria-modal="true" aria-label={`Velg ${etikett.toLocaleLowerCase("nb-NO")}`} className={s.ark} onKeyDown={tast}>
            <i className={s.hank} aria-hidden />
            <div className={s.arkTopp}>
              <b>Velg {etikett.toLocaleLowerCase("nb-NO")}</b>
              <button type="button" className={s.ferdig} onClick={() => lukk()}>
                Ferdig
              </button>
            </div>
            {sokFeltet}
            <div id={listeId} role="listbox" aria-label={etikett} className={`${s.liste} ${s.arkListe}`}>
              {rader}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
