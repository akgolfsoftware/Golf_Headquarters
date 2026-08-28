"use client";

/**
 * CreateSessionModal — «Ny økt» (natt-plan Loop 2, PX-2).
 *
 * Fasit: designsystem/train-lock/A-03 Ny okt modal.dc.html:
 * 560 px modal, tittel 26/700 + undertekst 13 mute, caps-etiketter
 * 11/600/0.08em, felt 44 px #1C1C1E radius 12, «ingen formel her» — hintet
 * «Formelen settes på første drill etter Lagre — ikke her.» erstatter
 * pyramide-valget og drill-editoren (formelen settes i inspektøren etterpå;
 * økten opprettes med TEK som midlertidig dominant område). Footer = Avbryt
 * som ren tekst + den ene hvite «Lagre økt»-pillen (44 px).
 *
 * Kjente avvik (PX-2): fasitens Deltakere-pills (Individuell/Gruppe …),
 * «Hent fra biblioteket», Dag-flervalg og Sted-feltet er ikke bygget —
 * dato/gjenta-feltene bærer funksjonen.
 *
 * Feltene nullstilles ved å remonte komponenten (`key` i WorkbenchUke).
 * Nye økter er alltid UTKAST — spilleren ser dem først etter publisering.
 */

import { useState } from "react";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TL } from "@/lib/v2/train-lock";

import { formatTime, UI } from "@/lib/domain/workbench/labels";
import type { AKFormel, PyramidArea } from "@/lib/domain/workbench/types";

const VARIGHETER = [30, 45, 60, 90, 120, 180];
const GJENTA_UKER = [1, 2, 4, 6, 8, 12];

export type NyOktDrillVerdier = {
  title: string;
  durationMinutes: number;
  akFormel: AKFormel;
  description?: string;
};

export type NyOktVerdier = {
  title: string;
  date: string;
  startMinute: number;
  durationMinutes: number;
  pyramid: PyramidArea;
  drills?: NyOktDrillVerdier[];
  /** > 1 → opprett som ukentlig serie (B5). 1 = ingen gjentagelse. */
  repeatWeeks: number;
};

type Props = {
  open: boolean;
  /** Forhåndsutfylt fra klikk i uka. */
  dato: string;
  startMinutt: number;
  lagrer: boolean;
  onLukk: () => void;
  onOpprett: (verdier: NyOktVerdier) => void;
};

export function CreateSessionModal({
  open,
  dato,
  startMinutt,
  lagrer,
  onLukk,
  onOpprett,
}: Props) {
  const [tittel, setTittel] = useState("");
  const [dag, setDag] = useState(dato);
  const [start, setStart] = useState(formatTime(startMinutt));
  const [varighet, setVarighet] = useState(60);
  const [gjentaUker, setGjentaUker] = useState(1);
  const [feil, setFeil] = useState<string | null>(null);

  function send() {
    const rensetTittel = tittel.trim();
    if (!rensetTittel) {
      setFeil(UI.titleRequired);
      return;
    }
    const [t, m] = start.split(":");
    const startMin = Number(t) * 60 + Number(m);
    if (!Number.isFinite(startMin)) {
      setFeil(UI.invalidStartTime);
      return;
    }
    setFeil(null);
    onOpprett({
      title: rensetTittel,
      date: dag,
      startMinute: startMin,
      durationMinutes: varighet,
      // A-03: «ingen formel her» — TEK som midlertidig dominant område;
      // formelen settes på første drill i inspektøren etterpå.
      pyramid: "TEK",
      repeatWeeks: gjentaUker,
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onLukk()}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>{UI.createSession}</DialogTitle>
          <DialogDescription>{UI.createSessionBody}</DialogDescription>
        </DialogHeader>

        <DialogBody>
          <div style={{ display: "grid", gap: 14 }}>
            <Felt label={UI.titleField}>
              <Input
                value={tittel}
                onChange={(e) => setTittel(e.target.value)}
                placeholder={UI.titlePlaceholder}
                autoFocus
              />
            </Felt>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Felt label={UI.dateField}>
                <Input type="date" value={dag} onChange={(e) => setDag(e.target.value)} />
              </Felt>
              <Felt label={UI.start}>
                <Input
                  type="time"
                  step={1800}
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                />
              </Felt>
            </div>

            <Felt label={UI.duration}>
              <Select value={varighet} onChange={(e) => setVarighet(Number(e.target.value))}>
                {VARIGHETER.map((v) => (
                  <option key={v} value={v}>
                    {v} min
                  </option>
                ))}
              </Select>
            </Felt>

            <Felt label={UI.repeatLabel}>
              <Select value={gjentaUker} onChange={(e) => setGjentaUker(Number(e.target.value))}>
                {GJENTA_UKER.map((n) => (
                  <option key={n} value={n}>
                    {n === 1 ? UI.repeatOnce : UI.repeatWeeks(n)}
                  </option>
                ))}
              </Select>
            </Felt>

            {/* A-03: «Formelen settes på første drill etter Lagre — ikke her.» */}
            <p style={{ fontFamily: TL.font.sans, fontSize: 11, color: TL.mute, margin: 0 }}>
              {UI.createSessionFormelHint}
            </p>

            {feil && (
              <p style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.danger, margin: 0 }}>{feil}</p>
            )}
          </div>
        </DialogBody>

        {/* A-03: Avbryt som ren tekst + den ene hvite «Lagre økt»-pillen. */}
        <DialogFooter className="gap-4">
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
          <button
            type="button"
            onClick={lagrer ? undefined : send}
            disabled={lagrer}
            className="v2-press v2-focus"
            style={{
              appearance: "none",
              height: 44,
              borderRadius: 9999,
              border: "none",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 26px",
              fontFamily: TL.font.sans,
              fontSize: 16,
              fontWeight: 700,
              whiteSpace: "nowrap",
              cursor: lagrer ? "default" : "pointer",
              background: lagrer ? TL.dim : TL.fill,
              color: lagrer ? TL.mute : TL.onFill,
            }}
          >
            {lagrer ? UI.creating : UI.createSave}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* Fasit A-03: caps-etikett 11/600/0.08em over feltet. */
function Felt({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "grid", gap: 6, minWidth: 0 }}>
      <span
        style={{
          fontFamily: TL.font.sans,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: TL.mute,
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}
