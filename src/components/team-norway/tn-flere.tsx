"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

import { tnKnappStil, type TnKnappVariant } from "./tn-handlinger";
import { TnIkon } from "./tn-ikon";
import s from "./tn-stall.module.css";

/**
 * Én primærknapp per flate; resten ligger i «Ny» eller «Mer» (utkast 2, 16.10).
 * Fasit: `.flere` i docs/design-system/utkast-tn/felles/tn.css.
 * Radene er vanlige handlinger (lenker eller skjemaark) med variant «meny».
 * Lista holdes åpen mens et skjemaark (dialog) fra den er åpent, ellers ville
 * arket forsvunnet sammen med lista.
 * Avvik:
 *   - Lista lukkes med Escape og klikk utenfor, men ikke mens et ark fra den er åpent.
 */
export function TnFlere({ knapp, variant = "sekundar", children }: { knapp: string; variant?: TnKnappVariant; children: ReactNode }) {
  const [apen, setApen] = useState(false);
  const rot = useRef<HTMLDivElement>(null);
  const knappRef = useRef<HTMLButtonElement>(null);
  const listeId = useId();

  useEffect(() => {
    if (!apen) return;
    const dialogApen = () => !!rot.current?.querySelector("dialog[open]");
    const utenfor = (e: PointerEvent) => {
      if (dialogApen()) return;
      if (rot.current && !rot.current.contains(e.target as Node)) setApen(false);
    };
    const tast = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || dialogApen()) return;
      setApen(false);
      knappRef.current?.focus();
    };
    document.addEventListener("pointerdown", utenfor);
    document.addEventListener("keydown", tast);
    return () => {
      document.removeEventListener("pointerdown", utenfor);
      document.removeEventListener("keydown", tast);
    };
  }, [apen]);

  return (
    <div ref={rot} className={s.flere}>
      <button ref={knappRef} type="button" style={tnKnappStil(variant)} aria-expanded={apen} aria-controls={listeId} onClick={() => setApen((v) => !v)}>
        {knapp}
        <TnIkon navn="ned" />
      </button>
      <div id={listeId} className={s.flereListe} hidden={!apen}>
        {children}
      </div>
    </div>
  );
}
