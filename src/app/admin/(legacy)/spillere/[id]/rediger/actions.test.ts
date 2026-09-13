/**
 * R-I: lagreSpiller og settValgtCoach. Rolle alene er ikke nok.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rolle = "PLAYER" | "COACH" | "ADMIN" | "PARENT";

let bruker = { id: "coach-a", role: "COACH" as Rolle };
let tillatte = new Set<string>(["spiller-a"]);
let oppdateringer: Array<{ id: string; email?: string }> = [];

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("next/navigation", {
  namedExports: {
    redirect: (to: string) => {
      throw new Error(`REDIRECT:${to}`);
    },
  },
});
mock.module("@/lib/auth/requirePortalUser", {
  namedExports: {
    requirePortalUser: async (options: { allow?: Rolle | Rolle[] } = {}) => {
      const allow = options.allow
        ? Array.isArray(options.allow)
          ? options.allow
          : [options.allow]
        : null;
      if (allow && !allow.includes(bruker.role)) {
        throw new Error(`REDIRECT:${bruker.role === "PARENT" ? "/forelder" : "/portal"}`);
      }
      return bruker;
    },
  },
});
mock.module("@/lib/auth/getCurrentUser", {
  namedExports: { getCurrentUser: async () => bruker },
});
mock.module("@/lib/auth/coached", {
  namedExports: {
    assertCoachTilgangTilSpiller: async (_viewer: unknown, playerId: string) => {
      if (!tillatte.has(playerId)) {
        throw new Error("Du har ikke tilgang til denne spilleren.");
      }
    },
    harCoachTilgangTilSpiller: async (_viewer: unknown, playerId: string) =>
      tillatte.has(playerId),
  },
});
mock.module("@/lib/audit", { namedExports: { audit: async () => undefined } });
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      user: {
        update: async ({
          where,
          data,
        }: {
          where: { id: string };
          data: { email?: string };
        }) => {
          oppdateringer.push({ id: where.id, email: data.email });
          return { id: where.id };
        },
        findFirst: async ({ where }: { where: { id: string } }) =>
          where.id === "coach-b" ? { id: "coach-b" } : null,
      },
    },
  },
});

function skjema(id = "spiller-a") {
  const fd = new FormData();
  fd.set("id", id);
  fd.set("fornavn", "Oyvind");
  fd.set("etternavn", "Rohjan");
  fd.set("email", "oyvind.rohjan@example.test");
  fd.set("hcp", "2.4");
  return fd;
}

async function actions() {
  return import("./actions");
}

test.beforeEach(() => {
  bruker = { id: "coach-a", role: "COACH" };
  tillatte = new Set(["spiller-a"]);
  oppdateringer = [];
});

test("lagreSpiller avviser spiller-rolle før skriving", async () => {
  bruker = { id: "spiller-x", role: "PLAYER" };
  const { lagreSpiller } = await actions();
  await assert.rejects(() => lagreSpiller(skjema()), /REDIRECT:\/portal/);
  assert.equal(oppdateringer.length, 0);
});

test("lagreSpiller avviser coach uten stalltilgang og skriver ingenting", async () => {
  const { lagreSpiller } = await actions();
  await assert.rejects(
    () => lagreSpiller(skjema("spiller-fremmed")),
    /ikke tilgang/,
  );
  assert.equal(oppdateringer.length, 0);
});

test("lagreSpiller oppdaterer kun spiller i stallen", async () => {
  const { lagreSpiller } = await actions();
  await assert.rejects(() => lagreSpiller(skjema()), /REDIRECT:\/admin\/spillere\/spiller-a/);
  assert.equal(oppdateringer.length, 1);
  assert.equal(oppdateringer[0]?.id, "spiller-a");
  assert.equal(oppdateringer[0]?.email, "oyvind.rohjan@example.test");
});

test("settValgtCoach avviser uten stalltilgang", async () => {
  const { settValgtCoach } = await actions();
  const svar = await settValgtCoach("spiller-fremmed", "coach-b");
  assert.equal(svar.ok, false);
  assert.match(String(svar.error), /ikke tilgang/);
  assert.equal(oppdateringer.length, 0);
});
