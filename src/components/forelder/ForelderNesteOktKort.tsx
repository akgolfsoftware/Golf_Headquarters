/**
 * FO-01 — neste økt, les-only. Kun TL. Aldri DRAFT. Kun fornavn.
 */

import { TL } from "@/lib/v2/train-lock";
import { TlKort, TlTomTilstand } from "@/components/admin/v2/oppsett/tl-kit";
import type { ForelderNesteOktKortData } from "@/lib/forelder-neste-okt";

export function ForelderNesteOktKort({ data }: { data: ForelderNesteOktKortData }) {
  if (!data) {
    return (
      <TlKort eyebrow="Neste økt">
        <TlTomTilstand icon="calendar" title="Ingen økt planlagt" sub="Når coachen publiserer en økt, vises den her." />
      </TlKort>
    );
  }
  return (
    <TlKort eyebrow={`Neste økt · ${data.fornavn}`}>
      <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.01em", color: TL.text }}>{data.tittel}</div>
      <div style={{ marginTop: 6, fontSize: 13, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>{data.tid}</div>
    </TlKort>
  );
}
