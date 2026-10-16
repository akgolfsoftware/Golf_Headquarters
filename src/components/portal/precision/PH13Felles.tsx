/**
 * Felles biter for pakke 4 «Øvelser og teknikk» (PH-12, PH-13, PH-TP-01): tilbakelenke og lastetilstand.
 * Fasit: docs/design-system/utkast-playerhq/ovelser.html.
 * Avvik:
 *   - Ingen egne avvik; avvikene per skjerm står i PH12VelgPlan, PH13DrillBank, PH13DrillDetalj,
 *     PH13BreakTabell og PHTP01TekniskPlan.
 *   - Ingen riggrad i tests/visual/skjerm-mapping.ts; målt med tests/visual/precision/maal.mjs PH-13.
 *
 * Ingen "use client": loading.tsx importerer aldri fra en klientmodul (gotchas §Bygg og drift).
 */
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-ovelser.css";
export { OvLaster } from "./PH13OvLaster";

export function OvTilbake({ href, tekst }: { href: string; tekst: string }) {
  return (
    <Link className="phn-ov-tilbake" href={href}>
      <ChevronLeft className="phn-ikon" aria-hidden />
      {tekst}
    </Link>
  );
}

