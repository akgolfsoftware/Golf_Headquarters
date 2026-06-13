/**
 * Delte typer for PlayerHQ Workbench (portal/planlegge).
 * Mappede Prisma-objekter serialiserbare fra server actions.
 */

export type Axis = "fys" | "tek" | "slag" | "spill" | "turn";
export type PyramidArea = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";

export type WorkbenchView = "week" | "day" | "list" | "kanban" | "dashboard";

export type WorkbenchPlan = {
  id: string;
  name: string;
  status: string;
  isActive: boolean;
  startDate: string;
  endDate: string | null;
  sessionCount: number;
};

export type WorkbenchSession = {
  id: string;
  planId: string;
  title: string;
  scheduledAt: string;
  durationMin: number;
  pyramidArea: PyramidArea;
  environment: string | null;
  status: string;
  drillCount: number;
};

export type WorkbenchDrill = {
  id: string;
  name: string;
  pyramidArea: PyramidArea;
  durationMin: number | null;
  repsSets: string | null;
};

export type WorkbenchStandardSession = {
  id: string;
  name: string;
  durationMinutes: number;
  pyramidArea: PyramidArea;
  drillCount: number;
};

export type WorkbenchTournament = {
  id: string;
  name: string;
  date: string | null;
  daysLeft: number | null;
  soon: boolean;
};

export type WorkbenchGoal = {
  id: string;
  title: string;
  category: string;
  type: string;
};

export type WorkbenchPyramidRow = {
  ax: Axis;
  lbl: string;
  hours: number;
};

export type WorkbenchData = {
  weekNumber: number;
  weekStart: string;
  weekEnd: string;
  plans: WorkbenchPlan[];
  activePlanId: string | null;
  sessions: WorkbenchSession[];
  standardSessions: WorkbenchStandardSession[];
  tournaments: WorkbenchTournament[];
  goals: WorkbenchGoal[];
  axisHours: WorkbenchPyramidRow[];
  summary: {
    sessionCount: number;
    plannedHours: number;
  };
  pendingAdjustments: number;
};

export type CalendarEvent = {
  id: string;
  dayIndex: number;
  hour: number;
  minute: number;
  durationMin: number;
  title: string;
  pyramidArea: PyramidArea;
  environment: string | null;
  drillCount: number;
  status: string;
  session: WorkbenchSession;
};

export type CalendarDay = {
  dow: string;
  date: string;
  today: boolean;
  sub: string;
  events: CalendarEvent[];
};
