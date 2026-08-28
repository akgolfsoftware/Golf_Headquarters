"use client";

/**
 * HistorikkFilterSheet — gjenbrukbart filter-bunnark (Paper-port W2, fase2).
 * Fasit: designsystem/paper/fase2/playerhq/playerhq-historikk-filter-sheet.html.
 *
 * Manifest-vedtaket (manifest-w2-filter-varsler-putting.md): «Én delt
 * historikk-flate med bunn-sheet — sheeten er mønsteret alle lister skal
 * gjenbruke.» Bygget på den delte BunnArk-primitiven (backdrop, fokus-felle,
 * Escape, scroll-lås følger med gratis).
 *
 * Utkast-state per fasit: valg trer i kraft først ved «Vis N treff» (ink),
 * «Nullstill» er ikke-destruktiv (rører kun utkastet). Alle valg-knapper
 * bærer aria-pressed. Treff-telleren regnes av eieren via `tellTreff`.
 */

import { useState } from "react";
import { TL } from "@/lib/v2/train-lock";

import { Caps } from "@/components/v2";
import { BunnArk } from "@/components/v2/bunn-ark";

export type HistorikkType = "runde" | "okt" | "test" | "trackman";
export type HistorikkSone = "tee" | "innspill" | "naerspill" | "putt";
export type HistorikkPeriode = "30" | "90" | "sesong" | "alt";
export type HistorikkSort = "ny" | "gammel" | "sg";

export type HistorikkFiltre = {
  periode: HistorikkPeriode;
  typer: HistorikkType[];
  /** Tom liste = alle soner. */
  soner: HistorikkSone[];
  sort: HistorikkSort;
};

/** Fasitens standardvalg (STD i fasit-scriptet). */
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
    <div style={{ padding: "16px 0", borderBottom: `1px solid ${TL.hair}` }}>
      <div style={{ marginBottom: 12 }}>
        <Caps>{label}</Caps>
      </div>
      {children}
    </div>
  );
}

function SegKnapp({
  on,
  label,
  odId,
  onClick,
  last,
}: {
  on: boolean;
  label: string;
  odId: string;
  onClick: () => void;
  last: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      data-od-id={odId}
      className="v2-press v2-focus"
      style={{
        flex: 1,
        minHeight: 44,
        padding: "0 12px",
        background: on ? TL.dock : TL.elev,
        border: 0,
        borderRight: last ? "none" : `1px solid ${TL.hair}`,
        color: TL.text,
        fontFamily: TL.font.sans,
        fontSize: 12.5,
        fontWeight: on ? 600 : 400,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

export function FilterChip({
  on,
  label,
  odId,
  onClick,
  fjernbar,
}: {
  on: boolean;
  label: string;
  odId: string;
  onClick: () => void;
  /** Viser «×» — brukes i den aktive filterlinja over lista. */
  fjernbar?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      data-od-id={odId}
      className="v2-press v2-focus"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        minHeight: 36,
        padding: "0 12px",
        border: `1px solid ${on ? TL.hair : TL.hair}`,
        borderRadius: TL.radius.pill,
        background: on ? TL.dock : TL.elev,
        color: TL.text,
        fontFamily: TL.font.mono,
        fontSize: 11,
        fontWeight: on ? 600 : 400,
        cursor: "pointer",
        flex: "none",
      }}
    >
      {label}
      {fjernbar && (
        <span aria-hidden style={{ color: TL.mute }}>
          ×
        </span>
      )}
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
  /** Eieren teller treff for et utkast — sheeten viser tallet i «Vis N treff». */
  tellTreff: (f: HistorikkFiltre) => number;
}) {
  // BunnArk rendrer ingenting når open er false → SheetInnhold monteres på
  // nytt for hver åpning og starter utkastet fra gjeldende filtre (ingen
  // setState-i-effekt, jf. react-hooks/set-state-in-effect).
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
      // Minst én type — fasiten lar aldri lista bli filterløst tom på type.
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
    <div style={{ minWidth: 0 }}>
        <Gruppe label="Periode">
          <div style={{ display: "flex", border: `1px solid ${TL.hair}`, borderRadius: TL.radius.row, overflow: "hidden" }} role="group" aria-label="Periode">
            {PERIODER.map((p, i) => (
              <SegKnapp
                key={p.v}
                on={utkast.periode === p.v}
                label={p.label}
                odId={`filt-per-${p.v}`}
                onClick={() => setUtkast((u) => ({ ...u, periode: p.v }))}
                last={i === PERIODER.length - 1}
              />
            ))}
          </div>
        </Gruppe>

        <Gruppe label="Type">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {TYPER.map((t) => (
              <FilterChip key={t} on={utkast.typer.includes(t)} label={TYPE_LABEL[t]} odId={`filt-type-${t}`} onClick={() => toggleType(t)} />
            ))}
          </div>
        </Gruppe>

        <Gruppe label="Sone">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <FilterChip
              on={utkast.soner.length === 0}
              label="Alle soner"
              odId="filt-sone-alle"
              onClick={() => setUtkast((u) => ({ ...u, soner: [] }))}
            />
            {SONER.map((s) => (
              <FilterChip key={s} on={utkast.soner.includes(s)} label={SONE_LABEL[s]} odId={`filt-sone-${s}`} onClick={() => toggleSone(s)} />
            ))}
          </div>
        </Gruppe>

        <Gruppe label="Sortering">
          <div style={{ display: "flex", border: `1px solid ${TL.hair}`, borderRadius: TL.radius.row, overflow: "hidden" }} role="group" aria-label="Sortering">
            {SORTERINGER.map((s, i) => (
              <SegKnapp
                key={s.v}
                on={utkast.sort === s.v}
                label={s.label}
                odId={`filt-sort-${s.v}`}
                onClick={() => setUtkast((u) => ({ ...u, sort: s.v }))}
                last={i === SORTERINGER.length - 1}
              />
            ))}
          </div>
        </Gruppe>

        {/* Fot — Nullstill (ikke-destruktiv, rører kun utkastet) + Vis N treff (ink) */}
        <div style={{ display: "flex", gap: 8, paddingTop: 16 }}>
          <button
            type="button"
            onClick={() => setUtkast({ ...STD_FILTRE, typer: [...STD_FILTRE.typer], soner: [...STD_FILTRE.soner] })}
            data-od-id="filt-nullstill"
            className="v2-press v2-focus"
            style={{
              flex: 1,
              minHeight: 48,
              borderRadius: TL.radius.row,
              border: `1px solid ${TL.hair}`,
              background: TL.elev,
              color: TL.text,
              fontFamily: TL.font.sans,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Nullstill
          </button>
          <button
            type="button"
            onClick={() => {
              onBruk(utkast);
              onClose();
            }}
            data-od-id="filt-bruk"
            className="v2-press v2-focus"
            style={{
              flex: 1,
              minHeight: 48,
              borderRadius: TL.radius.row,
              border: "none",
              background: TL.fill,
              color: TL.onFill,
              fontFamily: TL.font.sans,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Vis{" "}
            <span className="num" style={{ fontFamily: TL.font.mono, margin: "0 4px" }}>
              {treff}
            </span>{" "}
            treff
          </button>
        </div>
    </div>
  );
}
