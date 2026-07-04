// Progressiv dybde for golfdata-flatene (masterplan-prinsipp 6).
// Spillerens A–K-kategori styrer hvor mye som vises: nybegynner får klarspråk
// og én anbefaling, elite får full dekomponering + fagkoder. Coach-flater
// bruker alltid "elite".

import type { AkKategori } from "@/lib/domain/ak-kategori";

export type Nivaa = "nybegynner" | "ovet" | "elite";

// A–K-tallene er blant de opplåste regel-klyngene (CLAUDE.md 2026-06-22) —
// dybde-grensene samles derfor i ÉN konstant så de kan justeres når Anders
// låser verdiene. A = beste kategori (kanon).
export const DYBDE_GRENSER: Record<Nivaa, readonly AkKategori[]> = {
  elite: ["A", "B"],
  ovet: ["C", "D", "E", "F"],
  nybegynner: ["G", "H", "I", "J", "K"],
};

export function nivaaFraKategori(kategori: AkKategori): Nivaa {
  if (DYBDE_GRENSER.elite.includes(kategori)) return "elite";
  if (DYBDE_GRENSER.ovet.includes(kategori)) return "ovet";
  return "nybegynner";
}
