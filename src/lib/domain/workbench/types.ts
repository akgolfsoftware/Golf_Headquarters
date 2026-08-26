/**
 * Workbench domain — pure types for AgencyOS + PlayerHQ planning.
 * Locked to VOKABULAR.md (18–20.08.2026) and Workbench masterplan.
 * No rules, only vocabulary. Player and coach plan freely.
 *
 * Norwegian UI labels live in ui/labels.ts — never hard-code strings here.
 */

// ─── Vocabulary enums (from VOKABULAR.md) ─────────────────────────────────

export type PyramidArea = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";

export type FullSwingArea =
  | "TEE"
  | "INNSPILL_200"
  | "INNSPILL_150"
  | "INNSPILL_100"
  | "INNSPILL_50";

export type NearGameArea = "CHIP" | "PITCH" | "LOB" | "BUNKER";

export type PuttBand =
  | "PUTT_0_3"
  | "PUTT_3_5"
  | "PUTT_5_10"
  | "PUTT_10_25"
  | "PUTT_25_40"
  | "PUTT_40_PLUSS";

export type PhysicalArea = "STYRKE" | "KONDISJON" | "BEVEGELIGHET";

export type CourseArea = "BANE";

export type TrainingArea =
  | FullSwingArea
  | NearGameArea
  | PuttBand
  | PhysicalArea
  | CourseArea;

export type Motorikk = "UTEN_BALL" | "LAV_HAST" | "AUTO"; // only full-swing

export type Belastning = "INNENDORS" | "TRENINGSOMRADE" | "BANE" | "KONKURRANSE";

export type Press = "ALENE" | "OBSERVERT" | "KONKURRANSE" | "TURNERING";

export type PeriodLabel =
  | "GRUNN"
  | "SPESIALISERING"
  | "TURNERING"
  | "EVALUERING"
  | "TESTUKE"
  | "FERIE"
  | "TRENINGSSAMLING"
  | "HELDAGSSAMLING";

export type BlockType =
  | "OEKT" // training session
  | "SKOLE"
  | "BOOKING"
  | "TURNERING"
  | "REISE"
  | "TEST"
  | "SJEKKPUNKT"
  | "HELSE"
  | "GRUPPEOEKT";

export type SessionStatus =
  | "DRAFT" // coach only, not visible to player
  | "SCHEDULED" // planned, visible after publish
  | "PUBLISHED" // visible to player in "I dag" / plan
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "SKIPPED";

export type PracticeType = "BLOKK" | "VARIABEL" | "KONKURRANSE" | "SPILL_TEST";

export type Environment =
  | "RANGE"
  | "BANE"
  | "STUDIO"
  | "HJEM"
  | "SIMULATOR"
  | "GYM";

export type RepType = "SVINGER_UTEN_BALL" | "BALLER" | "TID" | "SETT_REPS";

// ─── Core entities ──────────────────────────────────────────

export interface AKFormel {
  pyramid: PyramidArea;
  area: TrainingArea;
  motorikk?: Motorikk; // only when area is full-swing
  belastning?: Belastning;
  press?: Press;
  /** Human-readable chip string, e.g. "TEK · Chip · Lav hast · Alene" */
  label: string;
}

export interface Drill {
  id: string;
  title: string;
  description?: string;
  durationMinutes: number;
  akFormel: AKFormel;
  /** Optional technique focus (one only) */
  techniqueFocus?: string;
  sourceId?: string; // if dragged from bank
  order: number;
}

export interface SourceItem {
  id: string;
  kind: "DRILL" | "TEMPLATE" | "PROGRAM" | "PREVIOUS_WEEK";
  title: string;
  subtitle?: string;
  pyramid?: PyramidArea;
  area?: TrainingArea;
  durationMinutes?: number;
  /** Full drill payload when kind === DRILL */
  drill?: Omit<Drill, "id" | "order">;
  /** Template payload when kind === TEMPLATE */
  templateSessions?: WorkbenchSessionDraft[];
  tags?: string[];
}

/** Where a session came from — drives approval + propagation */
export type SessionOrigin = "PLAYER" | "COACH" | "GROUP";

export type ApprovalStatus = "PENDING" | "ACCEPTED" | "REJECTED";

/**
 * Serie (Loop 2T/B5): hvem en innholdsendring skal gjelde for når en økt er
 * del av en serie opprettet med "gjenta". Datofelt propagerer ALDRI — hver
 * forekomst beholder sin egen dag/tid, policy gjelder kun innhold/sletting.
 */
export type RecurrencePolicy = "DENNE" | "DENNE_OG_FREMOVER" | "HELE_SERIEN";

