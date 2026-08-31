/**
 * Stall-hodet: «Academy · Stall» + fanerad (MASTERPLAN 15.11).
 * Samme mønster som OppgaverHode/TurneringHode — ekte lenker med `?fane=`,
 * ikke klient-state, så serveren laster kun fanen du faktisk ser.
 */

import Link from "next/link";
import { TL } from "@/lib/v2/train-lock";
import { spillereHref, type SpillereFane, type SpillereFaneId } from "@/lib/admin/spillere/faner";

const PRESS =
  "motion-safe:transition-transform motion-safe:duration-[180ms] motion-safe:ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]";

function CapsLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: TL.mute,
      }}
    >
      {children}
    </span>
  );
}

export function SpillereHode({
  faner,
  aktiv,
}: {
  faner: SpillereFane[];
  aktiv: SpillereFaneId;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <CapsLabel>Academy</CapsLabel>
        <h1 style={{ margin: "6px 0 0", fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em", color: TL.text }}>
          Stall
        </h1>
        <p style={{ margin: "8px 0 0", maxWidth: "62ch", fontSize: 13, lineHeight: 1.55, color: TL.mute }}>
          Navn, neste økt, siste aktivitet, én prikk. Ikke mer — resten bor i spillerkortet.
        </p>
      </div>

      <nav aria-label="Stall-faner" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {faner.map((f) => {
          const er = f.id === aktiv;
          return (
            <Link
              key={f.id}
              href={spillereHref(f.id)}
              aria-current={er ? "page" : undefined}
              className={PRESS}
              style={{
                display: "inline-flex",
                alignItems: "center",
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
              {f.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
