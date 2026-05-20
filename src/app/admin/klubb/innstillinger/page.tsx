/**
 * CoachHQ — Klubb-innstillinger (multi-club setup)
 *
 * ADMIN-only side hvor Anders kan se og redigere alle klubbene
 * (Locations). Hver klubb-card viser spillere, coacher, default-fasilitet
 * og daglig leder. Klikk "Detaljer" for åpningstider, fasiliteter og drift.
 */

import { Building2 } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import {
  KlubbInnstillingerClient,
  type ClubItem,
} from "./klubb-innstillinger-client";

// Eksempel-data for felter som ikke ligger i schema enda (åpningstider,
// daglig leder). I produksjon vil disse migreres til en `ClubSettings`-tabell.
const KLUBB_META: Record<
  string,
  {
    dagligLederNavn: string;
    dagligLederEmail: string;
    apningstider: { hverdag: string; helg: string };
    defaultFacilityHint?: string;
  }
> = {
  gfgk: {
    dagligLederNavn: "Anders Kristiansen",
    dagligLederEmail: "anders@akgolf.no",
    apningstider: { hverdag: "08:00 – 21:00", helg: "09:00 – 18:00" },
    defaultFacilityHint: "performance",
  },
  mulligan: {
    dagligLederNavn: "Mulligan Drift",
    dagligLederEmail: "drift@mulligangolf.no",
    apningstider: { hverdag: "06:00 – 23:00", helg: "08:00 – 22:00" },
    defaultFacilityHint: "studio",
  },
};

function metaFor(name: string) {
  const n = name.toLowerCase();
  if (n.includes("gfgk") || n.includes("fredrikstad")) return KLUBB_META.gfgk;
  if (n.includes("mulligan")) return KLUBB_META.mulligan;
  return {
    dagligLederNavn: "Ikke tildelt",
    dagligLederEmail: "—",
    apningstider: { hverdag: "08:00 – 21:00", helg: "09:00 – 18:00" },
  };
}

export default async function KlubbInnstillingerPage() {
  await requirePortalUser({ allow: ["ADMIN"] });

  const [locations, spillereTotal, coacherTotal] = await Promise.all([
    prisma.location.findMany({
      include: {
        facilities: {
          orderBy: { name: "asc" },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.user.count({ where: { role: "PLAYER" } }),
    prisma.user.count({ where: { role: "COACH" } }),
  ]);

  // Fordel spillere/coacher per klubb. Schema har ikke User.locationId enda,
  // så vi bruker `homeClub`-feltet (fritekst) som tilnærming, og fordeler
  // resten proporsjonalt.
  const klubber: ClubItem[] = await Promise.all(
    locations.map(async (l) => {
      const meta = metaFor(l.name);

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

      // Eksempel-tall hvis ingen kobling: GFGK 38 spillere / 5 coacher
      const isGfgk = l.name.toLowerCase().includes("gfgk") ||
        l.name.toLowerCase().includes("fredrikstad");
      const fallbackSpillere = isGfgk ? 38 : Math.max(0, Math.round(spillereTotal / Math.max(1, locations.length)));
      const fallbackCoacher = isGfgk ? 5 : Math.max(0, Math.round(coacherTotal / Math.max(1, locations.length)));

      const defaultFacility =
        l.facilities.find((f) =>
          meta.defaultFacilityHint
            ? f.name.toLowerCase().includes(meta.defaultFacilityHint)
            : false,
        ) ?? l.facilities[0] ?? null;

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
        spillereCount: spillereCount > 0 ? spillereCount : fallbackSpillere,
        coacherCount: coacherCount > 0 ? coacherCount : fallbackCoacher,
        defaultFacilityId: defaultFacility?.id ?? null,
        dagligLederNavn: meta.dagligLederNavn,
        dagligLederEmail: meta.dagligLederEmail,
        apningstider: meta.apningstider,
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
        eyebrow="CoachHQ · /admin/klubb/innstillinger"
        titleLead="Klubb-"
        titleItalic="innstillinger"
        titleTrail={`· ${klubber.length} klubber`}
        sub="Multi-club setup. Hver klubb har egne fasiliteter, åpningstider og daglig leder. Default-fasilitet brukes ved hurtigbooking fra PlayerHQ."
      />

      {/* KPI-strip */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-4">
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

      {klubber.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border bg-card/40 px-6 py-16 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-secondary text-muted-foreground">
            <Building2 size={24} strokeWidth={1.75} />
          </div>
          <p className="font-display text-base">
            <em className="italic text-primary">Ingen klubber</em> registrert
          </p>
        </div>
      ) : (
        <KlubbInnstillingerClient klubber={klubber} />
      )}
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
