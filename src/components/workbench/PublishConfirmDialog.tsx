"use client";

/**
 * PublishConfirmDialog — bekreftelse før publisering (natt-plan Loop 2, PX-2).
 *
 * Fasit: designsystem/train-lock/A-01d Publish confirm.dc.html (ramme A-01d1):
 * caps-kicker «Uke 36 · Øyvind Rohjan», tittel 26/700/−0.02em «Publiser N
 * økter?», brødtekst 15 mute, økt-liste som #161616-kort radius 16 med rader
 * «Tir 16.00» (13 mute, 88 px) + tittel 15/600, footer = Avbryt som ren tekst
 * + den ene hvite «Publiser»-pillen (48 px).
 *
 * Publisering er øyeblikket spilleren ser økten, derfor egen bekreftelse med
 * full liste. Gjelder en økt i dag advares det ekstra: den dukker opp i
 * spillerens «I dag» med en gang.
 */

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Knapp } from "@/components/v2/core";
import { Icon } from "@/components/v2/icon";
import { TL } from "@/lib/v2/train-lock";

import { formatKlokke, UI } from "@/lib/domain/workbench/labels";
import { isoWeekNumber } from "@/lib/domain/workbench/operations";
import type { ValidationNote } from "@/lib/domain/workbench/operations";
import type { WorkbenchSession } from "@/lib/domain/workbench/types";
import { WARM } from "./wb-visuelt";

const DAG_KORT = ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"];

/** «Tir 16.00» — dagforkortelse fra ISO-dato (UTC-trygt for rene datoer). */
function dagOgKlokke(isoDate: string, startMinute: number): string {
  const d = new Date(`${isoDate}T00:00:00`);
  return `${DAG_KORT[d.getDay()]} ${formatKlokke(startMinute)}`;
}

type Props = {
  open: boolean;
  /** Utkastene som publiseres. */
  okter: WorkbenchSession[];
  /** Dagens dato i Oslo (YYYY-MM-DD). */
  idag: string;
  /** Til caps-kickeren «Uke 36 · Øyvind Rohjan» (A-01d). */
  spillerNavn?: string;
  /** VARSEL fra validateWeek (f.eks. overlapp) — informerer, sperrer aldri (invariant 1). */
  notater?: ValidationNote[];
  publiserer: boolean;
  onLukk: () => void;
  onBekreft: () => void;
};

export function PublishConfirmDialog({
  open,
  okter,
  idag,
  spillerNavn,
  notater = [],
  publiserer,
  onLukk,
  onBekreft,
}: Props) {
  const iDagAntall = okter.filter((s) => s.date === idag).length;
  const ukeNr = okter[0] ? isoWeekNumber(okter[0].date) : isoWeekNumber(idag);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onLukk()}>
      <DialogContent size="md">
        <DialogHeader>
          {spillerNavn && (
            <div
              style={{
                fontFamily: TL.font.sans,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: TL.mute,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {UI.publishConfirmKicker(ukeNr, spillerNavn)}
            </div>
          )}
          <DialogTitle className="text-[26px] font-bold tracking-[-0.02em]">
            {UI.publishConfirmHeading(okter.length)}
          </DialogTitle>
          <DialogDescription className="text-[15px] leading-[1.45]">
            {UI.publishConfirmBody}
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          {iDagAntall > 0 && (
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "flex-start",
                padding: "10px 12px",
                marginBottom: 12,
                borderRadius: TL.radius.row,
                border: `1px solid color-mix(in srgb, ${WARM} 35%, transparent)`,
                background: `color-mix(in srgb, ${WARM} 8%, transparent)`,
              }}
            >
              <Icon name="info" size={14} style={{ color: WARM, marginTop: 1 }} />
              <span style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute }}>
                {iDagAntall === 1
                  ? UI.publishTodayWarnOne
                  : UI.publishTodayWarnMany(iDagAntall)}
              </span>
            </div>
          )}

          {notater.length > 0 && (
            <div
              role="status"
              style={{
                display: "flex",
                gap: 8,
                alignItems: "flex-start",
                padding: "10px 12px",
                marginBottom: 12,
                borderRadius: TL.radius.row,
                border: `1px solid color-mix(in srgb, ${TL.danger} 35%, transparent)`,
                background: `color-mix(in srgb, ${TL.danger} 8%, transparent)`,
              }}
            >
              <Icon name="triangle-alert" size={14} style={{ color: TL.danger, marginTop: 1 }} />
              <div style={{ display: "grid", gap: 4, minWidth: 0 }}>
                <span style={{ fontFamily: TL.font.sans, fontSize: 12.5, fontWeight: 600, color: TL.text }}>
                  {UI.publishOverlapWarnTitle}
                </span>
                {notater.map((n, i) => (
                  <span
                    key={`${n.sessionId ?? "note"}-${i}`}
                    style={{ fontFamily: TL.font.sans, fontSize: 12, color: TL.mute }}
                  >
                    {n.message}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* A-01d: økt-listen som #161616-kort radius 16, rader med
              «Tir 16.00» (13 mute, 88 px) + tittel 15/600. */}
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: "2px 18px",
              background: TL.elev,
              borderRadius: 16,
            }}
          >
            {okter.map((s, i) => (
              <li
                key={s.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 0",
                  borderBottom: i < okter.length - 1 ? `1px solid ${TL.hair}` : "none",
                  minWidth: 0,
                }}
              >
                <span
                  style={{
                    width: 88,
                    flex: "none",
                    fontFamily: TL.font.sans,
                    fontSize: 13,
                    color: TL.mute,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {dagOgKlokke(s.date, s.startMinute)}
                </span>
                <span
                  style={{
                    flex: 1,
                    fontFamily: TL.font.sans,
                    fontSize: 15,
                    fontWeight: 600,
                    color: TL.text,
                    minWidth: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {s.title}
                </span>
              </li>
            ))}
          </ul>
        </DialogBody>

        {/* A-01d: Avbryt som ren tekst, «Publiser» som den ene hvite pillen. */}
        <DialogFooter className="gap-5">
          <button
            type="button"
            onClick={onLukk}
            className="v2-focus"
            style={{
              appearance: "none",
              background: "transparent",
              border: "none",
              padding: 0,
              fontFamily: TL.font.sans,
              fontSize: 15,
              fontWeight: 600,
              color: TL.mute,
              cursor: "pointer",
            }}
          >
            {UI.cancel}
          </button>
          <Knapp
            enTing
            onClick={onBekreft}
            disabled={publiserer}
            style={{
              height: 48,
              minHeight: 48,
              borderRadius: 9999,
              padding: "0 28px",
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            {publiserer ? UI.publishing : UI.publish}
          </Knapp>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
