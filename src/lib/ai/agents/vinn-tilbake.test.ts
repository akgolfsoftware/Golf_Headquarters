import assert from "node:assert/strict";
import { mock, test } from "node:test";

// Personvern: ingen del av spillerens navn skal sendes til Anthropic
// (beslutninger.md §SKJERMENE … RUNDE 8, punkt 3). Fornavnet settes inn i svaret lokalt.
const sendt: string[] = [];

mock.module("@/lib/prisma", { namedExports: { prisma: {} } });
mock.module("../client", {
  namedExports: {
    isAiEnabled: () => true,
    modelFor: () => "test",
    tekstFra: (r: { tekst: string }) => r.tekst,
    anthropic: {
      messages: {
        create: async (args: { system: string; messages: { content: string }[] }) => {
          sendt.push(args.system + "\n" + args.messages.map((m) => m.content).join("\n"));
          const pseudonym = /Spiller: (\S+)/.exec(args.messages[0].content)?.[1] ?? "";
          return { tekst: `${pseudonym}, lenge siden sist!` };
        },
      },
    },
  },
});

test("vinn-tilbake sender ikke navnet, men meldingen får fornavnet", async () => {
  const { byggMelding } = await import("./vinn-tilbake");
  const melding = await byggMelding({
    spillerId: "spiller-1",
    spillerNavn: "Tobias Lindvik",
    coachNavn: "Anders Kristiansen",
    dagerInaktiv: 40,
    sisteFokus: null,
    sisteMaalTitle: null,
    hcp: 12,
  });

  assert.equal(sendt.length, 1);
  assert.ok(!sendt[0].includes("Tobias"), "fornavnet sendt til AI");
  assert.ok(!sendt[0].includes("Lindvik"), "etternavnet sendt til AI");
  assert.equal(melding, "Tobias, lenge siden sist!");
});
