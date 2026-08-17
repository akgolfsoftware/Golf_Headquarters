import { Smartphone } from "lucide-react";

/**
 * «Vri telefonen»-overlay (beslutning 16.08.2026, beslutninger.md §PP-A):
 * appen designes for stående visning på mobil. Installert PWA låses via
 * manifestets `orientation: "portrait"`, men Safari-fane kan ikke låses —
 * der viser vi dette overlayet i stedet for å la layouten brekke.
 *
 * Ren CSS (media query i globals.css §.ak-vri-telefonen): synlig KUN ved
 * landscape + lav høyde (≤ 500px), altså telefon på siden — aldri iPad.
 * Ingen JS, ingen hydrering, ingen layout-påvirkning i portrett.
 */
export function VriTelefonen() {
  return (
    <div className="ak-vri-telefonen" role="status">
      <Smartphone size={40} strokeWidth={1.5} aria-hidden style={{ transform: "rotate(90deg)" }} />
      <p className="ak-vri-telefonen-tittel">Vri telefonen</p>
      <p className="ak-vri-telefonen-tekst">Appen er laget for stående visning.</p>
    </div>
  );
}
