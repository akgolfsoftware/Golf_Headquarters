import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

const STATUS_FARGE: Record<string, string> = {
  CONFIRMED: "bg-primary/10 text-primary",
  PENDING: "bg-accent/30 text-foreground",
  CANCELLED: "bg-muted text-muted-foreground",
  COMPLETED: "bg-muted text-muted-foreground",
};

export default async function Bookinger() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

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
    <div className="space-y-6">
      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Bookinger
        </span>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight">
          <em className="font-normal text-primary md:italic">Alle</em> bookinger
        </h1>
      </header>

      <section>
        <h3 className="mb-3 font-display text-lg font-semibold tracking-tight">
          Kommende ({kommende.length})
        </h3>
        {kommende.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
            Ingen kommende bookinger.
          </p>
        ) : (
          <BookingTable rows={kommende} />
        )}
      </section>

      <section>
        <h3 className="mb-3 font-display text-lg font-semibold tracking-tight">
          Tidligere ({tidligere.length})
        </h3>
        {tidligere.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
            Ingen tidligere bookinger.
          </p>
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
        <thead className="border-b border-border bg-muted/40 text-left">
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
              className="border-b border-border/60 last:border-0 hover:bg-muted/30"
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
                    STATUS_FARGE[b.status] ?? "bg-muted text-muted-foreground"
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
