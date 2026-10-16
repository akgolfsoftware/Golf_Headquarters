/**
 * Drill-bank status for Masterbrain-fasiten.
 *
 * Hard law: så lenge ovelsesbank/godkjent/ ikke har godkjente elementer, skal
 * ingen agent finne på drill-navn, lagre CaddieDraft med oppdiktede drills,
 * eller generere «demo»-drills. Beskriv hva som bør trenes — ikke hvilken
 * navngitt drill.
 *
 * Oppdater ALDRI øvelsesbanken her — endre i masterbrain-repo og sync.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import drills from "./knowledge/entities/drills.json";

export const DRILL_BANK_EMPTY_CODE = "DRILL_BANK_EMPTY" as const;

export const DRILL_BANK_EMPTY_MELDING_NO =
  "Drill-banken i Masterbrain er under oppbygging. Ingen navngitte drills foreslås før de er godkjent av Anders. Beskriv hva som bør trenes (område, posisjon), ikke en oppdiktet øvelse.";

export type MasterbrainOvelsesbankElement = Record<string, unknown> & {
  id?: string;
  type?: "DRILL" | "OVELSE" | "TEST";
  navn?: string;
  minKategori?: string;
  maxKategori?: string;
  environment?: string[];
  fasilitetKrav?: string[];
  treningstype?: string;
  akFormel?: {
    pyramidArea?: string;
    omraade?: string;
    dimensjon?: string;
    motorikk?: string;
    belastning?: string;
    press?: string;
    maaleutstyr?: string;
    sandTrinn?: string;
  };
  facilityRequirements?: {
    longestShotM?: number;
    longestShotKind?: string;
    minimumFacilityLengthM?: number;
    minimumCeilingHeightM?: number | null;
    surface?: string;
  };
};

export type MasterbrainPlayerFacility = {
  name?: string | null;
  capabilities?: string[] | null;
  rangeLengdeM?: number | null;
  maksPuttLengdeM?: number | null;
};

export type MasterbrainFasilitetProfil = {
  tilgjengeligeFasiliteter?: string[];
  playerFacilities?: MasterbrainPlayerFacility[];
};

export type MasterbrainForslagFilter = {
  sgKode?: "OTT" | "APP" | "ARG" | "PUTT";
  pyramidAreas?: string[];
  fasilitetProfil?: MasterbrainFasilitetProfil;
  limit?: number;
};

const MASTERBRAIN_ROOT = join(process.cwd(), "src", "lib", "masterbrain");

function jsonFiler(relMappe: string): string[] {
  const mappe = join(MASTERBRAIN_ROOT, relMappe);
  if (!existsSync(mappe)) return [];

  const filer: string[] = [];
  for (const navn of readdirSync(mappe, { withFileTypes: true })) {
    const full = join(mappe, navn.name);
    if (navn.isDirectory()) {
      for (const undernavn of readdirSync(full, { withFileTypes: true })) {
        if (undernavn.isFile() && undernavn.name.endsWith(".json")) {
          filer.push(join(full, undernavn.name));
        }
      }
      continue;
    }
    if (navn.isFile() && navn.name.endsWith(".json")) {
      filer.push(full);
    }
  }
  return filer.sort();
}

function elementerFraJsonFil(sti: string): MasterbrainOvelsesbankElement[] {
  const data = JSON.parse(readFileSync(sti, "utf8")) as unknown;
  if (Array.isArray(data)) return data as MasterbrainOvelsesbankElement[];
  if (!data || typeof data !== "object") return [];

  const obj = data as Record<string, unknown>;
  for (const key of ["items", "drills", "tests"]) {
    const verdi = obj[key];
    if (Array.isArray(verdi)) return verdi as MasterbrainOvelsesbankElement[];
  }
  return [];
}

function elementerFraMappe(relMappe: string): MasterbrainOvelsesbankElement[] {
  return jsonFiler(relMappe).flatMap(elementerFraJsonFil);
}

/** Godkjente driller, øvelser og tester som er FASIT for agenter. */
export function hentGodkjenteOvelsesbankElementer(): MasterbrainOvelsesbankElement[] {
  return elementerFraMappe("ovelsesbank/godkjent").filter(
    (item) => item.status === "GODKJENT",
  );
}

function tall(verdi: unknown): number | null {
  return typeof verdi === "number" && Number.isFinite(verdi) ? verdi : null;
}

function liste(verdi: unknown): string[] {
  return Array.isArray(verdi)
    ? verdi.filter((v): v is string => typeof v === "string")
    : [];
}

function passerSgOmraade(
  item: MasterbrainOvelsesbankElement,
  sgKode: MasterbrainForslagFilter["sgKode"],
): boolean {
  if (!sgKode) return true;
  const omraade = item.akFormel?.omraade;
  if (!omraade) return false;

  if (sgKode === "PUTT") return omraade.startsWith("PUTT_");
  if (sgKode === "OTT") return omraade === "TEE_TOTAL";
  if (sgKode === "APP") return omraade.startsWith("INNSPILL_");
  return ["CHIP", "PITCH", "LOB", "BUNKER"].includes(omraade);
}

function kravDekket(krav: string[], capabilities: string[]): boolean {
  if (krav.length === 0) return true;
  const set = new Set(capabilities);
  return krav.every((k) => set.has(k));
}

