/**
 * Dialog — det som ligger over alt annet. Én oppgave, én primærhandling.
 * Escape lukker, fokus fanges og returneres. Loft 3, radius lg, ingen blur.
 */
export interface DialogProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  open: boolean;
  tittel: string;
  beskrivelse?: string;
  /** Knappene nederst til høyre. Én primær, resten sekundær eller tekst. */
  handlinger?: React.ReactNode;
  onLukk?: () => void;
  /** Maks bredde i px. Standard 480. */
  bredde?: number;
  /** Rendrer panelet i flyt i stedet for fast over siden — til dokumentasjon. */
  innebygd?: boolean;
  children?: React.ReactNode;
}
export function Dialog(props: DialogProps): JSX.Element | null;
