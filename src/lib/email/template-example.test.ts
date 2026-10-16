import { test } from "node:test";
import assert from "node:assert/strict";
import { templateExample } from "./template-example";
test("maltesten bruker syntetiske gamle og nye variabler, og viser ukjente felt", () => {
  const result = templateExample({subject:"{{name}} / {{spillerNavn}}\n{{time}}", body:"{{missing}} {{__proto__}} **Hei**\n{{paymentRef}}"});
  assert.equal(result.subject, "Test Spiller / Test Spiller 16:30");
  assert.deepEqual(result.unknown, ["missing", "__proto__"]);
  assert.match(result.html, /<strong>Hei<\/strong><br \/>TEST-BETALING/);
  assert.doesNotMatch(result.html, /\[object Object\]/);
});
test("HTML i maltekst blir tekst, ikke kjørbart innhold", () => {
  const result = templateExample({subject:"Test",body:'<script>alert(1)</script><a href="javascript:alert(2)">lenke</a>'});
  assert.doesNotMatch(result.html, /<script|href="javascript/);
  assert.match(result.html, /&lt;script&gt;/);
});

test("booking viser bare felter som den faktiske senderen støtter", () => {
  const result = templateExample({slug:"booking-bekreftelse",subject:"{{plan_navn}}",body:"{{refundLine}} {{name}}"});
  assert.deepEqual(result.unknown,["plan_navn","refundLine"]);
  assert.equal(result.text," Test Spiller");
  assert.ok(!result.fields.includes("plan_navn"));
  assert.ok(templateExample({slug:"booking-avbestilt",subject:"Test",body:""}).fields.includes("refundLine"));
});
