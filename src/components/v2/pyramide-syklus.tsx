"use client";

/**
 * PyramideSyklusChip — trykk-for-å-bla pyramide-område på en enkelt drill.
 * Ett trykk sykler FYS→TEK→SLAG→SPILL→TURN→FYS. Optimistisk: UI oppdateres med
 * en gang, lagringen skjer i bakgrunnen, og rulles tilbake ved feil. Speiler
 * AkseChip sitt visuelle uttrykk (kategorifarge-prikk + sentence-case navn),
 * men som knapp med kategorifarget kant så den leser som interaktiv.
 *
 * Read-only fallback: uten `onEndre` (ingen skrive-tilgang) rendres en vanlig
 * AkseChip i stedet — ærlig, ingen død knapp.
 */

import { useState, useTransition } from "react";
import { T } from "@/lib/v2/tokens";
import type { AkseKey } from "@/lib/v2/tokens";
import { AKSE_NAVN, AkseChip } from "./core";

const SYKLUS: AkseKey[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];

export interface PyramideSyklusChipProps {
  verdi: AkseKey;
  /** Kalles med neste område. Utelatt → skrivebeskyttet visning (AkseChip). */
  onEndre?: (neste: AkseKey) => Promise<{ ok: boolean; error?: string }>;
}

export function PyramideSyklusChip({ verdi, onEndre }: PyramideSyklusChipProps) {
  const [lokal, setLokal] = useState<AkseKey>(verdi);
  const [feil, setFeil] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!onEndre) return <AkseChip a={verdi} />;

  const bla = () => {
    const neste = SYKLUS[(SYKLUS.indexOf(lokal) + 1) % SYKLUS.length];
    const forrige = lokal;
    setLokal(neste); // optimistisk
    setFeil(false);
    startTransition(async () => {
      const res = await onEndre(neste);
      if (!res.ok) {
        setLokal(forrige); // rulle tilbake
        setFeil(true);
      }
    });
  };

  const farge = T.ax[lokal] || T.mut;
  return (
    <button
      type="button"
      onClick={bla}
      disabled={pending}
      aria-label={`Pyramide-område: ${AKSE_NAVN[lokal]}. Trykk for å bytte.`}
      title="Trykk for å bytte område"
      className="v2-press v2-focus"
      style={{
        appearance: "none",
        cursor: pending ? "default" : "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontFamily: T.mono,
        fontSize: 9,
        fontWeight: 700,
        color: feil ? T.down : T.fg2,
        background: `color-mix(in srgb,${farge} 12%,transparent)`,
        border: `1px solid ${feil ? T.down : `color-mix(in srgb,${farge} 45%,transparent)`}`,
        borderRadius: 5,
        padding: "3px 7px",
        opacity: pending ? 0.6 : 1,
        transition: "opacity 120ms",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: 9999, background: farge }} />
      {AKSE_NAVN[lokal] || lokal}
    </button>
  );
}
