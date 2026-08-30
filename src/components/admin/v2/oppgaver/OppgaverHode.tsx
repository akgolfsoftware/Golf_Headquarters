/**
 * Oppgaver-hodet: «Academy · Oppgaver» + fanerad (MASTERPLAN 15.2).
 * Samme mønster som KoHode — ekte lenker med `?fane=`, ikke klient-state,
 * så serveren laster kun fanen du faktisk ser.
 */

import Link from "next/link";
import { TL } from "@/lib/v2/train-lock";
import { TlCaps } from "@/components/admin/v2/godkjenninger/tl-inspektor";
import { oppgaveHref, type OppgaveFane, type OppgaveFaneId } from "@/lib/admin/oppgaver/faner";

const PRESS =
  "motion-safe:transition-transform motion-safe:duration-[180ms] motion-safe:ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]";

export function OppgaverHode({
  faner,
  aktiv,
  antall,
}: {
  faner: OppgaveFane[];
  aktiv: OppgaveFaneId;
  antall: Partial<Record<OppgaveFaneId, number>>;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <TlCaps>Academy</TlCaps>
        <h1 style={{ margin: "6px 0 0", fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em", color: TL.text }}>
          Oppgaver
        </h1>
        <p style={{ margin: "8px 0 0", maxWidth: "62ch", fontSize: 13, lineHeight: 1.55, color: TL.mute }}>
          Prosjektstyring og faste rutiner. Kø er det som krever deg i dag — Oppgaver er
          det som går på skinner.
        </p>
      </div>

      <nav aria-label="Oppgave-faner" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {faner.map((f) => {
          const er = f.id === aktiv;
          const n = antall[f.id];
          return (
            <Link
              key={f.id}
              href={oppgaveHref(f.id)}
              aria-current={er ? "page" : undefined}
              className={PRESS}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                height: 40,
                padding: "0 16px",
                borderRadius: TL.radius.pill,
                background: er ? TL.fill : TL.dim,
                color: er ? TL.onFill : TL.text,
                fontSize: 13,
                fontWeight: 600,
                whiteSpace: "nowrap",
                textDecoration: "none",
              }}
            >
              <span>{f.label}</span>
              {n !== undefined && (
                <span style={{ fontVariantNumeric: "tabular-nums", opacity: 0.75 }}>{n}</span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
