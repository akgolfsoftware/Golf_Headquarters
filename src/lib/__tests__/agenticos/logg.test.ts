// Tester GDPR-porten i AgenticOS-loggen: fritekst skal ALDRI lagres for en
// mindreårig. Porten står i skriveveien, ikke hos hver kaller — derfor testes
// den her.
//
// Mønster: t.mock.module for "@/lib/prisma". VIKTIG (samme fallgruve som i
// sg-analyse-ekspert.test.ts): modulen under test importeres KUN ÉN gang per
// fil — Node re-evaluerer ikke et allerede lastet ES-modul ved senere
// import()-kall. Derfor ett mock-oppsett med muterbar tilstand
// (createSkalFeile), og alle scenarioer kjørt sekvensielt i samme test.

import { test } from "node:test";
import assert from "node:assert/strict";
import type { LoggInput } from "@/lib/agenticos/logg";

type UpdateArgs = { where: unknown; data: Record<string, unknown> };

test("AgenticOS-loggen — GDPR-port på fritekst og best-effort-skriving", async (t) => {
  const updateKall: UpdateArgs[] = [];
  const updateManyKall: UpdateArgs[] = [];
  let createSkalFeile = false;

  t.mock.module("@/lib/prisma", {
    namedExports: {
      prisma: {
        aiInteraksjon: {
          create: async () => {
            if (createSkalFeile) throw new Error("tabellen finnes ikke ennå");
            return { id: "int-1" };
          },
          update: async (args: UpdateArgs) => {
            updateKall.push(args);
            return { id: "int-1" };
          },
          updateMany: async (args: UpdateArgs) => {
            updateManyKall.push(args);
            return { count: 1 };
          },
        },
      },
    },
  });

  const { loggInteraksjon, settUtfall, settUtfallForReferanse } = await import(
    "@/lib/agenticos/logg"
  );

  // Voksen: begrunnelsen lagres.
  await settUtfall({
    interaksjonId: "int-1",
    utfall: "AVVIST",
    begrunnelse: "feil periode",
    mindreaarig: false,
  });
  assert.equal(updateKall[0].data.begrunnelse, "feil periode");
  assert.equal(updateKall[0].data.utfall, "AVVIST");
  assert.ok(updateKall[0].data.resolvedAt instanceof Date);

  // Mindreårig: samme kall, men fritekst skrives ikke.
  await settUtfall({
    interaksjonId: "int-2",
    utfall: "AVVIST",
    begrunnelse: "noe om en 13-åring",
    mindreaarig: true,
  });
  assert.equal(
    updateKall[1].data.begrunnelse,
    null,
    "fritekst skal aldri lagres for mindreårige",
  );
  assert.equal(updateKall[1].data.utfall, "AVVIST", "utfallet lagres fortsatt");

  // Tom begrunnelse blir null, ikke tom streng.
  await settUtfall({
    interaksjonId: "int-3",
    utfall: "ENDRET",
    begrunnelse: "   ",
    mindreaarig: false,
  });
  assert.equal(updateKall[2].data.begrunnelse, null);

  // Referanse-varianten har samme port, og rører kun PENDING-rader.
  await settUtfallForReferanse({
    referanseId: "gen-1",
    utfall: "GODKJENT",
    begrunnelse: "hemmelig",
    mindreaarig: true,
  });
  assert.equal(updateManyKall[0].data.begrunnelse, null);
  assert.deepEqual(updateManyKall[0].where, {
    referanseId: "gen-1",
    utfall: "PENDING",
  });

  // Skriving er best-effort: feiler tabellen (f.eks. før DDL-scriptet er kjørt),
  // returnerer loggen null i stedet for å velte svaret brukeren venter på.
  const inputForLogg: LoggInput = {
    prompt: { promptId: "ai-plan", promptVersjon: 1, system: "x", kontekstKilder: [] },
    klassifisering: {
      intent: "plan",
      domene: "PLAN",
      rolle: "COACH",
      mindreaarig: false,
      confidence: 1,
    },
    modell: "claude-sonnet-4-6",
  };

  assert.equal(await loggInteraksjon(inputForLogg), "int-1");

  createSkalFeile = true;
  assert.equal(
    await loggInteraksjon(inputForLogg),
    null,
    "en feil i loggen skal aldri velte svaret",
  );
});
