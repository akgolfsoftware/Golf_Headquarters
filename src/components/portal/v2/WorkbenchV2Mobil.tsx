"use client";

/**
 * WORKBENCH — v2 MOBIL-MOTPARTER (retning C «Presis»). Rene, dataminimale
 * komponenter for <md-visningen av WorkbenchV2.tsx: dag-agenda i stedet for
 * uke-tidslinje, kompakt sesong-liste i stedet for tett rad, og en generisk
 * utfellbar seksjon for Bibliotek/Balanse (erstatter side-kolonnene).
 *
 * Ærlighet (prosjekt-regel): ingen egne data-antakelser — gjenbruker
 * WorkbenchV2s DagNivaa (samme agenda-rendering som desktop Økt-nivå) og
 * ekte data fra WorkbenchData. Ingen felt uten kilde i datamodellen vises.
 */

import { useState, type ReactNode } from "react";
import { T, Kort, Caps, TomTilstand, Icon, AKSE_NAVN } from "@/components/v2";
import type { AkseKey } from "@/lib/v2/tokens";
import { DagStripe, type StripeDag } from "@/components/v2/kalender";
import { DagNivaa, MANEDER, type DagKol } from "./WorkbenchV2";
import { fmtVarighet } from "@/lib/workbench/v2-format";
import type { WorkbenchData } from "@/lib/workbench/load-workbench";

/* ── WBTidslinjeMobil — dag-velger-pille (M T O T F L S) + agenda ── */
export function WBTidslinjeMobil({
  dager,
  valgt,
  onVelg,
}: {
  dager: DagKol[];
  valgt: string | null;
  onVelg: (id: string) => void;
}) {
  const defaultDag = dager.find((d) => d.today) ?? dager.find((d) => d.events.length > 0) ?? dager[0] ?? null;
  const [valgtDato, setValgtDato] = useState<number | null>(defaultDag ? Number(defaultDag.dato) : null);
  const aktivDag = dager.find((d) => Number(d.dato) === valgtDato) ?? defaultDag;
  const stripeDays: StripeDag[] = dager.map((d) => ({ dow: d.dow.slice(0, 1), date: Number(d.dato), today: d.today }));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <DagStripe days={stripeDays} value={valgtDato} onChange={(date) => setValgtDato(date)} />
      <DagNivaa dag={aktivDag ?? null} valgt={valgt} onVelg={onVelg} />
    </div>
  );
}

/* ── MndNivaaMobil — måned som stablet ukeliste (i stedet for 7-kols grid) ──
   Mobil-funn 13/7: MndNivaa sine 64px-celler ble uleselige på 390-flaten.
   Her: én rad per uke (ukenr + 7 tappbare dag-celler m/ akse-prikker og
   øktantall). Trykk en dag → samme velgDatoFraMnd som desktop (hopper til
   uka i tidslinja). Kun ekte data fra data.monthDays — ingen fabrikkerte felt. */
