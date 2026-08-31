/**
 * Turnering-hodet: «Academy · Turnering» + fanerad + «Ny turnering»-CTA
 * (MASTERPLAN 15.6).
 *
 * Canvas (designsystem/canvas/agencyos-ia/Turnering.dc.html) tegner «Ny
 * turnering» som en CTA i toppbaren, atskilt fra fane-pillene. V2Shell har
 * ingen egen topplinje-CTA-plass (samme situasjon som Kø/Oppgaver), så CTA-en
 * plasseres her — til høyre for tittelen — i stedet for i en ny V2Shell-prop.
 *
 * Fanene er ekte lenker med `?fane=`, ikke klient-state — samme mønster som
 * KoHode/OppgaverHode.
 */

import Link from "next/link";
import { TL } from "@/lib/v2/train-lock";
import { TlCaps } from "../godkjenninger/tl-inspektor";
import { TlKnapp } from "../oppsett/tl-kit";
import { turneringHref, type TurneringFane, type TurneringFaneId } from "@/lib/admin/turnering/faner";

const PRESS =
  "motion-safe:transition-transform motion-safe:duration-[180ms] motion-safe:ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]";

export function TurneringHode({
  faner,
  aktiv,
  antall,
}: {
  faner: TurneringFane[];
  aktiv: TurneringFaneId;
  /** Antall per fane. Mangler et tall (f.eks. «Kart»), vises ingen teller. */
  antall: Partial<Record<TurneringFaneId, number>>;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div>
          <TlCaps>Academy</TlCaps>
          <h1 style={{ margin: "6px 0 0", fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em", color: TL.text }}>Turnering</h1>
          <p style={{ margin: "8px 0 0", maxWidth: "60ch", fontSize: 13, lineHeight: 1.55, color: TL.mute }}>
            Liste, ny, dubletter og kart på én adresse. Dubletter vises også som sak-type i Kø — verktøyet bor her.
          </p>
        </div>
        <TlKnapp href="/admin/tournaments/ny" icon="plus" variant="primaer">
          Ny turnering
        </TlKnapp>
      </div>

      <nav aria-label="Turnering-faner" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {faner.map((f) => {
          const er = f.id === aktiv;
          const n = antall[f.id];
          return (
            <Link
              key={f.id}
              href={turneringHref(f.id)}
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
