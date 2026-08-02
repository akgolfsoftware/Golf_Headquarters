export interface StatusCircleRowItem {
  title: string;
  meta?: string;
  /** done = --up-raw-fylt hake · active = 2px --fg-ring · todo = --border-ring */
  status?: "done" | "active" | "todo";
  /** Mono-tekst til høyre, f.eks. "12 min" */
  right?: string;
}
export interface StatusCircleRowProps {
  items?: StatusCircleRowItem[];
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  dataOdId?: string;
}
