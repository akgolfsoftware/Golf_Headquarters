export interface ProvenanceRun {
  /** Klokkeslett for kjøringen, f.eks. "04:02" */
  at?: string;
  /** Varighet med enhet, f.eks. "1,8 s" */
  duration?: string;
  /** Kjørings-ID, mono */
  id?: string;
}
export interface ProvenanceDisclosureProps {
  /** Hvem: agentnavn eller menneske. Tom = saken er lagt inn manuelt */
  agent?: string;
  /** Hvilke data forslaget står på */
  data?: string;
  /** Hvilken regel eller invariant som utløste det */
  rule?: string;
  run?: ProvenanceRun;
  /** Default "Hvorfor?" — endre bare når konteksten krever et annet ord */
  label?: string;
  /** Åpen ved montering. Bruk på den ene saken øverst, aldri på alle */
  open?: boolean;
  dataOdId?: string;
}
