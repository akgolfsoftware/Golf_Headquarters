// Låser GDPR-porten i AgenticOS-loggen: fritekst lagres ALDRI når
// interaksjonen gjelder en mindreårig.
//
// Porten lå tidligere som et `mindreaarig`-flagg hvert kallsted måtte sette
// riktig — og som sto hardkodet til `false` overalt fordi ingen flate lagret
// fritekst ennå. Nå slår `settUtfall` det opp selv mot interaksjonens spiller.
// Denne testen låser at oppslaget faktisk skjer, og at tvil faller til «ikke
// lagre».
//
// Mønster: ett t.mock.module-oppsett med muterbar tilstand. Modulen under test
// importeres kun én gang per fil (Node re-evaluerer ikke en lastet ES-modul).

import { test } from "node:test";
import assert from "node:assert/strict";
import type { LoggInput } from "@/lib/agenticos/logg";

type UpdateArgs = { where: unknown; data: Record<string, unknown> };
type Bruker = { dateOfBirth: Date | null; requiresGuardianConsent: boolean };

const VOKSEN: Bruker = { dateOfBirth: new Date("1985-05-05"), requiresGuardianConsent: false };
const BARN: Bruker = { dateOfBirth: new Date("2014-05-05"), requiresGuardianConsent: false };
const VENTER_SAMTYKKE: Bruker = { dateOfBirth: null, requiresGuardianConsent: true };

test("AgenticOS-loggen — GDPR-port, utfall og best-effort-skriving", async (t) => {
  const updateKall: UpdateArgs[] = [];
  const updateManyKall: UpdateArgs[] = [];
  let createSkalFeile = false;
  // Hvilken spiller interaksjonen peker på, og hvem den spilleren er.
  let interaksjonUserId: string | null = "spiller-1";
  let bruker: Bruker | null = VOKSEN;

  t.mock.module("@/lib/prisma", {
    namedExports: {
      prisma: {
        aiInteraksjon: {
          create: async () => {
            if (createSkalFeile) throw new Error("tabellen finnes ikke ennå");
            return { id: "int-1" };
          },
          findUnique: async () => ({ userId: interaksjonUserId }),
          update: async (args: UpdateArgs) => {
            updateKall.push(args);
            return { id: "int-1" };
          },
          updateMany: async (args: UpdateArgs) => {
            updateManyKall.push(args);
            return { count: 1 };
          },
        },
        user: {
          findUnique: async () => bruker,
        },
      },
    },
  });

  const { loggInteraksjon, settUtfall, settUtfallForReferanse } = await import(
    "@/lib/agenticos/logg"
  );

  // Voksen spiller: begrunnelsen lagres.
  await settUtfall({
    interaksjonId: "int-1",
    utfall: "AVVIST",
    begrunnelse: "Feil periode",
  });
  assert.equal(updateKall[0].data.begrunnelse, "Feil periode");
  assert.equal(updateKall[0].data.utfall, "AVVIST");
  assert.ok(updateKall[0].data.resolvedAt instanceof Date);

  // Mindreårig: utfallet lagres, friteksten ikke.
  bruker = BARN;
  await settUtfall({
    interaksjonId: "int-2",
    utfall: "AVVIST",
    begrunnelse: "Feil nivå for spilleren",
  });
  assert.equal(
    updateKall[1].data.begrunnelse,
    null,
    "fritekst skal aldri lagres for mindreårige",
  );
  assert.equal(updateKall[1].data.utfall, "AVVIST", "utfallet lagres fortsatt");

  // Venter på foreldresamtykke teller også som mindreårig, uansett fødselsdato.
  bruker = VENTER_SAMTYKKE;
  await settUtfall({
    interaksjonId: "int-3",
    utfall: "AVVIST",
    begrunnelse: "Dårlig begrunnelse",
  });
  assert.equal(updateKall[2].data.begrunnelse, null);

  // Ukjent bruker → tvil faller til «ikke lagre».
  bruker = null;
  await settUtfall({
    interaksjonId: "int-4",
    utfall: "AVVIST",
    begrunnelse: "Noe tekst",
  });
  assert.equal(updateKall[3].data.begrunnelse, null, "ved tvil lagres ingenting");

  // Interaksjon uten spiller (stall-brede agenter): ingen mindreårig kan
  // identifiseres, og friteksten handler om systemet — da lagres den.
  interaksjonUserId = null;
  bruker = VOKSEN;
  await settUtfall({
    interaksjonId: "int-5",
    utfall: "AVVIST",
    begrunnelse: "Ikke relevant nå",
  });
  assert.equal(updateKall[4].data.begrunnelse, "Ikke relevant nå");

  // Tom begrunnelse blir null, ikke tom streng — og trigger ingen oppslag.
  await settUtfall({ interaksjonId: "int-6", utfall: "ENDRET", begrunnelse: "   " });
  assert.equal(updateKall[5].data.begrunnelse, null);

  // Referanse-varianten rører kun PENDING-rader og lagrer aldri fritekst:
  // updateMany kan treffe flere interaksjoner med ulik spiller.
  await settUtfallForReferanse({ referanseId: "gen-1", utfall: "GODKJENT" });
  assert.deepEqual(updateManyKall[0].where, {
    referanseId: "gen-1",
    utfall: "PENDING",
  });
  assert.equal(updateManyKall[0].data.begrunnelse, undefined);

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
