"use client";

/**
 * CourseMap — Mapbox GL satellitt-banekart for Gameplan (B30, omdøpt fra
 * "Baneguide"). Tegner banens GeoJSON-geometri (green/fairway/bunker/tee/vann)
 * oppå satellitt og markerer tee → green per hull.
 *
 * Interaktiv modus (Gameplan hull-for-hull-planlegging, C7): når `interactive`
 * er satt, kaller kartet `onKlikk` med ekte GPS-koordinater ved klikk/tapp —
 * ingen piksel-matte, ingen tastet avstand. `sikte`/`soner` rendres som egne
 * lag som oppdateres live via `setData` (opprettet én gang i `load`-handleren,
 * siden selve kartet kun mountes én gang — se effekten under).
 *
 * Farger: lib/gameplan/map-colors.ts — det dokumenterte canvas-unntaket fra
 * ingen-rå-hex-regelen.
 */

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MAP_COLORS, DISPERSION_COLORS, GAMEPLAN_COLORS } from "@/lib/gameplan/map-colors";
import { circlePolygon, haversine } from "@/lib/gameplan/dispersion";

export type CourseMapHole = {
  holeNumber: number;
  par: number | null;
  teeLat: number | null;
  teeLng: number | null;
  greenLat: number | null;
  greenLng: number | null;
};

export type LatLngPoint = { lat: number; lng: number };

export type GameplanSoneVisning = {
  id: string;
  /** "bra" = trygt å misse i (grønn), "aldri" = dyr sone (rød). */
  type: "bra" | "aldri";
  senter: LatLngPoint;
  radiusMeter: number;
};

export type CourseMapProps = {
  center: { lat: number; lng: number };
  geojson: GeoJSON.FeatureCollection;
  holes?: CourseMapHole[];
  zoom?: number;
  className?: string;
  /** Spillerens landingspunkter (GPS) — tegnes som lime prikker. */
  shotPoints?: { lat: number; lng: number }[];
  /** Sikte-linje tee → green for ett hull. */
  aimLine?: { tee: { lat: number; lng: number }; green: { lat: number; lng: number } } | null;
  /** Gameplan interaktiv modus: kartet blir klikkbart (crosshair-cursor). */
  interactive?: boolean;
  /** Kalles med ekte lat/lng ved klikk når `interactive` er satt. */
  onKlikk?: (p: LatLngPoint) => void;
  /** Spillerens valgte sikte for hullet (Gameplan-modus). */
  sikte?: LatLngPoint | null;
  /** Malte soner (bra/aldri) for hullet (Gameplan-modus). */
  soner?: GameplanSoneVisning[];
};

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const SONE_FARGE: Record<GameplanSoneVisning["type"], { fill: string; line: string }> = {
  bra: { fill: "rgba(79,208,138,0.20)", line: GAMEPLAN_COLORS.soneBra },
  aldri: { fill: "rgba(224,93,68,0.20)", line: GAMEPLAN_COLORS.soneAldri },
};

function sonerTilGeojson(soner: GameplanSoneVisning[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: soner.map((s) => ({
      type: "Feature",
      properties: { type: s.type },
      geometry: { type: "Polygon", coordinates: [circlePolygon(s.senter, s.radiusMeter)] },
    })),
  };
}

