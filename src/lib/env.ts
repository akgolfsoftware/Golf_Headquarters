/**
 * Sentral env-validering — fail-fast på manglende kritiske miljøvariabler.
 *
 * Kjøres fra src/instrumentation.ts ved server-oppstart (runtime). Dummy-verdier
 * i CI passerer (krever kun ikke-tomme verdier), mens ekte mangel i prod kaster
 * tydelig feil i stedet for stille runtime-krasj senere.
 */

import { z } from "zod";

// Kritiske: appen fungerer ikke uten disse → kast feil.
const kritisk = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1),
});

// Anbefalte: kjernefunksjoner (betaling, e-post, cron, kryptering, AI)
// → kun advarsel i prod. Mangler de, feiler den aktuelle funksjonen stille:
// cron-jobber avvises, OAuth-tokens krypteres ikke, AI-coach svarer ikke.
const ANBEFALTE = [
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "RESEND_API_KEY",
  "CRON_SECRET",
  "BOOKING_DRAFT_SECRET",
  "ANTHROPIC_API_KEY",
  "NOTION_ENCRYPTION_KEY",
  "GOOGLE_TOKEN_ENCRYPTION_KEY",
] as const;

export function validateEnv(): void {
  const res = kritisk.safeParse(process.env);
  if (!res.success) {
    const felt = res.error.issues
      .map((i) => i.path.join("."))
      .filter((v, idx, arr) => arr.indexOf(v) === idx)
      .join(", ");
    throw new Error(
      `[env] Kritiske miljøvariabler mangler eller er ugyldige: ${felt}. ` +
        `Sett dem i Vercel (prod) eller .env.local (lokal) før oppstart.`,
    );
  }

  if (process.env.NODE_ENV === "production") {
    const mangler = ANBEFALTE.filter((k) => !process.env[k]);
    if (mangler.length > 0) {
      console.error(
        `[env] Advarsel: anbefalte miljøvariabler mangler i produksjon: ${mangler.join(", ")}. ` +
          `Betaling/e-post kan være utilgjengelig.`,
      );
    }
  }
}
