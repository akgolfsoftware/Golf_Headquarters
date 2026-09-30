/**
 * AgencyOS Feillogg (/admin/feillogg) — leser ErrorLog-tabellen som
 * `src/lib/error-tracking.ts` skriver til. Gir første ekte prod-feil et sted
 * å bli sett, med stack trace, uten å grave i Vercel-loggene.
 *
 * Kun ADMIN: feilmeldinger kan inneholde interne detaljer selv om PII er
 * sanitert ved skriving.
 *
 * Server component.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import {
  AG24Feillogg,
  type FeilData as AdminFeilloggV2Data,
  type FeilRad as AdminFeilloggV2Rad,
  type FeilSeverity as AdminFeilloggV2Severity,
} from "@/components/admin/precision/AG24Drift";

export const dynamic = "force-dynamic";
export const metadata = { title: "Feillogg · AgencyOS" };

const NB = new Intl.DateTimeFormat("nb-NO", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Oslo",
});

const GYLDIGE: AdminFeilloggV2Severity[] = ["fatal", "error", "warn", "info"];

function severity(raw: string): AdminFeilloggV2Severity {
  return (GYLDIGE as string[]).includes(raw) ? (raw as AdminFeilloggV2Severity) : "error";
}

export default async function AdminFeilloggPage() {
  const user = await requirePortalUser({ allow: ["ADMIN"] });

  const naa = new Date();
  const dognSiden = new Date(naa.getTime() - 24 * 60 * 60 * 1000);

  const [rader, total, sisteDogn] = await Promise.all([
    prisma.errorLog
      .findMany({ orderBy: { createdAt: "desc" }, take: 50 })
      .catch(() => []),
    prisma.errorLog.count().catch(() => 0),
    prisma.errorLog
      .count({
        where: { createdAt: { gte: dognSiden }, severity: { in: ["fatal", "error"] } },
      })
      .catch(() => 0),
  ]);

  const feil: AdminFeilloggV2Rad[] = rader.map((r) => ({
    id: r.id,
    tid: NB.format(r.createdAt),
    kontekst: r.context,
    melding: r.message,
    stack: r.stack,
    severity: severity(r.severity),
  }));

  const data: AdminFeilloggV2Data = {
    feil,
    total,
    sisteDogn,
    kontekster: new Set(feil.map((f) => f.kontekst)).size,
  };

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <AG24Feillogg data={data} />
    </AgencyOSSkall>
  );
}
