import Link from "next/link";
import { T } from "@/lib/v2/tokens";

export type LiveLoopSteg = "for" | "under" | "etter";

/**
 * FØR → UNDER → ETTER — Paper-fasiten (playerhq-live-*.html).
 * Kun visuell posisjon; navigasjon til reelle ruter når sessionId finnes.
 */
export function LiveLoopNav({
  aktiv,
  sessionId,
}: {
  aktiv: LiveLoopSteg;
  sessionId?: string;
}) {
  const base = sessionId ? `/portal/live/${sessionId}` : null;
  const steg: Array<{ id: LiveLoopSteg; label: string; sub: string; href: string | null }> = [
    { id: "for", label: "FØR", sub: "planlegg", href: base ? `${base}/brief` : null },
    { id: "under", label: "UNDER", sub: "live-økt", href: base ? `${base}/active` : null },
    { id: "etter", label: "ETTER", sub: "oppsummer", href: base ? `${base}/summary` : null },
  ];

  return (
    <nav
      aria-label="Sløyfen før, under og etter økta"
      style={{
        display: "flex",
        alignItems: "stretch",
        gap: 4,
        padding: "8px 0 12px",
      }}
    >
      {steg.map((s, i) => {
        const on = s.id === aktiv;
        const inner = (
          <span
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 44,
              flex: 1,
              borderRadius: 8,
              background: on ? T.panel2 : "transparent",
              color: on ? T.fg : T.mut,
              fontFamily: T.mono,
              fontSize: 10,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              textDecoration: "none",
              border: on ? `1px solid ${T.border}` : "1px solid transparent",
            }}
          >
            <span style={{ fontWeight: 700 }}>{s.label}</span>
            <span style={{ fontSize: 9, opacity: 0.75, marginTop: 2, textTransform: "none", letterSpacing: 0 }}>
              {s.sub}
            </span>
          </span>
        );
        return (
          <span key={s.id} style={{ display: "contents" }}>
            {s.href && !on ? (
              <Link href={s.href} style={{ flex: 1, textDecoration: "none" }} aria-current={on ? "step" : undefined}>
                {inner}
              </Link>
            ) : (
              <span style={{ flex: 1 }} aria-current={on ? "step" : undefined}>
                {inner}
              </span>
            )}
            {i < steg.length - 1 && (
              <span style={{ alignSelf: "center", color: T.border, fontSize: 12, padding: "0 2px" }} aria-hidden>
                →
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
