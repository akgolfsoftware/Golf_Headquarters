// Sentral mapping fra enum-verdier til norske visnings-labels.
// Brukes overalt der enum-verdier vises (chips, valg, oppsummeringer).

import type {
  PyramidArea,
  SkillArea,
  SessionEnvironment,
  LPhase,
  PressureLevel,
} from "@/generated/prisma/client";

export const PYRAMIDE_LABEL: Record<PyramidArea, string> = {
  FYS: "Fysisk",
  TEK: "Teknisk",
  SLAG: "Slag",
  SPILL: "Spill",
  TURN: "Turnering",
};

export const SKILL_AREA_LABEL: Record<SkillArea, string> = {
  TEE_TOTAL: "Tee total",
  TILNAERMING: "Tilnærming",
  AROUND_GREEN: "Around-Green",
  PUTTING: "Putting",
  SPILL: "Spill",
};

export const ENVIRONMENT_LABEL: Record<SessionEnvironment, string> = {
  RANGE: "Range",
  BANE: "Bane",
  STUDIO: "Studio",
  HJEM: "Hjem",
  SIMULATOR: "Simulator",
  GYM: "Gym",
};

export const LPHASE_LABEL: Record<LPhase, string> = {
  GRUNN:           "Grunnperiode",
  SPESIAL:         "Spesialiseringsperiode",
  TURNERING:       "Turneringsperiode",
  TESTUKE:         "Testuke",
  FERIE:           "Ferie",
  TRENINGSSAMLING: "Treningssamling",
  HELDAGSSAMLING:  "Heldagssamling",
};

export const LPHASE_BESKRIVELSE: Record<LPhase, string> = {
  GRUNN:           "Fysisk og teknisk grunnlag — basiskapasitet",
  SPESIAL:         "Spesialisert trening mot sesongens krav",
  TURNERING:       "Kampforberedelse og prestasjon under press",
  TESTUKE:         "Kontrollpunkt — tester som måler fremgangen",
  FERIE:           "Fri fra organisert trening — restitusjon",
  TRENINGSSAMLING: "Samling over flere dager med høy treningstetthet",
  HELDAGSSAMLING:  "Én hel dag med trening, tester eller banespill",
};

/** Periodefarger på årsplan-tidslinja (8c.1-kanon, tema-følsomme CSS-vars). */
export const LPHASE_FARGE: Record<LPhase, string> = {
  GRUNN:           "var(--v2-ax-fys)",
  SPESIAL:         "var(--v2-ax-tek)",
  TURNERING:       "var(--v2-ax-turn)",
  TESTUKE:         "var(--v2-info)",
  FERIE:           "var(--v2-mut)",
  TRENINGSSAMLING: "var(--v2-ax-slag)",
  HELDAGSSAMLING:  "var(--v2-lime)",
};

export const PYRAMIDE_REKKEFOLGE: PyramidArea[] = [
  "FYS",
  "TEK",
  "SLAG",
  "SPILL",
  "TURN",
];

export const SKILL_AREA_REKKEFOLGE: SkillArea[] = [
  "TEE_TOTAL",
  "TILNAERMING",
  "AROUND_GREEN",
  "PUTTING",
  "SPILL",
];

export const ENVIRONMENT_REKKEFOLGE: SessionEnvironment[] = [
  "RANGE",
  "BANE",
  "STUDIO",
  "HJEM",
  "SIMULATOR",
  "GYM",
];

export const LPHASE_REKKEFOLGE: LPhase[] = [
  "GRUNN",
  "SPESIAL",
  "TURNERING",
];

export const PRESSURE_LABEL: Record<PressureLevel, string> = {
  PR1: "Ingen press",
  PR2: "Lav press",
  PR3: "Moderat press",
  PR4: "Hoy press",
  PR5: "Maks press",
};

export const PRESSURE_BESKRIVELSE: Record<PressureLevel, string> = {
  PR1: "Fritt utforskende, ingen konsekvens",
  PR2: "Enkle mal, liten konsekvens",
  PR3: "Tydelige mal, moderat konsekvens",
  PR4: "Krevende mal, merkbar konsekvens",
  PR5: "Simulert turneringssituasjon, full konsekvens",
};

export const PRESSURE_REKKEFOLGE: PressureLevel[] = [
  "PR1",
  "PR2",
  "PR3",
  "PR4",
  "PR5",
];
