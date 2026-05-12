/**
 * CoachHQ — Bookinger
 * Design migrert fra wireframe/design-files-v2/final/04-bookinger.html.
 *
 * Foundation-fasen viser liste-view (uke-kalenderen er v2-feature). Tabell
 * med dato, tid, spiller, fasilitet, type, status, coach. Type-pill matches
 * design-categoriene (Coaching / Fasilitet / Greenfee / Gruppe).
 */

import Link from "next/link";
import { Calendar, Search } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { AdminCancelAction } from "./cancel-action";

type BookingType = "coach" | "fac" | "gf" | "grp";

const STATUS_STYLE: Record<string, string> = {
  CONFIRMED: "bg-[rgba(0,88,64,0.12)] text-primary",
  PENDING: "bg-[rgba(166,101,30,0.16)] text-[#7a4910]",
  CANCELLED: "bg-[rgba(239,68,68,0.12)] text-[#b73838]",
  COMPLETED: "bg-secondary text-muted-foreground",
};

const STATUS_LABEL: Record<string, string> = {
  CONFIRMED: "Bekreftet",
  PENDING: "Venter",
  CANCELLED: "Avlyst",
  COMPLETED: "Fullført",
};

function deriveType(serviceName: string): BookingType {
  const n = serviceName.toLowerCase();
  if (n.includes("1:1") || n.includes("coaching")) return "coach";
  if (n.includes("hull") || n.includes("greenfee")) return "gf";
  if (n.includes("grupp") || n.includes("wang") || n.includes("camp"))
    return "grp";
  return "fac";
}

const TYPE_LABEL: Record<BookingType, string> = {
  coach: "Coaching",
  fac: "Fasilitet",
  gf: "Greenfee",
  grp: "Gruppe",
};

const TYPE_STYLE: Record<BookingType, string> = {
  coach: "bg-[rgba(209,248,67,0.45)] text-[#3d4d0f]",
  fac: "bg-[rgba(0,88,64,0.14)] text-primary",
  gf: "bg-[rgba(166,101,30,0.18)] text-[#7a4910]",
  grp: "bg-[rgba(122,153,140,0.22)] text-[#3d5048]",
};

export default async function Bookinger() {
  await requirePortalUser({ allow: ["COACH", "ADMIN", "GUEST"] });

  const idag = new Date();
  idag.setHours(0, 0, 0, 0);

  const bookings = await prisma.booking.findMany({
    include: {
      user: { select: { id: true, name: true } },
      serviceType: { select: { name: true } },
      location: { select: { name: true } },
    },
    orderBy: { startAt: "desc" },
    take: 100,
  });

  const kommende = bookings.filter((b) => b.startAt >= idag);
  const tidligere = bookings.filter((b) => b.startAt < idag);

  // Uke-beregninger
  const ukeStart = new Date(idag);
  ukeStart.setDate(idag.getDate() - idag.getDay() + 1); // mandag
  const ukeSlutt = new Date(ukeStart);
  ukeSlutt.setDate(ukeStart.getDate() + 7);
  const denneUka = bookings.filter(
    (b) => b.startAt >= ukeStart && b.startAt < ukeSlutt,
  );

  const confirmed = bookings.filter((b) => b.status === "CONFIRMED").length;
  const pending = bookings.filter((b) => b.status === "PENDING").length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CoachHQ · /admin/bookings"
        titleLead={String(bookings.length)}
        titleItalic="bookinger"
        titleTrail={`· ${kommende.length} kommende`}
        sub={`${denneUka.length} denne uka · ${confirmed} bekreftet · ${pending} venter.`}
        actions={
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            + Ny booking
          </button>
        }
      />

      {/* KPI-strip */}
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <KpiAccent
          label="Bookinger denne uka"
          value={String(denneUka.length)}
          sub={`${kommende.length} kommende totalt`}
        />
        <Kpi label="Bekreftet" value={String(confirmed)} sub="Synlig for spiller" />
        <Kpi label="Venter" value={String(pending)} sub="Trenger handling" />
        <Kpi label="Tidligere" value={String(tidligere.length)} sub="Historikk" />
      </div>

      {/* Filter */}
      <form className="flex flex-wrap items-center gap-2">
        <label className="flex flex-1 min-w-[260px] items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-[13px] text-muted-foreground">
          <Search size={14} strokeWidth={1.75} />
          <input
            type="search"
            name="q"
            placeholder="Søk spiller eller fasilitet"
            className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </label>
        <FilterChip label="Type" />
        <FilterChip label="Fasilitet" />
        <FilterChip label="Coach" />
        <Legend />
      </form>

      {/* Body */}
      {bookings.length === 0 ? (
        <EmptyState
          icon={Calendar}
          titleItalic="Ingen bookinger"
          titleTrail="ennå"
          sub="Nye bookinger dukker opp her så snart de er bekreftet."
        />
      ) : (
        <>
          <Section title="Kommende" count={kommende.length}>
            {kommende.length === 0 ? (
              <EmptyState
                icon={Calendar}
                titleItalic="Ingen kommende"
                titleTrail="bookinger"
                sub="Nye bookinger dukker opp her så snart de er bekreftet."
              />
            ) : (
              <BookingTable rows={kommende} />
            )}
          </Section>

          {tidligere.length > 0 && (
            <Section title="Tidligere" count={tidligere.length}>
              <BookingTable rows={tidligere.slice(0, 30)} />
            </Section>
          )}
        </>
      )}
    </div>
  );
}

