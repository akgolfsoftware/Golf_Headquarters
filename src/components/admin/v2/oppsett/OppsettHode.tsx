/**
 * Oppsett-hodet: «Academy · Oppsett» + fanerad (MASTERPLAN 15.3).
 * Samme mønster som OppgaverHode/KoHode — ekte lenker med `?fane=`, ikke
 * klient-state, så serveren laster kun fanen du faktisk ser.
 */

import Link from "next/link";
import { TL } from "@/lib/v2/train-lock";
import { TlCaps } from "@/components/admin/v2/godkjenninger/tl-inspektor";
import { oppsettHref, type OppsettFane, type OppsettFaneId } from "@/lib/admin/oppsett/faner";

const PRESS =
  "motion-safe:transition-transform motion-safe:duration-[180ms] motion-safe:ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]";

export function OppsettHode({
  faner,
  aktiv,
}: {
  faner: OppsettFane[];
  aktiv: OppsettFaneId;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <TlCaps>Academy</TlCaps>
        <h1 style={{ margin: "6px 0 0", fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em", color: TL.text }}>
          Oppsett
        </h1>
        <p style={{ margin: "8px 0 0", maxWidth: "62ch", fontSize: 13, lineHeight: 1.55, color: TL.mute }}>
          Åtte sider ble åtte faner. Samme innhold, én adresse.
        </p>
      </div>

      <nav aria-label="Oppsett-faner" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {faner.map((f) => {
          const er = f.id === aktiv;
          return (
            <Link
              key={f.id}
              href={oppsettHref(f.id)}
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
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
