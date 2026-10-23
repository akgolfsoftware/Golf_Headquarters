import assert from "node:assert/strict";
import { mock, test } from "node:test";
import * as React from "react";
import { nodes, text } from "./_flate-tre";
const slots: unknown[] = [];
let cursor = 0;
let oauthCalls = 0;
mock.module("react", { namedExports: { ...React, useState<T>(initial: T): [T, (value: T) => void] {
  const i = cursor++; if (!(i in slots)) slots[i] = initial;
  return [slots[i] as T, v => { slots[i] = v; }];
}, useEffect() {}, useSyncExternalStore: (_s: unknown, f: () => unknown) => f() } });
mock.module("next/link", { defaultExport: "a" });
mock.module("@/lib/supabase/client", { namedExports: { createClient: () => ({ auth: {
  signInWithOAuth: async () => { oauthCalls++; return { error: null }; },
} }) } });
mock.module("@/styles/flater-ny.css", { defaultExport: {} });
mock.module("@/styles/flater-ny-konto.css", { defaultExport: {} });
Object.defineProperty(globalThis, "window", { configurable: true, value: { location: { origin: "https://syntetisk.example" } } });
test("Google-registrering krever samme vilkårsvalg som e-post", async () => {
  const { Registrering } = await import("@/components/auth/precision/KontoSkjermer");
  const render = () => { cursor = 0; return Registrering({}); };
  const google = () => nodes(render()).find(n => n.type === "button" && text(n) === "Fortsett med Google")!;
  await (google().props.onClick as () => Promise<void>)();
  assert.equal(oauthCalls, 0);
  assert.match(text(render()), /Du må godta vilkårene/);
  const checkbox = nodes(render()).find(n => n.type === "input" && n.props.type === "checkbox")!;
  (checkbox.props.onChange as (e: { target: { checked: boolean } }) => void)({ target: { checked: true } });
  await (google().props.onClick as () => Promise<void>)();
  assert.equal(oauthCalls, 1);
});
