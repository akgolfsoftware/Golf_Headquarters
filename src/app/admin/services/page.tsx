/**
 * AgencyOS — Tjenester / priser (/admin/services)
 *
 * Bookbar katalog: KPI-strip + filtrer-/sorter-bar + tjeneste-liste. Re-stylet
 * til AgencyOS-DNA (mono-eyebrows, lime-aksent-KPI, rounded-xl, DS-tokens). All
 * data er ekte Prisma (serviceType + bookings-telling). ServicesListe og
 * ServiceForm (client) + actions.ts er uendret — kun presentasjonen er oppdatert.
 */

import {
  Boxes,
  Layers,
  Tag,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AdminHero as PageHeader } from "@/components/admin/admin-hero";
import { cn } from "@/lib/utils";
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

  const snittPris =
    services.length > 0
      ? Math.round(
          services.reduce((acc, s) => acc + s.priceOre, 0) / services.length / 100,
        )
      : 0;
  const mestBooket = [...services].sort(
    (a, b) => b._count.bookings - a._count.bookings,
  )[0];

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
    <div className="mx-auto max-w-[1240px] space-y-6">
      <PageHeader
        eyebrow="AgencyOS · Tjenester og priser"
        titleLead={String(totalCount)}
        titleItalic="tjenester"
        titleTrail={`· ${kategorier} kategori${kategorier === 1 ? "" : "er"}`}
        sub="Endringer her oppdaterer booking.akgolf.no umiddelbart."
        actions={<ServiceForm triggerLabel="+ Ny tjeneste" />}
      />

      {/* KPI-strip */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi
          label="Aktive tjenester"
          value={String(aktive)}
          unit={`/ ${totalCount}`}
          icon={Boxes}
          sub={
            totalCount > 0 && aktive === totalCount
              ? "Alle synlige i booking"
              : `${totalCount - aktive} skjult`
          }
          accent
        />
        <Kpi
          label="Snitt-pris"
          value={snittPris > 0 ? snittPris.toLocaleString("nb-NO") : "—"}
          unit={snittPris > 0 ? "kr" : undefined}
          icon={Tag}
          sub={services.length > 0 ? `Over ${services.length} tjenester` : "Ingen tjenester"}
        />
        <Kpi
          label="Mest bookede"
          value={mestBooket ? mestBooket.name : "—"}
          icon={TrendingUp}
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
          icon={Layers}
          sub={`${aktive} aktive tjenester`}
        />
      </div>

      <ServicesListe services={items} />
    </div>
  );
}

// ----------------- Komponenter -----------------

function Kpi({
  label,
  value,
  unit,
  sub,
  icon: Icon,
  displayValue,
  accent,
}: {
  label: string;
  value: string;
  unit?: string;
  sub?: string;
  icon: LucideIcon;
  displayValue?: boolean;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col gap-2 overflow-hidden rounded-xl border bg-card px-[18px] py-4",
        accent ? "border-accent/40" : "border-border",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </span>
        <span
          className={cn(
            "inline-flex h-6 w-6 items-center justify-center rounded-md",
            accent ? "bg-accent text-primary" : "bg-secondary text-muted-foreground",
          )}
        >
          <Icon className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
        </span>
      </div>
      <div
        className={cn(
          "leading-none text-foreground",
          displayValue
            ? "font-display text-base font-bold tracking-[-0.015em]"
            : "font-mono text-[26px] font-bold tracking-[-0.02em] tabular-nums",
        )}
      >
        {value}
        {unit && !displayValue && (
          <span className="ml-1 text-[13px] font-bold text-muted-foreground">{unit}</span>
        )}
      </div>
      {sub && (
        <div className="font-mono text-[11px] tracking-[0.04em] text-muted-foreground">{sub}</div>
      )}
    </div>
  );
}
