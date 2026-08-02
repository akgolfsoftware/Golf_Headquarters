// Låser regelen fra 1.2: å avgjøre et CaddieDraft skal ALLTID melde utfallet
// til AgenticOS-loggen. Hullet oppsto fordi status og utfall var to separate
// kall som én kodesti glemte — nå er det én operasjon.
//
// Mønster: ett t.mock.module-oppsett med muterbar tilstand. Modulen under test
// importeres kun én gang per fil (Node re-evaluerer ikke en lastet ES-modul).

import { test } from "node:test";
import assert from "node:assert/strict";

type UpdateArgs = { where: { id: string }; data: Record<string, unknown> };
type SettUtfallArgs = {
  interaksjonId: string;
  utfall: string;
  begrunnelse?: string;
};

test("avgjorDraft setter status OG melder utfall i én operasjon", async (t) => {
  const draftUpdates: UpdateArgs[] = [];
  const utfallKall: SettUtfallArgs[] = [];

  t.mock.module("@/lib/prisma", {
    namedExports: {
      prisma: {
        caddieDraft: {
          update: async (args: UpdateArgs) => {
            draftUpdates.push(args);
            return { id: args.where.id };
          },
        },
      },
    },
  });

  t.mock.module("@/lib/agenticos/logg", {
    namedExports: {
      settUtfall: async (args: SettUtfallArgs) => {
        utfallKall.push(args);
      },
    },
  });

  const { avgjorDraft } = await import("@/lib/caddie/draft-status");

  // Godkjenning → APPROVED på raden, GODKJENT i loggen.
  await avgjorDraft({ draftId: "d1", interaksjonId: "int-1", status: "APPROVED" });
  assert.equal(draftUpdates[0].where.id, "d1");
  assert.equal(draftUpdates[0].data.status, "APPROVED");
  assert.ok(draftUpdates[0].data.resolvedAt instanceof Date);
  assert.equal(utfallKall[0].interaksjonId, "int-1");
  assert.equal(utfallKall[0].utfall, "GODKJENT");

  // Avvisning → REJECTED / AVVIST.
  await avgjorDraft({ draftId: "d2", interaksjonId: "int-2", status: "REJECTED" });
  assert.equal(draftUpdates[1].data.status, "REJECTED");
  assert.equal(utfallKall[1].utfall, "AVVIST");

  // Uten interaksjonId: raden avgjøres fortsatt, men det finnes ingen
  // interaksjon å melde til. Gjelder utkast fra før loggen fantes, og agenter
  // som ennå ikke logger.
  await avgjorDraft({ draftId: "d3", interaksjonId: null, status: "APPROVED" });
  assert.equal(draftUpdates[2].data.status, "APPROVED");
  assert.equal(
    utfallKall.length,
    2,
    "skal ikke kalle settUtfall når utkastet ikke er koblet til en interaksjon",
  );

  // Avvisningsgrunn føres videre til loggen. GDPR-porten står i settUtfall,
  // ikke her — denne modulen skal ikke kjenne til alder.
  await avgjorDraft({
    draftId: "d4",
    interaksjonId: "int-4",
    status: "REJECTED",
    begrunnelse: "Feil periode",
  });
  assert.equal(utfallKall[2].begrunnelse, "Feil periode");
});
