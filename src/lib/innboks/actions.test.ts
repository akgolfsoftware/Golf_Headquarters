/**
 * Booking-utkast fra Innboks (EP-05, EP-06): sendes i bookingmalen med eget emne,
 * og aldri med feltene coachen skal fylle inn.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

process.env.RESEND_API_KEY = "test";
let sendt: { subject: string; text: string; html?: string }[] = [];
let rad: { id: string; fraEpost: string; emne: string; bookingId: string | null };

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/auth/requirePortalUser", { namedExports: { requirePortalUser: async () => ({ id: "coach-1", role: "COACH" }) } });
mock.module("@/lib/audit", { namedExports: { audit: async () => undefined } });
mock.module("@/lib/rate-limit", { namedExports: { rateLimit: async () => ({ ok: true }) } });
mock.module("./generer-utkast", { namedExports: { genererUtkast: async () => undefined } });
mock.module("@/lib/email", {
  namedExports: { FRA_EPOST: "post@akgolf.no", resendKlient: () => ({ emails: { send: async (m: (typeof sendt)[number]) => { sendt.push(m); return {}; } } }) },
});
mock.module("@/lib/prisma", {
  namedExports: { prisma: { innboksEpost: { findUnique: async () => rad, update: async () => rad } } },
});

test.beforeEach(() => {
  sendt = [];
  rad = { id: "e1", fraEpost: "jon@eksempel.no", emne: "Takk for timen", bookingId: "b1" };
});

test("booking-utkast sendes med eget emne og i bookingmalen", async () => {
  const { sendGodkjentSvar } = await import("./actions");
  const r = await sendGodkjentSvar("e1", "Hei Jon,\n\nTakk for timen i dag. Vi jobbet med wedgene.");
  assert.equal(r.sendtReelt, true);
  assert.equal(sendt[0].subject, "Takk for timen");
  assert.ok(sendt[0].html?.includes("Takk for timen i dag"));
});

test("utkast med uutfylte hakeparenteser sendes ikke", async () => {
  const { sendGodkjentSvar } = await import("./actions");
  const r = await sendGodkjentSvar("e1", "Takk for timen i dag. Vi jobbet med [skriv kort hva dere jobbet med].");
  assert.equal(r.sendtReelt, false);
  assert.equal(sendt.length, 0);
});

test("vanlig svar i Innboks er uendret: Re: og ren tekst", async () => {
  rad = { ...rad, emne: "Spørsmål om time", bookingId: null };
  const { sendGodkjentSvar } = await import("./actions");
  await sendGodkjentSvar("e1", "Hei, [skriv] er greit.");
  assert.equal(sendt[0].subject, "Re: Spørsmål om time");
  assert.equal(sendt[0].html, undefined);
});
