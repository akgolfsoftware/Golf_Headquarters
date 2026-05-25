/**
 * AK Golf HQ — Bulk-import fra Notion-database "Spillere".
 *
 * Henter spillere fra data/notion-spillere-*.json og oppretter:
 *   1. Supabase auth-record (auto-bekreftet, midlertidig passord)
 *   2. Prisma User-rad (med phone, dateOfBirth, requiresGuardianConsent)
 *   3. Subscription (PRO, 4 credits/mnd, 90 dagers beta-periode)
 *   4. GroupMember-rad (kobling til riktig Prisma-gruppe)
 *   5. ParentInvitation × N (én per foreldre med e-post)
 *   6. Velkomst-e-post via Resend (til spiller hvis voksen, ellers til foreldre)
 *
 * GDPR: spillere < 16 år får requiresGuardianConsent=true.
 *
 * Bruk:
 *   npx tsx scripts/import-from-notion.ts data/notion-spillere-2026-05-25.json --dry-run
 *   npx tsx scripts/import-from-notion.ts data/notion-spillere-2026-05-25.json
 *
 * Idempotent: hopper over brukere som allerede finnes i Prisma.
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
  if (!supabaseServiceKey) console.error("  - SUPABASE_SERVICE_ROLE_KEY");
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

// Mapping: Notion-gruppe-navn → Prisma Group.name
const GRUPPE_MAPPING: Record<string, string> = {
  Utvikling: "GFGK Junior Utvikling U15",
  "Junior Mini": "GFGK Junior Mini U10",
  "Elite GFGK": "GFGK Junior Elite U19",
  Basis: "GFGK Junior Basis U13",
};

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

type NotionData = {
  kilde: string;
  hentet: string;
  totalt: number;
  gruppe_mapping: Record<string, string>;
  spillere: NotionSpiller[];
};

type ImportResult = {
  spiller: string;
  status: "OK" | "DRY_RUN" | "FEIL" | "ALLEREDE_FINNES" | "MANGLER_EPOST";
  brukerEpost?: string;
  mottakerEpost?: string;  // hvem fikk velkomst (spiller eller foreldre)
  rolle: "PLAYER" | "PARENT";
  alder?: number;
  trengerSamtykke: boolean;
  foreldreInvitert: number;
  gruppeTildelt?: string;
  feil?: string;
};

// --- Hjelpefunksjoner ---

function genererTempPassord(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: 12 }, () =>
    chars[Math.floor(Math.random() * chars.length)],
  ).join("");
}

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

function velgInnloggings(spiller: NotionSpiller): { email: string; rolle: "PLAYER" | "PARENT"; mottakerNavn: string } | null {
  // Hvis spilleren har egen e-post: bruk den
  if (spiller.epost) {
    return { email: spiller.epost, rolle: "PLAYER", mottakerNavn: spiller.navn };
  }
  // Ellers: bruk foreldre-1 e-post (foreldre logger inn på vegne av barnet)
  if (spiller.foresatt1_epost) {
    return {
      email: spiller.foresatt1_epost,
      rolle: "PARENT",
      mottakerNavn: spiller.foresatt1_navn || "foresatte",
    };
  }
  // Eller foreldre-2 hvis den finnes
  if (spiller.foresatt2_epost) {
    return {
      email: spiller.foresatt2_epost,
      rolle: "PARENT",
      mottakerNavn: spiller.foresatt2_navn || "foresatte",
    };
  }
  return null;
}

function velkomstHtml(opts: {
  spillerNavn: string;
  mottakerNavn: string;
  tempPassord: string;
  email: string;
  rolle: "PLAYER" | "PARENT";
}): string {
  const fornavn = opts.mottakerNavn.split(" ")[0] || "der";
  const loginLink = `https://akgolf.no/auth/login?email=${encodeURIComponent(opts.email)}`;
  const innledning =
    opts.rolle === "PARENT"
      ? `Du er invitert til å beta-teste AK Golf HQ på vegne av <strong>${opts.spillerNavn}</strong>. Du logger inn med din e-post, og kan se barnets treningsdata og kommunisere med coach.`
      : `Du er invitert til å beta-teste AK Golf HQ. Tusen takk for at du blir med — feedback fra deg er gull verdt.`;

  return `<!doctype html>
<html lang="nb">
<head><meta charset="UTF-8"></head>
<body style="font-family: system-ui, sans-serif; max-width: 600px; margin: 32px auto; color: #0A1F17;">
  <h1 style="font-size: 28px; font-weight: 600; color: #005840; margin: 0 0 16px;">Hei ${fornavn},</h1>
  <p>${innledning}</p>

  <p style="margin-top: 24px;"><strong>Innloggingsdetaljer:</strong></p>
  <ul style="line-height: 1.8;">
    <li>E-post: <code>${opts.email}</code></li>
    <li>Midlertidig passord: <code style="background:#F1EEE5;padding:2px 8px;border-radius:4px;">${opts.tempPassord}</code></li>
  </ul>
  <p>Bytt passord etter første innlogging i Innstillinger &gt; Sikkerhet.</p>

  <p style="margin-top: 32px;">
    <a href="${loginLink}"
       style="display:inline-block;background:#005840;color:#D1F843;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
      Logg inn nå →
    </a>
  </p>

  <p style="margin-top: 32px; color: #5E5C57; font-size: 14px;">
    Spørsmål? Svar på denne e-posten — vi er her for å hjelpe.
  </p>
</body>
</html>`;
}

// --- Main ---

async function importerSpiller(
  spiller: NotionSpiller,
  gruppeMap: Map<string, string>,
  dryRun: boolean,
): Promise<ImportResult> {
  const alder = beregnAlder(spiller.fodselsdato);
  const trengerSamtykke = alder !== null && alder < 16;

  const innlogging = velgInnloggings(spiller);
  if (!innlogging) {
    return {
      spiller: spiller.navn,
      status: "MANGLER_EPOST",
      rolle: "PLAYER",
      alder: alder ?? undefined,
      trengerSamtykke,
      foreldreInvitert: 0,
    };
  }

  // Foreldre med e-post (utenom den vi bruker som login)
  const foreldreEposter = [
    spiller.foresatt1_epost && spiller.foresatt1_epost !== innlogging.email
      ? { email: spiller.foresatt1_epost, navn: spiller.foresatt1_navn || "Foresatte 1" }
      : null,
    spiller.foresatt2_epost && spiller.foresatt2_epost !== innlogging.email
      ? { email: spiller.foresatt2_epost, navn: spiller.foresatt2_navn || "Foresatte 2" }
      : null,
  ].filter((f): f is { email: string; navn: string } => f !== null);

  const gruppeId =
    spiller.gruppe && gruppeMap.has(spiller.gruppe)
      ? gruppeMap.get(spiller.gruppe)
      : undefined;

  if (dryRun) {
    return {
      spiller: spiller.navn,
      status: "DRY_RUN",
      brukerEpost: innlogging.email,
      mottakerEpost: innlogging.email,
      rolle: innlogging.rolle,
      alder: alder ?? undefined,
      trengerSamtykke,
      foreldreInvitert: foreldreEposter.length,
      gruppeTildelt: spiller.gruppe ?? undefined,
    };
  }

  try {
    // 1. Sjekk om finnes
    const eksisterende = await prisma.user.findUnique({
      where: { email: innlogging.email },
    });
    if (eksisterende) {
      return {
        spiller: spiller.navn,
        status: "ALLEREDE_FINNES",
        brukerEpost: innlogging.email,
        rolle: innlogging.rolle,
        alder: alder ?? undefined,
        trengerSamtykke,
        foreldreInvitert: 0,
      };
    }

    // 2. Supabase auth
    const tempPassord = genererTempPassord();
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: innlogging.email,
        password: tempPassord,
        email_confirm: true,
        user_metadata: { name: spiller.navn, beta: true, kilde: "notion" },
      });
    if (authError || !authData.user) {
      throw new Error(authError?.message ?? "Auth-feil");
    }

    // 3. Prisma User
    const user = await prisma.user.create({
      data: {
        authId: authData.user.id,
        email: innlogging.email,
        name: spiller.navn,
        phone: spiller.telefon || null,
        dateOfBirth: spiller.fodselsdato ? new Date(spiller.fodselsdato) : null,
        requiresGuardianConsent: trengerSamtykke,
        role: "PLAYER",
        tier: "PRO",
        homeClub: "GFGK",
        preferences: {
          beta: true,
          onboardingCompleted: false,
          notifications: { email: true, push: true, sms: false },
          language: "nb",
          theme: "light",
          adresse: spiller.adresse || null,
          notionImport: { dato: new Date().toISOString() },
        },
      },
    });

    // 4. Subscription
    await prisma.subscription.create({
      data: {
        userId: user.id,
        tier: "PRO",
        status: "ACTIVE",
        monthlyCredits: 4,
        creditsRemaining: 4,
        currentPeriodEnd: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    });

    // 5. GroupMember (hvis gruppe finnes)
    if (gruppeId) {
      await prisma.groupMember
        .create({
          data: {
            userId: user.id,
            groupId: gruppeId,
            role: "MEMBER",
          },
        })
        .catch(() => undefined);
    }

    // 6. ParentInvitation per foreldre med e-post
    for (const foreldre of foreldreEposter) {
      await prisma.parentInvitation
        .create({
          data: {
            playerId: user.id,
            email: foreldre.email,
            relation: "GUARDIAN",
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        })
        .catch(() => undefined);
    }

    // 7. Velkomst-e-post
    await resend.emails.send({
      from: FRA_EPOST,
      to: innlogging.email,
      subject: "Velkommen til AK Golf HQ — beta-test",
      html: velkomstHtml({
        spillerNavn: spiller.navn,
        mottakerNavn: innlogging.mottakerNavn,
        tempPassord,
        email: innlogging.email,
        rolle: innlogging.rolle,
      }),
    });

    return {
      spiller: spiller.navn,
      status: "OK",
      brukerEpost: innlogging.email,
      mottakerEpost: innlogging.email,
      rolle: innlogging.rolle,
      alder: alder ?? undefined,
      trengerSamtykke,
      foreldreInvitert: foreldreEposter.length,
      gruppeTildelt: spiller.gruppe ?? undefined,
    };
  } catch (err) {
    return {
      spiller: spiller.navn,
      status: "FEIL",
      brukerEpost: innlogging.email,
      rolle: innlogging.rolle,
      alder: alder ?? undefined,
      trengerSamtykke,
      foreldreInvitert: 0,
      feil: err instanceof Error ? err.message : String(err),
    };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const jsonFil = args[0];
  const dryRun = args.includes("--dry-run");

  if (!jsonFil) {
    console.error("Bruk: tsx scripts/import-from-notion.ts <json-fil> [--dry-run]");
    process.exit(1);
  }

  const data: NotionData = JSON.parse(readFileSync(resolve(jsonFil), "utf-8"));

  console.log(`\nNotion-import: ${data.totalt} spillere fra ${data.hentet}`);
  if (dryRun) console.log("DRY-RUN: ingen DB-skriving, ingen e-poster sendes\n");

  // Hent Prisma-grupper og bygg mapping (Notion-navn → Prisma-id)
  const grupper = await prisma.group.findMany({
    select: { id: true, name: true },
  });
  const gruppeMap = new Map<string, string>();
  for (const [notionNavn, prismaNavn] of Object.entries(GRUPPE_MAPPING)) {
    const prismaGruppe = grupper.find((g) => g.name === prismaNavn);
    if (prismaGruppe) gruppeMap.set(notionNavn, prismaGruppe.id);
  }

  console.log(`Gruppe-mapping (${gruppeMap.size}/4):`);
  for (const [n, id] of gruppeMap.entries()) {
    console.log(`  ${n} -> ${id}`);
  }
  console.log("");

  const resultater: ImportResult[] = [];
  for (const spiller of data.spillere) {
    const r = await importerSpiller(spiller, gruppeMap, dryRun);
    resultater.push(r);
    const ikon =
      r.status === "OK" || r.status === "DRY_RUN"
        ? "OK"
        : r.status === "FEIL"
          ? "FEIL"
          : r.status === "ALLEREDE_FINNES"
            ? "FINNES"
            : "MANGLER";
    const samtykke = r.trengerSamtykke ? " [<16 år, samtykke]" : "";
    const fp = r.foreldreInvitert > 0 ? ` [${r.foreldreInvitert} foreldre]` : "";
    const gruppe = r.gruppeTildelt ? ` -> ${r.gruppeTildelt}` : " [INGEN GRUPPE]";
    console.log(
      `  [${ikon}] ${r.spiller} (${r.rolle}, ${r.brukerEpost ?? "INGEN E-POST"})${samtykke}${fp}${gruppe}${r.feil ? `\n         FEIL: ${r.feil}` : ""}`,
    );
  }

  // Oppsummering
  const counts = {
    ok: resultater.filter((r) => r.status === "OK" || r.status === "DRY_RUN").length,
    feil: resultater.filter((r) => r.status === "FEIL").length,
    finnes: resultater.filter((r) => r.status === "ALLEREDE_FINNES").length,
    manglerEpost: resultater.filter((r) => r.status === "MANGLER_EPOST").length,
    mindreaarige: resultater.filter((r) => r.trengerSamtykke).length,
    foreldreInvitert: resultater.reduce((s, r) => s + r.foreldreInvitert, 0),
    perRolle: {
      PLAYER: resultater.filter((r) => r.rolle === "PLAYER" && r.brukerEpost).length,
      PARENT: resultater.filter((r) => r.rolle === "PARENT" && r.brukerEpost).length,
    },
  };

  console.log(`\nSammendrag:`);
  console.log(`  Vellykket:           ${counts.ok}/${data.totalt}`);
  console.log(`  Feil:                ${counts.feil}`);
  console.log(`  Allerede finnes:     ${counts.finnes}`);
  console.log(`  Mangler e-post:      ${counts.manglerEpost}`);
  console.log(`  Mindreårige (<16):   ${counts.mindreaarige}`);
  console.log(`  Foreldre-invites:    ${counts.foreldreInvitert}`);
  console.log(`  Bruker = spiller:    ${counts.perRolle.PLAYER}`);
  console.log(`  Bruker = forelder:   ${counts.perRolle.PARENT}`);

  if (dryRun) {
    console.log(`\nDRY-RUN ferdig. Ingen endringer gjort. Kjør uten --dry-run for ekte import.`);
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
