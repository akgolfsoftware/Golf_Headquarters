/**
 * Bredt varselbånd over innhold (~10 skjermer). Samme tonevokabular og
 * ikonsett som Callout — ulik jobb: Callout forklarer inline, Banner
 * annonserer en sidetilstand og bærer en handling.
 *
 * Lukking er sesjonsbasert. Komponenten skriver ALDRI til localStorage.
 */
export interface BannerProps {
  tone?: "neutral" | "warn" | "info" | "privacy";
  /** Mono versaletikett i tonefarge: «VALIDERING», «DRIFT» */
  label?: string;
  /** Kort tittel i --disp 13.5/600. Bruk når teksten er mer enn én setning. */
  title?: React.ReactNode;
  /**
   * none (standard) — båndet finnes ved sidelasting, ingen rolle.
   * status — tilstand som oppstår uten at brukeren gjorde noe (drift, synk).
   * alert — KUN blokkerende validering utløst av en brukerhandling.
   */
  announce?: "none" | "status" | "alert";
  /** Én ghost-knapp. To handlinger finnes ikke i et bånd. */
  actionLabel?: string;
  onAction?: () => void;
  /** Viser lukkekryss. Skjul-tilstanden lever i sesjonen. */
  closable?: boolean;
  /** Kalles etter lukking. Skal skjermen huske valget, eier skjermen nøkkelen. */
  onClose?: () => void;
  dataOdId?: string;
  children?: React.ReactNode;
}
