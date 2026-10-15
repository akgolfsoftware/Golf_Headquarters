/**
 * PlayerHQ · Meg · Innstillinger (/portal/meg/innstillinger) — PH-25 i nytt design
 * (docs/design-system/utkast-playerhq/meg.html, skjermen «Innstillinger»).
 *
 * Bare ekte status: helse-samtykket, varselvalgene, delingen og om en sletteforespørsel
 * allerede er sendt. Hver innstilling endres på sin egen underside.
 */
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { lesPreferences } from "@/lib/preferences";
import { harManuellHelseSamtykke } from "@/lib/health/samtykke";
import { grupperMedEksterneLesereForSpiller, hentDelingsStatus } from "@/lib/deling/samtykke";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH25Innstillinger, type PH25InnstillingerData } from "@/components/portal/precision/PH25Innstillinger";

export const dynamic = "force-dynamic";
export const metadata = { title: "Innstillinger · PlayerHQ" };

export default async function InnstillingerPage() {
  const user = await requirePortalUser({ kreverTilgang: "INGEN" });
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const [fullUser, helseLogg, grupper, aapenSletting] = await Promise.all([
    prisma.user.findUnique({ where: { id: user.id }, select: { preferences: true } }),
    harManuellHelseSamtykke(user.id),
    grupperMedEksterneLesereForSpiller(user.id),
    prisma.moderationCase.findFirst({ where: { type: "GDPR_SLETTING", userId: user.id, status: "OPEN" }, select: { id: true } }),
  ]);
  const prefs = lesPreferences(fullUser ?? { preferences: null });
  const valg = Object.values(prefs.notif);
  const status = await hentDelingsStatus(user.id, grupper.map((g) => g.id)).catch(() => null);

  const data: PH25InnstillingerData = {
    helseLogg,
    varsler: { paa: valg.filter(Boolean).length, av: valg.length },
    deling: status ? status.filter((s) => s.testResultater || s.stats || s.komplettProfil).length : null,
    spraak: prefs.spraak === "en" ? "English" : "Norsk",
    slettingSendt: aapenSletting !== null,
  };

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <PH25Innstillinger data={data} />
    </PlayerHQSkall>
  );
}
