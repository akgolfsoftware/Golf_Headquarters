"use client";

import { useState } from "react";
import Link from "next/link";
import { Filter, SlidersHorizontal } from "lucide-react";
import { Ikon, TomTilstand } from "@/components/precision/pa";
import {
  HistorikkFilterSheet,
  FilterChip,
  STD_FILTRE,
  TYPE_LABEL,
  SONE_LABEL,
  type HistorikkFiltre,
  type HistorikkType,
  type HistorikkSone,
} from "./HistorikkFilterSheet";

export type HistorikkEntry = {
  id: string;
  type: HistorikkType;
  dag: string;
  mnd: string;
  navn: string;
  meta: string;
  verdi: string;
  tone: "pos" | "neg" | null;
  soner: HistorikkSone[];
  sg: number | null;
  href: string | null;
  dagerSiden: number;
  iSesong: boolean;
};

function treff(entries: HistorikkEntry[], f: HistorikkFiltre): HistorikkEntry[] {
  return entries.filter((e) => {
    if (f.periode === "30" && e.dagerSiden > 30) return false;
    if (f.periode === "90" && e.dagerSiden > 90) return false;
    if (f.periode === "sesong" && !e.iSesong) return false;
    if (!f.typer.includes(e.type)) return false;
    if (f.soner.length > 0 && !e.soner.some((s) => f.soner.includes(s))) return false;
    return true;
  });
}

function sorter(liste: HistorikkEntry[], f: HistorikkFiltre): HistorikkEntry[] {
  const l = [...liste];
  if (f.sort === "gammel") l.reverse();
  if (f.sort === "sg") l.sort((a, b) => (b.sg ?? -Infinity) - (a.sg ?? -Infinity));
  return l;
}

export function HistorikkV2({ entries, navn }: { entries: HistorikkEntry[]; navn: string }) {
  const [filtre, setFiltre] = useState<HistorikkFiltre>({
    ...STD_FILTRE,
    typer: [...STD_FILTRE.typer],
    soner: [...STD_FILTRE.soner],
  });
  const [sheetApen, setSheetApen] = useState(false);
  const liste = sorter(treff(entries, filtre), filtre);

  const merker: { nokkel: string; label: string; fjern: () => void }[] = [];
  merker.push({
    nokkel: "periode",
    label:
      filtre.periode === "alt"
        ? "Hele historikken"
        : filtre.periode === "sesong"
          ? `Sesong ${new Date().getFullYear()}`
          : `Siste ${filtre.periode} dager`,
    fjern: () => setFiltre((f) => ({ ...f, periode: "alt" })),
  });
  if (filtre.typer.length < 4) {
    for (const t of filtre.typer) {
      merker.push({
        nokkel: `type-${t}`,
        label: TYPE_LABEL[t],
        fjern: () =>
          setFiltre((f) => {
            const rest = f.typer.filter((x) => x !== t);
            return { ...f, typer: rest.length > 0 ? rest : [...STD_FILTRE.typer] };
          }),
      });
    }
  }
  for (const s of filtre.soner) {
    merker.push({
      nokkel: `sone-${s}`,
      label: SONE_LABEL[s],
      fjern: () => setFiltre((f) => ({ ...f, soner: f.soner.filter((x) => x !== s) })),
    });
  }
  if (filtre.sort !== "ny") {
    merker.push({
      nokkel: "sort",
      label: filtre.sort === "gammel" ? "Eldste først" : "Best SG først",
      fjern: () => setFiltre((f) => ({ ...f, sort: "ny" })),
    });
  }

  function nullstill() {
    setFiltre({ ...STD_FILTRE, typer: [...STD_FILTRE.typer], soner: [...STD_FILTRE.soner] });
  }

  return (
    <div className="ph16h" data-od-id="playerhq-historikk">
      <header>
        <div>
          <h1>Historikk</h1>
          <p>{navn} · alle økter og runder</p>
        </div>
        <button type="button" aria-label="Åpne filter" aria-haspopup="dialog" onClick={() => setSheetApen(true)} data-od-id="hist-apne-filter">
          <Ikon icon={SlidersHorizontal} size={18} name="filter" />
        </button>
      </header>

      <div className="ph16h-chips">
        {merker.map((m) => (
          <FilterChip key={m.nokkel} on label={m.label} odId={`hist-chip-${m.nokkel}`} onClick={m.fjern} fjernbar />
        ))}
        <FilterChip on={false} label="Filtrer …" odId="hist-chip-apne" onClick={() => setSheetApen(true)} />
      </div>

      {liste.length > 0 ? (
        <section className="pa-card ph16h-liste">
          <p>{liste.length} av {entries.length} oppføringer</p>
          {liste.map((e) => {
            const inner = (
              <>
                <span className="ph16h-dato" aria-hidden><strong>{e.dag}</strong><small>{e.mnd}</small></span>
                <span><strong>{e.navn}</strong><small>{e.meta}</small></span>
                <b data-tone={e.tone ?? "flat"}>{e.verdi}</b>
              </>
            );
            return e.href ? (
              <Link key={`${e.type}-${e.id}`} href={e.href} data-od-id={`hist-rad-${e.type}-${e.id}`}>{inner}</Link>
            ) : (
              <div key={`${e.type}-${e.id}`} data-od-id={`hist-rad-${e.type}-${e.id}`}>{inner}</div>
            );
          })}
        </section>
      ) : (
        <TomTilstand
          icon={Filter}
          title="Ingen treff på dette filteret"
          text="Ingen økter eller runder i valgt periode med valgt type. Utvid perioden eller nullstill filteret."
          actions={<button type="button" className="pa-btn pa-btn--secondary" onClick={nullstill} data-od-id="hist-tom-nullstill">Nullstill filter</button>}
        />
      )}

      <HistorikkFilterSheet
        open={sheetApen}
        onClose={() => setSheetApen(false)}
        verdi={filtre}
        onBruk={setFiltre}
        tellTreff={(f) => treff(entries, f).length}
      />
    </div>
  );
}
