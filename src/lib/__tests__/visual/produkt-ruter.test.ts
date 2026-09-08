/**
 * Rutelista for den nattlige lys/mørk-røyktesten (tests/visual/produkt-ruter.ts).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { erRedirectSide, tilRute, finnProduktRuter } from "../../../../tests/visual/produkt-ruter";

test("erRedirectSide: bare redirect() uten JSX er en redirect-side", () => {
  assert.equal(
    erRedirectSide('import { redirect } from "next/navigation";\nexport default function Side() {\n  redirect("/admin/ko?fane=agentko");\n}\n'),
    true,
  );
  assert.equal(
    erRedirectSide('import { redirect } from "next/navigation";\nexport default function Side({ ok }: { ok: boolean }) {\n  if (!ok) redirect("/portal");\n  return (\n    <div />\n  );\n}\n'),
    false,
  );
});

test("tilRute: rutegrupper strippes, [param] gir null", () => {
  assert.equal(tilRute("/admin/(legacy)/stall/page.tsx"), "/admin/stall");
  assert.equal(tilRute("/portal/(fullscreen)/tren/page.tsx"), "/portal/tren");
  assert.equal(tilRute("/forelder/page.tsx"), "/forelder");
  assert.equal(tilRute("/admin/spillere/[id]/page.tsx"), null);
  assert.equal(tilRute("/forelder/barn/[childId]/page.tsx"), null);
});

test("finnProduktRuter: besøkbare ruter, sortert, uten grupper/param/redirect-sider", () => {
  const forelder = finnProduktRuter("forelder");
  assert.ok(forelder.includes("/forelder"));
  assert.ok(forelder.includes("/forelder/barn"));
  assert.deepEqual(forelder, [...forelder].sort());
  for (const r of forelder) assert.doesNotMatch(r, /[[(]/, `${r} har gruppe- eller param-segment`);

  const admin = finnProduktRuter("admin");
  assert.ok(admin.includes("/admin/spillere"));
  // /admin/agenticos er en ren redirect til /admin/jarvis (MASTERPLAN 15.1) — dekkes av målsiden.
  assert.ok(!admin.includes("/admin/agenticos"));
  assert.ok(finnProduktRuter("portal").includes("/portal"));
});
