/**
 * EmptyState — standardisert tom-tilstand for lister/dashbords.
 *
 * Mønster: ikon-sirkel + italic Instrument Serif tagline + sub-tekst + valgfri CTA.
 * Matchet mot demo-page-stilen.
 */
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  icon: LucideIcon;
  /** Italic-segment av hovedoverskriften (Instrument Serif) */
  titleItalic: string;
  /** Vanlig tekst etter italic-delen */
  titleTrail?: string;
  sub?: string;
  cta?: ReactNode;
};

export function EmptyState({
  icon: Icon,
  titleItalic,
  titleTrail,
  sub,
  cta,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/40 px-8 py-16 text-center">
      <div className="mb-5 grid h-14 w-14 place-items-center rounded-full bg-secondary text-muted-foreground">
        <Icon size={24} strokeWidth={1.5} />
      </div>
      <h3 className="font-display text-lg font-semibold leading-tight tracking-tight">
        <em className="font-normal italic text-primary">{titleItalic}</em>
        {titleTrail && <span className="text-foreground"> {titleTrail}</span>}
      </h3>
      {sub && (
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{sub}</p>
      )}
      {cta && <div className="mt-5">{cta}</div>}
    </div>
  );
}
