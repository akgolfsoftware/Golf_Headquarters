"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export type AnleggLocation = {
  id: string;
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  active: boolean;
};

// Fallback-koordinater for kjente lokasjoner som ikke har lat/lng i DB
const NAVN_FALLBACK: Record<string, [number, number]> = {
  // [lng, lat]
  fredrikstad: [10.9298, 59.2186],
  gfgk: [10.9434, 59.1872],
  "gamle fredrikstad": [10.9434, 59.1872],
  drøbak: [10.6249, 59.6633],
  drobak: [10.6249, 59.6633],
  miklagard: [10.9911, 59.9551],
  borge: [10.9897, 59.1959],
  bossum: [11.1556, 59.1264],
  mulligan: [10.9298, 59.2186],
  wang: [10.9434, 59.2208],
};

function finnKoordinat(loc: AnleggLocation): [number, number] | null {
  if (loc.latitude != null && loc.longitude != null) {
    return [loc.longitude, loc.latitude];
  }
  const navn = loc.name.toLowerCase();
  for (const [key, koord] of Object.entries(NAVN_FALLBACK)) {
    if (navn.includes(key)) return koord;
  }
  return null;
}

export function AnleggMapbox({ locations }: { locations: AnleggLocation[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    if (!token || !containerRef.current || mapRef.current) return;
    mapboxgl.accessToken = token;

    const pins = locations
      .map((l) => ({ loc: l, koord: finnKoordinat(l) }))
      .filter((p): p is { loc: AnleggLocation; koord: [number, number] } => p.koord !== null);

    // Sentrer rundt første pin, eller default Østland (Fredrikstad)
    const senter: [number, number] = pins[0]?.koord ?? [10.9298, 59.2186];

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: senter,
      zoom: pins.length > 1 ? 8 : 11,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

    pins.forEach(({ loc, koord }) => {
      const el = document.createElement("div");
      el.className = "anlegg-marker";
      el.style.cssText = `
        background: ${loc.active ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"};
        color: hsl(var(--primary-foreground));
        width: 32px; height: 32px;
        border-radius: 50%;
        display: grid; place-items: center;
        font-family: var(--font-jetbrains-mono, monospace);
        font-size: 12px; font-weight: 700;
        border: 2px solid hsl(var(--background));
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        cursor: pointer;
      `;
      el.textContent = loc.name.charAt(0).toUpperCase();

      const popup = new mapboxgl.Popup({ offset: 24, closeButton: false }).setHTML(`
        <div style="font-family: var(--font-geist, system-ui); padding: 4px;">
          <div style="font-weight: 600; font-size: 13px; color: hsl(var(--foreground));">${loc.name}</div>
          <div style="font-size: 11px; color: hsl(var(--muted-foreground)); margin-top: 2px;">${loc.address}</div>
        </div>
      `);

      el.addEventListener("click", () => {
        const target = document.querySelector(`[data-loc-id="${loc.id}"]`);
        if (target) target.scrollIntoView({ behavior: "smooth", block: "center" });
      });

      new mapboxgl.Marker(el).setLngLat(koord).setPopup(popup).addTo(map);
    });

    // Tilpass bounds hvis flere pins
    if (pins.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      pins.forEach((p) => bounds.extend(p.koord));
      map.fitBounds(bounds, { padding: 60, maxZoom: 11 });
    }

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [locations, token]);

  if (!token) {
    return (
      <div className="relative min-h-[520px] overflow-hidden rounded-lg border border-dashed border-border bg-secondary/40 p-6">
        <div className="flex h-full min-h-[480px] flex-col items-center justify-center gap-2 text-center">
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Mapbox-token mangler
          </span>
          <p className="max-w-sm text-sm text-muted-foreground">
            Sett <code className="rounded bg-card px-1.5 py-0.5 font-mono text-[11px]">NEXT_PUBLIC_MAPBOX_TOKEN</code> i miljøvariablene for å vise interaktivt kart.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="min-h-[520px] overflow-hidden rounded-lg border border-border"
    />
  );
}
