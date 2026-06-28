"use client";

/**
 * ShotPlotMap — trykk på satellittkartet for å markere hvor ballen landet.
 * Fanger GPS for ett slag (skjerm 4: slag-plotting). Tee-punktet vises fra
 * hull-data; brukeren plasserer landingspunktet. onPlot kalles med {lat,lng}.
 *
 * Visuell verifisering krever ekte nettleser med Mapbox-tilgang (token).
 */

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { pyramidColors } from "@/lib/design-tokens";
import type { LatLng } from "@/lib/baneguide/shot-coords";

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export type ShotPlotMapProps = {
  geojson: GeoJSON.FeatureCollection;
  /** Tee-posisjon (start) for hullet — vises som fast markør. */
  tee?: LatLng | null;
  /** Green-senter — brukes til å sentrere/zoome. */
  green?: LatLng | null;
  /** Eksisterende landingspunkt (rediger). */
  initialLanding?: LatLng | null;
  onPlot: (landing: LatLng) => void;
  className?: string;
};

export function ShotPlotMap({ geojson, tee, green, initialLanding, onPlot, className }: ShotPlotMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const landingMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const [landing, setLanding] = useState<LatLng | null>(initialLanding ?? null);

  useEffect(() => {
    if (!TOKEN || !containerRef.current || mapRef.current) return;
    mapboxgl.accessToken = TOKEN;

    // Sentrer mellom tee og green hvis vi har begge, ellers green/tee.
    const focus =
      tee && green
        ? { lat: (tee.lat + green.lat) / 2, lng: (tee.lng + green.lng) / 2 }
        : (green ?? tee ?? { lat: 0, lng: 0 });

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: [focus.lng, focus.lat],
      zoom: 17,
    });
    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

    const placeLanding = (p: LatLng) => {
      setLanding(p);
      onPlot(p);
      if (landingMarkerRef.current) {
        landingMarkerRef.current.setLngLat([p.lng, p.lat]);
      } else {
        const el = document.createElement("div");
        el.className = "ak-landing-marker";
        landingMarkerRef.current = new mapboxgl.Marker({ element: el, draggable: true })
          .setLngLat([p.lng, p.lat])
          .addTo(map);
        landingMarkerRef.current.on("dragend", () => {
          const ll = landingMarkerRef.current!.getLngLat();
          const np = { lat: ll.lat, lng: ll.lng };
          setLanding(np);
          onPlot(np);
        });
      }
      if (map.getSource("shot-line")) {
        (map.getSource("shot-line") as mapboxgl.GeoJSONSource).setData(shotLine(tee ?? null, p));
      }
    };

    map.on("load", () => {
      map.addSource("course", { type: "geojson", data: geojson });
      map.addLayer({
        id: "plot-green",
        type: "fill",
        source: "course",
        filter: ["all", ["==", ["geometry-type"], "Polygon"], ["==", ["get", "golf"], "green"]],
        paint: { "fill-color": "#7BC47F", "fill-opacity": 0.45 },
      });

      // Tee-markør
      if (tee) {
        const el = document.createElement("div");
        el.className = "ak-tee-marker";
        new mapboxgl.Marker({ element: el }).setLngLat([tee.lng, tee.lat]).addTo(map);
      }

      // Slag-linje (tee → landing)
      map.addSource("shot-line", { type: "geojson", data: shotLine(tee ?? null, landing) });
      map.addLayer({
        id: "shot-line",
        type: "line",
        source: "shot-line",
        paint: { "line-color": pyramidColors.spill, "line-width": 2, "line-dasharray": [2, 1.5] },
      });

      if (initialLanding) placeLanding(initialLanding);
      map.on("click", (e) => placeLanding({ lat: e.lngLat.lat, lng: e.lngLat.lng }));
    });

    return () => {
      map.remove();
      mapRef.current = null;
      landingMarkerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!TOKEN) {
    return (
      <div className={`flex items-center justify-center rounded-xl border border-border bg-secondary p-8 text-center text-sm text-muted-foreground ${className ?? ""}`}>
        Mapbox-token mangler — legg NEXT_PUBLIC_MAPBOX_TOKEN i .env.local.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div ref={containerRef} className={className} />
      <p className="font-mono text-xs text-muted-foreground">
        {landing
          ? `Landing: ${landing.lat.toFixed(5)}, ${landing.lng.toFixed(5)} — dra markøren for å justere`
          : "Trykk på kartet der ballen landet"}
      </p>
      <style>{`
        .ak-landing-marker { width: 18px; height: 18px; border-radius: 9999px; background: ${pyramidColors.spill}; border: 3px solid #fff; box-shadow: 0 1px 4px rgba(0,0,0,.5); cursor: grab; }
        .ak-tee-marker { width: 14px; height: 14px; border-radius: 9999px; background: ${pyramidColors.fys}; border: 2px solid #fff; box-shadow: 0 1px 3px rgba(0,0,0,.5); }
      `}</style>
    </div>
  );
}

function shotLine(tee: LatLng | null, landing: LatLng | null): GeoJSON.Feature {
  const coords: [number, number][] = [];
  if (tee) coords.push([tee.lng, tee.lat]);
  if (landing) coords.push([landing.lng, landing.lat]);
  return { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: coords } };
}
