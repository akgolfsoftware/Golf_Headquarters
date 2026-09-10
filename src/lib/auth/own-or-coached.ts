import { harCoachTilgangTilSpiller } from "./coached";

/** Bruk serverens innloggede bruker, aldri en rolle sendt fra klienten. */
export async function canAccessPlayer(
  viewer: { id: string; role: string },
  playerId: string,
): Promise<boolean> {
  if (!playerId) return false;
  if (viewer.id === playerId) return true;
  if (viewer.role !== "COACH" && viewer.role !== "ADMIN") return false;
  return harCoachTilgangTilSpiller(viewer, playerId);
}
