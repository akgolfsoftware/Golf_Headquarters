/**
 * CoachHQ — Tjenester (bookbar katalog)
 * Design migrert fra wireframe/design-files-v2/final/06-tjenester.html.
 *
 * Tabell med navn+beskrivelse, varighet, pris, kategori-pill, "bookinger"-
 * sparkline-placeholder, on/off-toggle. KPI-strip øverst.
 */

import { Package, Search } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ServiceForm } from "./service-form";

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

const CATEGORY_LABEL: Record<Category, string> = {
  coach: "Coaching",
  studio: "Studio",
  green: "Greenfee",
  group: "Gruppe",
  event: "Event",
};

const CATEGORY_STYLE: Record<Category, { bg: string; dot: string }> = {
  coach: { bg: "bg-[rgba(0,88,64,0.12)] text-primary", dot: "bg-primary" },
  studio: {
    bg: "bg-[rgba(91,124,184,0.15)] text-[#3b5994]",
    dot: "bg-[#3b5994]",
  },
  green: {
    bg: "bg-[rgba(22,163,74,0.14)] text-[#0f7536]",
    dot: "bg-[#16A34A]",
  },
  group: {
    bg: "bg-[rgba(244,196,48,0.22)] text-[#7a5a08]",
    dot: "bg-[#F4C430]",
  },
  event: {
    bg: "bg-[rgba(217,84,123,0.16)] text-[#8a2f55]",
    dot: "bg-[#d9547b]",
  },
};

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
          sub={aktive === totalCount ? "Alle synlige i booking" : `${totalCount - aktive} skjult`}
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

      {/* Filter */}
      <form className="flex flex-wrap items-center gap-2">
        <label className="flex flex-1 min-w-[260px] items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-[13px] text-muted-foreground">
          <Search size={14} strokeWidth={1.75} />
          <input
            type="search"
            name="q"
            placeholder="Søk tjeneste"
            className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </label>
        <FilterChip label="Kategori" />
        <FilterChip label="Status" />
        <FilterChip label="Pris" />
      </form>

      {/* Body */}
      {services.length === 0 ? (
        <EmptyState
          icon={Package}
          titleItalic="Ingen tjenester"
          titleTrail="ennå"
          sub="Lag din første tjeneste for å åpne booking. Vi anbefaler å starte med 1:1 Coaching 60 min — så kan du legge til flere etter hvert."
          cta={<ServiceForm triggerLabel="+ Lag første tjeneste" />}
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-4 py-2.5 font-mono text-[11px] text-muted-foreground">
            <span>
              Viser <b className="font-semibold text-foreground">{services.length}</b> av {totalCount}
            </span>
            <span className="text-foreground">
              Sortert: Aktiv → Navn ↑
            </span>
          </div>
          <table className="w-full text-[13px]">
            <thead className="border-b border-border bg-secondary/30 text-left">
              <tr>
                <Th>Tjeneste</Th>
                <Th>Varighet</Th>
                <Th className="text-right">Pris</Th>
                <Th>Kategori</Th>
                <Th>Bookinger</Th>
                <Th>Aktiv</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => {
                const cat = deriveCategory(s.name);
                const catStyle = CATEGORY_STYLE[cat];
                return (
                  <tr
                    key={s.id}
                    className="border-b border-border/60 last:border-0 hover:bg-secondary/30"
                  >
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-foreground">
                        {s.name}
                      </div>
                      {s.description && (
                        <div className="mt-0.5 text-[11.5px] leading-snug text-muted-foreground">
                          {s.description}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-mono font-semibold tabular-nums text-foreground">
                      {s.durationMin} min
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-semibold tabular-nums text-foreground">
                      {(s.priceOre / 100).toLocaleString("nb-NO")} kr
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${catStyle.bg}`}
                      >
                        <span
                          className={`inline-block h-1.5 w-1.5 rounded-full ${catStyle.dot}`}
                        />
                        {CATEGORY_LABEL[cat]}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold tabular-nums text-foreground">
                          {s._count.bookings}
                        </span>
                        <Sparkline />
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <ToggleVisual on={s.active} />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <ServiceForm
                        initial={{
                          id: s.id,
                          name: s.name,
                          description: s.description,
                          priceOre: s.priceOre,
                          durationMin: s.durationMin,
                          active: s.active,
                        }}
                        triggerLabel="Endre"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ----------------- Komponenter -----------------

function Sparkline() {
  // Statisk SVG-placeholder — i v2 koples til faktisk månedsdata.
  return (
    <svg
      width="56"
      height="18"
      viewBox="0 0 60 20"
      aria-hidden="true"
      className="text-primary"
    >
      <polyline
        points="0,15 10,12 20,14 30,8 40,10 50,6 60,4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ToggleVisual({ on }: { on: boolean }) {
  return (
    <span
      role="img"
      aria-label={on ? "Aktiv" : "Inaktiv"}
      className={`relative inline-block h-5 w-9 rounded-full transition-colors ${
        on ? "bg-primary" : "bg-border"
      }`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
          on ? "left-4" : "left-0.5"
        }`}
      />
    </span>
  );
}

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
    <div className="flex flex-col gap-1.5 rounded-lg border border-transparent bg-gradient-to-br from-[#0F2A22] to-[#163027] p-4 text-white">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-[rgba(209,248,67,0.70)]">
        {label}
      </div>
      <div className="font-mono text-[28px] font-semibold leading-none tabular-nums text-white">
        {value}
        {unit && (
          <span className="ml-1 text-[13px] font-medium text-[rgba(245,244,238,0.5)]">
            {unit}
          </span>
        )}
      </div>
      {sub && (
        <div className="font-mono text-[11px] text-[rgba(245,244,238,0.7)]">
          {sub}
        </div>
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

function FilterChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[12px] text-muted-foreground">
      {label}
    </span>
  );
}

function Th({
  children = null,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground ${className}`}
    >
      {children}
    </th>
  );
}
