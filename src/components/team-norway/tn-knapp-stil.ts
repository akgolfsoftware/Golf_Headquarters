import type { CSSProperties } from "react";

import { TN } from "@/lib/v2/team-norway";

/**
 * Knappestil for Team Norway. Egen fil uten "use client": en ren funksjon som både
 * serverskjermer og klientkomponenter kaller. Lå før i tn-handlinger.tsx (klient), og
 * da krasjet serverskjermen Oversikt med «Attempted to call tnKnappStil() from the server».
 */

const knappGrunn: CSSProperties = {
  minHeight: 44,
  padding: "0 18px",
  borderRadius: 2,
  fontFamily: TN.font.body,
  fontSize: 14,
  fontWeight: 700,
  letterSpacing: "0.02em",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  cursor: "pointer",
  textDecoration: "none",
  whiteSpace: "nowrap",
  maxWidth: "100%",
};

/**
 * «hvit» og «konturHvit» står på navy helteflate (utkast 2). «meny» er en rad i
 * «Ny»/«Mer»-lista (TnFlere): venstrestilt, full bredde, hårstrek under.
 */
export type TnKnappVariant = "primar" | "sekundar" | "slett" | "tekst" | "hvit" | "konturHvit" | "meny";

export function tnKnappStil(variant: TnKnappVariant = "primar"): CSSProperties {
  if (variant === "primar") return { ...knappGrunn, background: TN.navy900, color: TN.white, border: `1px solid ${TN.navy900}` };
  if (variant === "hvit") return { ...knappGrunn, background: TN.white, color: TN.navy900, border: `1px solid ${TN.white}` };
  if (variant === "konturHvit") return { ...knappGrunn, background: "transparent", color: TN.white, border: "1px solid rgba(255, 255, 255, 0.75)" };
  if (variant === "meny") return { ...knappGrunn, width: "100%", justifyContent: "flex-start", padding: "0 14px", letterSpacing: 0, background: TN.white, color: TN.navy900, border: 0, borderBottom: `1px solid ${TN.ink200}`, borderRadius: 0 };
  if (variant === "slett") return { ...knappGrunn, background: TN.status.redText, color: TN.white, border: `1px solid ${TN.status.redText}` };
  if (variant === "tekst") return { ...knappGrunn, minWidth: 44, padding: "0 4px", background: "transparent", color: TN.navy600, border: "1px solid transparent", textDecoration: "underline", textUnderlineOffset: 4 };
  return { ...knappGrunn, background: TN.white, color: TN.navy900, border: `1px solid ${TN.navy900}` };
}
