/**
 * Fase 3-illustrasjon: kjør simulerte Onsøy-hull-1-landinger gjennom HELE
 * dispersion-pipelinen (GPS → projectToAimFrame → computeDispersion) og tegn
 * en ekte spredningsgraf med rotert 95%- og 1σ-ellipse + ekte σ-tall.
 * Skriver SVG til scratchpad. Slagene er simulerte; matematikken er ekte.
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";
import { writeFileSync } from "node:fs";
import { projectToAimFrame, computeDispersion } from "../src/lib/gameplan/dispersion";
import type { LatLng } from "../src/lib/gameplan/shot-coords";
loadEnv({ path: ".env.local" });
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

(async () => {
  const bane = await prisma.bane.findUnique({ where: { slug: "onsoy-golfklubb" }, include: { holes: { where: { holeNumber: 1 } } } });
  const hole = bane?.holes[0];
  if (!hole?.teeLat) throw new Error("mangler hull 1");
  const tee: LatLng = { lat: hole.teeLat!, lng: hole.teeLng! };
  const green: LatLng = { lat: hole.greenLat!, lng: hole.greenLng! };

  // Mål = utslags-landingssone (65% mot green) + simulert spredning
  const t = 0.65;
  const target: LatLng = { lat: tee.lat + (green.lat - tee.lat) * t, lng: tee.lng + (green.lng - tee.lng) * t };
  const offs = [[0.3,0.6],[-0.5,0.2],[0.8,-0.3],[-0.2,-0.7],[0.1,0.9],[-0.9,0.4],[0.5,0.1],[-0.4,-0.4],[0.2,0.3],[0.7,0.7],[-0.7,-0.1],[0.0,-0.5],[-0.3,0.5],[0.4,-0.8]];
  const sLat = 0.00045, sLng = 0.00075;
  const landings: LatLng[] = offs.map(([a, b]) => ({ lat: target.lat + a * sLat, lng: target.lng + b * sLng }));

  // EKTE pipeline
  const pts = landings.map((l) => projectToAimFrame(l, tee, target));
  const d95 = computeDispersion(pts, { confidence: 0.95 });
  const d1s = computeDispersion(pts, { confidence: 0.393 });
  const e = d95.ellipse!;

  // Plott-ramme
  const W = 720, H = 820;
  const cx = W / 2, cy = H / 2 - 30;
  const maxR = Math.max(25, ...pts.map((p) => Math.hypot(p.lateral, p.distance)), e.semiMajor) * 1.25;
  const sc = (Math.min(W, H - 120) / 2 - 30) / maxR; // px per meter
  const X = (lat: number) => cx + lat * sc;
  const Y = (dist: number) => cy - dist * sc;
  // Ellipse-rotasjon: angleRad måles fra distance-aksen mot lateral.
  // Skjermvinkel for storaksen fra horisontal lateral-akse = (pi/2 - angle); SVG y er ned → neger.
  const ellDeg = (en: typeof e) => (-(Math.PI / 2 - en.angleRad) * 180) / Math.PI;

  const ellipse = (en: typeof e, op: number, dash: string) =>
    `<ellipse cx="${X(en.centerLateral).toFixed(1)}" cy="${Y(en.centerDistance).toFixed(1)}" rx="${(en.semiMajor * sc).toFixed(1)}" ry="${(en.semiMinor * sc).toFixed(1)}" transform="rotate(${ellDeg(en).toFixed(2)} ${X(en.centerLateral).toFixed(1)} ${Y(en.centerDistance).toFixed(1)})" fill="#D1F843" fill-opacity="${op}" stroke="#D1F843" stroke-opacity="0.7" stroke-dasharray="${dash}"/>`;

  let body = "";
  // Akser
  body += `<line x1="${X(-maxR)}" y1="${cy}" x2="${X(maxR)}" y2="${cy}" stroke="#2A4034" stroke-width="1"/>`;
  body += `<line x1="${cx}" y1="${Y(-maxR)}" x2="${cx}" y2="${Y(maxR)}" stroke="#2A4034" stroke-width="1"/>`;
  // Avstandsringer hver 10m
  for (let r = 10; r <= maxR; r += 10) body += `<circle cx="${cx}" cy="${cy}" r="${(r*sc).toFixed(1)}" fill="none" stroke="#1C2C24" stroke-width="0.8"/>`;
  // Ellipser
  body += ellipse(e, 0.10, "none");
  body += ellipse(d1s.ellipse!, 0.16, "5 3");
  // Mål (sentrum)
  body += `<circle cx="${cx}" cy="${cy}" r="6" fill="none" stroke="#fff" stroke-width="1.5"/><line x1="${cx-9}" y1="${cy}" x2="${cx+9}" y2="${cy}" stroke="#fff" stroke-width="1"/><line x1="${cx}" y1="${cy-9}" x2="${cx}" y2="${cy+9}" stroke="#fff" stroke-width="1"/>`;
  // Punkter
  for (const p of pts) body += `<circle cx="${X(p.lateral).toFixed(1)}" cy="${Y(p.distance).toFixed(1)}" r="6" fill="#D1F843" fill-opacity="0.9" stroke="#06140E"/>`;
  // Snitt
  body += `<circle cx="${X(e.centerLateral).toFixed(1)}" cy="${Y(e.centerDistance).toFixed(1)}" r="5" fill="#2563EB" stroke="#fff" stroke-width="1.5"/>`;
  // Akse-etiketter
  body += `<text x="${X(maxR)-6}" y="${cy-8}" text-anchor="end" font-family="monospace" font-size="12" fill="#7A8C82">høyre →</text>`;
  body += `<text x="${X(-maxR)+6}" y="${cy-8}" font-family="monospace" font-size="12" fill="#7A8C82">← venstre</text>`;
  body += `<text x="${cx+8}" y="${Y(maxR)+14}" font-family="monospace" font-size="12" fill="#7A8C82">lang ↑</text>`;

  const fmt = (n: number) => (n >= 0 ? "+" : "") + n.toFixed(1);
  const foot = `<rect x="0" y="${H-92}" width="${W}" height="92" fill="#06140E"/>` +
    `<text x="24" y="${H-62}" font-family="monospace" font-size="16" fill="#EAF3DE">σ side ${d95.std.lateral.toFixed(1)} m · σ lengde ${d95.std.distance.toFixed(1)} m · n=${d95.n}</text>` +
    `<text x="24" y="${H-38}" font-family="monospace" font-size="16" fill="#EAF3DE">bias ${fmt(d95.bias.lateral)} m ${d95.bias.side} · ${fmt(d95.bias.distance)} m ${d95.bias.length}</text>` +
    `<text x="24" y="${H-14}" font-family="monospace" font-size="12" fill="#7A8C82">heltrukket = 95% · stiplet = 1σ · blå = snitt · kryss = mål. Slag simulert, matematikk ekte.</text>`;

  const svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" width="100%"><title>Spredningsanalyse — Onsøy hull 1 utslag</title><desc>Spredningsgraf i sikte-koordinater: 14 utslag med rotert 95%- og 1σ-konfidensellipse, snittpunkt og bias, regnet av dispersion-motoren.</desc><rect width="${W}" height="${H}" fill="#0A1F17"/>${body}${foot}</svg>`;
  const out = process.env.SCRATCH || "/private/tmp/dispersion.svg";
  writeFileSync(out, svg);
  console.log("Skrev", out, svg.length, "tegn");
  console.log(`σ side ${d95.std.lateral.toFixed(1)}m · σ lengde ${d95.std.distance.toFixed(1)}m · bias ${fmt(d95.bias.lateral)}m ${d95.bias.side}`);
  await prisma.$disconnect();
})();
