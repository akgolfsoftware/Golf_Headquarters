/**
 * AK Golf HQ — Batch-import GFGK-spillere 2026
 *
 * Leser data/notion-spillere-2026-05-25.json og importerer:
 *   1. Supabase auth-record (email_confirm: true — INGEN e-post sendes)
 *   2. Prisma User
 *   3. PlayerEnrollment (program + coachId)
 *
 * Idempotent: hopper over brukere som allerede finnes.
 * Ingen e-post sendes — spillere logger inn via "Glemt passord"-flyt.
 *
 * Bruk:
 *   npx tsx scripts/batch-import-gfgk-2026.ts --dry-run
 *   npx tsx scripts/batch-import-gfgk-2026.ts
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, PlayerProgram } from "../src/generated/prisma/client";

// --- Env ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const databaseUrl = process.env.DATABASE_URL;

if (!supabaseUrl || !supabaseServiceKey || !databaseUrl) {
  console.error("Mangler env-variabler. Sjekk .env.local:");
  if (!supabaseUrl) console.error("  - NEXT_PUBLIC_SUPABASE_URL");
  if (!supabaseServiceKey) console.error("  - SUPABASE_SERVICE_ROLE_KEY");
  if (!databaseUrl) console.error("  - DATABASE_URL");
  process.exit(1);
}

// --- Clients ---
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

// --- Program-mapping fra Notion gruppe-navn ---
const GRUPPE_TIL_PROGRAM: Record<
  string,
  { program: PlayerProgram; coachEmail: string }
> = {
  Utvikling: { program: "GFGK_BREDDE", coachEmail: "markus@akgolf.no" },
  Basis: { program: "GFGK_BREDDE", coachEmail: "markus@akgolf.no" },
  "Junior Mini": { program: "GFGK_MINI", coachEmail: "markus@akgolf.no" },
  "Elite GFGK": { program: "GFGK_ELITE", coachEmail: "anders@akgolf.no" },
};

// --- E-post overrides: bedre epost funnet i AK Golf Academy-kalender ---
const EMAIL_OVERRIDES: Record<string, string> = {
  "Sebastian Henriksen": "sebbern57@gmail.com", // Funnet i AK Academy inntak-kalender
};

// --- Ekstra spillere ikke i GFGK-databasen ---
const EKSTRA: Array<{
  navn: string;
  epost: string;
  fodselsdato: string;
  telefon: string;
  program: PlayerProgram;
  coachEmail: string;
}> = [
  {
    navn: "Monika Undheim",
    epost: "monikaundheim80@gmail.com",
    fodselsdato: "",
    telefon: "",
    program: "AK_ACADEMY",
    coachEmail: "anders@akgolf.no",
  },
];

// --- Typer ---
type NotionSpiller = {
  navn: string;
  epost: string;
  telefon: string;
  adresse: string;
  fodselsdato: string;
  gruppe: string | null;
  foresatt1_navn: string;
  foresatt1_epost: string;
  foresatt1_telefon: string;
  foresatt2_navn: string;
  foresatt2_epost: string;
  foresatt2_telefon: string;
};

type SpillerImport = {
  navn: string;
  epost: string;
  fodselsdato: string;
  telefon: string;
  program: PlayerProgram;
  coachEmail: string;
};

// --- Hjelpefunksjoner ---

function beregnAlder(fodselsdato: string): number | null {
  if (!fodselsdato) return null;
  const fdato = new Date(fodselsdato);
  if (Number.isNaN(fdato.getTime())) return null;
  const naa = new Date();
  let alder = naa.getFullYear() - fdato.getFullYear();
  const m = naa.getMonth() - fdato.getMonth();
  if (m < 0 || (m === 0 && naa.getDate() < fdato.getDate())) alder--;
  return alder;
}

function erForeldreEpost(epost: string, spiller: NotionSpiller): boolean {
  return (
    (!!spiller.foresatt1_epost && epost === spiller.foresatt1_epost) ||
    (!!spiller.foresatt2_epost && epost === spiller.foresatt2_epost)
  );
}

// --- Main ---

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");

  // Les JSON-data
  const jsonPath = resolve("data/notion-spillere-2026-05-25.json");
  const data = JSON.parse(readFileSync(jsonPath, "utf-8")) as {
    kilde: string;
    hentet: string;
    totalt: number;
    spillere: NotionSpiller[];
  };

  console.log("\n=== Batch-import GFGK-spillere 2026 ===");
  console.log(`Kilde: ${data.kilde}`);
  console.log(`Totalt i Notion: ${data.totalt} spillere`);
  if (dryRun) console.log("DRY-RUN aktiv — ingen DB-skriving, ingen e-poster\n");

  // Hent coach-IDer fra DB
  const [andersCoach, markusCoach] = await Promise.all([
    prisma.user.findUnique({ where: { email: "anders@akgolf.no" }, select: { id: true } }),
    prisma.user.findUnique({ where: { email: "markus@akgolf.no" }, select: { id: true } }),
  ]);

  const coachIdByEmail: Record<string, string | undefined> = {
    "anders@akgolf.no": andersCoach?.id,
    "markus@akgolf.no": markusCoach?.id,
  };

  if (!andersCoach) console.warn("[ADVARSEL] anders@akgolf.no ikke funnet i DB — enrollments for Anders mangler coachId");
  if (!markusCoach) console.warn("[ADVARSEL] markus@akgolf.no ikke funnet i DB — enrollments for Markus mangler coachId");

  // Bygg importliste
  const importListe: SpillerImport[] = [];
  const hoppetOver: { navn: string; grunn: string }[] = [];

  for (const s of data.spillere) {
    // Navn er tomt (blank rad i Notion)
    if (!s.navn?.trim()) {
      hoppetOver.push({ navn: "(blank)", grunn: "tomt navn" });
      continue;
    }

    // Override-epost har prioritet over Notion-feltet
    let epost = EMAIL_OVERRIDES[s.navn] ?? s.epost ?? "";
    epost = epost.toLowerCase().trim();

    // Skip hvis epost er foreldrenes epost (lagt i feil felt i Notion)
    if (epost && erForeldreEpost(epost, s)) {
      hoppetOver.push({ navn: s.navn, grunn: `epost ${epost} er foresatt-epost` });
      continue;
    }

    // Skip hvis ingen brukbar epost
    if (!epost) {
      hoppetOver.push({
        navn: s.navn,
        grunn: "ingen epost — legg til manuelt via /admin/spillere/ny",
      });
      continue;
    }

    // Finn program fra gruppe
    const gruppeInfo = s.gruppe ? GRUPPE_TIL_PROGRAM[s.gruppe] : null;
    if (!gruppeInfo) {
      hoppetOver.push({
        navn: s.navn,
        grunn: s.gruppe
          ? `ukjent gruppe "${s.gruppe}"`
          : "ingen gruppe — legg til manuelt",
      });
      continue;
    }

    importListe.push({
      navn: s.navn,
      epost,
      fodselsdato: s.fodselsdato ?? "",
      telefon: s.telefon ?? "",
      program: gruppeInfo.program,
      coachEmail: gruppeInfo.coachEmail,
    });
  }

  // Legg til ekstra spillere
  for (const s of EKSTRA) {
    importListe.push({
      navn: s.navn,
      epost: s.epost.toLowerCase().trim(),
      fodselsdato: s.fodselsdato,
      telefon: s.telefon,
      program: s.program,
      coachEmail: s.coachEmail,
    });
  }

  // Oppsummer hva som skal importeres
  console.log(`\nSpillere som importeres: ${importListe.length}`);
  for (const [gruppe, info] of Object.entries(GRUPPE_TIL_PROGRAM)) {
    const antall = importListe.filter((s) => s.program === info.program).length;
    if (antall > 0) console.log(`  ${gruppe} (${info.program}): ${antall}`);
  }
  const ekstraAntall = EKSTRA.length;
  if (ekstraAntall > 0) console.log(`  Ekstra (AK_ACADEMY m.fl.): ${ekstraAntall}`);

  console.log(`\nHoppes over: ${hoppetOver.length}`);
  for (const h of hoppetOver) {
    console.log(`  - ${h.navn}: ${h.grunn}`);
  }
  console.log("");

  // Import-loop
  let opprettet = 0;
  let alleredeFinnes = 0;
  let feilet = 0;

  for (const s of importListe) {
    const coachId = coachIdByEmail[s.coachEmail];

    // Sjekk om brukeren allerede finnes i Prisma
    const existing = await prisma.user.findUnique({ where: { email: s.epost } });

    if (existing) {
      console.log(`[FINNES ] ${s.navn} <${s.epost}>`);
      alleredeFinnes++;

      if (!dryRun) {
        // Sjekk om enrollment allerede finnes
        const existingEnrollment = await prisma.playerEnrollment.findFirst({
          where: { userId: existing.id, program: s.program, endedAt: null },
        });
        if (!existingEnrollment) {
          await prisma.playerEnrollment.create({
            data: { userId: existing.id, program: s.program, coachId: coachId ?? null },
          });
          console.log(`         + PlayerEnrollment ${s.program} lagt til`);
        }
      }
      continue;
    }

    if (dryRun) {
      console.log(`[DRY-RUN] ${s.navn} <${s.epost}> → ${s.program}`);
      opprettet++;
      continue;
    }

    try {
      // 1. Supabase auth — email_confirm: true sender INGEN bekreftelse-epost
      const { data: authData, error: authError } =
        await supabaseAdmin.auth.admin.createUser({
          email: s.epost,
          email_confirm: true,
          user_metadata: { name: s.navn, kilde: "GFGK-Notion-import-2026" },
        });

      if (authError ?? !authData.user) {
        throw new Error(authError?.message ?? "Supabase auth.admin.createUser feilet");
      }

      const authId = authData.user.id;

      // 2. Prisma User
      const alder = beregnAlder(s.fodselsdato);
      const dbUser = await prisma.user.create({
        data: {
          authId,
          email: s.epost,
          name: s.navn,
          phone: s.telefon || null,
          dateOfBirth: s.fodselsdato ? new Date(s.fodselsdato) : null,
          requiresGuardianConsent: alder !== null && alder < 16,
          role: "PLAYER",
          tier: "GRATIS", // Coach oppgraderer manuelt ved behov
          preferences: {
            beta: false,
            onboardingCompleted: false,
            notifications: { email: false, push: false, sms: false },
            language: "nb",
            theme: "light",
            notionImport: { dato: new Date().toISOString(), kilde: "GFGK-2026" },
          },
        },
      });

      // 3. PlayerEnrollment
      await prisma.playerEnrollment.create({
        data: {
          userId: dbUser.id,
          program: s.program,
          coachId: coachId ?? null,
          notes: `Importert fra Notion ${new Date().toLocaleDateString("nb-NO")}`,
        },
      });

      console.log(`[OK     ] ${s.navn} <${s.epost}> → ${s.program}${alder !== null && alder < 16 ? " [samtykke]" : ""}`);
      opprettet++;
    } catch (err) {
      const melding = err instanceof Error ? err.message : String(err);
      console.error(`[FEIL   ] ${s.navn} <${s.epost}>: ${melding}`);
      feilet++;
    }
  }

  // Sluttrapport
  console.log("\n=== Resultat ===");
  console.log(`  Opprettet:       ${opprettet}`);
  console.log(`  Allerede finnes: ${alleredeFinnes}`);
  console.log(`  Feilet:          ${feilet}`);
  console.log(`  Hoppet over:     ${hoppetOver.length}`);
  console.log("\n  Ingen e-post ble sendt.");
  console.log("  Spillere logger inn via /auth/login → 'Glemt passord'.");

  if (dryRun) {
    console.log("\nDRY-RUN ferdig. Kjør uten --dry-run for ekte import.");
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
