/**
 * Gyldig delsett av EndShotKategori for et gitt slag — avhenger av
 * slagtype (avledet av utledShotType) og om slaget hadde straffe.
 * Straffe er alltid sannheten om penalty (samme felt som brukes ellers i
 * runde-logg) — når straffe=true begrenses valgene til PENALTY_1/PENALTY_2
 * slik at de to feltene aldri kan motsi hverandre.
 */
import type { EndShotKategori, ShotType } from "@/generated/prisma/enums";

export function gyldigeEndShotKategorier(
  shotType: ShotType,
  straffe: boolean,
): EndShotKategori[] {
  if (shotType === "PUTT" || shotType === "DROP") return [];
  if (straffe) return ["PENALTY_1", "PENALTY_2"];
  if (shotType === "DRIVE") return ["IN_PLAY", "MINOR_MISS", "MAJOR_MISS"];
  return ["GREEN_HIT", "LETT", "MIDDELS", "VANSKELIG"];
}
