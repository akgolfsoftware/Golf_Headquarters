"use client";

/**
 * CourseMap — Mapbox GL satellitt-banekart for baneguiden.
 * Tegner banens GeoJSON-geometri (green/fairway/bunker/tee/vann) oppå
 * satellitt og markerer tee → green per hull. Dispersion-lag legges på
 * senere (fase 3-5) via `shots`-prop.
 *
 * TODO(design-tokens): kart-paletten under bør formaliseres som CSS-tokens
 * og godkjennes av Anders. Mapbox tegner på <canvas> og kan ikke lese
 * CSS-variabler, så fargene må være statiske her. Avledet fra pyramidColors.
 */

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { pyramidColors } from "@/lib/design-tokens";

const MAP_COLORS = {
  green: "#7BC47F", // putting-green — lys for kontrast mot satellitt
  fairway: pyramidColors.fys, // forest
  bunker: pyramidColors.tek, // sand/ochre
  water: pyramidColors.slag, // blå
  tee: pyramidColors.spill, // lime
  holeLine: pyramidColors.spill, // lime
} as const;

export type CourseMapHole = {
  holeNumber: number;
  par: number | null;
  teeLat: number | null;
  teeLng: number | null;
  greenLat: number | null;
  greenLng: number | null;
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
};

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export function CourseMap({ center, geojson, holes = [], zoom = 15.5, className, shotPoints = [], aimLine = null }: CourseMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

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
          paint: { "line-color": "#FFFFFF", "line-width": 1.5, "line-dasharray": [3, 3], "line-opacity": 0.6 },
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
            "circle-color": pyramidColors.spill,
            "circle-stroke-color": "#06140E",
            "circle-stroke-width": 1,
          },
        });
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // Kjør én gang ved mount; bane endres ved full remount (key på parent).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          background: ${pyramidColors.spill}; color: ${pyramidColors.fys};
          font-family: var(--font-mono, monospace); font-size: 12px; font-weight: 700;
          border: 2px solid #fff; box-shadow: 0 1px 4px rgba(0,0,0,.4); cursor: pointer;
        }
      `}</style>
    </>
  );
}
