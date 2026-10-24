import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";
import * as React from "react";
import { nodes, text } from "./_flate-tre";
import type { AkBeslutningskvittering } from "@/lib/deling/ak-beslutningskvittering";

const slots: unknown[] = [];
let cursor = 0;
let refresh = 0;
const calls: string[] = [];
const transitions: Promise<void>[] = [];
let result: () => Promise<AkBeslutningskvittering>;
mock.module("react", { namedExports: { ...React,
  useState<T>(initial: T): [T, (value: T) => void] {
    const i = cursor++; if (!(i in slots)) slots[i] = initial;
    return [slots[i] as T, value => { slots[i] = value; }];
  },
  useTransition: () => [false, (run: () => Promise<void>) => { transitions.push(run()); }],
} });
mock.module("next/navigation", { namedExports: { useRouter: () => ({ refresh: () => { refresh++; } }) } });
mock.module("next/link", { defaultExport: "a" });
mock.module("@/components/admin/agencyos/ui", { namedExports: { agBtnClass: () => "button" } });
mock.module("@/lib/agents/actions", { namedExports: {
  acceptPlanActionMedKvittering: async (id: string) => { calls.push(`accept:${id}`); return result(); },
  rejectPlanActionMedKvittering: async (id: string) => { calls.push(`reject:${id}`); return result(); },
} });
let ApprovalActions: typeof import("@/app/admin/(legacy)/approvals/approval-actions").ApprovalActions;
before(async () => { ({ ApprovalActions } = await import("@/app/admin/(legacy)/approvals/approval-actions")); });
const render = () => { cursor = 0; return ApprovalActions({ actionId: "synthetic-action", playerId: "synthetic-player" }); };
async function click(label: string) {
  const button = nodes(render()).find(n => n.type === "button" && text(n).includes(label));
  assert.ok(button); (button.props.onClick as () => void)();
  await Promise.all(transitions);
}
beforeEach(() => {
  slots.length = 0; calls.length = 0; transitions.length = 0; refresh = 0;
  result = async () => ({ ok: true });
});

test("approval list shows the known no-op and refreshes for both choices", async () => {
  result = async () => ({ ok: false, kode: "ALLEREDE_BEHANDLET", feil: "Forslaget er allerede behandlet eller erstattet.", oppdater: true });
  await click("Godkjenn");
  assert.match(text(render()), /allerede behandlet eller erstattet/);
  assert.ok(nodes(render()).some(n => n.props.role === "alert"));
  await click("Avvis");
  assert.equal(refresh, 2);
  assert.deepEqual(calls, ["accept:synthetic-action", "reject:synthetic-action"]);
});
test("success refreshes only after the server confirms and clears the previous error", async () => {
  result = async () => { throw Error("private synthetic detail"); };
  await click("Godkjenn");
  let complete!: (value: AkBeslutningskvittering) => void;
  result = () => new Promise(resolve => { complete = resolve; });
  const pending = click("Godkjenn");
  assert.equal(refresh, 0);
  complete({ ok: true }); await pending;
  assert.equal(refresh, 1);
  assert.equal(nodes(render()).some(n => n.props.role === "alert"), false);
});
test("unknown failures show a fixed message without private details or success refresh", async () => {
  result = async () => { throw Error("private synthetic database detail"); };
  await click("Avvis");
  assert.match(text(render()), /Handlingen kunne ikke bekreftes/);
  assert.doesNotMatch(text(render()), /private synthetic/);
  assert.equal(refresh, 0);
});
