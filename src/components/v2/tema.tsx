"use client";

/**
 * Tema-tilstand og temabryter for v2-flatene.
 *
 * Lå tidligere privat i `shell.tsx`, der bare railen kunne bruke den. Paper
 * har bryteren i HEADEREN på hver skjerm (`playerhq-*.html` og
 * `agencyos-*.html`: `.btn.icon` med måne-ikon, ytterst til høyre), og
 * signeringen 12.08 fant den manglende på fire skjermer samtidig. Den bor
 * derfor her, delt mellom railen og `PaperTopp`.
 *
 * Sannheten bor på `<html data-v2-tema>` (satt før paint av inline-scriptet i
 * rot-layout) + cookie `ak-v2-tema`; hooken speiler den og synker alle
 * instanser via et vindus-event. SSR-snapshot er lys — app-flatene er
 * lys-først, og mørk kommer kun fra cookien, som serveren ikke kjenner her.
 * React retter ved hydration.
 */

import { useSyncExternalStore } from "react";
import { Icon } from "./icon";
import { T } from "@/lib/v2/tokens";

export type V2Tema = "dark" | "light";

export function lesTema(): V2Tema {
  if (typeof document === "undefined") return "light";
  return document.documentElement.getAttribute("data-v2-tema") === "dark" ? "dark" : "light";
}

function abonnerTema(cb: () => void) {
  window.addEventListener("ak-v2-tema", cb);
  return () => window.removeEventListener("ak-v2-tema", cb);
}

export function useV2Tema() {
  const tema = useSyncExternalStore<V2Tema>(abonnerTema, lesTema, () => "light");
  const bytt = () => {
    const neste: V2Tema = lesTema() === "light" ? "dark" : "light";
    if (neste === "dark") document.documentElement.setAttribute("data-v2-tema", "dark");
    else document.documentElement.removeAttribute("data-v2-tema");
    document.cookie = `ak-v2-tema=${neste};path=/;max-age=31536000;samesite=lax`;
    window.dispatchEvent(new Event("ak-v2-tema"));
  };
  return { tema, bytt };
}

/**
 * Fasitens `.btn.icon` i headeren. Ikonet viser hva du BYTTER TIL, som i
 * fasiten — måne når du står i lys, sol når du står i mørk.
 */
export function TemaHeaderKnapp() {
  const { tema, bytt } = useV2Tema();
  const tilLys = tema === "dark";
  return (
    <button
      type="button"
      onClick={bytt}
      aria-label={tilLys ? "Bytt til lys modus" : "Bytt til mørk modus"}
      title={tilLys ? "Bytt til lys modus" : "Bytt til mørk modus"}
      data-od-id="paper-tema"
      className="v2-press v2-focus"
      style={{
        flex: "none",
        width: 40,
        height: 40,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 12,
        background: "transparent",
        border: `1px solid ${T.border}`,
        color: T.fg2,
        cursor: "pointer",
      }}
    >
      <Icon name={tilLys ? "sun" : "moon"} size={17} strokeWidth={1.7} />
    </button>
  );
}
