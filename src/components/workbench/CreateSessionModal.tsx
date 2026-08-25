"use client";

/**
 * CreateSessionModal — «Ny økt» (natt-plan Loop 2).
 *
 * Feltene nullstilles ved å remonte komponenten (`key` i WorkbenchUke), ikke
 * med en effekt — hver åpning starter fra klikkpunktet i uka.
 *
 * Minimumsfelter per docs/natt/workbench/ui/components.md: tittel, dato,
 * start, varighet, område. Alt annet (drills, kilder, formel) kommer i 2S/2T.
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
import { Knapp } from "@/components/v2/core";
import { T } from "@/lib/v2/tokens";
import { formatTime, PYRAMID_LABEL, UI } from "@/lib/domain/workbench/labels";
import type { PyramidArea } from "@/lib/domain/workbench/types";

const PYRAMIDER: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];
const VARIGHETER = [30, 45, 60, 90, 120, 180];

export type NyOktVerdier = {
  title: string;
  date: string;
  startMinute: number;
  durationMinutes: number;
  pyramid: PyramidArea;
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
  const [pyramid, setPyramid] = useState<PyramidArea>("TEK");
  const [feil, setFeil] = useState<string | null>(null);

  function send() {
    const rensetTittel = tittel.trim();
    if (!rensetTittel) {
      setFeil("Økten må ha en tittel.");
      return;
    }
    const [t, m] = start.split(":");
    const startMin = Number(t) * 60 + Number(m);
    if (!Number.isFinite(startMin)) {
      setFeil("Ugyldig starttidspunkt.");
      return;
    }
    setFeil(null);
    onOpprett({
      title: rensetTittel,
      date: dag,
      startMinute: startMin,
      durationMinutes: varighet,
      pyramid,
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onLukk()}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>{UI.createSession}</DialogTitle>
          <DialogDescription>
            Økten lagres som utkast. Den er kun synlig for deg til du publiserer.
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <div style={{ display: "grid", gap: 14 }}>
            <Felt label="Tittel">
              <Input
                value={tittel}
                onChange={(e) => setTittel(e.target.value)}
                placeholder="F.eks. Wedge 60–100 m"
                autoFocus
              />
            </Felt>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Felt label="Dato">
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

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Felt label={UI.duration}>
                <Select value={varighet} onChange={(e) => setVarighet(Number(e.target.value))}>
                  {VARIGHETER.map((v) => (
                    <option key={v} value={v}>
                      {v} min
                    </option>
                  ))}
                </Select>
              </Felt>
              <Felt label={UI.pyramid}>
                <Select
                  value={pyramid}
                  onChange={(e) => setPyramid(e.target.value as PyramidArea)}
                >
                  {PYRAMIDER.map((p) => (
                    <option key={p} value={p}>
                      {PYRAMID_LABEL[p]}
                    </option>
                  ))}
                </Select>
              </Felt>
            </div>

            {feil && (
              <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.down, margin: 0 }}>{feil}</p>
            )}
          </div>
        </DialogBody>

        <DialogFooter>
          <Knapp ghost onClick={onLukk}>
            {UI.cancel}
          </Knapp>
          <Knapp onClick={send} disabled={lagrer}>
            {lagrer ? "Oppretter …" : "Opprett"}
          </Knapp>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Felt({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "grid", gap: 6, minWidth: 0 }}>
      <span
        style={{
          fontFamily: T.mono,
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          color: T.mut,
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}
