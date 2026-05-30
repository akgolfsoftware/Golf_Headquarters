import { forwardRef } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";

/**
 * @deprecated Bruk `Button` fra `@/components/ui` i stedet.
 *
 * Thin wrapper rundt den nye `Button`-primitiven. Beholder "lime" som default
 * variant for bakoverkompatibilitet med 51 eksisterende call-sites — de
 * fortsetter å fungere uendret. Ny kode skal bruke `Button` direkte (med
 * "primary" som default, slik spec sier er korrekt for vanlig CTA).
 *
 * Migrering:
 *   - import { AthleticButton } from "@/components/athletic"
 *   + import { Button } from "@/components/ui"
 *
 * NB: Hvis call-site ikke spesifiserte variant, ble den lime — vurder om
 * den faktisk burde vært "primary" når du migrerer.
 */

export type AthleticButtonProps = ButtonProps;

export const AthleticButton = forwardRef<HTMLButtonElement, ButtonProps>(
  function AthleticButton({ variant = "lime", ...rest }, ref) {
    return <Button ref={ref} variant={variant} {...rest} />;
  },
);
