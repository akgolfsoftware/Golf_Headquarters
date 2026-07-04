import * as React from "react";

export interface KommandoElement {
  id?: string;
  ikon?: string;
  tittel: string;
  undertekst?: string;
  /** Tastatursnarvei-hint, f.eks. "⌘P". */
  snarvei?: string;
  onVelg?: (el: KommandoElement) => void;
}
export interface KommandoGruppe {
  tittel?: string;
  elementer: KommandoElement[];
}
export interface KommandoPalettProps {
  open?: boolean;
  onClose?: () => void;
  grupper: KommandoGruppe[];
  placeholder?: string;
  tomTekst?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * KommandoPalett — kanonisk ⌘K-palett: søk + grupperte hurtighandlinger + hopp-til.
 * Kontrollert (open/onClose). Tastatur ↑/↓/Enter/Esc, fokus i input, aria-listbox.
 * Kalleren eier ⌘K-trigger og handlingene (onVelg).
 */
export declare function KommandoPalett(props: KommandoPalettProps): JSX.Element | null;
