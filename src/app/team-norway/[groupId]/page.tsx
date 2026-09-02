import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { hentGruppetidslinje, hentViewerRolleIGruppe } from "@/lib/domain/tn-post";
import { TN } from "@/lib/v2/team-norway";
import { TnRail, type TnMenyPunkt } from "@/components/team-norway/core";
import { TnPostKomponer } from "@/components/team-norway/tn-post-komponer";
import { TnPostTidslinje, type TnTidslinjePost } from "@/components/team-norway/tn-post-tidslinje";
import { opprettGruppepostAction } from "@/app/team-norway/tn-post-actions";

/**
 * TN-09 Gruppeposter — designfasit designsystem/team-norway/templates/tn-gruppeposter/.
 * Oppslagstavle for hele gruppen. Kun trenere (TRENER-rolle) ser komponer-
 * feltet; spillere/foresatte ser tidslinjen og kvitterer ved visning.
 */
export default async function GruppepostPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const bruker = await requirePortalUser({ allow: ["COACH", "ADMIN", "PLAYER", "PARENT"] });

  const [gruppe, rolle] = await Promise.all([
    prisma.group.findUnique({ where: { id: groupId }, select: { id: true, name: true } }),
    hentViewerRolleIGruppe(groupId, bruker.id),
  ]);
  if (!gruppe || !rolle) notFound();

  const tidslinje = await hentGruppetidslinje(groupId, bruker.id);
  if (!tidslinje) notFound();

  async function publiserGruppepost(input: { tekst: string; kind: string }) {
    "use server";
    return opprettGruppepostAction(groupId, input);
  }

  const punkter: TnMenyPunkt[] = [
    { type: "overskrift", label: "Kommunikasjon" },
    { type: "lenke", label: "Gruppeposter", href: `/team-norway/${groupId}`, aktiv: true },
    { type: "lenke", label: "Dokumenter", href: `/team-norway/${groupId}/dokumenter` },
  ];

  const poster: TnTidslinjePost[] = tidslinje.map((p) => ({
    id: p.id,
    authorNavn: p.authorNavn,
    createdAtIso: p.createdAt.toISOString(),
    kind: p.kind,
    tekst: p.tekst,
    vedlegg: p.vedlegg.map((v) => ({ id: v.id, fileName: v.fileName, fileType: v.fileType })),
    kvittering: p.kvittering ? { totalt: p.kvittering.totalt, apnet: p.kvittering.apnet } : null,
  }));

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: TN.surfacePage, fontFamily: TN.font.body }}>
      <TnRail punkter={punkter} bruker={{ navn: bruker.name ?? "Ukjent", rolle: rolle === "TRENER" ? "Trener" : rolle === "SPILLER" ? "Spiller" : "Foresatt" }} />
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
            Gruppe
          </div>
          <h1 style={{ fontSize: TN.text.h1, fontWeight: TN.weight.bold, letterSpacing: TN.tracking.heading, color: TN.navy900, margin: "4px 0 0" }}>
            {gruppe.name}
          </h1>
        </div>

        {rolle === "TRENER" && <TnPostKomponer send={publiserGruppepost} plassholder="Skriv en post til gruppen …" />}

        <TnPostTidslinje poster={poster} kvitterVedVisning={rolle !== "TRENER"} />
      </div>
    </div>
  );
}
