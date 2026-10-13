import type { CSSProperties, ReactNode } from "react";
/** Vanlige ord bruker lesbar tekstfont. Tall beholder egne datakomponenter. */
export function CoachLabel({ children, style, color }: { children?: ReactNode; size?: number; color?: string; style?: CSSProperties }) {
  return <span style={{ font: "500 13px/1.5 var(--font-sans)", letterSpacing: 0, color: color ?? "var(--text-secondary)", ...style, textTransform: "none" }}>{children}</span>;
}
