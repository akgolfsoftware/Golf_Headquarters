/**
 * WANG / Team Norway tilgangslag.
 *
 * Rollen bor på gruppen, aldri på brukeren.
 * Et utmeldt medlemskap (endedAt satt) gir aldri innsyn.
 * Filteret ligger her — ikke i UI. En komponent som skjuler en kolonne
 * har allerede utlevert tallet hvis denne modulen returnerte det.
 *
 * Kilde: Claw TILGANGSMATRISE.md. Håndheves identisk for WANG-klonen.
 */

export type Role = "SS" | "TR" | "HJ" | "SP" | "FO" | "EL";

export type ScreenId =
  | "oversikt"
  | "spillere"
  | "fellestesting"
  | "samling"
  | "college"
  | "manedsplan"
  | "uttak"
  | "rangliste"
  | "skoler"
  | "poster"
  | "utoverpost"
  | "dokumenter"
  | "samtykke"
  | "protokoller"
  | "protokolldetalj"
  | "turneringer"
  | "ny-turnering"
  | "referanse"
  | "tilgang"
  | "inviter"
  | "apparatet";

export type GroupRole = "COACH" | "ASSISTANT" | "PLAYER";

export type Membership = {
  userId: string;
  groupId: string;
  role: GroupRole;
  endedAt: string | null;
};

export type ParentRelation = {
  parentId: string;
  childId: string;
  approved: boolean;
};

export type ConsentRow = {
  userId: string;
  scope: string;
  mottakerGruppeId: string;
  gitt: boolean;
  gittAvRolle: "FORESATT" | "SPILLER";
  at: string;
};

export type Player = {
  id: string;
  name: string;
  age: number;
  requiresGuardianConsent: boolean;
  schoolId: string;
  groupIds: string[];
  parentId: string | null;
};

export type School = {
  id: string;
  name: string;
};

export const SCREEN_ROLES: Record<ScreenId, readonly Role[]> = {
  oversikt: ["SS", "TR", "HJ", "SP", "FO", "EL"],
  spillere: ["SS", "TR", "HJ"],
  fellestesting: ["SS", "TR", "HJ"],
  samling: ["SS", "TR", "HJ", "SP"],
  college: ["SS", "TR", "SP"],
  manedsplan: ["SS", "TR", "HJ", "SP"],
  uttak: ["SS", "TR"],
  rangliste: ["SS", "TR", "HJ"],
  skoler: ["SS", "TR", "HJ", "EL"],
  poster: ["SS", "TR", "HJ", "SP"],
  utoverpost: ["SS", "TR", "HJ", "SP", "FO"],
  dokumenter: ["SS", "TR", "HJ", "SP"],
  samtykke: ["SP", "FO"],
  protokoller: ["SS", "TR", "HJ"],
  protokolldetalj: ["SS", "TR"],
  turneringer: ["SS", "TR", "HJ", "SP"],
  "ny-turnering": ["SS", "TR", "SP"],
  referanse: ["SS", "TR", "HJ", "SP"],
  tilgang: ["SS"],
  inviter: ["SS"],
  apparatet: ["SS", "TR", "HJ", "SP"],
};

/** HJ ser uttaksmatrisen, men kan ikke vurdere. */
export const UTTAK_KAN_VURDERE: readonly Role[] = ["SS", "TR"];

export function canAccessScreen(role: Role, screen: ScreenId): boolean {
  return SCREEN_ROLES[screen].includes(role);
}

/** Aktive medlemskap — endedAt MÅ være null. */
export function activeMemberships(
  memberships: readonly Membership[],
  userId: string,
): Membership[] {
  return memberships.filter((m) => m.userId === userId && m.endedAt === null);
}

export function groupsVisibleTo(
  memberships: readonly Membership[],
  userId: string,
  role: Role,
  allGroupIds: readonly string[],
): string[] {
  if (role === "SS") return [...allGroupIds];
  const mine = activeMemberships(memberships, userId).map((m) => m.groupId);
  return [...new Set(mine)];
}

export function playersVisibleTo(args: {
  role: Role;
  userId: string;
  memberships: readonly Membership[];
  players: readonly Player[];
  allGroupIds: readonly string[];
}): Player[] {
  const { role, userId, memberships, players, allGroupIds } = args;
  const groups = new Set(groupsVisibleTo(memberships, userId, role, allGroupIds));

  if (role === "SP") return players.filter((p) => p.id === userId);
  if (role === "FO") {
    return players.filter((p) => p.parentId === userId);
  }
  if (role === "EL") return [];
  return players.filter((p) => p.groupIds.some((g) => groups.has(g)));
}

export type SchoolAggregate = {
  schoolId: string;
  name: string;
  athleteCountLabel: string;
  coverageLabel: string;
  namedAthletes: never[];
};

const SCHOOL_NAME_THRESHOLD = 3;

/**
 * TN-08: aggregat på skolenivå. Navn forlater aldri denne funksjonen.
 * Under tre utøvere = «under 3» — ellers er tallet 2 identifiserende.
 * EL ser kun egen skole.
 */
