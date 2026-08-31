/**
 * Kalender-hodet: «Academy · Kalender» + fanerad + «Ny hendelse»-CTA
 * (MASTERPLAN 15.4).
 *
 * Canvas (designsystem/canvas/agencyos-ia/Kalender.dc.html) tegner «Ny
 * hendelse» som CTA i toppbaren, atskilt fra fane-pillene. V2Shell har ingen
 * topplinje-CTA-plass (samme situasjon som Kø/Oppgaver/Turnering), så CTA-en
 * plasseres her — til høyre for tittelen.
 *
 * Fanene er ekte lenker med `?fane=`, ikke klient-state — samme mønster som
 * KoHode/OppgaverHode/TurneringHode.
 */

import Link from "next/link";
import { TL } from "@/lib/v2/train-lock";
import { TlCaps } from "../godkjenninger/tl-inspektor";
import { TlKnapp } from "../oppsett/tl-kit";
import { kalenderHref, type KalenderFane, type KalenderFaneId } from "@/lib/admin/kalender/faner";

const PRESS =
  "motion-safe:transition-transform motion-safe:duration-[180ms] motion-safe:ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]";

export function KalenderHode({
  faner,
  aktiv,
}: {
  faner: KalenderFane[];
  aktiv: KalenderFaneId;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div>
          <TlCaps>Academy</TlCaps>
          <h1 style={{ margin: "6px 0 0", fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em", color: TL.text }}>Kalender</h1>
          <p style={{ margin: "8px 0 0", maxWidth: "60ch", fontSize: 13, lineHeight: 1.55, color: TL.mute }}>
            Uke, måned og dag er visninger av det samme — ikke tre sider. Stall-dag viser hver spillers dag.
          </p>
        </div>
        <TlKnapp href="/admin/kalender/hendelse/ny" icon="plus" variant="primaer">
          Ny hendelse
        </TlKnapp>
      </div>

      <nav aria-label="Kalender-faner" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {faner.map((f) => {
          const er = f.id === aktiv;
          return (
            <Link
              key={f.id}
              href={kalenderHref(f.id)}
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
              {f.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
