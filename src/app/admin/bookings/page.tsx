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
import { avatarBg } from "@/lib/avatar-colors";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { CoachFilter } from "@/components/admin/coach-filter";
import { RecordingTriggerButton } from "@/components/admin/recording-trigger-button";
import { AdminCancelAction } from "./cancel-action";
import type { Prisma } from "@/generated/prisma/client";

type BookingType = "coach" | "fac" | "gf" | "grp";

const STATUS_STYLE: Record<string, string> = {
  CONFIRMED: "bg-primary/15 text-primary",
  PENDING: "bg-accent/30 text-accent-foreground",
  CANCELLED: "bg-destructive/15 text-destructive",
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
  coach: "bg-accent/50 text-accent-foreground",
  fac: "bg-primary/15 text-primary",
  gf: "bg-accent/30 text-accent-foreground",
  grp: "bg-primary/15 text-primary",
};

type SearchParams = Promise<{ coach?: string }>;

export default async function Bookinger({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { coach: coachParam } = await searchParams;
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN", "GUEST"] });

  const idag = new Date();
  idag.setHours(0, 0, 0, 0);

  // Coach-filter:
  // - ADMIN: 'alle' = ingen filter, ellers spesifikk coachUserId
  // - COACH: alltid kun egne bookinger
  // - GUEST (read-only): alle
  const coachFilter: Prisma.BookingWhereInput = (() => {
    if (user.role === "COACH") {
      return { serviceType: { coachUserId: user.id } };
    }
    if (user.role === "ADMIN" && coachParam && coachParam !== "alle") {
      return { serviceType: { coachUserId: coachParam } };
    }
    return {};
  })();

  // Hent alle coaches (User med role=COACH eller ADMIN som har services)
  const coaches = await prisma.user.findMany({
    where: { serviceTypes: { some: { active: true } } },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const bookings = await prisma.booking.findMany({
    where: coachFilter,
    select: {
      id: true,
      startAt: true,
      endAt: true,
      status: true,
      priceOre: true,
      subscriptionId: true,
      user: { select: { id: true, name: true } },
      serviceType: {
        select: { name: true, coach: { select: { id: true, name: true } } },
      },
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
          <Link
            href="/admin/bookings/ny"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            + Ny booking
          </Link>
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
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex flex-1 min-w-[260px] items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-[13px] text-muted-foreground">
          <Search size={14} strokeWidth={1.75} />
          <input
            type="search"
            name="q"
            placeholder="Søk spiller eller fasilitet"
            className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </label>
        {user.role === "ADMIN" && (
          <CoachFilter
            coaches={coaches.map((c) => ({ id: c.id, navn: c.name }))}
          />
        )}
        <Legend />
      </div>

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
  priceOre: number;
  subscriptionId: string | null;
  user: { id: string; name: string } | null;
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
    <section className="space-y-4">
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
      <div className="space-y-2 p-4 sm:hidden">
        {rows.map((b) => {
          const type = deriveType(b.serviceType.name);
          return (
            <div
              key={b.id}
              className="rounded-lg border border-border bg-card p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-mono text-xs tabular-nums text-muted-foreground">
                    {b.startAt.toLocaleDateString("nb-NO", {
                      day: "2-digit",
                      month: "short",
                    })}
                    {" · "}
                    {b.startAt.toLocaleTimeString("nb-NO", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    –
                    {b.endAt.toLocaleTimeString("nb-NO", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  {b.user ? (
                    <Link
                      href={`/admin/elever/${b.user.id}`}
                      className="mt-1 block font-semibold text-foreground hover:text-primary"
                    >
                      {b.user.name}
                    </Link>
                  ) : (
                    <span className="mt-1 block font-semibold text-muted-foreground">
                      Gjest
                    </span>
                  )}
                  <div className="mt-1 text-xs text-muted-foreground">
                    {b.location.name} · {b.serviceType.name}
                  </div>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.04em] ${
                    STATUS_STYLE[b.status] ?? "bg-secondary text-muted-foreground"
                  }`}
                >
                  {STATUS_LABEL[b.status] ?? b.status}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-1">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${TYPE_STYLE[type]}`}
                >
                  {TYPE_LABEL[type]}
                </span>
                {b.subscriptionId ? (
                  <span className="rounded-full bg-accent/30 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.04em] text-accent-foreground">
                    Abo
                  </span>
                ) : b.priceOre > 0 ? (
                  <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
                    Drop-in
                  </span>
                ) : null}
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-end gap-2">
                <RecordingTriggerButton bookingId={b.id} />
                <AdminCancelAction
                  bookingId={b.id}
                  status={b.status}
                  startAt={b.startAt}
                  playerName={b.user?.name ?? "Gjest"}
                />
              </div>
            </div>
          );
        })}
      </div>
      <table className="hidden w-full text-[13px] sm:table">
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
                  {b.user ? (
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
                  ) : (
                    <span className="font-medium text-muted-foreground">Gjest</span>
                  )}
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
                  <div className="flex flex-wrap items-center gap-1">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${TYPE_STYLE[type]}`}
                    >
                      {TYPE_LABEL[type]}
                    </span>
                    {b.subscriptionId ? (
                      <span className="rounded-full bg-accent/30 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.04em] text-accent-foreground">
                        Abo
                      </span>
                    ) : b.priceOre > 0 ? (
                      <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
                        Drop-in
                      </span>
                    ) : null}
                  </div>
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
                  <div className="inline-flex items-center gap-2">
                    <RecordingTriggerButton bookingId={b.id} />
                    <AdminCancelAction
                      bookingId={b.id}
                      status={b.status}
                      startAt={b.startAt}
                      playerName={b.user?.name ?? "Gjest"}
                    />
                  </div>
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
    <div className="hidden flex-wrap items-center gap-4 font-mono text-[11px] text-muted-foreground md:flex">
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
    <div className="flex flex-col gap-1.5 rounded-lg border border-transparent bg-gradient-to-br from-foreground to-foreground/90 p-4 text-white">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-accent/70">
        {label}
      </div>
      <div className="font-mono text-[28px] font-semibold leading-none tabular-nums text-white">
        {value}
      </div>
      {sub && (
        <div className="font-mono text-[11px] text-background/70">
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
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 text-[12px] text-muted-foreground">
      {label}
    </span>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return (
    <th className="px-4 py-4 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
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

