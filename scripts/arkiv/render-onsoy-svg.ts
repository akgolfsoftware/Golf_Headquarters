/**
 * Tegn importert Onsøy-geometri som SVG (offline-bevis på OSM-importen).
 * Skriver til scratchpad. Ikke produksjon — kun verifisering/visning.
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";
import { writeFileSync } from "node:fs";

loadEnv({ path: ".env.local" });
loadEnv({ path: ".env.development.local" });
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const C = {
  green: "#7BC47F",
  fairway: "#005840",
  bunker: "#B8852A",
  water: "#2563EB",
  tee: "#D1F843",
  hole: "#D1F843",
  bg: "#0A1F17",
};

(async () => {
  const bane = await prisma.bane.findUnique({
    where: { slug: "onsoy-golfklubb" },
    include: { holes: { orderBy: { holeNumber: "asc" } } },
  });
  if (!bane) throw new Error("ingen bane");
  const fc = bane.geojson as unknown as GeoJSON.FeatureCollection;

  // Bbox over alle koordinater
  let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity;
  const eachCoord = (g: GeoJSON.Geometry, cb: (lon: number, lat: number) => void) => {
    if (g.type === "Polygon") g.coordinates.forEach((r) => r.forEach(([lo, la]) => cb(lo, la)));
    else if (g.type === "LineString") g.coordinates.forEach(([lo, la]) => cb(lo, la));
  };
  for (const f of fc.features) eachCoord(f.geometry, (lo, la) => {
    minLon = Math.min(minLon, lo); maxLon = Math.max(maxLon, lo);
    minLat = Math.min(minLat, la); maxLat = Math.max(maxLat, la);
  });

  const W = 900, H = 900, PAD = 30;
  const lat0 = (minLat + maxLat) / 2;
  const kx = Math.cos((lat0 * Math.PI) / 180);
  const spanX = (maxLon - minLon) * kx;
  const spanY = maxLat - minLat;
  const scale = Math.min((W - 2 * PAD) / spanX, (H - 2 * PAD) / spanY);
  const px = (lon: number) => PAD + (lon - minLon) * kx * scale;
  const py = (lat: number) => H - PAD - (lat - minLat) * scale; // nord opp

  const polyPath = (g: GeoJSON.Polygon) =>
    g.coordinates.map((ring) => "M" + ring.map(([lo, la]) => `${px(lo).toFixed(1)},${py(la).toFixed(1)}`).join("L") + "Z").join(" ");
  const linePath = (g: GeoJSON.LineString) =>
    "M" + g.coordinates.map(([lo, la]) => `${px(lo).toFixed(1)},${py(la).toFixed(1)}`).join("L");

  const order = ["fairway", "water_hazard", "lateral_water_hazard", "bunker", "green", "tee"];
  const colorOf = (golf: string) =>
    golf === "green" ? C.green : golf === "bunker" ? C.bunker : golf === "tee" ? C.tee :
    golf === "fairway" ? C.fairway : golf.includes("water") ? C.water : "#3A5A4A";

  let body = "";
  for (const layer of order) {
    for (const f of fc.features) {
      const golf = (f.properties as Record<string, string>)?.golf;
      if (golf !== layer || f.geometry.type !== "Polygon") continue;
      const op = layer === "fairway" ? 0.4 : layer === "green" ? 0.85 : 0.75;
      body += `<path d="${polyPath(f.geometry)}" fill="${colorOf(golf)}" fill-opacity="${op}" stroke="${colorOf(golf)}" stroke-width="0.6"/>`;
    }
  }
  // Hull-linjer + nummer
  for (const f of fc.features) {
    const golf = (f.properties as Record<string, string>)?.golf;
    if (golf !== "hole" || f.geometry.type !== "LineString") continue;
    body += `<path d="${linePath(f.geometry)}" fill="none" stroke="${C.hole}" stroke-width="1.5" stroke-dasharray="5 4" stroke-opacity="0.8"/>`;
  }
  for (const h of bane.holes) {
    if (h.teeLat == null || h.teeLng == null) continue;
    const x = px(h.teeLng), y = py(h.teeLat);
    body += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="11" fill="${C.tee}" stroke="#fff" stroke-width="2"/>`;
    body += `<text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="middle" font-family="monospace" font-size="13" font-weight="700" fill="${C.fairway}">${h.holeNumber}</text>`;
  }

  const svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"><rect width="${W}" height="${H}" fill="${C.bg}"/>${body}</svg>`;
  const out = process.env.SCRATCH || "/private/tmp/onsoy.svg";
  writeFileSync(out, svg);
  console.log("Skrev SVG til", out, "·", svg.length, "tegn");
  await prisma.$disconnect();
})();
