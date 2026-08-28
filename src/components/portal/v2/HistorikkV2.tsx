"use client";

/**
 * HistorikkV2 — PlayerHQ «Historikk» under Analyse (Paper-port W2, fase2).
 * Fasit: designsystem/paper/fase2/playerhq/playerhq-historikk-filter-sheet.html.
 *
 * Én samlet liste over runder, økter, tester og TrackMan-import — allerede
 * lastet server-side fra eksisterende loadere; ALL filtrering skjer
 * klientside her (manifest-vedtak: ingen ny backend). Aktive filtre speiles
 * som chips over lista og kan fjernes enkeltvis; «Filtrer …» åpner det delte
 * HistorikkFilterSheet-bunnarket. Tellelinje «N av M oppføringer» + ærlig
 * tom-treff-tilstand med nullstilling.
 */

import { useState } from "react";
import Link from "next/link";
import { TL } from "@/lib/v2/train-lock";

import { Kort, TomTilstand } from "@/components/v2";
import { Icon } from "@/components/v2/icon";
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
  /** Dag i måneden + kort månedsnavn (Oslo, beregnet server-side). */
  dag: string;
  mnd: string;
  navn: string;
  meta: string;
  verdi: string;
  tone: "pos" | "neg" | null;
  /** Soner raden hører til (fra AK-formelens område) — tom = ingen sone. */
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

  /** Aktive filtre som fjernbare chips (fasit .filterlinje). */
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
    <div
      data-paper-slug="playerhq-historikk-filter-sheet"
      data-od-id="playerhq-historikk"
      style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 720, margin: "0 auto", width: "100%", minWidth: 0 }}
    >
      {/* Topp — fasit: Historikk / navn · alle økter og runder + filterknapp */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 17, fontWeight: 600, color: TL.text }}>Historikk</h1>
          <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute, marginTop: 2 }}>
            {navn} · alle økter og runder
          </span>
        </div>
        <button
          type="button"
          aria-label="Åpne filter"
          aria-haspopup="dialog"
          onClick={() => setSheetApen(true)}
          data-od-id="hist-apne-filter"
          className="v2-press v2-focus"
          style={{
            flex: "none",
            width: 44,
            height: 44,
            display: "grid",
            placeItems: "center",
            borderRadius: TL.radius.card,
            border: `1px solid ${TL.hair}`,
            background: TL.elev,
            color: TL.text,
            cursor: "pointer",
          }}
        >
          <Icon name="filter" size={18} />
        </button>
      </div>

      {/* Aktive filtre — fjernbare chips + «Filtrer …» */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", minWidth: 0 }}>
        {merker.map((m) => (
          <FilterChip key={m.nokkel} on label={m.label} odId={`hist-chip-${m.nokkel}`} onClick={m.fjern} fjernbar />
        ))}
        <FilterChip on={false} label="Filtrer …" odId="hist-chip-apne" onClick={() => setSheetApen(true)} />
      </div>

      {liste.length > 0 ? (
        <Kort>
          <p className="num" style={{ margin: "0 0 8px", fontFamily: TL.font.mono, fontSize: 11, color: TL.mute }}>
            {liste.length} av {entries.length} oppføringer
          </p>
          <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            {liste.map((e, i, arr) => {
              const inner = (
                <>
                  <span
                    aria-hidden
                    style={{
                      flex: "none",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      background: TL.dock,
                      border: `1px solid ${TL.hair}`,
                      borderRadius: TL.radius.row,
                      padding: "6px 10px",
                      minWidth: 46,
                    }}
                  >
                    <span className="num" style={{ fontFamily: TL.font.mono, fontSize: 15, fontWeight: 700, lineHeight: 1, color: TL.text }}>
                      {e.dag}
                    </span>
                    <span
                      style={{
                        fontFamily: TL.font.mono,
                        fontSize: 8.5,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        color: TL.mute,
                        marginTop: 2,
                      }}
                    >
                      {e.mnd}
                    </span>
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", fontFamily: TL.font.sans, fontSize: 13, fontWeight: 500, color: TL.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {e.navn}
                    </span>
                    <span style={{ display: "block", fontFamily: TL.font.sans, fontSize: 11.5, color: TL.mute, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {e.meta}
                    </span>
                  </span>
                  <span
                    className="num"
                    style={{
                      flex: "none",
                      fontFamily: TL.font.mono,
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: e.tone === "pos" ? TL.ok : e.tone === "neg" ? TL.danger : TL.text,
                    }}
                  >
                    {e.verdi}
                  </span>
                </>
              );
              const radStil: React.CSSProperties = {
                display: "flex",
                alignItems: "center",
                gap: 12,
                minHeight: 52,
                padding: "8px 0",
                borderBottom: i === arr.length - 1 ? "none" : `1px solid ${TL.hair}`,
                textDecoration: "none",
                color: "inherit",
                minWidth: 0,
              };
              return e.href ? (
                <Link key={`${e.type}-${e.id}`} href={e.href} data-od-id={`hist-rad-${e.type}-${e.id}`} style={radStil}>
                  {inner}
                </Link>
              ) : (
                <div key={`${e.type}-${e.id}`} data-od-id={`hist-rad-${e.type}-${e.id}`} style={radStil}>
                  {inner}
                </div>
              );
            })}
          </div>
        </Kort>
      ) : (
        /* Tomt filtertreff — fasit-tilstand med én vei videre */
        <Kort>
          <TomTilstand
            icon="filter"
            title="Ingen treff på dette filteret"
            sub="Ingen økter eller runder i valgt periode med valgt type. Utvid perioden eller nullstill filteret."
          />
          <div style={{ marginTop: 12, textAlign: "center" }}>
            <button
              type="button"
              onClick={nullstill}
              data-od-id="hist-tom-nullstill"
              className="v2-press v2-focus"
              style={{
                minHeight: 44,
                padding: "0 16px",
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
              Nullstill filter
            </button>
          </div>
        </Kort>
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
