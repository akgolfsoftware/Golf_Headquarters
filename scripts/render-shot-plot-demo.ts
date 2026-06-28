/**
 * Illustrasjon: hull 1 på Onsøy med SIMULERTE landingspunkter (ikke ekte slag).
 * Viser hva slag-plotting (fase 2) produserer. Skriver SVG til scratchpad.
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";
import { writeFileSync } from "node:fs";
loadEnv({ path: ".env.local" });
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

(async () => {
  const bane = await prisma.bane.findUnique({ where: { slug: "onsoy-golfklubb" }, include: { holes: { where: { holeNumber: 1 } } } });
  const hole = bane?.holes[0];
  if (!bane || !hole || hole.teeLat == null) throw new Error("mangler hull 1");
  const fc = bane.geojson as unknown as GeoJSON.FeatureCollection;

  const tee = { lat: hole.teeLat!, lng: hole.teeLng! };
  const green = { lat: hole.greenLat!, lng: hole.greenLng! };

  // Simulert landingssone ~65% mot green + deterministisk spredning
  const t = 0.65;
  const target = { lat: tee.lat + (green.lat - tee.lat) * t, lng: tee.lng + (green.lng - tee.lng) * t };
  const offs = [[0.3,0.6],[-0.5,0.2],[0.8,-0.3],[-0.2,-0.7],[0.1,0.9],[-0.9,0.4],[0.5,0.1],[-0.4,-0.4],[0.2,0.3],[0.7,0.7],[-0.7,-0.1],[0.0,-0.5],[-0.3,0.5],[0.4,-0.8]];
  const sLat = 0.00045, sLng = 0.00075; // spredning i grader
  const shots = offs.map(([a, b]) => ({ lat: target.lat + a * sLat, lng: target.lng + b * sLng }));
  const cen = { lat: shots.reduce((s, p) => s + p.lat, 0) / shots.length, lng: shots.reduce((s, p) => s + p.lng, 0) / shots.length };

  // View-bbox fra tee+green+shots med margin
  const all = [tee, green, target, ...shots];
  let minLa = Math.min(...all.map(p => p.lat)), maxLa = Math.max(...all.map(p => p.lat));
  let minLo = Math.min(...all.map(p => p.lng)), maxLo = Math.max(...all.map(p => p.lng));
  const mLa = (maxLa - minLa) * 0.25 + 0.0003, mLo = (maxLo - minLo) * 0.25 + 0.0003;
  minLa -= mLa; maxLa += mLa; minLo -= mLo; maxLo += mLo;

  const W = 720, H = 900, PAD = 20;
  const lat0 = (minLa + maxLa) / 2, kx = Math.cos(lat0 * Math.PI / 180);
  const scale = Math.min((W - 2 * PAD) / ((maxLo - minLo) * kx), (H - 2 * PAD) / (maxLa - minLa));
  const px = (lng: number) => PAD + (lng - minLo) * kx * scale;
  const py = (lat: number) => H - PAD - (lat - minLa) * scale;

  let body = "";
  // Greener i view
  for (const f of fc.features) {
    const p = f.properties as Record<string, string>;
    if (p?.golf !== "green" || f.geometry.type !== "Polygon") continue;
    const d = f.geometry.coordinates.map(r => "M" + r.map(([lo, la]) => `${px(lo).toFixed(1)},${py(la).toFixed(1)}`).join("L") + "Z").join(" ");
    body += `<path d="${d}" fill="#7BC47F" fill-opacity="0.8" stroke="#7BC47F"/>`;
  }
  // Target-linje tee→green
  body += `<path d="M${px(tee.lng)},${py(tee.lat)}L${px(green.lng)},${py(green.lat)}" stroke="#fff" stroke-width="1.5" stroke-dasharray="6 5" stroke-opacity="0.5"/>`;
  // Spredningssirkel rundt centroid (illustrativ 1σ)
  const r = Math.max(sLat, sLng * kx) * scale * 1.6;
  body += `<ellipse cx="${px(cen.lng).toFixed(1)}" cy="${py(cen.lat).toFixed(1)}" rx="${(sLng * kx * scale * 1.6).toFixed(1)}" ry="${(sLat * scale * 1.6).toFixed(1)}" fill="#D1F843" fill-opacity="0.12" stroke="#D1F843" stroke-opacity="0.6" stroke-dasharray="4 3"/>`;
  // Slag-punkter
  for (const s of shots) body += `<circle cx="${px(s.lng).toFixed(1)}" cy="${py(s.lat).toFixed(1)}" r="6" fill="#D1F843" fill-opacity="0.85" stroke="#06140E" stroke-width="1"/>`;
  // Centroid
  body += `<circle cx="${px(cen.lng).toFixed(1)}" cy="${py(cen.lat).toFixed(1)}" r="5" fill="#fff"/><circle cx="${px(cen.lng).toFixed(1)}" cy="${py(cen.lat).toFixed(1)}" r="9" fill="none" stroke="#fff" stroke-width="1.5"/>`;
  // Tee + green markører
  body += `<circle cx="${px(tee.lng).toFixed(1)}" cy="${py(tee.lat).toFixed(1)}" r="9" fill="#D1F843" stroke="#fff" stroke-width="2"/><text x="${px(tee.lng).toFixed(1)}" y="${(py(tee.lat) + 4).toFixed(1)}" text-anchor="middle" font-family="monospace" font-size="11" font-weight="700" fill="#005840">1</text>`;
  body += `<circle cx="${px(green.lng).toFixed(1)}" cy="${py(green.lat).toFixed(1)}" r="7" fill="#06140E" stroke="#7BC47F" stroke-width="2"/>`;

  void r;
  const svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" width="100%"><title>Onsøy hull 1 — simulert slag-spredning</title><desc>Hull 1, par 4. Lime prikker er 14 simulerte landingspunkter for utslaget, med spredningssirkel og snittpunkt. Illustrasjon av hva slag-plotting produserer.</desc><rect width="${W}" height="${H}" fill="#0A1F17"/>${body}<rect x="0" y="${H-58}" width="${W}" height="58" fill="#06140E"/><text x="20" y="${H-34}" font-family="monospace" font-size="15" fill="#EAF3DE">Hull 1 · par ${hole.par} · ${hole.lengthMeter}m — 14 utslag (SIMULERT)</text><text x="20" y="${H-14}" font-family="monospace" font-size="12" fill="#7A8C82">Lime = landing · hvit ring = snitt · stiplet = spredning. Ekte data når du plotter slag.</text></svg>`;
  const out = process.env.SCRATCH || "/private/tmp/onsoy-hull1.svg";
  writeFileSync(out, svg);
  console.log("Skrev", out, svg.length, "tegn");
  await prisma.$disconnect();
})();
