import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { CsvImportModal } from "./csv-import-modal";

export default async function TrackManPage() {
  const user = await requirePortalUser();

  const sessions = await prisma.trackManSession.findMany({
    where: { userId: user.id },
    orderBy: { recordedAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-semibold leading-tight tracking-tight">
            TrackMan-økter
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {sessions.length === 0
              ? "Ingen økter ennå. Eksporter CSV fra TrackMan og last opp."
              : `Siste ${sessions.length} økter.`}
          </p>
        </div>
        <CsvImportModal />
      </div>

      {sessions.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left">
              <tr>
                <Th>Dato</Th>
                <Th>Kilde</Th>
                <Th className="text-right">Slag</Th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-border/60 last:border-0 hover:bg-muted/30"
                >
                  <Td>
                    {s.recordedAt.toLocaleDateString("nb-NO", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </Td>
                  <Td>
                    <span className="rounded-sm bg-muted px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                      {s.source}
                    </span>
                  </Td>
                  <Td className="text-right tabular-nums">{s.shotCount}</Td>
                </tr>
              ))}
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
