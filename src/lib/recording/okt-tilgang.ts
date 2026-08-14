/**
 * Hvem kan ta opp en gitt treningsøkt.
 *
 * Ren beslutning, skilt fra /api/recording/start så den kan testes uten
 * HTTP-lag. Selve oppslagene (økt finnes, spillertilgang, lydsamtykke) gjøres
 * i ruten — her avgjøres kun utfallet av dem.
 */

export type OktTilgangInput = {
  viewerRole: string;
  viewerId: string;
  /** coachId på økta. */
  oktCoachId: string;
  /** studentId på økta. null = økta har ingen spiller. */
  oktStudentId: string | null;
  /** Resultat av harCoachTilgangTilSpiller(viewer, studentId). */
  harTilgangTilSpiller: boolean;
};

export type OktTilgangUtfall =
  | { ok: true; playerId: string }
  | { ok: false; grunn: "mangler-spiller" | "ingen-tilgang" };

export function vurderOktOpptakTilgang(input: OktTilgangInput): OktTilgangUtfall {
  const { viewerRole, viewerId, oktCoachId, oktStudentId, harTilgangTilSpiller } = input;

  // Uten spiller finnes det ingen å knytte opptaket — eller samtykket — til.
  if (!oktStudentId) return { ok: false, grunn: "mangler-spiller" };

  // ADMIN slipper gjennom (samme som resten av opptaks-API-et).
  if (viewerRole === "ADMIN") return { ok: true, playerId: oktStudentId };

  // Coachen som eier økta, eller som har spilleren i stallen sin.
  if (oktCoachId === viewerId || harTilgangTilSpiller) {
    return { ok: true, playerId: oktStudentId };
  }

  return { ok: false, grunn: "ingen-tilgang" };
}
