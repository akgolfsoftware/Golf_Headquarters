"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { audit } from "@/lib/audit";
import { resendKlient, FRA_EPOST } from "@/lib/email";

const SUPPORT_EPOST = "support@akgolf.no";

export async function requestDataExport(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  try {
    const klient = resendKlient();
    // Varsle support
    await klient.emails.send({
      from: FRA_EPOST,
      to: SUPPORT_EPOST,
      subject: `GDPR: Eksport-forespørsel — ${user.email}`,
      html: `<p>Bruker har bedt om dataeksport.</p>
        <ul>
          <li><strong>Navn:</strong> ${user.name ?? "–"}</li>
          <li><strong>E-post:</strong> ${user.email}</li>
          <li><strong>Bruker-ID:</strong> ${user.id}</li>
          <li><strong>Tidspunkt:</strong> ${new Date().toISOString()}</li>
        </ul>
        <p>SLA: håndter innen 30 dager iht. GDPR art. 15.</p>`,
    });
    // Bekrefte til bruker
    if (user.email) {
      await klient.emails.send({
        from: FRA_EPOST,
        to: user.email,
        subject: "Vi har mottatt din forespørsel om dataeksport",
        html: `<p>Hei ${user.name ?? "der"},</p>
          <p>Vi har mottatt din forespørsel om å eksportere alle dine data. Du får tilsendt en zip-fil innen 30 dager.</p>
          <p>Mvh,<br/>AK Golf Group</p>`,
      });
    }
  } catch (err) {
    console.error("[gdpr-eksport] e-post feilet", err);
  }

  await audit({
    actorId: user.id,
    action: "gdpr.data_export_requested",
    target: user.id,
    metadata: { email: user.email },
  });

  redirect("/portal/meg/innstillinger?ok=eksport");
}

export async function requestAccountDeletion(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  try {
    const klient = resendKlient();
    await klient.emails.send({
      from: FRA_EPOST,
      to: SUPPORT_EPOST,
      subject: `GDPR: Sletting-forespørsel — ${user.email}`,
      html: `<p>Bruker har bedt om kontosletting.</p>
        <ul>
          <li><strong>Navn:</strong> ${user.name ?? "–"}</li>
          <li><strong>E-post:</strong> ${user.email}</li>
          <li><strong>Bruker-ID:</strong> ${user.id}</li>
          <li><strong>Tidspunkt:</strong> ${new Date().toISOString()}</li>
        </ul>
        <p>SLA: håndter innen 30 dager iht. GDPR art. 17.</p>`,
    });
    if (user.email) {
      await klient.emails.send({
        from: FRA_EPOST,
        to: user.email,
        subject: "Vi har mottatt din forespørsel om kontosletting",
        html: `<p>Hei ${user.name ?? "der"},</p>
          <p>Vi har mottatt din forespørsel om å slette kontoen din. Vi tar kontakt for bekreftelse før permanent sletting.</p>
          <p>Mvh,<br/>AK Golf Group</p>`,
      });
    }
  } catch (err) {
    console.error("[gdpr-sletting] e-post feilet", err);
  }

  await audit({
    actorId: user.id,
    action: "gdpr.account_deletion_requested",
    target: user.id,
    metadata: { email: user.email },
  });

  redirect("/portal/meg/innstillinger?ok=sletting");
}
