/**
 * Workbench data layer contract — server actions / API shape.
 *
 * Implement with:
 * - Prisma models (Session, Drill, SourceItem …) or existing tables
 * - Next.js server actions or tRPC / route handlers
 * - Supabase realtime optional for multi-coach
 *
 * All write operations go through approval gates when createdBy === "AGENT".
 * Coach/player writes are direct (human approved by definition).
 */

import type {
  WorkbenchSession,
  SourceItem,
  CreateSessionCommand,
  MoveSessionCommand,
  PublishSessionCommand,
  AddDrillCommand,
  WeekViewModel,
  WorkbenchMode,
} from "../domain/types";

// ─── Read ───────────────────────────────────────────────────────

export interface LoadWeekParams {
  weekStart: string; // Monday YYYY-MM-DD
  mode: WorkbenchMode;
  /** Player target minutes for budget (from profile) */
  targetMinutes?: number;
}

/**
 * Returns full WeekViewModel including locked blocks (school, bookings).
 * Locked blocks come from existing school/booking tables — never editable here.
 */
export type LoadWeek = (params: LoadWeekParams) => Promise<WeekViewModel>;

/**
 * Source panel content: drills from bank + templates + previous weeks.
 * Filtered by player category / program when relevant.
 */
export type LoadSources = (params: {
  playerId: string;
  coachId: string;
}) => Promise<SourceItem[]>;

/**
 * Single session for inspector / deep link.
 */
export type LoadSession = (sessionId: string) => Promise<WorkbenchSession | null>;

// ─── Write ──────────────────────────────────────────────────────

export type CreateSession = (
  cmd: CreateSessionCommand
) => Promise<WorkbenchSession>;

export type MoveSession = (
  cmd: MoveSessionCommand
) => Promise<WorkbenchSession>;

export type PublishSessions = (
  cmds: PublishSessionCommand[]
) => Promise<WorkbenchSession[]>;

export type AddDrill = (cmd: AddDrillCommand) => Promise<WorkbenchSession>;

export type DeleteSession = (sessionId: string) => Promise<void>;

// ─── Player HQ consumption ──────────────────────────────────────────

/**
 * What Player HQ "I dag" and Plan need.
 * Only PUBLISHED (and IN_PROGRESS / COMPLETED) sessions.
 */
export interface PlayerDayPlan {
  date: string;
  sessions: Array<{
    id: string;
    title: string;
    startMinute: number;
    durationMinutes: number;
    pyramid: string;
    status: string;
    drillsCount: number;
    location?: string;
  }>;
  nextSessionId: string | null;
}

export type LoadPlayerDay = (params: {
  playerId: string;
  date: string;
}) => Promise<PlayerDayPlan>;

export type LoadPlayerWeek = (params: {
  playerId: string;
  weekStart: string;
}) => Promise<PlayerDayPlan[]>;

// ─── Suggested Prisma sketch (for implementer) ─────────────────────────────
/*
model WorkbenchSession {
  id              String   @id @default(cuid())
  playerId        String
  coachId         String
  groupId         String?
  date            DateTime @db.Date
  startMinute     Int
  durationMinutes Int
  title           String
  pyramid         String
  status          String   // DRAFT | PUBLISHED | …
  blockType       String   @default("OEKT")
  environment     String?
  practiceType    String?
  location        String?
  notes           String?
  publishedAt     DateTime?
  publishedBy     String?
  isAgentProposal Boolean  @default(false)
  planActionId    String?
  createdBy       String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  drills          WorkbenchDrill[]

  @@index([playerId, date])
  @@index([coachId, date])
  @@index([status])
}

model WorkbenchDrill {
  id              String   @id @default(cuid())
  sessionId       String
  session         WorkbenchSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  title           String
  description     String?
  durationMinutes Int
  akFormelJson    Json     // AKFormel
  techniqueFocus  String?
  sourceId        String?
  order           Int
}
*/
