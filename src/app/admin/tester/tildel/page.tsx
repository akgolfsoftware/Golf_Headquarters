/**
 * /admin/tester/tildel — spiller-velger for test-tildeling.
 *
 * Fikser nav-bug A3: «Registrer test»-CTA på /admin/tester pekte hit uten
 * spillerId → 404. Velg en spiller → /admin/tester/tildel/[spillerId].
 */

import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AgPage, AgPageHead } from "@/components/admin/agencyos/ui";

export const dynamic = "force-dynamic";

export default async function TildelVelgSpillerPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const spillere = await prisma.user.findMany({
    where: { role: "PLAYER" },
    orderBy: { name: "asc" },
    select: { id: true, name: true, hcp: true },
  });

  return (
    <AgPage>
      <AgPageHead
        eyebrow="Analysere · Tester"
        title="Registrer test"
        italic="· velg spiller"
        lead="Velg spilleren du vil registrere eller tildele en test for."
      />

      {spillere.length === 0 ? (
        <p className="text-sm text-muted-foreground">Ingen spillere funnet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-[10px] sm:grid-cols-2 lg:grid-cols-3">
          {spillere.map((s) => (
            <Link
              key={s.id}
              href={`/admin/tester/tildel/${s.id}`}
              className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-3 text-sm transition-colors hover:border-primary"
            >
              <span className="font-medium text-foreground">
                {s.name ?? "Uten navn"}
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                {s.hcp != null ? `HCP ${s.hcp}` : "—"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </AgPage>
  );
}
