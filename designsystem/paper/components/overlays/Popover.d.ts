/**
 * Ikke-modalt lag med innhold og handlinger, forankret til en utløser.
 *
 * Velg mellom de fire lagene etter innholdet, ikke etter størrelsen:
 * Tooltip = ren tekst, ingen fokus · DropdownMenu = liste av valg ·
 * Popover = innhold med inntil et par handlinger · Drawer/Modal = modal.
 *
 * Fokusoppførselen kommer fra ./overlay-focus.jsx. Popover eier ikke
 * fokuskontrakten, den konsumerer den.
 */
export interface PopoverProps {
  /** Ett element (typisk Button). Får aria-haspopup="dialog", aria-expanded og ref. */
  trigger: React.ReactElement;
  /** Overskrift i laget. Uten tittel får laget aria-label fra `label`. */
  title?: React.ReactNode;
  /** Mono-etikett over tittelen — eller aria-label når tittel mangler. */
  label?: string;
  /** Handlinger nederst. Maks to; trengs flere er innholdet en flate. */
  footer?: React.ReactNode;
  /** auto (standard) måler og forankrer innover ved kanten. */
  align?: "auto" | "left" | "right";
  side?: "bottom" | "top";
  /** 360 px i stedet for 288 px. */
  wide?: boolean;
  /** Styrt modus. Utelates for ustyrt. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  dataOdId?: string;
  children?: React.ReactNode;
}
export declare function Popover(props: PopoverProps): JSX.Element;
