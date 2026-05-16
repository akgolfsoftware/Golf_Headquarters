/**
 * CoachHQ — Tjenester (bookbar katalog)
 * Design migrert fra wireframe/design-files-v2/final/06-tjenester.html.
 *
 * Tabell med navn+beskrivelse, varighet, pris, kategori-pill, "bookinger"-
 * sparkline-placeholder, on/off-toggle. KPI-strip øverst. Filter-rad
 * (kategori, status, sortering, søk) håndtert i client-komponent.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { ServiceForm } from "./service-form";
import {
  ServicesListe,
  type ServiceListItem,
} from "@/components/admin/services-liste";

type Category = "coach" | "studio" | "green" | "group" | "event";

// Deriverer kategori fra navn — i v1 har vi ikke kategori-felt i schema.
function deriveCategory(name: string): Category {
  const n = name.toLowerCase();
  if (n.includes("studio") || n.includes("trackman") || n.includes("range")) {
    return "studio";
  }
  if (n.includes("green") || n.includes("18 hull") || n.includes("9 hull")) {
    return "green";
  }
  if (n.includes("grupp") || n.includes("wang") || n.includes("dame")) {
    return "group";
  }
  if (n.includes("camp") || n.includes("event") || n.includes("turnering")) {
    return "event";
  }
  return "coach";
}

export default async function ServicesAdmin() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const services = await prisma.serviceType.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }],
    include: {
      _count: { select: { bookings: true } },
    },
  });

  const aktive = services.filter((s) => s.active).length;
  const totalCount = services.length;

  // KPI-tall
  const snittPris =
    services.length > 0
      ? Math.round(
          services.reduce((acc, s) => acc + s.priceOre, 0) / services.length / 100,
        )
      : 0;
  const mestBooket = [...services].sort(
    (a, b) => b._count.bookings - a._count.bookings,
  )[0];

  // Distinct kategorier
  const kategorier = new Set(services.map((s) => deriveCategory(s.name))).size;

  const items: ServiceListItem[] = services.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    priceOre: s.priceOre,
    durationMin: s.durationMin,
    active: s.active,
    _count: { bookings: s._count.bookings },
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CoachHQ · /admin/services"
        titleLead={String(totalCount)}
        titleItalic="tjenester"
        titleTrail={`· ${kategorier} kategori${kategorier === 1 ? "" : "er"}`}
        sub="Endringer her oppdaterer booking.akgolf.no umiddelbart."
        actions={<ServiceForm triggerLabel="+ Ny tjeneste" />}
      />

      {/* KPI-strip */}
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <KpiAccent
          label="Aktive tjenester"
          value={String(aktive)}
          unit={`/ ${totalCount}`}
          sub={
            aktive === totalCount
              ? "Alle synlige i booking"
              : `${totalCount - aktive} skjult`
          }
        />
        <Kpi
          label="Snitt-pris"
          value={snittPris > 0 ? snittPris.toLocaleString("nb-NO") : "—"}
          unit="kr"
          sub={services.length > 0 ? `Over ${services.length} tjenester` : "—"}
        />
        <Kpi
          label="Mest bookede"
          value={mestBooket ? mestBooket.name : "—"}
          sub={
            mestBooket
              ? `${mestBooket._count.bookings} bookinger totalt`
              : "Ingen data"
          }
          displayValue
        />
        <Kpi
          label="Kategorier"
          value={String(kategorier)}
          sub={`${aktive} aktive tjenester`}
        />
      </div>

      <ServicesListe services={items} />
    </div>
  );
}

// ----------------- Komponenter -----------------

function KpiAccent({
  label,
  value,
  unit,
  sub,
}: {
  label: string;
  value: string;
  unit?: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-transparent bg-gradient-to-br from-foreground to-foreground/90 p-4 text-white">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-accent/70">
        {label}
      </div>
      <div className="font-mono text-[28px] font-semibold leading-none tabular-nums text-white">
        {value}
        {unit && (
          <span className="ml-1 text-[13px] font-medium text-background/55">
            {unit}
          </span>
        )}
      </div>
      {sub && (
        <div className="font-mono text-[11px] text-background/70">{sub}</div>
      )}
    </div>
  );
}

function Kpi({
  label,
  value,
  unit,
  sub,
  displayValue,
}: {
  label: string;
  value: string;
  unit?: string;
  sub?: string;
  displayValue?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-4">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </div>
      <div
        className={`leading-none text-foreground ${
          displayValue
            ? "font-display text-[16px] font-semibold"
            : "font-mono text-[28px] font-semibold tabular-nums"
        }`}
      >
        {value}
        {unit && !displayValue && (
          <span className="ml-1 text-[13px] font-medium text-muted-foreground">
            {unit}
          </span>
        )}
      </div>
      {sub && (
        <div className="font-mono text-[11px] text-muted-foreground">{sub}</div>
      )}
    </div>
  );
}
