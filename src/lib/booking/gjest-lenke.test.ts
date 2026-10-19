import test from "node:test";
import assert from "node:assert/strict";
import { gjestLenkeNokkel, lesGjestLenke, signerGjestLenke } from "./gjest-lenke";

const nokkel = Buffer.from("a".repeat(32));
const start = new Date("2030-06-01T12:00:00Z");
const foer = new Date("2030-05-01T12:00:00Z");

test("gyldig lenke leses tilbake med booking og starttid", () => {
  const token = signerGjestLenke("b1", start, nokkel)!;
  const data = lesGjestLenke(token, foer, nokkel);
  assert.equal(data?.bookingId, "b1");
  assert.equal(data?.startAt.toISOString(), start.toISOString());
});

test("lenken bærer ikke e-post", () => {
  const token = signerGjestLenke("b1", start, nokkel)!;
  const innhold = Buffer.from(token.split(".")[0], "base64url").toString();
  assert.doesNotMatch(innhold, /@/);
});

test("utløpt lenke avvises", () => {
  const token = signerGjestLenke("b1", start, nokkel)!;
  assert.equal(lesGjestLenke(token, new Date("2030-06-02T00:00:00Z"), nokkel), null);
});

test("endret innhold avvises", () => {
  const token = signerGjestLenke("b1", start, nokkel)!;
  const [payload, sig] = token.split(".");
  const data = JSON.parse(Buffer.from(payload, "base64url").toString());
  data.b = "b2";
  const endret = `${Buffer.from(JSON.stringify(data)).toString("base64url")}.${sig}`;
  assert.equal(lesGjestLenke(endret, foer, nokkel), null);
});

test("endret signatur og annen nøkkel avvises", () => {
  const token = signerGjestLenke("b1", start, nokkel)!;
  assert.equal(lesGjestLenke(token.slice(0, -2) + "xx", foer, nokkel), null);
  assert.equal(lesGjestLenke(token, foer, Buffer.from("b".repeat(32))), null);
  assert.equal(lesGjestLenke("tull", foer, nokkel), null);
});

test("uten nøkkel lages og godtas ingen lenke", () => {
  assert.equal(signerGjestLenke("b1", start, null), null);
  assert.equal(gjestLenkeNokkel({}), null);
  assert.ok(gjestLenkeNokkel({ CRON_SECRET: "x".repeat(16) }));
});
