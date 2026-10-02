import assert from "node:assert/strict";
import { mock, test } from "node:test";

const listeners = new Map<string, (event: { message: string; target: string }) => void>();
mock.module("@/generated/prisma/client", { namedExports: { PrismaClient: class {
  $on(event: string, listener: (event: { message: string; target: string }) => void) { listeners.set(event, listener); }
} } });
mock.module("@prisma/adapter-pg", { namedExports: { PrismaPg: class {} } });

test("Prisma-feilhendelser røper aldri rå spørringsargumenter eller personopplysninger", async () => {
  const logg: unknown[][] = [];
  const error = mock.method(console, "error", (...args: unknown[]) => { logg.push(args); });
  const warn = mock.method(console, "warn", (...args: unknown[]) => { logg.push(args); });
  try {
    await import("./prisma");
    for (const type of ["error", "warn"]) {
      assert.ok(listeners.has(type));
      listeners.get(type)!({ message: 'email=syntetisk@example.test token=syntetisk-hemmelig svar=syntetisk-helsesvar', target: "private-table" });
    }
    assert.equal(logg.length, 2);
    const tekst = JSON.stringify(logg);
    for (const sensitivt of ["syntetisk@example.test", "syntetisk-hemmelig", "syntetisk-helsesvar", "private-table"]) assert.ok(!tekst.includes(sensitivt));
  } finally { error.mock.restore(); warn.mock.restore(); }
});