export function schoolAggregates(args: {
  role: Role;
  elSchoolId?: string | null;
  schools: readonly School[];
  players: readonly Player[];
  visiblePlayerIds: readonly string[];
}): SchoolAggregate[] {
  const { role, elSchoolId, schools, players, visiblePlayerIds } = args;
  const visible = new Set(visiblePlayerIds);
  const source =
    role === "EL" ? schools.filter((s) => s.id === elSchoolId) : schools;

  return source.map((school) => {
    const n =
      role === "SS" || role === "EL"
        ? players.filter((p) => p.schoolId === school.id).length
        : players.filter((p) => p.schoolId === school.id && visible.has(p.id))
            .length;
    const under = n > 0 && n < SCHOOL_NAME_THRESHOLD;
    return {
      schoolId: school.id,
      name: school.name,
      athleteCountLabel: n === 0 ? "0" : under ? "under 3" : String(n),
      coverageLabel: n === 0 ? "—" : under ? "skjult" : `${n} utøvere`,
      namedAthletes: [],
    };
  });
}

export function canPostToPlayer(args: {
  role: Role;
  player: Player;
  parentRelations: readonly ParentRelation[];
}): { ok: true } | { ok: false; reason: string } {
  const { role, player, parentRelations } = args;
  if (!["SS", "TR", "HJ"].includes(role)) {
    return { ok: false, reason: "Bare trenere kan sende 1:1-post." };
  }
  if (player.requiresGuardianConsent || player.age < 18) {
    const parent = parentRelations.find(
      (r) => r.childId === player.id && r.approved,
    );
    if (!parent) {
      return {
        ok: false,
        reason:
          "Posting sperret: spilleren er mindreårig og ingen foresatt er koblet.",
      };
    }
  }
  return { ok: true };
}

/** Append-only: nyeste rad per (userId, scope, mottaker) vinner. Aldri update. */
export function latestConsent(
  rows: readonly ConsentRow[],
  userId: string,
  scope: string,
  mottakerGruppeId: string,
): ConsentRow | null {
  const match = rows
    .filter(
      (r) =>
        r.userId === userId &&
        r.scope === scope &&
        r.mottakerGruppeId === mottakerGruppeId,
    )
    .sort((a, b) => (a.at < b.at ? 1 : -1));
  return match[0] ?? null;
}

export function canSetConsent(args: {
  actorRole: Role;
  player: Player;
}): boolean {
  if (args.player.requiresGuardianConsent || args.player.age < 18) {
    return args.actorRole === "FO";
  }
  return args.actorRole === "SP";
}

export function tournamentRowsFor(args: {
  role: Role;
  userId: string;
  rows: readonly {
    playerId: string;
    playerName: string;
    event: string;
    rounds: string;
    toPar: string;
    felt: string | null;
    kilde: "GOLFBOX" | "LAGT_INN_SELV";
    utkast: boolean;
  }[];
}): typeof args.rows {
  const { role, userId, rows } = args;
  if (role === "SP") {
    return rows.filter((r) => r.playerId === userId && !r.utkast);
  }
  return rows.filter((r) => (role === "SS" || role === "TR" || role === "HJ" ? true : false));
}

export function rankingVisible(role: Role): boolean {
  return SCREEN_ROLES.rangliste.includes(role);
}

export function selectionScoresForbidden(): true {
  return true;
}

export const ACCESS_DENIAL: Record<ScreenId, string> = {
  oversikt: "Ingen grupper tildelt.",
  spillere: "Workdesk er for trenere på egne grupper.",
  fellestesting: "Fellestesting er en arbeidsflate inne i egen gruppe.",
  samling: "Du har ikke tilgang til denne samlingen.",
  college: "Collegegruppen er begrenset.",
  manedsplan: "Du ser bare egen plan.",
  uttak: "Uttak er trenerens underlag. Spilleren ser resultatet, ikke vurderingen.",
  rangliste:
    "Ranglisten er trenerens flate. En utøver skal ikke se seg selv plassert mot lagkamerater.",
  skoler: "Skoleoversikten er aggregat for trenere og skolekontakt.",
  poster: "Poster til andre grupper er skjult.",
  utoverpost: "1:1-post krever tilknytning til utøveren.",
  dokumenter: "Dokumenter i andre grupper er skjult.",
  samtykke: "Samtykke styres av foresatt for mindreårige.",
  protokoller: "Protokollbiblioteket er for trenere.",
  protokolldetalj: "Hjelpetrener kan ikke åpne protokolldetalj.",
  turneringer: "Turneringer utenfor egne grupper er skjult.",
  "ny-turnering": "Du kan bare legge inn egen rad.",
  referanse: "Referansenivåer er åpne for gruppen, uten individuelle tall.",
  tilgang: "Bare sportssjef kan gi tilgang. Å gi tilgang er å kunne gi seg selv tilgang.",
  inviter: "Bare sportssjef kan invitere.",
  apparatet: "Katalogen gir ingen tilgang.",
};
