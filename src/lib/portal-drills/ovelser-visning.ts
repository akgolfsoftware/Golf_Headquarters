/**
 * PlayerHQ pakke 4 «Øvelser og teknikk»: fra øvelsesbanken i basen til skjermen.
 * Fasit: docs/design-system/utkast-playerhq/ovelser.html (PH-13 Øvelsesbank, øvelse og break-tabell).
 *
 * Ren modul uten database (testet i ovelser-visning.test.ts). Alt som vises kommer fra
 * ExerciseDefinition. Mangler et felt, er verdien null og skjermen viser «—».
 */
import {
  MOTORIKK_LABEL, OMRAADER, PRESS_LABEL, erOmraadeKode,
  type MotorikkKode, type OmraadeFamilie, type OmraadeKode, type PressKode,
} from "@/lib/domain/ak-formel-v2";
import { oktBilde, type OktBilde } from "@/lib/portal/okt-bilde";
import { beregnBreakCm } from "./ph13-drills-data";

export type OvAkse = "fys" | "tek" | "slag" | "spill" | "turn";
export const OV_AKSER: readonly OvAkse[] = ["fys", "tek", "slag", "spill", "turn"];
/** Rekkefølgen i pyramiden, fra toppen. */
export const OV_PYRAMIDE: readonly OvAkse[] = ["turn", "spill", "slag", "tek", "fys"];
export const OV_AKSE_KODE: Record<OvAkse, string> = { fys: "FYS", tek: "TEK", slag: "SLAG", spill: "SPILL", turn: "TURN" };
export const OV_AKSE_NAVN: Record<OvAkse, string> = { fys: "Fysisk", tek: "Teknisk", slag: "Golfslag", spill: "Spill", turn: "Turnering" };

/** Treningsmiljøene øvelsen kan gjøres i (SessionEnvironment). */
export const MILJO_NAVN: Record<string, string> = {
  RANGE: "Driving range",
  SIMULATOR: "Simulator",
  STUDIO: "Studio",
  BANE: "Golfbane",
  GYM: "Styrkerom",
  HJEM: "Hjemme",
};

/** Slagområdet når øvelsen ikke har et av de 19 treningsområdene. */
const SKILL_NAVN: Record<string, string> = {
  TEE_TOTAL: "Utslag",
  TILNAERMING: "Innspill",
  AROUND_GREEN: "Nærspill",
  PUTTING: "Putting",
  SPILL: "Banespill",
};

export type OvelseRad = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  pyramidArea: string;
  skillArea: string | null;
  omraadeKode: string | null;
  motorikk: string | null;
  press: string | null;
  durationMin: number | null;
  environment: string[];
  utstyr: string[];
  defaultSets: number | null;
  defaultReps: number | null;
  defaultRepsSets: string | null;
  source: "SYSTEM" | "COACH" | "PLAYER";
};

export type OvelseVisning = {
  id: string;
  akse: OvAkse;
  omraade: string | null;
  navn: string;
  min: number | null;
  /** «4 × 6» eller «30 slag». null når øvelsen ikke har mengde. */
  mengde: string | null;
  miljo: string[];
  press: string | null;
  motorikk: string | null;
  utstyr: string[];
  kilde: string;
  egen: boolean;
  beskrivelse: string | null;
  bilde: OktBilde;
  /** Antall egne økter siste 30 dager med øvelsen. */
  brukt: number;
};

function akseFra(p: string): OvAkse {
  const a = p.toLowerCase();
  return (OV_AKSER as readonly string[]).includes(a) ? (a as OvAkse) : "slag";
}

export function omraadeNavn(r: Pick<OvelseRad, "omraadeKode" | "skillArea">): string | null {
  if (r.omraadeKode && erOmraadeKode(r.omraadeKode)) return OMRAADER.find((o) => o.kode === r.omraadeKode)?.label ?? null;
  if (r.skillArea) return SKILL_NAVN[r.skillArea] ?? null;
  return null;
}

export function mengdeFor(r: Pick<OvelseRad, "defaultSets" | "defaultReps" | "defaultRepsSets">): string | null {
  if (r.defaultSets != null && r.defaultReps != null) return `${r.defaultSets} × ${r.defaultReps}`;
  const fri = r.defaultRepsSets?.trim();
  return fri ? fri : null;
}

export const KILDE_NAVN: Record<OvelseRad["source"], string> = {
  SYSTEM: "AK Golf-banken",
  COACH: "Fra coachen din",
  PLAYER: "Egen øvelse, laget av deg",
};

export function ovelseVisning(r: OvelseRad, brukt = 0): OvelseVisning {
  const akse = akseFra(r.pyramidArea);
  const omraade = omraadeNavn(r);
  const miljo = r.environment.map((e) => MILJO_NAVN[e]).filter((x): x is string => !!x);
  const bildeSti = r.imageUrl && r.imageUrl.startsWith("https://") ? r.imageUrl : null;
  return {
    id: r.id,
    akse,
    omraade,
    navn: r.name,
    min: r.durationMin,
    mengde: mengdeFor(r),
    miljo,
    press: r.press && r.press in PRESS_LABEL ? PRESS_LABEL[r.press as PressKode] : null,
    motorikk: r.motorikk && r.motorikk in MOTORIKK_LABEL ? MOTORIKK_LABEL[r.motorikk as MotorikkKode] : null,
    utstyr: r.utstyr.filter((u) => u.trim()),
    kilde: KILDE_NAVN[r.source],
    egen: r.source === "PLAYER",
    beskrivelse: r.description?.trim() || null,
    bilde: bildeSti ? { src: bildeSti, posisjon: "50% 50%" } : oktBilde(OV_AKSE_KODE[akse], `${omraade ?? ""} ${miljo.join(" ")} ${r.name}`),
    brukt,
  };
}

