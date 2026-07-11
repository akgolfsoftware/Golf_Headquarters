/**
 * PlayerHQ Loggfør runde — v2-ramme rundt RundeNyForm (rå tailwind, ingen
 * golfdata — gjenbrukes som den er). Lagringslogikk uendret (logRoundManual
 * via formen).
 */

import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { Caps, Tittel, MikroMeta, Kort } from "@/components/v2";
import { T } from "@/lib/v2/tokens";
import { RundeNyForm } from "@/components/portal/runde-ny/runde-ny-form";
import { sisteSpilteBaneId } from "@/lib/portal/siste-spilte-bane";
import { medForst } from "@/lib/portal/baneliste-med-prefill";

export default async function NyRundePage() {
  const user = await requirePortalUser();
  const [alleCourses, sisteBaneId] = await Promise.all([
    prisma.courseDefinition.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, par: true },
    }),
    sisteSpilteBaneId(user.id),
  ]);
  // Prefill (flytpakke 2, 2.5): sist spilte bane foreslås øverst.
  const courses = medForst(alleCourses, sisteBaneId);

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

        {/* Full SG krever slag-for-slag-føring — pek dit (port fra main 2026-07-11) */}
        <Kort pad="12px 18px">
          <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: 0, lineHeight: 1.6 }}>
            Vil du ha full Strokes Gained?{" "}
            <Link href="/portal/runde/logg" style={{ color: T.lime, fontWeight: 600, textDecoration: "none" }}>
              Før runden slag for slag
            </Link>{" "}
            — da ser du nøyaktig hvor slagene ble tjent og tapt.
          </p>
        </Kort>

        <div style={{ maxWidth: 760 }}>
          <RundeNyForm courses={courses} />
        </div>
      </div>
    </V2Shell>
  );
}
