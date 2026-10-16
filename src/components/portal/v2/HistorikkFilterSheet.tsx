"use client";

import { useState } from "react";
import { BunnArk } from "@/components/v2/bunn-ark";

export type HistorikkType = "runde" | "okt" | "test" | "trackman";
export type HistorikkSone = "tee" | "innspill" | "naerspill" | "putt";
export type HistorikkPeriode = "30" | "90" | "sesong" | "alt";
export type HistorikkSort = "ny" | "gammel" | "sg";

export type HistorikkFiltre = {
  periode: HistorikkPeriode;
  typer: HistorikkType[];
  soner: HistorikkSone[];
  sort: HistorikkSort;
};

export const STD_FILTRE: HistorikkFiltre = { periode: "90", typer: ["runde", "okt", "test"], soner: [], sort: "ny" };

export const TYPE_LABEL: Record<HistorikkType, string> = {
  runde: "Runder",
  okt: "Økter",
  test: "Tester",
  trackman: "TrackMan",
};
export const SONE_LABEL: Record<HistorikkSone, string> = {
  tee: "Tee",
  innspill: "Innspill",
  naerspill: "Nærspill",
  putt: "Putt",
};

const PERIODER: { v: HistorikkPeriode; label: string }[] = [
  { v: "30", label: "30 dager" },
  { v: "90", label: "90 dager" },
  { v: "sesong", label: "Sesong" },
  { v: "alt", label: "Alt" },
];
const SORTERINGER: { v: HistorikkSort; label: string }[] = [
  { v: "ny", label: "Nyeste" },
  { v: "gammel", label: "Eldste" },
  { v: "sg", label: "Best SG" },
];
const TYPER: HistorikkType[] = ["runde", "okt", "test", "trackman"];
const SONER: HistorikkSone[] = ["tee", "innspill", "naerspill", "putt"];

function Gruppe({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="ph16h-gruppe">
      <p>{label}</p>
      {children}
    </div>
  );
}

function SegKnapp({ on, label, odId, onClick, last }: { on: boolean; label: string; odId: string; onClick: () => void; last: boolean }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick} data-od-id={odId} data-siste={last ? "true" : undefined}>
      {label}
    </button>
  );
}

export function FilterChip({ on, label, odId, onClick, fjernbar }: { on: boolean; label: string; odId: string; onClick: () => void; fjernbar?: boolean }) {
  return (
    <button type="button" className="ph16h-chip" aria-pressed={on} onClick={onClick} data-od-id={odId}>
      {label}
      {fjernbar && <span aria-hidden>×</span>}
    </button>
  );
}

export function HistorikkFilterSheet({
  open,
  onClose,
  verdi,
  onBruk,
  tellTreff,
}: {
  open: boolean;
  onClose: () => void;
  verdi: HistorikkFiltre;
  onBruk: (f: HistorikkFiltre) => void;
  tellTreff: (f: HistorikkFiltre) => number;
}) {
  return (
    <BunnArk open={open} onClose={onClose} tittel="Filtrer historikk">
      <SheetInnhold verdi={verdi} onBruk={onBruk} onClose={onClose} tellTreff={tellTreff} />
    </BunnArk>
  );
}

function SheetInnhold({
  verdi,
  onBruk,
  onClose,
  tellTreff,
}: {
  verdi: HistorikkFiltre;
  onBruk: (f: HistorikkFiltre) => void;
  onClose: () => void;
  tellTreff: (f: HistorikkFiltre) => number;
}) {
  const [utkast, setUtkast] = useState<HistorikkFiltre>(verdi);
  const treff = tellTreff(utkast);

  function toggleType(t: HistorikkType) {
    setUtkast((u) => {
      const har = u.typer.includes(t);
      if (har && u.typer.length === 1) return u;
      return { ...u, typer: har ? u.typer.filter((x) => x !== t) : [...u.typer, t] };
    });
  }

  function toggleSone(s: HistorikkSone) {
    setUtkast((u) => ({
      ...u,
      soner: u.soner.includes(s) ? u.soner.filter((x) => x !== s) : [...u.soner, s],
    }));
  }

  return (
    <div className="ph16h-ark">
      <Gruppe label="Periode">
        <div role="group" aria-label="Periode">
          {PERIODER.map((p, i) => (
            <SegKnapp key={p.v} on={utkast.periode === p.v} label={p.label} odId={`filt-per-${p.v}`} onClick={() => setUtkast((u) => ({ ...u, periode: p.v }))} last={i === PERIODER.length - 1} />
          ))}
        </div>
      </Gruppe>
      <Gruppe label="Type">
        <div className="ph16h-chips">
          {TYPER.map((t) => (
            <FilterChip key={t} on={utkast.typer.includes(t)} label={TYPE_LABEL[t]} odId={`filt-type-${t}`} onClick={() => toggleType(t)} />
          ))}
        </div>
      </Gruppe>
      <Gruppe label="Sone">
        <div className="ph16h-chips">
          <FilterChip on={utkast.soner.length === 0} label="Alle soner" odId="filt-sone-alle" onClick={() => setUtkast((u) => ({ ...u, soner: [] }))} />
          {SONER.map((s) => (
            <FilterChip key={s} on={utkast.soner.includes(s)} label={SONE_LABEL[s]} odId={`filt-sone-${s}`} onClick={() => toggleSone(s)} />
          ))}
        </div>
      </Gruppe>
      <Gruppe label="Sortering">
        <div role="group" aria-label="Sortering">
          {SORTERINGER.map((s, i) => (
            <SegKnapp key={s.v} on={utkast.sort === s.v} label={s.label} odId={`filt-sort-${s.v}`} onClick={() => setUtkast((u) => ({ ...u, sort: s.v }))} last={i === SORTERINGER.length - 1} />
          ))}
        </div>
      </Gruppe>
      <div className="ph16h-fot">
        <button type="button" className="pa-btn pa-btn--secondary" onClick={() => setUtkast({ ...STD_FILTRE, typer: [...STD_FILTRE.typer], soner: [...STD_FILTRE.soner] })} data-od-id="filt-nullstill">Nullstill</button>
        <button type="button" className="pa-btn pa-btn--primary" onClick={() => { onBruk(utkast); onClose(); }} data-od-id="filt-bruk">Vis {treff} treff</button>
      </div>
    </div>
  );
}
