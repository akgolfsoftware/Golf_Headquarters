// Schema for User.preferences (lagret som Json i DB).

import type { User } from "@/generated/prisma/client";

export type UserPreferences = {
  notif: {
    epost: boolean;
    push: boolean;
    paaminnelse: boolean;
    /** Spesifikke notif-typer */
    nyMeldingFraCoach: boolean;
    treningsplanOppdatert: boolean;
    bookingbekreftelse: boolean;
    ukentligRapport: boolean;
    turneringsresultater: boolean;
  };
  spraak: "nb" | "en";
  sgHubMode: "simple" | "advanced";
  /** Måleenhet for lengder i appen. */
  enhet: "meter" | "yards";
};

export const DEFAULT_PREFERENCES: UserPreferences = {
  notif: {
    epost: true,
    push: false,
    paaminnelse: true,
    nyMeldingFraCoach: true,
    treningsplanOppdatert: true,
    bookingbekreftelse: true,
    ukentligRapport: false,
    turneringsresultater: false,
  },
  spraak: "nb",
  sgHubMode: "simple",
  enhet: "meter",
};

function boolPref(val: unknown, defaultVal: boolean): boolean {
  return typeof val === "boolean" ? val : defaultVal;
}

/**
 * Rå merge-grunnlag for User.preferences — bevarer ukjente nøkler
 * (onboarding, trening, m.fl.) som `lesPreferences` ikke kjenner til.
 *
 * `lesPreferences` returnerer et FRISKT objekt med kun de kjente feltene —
 * riktig for lesing, men brukt som skrive-grunnlag sletter det stille alt
 * annet i blob-en (bl.a. onboarding-data ved enhver innstillings-lagring).
 * All skriving til User.preferences MÅ bruke denne som base, ikke
 * lesPreferences().
 */
export function lesRaaPreferences(user: Pick<User, "preferences">): Record<string, unknown> {
  const raw = user.preferences;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return { ...(raw as Record<string, unknown>) };
}

export function lesPreferences(user: Pick<User, "preferences">): UserPreferences {
  const raw = user.preferences;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return DEFAULT_PREFERENCES;
  }
  const obj = raw as Record<string, unknown>;
  const notif =
    obj.notif && typeof obj.notif === "object" && !Array.isArray(obj.notif)
      ? (obj.notif as Record<string, unknown>)
      : {};
  const spraak = obj.spraak === "en" ? "en" : "nb";
  const sgHubMode = obj.sgHubMode === "advanced" ? "advanced" : "simple";
  const enhet = obj.enhet === "yards" ? "yards" : "meter";
  const d = DEFAULT_PREFERENCES.notif;

  return {
    notif: {
      epost: boolPref(notif.epost, d.epost),
      push: boolPref(notif.push, d.push),
      paaminnelse: boolPref(notif.paaminnelse, d.paaminnelse),
      nyMeldingFraCoach: boolPref(notif.nyMeldingFraCoach, d.nyMeldingFraCoach),
      treningsplanOppdatert: boolPref(notif.treningsplanOppdatert, d.treningsplanOppdatert),
      bookingbekreftelse: boolPref(notif.bookingbekreftelse, d.bookingbekreftelse),
      ukentligRapport: boolPref(notif.ukentligRapport, d.ukentligRapport),
      turneringsresultater: boolPref(notif.turneringsresultater, d.turneringsresultater),
    },
    spraak,
    sgHubMode,
    enhet,
  };
}
