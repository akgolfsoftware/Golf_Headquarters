/**
 * Kø-hodet: «Academy · Kø» + fanerad (MASTERPLAN 15.1).
 *
 * Fanene er ekte lenker med `?fane=`, ikke klient-state. Da laster serveren
 * kun den fanen du faktisk ser — og adressen forblir én, slik beslutning 6.9
 * krever. Fasit for pillene: samme kilde-filter som godkjenninger-flaten
 * allerede bruker (aktiv = TL.fill/TL.onFill, resten TL.dim).
 *
 * Server-komponent: ingen interaktivitet utover navigasjon.
 */

import Link from "next/link";
import { TL } from "@/lib/v2/train-lock";
import { TlCaps } from "@/components/admin/v2/godkjenninger/tl-inspektor";
import { koHref, type KoFane, type KoFaneId } from "@/lib/admin/ko/faner";

const PRESS =
  "motion-safe:transition-transform motion-safe:duration-[180ms] motion-safe:ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]";

export function KoHode({
  faner,
  aktiv,
  antall,
}: {
  faner: KoFane[];
  aktiv: KoFaneId;
  /** Antall per fane. Mangler et tall, vises ingen teller — aldri en gjettet null. */
  antall: Partial<Record<KoFaneId, number>>;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <TlCaps>Academy</TlCaps>
        <h1
          style={{
            margin: "6px 0 0",
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: "-0.01em",
            color: TL.text,
          }}
        >
          Kø
        </h1>
        <p
          style={{
            margin: "8px 0 0",
            maxWidth: "60ch",
            fontSize: 13,
            lineHeight: 1.55,
            color: TL.mute,
          }}
        >
          Alt som krever deg i dag. Én adresse — fanene bytter innhold, ikke side.
        </p>
      </div>

      <nav
        aria-label="Kø-faner"
        style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
      >
        {faner.map((f) => {
          const er = f.id === aktiv;
          const n = antall[f.id];
          return (
            <Link
              key={f.id}
              href={koHref(f.id)}
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
                <span style={{ fontVariantNumeric: "tabular-nums", opacity: 0.75 }}>
                  {n}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