// ----------------- Komponenter -----------------

type BookingRow = {
  id: string;
  startAt: Date;
  endAt: Date;
  status: string;
  user: { id: string; name: string };
  serviceType: { name: string };
  location: { name: string };
};

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h3 className="font-display text-lg font-semibold tracking-tight">
        {title} <span className="font-mono text-sm text-muted-foreground">({count})</span>
      </h3>
      {children}
    </section>
  );
}

function BookingTable({ rows }: { rows: BookingRow[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <table className="w-full text-[13px]">
        <thead className="border-b border-border bg-secondary/40 text-left">
          <tr>
            <Th>Dato</Th>
            <Th>Tid</Th>
            <Th>Spiller</Th>
            <Th>Fasilitet</Th>
            <Th>Type</Th>
            <Th>Status</Th>
            <Th></Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((b) => {
            const type = deriveType(b.serviceType.name);
            return (
              <tr
                key={b.id}
                className="border-b border-border/60 last:border-0 hover:bg-secondary/30"
              >
                <Td>
                  <span className="font-mono">
                    {b.startAt.toLocaleDateString("nb-NO", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </Td>
                <Td>
                  <span className="font-mono">
                    {b.startAt.toLocaleTimeString("nb-NO", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    –
                    {b.endAt.toLocaleTimeString("nb-NO", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </Td>
                <Td>
                  <Link
                    href={`/admin/elever/${b.user.id}`}
                    className="inline-flex items-center gap-2 hover:text-primary"
                  >
                    <span
                      className="grid h-7 w-7 place-items-center rounded-full font-mono text-[10px] font-semibold text-white"
                      style={{ background: avatarBg(b.user.name) }}
                    >
                      {initials(b.user.name)}
                    </span>
                    <span className="font-medium text-foreground">
                      {b.user.name}
                    </span>
                  </Link>
                </Td>
                <Td>
                  <div className="leading-tight">
                    <div className="font-medium text-foreground">
                      {b.location.name}
                    </div>
                    <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                      {b.serviceType.name}
                    </div>
                  </div>
                </Td>
                <Td>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${TYPE_STYLE[type]}`}
                  >
                    {TYPE_LABEL[type]}
                  </span>
                </Td>
                <Td>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.04em] ${
                      STATUS_STYLE[b.status] ?? "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {STATUS_LABEL[b.status] ?? b.status}
                  </span>
                </Td>
                <Td className="text-right">
                  <AdminCancelAction
                    bookingId={b.id}
                    status={b.status}
                    startAt={b.startAt}
                    playerName={b.user.name}
                  />
                </Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Legend() {
  const items: { c: string; l: string }[] = [
    { c: "rgba(209,248,67,0.6)", l: "Coaching" },
    { c: "rgba(0,88,64,0.5)", l: "Fasilitet" },
    { c: "rgba(166,101,30,0.5)", l: "Greenfee" },
    { c: "rgba(122,153,140,0.5)", l: "Gruppe" },
  ];
  return (
    <div className="hidden flex-wrap items-center gap-3 font-mono text-[11px] text-muted-foreground md:flex">
      {items.map((it) => (
        <span key={it.l} className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-sm"
            style={{ background: it.c }}
          />
          {it.l}
        </span>
      ))}
    </div>
  );
}

function KpiAccent({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-transparent bg-gradient-to-br from-[#0F2A22] to-[#163027] p-4 text-white">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-[rgba(209,248,67,0.70)]">
        {label}
      </div>
      <div className="font-mono text-[28px] font-semibold leading-none tabular-nums text-white">
        {value}
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

function FilterChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[12px] text-muted-foreground">
      {label}
    </span>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return (
    <th className="px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3.5 ${className}`}>{children}</td>;
}

// ----------------- Helpers -----------------

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function avatarBg(name: string): string {
  const palette = [
    "linear-gradient(135deg,#005840,#1A7D56)",
    "linear-gradient(135deg,#A6651E,#7A4910)",
    "linear-gradient(135deg,#7A998C,#56796D)",
    "linear-gradient(135deg,#A32D2D,#7C2020)",
    "linear-gradient(135deg,#3b5994,#5b7cb8)",
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) >>> 0;
  }
  return palette[h % palette.length];
}
