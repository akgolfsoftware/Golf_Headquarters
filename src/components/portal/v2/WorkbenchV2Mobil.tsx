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
import { T, Kort, TomTilstand, StatusPill, Icon } from "@/components/v2";
import { DagStripe, type StripeDag } from "@/components/v2/kalender";
import { DagNivaa, MANEDER, LPHASE_LABEL, type DagKol } from "./WorkbenchV2";
import type { WorkbenchData } from "@/lib/workbench/load-workbench";

/* ── WBTidslinjeMobil — dag-velger-pille (M T O T F L S) + agenda ── */
export function WBTidslinjeMobil({
  dager,
  valgt,
  onVelg,
  onFlytt,
}: {
  dager: DagKol[];
  valgt: string | null;
  onVelg: (id: string) => void;
  /** "Flytt til annen dag"-knapp på hver økt — touch-erstatning for musdrag. Uten = skjult. */
  onFlytt?: (sessionId: string, dayIndex: number) => void;
}) {
  const defaultDag = dager.find((d) => d.today) ?? dager.find((d) => d.events.length > 0) ?? dager[0] ?? null;
  const [valgtDato, setValgtDato] = useState<number | null>(defaultDag ? Number(defaultDag.dato) : null);
  const aktivDag = dager.find((d) => Number(d.dato) === valgtDato) ?? defaultDag;
  const stripeDays: StripeDag[] = dager.map((d) => ({ dow: d.dow.slice(0, 1), date: Number(d.dato), today: d.today }));
  return (
    <div  data-paper-slug="workbench-mobil" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <DagStripe days={stripeDays} value={valgtDato} onChange={(date) => setValgtDato(date)} />
      <DagNivaa dag={aktivDag ?? null} valgt={valgt} onVelg={onVelg} dager={dager} onFlytt={onFlytt} />
    </div>
  );
}

/* ── AarNivaaMobil — kompakt stablet liste (i stedet for tett rad) ── */
export function AarNivaaMobil({ data }: { data: WorkbenchData }) {
  const now = useState(() => Date.now())[0];
  const blocks = data.seasonBlocks ?? [];
  if (blocks.length === 0) {
    return (
      <Kort>
        <TomTilstand icon="calendar" title="Ingen sesongplan" sub="Ingen periodeblokker lagt inn for året ennå." />
      </Kort>
    );
  }
  return (
    <Kort eyebrow="Sesongperioder">
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
        {blocks.map((b) => {
          const start = new Date(b.startDate);
          const end = new Date(b.endDate);
          const naa = start.getTime() <= now && now <= end.getTime();
          return (
            <div
              key={b.id}
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                background: naa ? T.handlingSoft : T.panel2,
                border: `1px solid ${naa ? "transparent" : T.border}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg }}>
                  {LPHASE_LABEL[b.lPhase] ?? b.lPhase}
                </span>
                {naa && <StatusPill>Nå</StatusPill>}
              </div>
              <span style={{ fontFamily: T.mono, fontSize: 9.5, color: T.mut, display: "block", marginTop: 3 }}>
                {start.getDate()}. {MANEDER[start.getMonth()].slice(0, 3)}–{end.getDate()}. {MANEDER[end.getMonth()].slice(0, 3)}
              </span>
              {b.focus && (
                <span style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, display: "block", marginTop: 6, lineHeight: 1.4 }}>
                  {b.focus}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </Kort>
  );
}

/* ── WbBottomSheet — mobil bunn-ark (PP-3 fasit: grab/shead/sbody) ──
   Erstatter MobilFold-akkordeonene: Bibliotek og Balanse åpnes som ark
   nederst, samme overleggsmønster som arkene i WorkbenchV2Sheets.tsx. */
export function WbBottomSheet({
  tittel,
  onLukk,
  children,
}: {
  tittel: string;
  onLukk: () => void;
  children: ReactNode;
}) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 70 }} role="dialog" aria-modal="true" aria-label={tittel}>
      <div onClick={onLukk} style={{ position: "absolute", inset: 0, background: T.farge.nestenSvartA62, backdropFilter: "blur(2px)" }} />
      <div
        className="v2-sheet-in"
        style={{
          position: "absolute", left: 0, right: 0, bottom: 0, maxHeight: "88dvh",
          display: "flex", flexDirection: "column", background: T.panel,
          borderTop: `1px solid ${T.borderS}`, borderRadius: "20px 20px 0 0",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <span aria-hidden style={{ width: 36, height: 4, borderRadius: 9999, background: T.border, margin: "10px auto 6px", flex: "none" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 16px 10px", borderBottom: `1px solid ${T.border}`, flex: "none" }}>
          <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg, flex: 1, minWidth: 0 }}>{tittel}</span>
          <button
            type="button"
            onClick={onLukk}
            aria-label="Lukk"
            className="v2-press v2-focus"
            style={{ appearance: "none", cursor: "pointer", width: 44, height: 44, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "transparent", border: `1px solid ${T.border}`, borderRadius: 10, color: T.fg2 }}
          >
            <Icon name="x" size={16} />
          </button>
        </div>
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 16 }}>{children}</div>
      </div>
    </div>
  );
}
