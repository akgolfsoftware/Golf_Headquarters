export interface DispersionMapProps {
  /** Avvik i px relativt sentrum; x+ = høyre (H), y− = langt */
  points?: { x: number; y: number }[];
  /** Standardavviks-ellipse i --info-raw */
  ellipse?: { rx: number; ry: number; cx?: number; cy?: number };
  /** Kølle + kontekst, f.eks. "Jern 7 · TrackMan" */
  club?: string;
  /** Alltid med enhet og retning: side (m H/V), depth (m), count */
  stats?: { side?: number; depth?: number; count?: number };
  size?: number;
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  dataOdId?: string;
}
