/**
 * AgencyOS — Ny drill
 * Oppretter en ExerciseDefinition via createDrill-action. Speiler felt-settet
 * fra rediger-skjemaet, men starter blankt.
 *
 * V2 chrome via (legacy)/layout V2Shell. Header: Caps/Tittel/TilbakeLenke.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { Caps, Tittel, TilbakeLenke } from "@/components/v2";
import { T } from "@/lib/v2/tokens";
import { DrillCreateForm } from "./drill-create-form";

export default async function NyDrillPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap, paddingBottom: 80 }}>
      <TilbakeLenke href="/admin/drills">Tilbake til biblioteket</TilbakeLenke>
      <div>
        <Caps>AgencyOS · Ny drill</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="drill">Ny</Tittel>
        </div>
        <p style={{ marginTop: 8, maxWidth: 520, fontFamily: T.ui, fontSize: 13, color: T.fg2, lineHeight: 1.5 }}>
          Legg til en øvelse i biblioteket. Du kan finjustere alle felt etterpå fra drill-detaljen.
        </p>
      </div>
      <DrillCreateForm />
    </div>
  );
}
