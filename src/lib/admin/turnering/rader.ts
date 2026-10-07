/**
 * Bygger radene til AG-17 fra basen. Felt som ikke finnes er null og vises som «—».
 * Ingen koordinater, nivå eller sted utledes (tidligere ble lat/lon laget av radnummeret).
 */

import type { TurneringRad } from "@/components/admin/precision/AG17Turneringer";
import type { TurneringAlleRad } from "@/lib/admin/turnering/lastere";

type MineRad = {
  key: string;
  navn: string;
  datoTekst: string;
  anlegg: string | null;
  paameldte: number;
};

function gyldigKoordinat(v: number | null | undefined, min: number, max: number): number | null {
  return typeof v === "number" && Number.isFinite(v) && v >= min && v <= max ? v : null;
}

export function byggTurneringRader(alle: TurneringAlleRad[], mine: MineRad[]): TurneringRad[] {
  const mineVedNokkel = new Map(mine.map((m) => [m.key, m]));
  const sett = new Set<string>();

  const fraAlle: TurneringRad[] = alle.map((r) => {
    sett.add(r.id);
    const m = mineVedNokkel.get(r.id);
    return {
      id: r.id,
      name: r.navn,
      date: r.datoTekst,
      course: r.anlegg,
      lat: gyldigKoordinat(r.latitude, -90, 90),
      lon: gyldigKoordinat(r.longitude, -180, 180),
      paameldte: m ? m.paameldte : null,
      st: m ? "Påmeldt" : null,
    };
  });

  // Stallens påmeldinger som ikke ligger på denne siden av «Alle» (inkl. manuelle).
  const ekstra: TurneringRad[] = mine
    .filter((m) => !sett.has(m.key))
    .map((m) => ({
      id: m.key,
      name: m.navn,
      date: m.datoTekst,
      course: m.anlegg,
      lat: null,
      lon: null,
      paameldte: m.paameldte,
      st: "Påmeldt" as const,
    }));

  return [...fraAlle, ...ekstra];
}
