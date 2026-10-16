import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { hentSpillerpostTidslinje, medTnSpillerpostData } from "@/lib/domain/tn-post";
import { hentTnGruppeForBruker } from "@/lib/domain/tn-tilgang";
import { TN } from "@/lib/v2/team-norway";
import { TnAvatarInitialer, TnPille } from "@/components/team-norway/core";
import { TnShell, TnSidehode, TnSpillerFaner } from "@/components/team-norway/tn-shell";
import { TnPostKomponer } from "@/components/team-norway/tn-post-komponer";
import { TnPostTidslinje, type TnTidslinjePost } from "@/components/team-norway/tn-post-tidslinje";
import { opprettSpillerpostAction } from "@/app/team-norway/tn-post-actions";

function alder(dateOfBirth: Date | null): string | null {
  if (!dateOfBirth) return null;
  const nå = new Date();
  let alder = nå.getFullYear() - dateOfBirth.getFullYear();
  const enda = nå.getMonth() < dateOfBirth.getMonth() || (nå.getMonth() === dateOfBirth.getMonth() && nå.getDate() < dateOfBirth.getDate());
  if (enda) alder -= 1;
  return `${alder} år`;
}

/**
 * TN-10 Post til enkeltspiller, fanen Post i IUP-en.
 * Fasit: docs/design-system/utkast-tn/spillere.html (pakke 3). «SYNLIG FOR»
 * viser foresatt i selve mottakerlinjen for mindreårige — idrettens
 * åpenhetsprinsipp, ikke et info-ikon å klikke bort.
 * Avvik:
 *   - Tegningen har ingen egen Post-skjerm. Den bruker IUP-fanene og grunnmurens kort.
 */
export default async function SpillerpostPage({ params }: { params: Promise<{ spillerId: string }> }) {
  const { spillerId } = await params;
  const bruker = await requirePortalUser({ allow: ["COACH", "ADMIN", "PLAYER", "PARENT"] });

  const metadata = await medTnSpillerpostData(bruker.id, spillerId, async () => {
    const [spiller, foresatte, gruppe] = await Promise.all([
      prisma.user.findUnique({ where: { id: spillerId, role: "PLAYER", deletedAt: null, anonymisertAt: null }, select: { id: true, name: true, dateOfBirth: true, requiresGuardianConsent: true } }),
      prisma.parentRelation.findMany({ where: { childId: spillerId, approved: true }, select: { parent: { select: { id: true, name: true } } } }),
      hentTnGruppeForBruker(bruker.id),
    ]);
    return spiller && gruppe ? { spiller, foresatte, gruppe } : null;
  });
  if (!metadata) notFound();
  const { spiller, foresatte, gruppe } = metadata;
  const tidslinje = await hentSpillerpostTidslinje(spillerId, bruker.id);
  if (!tidslinje) notFound();

  const erTrenerHer = bruker.id !== spillerId && !foresatte.some((f) => f.parent.id === bruker.id);
  const spillerAlder = alder(spiller.dateOfBirth);

  async function publiserSpillerpost(input: { tekst: string; kind: string }) {
    "use server";
    return opprettSpillerpostAction(spillerId, input);
  }

  const harTrenertilgang = erTrenerHer || bruker.role === "ADMIN";

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
    <TnShell
      aktiv="spillere"
      brukerNavn={bruker.name ?? "Ukjent"}
      rolle={erTrenerHer ? "Trener" : "Spiller/foresatt"}
      groupId={gruppe.id}
      visTrenerflater={harTrenertilgang}
      kanAdministrere={harTrenertilgang}
      tilbake={{ href: "/team-norway/spillere", label: "Spillere" }}
    >
      <TnSidehode
        overlinje={`IUP · ${spiller.name ?? "Ukjent"}`}
        tittel="Post"
        ingress="Poster til utøveren og foresatte, i én tidslinje med lesekvittering."
      />
      <TnSpillerFaner spillerId={spillerId} spillerNavn={spiller.name ?? "Ukjent"} aktiv="post" kanAdministrere={harTrenertilgang} kompakt />

      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", borderRadius: TN.radius.sm, background: TN.white, border: `1px solid ${TN.ink200}`, flexWrap: "wrap" }}>
        <span style={{ fontFamily: TN.font.mono, fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: TN.ink500, flexShrink: 0 }}>Synlig for</span>
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <TnAvatarInitialer navn={spiller.name ?? "?"} size={28} />
          <span style={{ fontSize: 14, fontWeight: 700, color: TN.ink900 }}>{spiller.name}</span>
          <TnPille tone="nøytral">{`Utøver${spillerAlder ? " · " + spillerAlder : ""}`}</TnPille>
        </span>
        {foresatte.map((f) => (
          <span key={f.parent.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <TnAvatarInitialer navn={f.parent.name ?? "?"} size={28} />
            <span style={{ fontSize: 14, fontWeight: 700, color: TN.ink900 }}>{f.parent.name}</span>
            <TnPille tone="nøytral">Foresatt</TnPille>
          </span>
        ))}
        {spiller.requiresGuardianConsent && (
          <span style={{ fontSize: 13, color: TN.ink700, flexBasis: "100%" }}>
            Utøveren er under 18. Foresatt ser hver post i samme øyeblikk den publiseres.
          </span>
        )}
      </div>

      {erTrenerHer && <TnPostKomponer send={publiserSpillerpost} plassholder={`Skriv en post til ${spiller.name?.split(" ")[0] ?? "spilleren"} …`} />}

      <TnPostTidslinje poster={poster} kvitterVedVisning={!erTrenerHer} />
    </TnShell>
  );
}
