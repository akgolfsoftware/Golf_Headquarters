/**
 * Modalt sidelag: midlertidig arbeidsflate som eier oppmerksomheten til den
 * lukkes. Ikke det samme som artefaktpanelet (Panel), som krymper
 * hovedkolonnen og aldri er modalt.
 *
 * Under 880 px legger skuffen seg i full bredde, men riktig valg der er
 * BottomSheet — samme artefakt, annen innfatning.
 *
 * Fokusoppførselen kommer fra ./overlay-focus.jsx (modal: true).
 */
export interface DrawerProps {
  open?: boolean;
  title?: React.ReactNode;
  /** Mono-etikett over tittelen. */
  label?: string;
  /** Handlingsrad nederst; blir stående når innholdet skroller. */
  footer?: React.ReactNode;
  side?: "right" | "left";
  /** 560 px i stedet for 420 px. */
  wide?: boolean;
  /** Kun spesimenkort: rammer laget inn i kortet og slår av modalitet. */
  preview?: boolean;
  onClose?: (grunn?: string) => void;
  /** Ref til utløseren, så fokus kan gå tilbake dit ved lukking. */
  triggerRef?: React.RefObject<HTMLElement>;
  dataOdId?: string;
  children?: React.ReactNode;
}
export declare function Drawer(props: DrawerProps): JSX.Element | null;
