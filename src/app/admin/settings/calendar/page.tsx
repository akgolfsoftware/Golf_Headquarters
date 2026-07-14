/**
 * AgencyOS — Innstillinger · Google Calendar (`/admin/settings/calendar`),
 * v2. Port av `(legacy)/settings/calendar/page.tsx` (2026-07-14, AgencyOS
 * Bølge 3.36) — `CalendarSyncSectionV2` (delt med `/admin/availability`).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { Caps, Tittel, T } from "@/components/v2";
import { CalendarSyncSectionV2 } from "@/components/admin/v2/AdminInnstillingerKalenderV2";

type SearchParams = Promise<{ ok?: string; error?: string }>;

export default async function CalendarSettings({ searchParams }: { searchParams: SearchParams }) {
  const { ok, error } = await searchParams;
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  return (
    <V2Shell nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        <div>
          <Caps size={9}>Innstillinger · Google Calendar</Caps>
          <Tittel em="2-way sync">Google Calendar</Tittel>
          <p style={{ marginTop: 6, fontFamily: T.ui, fontSize: 12.5, color: T.mut, maxWidth: 480 }}>
            Koble din Google-konto og velg hvilke kalendere som skal pushe bookinger og blokkere tider. Endringer i Google Calendar reflekteres tilbake hit.
          </p>
        </div>
        <CalendarSyncSectionV2 userId={user.id} ok={ok} error={error} />
      </div>
    </V2Shell>
  );
}