export function CourseMap({
  center,
  geojson,
  holes = [],
  zoom = 15.5,
  className,
  shotPoints = [],
  aimLine = null,
  interactive = false,
  onKlikk,
  sikte = null,
  soner = [],
}: CourseMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const sikteMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const onKlikkRef = useRef(onKlikk);
  const [lastet, setLastet] = useState(false);

  useEffect(() => {
    onKlikkRef.current = onKlikk;
  }, [onKlikk]);

  useEffect(() => {
    if (!TOKEN || !containerRef.current || mapRef.current) return;
    mapboxgl.accessToken = TOKEN;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: [center.lng, center.lat],
      zoom,
      attributionControl: true,
    });
    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

    map.on("load", () => {
      map.addSource("course", { type: "geojson", data: geojson });

      // Areal-lag per golf-type (polygoner)
      const fill = (id: string, golf: string, color: string, opacity: number) => {
        map.addLayer({
          id,
          type: "fill",
          source: "course",
          filter: ["all", ["==", ["geometry-type"], "Polygon"], ["==", ["get", "golf"], golf]],
          paint: { "fill-color": color, "fill-opacity": opacity },
        });
      };
      fill("course-fairway", "fairway", MAP_COLORS.fairway, 0.25);
      fill("course-green", "green", MAP_COLORS.green, 0.55);
      fill("course-bunker", "bunker", MAP_COLORS.bunker, 0.6);
      fill("course-tee", "tee", MAP_COLORS.tee, 0.5);
      fill("course-water", "water_hazard", MAP_COLORS.water, 0.45);
      fill("course-water2", "lateral_water_hazard", MAP_COLORS.water, 0.45);

      // Hull-senterlinjer
      map.addLayer({
        id: "course-holeline",
        type: "line",
        source: "course",
        filter: ["all", ["==", ["geometry-type"], "LineString"], ["==", ["get", "golf"], "hole"]],
        paint: {
          "line-color": MAP_COLORS.holeLine,
          "line-width": 2,
          "line-dasharray": [2, 2],
          "line-opacity": 0.8,
        },
      });

      // Hull-markører (tee + green) med nummer
      for (const h of holes) {
        if (h.teeLat != null && h.teeLng != null) {
          const el = document.createElement("div");
          el.className = "ak-hole-marker";
          el.textContent = String(h.holeNumber);
          new mapboxgl.Marker({ element: el })
            .setLngLat([h.teeLng, h.teeLat])
            .setPopup(
              new mapboxgl.Popup({ offset: 16, closeButton: false }).setText(
                `Hull ${h.holeNumber}${h.par ? ` · par ${h.par}` : ""}`,
              ),
            )
            .addTo(map);
        }
      }

      // Sikte-linje tee → green (hull-detalj)
      if (aimLine) {
        map.addSource("aim", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: [
                [aimLine.tee.lng, aimLine.tee.lat],
                [aimLine.green.lng, aimLine.green.lat],
              ],
            },
          },
        });
        map.addLayer({
          id: "course-aim",
          type: "line",
          source: "aim",
          paint: { "line-color": DISPERSION_COLORS.aimLine, "line-width": 1.5, "line-dasharray": [3, 3], "line-opacity": 0.6 },
        });
      }

      // Spillerens landingspunkter
      if (shotPoints.length > 0) {
        map.addSource("shots", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: shotPoints.map((p) => ({
              type: "Feature" as const,
              properties: {},
              geometry: { type: "Point" as const, coordinates: [p.lng, p.lat] },
            })),
          },
        });
        map.addLayer({
          id: "course-shots",
          type: "circle",
          source: "shots",
          paint: {
            "circle-radius": 5,
            "circle-color": DISPERSION_COLORS.shotPoint,
            "circle-stroke-color": DISPERSION_COLORS.shotPointStroke,
            "circle-stroke-width": 1,
          },
        });
      }

      // Gameplan-soner (bra/aldri) — kilde opprettes tom, fylles via setData
      // i den egne sikte/soner-effekten under (kan endre seg etter mount).
      map.addSource("gp-soner", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
      map.addLayer({
        id: "gp-soner-fill",
        type: "fill",
        source: "gp-soner",
        paint: {
          "fill-color": ["match", ["get", "type"], "aldri", SONE_FARGE.aldri.fill, SONE_FARGE.bra.fill],
        },
      });
      map.addLayer({
        id: "gp-soner-line",
        type: "line",
        source: "gp-soner",
        paint: {
          "line-color": ["match", ["get", "type"], "aldri", SONE_FARGE.aldri.line, SONE_FARGE.bra.line],
          "line-width": 1.6,
        },
      });

      if (interactive) {
        map.getCanvas().style.cursor = "crosshair";
        map.on("click", (e) => {
          onKlikkRef.current?.({ lat: e.lngLat.lat, lng: e.lngLat.lng });
        });
      }

      setLastet(true);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // Kjør én gang ved mount; bane endres ved full remount (key på parent).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Gameplan-soner: oppdater kilden når `soner` endres (etter at kartet er lastet).
  useEffect(() => {
    if (!lastet || !mapRef.current) return;
    const source = mapRef.current.getSource("gp-soner") as mapboxgl.GeoJSONSource | undefined;
    source?.setData(sonerTilGeojson(soner));
  }, [lastet, soner]);

  // Gameplan-sikte: egen Mapbox-marker (lime crosshair), flyttes med .setLngLat
  // i stedet for remount — unngår DOM-thrashing ved hver dra-bevegelse.
  useEffect(() => {
    if (!lastet || !mapRef.current) return;
    const map = mapRef.current;

    if (!sikte) {
      sikteMarkerRef.current?.remove();
      sikteMarkerRef.current = null;
      return;
    }

    if (!sikteMarkerRef.current) {
      const el = document.createElement("div");
      el.className = "ak-gp-sikte";
      sikteMarkerRef.current = new mapboxgl.Marker({ element: el, draggable: interactive });
      if (interactive) {
        sikteMarkerRef.current.on("dragend", () => {
          const lngLat = sikteMarkerRef.current?.getLngLat();
          if (lngLat) onKlikkRef.current?.({ lat: lngLat.lat, lng: lngLat.lng });
        });
      }
      sikteMarkerRef.current.addTo(map);
    }
    sikteMarkerRef.current.setLngLat([sikte.lng, sikte.lat]);
  }, [lastet, sikte, interactive]);

  if (!TOKEN) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl border border-border bg-secondary p-8 text-center text-sm text-muted-foreground ${className ?? ""}`}
      >
        Mapbox-token mangler. Legg <code className="font-mono">NEXT_PUBLIC_MAPBOX_TOKEN</code> i
        .env.local og start dev-serveren på nytt.
      </div>
    );
  }

  return (
    <>
      <div ref={containerRef} className={className} />
      <style>{`
        .ak-hole-marker {
          display: flex; align-items: center; justify-content: center;
          width: 24px; height: 24px; border-radius: 9999px;
          background: ${MAP_COLORS.tee}; color: ${MAP_COLORS.fairway};
          font-family: var(--font-mono, monospace); font-size: 12px; font-weight: 700;
          border: 2px solid #fff; box-shadow: 0 1px 4px rgba(0,0,0,.4); cursor: pointer;
        }
        .ak-gp-sikte {
          width: 22px; height: 22px; border-radius: 9999px;
          border: 3px solid ${GAMEPLAN_COLORS.sikte}; background: rgba(209,248,67,0.18);
          box-shadow: 0 1px 6px rgba(0,0,0,.5); cursor: ${interactive ? "grab" : "default"};
        }
      `}</style>
    </>
  );
}

/** Carry (tee→sikte) og igjen (sikte→green) i meter, avrundet — aldri tastet. */
export function gameplanAvstander(tee: LatLngPoint, sikte: LatLngPoint, green: LatLngPoint) {
  return {
    carry: Math.round(haversine(tee, sikte)),
    igjen: Math.round(haversine(sikte, green)),
  };
}
