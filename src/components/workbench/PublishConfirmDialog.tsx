"use client";

/**
 * PublishConfirmDialog — bekreftelse før publisering (natt-plan Loop 2, PX-2;
 * per-økt-utvelgelse Ø10, 02.09.2026, Anders' beslutning).
 *
 * Fasit (kanon for struktur, D2 02.09.2026): designsystem/train-lock/WB-03
 * Publish confirm 3 skall.dc.html — checkbox per økt, «Velg alle» med
 * tellelinje, status-caps per rad (UTKAST/OPPTATT), en økt som holdes
 * automatisk tilbake ved overlapp (forhåndsvalgt av), og to separate
 * handlinger «Publiser valgte N» / «Publiser alle N».
 * Fasit (kun Mac-piksel): designsystem/train-lock/A-01d Publish confirm.dc.html
 * — caps-kicker «Uke 36 · Øyvind Rohjan», tittel 26/700/−0.02em, økt-liste
 * som #161616-kort radius 16.
 *
 * Ikke bygget fra WB-03 (ekte datamangel, ikke portefeil): «ENDRET»-status
 * (krever å spore om en allerede publisert-lik økt er redigert siden sist —
 * finnes ikke som felt) og det gule «Mangler drill»-varselet (krever en
 * regel for hva som teller som "mangler" per øktType — ikke definert).
 * Kun UTKAST og OPPTATT (fra validateWeek sine overlapp-notater) bygges.
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
import { Check } from "lucide-react";
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

/** WB-03: 19px firkant-avkrysning — hvit fylt når valgt, hairline-ramme ellers. */
function Avkrysning({ valgt }: { valgt: boolean }) {
  return (
    <span
      aria-hidden
      style={{
        width: 19,
        height: 19,
        flex: "none",
        borderRadius: 5,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: valgt ? TL.fill : "transparent",
        boxShadow: valgt ? "none" : `inset 0 0 0 1.5px ${TL.hair}`,
      }}
    >
      {valgt && <Check size={12} strokeWidth={3} style={{ color: TL.onFill }} />}
    </span>
  );
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
  /** Økt-ider et overlapp-varsel peker på — WB-03: status «Opptatt», forhåndsvalgt av. */
  opptattIder?: Set<string>;
  /** Hvilke økter som er avkrysset for «Publiser valgte». */
  valgte: Set<string>;
  onVeksle: (sessionId: string) => void;
  onVelgAlle: () => void;
  publiserer: boolean;
  onLukk: () => void;
  onPubliserValgte: () => void;
  onPubliserAlle: () => void;
};

export function PublishConfirmDialog({
  open,
  okter,
  idag,
  spillerNavn,
  notater = [],
  opptattIder = new Set(),
  valgte,
  onVeksle,
  onVelgAlle,
  publiserer,
  onLukk,
  onPubliserValgte,
  onPubliserAlle,
}: Props) {
  const iDagAntall = okter.filter((s) => s.date === idag).length;
  const ukeNr = okter[0] ? isoWeekNumber(okter[0].date) : isoWeekNumber(idag);
  const antallValgt = okter.filter((s) => valgte.has(s.id)).length;
  const alleValgt = okter.length > 0 && antallValgt === okter.length;

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

          {/* WB-03: «Velg alle» + tellelinje over listen. */}
          <button
            type="button"
            onClick={onVelgAlle}
            className="v2-focus"
            style={{
              appearance: "none",
              background: "transparent",
              border: "none",
              padding: "0 0 10px",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: `1px solid ${TL.hair}`,
              marginBottom: 4,
              cursor: "pointer",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 11 }}>
              <Avkrysning valgt={alleValgt} />
              <span style={{ fontFamily: TL.font.sans, fontSize: 14, fontWeight: 600, color: TL.text }}>
                {UI.publishVelgAlle}
              </span>
            </span>
            <span style={{ fontFamily: TL.font.sans, fontSize: 12, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>
              {UI.publishValgtAvTotalt(antallValgt, okter.length)}
            </span>
          </button>

          {/* A-01d: økt-listen som #161616-kort radius 16, rader med
              «Tir 16.00» (13 mute, 88 px) + tittel 15/600. WB-03: avkrysning
              + status-caps (UTKAST/OPPTATT) lagt til per rad. */}
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: "2px 18px",
              background: TL.elev,
              borderRadius: 16,
            }}
          >
            {okter.map((s, i) => {
              const opptatt = opptattIder.has(s.id);
              return (
                <li key={s.id} style={{ borderBottom: i < okter.length - 1 ? `1px solid ${TL.hair}` : "none" }}>
                  <button
                    type="button"
                    onClick={() => onVeksle(s.id)}
                    className="v2-focus"
                    style={{
                      appearance: "none",
                      background: "transparent",
                      border: "none",
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "14px 0",
                      minWidth: 0,
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <Avkrysning valgt={valgte.has(s.id)} />
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
                    <span
                      style={{
                        flex: "none",
                        fontFamily: TL.font.sans,
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: TL.mute,
                      }}
                    >
                      {opptatt ? UI.publishRadOpptatt : UI.publishRadUtkast}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </DialogBody>

        {/* WB-03: Avbryt som ren tekst, «Publiser valgte N» (hairline) og
            «Publiser alle N» (den ene hvite pillen). */}
        <DialogFooter className="gap-3">
          <button
            type="button"
            onClick={onLukk}
            className="v2-focus"
            style={{
              appearance: "none",
              background: "transparent",
              border: "none",
              padding: 0,
              marginRight: "auto",
              fontFamily: TL.font.sans,
              fontSize: 15,
              fontWeight: 600,
              color: TL.mute,
              cursor: "pointer",
            }}
          >
            {UI.cancel}
          </button>
          <button
            type="button"
            onClick={onPubliserValgte}
            disabled={publiserer || antallValgt === 0}
            className="v2-focus"
            style={{
              appearance: "none",
              height: 44,
              minHeight: 44,
              borderRadius: 9999,
              padding: "0 20px",
              border: `1px solid ${TL.hair}`,
              background: "transparent",
              color: TL.text,
              fontFamily: TL.font.sans,
              fontSize: 14,
              fontWeight: 600,
              cursor: publiserer || antallValgt === 0 ? "default" : "pointer",
              opacity: antallValgt === 0 ? 0.5 : 1,
            }}
          >
            {publiserer ? UI.publishing : UI.publishValgte(antallValgt)}
          </button>
          <Knapp
            enTing
            onClick={onPubliserAlle}
            disabled={publiserer || okter.length === 0}
            style={{
              height: 48,
              minHeight: 48,
              borderRadius: 9999,
              padding: "0 24px",
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            {publiserer ? UI.publishing : UI.publishAlle(okter.length)}
          </Knapp>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
