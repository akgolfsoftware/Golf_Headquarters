// Schema for User.preferences (lagret som Json i DB).

import type { User } from "@/generated/prisma/client";

export type UserPreferences = {
  notif: {
    epost: boolean;
    push: boolean;
    paaminnelse: boolean;
  };
  spraak: "nb" | "en";
  sgHubMode: "simple" | "advanced";
};

export const DEFAULT_PREFERENCES: UserPreferences = {
  notif: {
    epost: true,
    push: false,
    paaminnelse: true,
  },
  spraak: "nb",
  sgHubMode: "simple",
};

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

  return {
    notif: {
      epost: typeof notif.epost === "boolean" ? notif.epost : DEFAULT_PREFERENCES.notif.epost,
      push: typeof notif.push === "boolean" ? notif.push : DEFAULT_PREFERENCES.notif.push,
      paaminnelse:
        typeof notif.paaminnelse === "boolean"
          ? notif.paaminnelse
          : DEFAULT_PREFERENCES.notif.paaminnelse,
    },
    spraak,
    sgHubMode,
  };
}
