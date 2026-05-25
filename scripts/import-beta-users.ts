/**
 * AK Golf HQ — Beta-spiller-import.
 *
 * Tar en CSV med navn + e-post og oppretter:
 *   1. Supabase auth-record (auto-bekreftet, midlertidig passord)
 *   2. Prisma User-rad (role=PLAYER, tier=PRO, homeClub=GFGK)
 *   3. Velkomst-e-post via Resend med innloggings-detaljer
 *
 * Idempotent: hopper over brukere som allerede finnes i Prisma.
 *
 * CSV-format (header obligatorisk, UTF-8):
 *   name,email
 *   Markus Roinaas Pedersen,markus@example.com
 *   Sofie Larsen,sofie@example.com
 *
 * Bruk:
 *   npx tsx scripts/import-beta-users.ts data/beta-users.csv
 *   npx tsx scripts/import-beta-users.ts data/beta-users.csv --dry-run
 *
 * Env-krav (.env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  (IKKE anon-nøkkel — service role!)
 *   RESEND_API_KEY
 *   DATABASE_URL
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { PrismaPg } from "@prisma/adapter-pg";
import { Resend } from "resend";
import { PrismaClient } from "../src/generated/prisma/client";

// --- Env-validering ---

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const resendApiKey = process.env.RESEND_API_KEY;
const databaseUrl = process.env.DATABASE_URL;

if (!supabaseUrl || !supabaseServiceKey || !resendApiKey || !databaseUrl) {
  console.error("Mangler env-variabler. Sjekk .env.local:");
  if (!supabaseUrl) console.error("  - NEXT_PUBLIC_SUPABASE_URL");
  if (!supabaseServiceKey) console.error("  - SUPABASE_SERVICE_ROLE_KEY (ikke anon!)");
  if (!resendApiKey) console.error("  - RESEND_API_KEY");
  if (!databaseUrl) console.error("  - DATABASE_URL");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const resend = new Resend(resendApiKey);

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

const FRA_EPOST = process.env.RESEND_FROM_EMAIL ?? "AK Golf <post@akgolf.no>";

// --- Hjelpefunksjoner ---

type CsvRad = { name: string; email: string };

type Resultat = {
  email: string;
  name: string;
  suksess: boolean;
  feil?: string;
  authId?: string;
  prismaId?: string;
};

/**
 * Genererer et lesbart, midlertidig passord på 12 tegn (a-z, A-Z, 0-9).
 * Brukes kun for første innlogging — spiller bytter selv etterpå.
 */
function genererTempPassord(): string {
  const a = Math.random().toString(36).slice(2, 8);
  const b = Math.random().toString(36).slice(2, 8).toUpperCase();
  return a + b;
}

function detectDelimiter(line: string): string {
  if (line.includes(";")) return ";";
  if (line.includes("\t")) return "\t";
  return ",";
}

function lesCsv(filsti: string): CsvRad[] {
  const innhold = readFileSync(filsti, "utf8");
  const linjer = innhold
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (linjer.length === 0) throw new Error("Tom CSV-fil");

  const delim = detectDelimiter(linjer[0]);
  const header = linjer[0].split(delim).map((s) => s.trim().toLowerCase());
  const navnIdx = header.indexOf("name");
  const emailIdx = header.indexOf("email");

  if (navnIdx === -1 || emailIdx === -1) {
    throw new Error("CSV mangler 'name' eller 'email' kolonne i header");
  }

  return linjer
    .slice(1)
    .map((linje) => {
      const felter = linje.split(delim).map((s) => s.trim());
      return {
        name: felter[navnIdx] ?? "",
        email: (felter[emailIdx] ?? "").toLowerCase(),
      };
    })
    .filter((r) => r.name.length > 0 && r.email.length > 0);
}

function velkomstHtml(name: string, email: string, tempPassord: string): string {
  const fornavn = name.split(" ")[0];
  const loginLink = `https://akgolf.no/auth/login?email=${encodeURIComponent(email)}`;
  return `<!doctype html>
<html lang="nb">
<head><meta charset="UTF-8"></head>
<body style="font-family: system-ui, sans-serif; max-width: 600px; margin: 32px auto; color: #0A1F17;">
  <h1 style="font-size: 28px; font-weight: 600; color: #005840; margin: 0 0 16px;">Hei ${fornavn},</h1>
  <p>Du er invitert til aa beta-teste AK Golf HQ. Tusen takk for at du blir med — feedback fra deg er gull verdt.</p>

  <p style="margin-top: 24px;"><strong>Innloggingsdetaljer:</strong></p>
  <ul style="line-height: 1.8;">
    <li>E-post: <code>${email}</code></li>
    <li>Midlertidig passord: <code style="background:#F1EEE5;padding:2px 8px;border-radius:4px;">${tempPassord}</code></li>
  </ul>
  <p>Bytt passord etter foerste innlogging i Innstillinger &gt; Sikkerhet.</p>

  <p style="margin-top: 32px;">
    <a href="${loginLink}"
       style="display:inline-block;background:#005840;color:#D1F843;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
      Logg inn naa
    </a>
  </p>

  <p style="margin-top: 32px;">Som beta-tester faar du:</p>
  <ul style="line-height: 1.8;">
    <li>PRO-tier helt gratis under beta-perioden</li>
    <li>Tilgang til alle treningsplaner, drills og tester</li>
    <li>Direkte feedback-kanal til oss</li>
  </ul>

  <p style="margin-top: 32px; color:#5E5C57; font-size: 14px;">
    Svar gjerne paa denne e-posten hvis du har sporsmaal eller observasjoner.
    Vi er ekstremt takknemlige for all input.
  </p>
</body>
</html>`;
}

