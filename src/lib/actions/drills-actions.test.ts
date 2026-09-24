import test, { mock } from "node:test";
import assert from "node:assert/strict";

mock.module("next/cache", { namedExports: { revalidatePath: () => {} } });
mock.module("next/navigation", { namedExports: { redirect: () => {}, useRouter: () => ({ push: () => {} }) } });
mock.module("@/lib/auth/requirePortalUser", { namedExports: { requirePortalUser: async () => ({ id: "test-user", role: "COACH" }) } });

test("drills-actions — opprettOvelseAction validerer obligatoriske felt", async () => {
  const { opprettOvelseAction } = await import("./drills-actions");
  
  try {
    const res = await opprettOvelseAction({
      name: "   ",
      pyramidArea: "TEK",
    });
    assert.equal(res.ok, false);
    if (!res.ok) {
      assert.match(res.error, /obligatorisk/i);
    }
  } catch (err) {
    assert.ok(err);
  }
});
