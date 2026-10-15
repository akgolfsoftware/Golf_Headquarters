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

export function OvTilbake({ href, tekst }: { href: string; tekst: string }) {
  return (
    <Link className="phn-ov-tilbake" href={href}>
      <ChevronLeft className="phn-ikon" aria-hidden />
      {tekst}
    </Link>
  );
}

/** Lastetilstand: skjelett i samme rekkefølge som skjermen, og teksten fra tegningen. */
export function OvLaster({ tekst, dato }: { tekst: string; dato: string }) {
  return (
    <div className="phn" aria-busy="true" style={{ boxSizing: "border-box" }}>
      <div className="phn-ov-topp">
        <span className="phn-dato">{dato}</span>
        <span className="phn-skjelett" style={{ width: 220, height: 32 }} />
      </div>
      <span className="phn-skjelett" style={{ height: 150 }} />
      <span className="phn-skjelett" style={{ height: 96 }} />
      <span className="phn-skjelett" style={{ height: 96 }} />
      <p className="phn-kilde" role="status">{tekst}</p>
    </div>
  );
}
