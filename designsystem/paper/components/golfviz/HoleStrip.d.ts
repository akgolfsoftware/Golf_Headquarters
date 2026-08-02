export interface HoleStripProps {
  /** 18 hull (rendres 9+9); SG-farge KUN som tekstfarge, aldri fylte celler */
  holes?: { hole: number; sg: number }[];
  window?: string;
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  dataOdId?: string;
}
