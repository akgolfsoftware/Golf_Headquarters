import Link from "next/link";
import { TL } from "@/lib/v2/train-lock";


export type LiveLoopSteg = "for" | "under" | "etter";

/**
 * FØR → UNDER → ETTER — Paper-fasit (playerhq-live-*.html .loop).
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
      data-paper-loop
      data-paper-wave-c="live-loop"
      style={{
        display: "flex",
        alignItems: "stretch",
        width: "100%",
        borderBottom: `1px solid ${TL.hair}`,
        background: TL.scene,
        marginBottom: 4,
      }}
    >
      {steg.map((s, i) => {
        const on = s.id === aktiv;
        const inner = (
          <span
            style={{
              display: "flex",
              flex: 1,
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 52,
              padding: "8px 4px",
              borderBottom: on ? `2px solid ${TL.fill}` : "2px solid transparent",
              color: on ? TL.text : TL.mute,
              fontFamily: TL.font.mono,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              textAlign: "center",
            }}
          >
            <span>{s.label}</span>
            <span
              style={{
                fontFamily: TL.font.sans,
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: 0,
                textTransform: "none",
                color: on ? TL.mute : TL.mute,
                marginTop: 2,
              }}
            >
              {s.sub}
            </span>
          </span>
        );
        return (
          <span key={s.id} style={{ display: "flex", flex: 1, alignItems: "stretch" }}>
            {s.href && !on ? (
              <Link href={s.href} style={{ flex: 1, display: "flex", textDecoration: "none" }} data-od-id={`loop-${s.id}`}>
                {inner}
              </Link>
            ) : (
              <span style={{ flex: 1, display: "flex" }} aria-current={on ? "step" : undefined} data-od-id={`loop-${s.id}`}>
                {inner}
              </span>
            )}
            {i < steg.length - 1 && (
              <span style={{ color: TL.mute, fontSize: 10, alignSelf: "center", padding: "0 2px", flex: "none" }} aria-hidden>
                →
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
