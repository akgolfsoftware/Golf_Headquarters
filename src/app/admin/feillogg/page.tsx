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
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TlTilbake } from "@/components/admin/v2/oppsett/tl-kit";
import {
  AdminFeilloggTrainLock,
  type AdminFeilloggV2Data,
  type AdminFeilloggV2Rad,
  type AdminFeilloggV2Severity,
} from "@/components/admin/v2/oppsett/AdminFeilloggTrainLock";

export const dynamic = "force-dynamic";

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
    <V2Shell bredde="kolonne" aktiv="innstillinger" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <TlTilbake href="/admin/oppsett">Innstillinger</TlTilbake>
      <AdminFeilloggTrainLock data={data} />
    </V2Shell>
  );
}
