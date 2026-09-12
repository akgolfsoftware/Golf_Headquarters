import assert from "node:assert/strict";
import { mock, test } from "node:test";
import { tnProtocol } from "@/lib/portal-tester/tn-catalog";
import { tnScore } from "@/lib/portal-tester/tn-scoring";
import {
  TN_REISE,
  tnDokumenterHref,
  tnGruppeHref,
  tnOversiktTestHref,
  tnSammeTestvariant,
  tnSpillerpostHref,
  tnTestforingHref,
} from "./tn-reise";

test("reisen holder samme gruppe- og spiller-id gjennom poster og dokumenter", () => {
  assert.equal(TN_REISE[0]?.href, "/team-norway");
  assert.equal(tnGruppeHref("gruppe-tn"), "/team-norway/gruppe-tn");
  assert.equal(tnDokumenterHref("gruppe-tn"), "/team-norway/gruppe-tn/dokumenter");
  assert.equal(tnSpillerpostHref("spiller-a"), "/team-norway/spiller/spiller-a");
  assert.equal(tnTestforingHref("putt-1-3m"), "/portal/tren/tester/team-norway?test=putt-1-3m");
});

test("oversikten lenker til testføring bare for spillerrollen", () => {
  assert.equal(tnOversiktTestHref("PLAYER"), "/portal/tren/tester/team-norway");
  assert.equal(tnOversiktTestHref("COACH"), null);
  assert.equal(tnOversiktTestHref("ADMIN"), null);
});

test("samme protokoll, antall og versjon følger lagret resultat, eldre regler telles ikke", () => {
  const p = tnProtocol("putt-1-3m")!;
  const values = Object.fromEntries(p.rows.map((_, i) => [String(i + 1), { strokes: 1 }]));
  const result = tnScore(p, values);
  const samme = tnSammeTestvariant(p, result.score, result);
  assert.ok(samme);
  assert.equal(samme.protocolId, "putt-1-3m");
  assert.equal(samme.count, p.rows.length);
  assert.equal(samme.testId, "tn-v3-putt-1-3m");
  assert.equal(tnSammeTestvariant(p, result.score + 1, result), null);
  assert.equal(tnSammeTestvariant(p, result.score, { ...result, protocolId: "annen" }), null);
});

test("hentViewerRolleIGruppe og gruppepost avviser annen kanonisk gruppe", async () => {
  mock.module("@/lib/prisma", {
    namedExports: {
      prisma: {
        group: {
          findUnique: async ({ where }: { where: { id: string } }) =>
            where.id === "gruppe-tn"
              ? { slug: "team-norway", name: "Team Norway Golf" }
              : { slug: "wang-toppidrett", name: "WANG Toppidrett" },
        },
        groupMember: {
          findFirst: async () => ({ id: "m1", role: "COACH" }),
          findMany: async () => [],
        },
        tnPost: { findMany: async () => [], create: async () => ({ id: "x" }) },
        user: { findMany: async () => [] },
      },
    },
  });
  const { hentViewerRolleIGruppe, hentGruppetidslinje, opprettGruppepost } = await import("@/lib/domain/tn-post");
  assert.equal(await hentViewerRolleIGruppe("gruppe-wang", "coach-a"), null);
  assert.equal(await hentGruppetidslinje("gruppe-wang", "coach-a"), null);
  await assert.rejects(
    () => opprettGruppepost({ forfatterId: "coach-a", groupId: "gruppe-wang", tekst: "Hei", kind: "TEKST" }),
    /ikke trener/i,
  );
  assert.equal(await hentViewerRolleIGruppe("gruppe-tn", "coach-a"), "TRENER");
});
