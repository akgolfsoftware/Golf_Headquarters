/**
 * Analyse (Innsikt) — hodet: «Academy · Innsikt» + fanerad (MASTERPLAN 15.8).
 *
 * Fanene er ekte lenker med `?fane=`, ikke klient-state — samme mønster som
 * KommunikasjonHode/OppgaverHode/TurneringHode.
 */

import Link from "next/link";
import { TL } from "@/lib/v2/train-lock";
import { analyseHref, type AnalyseFane, type AnalyseFaneId } from "@/lib/admin/analyse/faner";

const PRESS =
  "motion-safe:transition-transform motion-safe:duration-[180ms] motion-safe:ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]";

export function AnalyseHode({
  faner,
  aktiv,
  antall,
}: {
  faner: AnalyseFane[];
  aktiv: AnalyseFaneId;
  /** Antall per fane. Mangler et tall, vises ingen teller. */
  antall: Partial<Record<AnalyseFaneId, number>>;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <span
          style={{
            fontSize: 11,
            fontWeight: TL.vekt.caps,
            letterSpacing: TL.track.capsSm,
            textTransform: "uppercase",
            color: TL.mute,
          }}
        >
          Academy
        </span>
        <h1 style={{ margin: "6px 0 0", fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em", color: TL.text }}>Innsikt</h1>
        <p style={{ margin: "8px 0 0", maxWidth: "62ch", fontSize: 13, lineHeight: 1.55, color: TL.mute }}>
          Referansen er spilleren selv, ikke jevnaldrende og ikke proffnivå. Kohort-sammenligning er
          coachens verktøy alene — den vises aldri til spiller eller forelder.
        </p>
      </div>

      <nav aria-label="Innsikt-faner" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {faner.map((f) => {
          const er = f.id === aktiv;
          const n = antall[f.id];
          return (
            <Link
              key={f.id}
              href={analyseHref(f.id)}
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
                <span style={{ fontVariantNumeric: "tabular-nums", opacity: 0.75 }}>{n.toLocaleString("nb-NO")}</span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