export function MndNivaaMobil({ data, onVelgDato }: { data: WorkbenchData; onVelgDato: (dato: Date) => void }) {
  const weekStart = data.weekStartISO ? new Date(data.weekStartISO) : new Date();
  const ar = weekStart.getFullYear();
  const mnd = weekStart.getMonth();
  const forste = new Date(ar, mnd, 1);
  const dagerIMnd = new Date(ar, mnd + 1, 0).getDate();
  const startPad = (forste.getDay() + 6) % 7; // grid starter på mandag
  const rader = Math.ceil((startPad + dagerIMnd) / 7);

  const nokkel = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const innhold = new Map((data.monthDays ?? []).map((d) => [d.dateISO, d]));
  const iDag = nokkel(new Date());
  const turneringPaaDag = new Set(
    (data.tournamentCalendar ?? []).map((t) => nokkel(new Date(t.startDate))),
  );
  const totalOkter = (data.monthDays ?? []).reduce((a, d) => a + d.count, 0);

  // ISO-ukenummer for mandagen i hver rad.
  const isoUke = (d: Date): number => {
    const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dow = t.getUTCDay() || 7;
    t.setUTCDate(t.getUTCDate() + 4 - dow);
    const nyttar = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
    return Math.ceil(((t.getTime() - nyttar.getTime()) / 86_400_000 + 1) / 7);
  };

  return (
    <Kort eyebrow={`${MANEDER[mnd][0].toUpperCase() + MANEDER[mnd].slice(1)} ${ar}`} action={<Caps size={9}>{totalOkter} økter</Caps>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
        {Array.from({ length: rader }, (_, rad) => {
          const mandagNr = rad * 7 - startPad + 1;
          const mandagDato = new Date(ar, mnd, mandagNr);
          return (
            <div key={rad} style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ fontFamily: T.mono, fontSize: 8.5, fontWeight: 700, color: T.mut, width: 24, flex: "none" }}>
                U{isoUke(mandagDato)}
              </span>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, flex: 1, minWidth: 0 }}>
                {Array.from({ length: 7 }, (_, kol) => {
                  const dagNr = rad * 7 + kol - startPad + 1;
                  if (dagNr < 1 || dagNr > dagerIMnd) return <span key={kol} />;
                  const dato = new Date(ar, mnd, dagNr);
                  const c = innhold.get(nokkel(dato));
                  const erIDag = nokkel(dato) === iDag;
                  const totMin = c ? c.axes.reduce((a, x) => a + x.min, 0) : 0;
                  return (
                    <button
                      key={kol}
                      type="button"
                      onClick={() => onVelgDato(dato)}
                      title={c ? `${c.count} økter · ${fmtVarighet(totMin)}` : "Ingen økter — trykk for å åpne uka"}
                      className="v2-press v2-focus"
                      style={{
                        appearance: "none", cursor: "pointer", minHeight: 46, padding: "4px 2px",
                        borderRadius: 9, display: "flex", flexDirection: "column", alignItems: "center",
                        justifyContent: "center", gap: 3,
                        background: erIDag ? `color-mix(in srgb, ${T.lime} 8%, ${T.panel2})` : T.panel2,
                        border: `1px solid ${erIDag ? `color-mix(in srgb, ${T.lime} 40%, transparent)` : T.border}`,
                      }}
                    >
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
                        <span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: erIDag ? T.lime : c ? T.fg : T.mut, fontVariantNumeric: "tabular-nums" }}>{dagNr}</span>
                        {turneringPaaDag.has(nokkel(dato)) && <Icon name="trophy" size={8} style={{ color: T.warn }} />}
                      </span>
                      <span style={{ display: "flex", gap: 2, minHeight: 5 }}>
                        {(c?.axes ?? []).slice(0, 4).map((x) => (
                          <span key={x.ax} title={AKSE_NAVN[x.ax.toUpperCase() as AkseKey] ?? x.ax} style={{ width: 5, height: 5, borderRadius: 9999, background: T.ax[x.ax.toUpperCase() as AkseKey] ?? T.mut }} />
                        ))}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
        {totalOkter === 0 && (
          <TomTilstand icon="calendar" title="Ingen økter denne måneden" sub="Trykk en dag for å åpne uka og legge inn økter." />
        )}
      </div>
      <span style={{ display: "block", marginTop: 10, fontFamily: T.mono, fontSize: 8.5, color: T.mut }}>Trykk en dag for å åpne uka i tidslinja.</span>
    </Kort>
  );
}

/* ── MobilFold — generisk utfellbar seksjon (44 px+ trykkmål) ───── */
export function MobilFold({
  tittel,
  ikon,
  startApen,
  children,
}: {
  tittel: string;
  ikon: string;
  startApen?: boolean;
  children: ReactNode;
}) {
  const [apen, setApen] = useState(!!startApen);
  return (
    <Kort pad="0">
      <button
        type="button"
        onClick={() => setApen((v) => !v)}
        style={{
          appearance: "none", cursor: "pointer", width: "100%", minHeight: 48,
          display: "flex", alignItems: "center", gap: 9, padding: "0 14px",
          background: "transparent", border: "none", textAlign: "left",
        }}
      >
        <Icon name={ikon} size={15} style={{ color: T.lime, flex: "none" }} />
        <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 14, color: T.fg, flex: 1, minWidth: 0 }}>{tittel}</span>
        <Icon name={apen ? "chevron-up" : "chevron-down"} size={15} style={{ color: T.mut, flex: "none" }} />
      </button>
      {apen && <div style={{ padding: "0 14px 16px" }}>{children}</div>}
    </Kort>
  );
}
