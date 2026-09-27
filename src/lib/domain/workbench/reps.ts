/**
 * Domenedefinisjoner for repetisjons- og slagtelling (Live-tapper).
 * Dekker full sving (køller), nærspill (chip, pitch, lob, bunker)
 * og putting (kort, mellom, lang), samt repetisjonstyper (full fart, lav fart, tørrsving).
 *
 * Ingen eksterne avhengigheter, ren domenemodell.
 */

export type RepetitionArea = "FULL_SVING" | "NAERSPILL" | "PUTTING";

export type RepetitionType = "FULL_SPEED" | "LOW_SPEED" | "DRY";

export interface RepItem {
  id: string; // unik identifikator i SessionBallLog.club, f.eks. "driver", "naerspill-chip", "naerspill-chip:dry"
  baseId: string;
  name: string;
  area: RepetitionArea;
  category: string;
  repetitionType: RepetitionType;
}

export const REPETITION_AREAS: { id: RepetitionArea; label: string }[] = [
  { id: "FULL_SVING", label: "Full sving" },
  { id: "NAERSPILL", label: "Nærspill" },
  { id: "PUTTING", label: "Putting" },
];

export const REPETITION_TYPES: { id: RepetitionType; label: string; short: string }[] = [
  { id: "FULL_SPEED", label: "Full fart", short: "Full" },
  { id: "LOW_SPEED", label: "Lav fart", short: "Lav" },
  { id: "DRY", label: "Tørrsving", short: "Tørr" },
];

export const SHORT_GAME_TARGETS = [
  { baseId: "chip", name: "Chip", category: "CHIP" },
  { baseId: "pitch", name: "Pitch", category: "PITCH" },
  { baseId: "lob", name: "Lob", category: "LOB" },
  { baseId: "bunker", name: "Bunker", category: "BUNKER" },
] as const;

export const PUTTING_TARGETS = [
  { baseId: "putt-greenlesing", name: "Greenlesing", category: "GREENLESING" },
  { baseId: "putt-sikte", name: "Sikte", category: "SIKTE" },
  { baseId: "putt-ballstart", name: "Ballstart", category: "BALLSTART" },
  { baseId: "putt-lengdekontroll", name: "Lengdekontroll", category: "LENGDEKONTROLL" },
  { baseId: "putt-kort", name: "Kortputt (<3m)", category: "KORT" },
  { baseId: "putt-mellom", name: "Mellomputt (3–10m)", category: "MELLOM" },
  { baseId: "putt-lang", name: "Lengdeputt (>10m)", category: "LANG" },
] as const;

/**
 * Bygger en unik lagringsnøkkel for SessionBallLog.club.
 * Full speed bruker standard baseId for bakoverkompatibilitet (f.eks. "iron-7" eller "naerspill-chip").
 * Andre hastigheter suffikses med ":low_speed" eller ":dry".
 */
export function buildRepKey(baseId: string, repType: RepetitionType): string {
  if (repType === "FULL_SPEED") {
    return baseId;
  }
  return `${baseId}:${repType.toLowerCase()}`;
}

/**
 * Parser en nøkkel tilbake til baseId og RepetitionType.
 */
export function parseRepKey(key: string): { baseId: string; repType: RepetitionType } {
  if (key.endsWith(":dry")) {
    return { baseId: key.slice(0, -4), repType: "DRY" };
  }
  if (key.endsWith(":low_speed")) {
    return { baseId: key.slice(0, -10), repType: "LOW_SPEED" };
  }
  return { baseId: key, repType: "FULL_SPEED" };
}

/**
 * Formaterer en visningsetikett for en repetisjon.
 */
export function formatRepLabel(baseName: string, repType?: RepetitionType | string | null): string {
  if (!repType || repType === "FULL_SPEED") {
    return baseName;
  }
  if (repType === "LOW_SPEED") {
    return `${baseName} (lav fart)`;
  }
  if (repType === "DRY") {
    return `${baseName} (tørrsving)`;
  }
  return baseName;
}
