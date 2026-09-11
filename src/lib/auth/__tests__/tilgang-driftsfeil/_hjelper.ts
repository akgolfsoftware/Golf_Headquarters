/**
 * Delt oppsett for R-H-testene (driftsfeil vs. ekte manglende abonnement).
 * Hver test ligger i EGEN fil fordi node:test kjører hver testfil i egen
 * prosess — det er den enkleste måten å unngå "module already mocked" når
 * hver test trenger en ULIK `@/lib/prisma`-mock av samme modul-spesifikasjon.
 */
import { mock } from "node:test";

export const BASIS_BRUKER = {
  id: "u-1",
  authId: "auth-1",
  tier: "GRATIS",
  profilType: "STANDARD",
  createdAt: new Date("2020-01-01T00:00:00Z"), // gammel nok til at prøveperiode-fallback ikke slår inn
  trialEndsAt: null,
  deletedAt: null,
  lastLoginAt: new Date(),
};

/**
 * `next/navigation` mockes fordi den ekte modulen (app-router-context) ikke
 * er lastbar under node:test sin `--conditions=react-server` uten en full
 * React DOM-kontekst — irrelevant for testens formål (getCurrentUserRaw
 * kaller aldri redirect(), kun getCurrentUser gjør).
 */
export function mockFellesModuler() {
  mock.module("next/navigation", {
    namedExports: {
      redirect: (dest: string) => {
        throw new Error(`redirect() kalt uventet mot ${dest}`);
      },
    },
  });
  mock.module("@/lib/supabase/server", {
    namedExports: {
      createClient: async () => ({
        auth: {
          getUser: async () => ({ data: { user: { id: "auth-1" } } }),
        },
      }),
    },
  });
}

export async function lastGetCurrentUserRaw() {
  const mod = await import("../../getCurrentUser");
  return mod.getCurrentUserRaw as () => Promise<{
    tilgang: { nivaa: string; kilde: string };
  } | null>;
}
