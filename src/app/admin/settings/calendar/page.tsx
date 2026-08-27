/**
 * AgencyOS · Innstillinger · Kalender-synk — v2-port av
 * src/app/admin/(legacy)/settings/calendar/{page,calendar-sync-section}.tsx.
 *
 * Google Calendar-tilkobling er PER COACH (ikke admin-only) — hver coach
 * kobler sin egen konto, derfor ADMIN/COACH i allow-lista, samme som
 * legacy-siden. Henter connection + subscriptions for innlogget bruker og
 * rendrer v2-komponenten. Legacy UI-filene (calendar-sync-section,
 * disconnect-button, subscriptions-form) er slettet — actions.ts beholdes
 * og importeres direkte inn i v2-komponenten (samme mønster som
 * team/live/uka-porteringene).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TlTilbake } from "@/components/admin/v2/oppsett/tl-kit";
import {
  AdminKalenderSynkTrainLock,
  type AdminKalenderSynkV2Data,
  type KalenderRad,
} from "@/components/admin/v2/oppsett/AdminKalenderSynkTrainLock";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ ok?: string; error?: string }>;

export default async function KalenderSynkPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { ok, error } = await searchParams;
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  const conn = await prisma.googleCalendarConnection.findUnique({
    where: { userId: user.id },
    include: {
      subscriptions: {
        orderBy: [{ syncPush: "desc" }, { calendarName: "asc" }],
      },
    },
  });

  const rader: KalenderRad[] =
    conn?.subscriptions.map((s) => ({
      id: s.id,
      googleCalendarId: s.googleCalendarId,
      calendarName: s.calendarName,
      color: s.color,
      syncPush: s.syncPush,
      syncPull: s.syncPull,
      visIKalender: s.visIKalender,
      active: s.active,
      lastError: s.lastError,
    })) ?? [];

  const data: AdminKalenderSynkV2Data = {
    okParam: ok === "1",
    errorParam: error ?? null,
    connection: conn
      ? {
          googleEmail: conn.googleEmail,
          status: conn.status,
          lastSyncAt: conn.lastSyncAt
            ? conn.lastSyncAt.toLocaleString("nb-NO", {
                dateStyle: "medium",
                timeStyle: "short",
              })
            : null,
          lastError: conn.lastError,
        }
      : null,
    subscriptions: rader,
  };

  return (
    <V2Shell bredde="kolonne" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <TlTilbake href="/admin/settings">Innstillinger</TlTilbake>
      <AdminKalenderSynkTrainLock data={data} />
    </V2Shell>
  );
}
