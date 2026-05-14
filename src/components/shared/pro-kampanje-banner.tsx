import { Gift } from "lucide-react";
import { PRO_KAMPANJE_INFO } from "@/lib/feature-flags";

/**
 * Banner som varsler at alle har Pro-tilgang frem til 1. juni.
 * Returnerer null hvis kampanjen er utløpt.
 */
export function ProKampanjeBanner() {
  if (!PRO_KAMPANJE_INFO.aktiv) return null;

  return (
    <div className="rounded-md border border-accent/40 bg-accent/10 px-4 py-4 text-sm text-foreground">
      <div className="flex items-start gap-4">
        <Gift size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-primary" />
        <div>
          <div className="font-semibold">
            <em className="font-normal italic">Alle</em> har Pro-tilgang frem
            til {PRO_KAMPANJE_INFO.utlopFormatted}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            AI-coach, egne økter, direkte kontakt med trener — alt er åpent for
            alle i denne perioden. Ingen handling nødvendig.
          </p>
        </div>
      </div>
    </div>
  );
}
