export interface ProgramLadderStep {
  title: string;
  meta?: string;
  /** done = --up-hake · active = eneste med CTA · locked = --muted + lås */
  status?: "done" | "active" | "locked";
  /** Kun aktivt steg: <Button size="sm">Start</Button> */
  action?: React.ReactNode;
}
export interface ProgramLadderProps {
  steps?: ProgramLadderStep[];
  /** XP-bar i --soft/--fg over stigen */
  xp?: { label: string; current: number; max: number };
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  dataOdId?: string;
}
