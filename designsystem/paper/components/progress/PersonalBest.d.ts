export interface PersonalBestProps {
  /** Etikett, default "Pers" */
  label?: string;
  /** Ferdig formatert verdi, f.eks. "68" eller "+4,1" */
  value?: string;
  unit?: string;
  /** Når rekorden ble satt */
  date?: string;
  /** Kontekst, f.eks. "Miklagard · turnering" */
  context?: string;
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  dataOdId?: string;
}
