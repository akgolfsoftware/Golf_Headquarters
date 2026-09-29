/**
 * Precision Athletics — grunnkomponenter for Innboks (AG-04). Legges her og
 * ikke i pa.tsx for å unngå konflikt med de andre bolkene.
 *
 * Samme klasser som designets komponenter (Claude Design 7d7c2994):
 * forms/ChoicePill.jsx (pa-choice), display/Avatar.jsx (pa-avatar),
 * navigation/PageHeader.jsx (pa-pagehead med handlinger), og
 * ui_kits/agencyos/ag-parts.jsx › Draft (utkastmerket). Egne stiler i
 * src/styles/precision-a7.css.
 */
import type { ComponentProps, ReactNode } from "react";

const cx = (...a: Array<string | false | null | undefined>) => a.filter(Boolean).join(" ");

/** ChoicePill — filterpille. `aria-pressed` bærer valgt tilstand. */
export function Valgpille({ valgt, children, className, ...rest }: { valgt: boolean; children: ReactNode } & Omit<ComponentProps<"button">, "children">) {
  return <button type="button" aria-pressed={valgt} className={cx("pa-choice", className)} {...rest}>{children}</button>;
}

/** Avatar med initialer. */
export function Avatar({ navn, size = 32 }: { navn: string; size?: number }) {
  const i = navn.split(/\s+/).filter(Boolean).slice(0, 2).map((d) => d[0]!.toUpperCase()).join("");
  return <span className="pa-avatar" style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }} aria-hidden>{i || "—"}</span>;
}

/** Utkastmerket (stiplet): «Utkast · Jarvis». */
export function UtkastMerke({ children }: { children: ReactNode }) {
  return <span className="pa-a7-utkast">{children}</span>;
}

/** Sidehode med handlinger til høyre (PageHeader › actions). */
export function SidehodeMedHandling({ kicker, tittel, handlinger }: { kicker?: ReactNode; tittel: ReactNode; handlinger?: ReactNode }) {
  return <header className="pa-pagehead"><div className="pa-pagehead__row">
    <div className="pa-pagehead__text">
      {kicker && <div className="kicker pa-pagehead__kicker">{kicker}</div>}
      <h1 className="pa-pagehead__title">{tittel}</h1>
    </div>
    {handlinger && <div className="pa-pagehead__actions">{handlinger}</div>}
  </div></header>;
}

/** Flerlinjers tekstfelt med Precision-kontrollens kant og fokus. */
export function Tekstomrade({ className, ...rest }: ComponentProps<"textarea">) {
  return <textarea className={cx("pa-a7-textarea", className)} {...rest} />;
}