function puttLengdeFraCapabilities(capabilities: string[]): number | null {
  const set = new Set(capabilities);
  if (set.has("PUTTING_GREEN_LANG")) return 40;
  if (set.has("PUTTING_GREEN_KORT")) return 10;
  return null;
}

function lengdeForKind(
  kind: string | undefined,
  facility: MasterbrainPlayerFacility,
): number | null {
  const capabilities = liste(facility.capabilities);
  if (!kind || kind === "NONE") return Number.POSITIVE_INFINITY;
  if (kind === "PUTT_ROLL") {
    return tall(facility.maksPuttLengdeM) ?? puttLengdeFraCapabilities(capabilities);
  }
  return tall(facility.rangeLengdeM);
}

function facilityDekkerLengde(
  item: MasterbrainOvelsesbankElement,
  facility: MasterbrainPlayerFacility,
): boolean {
  const krav = item.facilityRequirements;
  const minimum = tall(krav?.minimumFacilityLengthM) ?? tall(krav?.longestShotM) ?? 0;
  if (minimum <= 0) return true;
  const tilgjengelig = lengdeForKind(krav?.longestShotKind, facility);
  return tilgjengelig !== null && tilgjengelig >= minimum;
}

/** True når minst én registrert fasilitet kan gjennomføre øvelsen/testen. */
export function erMuligForFasilitet(
  item: MasterbrainOvelsesbankElement,
  profil: MasterbrainFasilitetProfil = {},
): boolean {
  const krav = liste(item.fasilitetKrav);
  const facilities = profil.playerFacilities ?? [];
  if (facilities.length > 0) {
    return facilities.some((facility) => {
      const capabilities = liste(facility.capabilities);
      return kravDekket(krav, capabilities) && facilityDekkerLengde(item, facility);
    });
  }

  const tilgjengelige = profil.tilgjengeligeFasiliteter ?? [];
  if (tilgjengelige.length === 0) return true;
  if (!kravDekket(krav, tilgjengelige)) return false;

  const kind = item.facilityRequirements?.longestShotKind;
  const minimum =
    tall(item.facilityRequirements?.minimumFacilityLengthM) ??
    tall(item.facilityRequirements?.longestShotM) ??
    0;
  if (kind === "PUTT_ROLL") {
    const maxPutt = puttLengdeFraCapabilities(tilgjengelige);
    return maxPutt !== null && maxPutt >= minimum;
  }

  return true;
}

export function foreslaGodkjenteOvelsesbankElementer(
  filter: MasterbrainForslagFilter = {},
): MasterbrainOvelsesbankElement[] {
  const pyramidSet = new Set(filter.pyramidAreas ?? []);
  const limit = filter.limit ?? 6;

  return hentGodkjenteOvelsesbankElementer()
    .filter((item) => item.type !== "TEST")
    .filter((item) =>
      pyramidSet.size === 0 ? true : pyramidSet.has(item.akFormel?.pyramidArea ?? ""),
    )
    .filter((item) => passerSgOmraade(item, filter.sgKode))
    .filter((item) => erMuligForFasilitet(item, filter.fasilitetProfil))
    .sort((a, b) => {
      const area = (a.akFormel?.omraade ?? "").localeCompare(
        b.akFormel?.omraade ?? "",
        "nb-NO",
      );
      if (area !== 0) return area;
      return (a.navn ?? "").localeCompare(b.navn ?? "", "nb-NO");
    })
    .slice(0, limit);
}

/** Arbeidsbatcher som venter på Anders — ikke fasit. */
export function masterbrainTilGodkjenningAntall(): number {
  return elementerFraMappe("ovelsesbank/til-godkjenning").length;
}

/** Kandidater importert fra tidligere AK Golf HQ-seed — ikke fasit. */
export function masterbrainKandidatAntall(): number {
  return elementerFraMappe("ovelsesbank/kandidater").length;
}

/** Antall FASIT-elementer i Masterbrain-godkjentbanken. */
export function masterbrainDrillAntall(): number {
  return hentGodkjenteOvelsesbankElementer().length;
}

/** True når banken er tom — invent-guards skal stoppe. */
export function erMasterbrainDrillBankTom(): boolean {
  return masterbrainDrillAntall() === 0;
}

export function masterbrainDrillBankStatus(): {
  tom: boolean;
  antall: number;
  godkjentAntall: number;
  kandidatAntall: number;
  tilGodkjenningAntall: number;
  status: string;
  agentRegel: string;
} {
  const antall = masterbrainDrillAntall();
  const kandidatAntall = masterbrainKandidatAntall();
  const tilGodkjenningAntall = masterbrainTilGodkjenningAntall();
  return {
    tom: antall === 0,
    antall,
    godkjentAntall: antall,
    kandidatAntall,
    tilGodkjenningAntall,
    status:
      antall === 0
        ? tilGodkjenningAntall > 0
          ? "TIL_GODKJENNING"
          : typeof drills.status === "string"
            ? drills.status
            : "TOM"
        : "GODKJENT",
    agentRegel:
      typeof drills.agent_regel === "string"
        ? drills.agent_regel
        : DRILL_BANK_EMPTY_MELDING_NO,
  };
}
