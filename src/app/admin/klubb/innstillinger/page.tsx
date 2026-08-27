/**
 * AgencyOS — Klubb og steder — Train-lock (T13, 27.08.2026).
 *
 * KONSOLIDERER to tidligere separate v2-skjermer til ÉN Train-lock-flate
 * (Anders, oppgavebrief 27.08.2026 — "(legacy)/anlegg konsolider mot klubb,
 * ikke to"): org-innstillinger + klubb-liste (denne siden) OG full
 * fasilitet-CRUD med bookinger denne uka (tidligere /admin/anlegg,
 * AdminAnleggV2). /admin/anlegg redirecter nå hit — se
 * src/app/admin/(legacy)/anlegg/page.tsx.
 *
 * Data: samme to spørringer som før (Location+facilities, ClubSettings) PLUSS
 * booking-tellingen per fasilitet denne uka (samme ukeStart/ukeSlutt-uttrekk
 * som den gamle anlegg-ruten) og fasilitet-type-ikon.
 *
 * Mutasjonene gjenbrukes 1:1, uendret:
 *   - addClub/updateClubSettings/removeClub/lagreClubSettings
 *     (../(legacy)/klubb/innstillinger/actions)
 *   - createLocation/updateLocation/setLocationActive/createFacility/
 *     updateFacility/setFacilityActive (../(legacy)/anlegg/location-actions)
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TlTilbake } from "@/components/admin/v2/oppsett/tl-kit";
import {
  AdminKlubbInnstillingerTrainLock,
  type KlubbItem,
  type ClubSettingsData,
} from "@/components/admin/v2/oppsett/AdminKlubbInnstillingerTrainLock";
import type { FacilityType } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

// Tom plassholder når et felt mangler — vis aldri fabrikerte verdier.
const TOM = "—";

const TYPE_IKON: Record<FacilityType, string> = {
  STUDIO: "radar",
  RANGE_1F: "flag",
  RANGE_2F: "flag",
  PUTTING_GREEN: "circle-dot",
  SHORT_GAME: "circle-dot",
  COURSE_9H: "map",
  COURSE_18H: "map",
  SPECIFIC_HOLES: "map",
  GENERAL: "building-2",
};

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

  // Samme ukevindu som den gamle /admin/anlegg-ruten — bookinger denne uka
  // (mandag 00:00 til påfølgende mandag 00:00, lokal servertid).
  const naa = new Date();
  const ukeStart = new Date(naa);
  ukeStart.setHours(0, 0, 0, 0);
  ukeStart.setDate(ukeStart.getDate() - ((ukeStart.getDay() + 6) % 7));
  const ukeSlutt = new Date(ukeStart);
  ukeSlutt.setDate(ukeSlutt.getDate() + 7);

  const [locations, settingsRow] = await Promise.all([
    prisma.location.findMany({
      orderBy: { name: "asc" },
      include: {
        facilities: {
          orderBy: [{ active: "desc" }, { name: "asc" }],
          include: {
            _count: {
              select: {
                bookings: {
                  where: {
                    startAt: { gte: ukeStart, lt: ukeSlutt },
                    status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
                  },
                },
              },
            },
          },
        },
      },
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
  const klubber: KlubbItem[] = await Promise.all(
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
        latitude: l.latitude,
        longitude: l.longitude,
        facilities: l.facilities.map((f) => ({
          id: f.id,
          name: f.name,
          ikonNavn: TYPE_IKON[f.type],
          type: f.type,
          capacity: f.capacity,
          active: f.active,
          bookinger: f._count.bookings,
          description: f.description,
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
      } satisfies KlubbItem;
    }),
  );

  return (
    <V2Shell bredde="kolonne" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <TlTilbake href="/admin/settings">Innstillinger</TlTilbake>
      <AdminKlubbInnstillingerTrainLock klubber={klubber} settings={settings} />
    </V2Shell>
  );
}
