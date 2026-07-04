import Link from "next/link";
import { Clock, Trophy } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { Button, Card, Eyebrow } from "@/components/athletic/golfdata";
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
    <div className="golfdata-scope space-y-8 pb-20 md:pb-0">
      {/* Editorial header */}
      <header role="banner" className="px-0">
        <Eyebrow style={{ fontSize: "var(--text-11)", letterSpacing: "0.16em" }}>
          PlayerHQ · Utfordringer
        </Eyebrow>
        <div className="mt-1.5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl">
              Mine <em className="font-medium italic text-primary">utfordringer</em>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {aktive.length} aktive · drill-challenges du har laget eller deltar i.
            </p>
          </div>
          <Button as={Link} href="/portal/utfordringer/ny" variant="signal">
            + Ny utfordring
          </Button>
        </div>
      </header>

      {/* Aktive */}
      <section aria-labelledby="aktive-tittel" className="space-y-4">
        <Eyebrow as="h2" id="aktive-tittel">
          Aktive ({aktive.length})
        </Eyebrow>
        {aktive.length === 0 ? (
          <EmptyState
            icon={Trophy}
            titleItalic="Ingen"
            titleTrail="aktive utfordringer"
            sub="Lag en ny utfordring eller bli med i en eksisterende."
            cta={
              <Button as={Link} href="/portal/utfordringer/ny" variant="signal">
                + Ny utfordring
              </Button>
            }
          />
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {aktive.map((u) => (
              <UtfordringKort key={u.id} u={u} brukerId={user.id} />
            ))}
          </ul>
        )}
      </section>

      {/* Tidligere */}
      {tidligere.length > 0 && (
        <section aria-labelledby="tidligere-tittel" className="space-y-4">
          <Eyebrow as="h2" id="tidligere-tittel">
            Tidligere ({tidligere.length})
          </Eyebrow>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
  participants: {
    id: string;
    userId: string;
    score: number | null;
    rank: number | null;
  }[];
};

function UtfordringKort({
  u,
  brukerId,
}: {
  u: UtfordringForKort;
  brukerId: string;
}) {
  const minPlassering = u.participants.find((p) => p.userId === brukerId);
  const erEier = u.ownerId === brukerId;
  const erAvsluttet = u.status === "ENDED";
  const sluttDato = u.endAt
    ? u.endAt.toLocaleDateString("nb-NO", { day: "2-digit", month: "short" })
    : null;
  const deadlineTekst = erAvsluttet
    ? "Avsluttet"
    : sluttDato
      ? `Slutter ${sluttDato}`
      : "Ingen sluttdato";

  return (
    <li>
      <Link href={`/portal/utfordringer/${u.id}`} className="block">
       <Card interactive compact>
        {/* Eyebrow-rad: status-dot + label, + Eier-badge */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.10em] ${
              erAvsluttet ? "" : "text-primary"
            }`}
          >
            <span
              aria-hidden
              className={`inline-block h-1.5 w-1.5 rounded-full ${
                erAvsluttet ? "bg-muted-foreground" : "bg-accent"
              }`}
            />
            <span className={erAvsluttet ? "text-muted-foreground" : ""}>
              {erAvsluttet ? "Fullført" : "Utfordring"}
            </span>
          </span>
          {erEier && (
            <span className="rounded-full bg-accent/20 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.10em] text-accent-foreground">
              Eier
            </span>
          )}
        </div>

        {/* Tittel */}
        <h3 className="mt-2 font-display text-base font-bold leading-tight tracking-tight text-foreground">
          {u.name}
        </h3>

        {u.description && (
          <p className="mt-1.5 line-clamp-2 text-[13px] text-muted-foreground">
            {u.description}
          </p>
        )}

        {/* Data-rad: deltakere + plassering */}
        <dl className="mt-3.5 grid grid-cols-2 gap-3 border-t border-border pt-3.5">
          <div>
            <dt className="font-mono text-[9px] uppercase tracking-[0.10em] text-muted-foreground">
              Deltakere
            </dt>
            <dd className="mt-1 font-mono text-lg font-bold tabular-nums text-foreground">
              {u.participants.length}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[9px] uppercase tracking-[0.10em] text-muted-foreground">
              Min plassering
            </dt>
            <dd className="mt-1 font-mono text-lg font-bold tabular-nums">
              {minPlassering?.rank != null ? (
                <span className="text-primary">
                  #{minPlassering.rank}
                  {minPlassering.score != null && (
                    <span className="ml-1.5 text-sm font-medium text-muted-foreground">
                      ({minPlassering.score})
                    </span>
                  )}
                </span>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </dd>
          </div>
        </dl>

        {/* Deadline-fot */}
        <div className="mt-3 flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
          <Clock aria-hidden size={11} strokeWidth={1.5} />
          {deadlineTekst}
        </div>
       </Card>
      </Link>
    </li>
  );
}
