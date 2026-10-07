import { test } from "node:test";
import assert from "node:assert/strict";
import { byggOppsettData } from "./last-oppsett-data";

test("coach ser ikke andres e-post, admin ser alle", () => {
  const ansatte = [
    { id: "a", name: "Admin", email: "a@x.no", role: "ADMIN" },
    { id: "c", name: "Coach", email: "c@x.no", role: "COACH" },
  ];
  const somCoach = byggOppsettData({ id: "c", role: "COACH", name: "Coach", email: "c@x.no" }, ansatte);
  assert.equal(somCoach.team.find((t) => t.id === "a")?.email, null);
  assert.equal(somCoach.team.find((t) => t.id === "c")?.email, "c@x.no");
  const somAdmin = byggOppsettData({ id: "a", role: "ADMIN", name: "Admin", email: "a@x.no" }, ansatte);
  assert.equal(somAdmin.team.find((t) => t.id === "c")?.email, "c@x.no");
});
