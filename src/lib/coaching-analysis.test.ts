import assert from "node:assert/strict";
import { mock, test } from "node:test";

// Personvern: spillerens navn i avskriften av opptaket skal ikke sendes til
// Anthropic (beslutninger.md §SKJERMENE … RUNDE 8, punkt 3). Referatet får navnet tilbake.
const sendt: string[] = [];

mock.module("./anthropic", {
  namedExports: {
    COACH_MODEL: "test",
    anthropicKlient: () => ({
      messages: {
        create: async (args: { system: string; messages: { content: string }[] }) => {
          sendt.push(args.system + "\n" + args.messages.map((m) => m.content).join("\n"));
          const tekst = "[PERSON2] jobbet med low point.";
          return {
            content: [
              {
                type: "tool_use",
                input: {
                  teknisk: tekst, taktisk: tekst, mental: tekst, fysisk: tekst,
                  hjemmelekse: tekst, coachAnalyse: tekst, nesteOktAnbefaling: tekst,
                  oppsummering: tekst,
                },
              },
            ],
          };
        },
      },
    }),
  },
});

test("avskriften sendes uten spillerens navn, referatet får navnet tilbake", async () => {
  const { analyserCoachingSesjon } = await import("./coaching-analysis");
  const resultat = await analyserCoachingSesjon({
    spillerKontekst: {
      navn: "Tobias Lindvik",
      hcp: 4.2,
      ambisjon: null,
      alder: 16,
      sisteFireUkerSummary: "8 økter",
      aktivPlan: null,
    },
    transkripsjon: "Tobias, se på low point. Bra, Tobias Lindvik. Perfekt treff.",
    varighetMin: 60,
  });

  assert.equal(sendt.length, 1);
  assert.ok(!sendt[0].includes("Tobias"), "fornavnet sendt til AI");
  assert.ok(!sendt[0].includes("Lindvik"), "etternavnet sendt til AI");
  assert.ok(sendt[0].includes("Perfekt treff"), "resten av avskriften må stå urørt");
  assert.equal(resultat.teknisk, "Tobias jobbet med low point.");
});
