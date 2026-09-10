/** Read-only launch environment check. Prints no credentials or connection strings. */
import fs from "node:fs";
import dotenv from "dotenv";

const env = { ...(fs.existsSync(".env.local") ? dotenv.parse(fs.readFileSync(".env.local")) : {}), ...process.env };
const required = ["DATABASE_URL", "DIRECT_URL", "NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "RESEND_API_KEY", "CRON_SECRET"];
const missing = required.filter(key => !env[key]);
const paymentMode = env.STRIPE_SECRET_KEY?.startsWith("sk_test_") ? "test" : env.STRIPE_SECRET_KEY?.startsWith("sk_live_") ? "live" : "ukjent";
let databaseLocal = false;
try { databaseLocal = ["localhost", "127.0.0.1", "[::1]"].includes(new URL(env.DATABASE_URL).hostname); } catch { /* Report missing/invalid configuration without its contents. */ }
console.log(JSON.stringify({
  checkedAt: new Date().toISOString(), missing, paymentMode, databaseLocal,
  publicBooking: env.BOOKING_PUBLIC === "true",
  blockers: [
    ...(missing.length ? ["Påkrevde miljøvariabler mangler."] : []),
    ...(paymentMode !== "test" ? ["Betalingsprøver krever Stripe-testnøkkel."] : []),
    ...(!databaseLocal ? ["Bekreft separat testdatabase før prøver som skriver data."] : []),
    "Faktisk kjøp, tilgangsreiser, e-postlevering og gjenoppretting må dokumenteres separat.",
  ],
  launchApproved: false,
}, null, 2));
process.exitCode = missing.length || paymentMode !== "test" ? 2 : 0;
