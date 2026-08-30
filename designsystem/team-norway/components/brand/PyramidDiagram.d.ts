export interface PyramidLevel {
  name: string;
  caption?: string;
}
export interface PyramidDiagramProps {
  /** Toppen først. Standard er de kanoniske kortformene TURN/SPILL/SLAG/TEK/FYS. */
  levels?: PyramidLevel[];
  /** Indeks på aktivt nivå — fylles rødt, etiketten markeres. */
  active?: number;
  onSelect?: (index: number) => void;
  width?: number;
  showCaptions?: boolean;
}
export declare function PyramidDiagram(props: PyramidDiagramProps): JSX.Element;