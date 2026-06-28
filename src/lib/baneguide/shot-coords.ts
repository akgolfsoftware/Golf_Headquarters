/**
 * Koordinat-konvensjon for slag-posisjon (baneguide/dispersion).
 *
 * Shot-modellen har startX/startY/endX/endY (Float?). For baneguiden tolker
 * vi dem som WGS84-GPS (besluttet 2026-06-28):
 *   X = longitude (øst/vest)
 *   Y = latitude  (nord/sør)
 * start = der slaget ble slått fra · end = der ballen landet.
 *
 * Hold ALL konvertering her, så resten av appen slipper å huske hva X/Y er.
 */

export type LatLng = { lat: number; lng: number };

export type ShotCoords = {
  start: LatLng | null;
  end: LatLng | null;
};

type ShotXY = {
  startX: number | null;
  startY: number | null;
  endX: number | null;
  endY: number | null;
};

/** Les en Shot-rad som start/slutt-GPS. */
export function shotToCoords(shot: ShotXY): ShotCoords {
  return {
    start: shot.startX != null && shot.startY != null ? { lat: shot.startY, lng: shot.startX } : null,
    end: shot.endX != null && shot.endY != null ? { lat: shot.endY, lng: shot.endX } : null,
  };
}

/** Skriv start/slutt-GPS til Shot-kolonner (X=lng, Y=lat). */
export function coordsToShotXY(coords: { start?: LatLng | null; end?: LatLng | null }): ShotXY {
  return {
    startX: coords.start?.lng ?? null,
    startY: coords.start?.lat ?? null,
    endX: coords.end?.lng ?? null,
    endY: coords.end?.lat ?? null,
  };
}
