export interface NowNextBlock {
  title: string;
  meta?: string;
  /** 0–1 — tynn --fg-progress, kun på nå-blokken */
  progress?: number;
}
export interface NowNextProps {
  now?: NowNextBlock;
  next?: NowNextBlock;
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  dataOdId?: string;
}
