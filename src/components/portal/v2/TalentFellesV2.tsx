"use client";

/**
 * PlayerHQ Talent — delte v2-byggeklosser for undersidene
 * (min-plan, mitt-niva, roadmap, sammenligning).
 *
 * - TALENT_AKSER: de fem talent-aksene i fast rekkefølge (samme kontrakt som
 *   TalentTracking-feltene i DB) + norske visningsnavn. Verdiene settes av
 *   coach (1–10) — aldri beregnet her.
 * - TalentIkkeIProgrammet: ærlig tomtilstand for spillere uten
 *   TalentTracking-rad (tidligere håndhevet av (legacy)-layouten).
 */

import Link from "next/link";
import { CTAPill, Kort, TomTilstand } from "@/components/v2";

export const TALENT_AKSE_KEYS = [
  "fysisk",
  "teknikk",
  "taktikk",
  "mental",
  "motivasjon",
] as const;

export type TalentAkseKey = (typeof TALENT_AKSE_KEYS)[number];

export const TALENT_AKSE_LABELS: Record<TalentAkseKey, string> = {
  fysisk: "Fysisk",
  teknikk: "Teknikk",
  taktikk: "Taktikk",
  mental: "Mental",
  motivasjon: "Motivasjon",
};

/** Én talent-akse med spillerens verdi (1–10, null = ikke vurdert ennå). */
export interface TalentAkseVerdi {
  key: TalentAkseKey;
  label: string;
  verdi: number | null;
}

/** Ærlig «ikke i programmet»-tilstand — vises i stedet for undersiden. */
export function TalentIkkeIProgrammet() {
  return (
    <Kort>
      <TomTilstand
        icon="star"
        title="Du er ikke i talent-programmet ennå"
        sub="Talent-modulen er forbeholdt spillere som er invitert inn i AK Golf sitt talentutviklingsprogram. Når du blir tatt opp får du din egen utviklingsplan, radar mot kohort-snitt og sammenligning med andre på samme nivå. Lurer du på hva som skal til? Ta kontakt med coachen din."
      />
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Link href="/portal" style={{ textDecoration: "none" }}>
          <CTAPill icon="arrow-left">Tilbake til PlayerHQ</CTAPill>
        </Link>
      </div>
    </Kort>
  );
}
