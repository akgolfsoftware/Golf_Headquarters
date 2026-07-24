/**
 * Send aktiverings-e-post til PLAYER-brukere som aldri har logget inn.
 *
 * Bruker Supabase Admin `generateLink({ type: "recovery" })` → lenke til
 * /auth/reset-password, pluss klartekst-CTA til /auth/login. Ingen temp-passord
 * i e-posten (tryggere enn import-beta-users-mønsteret).
 *
 * Kjør FØRST når Resend DKIM er grønn (se docs/LANSERING-P0-ANDERS.md).
 *
 *   npx tsx scripts/send-aktiverings-epost.ts --dry-run
 *   npx tsx scripts/send-aktiverings-epost.ts
 *   npx tsx scripts/send-aktiverings-epost.ts --limit=5
 */

import "./_env";

import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { emailLayout, primaryButton } from "@/lib/email/templates/shared";

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "https://akgolf-hq.vercel.app").replace(
  /\/$/,
  "",
);
const FRA = process.env.RESEND_FROM_EMAIL ?? "AK Golf <send@akgolf.no>";

function parseArgs(argv: string[]) {
  const dryRun = argv.includes("--dry-run");
  const limitArg = argv.find((a) => a.startsWith("--limit="));
  const limit = limitArg ? Number(limitArg.split("=")[1]) : undefined;
  return { dryRun, limit: Number.isFinite(limit) ? limit : undefined };
}

function aktiveringsHtml(navn: string, loginUrl: string, resetUrl: string): string {
  const fornavn = navn.trim().split(/\s+/)[0] || "der";
  const body = `
    <p style="margin:0 0 16px 0;">Kontoen din i AK Golf HQ er klar. Logg inn for å se planen din, starte økter og følge utviklingen.</p>
    <p style="margin:0 0 8px 0;">Har du ikke satt passord ennå — eller husker du det ikke?</p>
    <p style="margin:0 0 24px 0;">${primaryButton("Sett passord og kom i gang →", resetUrl)}</p>
    <p style="margin:0 0 8px 0;">Allerede klart passord?</p>
    <p style="margin:0 0 24px 0;">${primaryButton("Logg inn →", loginUrl)}</p>
    <p style="margin:0;font-size:12px;color:#5E5C57;">
      Spørsmål? Svar på denne e-posten — vi hjelper deg gjerne.
    </p>
  `;
  return emailLayout({
    preheader: "Kontoen din i PlayerHQ er klar",
    heading: `Hei ${fornavn} —`,
    body,
  });
}

async function main() {
  const { dryRun, limit } = parseArgs(process.argv.slice(2));
  const resendKey = process.env.RESEND_API_KEY;
  if (!dryRun && !resendKey) {
    throw new Error("RESEND_API_KEY mangler (bruk --dry-run for å liste uten å sende)");
  }
  const resend = resendKey ? new Resend(resendKey) : null;
  const admin = supabaseAdmin();

  const kandidater = await prisma.user.findMany({
    where: {
      role: "PLAYER",
      deletedAt: null,
      lastLoginAt: null,
      email: { not: "" },
    },
    select: { id: true, email: true, name: true },
    orderBy: { createdAt: "asc" },
    ...(limit != null ? { take: limit } : {}),
  });

  console.log(
    `Fant ${kandidater.length} spiller(e) uten lastLoginAt${dryRun ? " (dry-run)" : ""}.`,
  );

  let ok = 0;
  let feil = 0;

  for (const u of kandidater) {
    const email = u.email.trim().toLowerCase();
    const loginUrl = `${APP_URL}/auth/login?email=${encodeURIComponent(email)}`;
    const redirectTo = `${APP_URL}/auth/reset-password`;

    try {
      const { data, error } = await admin.auth.admin.generateLink({
        type: "recovery",
        email,
        options: { redirectTo },
      });
      if (error || !data?.properties?.action_link) {
        throw new Error(error?.message ?? "generateLink returnerte ingen action_link");
      }
      const resetUrl = data.properties.action_link;

      if (dryRun) {
        console.log(`[dry-run] ${email} → recovery-link generert`);
        ok += 1;
        continue;
      }

      if (!resend) throw new Error("Resend ikke initialisert");
      await resend.emails.send({
        from: FRA,
        to: email,
        subject: "Velkommen til PlayerHQ — aktiver kontoen din",
        html: aktiveringsHtml(u.name ?? email, loginUrl, resetUrl),
      });
      console.log(`Sendt: ${email}`);
      ok += 1;
    } catch (e) {
      feil += 1;
      console.error(`Feil for ${email}:`, e instanceof Error ? e.message : e);
    }
  }

  console.log(`Ferdig. ok=${ok} feil=${feil}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect().catch(() => undefined);
  });
