import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { formatSg } from "@/lib/sg";
import { NyRundeModal } from "./ny-runde-modal";

export default async function RunderPage() {
  const user = await requirePortalUser();

  const [rounds, courses] = await Promise.all([
    prisma.round.findMany({
      where: { userId: user.id },
      orderBy: { playedAt: "desc" },
      include: { course: true },
      take: 50,
    }),
    prisma.courseDefinition.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-semibold leading-tight tracking-tight">
            Mine runder
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {rounds.length === 0
              ? "Ingen registrerte runder ennå."
              : `Siste ${rounds.length} runder, sortert etter dato.`}
          </p>
        </div>
        <NyRundeModal courses={courses.map((c) => ({ id: c.id, name: c.name, par: c.par }))} />
      </div>

      {courses.length === 0 && (
        <div className="rounded-lg border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
          Ingen baner finnes i databasen. En administrator må opprette baner før du kan
          registrere runder.
        </div>
      )}

      {rounds.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left">
              <tr>
                <Th>Dato</Th>
                <Th>Bane</Th>
                <Th className="text-right">Skår</Th>
                <Th className="text-right">SG</Th>
                <Th className="text-right">Til par</Th>
              </tr>
            </thead>
            <tbody>
              {rounds.map((r) => {
                const tilPar = r.score - r.course.par;
                return (
                  <tr
                    key={r.id}
                    className="border-b border-border/60 last:border-0 hover:bg-muted/30"
                  >
                    <Td>
                      {r.playedAt.toLocaleDateString("nb-NO", {
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </Td>
                    <Td>{r.course.name}</Td>
                    <Td className="text-right tabular-nums">{r.score}</Td>
                    <Td className="text-right tabular-nums">{formatSg(r.sgTotal)}</Td>
                    <Td className="text-right tabular-nums">
                      <span
                        className={
                          tilPar < 0
                            ? "text-primary"
                            : tilPar > 0
                            ? "text-destructive"
                            : "text-muted-foreground"
                        }
                      >
                        {tilPar > 0 ? "+" : ""}
                        {tilPar}
                      </span>
                    </Td>
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

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-4 py-3 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground ${className}`}
    >
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
  return <td className={`px-4 py-3 text-foreground ${className}`}>{children}</td>;
}
