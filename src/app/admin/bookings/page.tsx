import Link from "next/link";
import { Calendar } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

const STATUS_FARGE: Record<string, string> = {
  CONFIRMED: "bg-primary/10 text-primary",
  PENDING: "bg-accent/30 text-foreground",
  CANCELLED: "bg-secondary text-muted-foreground",
  COMPLETED: "bg-secondary text-muted-foreground",
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

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="CoachHQ · Bookinger"
        titleItalic="Alle"
        titleTrail="bookinger"
        sub={`${bookings.length} bookinger totalt · ${kommende.length} kommende.`}
      />

      <section className="space-y-4">
        <h3 className="font-display text-lg font-semibold tracking-tight">
          Kommende ({kommende.length})
        </h3>
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
      </section>

      <section className="space-y-4">
        <h3 className="font-display text-lg font-semibold tracking-tight">
          Tidligere ({tidligere.length})
        </h3>
        {tidligere.length === 0 ? (
          <EmptyState
            icon={Calendar}
            titleItalic="Ingen tidligere"
            titleTrail="bookinger"
            sub="Historikk vises her etter første gjennomførte time."
          />
        ) : (
          <BookingTable rows={tidligere.slice(0, 30)} />
        )}
      </section>
    </div>
  );
}

type BookingRow = {
  id: string;
  startAt: Date;
  endAt: Date;
  status: string;
  user: { id: string; name: string };
  serviceType: { name: string };
  location: { name: string };
};

function BookingTable({ rows }: { rows: BookingRow[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-secondary/40 text-left">
          <tr>
            <Th>Dato</Th>
            <Th>Tid</Th>
            <Th>Spiller</Th>
            <Th>Tjeneste</Th>
            <Th>Lokasjon</Th>
            <Th>Status</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((b) => (
            <tr
              key={b.id}
              className="border-b border-border/60 last:border-0 hover:bg-secondary/30"
            >
              <Td>
                {b.startAt.toLocaleDateString("nb-NO", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </Td>
              <Td>
                {b.startAt.toLocaleTimeString("nb-NO", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                –
                {b.endAt.toLocaleTimeString("nb-NO", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Td>
              <Td>
                <Link
                  href={`/admin/elever/${b.user.id}`}
                  className="text-foreground hover:text-primary"
                >
                  {b.user.name}
                </Link>
              </Td>
              <Td>{b.serviceType.name}</Td>
              <Td>{b.location.name}</Td>
              <Td>
                <span
                  className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] ${
                    STATUS_FARGE[b.status] ?? "bg-secondary text-muted-foreground"
                  }`}
                >
                  {b.status}
                </span>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3">{children}</td>;
}
