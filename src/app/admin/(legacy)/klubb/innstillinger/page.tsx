/**
 * AgencyOS — Klubb-innstillinger (multi-club setup)
 *
 * ADMIN-only side hvor Anders kan se og redigere alle klubbene
 * (Locations). Hver klubb-card viser spillere, coacher, default-fasilitet
 * og daglig leder. Klikk "Detaljer" for åpningstider, fasiliteter og drift.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AdminHero as PageHeader } from "@/components/admin/admin-hero";
import {
  KlubbInnstillingerClient,
  type ClubItem,
  type ClubSettingsData,
} from "./klubb-innstillinger-client";

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

export default async function KlubbInnstillingerPage() {
  await requirePortalUser({ allow: ["ADMIN"] });

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
  // enda, så vi bruker `homeClub`-feltet (fritekst) som kobling.
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

  const aktive = klubber.filter((k) => k.active).length;
  const totalFasiliteter = klubber.reduce(
    (sum, k) => sum + k.facilities.length,
    0,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="AgencyOS · /admin/klubb/innstillinger"
        titleLead="Klubb-"
        titleItalic="innstillinger"
        titleTrail={`· ${klubber.length} klubber`}
        sub="Multi-club setup. Hver klubb har egne fasiliteter, åpningstider og daglig leder. Default-fasilitet brukes ved hurtigbooking fra PlayerHQ."
      />

      {/* KPI-strip */}
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <Kpi label="Klubber totalt" value={String(klubber.length)} sub={`${aktive} aktive`} />
        <Kpi label="Fasiliteter" value={String(totalFasiliteter)} sub="Bookbare rom" />
        <Kpi
          label="Spillere"
          value={String(klubber.reduce((s, k) => s + k.spillereCount, 0))}
          sub="Fordelt på klubber"
        />
        <Kpi
          label="Coacher"
          value={String(klubber.reduce((s, k) => s + k.coacherCount, 0))}
          sub="Aktive i klubbene"
        />
      </div>

      <KlubbInnstillingerClient klubber={klubber} settings={settings} />

    </div>
  );
}

function Kpi({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-4">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </div>
      <div className="font-mono text-[28px] font-semibold leading-none tabular-nums text-foreground">
        {value}
      </div>
      {sub && (
        <div className="font-mono text-[11px] text-muted-foreground">{sub}</div>
      )}
    </div>
  );
}
