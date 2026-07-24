"use client";

/**
 * Tommel-sone (GO V2) — hovedhandlingen i runde-føringen skal alltid ligge
 * nederst, innenfor tommelens rekkevidde, uansett hvor langt brukeren har
 * scrollet. Slag-kjeder og hull-lister blir lange på banen; før dette måtte
 * spilleren scrolle ned for å komme til «Lagre hull»/«Neste hull».
 *
 * `TommelSone` klistrer innholdet til bunnen av viewporten (sticky, ikke fixed
 * — den flyter naturlig med i kolonnen og stjeler ingen plass når siden er
 * kort), med safe-area-inset for iOS-PWA og en myk uttoning så innhold som
 * ruller under ikke kolliderer visuelt med knappen.
 *
 * `PrimaerKnapp` er den ene store lime handlingen (54px, 16px radius) som fram
 * til nå var kopiert i fire filer — én kilde gjør at tommel-sonen ser lik ut
 * i hurtigmodus, slag-modus og oppsummering.
 */

import type { CSSProperties, ReactNode } from "react";
import { T, Icon } from "@/components/v2";

export function TommelSone({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        position: "sticky",
        bottom: 0,
        zIndex: 5,
        paddingTop: 12,
        paddingBottom: "calc(8px + env(safe-area-inset-bottom))",
        // Uttoning mot bakgrunnen: innhold som ruller under blir dempet, ikke
        // kuttet — knappen leses fortsatt som del av siden, ikke en flytende bar.
        background: `linear-gradient(to top, ${T.bg} 72%, transparent)`,
      }}
    >
      {children}
    </div>
  );
}

export function PrimaerKnapp({
  onClick,
  children,
  disabled,
  ikon,
  venter,
  style,
}: {
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
  /** Lucide-navn til høyre for teksten (f.eks. «arrow-right» for neste hull). */
  ikon?: string;
  /** Viser vente-markør og demper knappen mens en lagring pågår. */
  venter?: boolean;
  style?: CSSProperties;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="v2-press v2-focus"
      style={{
        appearance: "none",
        cursor: venter ? "wait" : disabled ? "default" : "pointer",
        width: "100%",
        height: 54,
        borderRadius: 16,
        border: "none",
        background: T.lime,
        color: T.onLime,
        fontFamily: T.disp,
        fontSize: 16,
        fontWeight: 700,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        opacity: disabled ? 0.5 : venter ? 0.75 : 1,
        boxShadow: "0 10px 34px color-mix(in srgb, var(--v2-lime) 28%, transparent)",
        ...style,
      }}
    >
      {children}
      {ikon && <Icon name={ikon} size={16} />}
    </button>
  );
}
