export interface SegmentControlProps {
  /** Tekstetiketter, f.eks. ["Uke", "Måned", "År"] */
  options?: string[];
  /** Aktivt valg (må matche en option) */
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  dataOdId?: string;
}
