// Data Golf API — ukentlig sync av PGA Tour approach-skill benchmarks.
// Kjøres via /api/cron/[agent] (agent = "datagolf-sync").
// Upsert-er SgBaseline med @@unique([category, distanceBucket, lie]).

import { prisma } from "@/lib/prisma";
import type { ShotLie } from "@/generated/prisma/client";

const DATAGOLF_ENDPOINT =
  "https://feeds.datagolf.com/preds/approach-skill";

type DataGolfRow = {
  dist: number;       // yardage midpoint
  lie: string;        // "fairway" | "rough" | "sand" etc.
  sg_gained: number;  // expected SG vs baseline
  sample: number;
};

type DataGolfResponse = {
  data: DataGolfRow[];
  last_updated: string;
};

function lieToPrisma(lie: string): ShotLie | null {
  const map: Record<string, ShotLie> = {
    fairway: "FAIRWAY",
    rough: "ROUGH",
    sand: "BUNKER",
    tee: "TEE",
  };
  return map[lie.toLowerCase()] ?? null;
}

function bucketLabel(dist: number): string {
  const low = Math.floor(dist / 25) * 25;
  return `${low}-${low + 25}y`;
}

export async function syncDataGolf(): Promise<{ upserted: number }> {
  const apiKey = process.env.DATAGOLF_API_KEY;
  if (!apiKey) throw new Error("DATAGOLF_API_KEY mangler i environment");

  const url = `${DATAGOLF_ENDPOINT}?key=${apiKey}&file_format=json`;
  const res = await fetch(url, { next: { revalidate: 0 } });

  if (!res.ok) {
    throw new Error(`Data Golf API feil: ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as DataGolfResponse;
  const fetchedAt = new Date();
  let upserted = 0;

  for (const row of json.data ?? []) {
    const prismaLie = lieToPrisma(row.lie);
    if (prismaLie === null) continue;

    await prisma.sgBaseline.upsert({
      where: {
        category_distanceBucket_lie: {
          category: "APP",
          distanceBucket: bucketLabel(row.dist),
          lie: prismaLie,
        },
      },
      update: {
        expectedStrokes: row.sg_gained,
        sampleSize: row.sample,
        source: `datagolf-approach-skill-${fetchedAt.toISOString().slice(0, 7)}`,
        fetchedAt,
      },
      create: {
        category: "APP",
        distanceBucket: bucketLabel(row.dist),
        lie: prismaLie,
        expectedStrokes: row.sg_gained,
        sampleSize: row.sample,
        source: `datagolf-approach-skill-${fetchedAt.toISOString().slice(0, 7)}`,
        fetchedAt,
      },
    });
    upserted++;
  }

  return { upserted };
}
