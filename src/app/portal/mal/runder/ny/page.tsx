/**
 * PlayerHQ Loggfør runde — v2-ramme rundt RundeNyForm (rå tailwind, ingen
 * golfdata — gjenbrukes som den er). Lagringslogikk uendret (logRoundManual
 * via formen).
 */

import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { Caps, Tittel, MikroMeta } from "@/components/v2";
import { RundeNyForm } from "@/components/portal/runde-ny/runde-ny-form";

export default async function NyRundePage() {
  const user = await requirePortalUser();
  const courses = await prisma.courseDefinition.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, par: true },
  });

  return (
    <V2Shell aktiv="analyse" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <Link href="/portal/mal/runder" style={{ textDecoration: "none", alignSelf: "flex-start" }}>
          <MikroMeta icon="arrow-left">Alle runder</MikroMeta>
        </Link>

        <div>
          <Caps>Analysere · Runder · Ny</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel em="runde.">Loggfør</Tittel>
          </div>
        </div>

        <div style={{ maxWidth: 760 }}>
          <RundeNyForm courses={courses} />
        </div>
      </div>
    </V2Shell>
  );
}
