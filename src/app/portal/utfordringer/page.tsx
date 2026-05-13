import Link from "next/link";
import { Trophy } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default async function UtfordringerListe() {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  // Hent utfordringer hvor brukeren enten er eier eller deltaker.
  const utfordringer = await prisma.drillChallenge.findMany({
    where: {
      OR: [
        { ownerId: user.id },
        { participants: { some: { userId: user.id } } },
      ],
    },
    include: {
      owner: { select: { id: true, name: true } },
      participants: {
        select: { id: true, userId: true, score: true, rank: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const aktive = utfordringer.filter((u) => u.status === "ACTIVE");
  const tidligere = utfordringer.filter((u) => u.status === "ENDED");

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="PlayerHQ · Utfordringer"
        titleLead="Mine"
        titleItalic="utfordringer"
        sub="Drill-challenges du har laget eller deltar i."
        actions={
          <Link
            href="/portal/utfordringer/ny"
            className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            + Ny utfordring
          </Link>
        }
      />

      <section aria-labelledby="aktive-tittel" className="space-y-4">
        <h2
          id="aktive-tittel"
          className="font-display text-lg font-semibold tracking-tight"
        >
          Aktive ({aktive.length})
        </h2>
        {aktive.length === 0 ? (
          <EmptyState
            icon={Trophy}
            titleItalic="Ingen"
            titleTrail="aktive utfordringer"
            sub="Lag en ny utfordring eller bli med i en eksisterende."
            cta={
              <Link
                href="/portal/utfordringer/ny"
                className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                + Ny utfordring
              </Link>
            }
          />
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {aktive.map((u) => (
              <UtfordringKort key={u.id} u={u} brukerId={user.id} />
            ))}
          </ul>
        )}
      </section>

      {tidligere.length > 0 && (
        <section aria-labelledby="tidligere-tittel" className="space-y-4">
          <h2
            id="tidligere-tittel"
            className="font-display text-lg font-semibold tracking-tight"
          >
            Tidligere ({tidligere.length})
          </h2>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tidligere.map((u) => (
              <UtfordringKort key={u.id} u={u} brukerId={user.id} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

type UtfordringForKort = {
  id: string;
  name: string;
  description: string | null;
  startAt: Date | null;
  endAt: Date | null;
  status: string;
  ownerId: string;
  owner: { id: string; name: string | null };
  participants: { id: string; userId: string; score: number | null; rank: number | null }[];
};

function UtfordringKort({ u, brukerId }: { u: UtfordringForKort; brukerId: string }) {
  const minPlassering = u.participants.find((p) => p.userId === brukerId);
  const erEier = u.ownerId === brukerId;
  const sluttDato = u.endAt
    ? u.endAt.toLocaleDateString("nb-NO", { day: "2-digit", month: "short" })
    : null;

  return (
    <li>
      <Link
        href={`/portal/utfordringer/${u.id}`}
        className="block rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/40"
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-base font-semibold leading-tight tracking-tight">
            {u.name}
          </h3>
          {erEier && (
            <span className="rounded-full bg-accent/20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-accent-foreground">
              Eier
            </span>
          )}
        </div>
        {u.description && (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {u.description}
          </p>
        )}
        <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4">
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Deltakere
            </dt>
            <dd className="mt-1 font-mono text-lg font-semibold tabular-nums">
              {u.participants.length}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              {u.status === "ENDED" ? "Avsluttet" : "Slutter"}
            </dt>
            <dd className="mt-1 font-mono text-sm tabular-nums text-foreground">
              {sluttDato ?? "—"}
            </dd>
          </div>
          {minPlassering?.rank != null && (
            <div className="col-span-2">
              <dt className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Min plassering
              </dt>
              <dd className="mt-1 font-mono text-sm font-semibold tabular-nums text-primary">
                #{minPlassering.rank}
                {minPlassering.score != null && (
                  <span className="ml-2 text-muted-foreground">
                    ({minPlassering.score})
                  </span>
                )}
              </dd>
            </div>
          )}
        </dl>
      </Link>
    </li>
  );
}
