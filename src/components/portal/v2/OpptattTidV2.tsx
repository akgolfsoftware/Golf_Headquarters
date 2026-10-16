"use client";

import { useState, useTransition } from "react";
import { Knapp, StatusPille } from "@/components/precision/pa";
import {
  leggTilOpptattTid,
  slettOpptattTid,
  type OpptattRad,
} from "@/app/portal/kalender/opptatt-actions";

const KIND_VALG = [
  { value: "AVTALE", label: "Avtale" },
  { value: "SKOLE", label: "Skole" },
  { value: "JOBB", label: "Jobb" },
  { value: "REISE", label: "Reise" },
  { value: "ANNET", label: "Annet" },
];

const GJENTAK_VALG = [
  { value: "NONE", label: "Én gang" },
  { value: "WEEKLY", label: "Hver uke" },
];

function fmtDato(d: Date): string {
  return new Intl.DateTimeFormat("nb-NO", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(d);
}

function fmtKl(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function tilLokalInput(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

type Props = { rader: OpptattRad[] };

export function OpptattTidV2({ rader }: Props) {
  const [venter, startTransition] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);
  const [apen, setApen] = useState(false);
  const naa = new Date();
  const om1t = new Date(naa.getTime() + 60 * 60 * 1000);
  const [tittel, setTittel] = useState("");
  const [start, setStart] = useState(tilLokalInput(naa));
  const [slutt, setSlutt] = useState(tilLokalInput(om1t));
  const [kind, setKind] = useState("AVTALE");
  const [gjentak, setGjentak] = useState("NONE");
  const [privat, setPrivat] = useState(false);

  function lagre() {
    setFeil(null);
    startTransition(async () => {
      const res = await leggTilOpptattTid({
        title: tittel,
        startAt: start,
        endAt: slutt,
        kind: kind as "AVTALE",
        recurring: gjentak as "NONE",
        isPrivate: privat,
      });
      if (!res.ok) {
        setFeil(res.feil);
        return;
      }
      setTittel("");
      setPrivat(false);
      setApen(false);
    });
  }

  function slett(id: string) {
    startTransition(async () => {
      const res = await slettOpptattTid(id);
      if (!res.ok) setFeil(res.feil);
    });
  }

  return (
    <div className="ph10o">
      <section className="pa-card ph10o-kort">
        <header>
          <div>
            <p className="ph10o-kicker">Opptatt tid</p>
            <p>Skole, gruppetrening og fravær hentes automatisk. Her legger du inn dine egne avtaler, så planleggeren ikke legger trening oppå dem.</p>
          </div>
          <Knapp variant="secondary" onClick={() => setApen((v) => !v)}>{apen ? "Avbryt" : "Legg til"}</Knapp>
        </header>
        {apen && (
          <form className="ph10o-skjema" onSubmit={(e) => { e.preventDefault(); lagre(); }}>
            <label>Hva<input value={tittel} placeholder="Tannlege" onChange={(e) => setTittel(e.target.value)} /></label>
            <label>Fra<input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} /></label>
            <label>Til<input type="datetime-local" value={slutt} onChange={(e) => setSlutt(e.target.value)} /></label>
            <label>Type<select value={kind} onChange={(e) => setKind(e.target.value)}>{KIND_VALG.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}</select></label>
            <label>Gjentakelse<select value={gjentak} onChange={(e) => setGjentak(e.target.value)}>{GJENTAK_VALG.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}</select></label>
            <label className="ph10o-sjekk">
              <input type="checkbox" checked={privat} onChange={(e) => setPrivat(e.target.checked)} />
              Skjul detaljene for coachen
            </label>
            <p className="ph10o-hjelp">Coachen ser at tiden er opptatt, men ikke hva den går til.</p>
            {feil && <p role="alert">{feil}</p>}
            <Knapp type="submit" fullWidth disabled={venter || tittel.trim().length === 0} loading={venter}>{venter ? "Lagrer …" : "Lagre"}</Knapp>
          </form>
        )}
        {!apen && feil && <p role="alert">{feil}</p>}
      </section>

      {rader.length === 0 ? (
        <p className="ph10o-tom">Ingen egne avtaler lagt inn.</p>
      ) : (
        <ul className="ph10o-liste">
          {rader.map((r) => (
            <li key={r.id}>
              <div>
                <strong>{r.title}</strong>
                <span>
                  {r.isPrivate && <StatusPille tone="neutral">Privat</StatusPille>}
                  {r.recurring === "WEEKLY" && <StatusPille>Hver uke</StatusPille>}
                </span>
                <small>{fmtDato(r.startAt)} · {fmtKl(r.startAt)}–{fmtKl(r.endAt)}</small>
              </div>
              <Knapp variant="secondary" disabled={venter} onClick={() => slett(r.id)}>Slett</Knapp>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
