// Tester for AI-foundation (Skills, Tools, Caddie agent).
//
// Bruker node:test + tsx. Mocker Anthropic-klienten implisitt ved å
// teste strukturen rundt (Skills-data, Tools-mapping, memory-API).
// Faktisk Anthropic-kall mockes ikke her — det krever egen
// integration-test med dependency-injection som vi bygger i senere fase.
//
// Kjør med:
//   npx tsx --test src/lib/__tests__/ai/caddie.test.ts

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  pyramideSkill,
  bompaSkill,
  sgInterpretationSkill,
  ALL_SKILLS,
} from "@/lib/ai/skills";
import {
  ALL_TOOLS,
  EXEC_BY_NAME,
  getSpillerTool,
  getRunderTool,
  getSgDataTool,
  getTreningsplanTool,
} from "@/lib/ai/tools";
// Memory-testene mocker "@/lib/prisma" (samme mønster som
// src/lib/portal/goals/progress.test.ts) og importerer "@/lib/ai/memory"
// dynamisk ETTER mock-oppsettet — se describe("Memory") under.

describe("Skills", () => {
  it("har 3 Skills i ALL_SKILLS", () => {
    assert.equal(ALL_SKILLS.length, 3);
  });

  it("alle Skills har name og knowledge", () => {
    for (const skill of ALL_SKILLS) {
      assert.ok(skill.name.length > 0, `Skill mangler navn`);
      assert.ok(skill.description.length > 0, `Skill ${skill.name} mangler description`);
      assert.ok(skill.knowledge.length > 50, `Skill ${skill.name} har for lite kunnskap`);
    }
  });

  it("pyramide-skill nevner alle 5 akser", () => {
    const k = pyramideSkill.knowledge;
    for (const akse of ["FYS", "TEK", "SLAG", "SPILL", "TURN"]) {
      assert.ok(k.includes(akse), `Pyramide-skill mangler ${akse}`);
    }
  });

  it("bompa-skill nevner alle 6 perioder", () => {
    const k = bompaSkill.knowledge;
    for (const periode of [
      "GRUNNTRENING",
      "OPPBYGGING",
      "SPESIALISERING",
      "KONKURRANSE",
      "OVERGANG",
      "HVILE",
    ]) {
      assert.ok(k.includes(periode), `Bompa-skill mangler ${periode}`);
    }
  });

  it("SG-skill nevner alle 4 SG-kategorier", () => {
    const k = sgInterpretationSkill.knowledge;
    for (const kat of ["SG-OTT", "SG-APP", "SG-ARG", "SG-PUTT"]) {
      assert.ok(k.includes(kat), `SG-skill mangler ${kat}`);
    }
  });
});

describe("Tools", () => {
  it("har 4 Tools i ALL_TOOLS", () => {
    assert.equal(ALL_TOOLS.length, 4);
  });

  it("alle Tools har name + description + input_schema", () => {
    for (const tool of ALL_TOOLS) {
      assert.ok(tool.name.length > 0, "Tool mangler name");
      assert.ok(tool.description, `Tool ${tool.name} mangler description`);
      assert.ok(tool.input_schema, `Tool ${tool.name} mangler input_schema`);
      assert.equal(
        tool.input_schema.type,
        "object",
        `Tool ${tool.name} sitt schema er ikke object`,
      );
    }
  });

  it("alle tool-navn er unike", () => {
    const names = ALL_TOOLS.map((t) => t.name);
    const unique = new Set(names);
    assert.equal(names.length, unique.size, "Duplikate tool-navn");
  });

  it("EXEC_BY_NAME har en handler for hvert tool", () => {
    for (const tool of ALL_TOOLS) {
      assert.ok(
        typeof EXEC_BY_NAME[tool.name] === "function",
        `Mangler exec for ${tool.name}`,
      );
    }
  });

  it("forventede tool-navn er på plass", () => {
    assert.equal(getSpillerTool.name, "get_spiller");
    assert.equal(getRunderTool.name, "get_runder");
    assert.equal(getSgDataTool.name, "get_sg_data");
    assert.equal(getTreningsplanTool.name, "get_treningsplan");
  });

  it("alle Tools krever spillerId", () => {
    for (const tool of ALL_TOOLS) {
      const schema = tool.input_schema as {
        required?: string[];
      };
      assert.ok(
        schema.required?.includes("spillerId"),
        `Tool ${tool.name} mangler spillerId som required`,
      );
    }
  });
});

describe("Memory", () => {
  it("rememberFact/recallMemory/forgetFact/formatMemoryForPrompt (mocket Prisma)", async (t) => {
    type Row = { userId: string; key: string; value: string; updatedAt: Date };
    const store = new Map<string, Row>();
    const storeKey = (userId: string, key: string) => `${userId}::${key}`;

    t.mock.module("@/lib/prisma", {
      namedExports: {
        prisma: {
          aiMemory: {
            upsert: async ({
              where,
              create,
              update,
            }: {
              where: { userId_key: { userId: string; key: string } };
              create: { userId: string; key: string; value: string };
              update: { value: string };
            }) => {
              const existing = store.get(storeKey(where.userId_key.userId, where.userId_key.key));
              const row: Row = existing
                ? { ...existing, value: update.value, updatedAt: new Date() }
                : { userId: create.userId, key: create.key, value: create.value, updatedAt: new Date() };
              store.set(storeKey(row.userId, row.key), row);
              return row;
            },
            findMany: async ({ where }: { where: { userId: string } }) =>
              [...store.values()].filter((entry) => entry.userId === where.userId),
            delete: async ({
              where,
            }: {
              where: { userId_key: { userId: string; key: string } };
            }) => {
              const k = storeKey(where.userId_key.userId, where.userId_key.key);
              const existing = store.get(k);
              if (!existing) throw new Error("Record not found");
              store.delete(k);
              return existing;
            },
          },
        },
      },
    });

    const { rememberFact, recallMemory, forgetFact, formatMemoryForPrompt } = await import(
      "@/lib/ai/memory"
    );

    const userId = "test-user";
    await rememberFact({ userId, key: "favoritt-fokus", value: "FYS-styrke" });
    const entries = await recallMemory(userId);
    assert.equal(entries.length, 1);
    assert.equal(entries[0].key, "favoritt-fokus");
    assert.equal(entries[0].value, "FYS-styrke");

    const ok = await forgetFact({ userId, key: "favoritt-fokus" });
    assert.equal(ok, true);
    assert.equal((await recallMemory(userId)).length, 0);

    const okUkjent = await forgetFact({ userId, key: "finnes-ikke" });
    assert.equal(okUkjent, false);

    assert.equal(formatMemoryForPrompt([]), "");
    const out = formatMemoryForPrompt([
      { userId: "u", key: "fokus", value: "putting", updatedAt: new Date() },
    ]);
    assert.ok(out.includes("- fokus: putting"));
    assert.ok(out.includes("BRUKER-MINNE"));
  });
});