export type OvFilter = { akse: OvAkse | null; omraade: string | null; sok: string; miljo: string | null; press: string | null };
export const TOMT_FILTER: OvFilter = { akse: null, omraade: null, sok: "", miljo: null, press: null };

export function filterAktivt(f: OvFilter): boolean {
  return !!(f.akse || f.omraade || f.sok.trim() || f.miljo || f.press);
}

export function passer(o: OvelseVisning, f: OvFilter): boolean {
  if (f.akse && o.akse !== f.akse) return false;
  if (f.omraade && o.omraade !== f.omraade) return false;
  if (f.miljo && !o.miljo.includes(f.miljo)) return false;
  if (f.press && o.press !== f.press) return false;
  const s = f.sok.trim().toLowerCase();
  if (s && !`${o.navn} ${o.omraade ?? ""}`.toLowerCase().includes(s)) return false;
  return true;
}

export function antallPerAkse(liste: readonly OvelseVisning[]): Record<OvAkse, number> {
  const n: Record<OvAkse, number> = { fys: 0, tek: 0, slag: 0, spill: 0, turn: 0 };
  for (const o of liste) n[o.akse] += 1;
  return n;
}

/** Treningsområdene som finnes i banken for en akse, i den rekkefølgen de første gang dukker opp. */
export function omraaderFor(liste: readonly OvelseVisning[], akse: OvAkse): string[] {
  const ut: string[] = [];
  for (const o of liste) if (o.akse === akse && o.omraade && !ut.includes(o.omraade)) ut.push(o.omraade);
  return ut;
}

/** Verdier som faktisk finnes i banken, så filteret aldri tilbyr et valg som gir null treff. */
export function verdierI(liste: readonly OvelseVisning[], felt: "miljo" | "press"): string[] {
  const ut = new Set<string>();
  for (const o of liste) {
    if (felt === "miljo") o.miljo.forEach((m) => ut.add(m));
    else if (o.press) ut.add(o.press);
  }
  return [...ut];
}

// ---------------------------------------------------------------------------
// Ny egen øvelse: hvilke treningsområder hører til hvilken akse
// ---------------------------------------------------------------------------

const FAMILIER_FOR: Record<OvAkse, readonly OmraadeFamilie[]> = {
  fys: ["FYS"],
  tek: ["FULLSVING", "NAERSPILL", "PUTT"],
  slag: ["FULLSVING", "NAERSPILL", "PUTT"],
  spill: ["BANE"],
  turn: ["BANE"],
};

export function omraadeValgFor(akse: OvAkse): { kode: OmraadeKode; navn: string }[] {
  return OMRAADER.filter((o) => FAMILIER_FOR[akse].includes(o.familie)).map((o) => ({ kode: o.kode, navn: o.label }));
}

export function omraadeHorerTil(akse: OvAkse, kode: string): boolean {
  return omraadeValgFor(akse).some((o) => o.kode === kode);
}

/** Slagområdet (SkillArea) en ny øvelse får, slik at gamle filtre og Caddie finner den. */
export function skillAreaFor(kode: OmraadeKode): "TEE_TOTAL" | "TILNAERMING" | "AROUND_GREEN" | "PUTTING" | "SPILL" | null {
  if (kode === "TEE_TOTAL") return "TEE_TOTAL";
  if (kode.startsWith("INNSPILL_")) return "TILNAERMING";
  if (kode === "CHIP" || kode === "PITCH" || kode === "LOB" || kode === "BUNKER") return "AROUND_GREEN";
  if (kode.startsWith("PUTT_")) return "PUTTING";
  if (kode === "BANE") return "SPILL";
  return null;
}

// ---------------------------------------------------------------------------
// Legg i plan: dagene i inneværende uke (Oslo)
// ---------------------------------------------------------------------------

const OSLO_ISO = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo", year: "numeric", month: "2-digit", day: "2-digit" });
const KORT = ["man", "tir", "ons", "tor", "fre", "lør", "søn"] as const;

export type UkeDag = { iso: string; kort: string; dag: number; forbi: boolean };

export function ukeDager(naa: Date): UkeDag[] {
  const [a, m, d] = OSLO_ISO.format(naa).split("-").map(Number);
  const idag = Date.UTC(a, m - 1, d);
  const idx = (new Date(idag).getUTCDay() + 6) % 7;
  return KORT.map((kort, i) => {
    const t = new Date(idag + (i - idx) * 86_400_000);
    return { iso: t.toISOString().slice(0, 10), kort, dag: t.getUTCDate(), forbi: i < idx };
  });
}

// ---------------------------------------------------------------------------
// Break-tabell (eksempel til Anders har valgt tabell)
// ---------------------------------------------------------------------------

export const BREAK_AVSTANDER = [3, 5, 8, 10, 15, 20, 25, 30] as const;
export const BREAK_HELLING = [1, 2, 3] as const;
export const BREAK_STIMP = [
  { verdi: 9, navn: "9 · treg" },
  { verdi: 10, navn: "10 · middels" },
  { verdi: 11, navn: "11 · rask" },
] as const;

/** Én rad per avstand: break i cm for 1, 2 og 3 % helling. Uthevet: 5–10 fot. */
export function breakTabell(stimp: number): { fot: number; cm: number[]; uthevet: boolean }[] {
  return BREAK_AVSTANDER.map((fot) => ({
    fot,
    cm: BREAK_HELLING.map((h) => beregnBreakCm(fot, h, stimp)),
    uthevet: fot >= 5 && fot <= 10,
  }));
}
