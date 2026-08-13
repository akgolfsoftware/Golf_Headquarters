/**
 * Seed av ai_models med priser fra Anthropics API-referanse (claude-api-skillen,
 * pristabell cachet 2026-06-24). Idempotent upsert på modelId — trygg å kjøre flere ganger.
 *
 *   npx tsx scripts/seed-ai-models-2026-08-13.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

// USD per 1M tokens. Model-id-ene matcher src/lib/ai/client.ts (modelFor-registeret).
const MODELLER = [
  { name: "Opus 4.8", modelId: "claude-opus-4-8", inputUsdPer1M: 5, outputUsdPer1M: 25 },
  { name: "Sonnet 4.6", modelId: "claude-sonnet-4-6", inputUsdPer1M: 3, outputUsdPer1M: 15 },
  { name: "Haiku 4.5", modelId: "claude-haiku-4-5-20251001", inputUsdPer1M: 1, outputUsdPer1M: 5 },
];

async function main() {
  for (const m of MODELLER) {
    await prisma.aiModel.upsert({
      where: { modelId: m.modelId },
      update: { name: m.name, inputUsdPer1M: m.inputUsdPer1M, outputUsdPer1M: m.outputUsdPer1M },
      create: { ...m, provider: "anthropic" },
    });
  }
  const alle = await prisma.aiModel.findMany({ orderBy: { name: "asc" } });
  for (const m of alle) {
    console.log(`${m.name} (${m.modelId}): ${m.inputUsdPer1M}/${m.outputUsdPer1M} USD per 1M`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
