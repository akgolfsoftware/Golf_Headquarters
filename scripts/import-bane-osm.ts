/**
 * Importer banegeometri fra OpenStreetMap (Overpass) til Bane + CourseHole.
 * Henter golf=green/tee/bunker/fairway/hole i en bbox, bygger en GeoJSON
 * FeatureCollection (Bane.geojson) og strukturerte hull (CourseHole) fra
 * golf=hole-senterlinjene. Idempotent (upsert på slug + (baneId,holeNumber)).
 *
 *   npx tsx scripts/import-bane-osm.ts onsoy
 *
 * Kun Onsøy er konfigurert nå; legg flere baner i BANER under.
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type BaneConfig = {
  key: string;
  slug: string;
  navn: string;
  kortNavn: string;
  klubb: string;
  region: string;
  kommune: string;
  fylke: string;
  bbox: [number, number, number, number]; // south, west, north, east
};

const BANER: BaneConfig[] = [
  {
    key: "onsoy",
    slug: "onsoy-golfklubb",
    navn: "Onsøy Golfklubb",
    kortNavn: "Onsøy",
    klubb: "Onsøy Golfklubb",
    region: "Øst",
    kommune: "Fredrikstad",
    fylke: "Østfold",
    bbox: [59.262, 10.77, 59.288, 10.815],
  },
];

type OsmNode = { lat: number; lon: number };
type OsmWay = {
  type: "way";
  id: number;
  tags?: Record<string, string>;
  geometry?: OsmNode[];
};

function haversine(a: OsmNode, b: OsmNode): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function centroid(nodes: OsmNode[]): OsmNode {
  const n = nodes.length;
  return {
    lat: nodes.reduce((s, p) => s + p.lat, 0) / n,
    lon: nodes.reduce((s, p) => s + p.lon, 0) / n,
  };
}

function lineLength(nodes: OsmNode[]): number {
  let d = 0;
  for (let i = 1; i < nodes.length; i++) d += haversine(nodes[i - 1], nodes[i]);
  return d;
}

function isClosed(nodes: OsmNode[]): boolean {
  if (nodes.length < 4) return false;
  const a = nodes[0];
  const b = nodes[nodes.length - 1];
  return a.lat === b.lat && a.lon === b.lon;
}

function toFeature(way: OsmWay) {
  const nodes = way.geometry ?? [];
  if (nodes.length < 2) return null;
  const tags = way.tags ?? {};
  const golf = tags.golf ?? (tags.leisure === "golf_course" ? "course" : "");
  const areal =
    isClosed(nodes) && ["green", "tee", "bunker", "fairway", "rough", "lateral_water_hazard", "water_hazard"].includes(golf);
  const coords = nodes.map((p) => [p.lon, p.lat]);
  return {
    type: "Feature" as const,
    properties: { osmId: way.id, golf, ...tags },
    geometry: areal
      ? { type: "Polygon" as const, coordinates: [coords] }
      : { type: "LineString" as const, coordinates: coords },
  };
}

async function fetchOverpass(bbox: [number, number, number, number]) {
  const [s, w, n, e] = bbox;
  const query = `[out:json][timeout:60];
(
  way["golf"](${s},${w},${n},${e});
  way["leisure"="golf_course"](${s},${w},${n},${e});
);
out geom;`;
  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "akgolf-hq/1.0 (akgolfgroup@gmail.com)",
    },
    body: "data=" + encodeURIComponent(query),
  });
  if (!res.ok) throw new Error(`Overpass ${res.status}`);
  const json = (await res.json()) as { elements: OsmWay[] };
  return json.elements.filter((el) => el.type === "way");
}

async function importBane(cfg: BaneConfig) {
  console.log(`\n== ${cfg.navn} ==`);
  const ways = await fetchOverpass(cfg.bbox);
  console.log(`Overpass: ${ways.length} ways`);

  const greens = ways.filter((w) => w.tags?.golf === "green" && w.geometry);
  const tees = ways.filter((w) => w.tags?.golf === "tee" && w.geometry);
  const holes = ways.filter((w) => w.tags?.golf === "hole" && w.geometry);
  const courseWay = ways.find((w) => w.tags?.leisure === "golf_course");

  const greenCentroids = greens.map((g) => centroid(g.geometry!));
  const teeCentroids = tees.map((t) => centroid(t.geometry!));

  const nearest = (p: OsmNode, pts: OsmNode[]) => {
    let best = Infinity;
    let idx = -1;
    pts.forEach((q, i) => {
      const d = haversine(p, q);
      if (d < best) {
        best = d;
        idx = i;
      }
    });
    return { idx, dist: best };
  };

  // FeatureCollection — hele banen for kart-rendering
  const features = ways.map(toFeature).filter(Boolean);
  const fc = { type: "FeatureCollection" as const, features };

  // Bane-senter for kart-init
  const center = courseWay?.geometry
    ? centroid(courseWay.geometry)
    : greenCentroids.length
      ? centroid(greenCentroids)
      : { lat: cfg.bbox[0], lon: cfg.bbox[1] };

  const bane = await prisma.bane.upsert({
    where: { slug: cfg.slug },
    create: {
      slug: cfg.slug,
      navn: cfg.navn,
      kortNavn: cfg.kortNavn,
      klubb: cfg.klubb,
      region: cfg.region,
      kommune: cfg.kommune,
      fylke: cfg.fylke,
      latitude: center.lat,
      longitude: center.lon,
      geojson: fc as object,
      osmRelationId: courseWay ? String(courseWay.id) : null,
      geometrySource: "osm",
      geometryUpdatedAt: new Date(),
    },
    update: {
      latitude: center.lat,
      longitude: center.lon,
      geojson: fc as object,
      osmRelationId: courseWay ? String(courseWay.id) : null,
      geometrySource: "osm",
      geometryUpdatedAt: new Date(),
    },
  });

  // Strukturerte hull fra golf=hole-senterlinjer
  let made = 0;
  for (const hole of holes) {
    const nodes = hole.geometry!;
    const tags = hole.tags ?? {};
    const holeNumber = tags.ref ? parseInt(tags.ref, 10) : NaN;
    if (!Number.isFinite(holeNumber)) continue;

    const endA = nodes[0];
    const endB = nodes[nodes.length - 1];
    // Green-enden = den som er nærmest et green-senter
    const aToGreen = greenCentroids.length ? nearest(endA, greenCentroids).dist : Infinity;
    const bToGreen = greenCentroids.length ? nearest(endB, greenCentroids).dist : Infinity;
    const greenEnd = aToGreen <= bToGreen ? endA : endB;
    const teeEnd = greenEnd === endA ? endB : endA;
    const gIdx = greenCentroids.length ? nearest(greenEnd, greenCentroids).idx : -1;
    const tIdx = teeCentroids.length ? nearest(teeEnd, teeCentroids).idx : -1;

    const greenPt = gIdx >= 0 ? greenCentroids[gIdx] : greenEnd;
    const teePt = tIdx >= 0 ? teeCentroids[tIdx] : teeEnd;

    await prisma.courseHole.upsert({
      where: { baneId_holeNumber: { baneId: bane.id, holeNumber } },
      create: {
        baneId: bane.id,
        holeNumber,
        par: tags.par ? parseInt(tags.par, 10) : null,
        lengthMeter: Math.round(lineLength(nodes)),
        teeLat: teePt.lat,
        teeLng: teePt.lon,
        greenLat: greenPt.lat,
        greenLng: greenPt.lon,
        osmWayId: String(hole.id),
      },
      update: {
        par: tags.par ? parseInt(tags.par, 10) : null,
        lengthMeter: Math.round(lineLength(nodes)),
        teeLat: teePt.lat,
        teeLng: teePt.lon,
        greenLat: greenPt.lat,
        greenLng: greenPt.lon,
        osmWayId: String(hole.id),
      },
    });
    made++;
  }

  console.log(
    `Lagret: bane=${bane.slug} · features=${features.length} · greens=${greens.length} · tees=${tees.length} · hull(strukturert)=${made}`,
  );
}

async function main() {
  const key = process.argv[2];
  const targets = key ? BANER.filter((b) => b.key === key) : BANER;
  if (!targets.length) {
    console.error(`Ukjent bane "${key}". Tilgjengelig: ${BANER.map((b) => b.key).join(", ")}`);
    process.exit(1);
  }
  for (const cfg of targets) await importBane(cfg);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
