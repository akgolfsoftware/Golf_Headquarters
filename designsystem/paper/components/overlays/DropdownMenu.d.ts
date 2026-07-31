/**
 * Gruppert popover-meny med seksjonsetiketter og separatorer (~15 skjermer).
 * «Opprett»-menyen er én instans.
 *
 * Fokusoppførselen kommer fra ./overlay-focus.jsx — den delte
 * implementasjonen av fokuskontrakten i readme.md. DropdownMenu eier
 * ikke kontrakten, den konsumerer den, og det samme skal ConfirmDialog,
 * Modal, BottomSheet, CommandPalette, ContextMenu og FlyoutPanel gjøre.
 */
export interface DropdownItem {
  /** Utelates for type separator/label */
  id?: string;
  type?: "item" | "separator" | "label";
  /** Etikettteksten for type label */
  text?: React.ReactNode;
  /** Høyrejustert mono-notat: hurtigtast, antall */
  note?: React.ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
  /** dn = destruktivt valg (--dn tekst). Ingen fylt farge. */
  tone?: "default" | "dn";
}
export interface DropdownMenuProps {
  /** Ett <Button>-element. Får aria-haspopup/aria-expanded og ref automatisk. */
  trigger: React.ReactElement;
  items: DropdownItem[];
  /** auto (standard) — måler og forankrer innover når utløseren er nær kanten · left/right overstyrer eksplisitt */
  align?: "auto" | "left" | "right";
  /** aria-label på menyen når utløserens tekst ikke er nok */
  label?: string;
  /** Åpen ved montering. Kun for spesimenkort og dokumentasjon — i produkt styres menyen av brukeren. */
  defaultOpen?: boolean;
  dataOdId?: string;
  onOpenChange?: (open: boolean) => void;
}
