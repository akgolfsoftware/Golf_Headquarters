"use client";

/**
 * PublishConfirmDialog — bekreftelse før publisering (natt-plan Loop 2).
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
import { T } from "@/lib/v2/tokens";
import { formatTime, UI } from "@/lib/domain/workbench/labels";
import type { ValidationNote } from "@/lib/domain/workbench/operations";
import type { WorkbenchSession } from "@/lib/domain/workbench/types";
import { WARM } from "./wb-visuelt";

type Props = {
  open: boolean;
  /** Utkastene som publiseres. */
  okter: WorkbenchSession[];
  /** Dagens dato i Oslo (YYYY-MM-DD). */
  idag: string;
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
  notater = [],
  publiserer,
  onLukk,
  onBekreft,
}: Props) {
  const iDagAntall = okter.filter((s) => s.date === idag).length;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onLukk()}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>{UI.publishConfirmTitle}</DialogTitle>
          <DialogDescription>{UI.publishConfirmBody}</DialogDescription>
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
                borderRadius: T.rTag,
                border: `1px solid color-mix(in srgb, ${WARM} 35%, transparent)`,
                background: `color-mix(in srgb, ${WARM} 8%, transparent)`,
              }}
            >
              <Icon name="info" size={14} style={{ color: WARM, marginTop: 1 }} />
              <span style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2 }}>
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
                borderRadius: T.rTag,
                border: `1px solid color-mix(in srgb, ${T.down} 35%, transparent)`,
                background: `color-mix(in srgb, ${T.down} 8%, transparent)`,
              }}
            >
              <Icon name="triangle-alert" size={14} style={{ color: T.down, marginTop: 1 }} />
              <div style={{ display: "grid", gap: 4, minWidth: 0 }}>
                <span style={{ fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: T.fg }}>
                  {UI.publishOverlapWarnTitle}
                </span>
                {notater.map((n, i) => (
                  <span
                    key={`${n.sessionId ?? "note"}-${i}`}
                    style={{ fontFamily: T.ui, fontSize: 12, color: T.fg2 }}
                  >
                    {n.message}
                  </span>
                ))}
              </div>
            </div>
          )}

          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 6 }}>
            {okter.map((s) => (
              <li
                key={s.id}
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "baseline",
                  padding: "8px 10px",
                  borderRadius: T.rTag,
                  background: T.panel2,
                  minWidth: 0,
                }}
              >
                <span
                  style={{
                    fontFamily: T.mono,
                    fontSize: 11,
                    color: T.mut,
                    flex: "none",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {s.date.slice(8, 10)}.{s.date.slice(5, 7)} {formatTime(s.startMinute)}
                </span>
                <span
                  style={{
                    fontFamily: T.ui,
                    fontSize: 13,
                    color: T.fg,
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

        <DialogFooter>
          <Knapp ghost onClick={onLukk}>
            {UI.cancel}
          </Knapp>
          <Knapp onClick={onBekreft} disabled={publiserer}>
            {publiserer ? UI.publishing : UI.publish}
          </Knapp>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
