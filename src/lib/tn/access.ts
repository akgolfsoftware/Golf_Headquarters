/**
 * Team Norway tilgang — samme matrise som Claw TILGANGSMATRISE.
 * WANG-klonen gjenbruker den; her eier TN de ekstra IUP-skjermene.
 */
export type {
  ConsentRow,
  GroupRole,
  Membership,
  ParentRelation,
  Player,
  Role,
  School,
  SchoolAggregate,
} from "../wang/access.ts";

export {
  ACCESS_DENIAL,
  UTTAK_KAN_VURDERE,
  activeMemberships,
  canPostToPlayer,
  canSetConsent,
  groupsVisibleTo,
  latestConsent,
  playersVisibleTo,
  rankingVisible,
  schoolAggregates,
  selectionScoresForbidden,
  tournamentRowsFor,
} from "../wang/access.ts";

import {
  ACCESS_DENIAL as WANG_DENIAL,
  SCREEN_ROLES as WANG_ROLES,
  canAccessScreen as wangCan,
  type Role,
  type ScreenId as WangScreen,
} from "../wang/access.ts";

export type ExtraScreen =
  | "live"
  | "iup"
  | "maltavle"
  | "prosessmal"
  | "testreise"
  | "utviklingssjekk"
  | "iup-kart"
  | "iup-samtale"
  | "samtykke-reise";

export type TnScreen = WangScreen | ExtraScreen;

const EXTRA_ROLES: Record<ExtraScreen, readonly Role[]> = {
  live: ["SS", "TR", "HJ", "SP"],
  iup: ["SS", "TR", "HJ", "SP", "FO"],
  maltavle: ["SS", "TR", "HJ", "SP"],
  prosessmal: ["SS", "TR", "HJ"],
  testreise: ["SS", "TR", "HJ", "SP"],
  utviklingssjekk: ["SS", "TR", "HJ", "SP"],
  "iup-kart": ["SS", "TR"],
  "iup-samtale": ["SS", "TR", "HJ", "SP"],
  "samtykke-reise": ["SS", "TR", "SP", "FO"],
};

export const TN_SCREEN_ROLES: Record<TnScreen, readonly Role[]> = {
  ...WANG_ROLES,
  ...EXTRA_ROLES,
};

export function canAccessScreen(role: Role, screen: TnScreen): boolean {
  if (screen in EXTRA_ROLES) {
    return EXTRA_ROLES[screen as ExtraScreen].includes(role);
  }
  return wangCan(role, screen as WangScreen);
}

export const TN_ACCESS_DENIAL: Record<TnScreen, string> = {
  ...WANG_DENIAL,
  live: "Foresatt har ikke tilgang til Live. Åpne ukeplanen i stedet.",
  iup: "IUP er for utøver og trener på gruppen.",
  maltavle: "Måltavlen er for gruppen du tilhører.",
  prosessmal: "Prosessmaler er trenerens underlag.",
  testreise: "Testreisen er skjult utenfor egne grupper.",
  utviklingssjekk: "Utviklingssjekk er for utøver og trener.",
  "iup-kart": "Modulkartet er for trenere.",
  "iup-samtale": "IUP-samtalen er for utøver og trener.",
  "samtykke-reise": "Samtykkereisen er for spiller og foresatt.",
};
