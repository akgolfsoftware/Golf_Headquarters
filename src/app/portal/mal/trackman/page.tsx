/**
 * PlayerHQ · Mål · TrackMan
 *
 * Migrert til produksjonsdesign med PageHeader (italic Instrument Serif),
 * semantiske tokens og 8pt-grid. EmptyState når ingen økter finnes.
 */

import { Activity } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { CsvImportModal } from "./csv-import-modal";

export default async function TrackManPage() {
  const user = await requirePortalUser();

  const sessions = await prisma.trackManSession.findMany({
    where: { userId: user.id },
    orderBy: { recordedAt: "desc" },
    take: 50,
  });

  const subTekst =
    sessions.length === 0
      ? "Ingen økter ennå. Eksporter CSV fra TrackMan og last opp."
      : `Siste ${sessions.length} økter.`;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="PlayerHQ · TrackMan"
        titleLead="Min"
        titleItalic="sving"
        titleTrail="over tid"
        sub={subTekst}
        actions={<CsvImportModal />}
      />

      {sessions.length === 0 ? (
        <EmptyState
          icon={Activity}
          titleItalic="Ingen økter"
          titleTrail="lastet opp"
          sub="Eksporter CSV fra TrackMan-økten din og last opp. Per-kølle-snitt og dispersion beregnes automatisk."
        />
      ) : (
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
                  className="cursor-pointer border-b border-border/60 last:border-0 hover:bg-muted/30"
                >
                  <Td>
                    <a
                      href={`/portal/mal/trackman/${s.id}`}
                      className="block text-foreground hover:text-primary"
                    >
                      {s.recordedAt.toLocaleDateString("nb-NO", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </a>
                  </Td>
                  <Td>
                    <span className="rounded-sm bg-muted px-2 py-1 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
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
      className={`px-4 py-4 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground ${className}`}
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
  return <td className={`px-4 py-4 text-foreground ${className}`}>{children}</td>;
}