async function importerSpiller(input: CsvRad): Promise<Resultat> {
  const tempPassord = genererTempPassord();

  try {
    // 1. Idempotens-sjekk
    const eksisterende = await prisma.user.findUnique({
      where: { email: input.email },
    });
    if (eksisterende) {
      return { ...input, suksess: false, feil: "Bruker finnes allerede i Prisma" };
    }

    // 2. Supabase auth-record
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: input.email,
        password: tempPassord,
        email_confirm: true,
        user_metadata: { name: input.name, beta: true },
      });

    if (authError || !authData.user) {
      return {
        ...input,
        suksess: false,
        feil: authError?.message ?? "Supabase auth-feil",
      };
    }

    // 3. Prisma User
    const user = await prisma.user.create({
      data: {
        authId: authData.user.id,
        email: input.email,
        name: input.name,
        role: "PLAYER",
        tier: "PRO",
        homeClub: "GFGK",
        // Default-preferences for nye beta-spillere
        preferences: {
          beta: true,
          onboardingCompleted: false,
          notifications: {
            email: true,
            push: true,
            sms: false,
          },
          language: "nb",
          theme: "light",
        },
      },
    });

    // 4. Subscription (PRO = 4 coaching credits/mnd, gratis under beta)
    await prisma.subscription.create({
      data: {
        userId: user.id,
        tier: "PRO",
        status: "ACTIVE",
        monthlyCredits: 4,
        creditsRemaining: 4,
        // currentPeriodEnd = 90 dager fra nå (beta-periode)
        currentPeriodEnd: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    });

    // 5. Velkomst-e-post
    await resend.emails.send({
      from: FRA_EPOST,
      to: input.email,
      subject: "Velkommen til AK Golf HQ — beta-test",
      html: velkomstHtml(input.name, input.email, tempPassord),
    });

    return {
      ...input,
      suksess: true,
      authId: authData.user.id,
      prismaId: user.id,
    };
  } catch (err) {
    return {
      ...input,
      suksess: false,
      feil: err instanceof Error ? err.message : String(err),
    };
  }
}

// --- Main ---

async function main() {
  const args = process.argv.slice(2);
  const filArg = args.find((a) => !a.startsWith("--"));
  const dryRun = args.includes("--dry-run");

  if (!filArg) {
    console.error("Bruk: npx tsx scripts/import-beta-users.ts <csv-fil> [--dry-run]");
    process.exit(1);
  }

  const fullPath = resolve(filArg);
  console.log(`[beta-import] Leser CSV: ${fullPath}`);
  if (dryRun) console.log("[beta-import] DRY-RUN: ingen endringer gjores\n");

  const brukere = lesCsv(fullPath);
  console.log(`[beta-import] Funnet ${brukere.length} brukere\n`);

  const resultater: Resultat[] = [];

  for (const bruker of brukere) {
    process.stdout.write(`  ${bruker.name} (${bruker.email})... `);

    if (dryRun) {
      console.log("[DRY-RUN]");
      resultater.push({ ...bruker, suksess: true });
      continue;
    }

    const r = await importerSpiller(bruker);
    if (r.suksess) {
      console.log("OK");
    } else {
      console.log(`FEIL: ${r.feil}`);
    }
    resultater.push(r);
  }

  const ok = resultater.filter((r) => r.suksess).length;
  const feil = resultater.filter((r) => !r.suksess).length;

  console.log("\n[beta-import] Sammendrag:");
  console.log(`  Vellykket: ${ok}`);
  console.log(`  Feilet:    ${feil}`);

  if (feil > 0) {
    console.log("\n[beta-import] Feil-detaljer:");
    for (const r of resultater.filter((x) => !x.suksess)) {
      console.log(`  - ${r.name} (${r.email}): ${r.feil}`);
    }
  }
}

main()
  .catch((err) => {
    console.error("[beta-import] Fatal:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
