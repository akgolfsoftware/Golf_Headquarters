/**
 * AgencyOS — Klubb-innstillinger (v2, multi-club setup).
 *
 * ADMIN-only rekomponering av /admin/(legacy)/klubb/innstillinger i
 * v2-språket (V2Shell/komponentbiblioteket), drevet av EKTE Prisma-data.
 * Singleton ClubSettings (org-info) + Location-liste (klubber/anlegg) med
 * fasiliteter og spillere/coacher matchet via homeClub-fritekst (samme
 * fuzzy-logikk som legacy-siden — kopiert verbatim, ikke reimplementert).
 *
 * Mutasjonene (addClub/updateClubSettings/removeClub/lagreClubSettings)
 * gjenbrukes 1:1 fra ../(legacy)/klubb/innstillinger/actions — ingen
 * duplisering av server-actions.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import {
  AdminKlubbInnstillingerV2,
  type ClubItem,
  type ClubSettingsData,
} from "@/components/admin/v2/AdminKlubbInnstillingerV2";

export const dynamic = "force-dynamic";

// Tom plassholder når et felt mangler — vis aldri fabrikerte verdier.
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

export default async function V2KlubbInnstillingerPage() {
  const user = await requirePortalUser({ allow: ["ADMIN"] });

  const [locations, settingsRow] = await Promise.all([
    prisma.location.findMany({
      include: {
        facilities: {
          orderBy: { name: "asc" },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.clubSettings.findFirst(),
  ]);

  // Singleton org-innstillinger (ClubSettings). Mangler rad → tomme felter.
  const apningstider = parseApningstider(settingsRow?.apningstider);
  const settings: ClubSettingsData = {
    clubName: settingsRow?.clubName ?? "",
    dagligLeder: settingsRow?.dagligLeder ?? "",
    orgNr: settingsRow?.orgNr ?? "",
    epost: settingsRow?.epost ?? "",
    telefon: settingsRow?.telefon ?? "",
    adresse: settingsRow?.adresse ?? "",
    apningstider: apningstider ?? { hverdag: "", helg: "" },
  };

  // Spillere/coacher per klubb fra ekte tall. Schema har ikke User.locationId
  // enda, så vi bruker `homeClub`-feltet (fritekst) som kobling — samme
  // fuzzy-matching (første ord i klubbnavnet) som legacy-siden.
  const klubber: ClubItem[] = await Promise.all(
    locations.map(async (l) => {
      const [spillereCount, coacherCount] = await Promise.all([
        prisma.user.count({
          where: {
            role: "PLAYER",
            homeClub: { contains: l.name.split(" ")[0], mode: "insensitive" },
          },
        }),
        prisma.user.count({
          where: {
            role: "COACH",
            homeClub: { contains: l.name.split(" ")[0], mode: "insensitive" },
          },
        }),
      ]);

      const defaultFacility = l.facilities[0] ?? null;

      return {
        id: l.id,
        name: l.name,
        address: l.address,
        active: l.active,
        facilities: l.facilities.map((f) => ({
          id: f.id,
          name: f.name,
          capacity: f.capacity,
          active: f.active,
        })),
        spillereCount,
        coacherCount,
        defaultFacilityId: defaultFacility?.id ?? null,
        dagligLederNavn: settings.dagligLeder || TOM,
        dagligLederEmail: settings.epost || TOM,
        apningstider: {
          hverdag: settings.apningstider.hverdag || TOM,
          helg: settings.apningstider.helg || TOM,
        },
      } satisfies ClubItem;
    }),
  );

  return (
    <V2Shell nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <TilbakeLenke href="/admin/settings">Innstillinger</TilbakeLenke>
      <AdminKlubbInnstillingerV2 klubber={klubber} settings={settings} />
    </V2Shell>
  );
}