export interface WorkbenchSession {
  id: string;
  /** Owner of the private calendar row. For pure group master rows use a sentinel or group-scoped store. */
  playerId: string;
  coachId: string;

  /** Set when this row is a group master or was materialised from a group */
  groupId?: string;
  /** Points to the group master session when this is a per-player materialisation */
  sourceGroupSessionId?: string;

  /** Local date of the session (YYYY-MM-DD) — week is derived */
  date: string;
  /** Minutes from midnight (0–1439). Snap to 30 min grid. */
  startMinute: number;
  durationMinutes: number;

  title: string;
  pyramid: PyramidArea; // dominant area for colouring / budget
  status: SessionStatus;
  blockType: BlockType;

  environment?: Environment;
  practiceType?: PracticeType;
  location?: string;
  notes?: string;

  drills: Drill[];

  /** Origin + approval (see ACCESS-AND-GROUPS.md) */
  origin: SessionOrigin;
  needsPlayerApproval?: boolean;
  approvalStatus?: ApprovalStatus;
  /** Player edited a materialised group session locally — coach/group update waits for resolve */
  localOverride?: boolean;
  /**
   * Spilleren har avvist et forslag / valgt «Ikke delta» (Loop 3T, WB-10).
   * Skjuler økten i Agenda/«I dag» og listevisninger — SLETTER aldri. Agency
   * ser den fortsatt, markert SKJULT (økten i gruppen er uendret).
   */
  hiddenByPlayer?: boolean;

  /** Set when created via "gjenta" — shared by every occurrence in the series */
  seriesId?: string;
  /** 0-based position within the series */
  seriesIndex?: number;
  /** Saved for reuse in the sources panel ("Maler") */
  isTemplate?: boolean;

  /** Coach-only until published */
  publishedAt?: string; // ISO
  publishedBy?: string;

  /** Agent / AI provenance — not used inside Workbench UI (AI mode excluded) */
  isAgentProposal?: boolean;
  planActionId?: string;

  createdAt: string;
  updatedAt: string;
  createdBy: "COACH" | "PLAYER" | "AGENT";
}

export type WorkbenchSessionDraft = Omit<
  WorkbenchSession,
  "id" | "createdAt" | "updatedAt" | "status" | "publishedAt" | "publishedBy"
> & {
  status?: SessionStatus;
};

export interface Week {
  /** Monday of the ISO week as YYYY-MM-DD */
  weekStart: string;
  playerId: string;
  coachId: string;
  sessions: WorkbenchSession[];
  /** Optional period label for the week */
  period?: PeriodLabel;
  /** Live budget (computed, not stored) */
  budget?: WeekBudget;
}

export interface WeekBudget {
  plannedMinutes: number;
  targetMinutes: number;
  byPyramid: Record<PyramidArea, number>;
}

export interface WorkbenchMode {
  kind: "PLAYER" | "GROUP" | "AGENCY";
  /** Whose time is shown */
  subjectId: string; // playerId or groupId
  /** Visible source filters */
  sources: SourceFilter[];
}

// ─── Groups, membership & access (ACCESS-AND-GROUPS.md) ─────────────────────

/**
 * Academy / partner groups. License is included for active members.
 * Examples: GFGK (Mini/Utvikling/Basis/Elite), AK Golf Academy,
 * WANG Toppidretts Fredrikstad, AK Golf Performance, AK Golf Performance Pro.
 */
export interface Group {
  id: string;
  name: string;
  /** Optional level/tier label inside a club, e.g. "Elite", "Mini" */
  tier?: string;
  organizationId: string; // AK Golf or partner org
  active: boolean;
  createdAt: string;
}

/** Many-to-many: a player may belong to several groups at once. */
export interface GroupMembership {
  id: string;
  groupId: string;
  playerId: string;
  /** Inclusive membership window */
  startsAt: string; // ISO date
  endsAt?: string; // ISO date; undefined = ongoing
  active: boolean;
}

/**
 * Why a coach/agency may see and plan for a player.
 * Derived from active GroupMembership (license included) OR an explicit purchase.
 */
export type EntitlementSource =
  | "GROUP_LICENSE" // member of GFGK / WANG / Performance / etc.
  | "PURCHASE"; // self-serve bought online instruction / coach product

export interface CoachAccessEntitlement {
  id: string;
  playerId: string;
  /** Coach or agency org that receives access */
  granteeId: string;
  source: EntitlementSource;
  /** When source === GROUP_LICENSE */
  groupId?: string;
  /** When source === PURCHASE — product SKU e.g. "online_instruction_v2" */
  productCode?: string;
  startsAt: string;
  endsAt?: string;
  active: boolean;
}

