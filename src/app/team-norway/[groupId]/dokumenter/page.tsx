import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { hentGruppeDokumenter, hentViewerRolleIGruppe } from "@/lib/domain/tn-post";
import { TN } from "@/lib/v2/team-norway";
import { TnShell, TnSidehode } from "@/components/team-norway/tn-shell";
import { TnDokumentOpplasting } from "@/components/team-norway/tn-dokument-opplasting";
import { TnDokumentTabell, type TnDokumentRadVisning } from "@/components/team-norway/tn-dokument-tabell";

/**
 * TN-11 Dokumentdeling — designfasit
 * designsystem/team-norway/templates/tn-dokumentdeling/. Aggregerer vedlegg
 * fra tekstposter («FRA POST») og frittstående opplastinger («LASTET OPP»)
 * i samme liste, med lesekvittering per fil.
 */
export default async function DokumenterPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const bruker = await requirePortalUser({ allow: ["COACH", "ADMIN", "PLAYER", "PARENT"] });

  const [gruppe, rolle] = await Promise.all([
    prisma.group.findUnique({ where: { id: groupId }, select: { id: true, name: true } }),
    hentViewerRolleIGruppe(groupId, bruker.id),
  ]);
  if (!gruppe || !rolle) notFound();

  const dokumenter = await hentGruppeDokumenter(groupId, bruker.id);
  if (!dokumenter) notFound();

  const erTrener = rolle === "TRENER" || bruker.role === "ADMIN";

  const rader: TnDokumentRadVisning[] = dokumenter.map((d) => ({
    attachmentId: d.attachmentId,
    fileName: d.fileName,
    fileType: d.fileType,
    fileSize: d.fileSize,
    opplasterNavn: d.opplasterNavn,
    oppdatertIso: d.oppdatert.toISOString(),
    kilde: d.kilde,
    postId: d.postId,
    totalt: d.kvittering.totalt,
    apnet: d.kvittering.apnet,
  }));

  return (
    <TnShell
      aktiv="dokumenter"
      brukerNavn={bruker.name ?? "Ukjent"}
      rolle={rolle === "TRENER" ? "Trener" : rolle === "SPILLER" ? "Spiller" : "Foresatt"}
      groupId={groupId}
      visTrenerflater={erTrener}
      kanAdministrere={erTrener}
    >
      <TnSidehode
        overlinje={`Dokumenter · ${gruppe.name}`}
        tittel="Delte filer"
        ingress="Vedlegg fra poster og frittstående opplastinger i samme liste, med lesekvittering per fil."
      />

      {rolle === "TRENER" && <TnDokumentOpplasting groupId={groupId} />}

      <TnDokumentTabell rader={rader} visSeHvem={rolle === "TRENER"} />

      <div
        style={{
          background: TN.navy50,
          border: `1px solid ${TN.navy100}`,
          borderRadius: TN.radius.md,
          padding: "12px 16px",
          fontFamily: TN.font.body,
          fontSize: TN.text.sm,
          color: TN.navy900,
          lineHeight: TN.leading.normal,
        }}
      >
        Utøvere under 18 står med fornavn og etternavn her — denne flaten ses av gruppens medlemmer og foresatte.
      </div>
    </TnShell>
  );
}
