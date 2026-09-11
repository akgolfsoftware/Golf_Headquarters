/**
 * PlayerHQ Loggfør runde — totalscore/scorekort og valgfri manuell SG.
 * RundeNyForm deler SG-felt og validering med redigeringen på rundedetaljen.
 */

import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { Caps, Tittel, MikroMeta, Kort } from "@/components/v2";
import { TL } from "@/lib/v2/train-lock";

import { RundeNyForm } from "@/components/portal/runde-ny/runde-ny-form";
import { sisteSpilteBaneId } from "@/lib/portal/siste-spilte-bane";
import { medForst } from "@/lib/portal/baneliste-med-prefill";

export default async function NyRundePage() {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
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
    <V2Shell bredde="kolonne" aktiv="analyse" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
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

        {/* To kilder: før egne slag, eller registrer eksisterende SG-tall. */}
        <Kort pad="12px 18px">
          <p style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute, margin: 0, lineHeight: 1.6 }}>
            Har du SG-tall fra før? Registrer dem i enkel eller avansert visning under. Du kan også{" "}
            <Link href="/portal/runde/logg" style={{ color: TL.fill, fontWeight: 600, textDecoration: "none" }}>
              føre runden slag for slag
            </Link>{" "}
            for å beregne SG fra registrerte slag.
          </p>
        </Kort>

        <div style={{ maxWidth: 760 }}>
          <RundeNyForm courses={courses} />
        </div>
      </div>
    </V2Shell>
  );
}