/**
 * Hard gate for every Agency loader:
 * visible ⇔ player has ≥1 active GroupMembership OR ≥1 active CoachAccessEntitlement
 * for this coach/org. Self-serve without purchase = invisible.
 */
export function playerIsVisibleToCoach(
  memberships: GroupMembership[],
  entitlements: CoachAccessEntitlement[],
  playerId: string,
  granteeId: string,
  now = new Date().toISOString()
): boolean {
  const activeMember = memberships.some(
    (m) =>
      m.playerId === playerId &&
      m.active &&
      m.startsAt <= now &&
      (!m.endsAt || m.endsAt >= now)
  );
  if (activeMember) return true;
  return entitlements.some(
    (e) =>
      e.playerId === playerId &&
      e.granteeId === granteeId &&
      e.active &&
      e.startsAt <= now &&
      (!e.endsAt || e.endsAt >= now)
  );
}

export type SourceFilter =
  | "OEKTER"
  | "SKOLE"
  | "BOOKING"
  | "TURNERING"
  | "TESTER"
  | "HELSE"
  | "GRUPPE";

// ─── Commands (write side) ────────────────────────────────────────

export interface CreateSessionCommand {
  playerId: string;
  coachId: string;
  date: string;
  startMinute: number;
  durationMinutes: number;
  title: string;
  pyramid: PyramidArea;
  blockType?: BlockType;
  drills?: Omit<Drill, "id" | "order">[];
  environment?: Environment;
  notes?: string;
  createdBy: "COACH" | "PLAYER";
  /** When planning in GROUP mode — triggers materialisation to all active members */
  groupId?: string;
  origin?: SessionOrigin;
}

/** Create one group master + materialise to every active member */
export interface CreateGroupSessionCommand {
  groupId: string;
  coachId: string;
  date: string;
  startMinute: number;
  durationMinutes: number;
  title: string;
  pyramid: PyramidArea;
  blockType?: BlockType;
  drills?: Omit<Drill, "id" | "order">[];
  environment?: Environment;
  notes?: string;
  /** Active member playerIds at time of create (caller resolves membership) */
  memberPlayerIds: string[];
}

export interface PropagateGroupUpdateCommand {
  sourceGroupSessionId: string;
  patch: Partial<
    Pick<
      WorkbenchSession,
      | "date"
      | "startMinute"
      | "durationMinutes"
      | "title"
      | "pyramid"
      | "drills"
      | "notes"
      | "status"
      | "environment"
    >
  >;
}

export interface ResolvePlayerApprovalCommand {
  sessionId: string;
  decision: "ACCEPTED" | "REJECTED";
  /** When REJECTED on a group update with localOverride — keep player version */
  keepLocal?: boolean;
}

/** Innholdsfelter en serie-endring kan røre. Dato/tid propagerer aldri. */
export type SeriesContentPatch = Partial<
  Pick<WorkbenchSession, "title" | "pyramid" | "blockType" | "environment" | "notes">
>;

export interface UpdateSeriesSessionCommand {
  sessionId: string;
  patch: SeriesContentPatch;
  policy: RecurrencePolicy;
}

export interface DeleteSeriesSessionCommand {
  sessionId: string;
  policy: RecurrencePolicy;
}

export interface MoveSessionCommand {
  sessionId: string;
  newDate: string;
  newStartMinute: number;
  /** Optional resize */
  newDurationMinutes?: number;
}

export interface PublishSessionCommand {
  sessionId: string;
  publishedBy: string;
}

export interface AddDrillCommand {
  sessionId: string;
  drill: Omit<Drill, "id" | "order">;
  /** Insert at index, default end */
  atIndex?: number;
}

export interface ReorderDrillsCommand {
  sessionId: string;
  orderedDrillIds: string[];
}

// ─── Read models for UI ───────────────────────────────────────

export interface DayColumn {
  date: string; // YYYY-MM-DD
  weekday: number; // 1=Mon … 7=Sun
  sessions: WorkbenchSession[];
  lockedBlocks: LockedBlock[]; // school, bookings etc.
}

export interface LockedBlock {
  id: string;
  startMinute: number;
  durationMinutes: number;
  title: string;
  kind: "SKOLE" | "BOOKING" | "TURNERING" | "REISE" | "HELSE";
  dimmed: true;
}

export interface WeekViewModel {
  weekStart: string;
  days: DayColumn[];
  budget: WeekBudget;
  mode: WorkbenchMode;
}
