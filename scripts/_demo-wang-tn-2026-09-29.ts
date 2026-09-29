/**
 * Felles oppsett for demoskriptene (add-/slett-demo-wang-tn-2026-09-29.ts).
 * Laster .env.local fra hovedkatalogen (eller DEMO_ENV_FIL) ved import, så
 * miljøet er på plass før Prisma og Supabase lages.
 */
import { homedir } from "node:os";
import path from "node:path";

import { config as lastEnv } from "dotenv";

export const DEMO_ENV_FIL = process.env.DEMO_ENV_FIL ?? path.join(homedir(), "Developer/akgolf-hq/.env.local");
lastEnv({ path: DEMO_ENV_FIL, quiet: true });

export const DEMO = {
  wang: {
    slug: "wang-toppidrett-demo",
    gruppenavn: "Demo · WANG Toppidrett Golf",
    epost: "demo.sportssjef@wang.no",
    navn: "Demo Sportssjef",
    envEpost: "DEMO_WANG_EPOST",
    envPassord: "DEMO_WANG_PASSORD",
    authPrefiks: "demo-wang-elev-",
    elevEpost: (n: number) => `demo.wang.elev${String(n).padStart(2, "0")}@demo.invalid`,
    elever: ["Ada Berg", "Jonas Lie", "Sara Moe", "Emil Dahl", "Nora Vik", "Theo Holm"],
    skole: "WANG Toppidrett Fredrikstad",
  },
  tn: {
    slug: "team-norway-demo",
    gruppenavn: "Demo · Team Norway Golf",
    epost: "demo.trener@golfforbundet.no",
    navn: "Demo Trener",
    envEpost: "DEMO_TN_EPOST",
    envPassord: "DEMO_TN_PASSORD",
    authPrefiks: "demo-tn-spiller-",
    elevEpost: (n: number) => `demo.tn.spiller${String(n).padStart(2, "0")}@demo.invalid`,
    elever: ["Ida Strand", "Mats Bakke", "Julie Aas", "Henrik Foss", "Emma Lund", "Sander Ruud"],
    skole: "Demo videregående",
  },
} as const;

export type Omraade = keyof typeof DEMO;
