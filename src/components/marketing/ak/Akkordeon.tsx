"use client";

import { useId, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

/* Kilde: designsystem/ak-golf/components/flate/Akkordeon.jsx.
   Spørsmål og svar. Ett åpent av gangen som standard. Pluss-tegnet blir
   signalrødt når posten er åpen. */

export type Akkordeonpost = { tittel: string; innhold: ReactNode };

export function Akkordeon({
  poster = [],
  apenIndeks = -1,
  flerAvGangen = false,
  style,
}: {
  poster?: Akkordeonpost[];
  apenIndeks?: number;
  flerAvGangen?: boolean;
  style?: CSSProperties;
}) {
  const [apne, setApne] = useState<number[]>(apenIndeks >= 0 ? [apenIndeks] : []);
  const grunnId = useId();
  const veksle = (i: number) =>
    setApne((f) => (f.includes(i) ? f.filter((x) => x !== i) : flerAvGangen ? [...f, i] : [i]));

  return (
    <div style={{ borderTop: "1px solid var(--ak-linje-hard)", ...style }}>
      {poster.map((p, i) => {
        const apen = apne.includes(i);
        const innholdId = `${grunnId}-${i}`;
        return (
          <div key={p.tittel} style={{ borderBottom: "1px solid var(--ak-linje)" }}>
            <button
              type="button"
              onClick={() => veksle(i)}
              aria-expanded={apen}
              aria-controls={innholdId}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "var(--ak-r-4)",
                background: "transparent",
                border: 0,
                cursor: "pointer",
                textAlign: "left",
                padding: "var(--ak-r-4) 0",
                minHeight: "var(--ak-treff)",
                fontFamily: "var(--ak-sans)",
                fontSize: "var(--ak-t-17)",
                fontWeight: 500,
                color: "var(--ak-tekst)",
              }}
            >
              {p.tittel}
              <span
                aria-hidden="true"
                style={{
                  flex: "0 0 auto",
                  width: 16,
                  height: 16,
                  position: "relative",
                  color: apen ? "var(--ak-signal)" : "var(--ak-dempet)",
                }}
              >
                <span style={{ position: "absolute", top: 7, left: 0, width: 16, height: 2, background: "currentColor" }} />
                <span
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 7,
                    width: 2,
                    height: 16,
                    background: "currentColor",
                    transform: apen ? "scaleY(0)" : "scaleY(1)",
                    transition: "transform var(--ak-fart-mid) var(--ak-kurve)",
                  }}
                />
              </span>
            </button>
            <div
              id={innholdId}
              style={{
                display: "grid",
                gridTemplateRows: apen ? "1fr" : "0fr",
                transition: "grid-template-rows var(--ak-fart-mid) var(--ak-kurve)",
              }}
            >
              <div style={{ overflow: "hidden" }}>
                <div
                  style={{
                    paddingBottom: "var(--ak-r-5)",
                    color: "var(--ak-dempet)",
                    fontSize: "var(--ak-t-17)",
                    maxWidth: "62ch",
                  }}
                >
                  {p.innhold}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
