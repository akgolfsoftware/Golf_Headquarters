import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { hentGruppeDokumenter, hentViewerRolleIGruppe } from "@/lib/domain/tn-post";
import { TN } from "@/lib/v2/team-norway";
import { TnRail, type TnMenyPunkt } from "@/components/team-norway/core";
import { TnDokumentOpplasting } from "@/components/team-norway/tn-dokument-opplasting";
import { TnDokumentTabell, type TnDokumentRadVisning } from "@/components/team-norway/tn-dokument-tabell";
import { opprettGruppeDokumentAction } from "@/app/team-norway/tn-post-actions";

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

  async function lastOppDokument(form: FormData) {
    "use server";
    return opprettGruppeDokumentAction(groupId, form);
  }

  const punkter: TnMenyPunkt[] = [
    { type: "overskrift", label: "Kommunikasjon" },
    { type: "lenke", label: "Gruppeposter", href: `/team-norway/${groupId}` },
    { type: "lenke", label: "Dokumenter", href: `/team-norway/${groupId}/dokumenter`, aktiv: true },
  ];

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
    <div style={{ display: "flex", minHeight: "100vh", background: TN.surfacePage, fontFamily: TN.font.body }}>
      <TnRail
        punkter={punkter}
        bruker={{ navn: bruker.name ?? "Ukjent", rolle: rolle === "TRENER" ? "Trener" : rolle === "SPILLER" ? "Spiller" : "Foresatt" }}
      />
      <div style={{ flex: 1, minWidth: 0, padding: "28px 32px", display: "flex", flexDirection: "column", gap: 20, maxWidth: 900 }}>
        <div>
          <div
            style={{
              fontFamily: TN.font.mono,
              fontSize: TN.text.micro,
              letterSpacing: TN.tracking.eyebrow,
              textTransform: "uppercase",
              color: TN.textSecondary,
            }}
          >
            Dokumenter · {gruppe.name}
          </div>
          <h1 style={{ fontSize: TN.text.h1, fontWeight: TN.weight.bold, letterSpacing: TN.tracking.heading, color: TN.navy900, margin: "4px 0 0" }}>
            Delte filer
          </h1>
        </div>

        {rolle === "TRENER" && <TnDokumentOpplasting last={lastOppDokument} />}

        <TnDokumentTabell rader={rader} />

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
      </div>
    </div>
  );
}
