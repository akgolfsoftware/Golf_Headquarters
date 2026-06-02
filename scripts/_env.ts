/**
 * Env-preload for scripts. Importeres som ALLER FØRSTE linje
 * (`import "./_env";`) slik at `.env.local` er lastet før moduler som
 * `@/lib/prisma` evalueres — Prisma-klienten leser DATABASE_URL ved
 * modul-init, og ESM evaluerer importer i rekkefølge før resten av fila.
 */

import { config } from "dotenv";

config({ path: ".env.local" });
