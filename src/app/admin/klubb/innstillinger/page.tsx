/**
 * AgencyOS — Klubb-innstillinger (`/admin/klubb/innstillinger`), v2.
 * Port av `(legacy)/klubb/innstillinger/page.tsx` (2026-07-14, AgencyOS
 * Bølge 3.14) — samme Prisma-uttrekk (Location/ClubSettings), ny
 * v2-presentasjon i `AdminKlubbInnstillingerV2`.
 * `(legacy)/klubb/innstillinger/actions.ts` bor fortsatt der — delt server
 * actions, uendret.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminKlubbInnstillingerV2, type ClubItemV2, type ClubSettingsV2Data } from "@/components/admin/v2/AdminKlubbInnstillingerV2";

export const dynamic = "force-dynamic";

const TOM = "—";

type Apningstider = { hverdag: string; helg: string };

function parseApningstider(raw: unknown): Apningstider | null {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const o = raw as Record<string, unknown>;
    const hverdag = typeof o.hverdag === "string" ? o.hverdag : "";
    const helg = typeof o.helg === "string" ? o.helg : "";
    if (hverdag || helg) return { hverdag, helg };
  }
  return null;
}

export default async function KlubbInnstillingerPage() {
  const user = await requirePortalUser({ allow: ["ADMIN"] });

  const [locations, settingsRow] = await Promise.all([
    prisma.location.findMany({
      include: { facilities: { orderBy: { name: "asc" } } },
      orderBy: { name: "asc" },
    }),
    prisma.clubSettings.findFirst(),
  ]);

  const apningstider = parseApningstider(settingsRow?.apningstider);
  const settings: ClubSettingsV2Data = {
    clubName: settingsRow?.clubName ?? "",
    dagligLeder: settingsRow?.dagligLeder ?? "",
    orgNr: settingsRow?.orgNr ?? "",
    epost: settingsRow?.epost ?? "",
    telefon: settingsRow?.telefon ?? "",
    adresse: settingsRow?.adresse ?? "",
    apningstider: apningstider ?? { hverdag: "", helg: "" },
  };

  const klubber: ClubItemV2[] = await Promise.all(
    locations.map(async (l) => {
      const [spillereCount, coacherCount] = await Promise.all([
        prisma.user.count({ where: { role: "PLAYER", homeClub: { contains: l.name.split(" ")[0], mode: "insensitive" } } }),
        prisma.user.count({ where: { role: "COACH", homeClub: { contains: l.name.split(" ")[0], mode: "insensitive" } } }),
      ]);
      const defaultFacility = l.facilities[0] ?? null;
      return {
        id: l.id,
        name: l.name,
        address: l.address,
        active: l.active,
        facilities: l.facilities.map((f) => ({ id: f.id, name: f.name, capacity: f.capacity, active: f.active })),
        spillereCount,
        coacherCount,
        defaultFacilityId: defaultFacility?.id ?? null,
        dagligLederNavn: settings.dagligLeder || TOM,
        dagligLederEmail: settings.epost || TOM,
        apningstider: {
          hverdag: settings.apningstider.hverdag || TOM,
          helg: settings.apningstider.helg || TOM,
        },
      } satisfies ClubItemV2;
    }),
  );

  return (
    <V2Shell nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <AdminKlubbInnstillingerV2 klubber={klubber} settings={settings} />
    </V2Shell>
  );
}
