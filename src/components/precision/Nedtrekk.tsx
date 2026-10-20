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
import "@/styles/agencyos-ny-nedtrekk.css";

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
        <div key={g.gruppe || "_"} role="group" aria-label={g.gruppe || undefined} className="ndt-gruppe">
          {g.gruppe ? <span className="ndt-gruppetittel">{g.gruppe}</span> : null}
          {g.valg.map((v) => {
            const er = v.verdi === verdi;
            return (
              <button
                key={v.verdi}
                type="button"
                role="option"
                aria-selected={er}
                className="ndt-valg"
                onClick={() => velg(v)}
              >
                <span className="ndt-hake">{er ? <Check size={16} strokeWidth={2.4} aria-hidden /> : null}</span>
                <span className="ndt-navn">{v.navn}</span>
                {v.antall ? <span className="ndt-antall">{v.antall}</span> : null}
              </button>
            );
          })}
        </div>
      ))}
      {treff.length === 0 ? <p className="ndt-ingen">Ingen treff på «{sok}»</p> : null}
    </>
  );

  const sokFeltet = visSok ? (
    <label className="ndt-sok">
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
    <div className={`ndt-rot ${bred ? "ndt-bred" : ""}`}>
      <button
        ref={knapp}
        type="button"
        className="ndt-knapp"
        aria-haspopup="listbox"
        aria-expanded={aapen}
        aria-controls={aapen ? listeId : undefined}
        onClick={() => (aapen ? lukk() : aapne())}
      >
        <span className="ndt-etikett">{etikett}</span>
        <b className="ndt-verdi">{valgt?.navn ?? tom}</b>
        <ChevronDown size={14} aria-hidden />
      </button>

      {aapen && pc ? (
        <div ref={boks} className={`ndt-meny ${hoyre ? "ndt-hoyre" : ""}`} onKeyDown={tast}>
          {sokFeltet}
          <div id={listeId} role="listbox" aria-label={etikett} className="ndt-liste">
            {rader}
          </div>
        </div>
      ) : null}

      {aapen && !pc ? (
        <>
          <button type="button" aria-label="Lukk" className="ndt-slor" onClick={() => lukk()} />
          <div ref={boks} role="dialog" aria-modal="true" aria-label={`Velg ${etikett.toLocaleLowerCase("nb-NO")}`} className="ndt-ark" onKeyDown={tast}>
            <i className="ndt-hank" aria-hidden />
            <div className="ndt-ark-topp">
              <b>Velg {etikett.toLocaleLowerCase("nb-NO")}</b>
              <button type="button" className="ndt-ferdig" onClick={() => lukk()}>
                Ferdig
              </button>
            </div>
            {sokFeltet}
            <div id={listeId} role="listbox" aria-label={etikett} className={`ndt-liste ndt-ark-liste`}>
              {rader}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
