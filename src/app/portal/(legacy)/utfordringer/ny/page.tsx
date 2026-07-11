/**
 * PlayerHQ · Utfordringer · Ny utfordring
 *
 * 6-stegs wizard for å lage en egen DrillChallenge:
 *   1. Tittel + Beskrivelse
 *   2. Type (Lengde / Nøyaktighet / Putting / Scrambling / Score / Mental / Annet)
 *   3. Mål-verdi + enhet
 *   4. Tidsfrist (valgfri)
 *   5. Inviter (skjelett-UI for venne-søk i akademi)
 *   6. Opprett (sammendrag + lagre)
 */
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PlayerHero as PageHeader } from "@/components/portal/player-hero";
import { NyUtfordringWizard } from "./wizard";

export const dynamic = "force-dynamic";

export default async function NyUtfordringPage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  // Hent venner via Friendship-modell. Aksepterte vennskap begge veier.
  const vennskap = await prisma.friendship.findMany({
    where: {
      status: "ACCEPTED",
      OR: [{ userAId: user.id }, { userBId: user.id }],
    },
    select: {
      userA: { select: { id: true, name: true, email: true } },
      userB: { select: { id: true, name: true, email: true } },
    },
    take: 40,
  });
  const venner = vennskap.map((v) =>
    v.userA.id === user.id ? v.userB : v.userA,
  );

  const drills = await prisma.exerciseDefinition.findMany({
    select: { id: true, name: true, pyramidArea: true },
    orderBy: { name: "asc" },
    take: 200,
  });

  return (
    <div className="space-y-6 pb-20 md:space-y-8 md:pb-0">
      <div>
        <Link
          href="/portal/utfordringer"
          className="inline-flex h-11 items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.10em] text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft size={12} strokeWidth={1.75} /> Tilbake til utfordringer
        </Link>
      </div>

      <PageHeader
        eyebrow="PlayerHQ · /portal/utfordringer/ny"
        titleLead="Lag en"
        titleItalic="utfordring"
        sub="Seks steg — tittel, type, mål, tidsfrist, deltakere og opprettelse."
      />

      <NyUtfordringWizard
        venner={venner.map((v) => ({
          id: v.id,
          navn: v.name ?? v.email,
        }))}
        drills={drills}
      />
    </div>
  );
}
