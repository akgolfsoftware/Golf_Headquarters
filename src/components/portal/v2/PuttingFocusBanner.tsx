/**
 * Putting brain teaser — shows derived focus from PuttingSignals.
 * Never lists drills (FASIT may be empty). CTA ghost → putte-lab.
 */
import Link from "next/link";
import type { PuttingFocus, PuttingSignals } from "@/lib/masterbrain/putting-signals";
import { derivePuttingFocus } from "@/lib/masterbrain/putting-signals";
import { T, Caps, Knapp } from "@/components/v2";

export function PuttingFocusBanner({
  signals,
  focus: focusIn,
}: {
  signals?: PuttingSignals | null;
  focus?: PuttingFocus | null;
}) {
  const focus =
    focusIn ??
    (signals
      ? derivePuttingFocus(signals)
      : derivePuttingFocus({
          sgPutt: null,
          makePctInside8: null,
          threePuttRate: null,
          tags: [],
          level: null,
        }));

  return (
    <section
      data-od-id="putting-focus-banner"
      data-paper-en-ting="putting-lab"
      style={{
        borderRadius: 12,
        border: `1px solid ${T.border}`,
        background: T.panel,
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <Caps size={9} style={{ color: T.mut }}>
          Putting · fokus
        </Caps>
        <span
          style={{
            fontFamily: T.mono,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: focus.confidence === "high" ? T.fg : T.mut,
          }}
        >
          {focus.confidence === "high" ? "Høy" : focus.confidence === "medium" ? "Middels" : "Lav"} signal
        </span>
      </div>
      <p
        style={{
          margin: 0,
          fontFamily: T.disp,
          fontSize: 15,
          fontWeight: 500,
          color: T.fg,
          lineHeight: 1.35,
        }}
      >
        {focus.coachLineNb}
      </p>
      <p style={{ margin: 0, fontFamily: T.ui, fontSize: 12.5, color: T.mut, lineHeight: 1.4 }}>
        Drills hentes kun fra godkjent bank. Tom bank = ingen forslag.
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Link href="/portal/trening/putte-laboratoriet" style={{ textDecoration: "none" }}>
          <Knapp>Åpne putte-lab</Knapp>
        </Link>
      </div>
    </section>
  );
}
