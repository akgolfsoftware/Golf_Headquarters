import { notFound } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { hentEgenTrenerdeling } from "@/lib/deling/navngitt";
import { hentTnSpillergrupper } from "@/lib/deling/team-norway-spiller";
import { tilWagrId } from "@/lib/domain/tn-iup-oversikt-regler";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { TnInnsynSpiller } from "@/components/portal/precision/TnInnsynSpiller";

export const dynamic = "force-dynamic";
export const metadata = { title: "Se hva Team Norway ser · PlayerHQ" };

/** «Se hva Team Norway ser» for spillere i en Team Norway-gruppe. Alle andre får 404. */
export default async function TnInnsynPage() {
  const bruker = await requirePortalUser({ allow: ["PLAYER"], kreverTilgang: "INGEN" });
  const grupper = await hentTnSpillergrupper(bruker.id);
  if (grupper.length === 0) notFound();

  const [meg, deling] = await Promise.all([
    prisma.user.findUnique({ where: { id: bruker.id }, select: { name: true, homeClub: true, dateOfBirth: true, publicPlayer: { select: { wagrId: true } } } }),
    hentEgenTrenerdeling().catch(() => null),
  ]);
  const wagrId = tilWagrId(meg?.publicPlayer?.wagrId);
  const wagr = wagrId === null ? null : await prisma.wagrRefPlayer.findUnique({ where: { wagrPlayerId: wagrId }, select: { rank: true } });
  const tnNavn = new Set(grupper.map((g) => g.navn));
  const trenere = (deling?.invitasjoner ?? []).filter((r) => r.status === "AKTIV" && tnNavn.has(r.gruppeNavn)).map((r) => r.epost);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <TnInnsynSpiller
        data={{
          grupper,
          navn: meg?.name ?? bruker.name ?? "—",
          klubb: meg?.homeClub ?? null,
          fodselsaar: meg?.dateOfBirth ? meg.dateOfBirth.getUTCFullYear() : null,
          wagrPlass: wagr?.rank ?? null,
          trenere,
        }}
      />
    </PlayerHQSkall>
  );
}
