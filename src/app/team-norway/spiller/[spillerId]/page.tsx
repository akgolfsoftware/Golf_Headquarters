import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { hentSpillerpostTidslinje } from "@/lib/domain/tn-post";
import { TN } from "@/lib/v2/team-norway";
import { TnAvatarInitialer, TnPille } from "@/components/team-norway/core";
import { TnShell, TnSidehode } from "@/components/team-norway/tn-shell";
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
 * TN-10 Post til enkeltspiller — designfasit
 * designsystem/team-norway/templates/tn-post-enkeltspiller/. «SYNLIG FOR»
 * viser foresatt i selve mottakerlinjen for mindreårige — idrettens
 * åpenhetsprinsipp, ikke et info-ikon å klikke bort.
 */
export default async function SpillerpostPage({ params }: { params: Promise<{ spillerId: string }> }) {
  const { spillerId } = await params;
  const bruker = await requirePortalUser({ allow: ["COACH", "ADMIN", "PLAYER", "PARENT"] });

  const spiller = await prisma.user.findUnique({
    where: { id: spillerId, role: "PLAYER" },
    select: { id: true, name: true, dateOfBirth: true, requiresGuardianConsent: true },
  });
  if (!spiller) notFound();

  const [tidslinje, foresatte, gruppe] = await Promise.all([
    hentSpillerpostTidslinje(spillerId, bruker.id),
    prisma.parentRelation.findMany({
      where: { childId: spillerId, approved: true },
      select: { parent: { select: { id: true, name: true } } },
    }),
    prisma.group.findUnique({ where: { slug: "team-norway" }, select: { id: true } }),
  ]);
  if (!tidslinje || !gruppe) notFound();

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
    >
      <TnSidehode
        overlinje="Denne utøveren"
        tittel={spiller.name ?? "Ukjent"}
        ingress="Poster til utøveren og foresatte, i én tidslinje med lesekvittering."
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 14px",
          borderRadius: TN.radius.md,
          background: TN.navy50,
          border: `1px solid ${TN.navy100}`,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontFamily: TN.font.mono,
            fontSize: TN.text.micro,
            fontWeight: TN.weight.semibold,
            letterSpacing: TN.tracking.eyebrow,
            textTransform: "uppercase",
            color: TN.navy700,
            flexShrink: 0,
          }}
        >
          Synlig for
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 8, background: TN.white, border: `1px solid ${TN.navy100}`, borderRadius: TN.radius.sm, padding: "5px 12px 5px 6px" }}>
          <TnAvatarInitialer navn={spiller.name ?? "?"} size={22} />
          <span style={{ fontFamily: TN.font.body, fontSize: TN.text.sm, fontWeight: TN.weight.semibold, color: TN.navy900 }}>{spiller.name}</span>
          <TnPille tone="nøytral">{`UTØVER${spillerAlder ? " · " + spillerAlder : ""}`}</TnPille>
        </span>
        {foresatte.map((f) => (
          <span
            key={f.parent.id}
            style={{ display: "flex", alignItems: "center", gap: 8, background: TN.white, border: `1px solid ${TN.navy100}`, borderRadius: TN.radius.sm, padding: "5px 12px 5px 6px" }}
          >
            <TnAvatarInitialer navn={f.parent.name ?? "?"} size={22} />
            <span style={{ fontFamily: TN.font.body, fontSize: TN.text.sm, fontWeight: TN.weight.semibold, color: TN.navy900 }}>{f.parent.name}</span>
            <TnPille tone="nøytral">FORESATT</TnPille>
          </span>
        ))}
        {spiller.requiresGuardianConsent && (
          <span style={{ fontSize: TN.text.xs, color: TN.navy700, flexShrink: 0 }}>
            Utøveren er under 18. Foresatt ser hver post i samme øyeblikk den publiseres.
          </span>
        )}
      </div>

      {/* TN-utvidelse 14.09.2026: tydelig fane tilbake til spillerens
          faste inngang — post er ikke lenger eneste vei inn på spilleren. */}
      <nav aria-label="Spillerfaner" style={{ display: "flex", gap: 4, flexWrap: "wrap", borderBottom: `1px solid ${TN.navy100}` }}>
        <Link href={`/team-norway/spiller/${spillerId}/oversikt`} style={{ minHeight: 44, display: "inline-flex", alignItems: "center", padding: "0 14px", fontSize: TN.text.sm, fontWeight: TN.weight.semibold, color: TN.textSecondary, borderBottom: "2px solid transparent", textDecoration: "none" }}>Oversikt</Link>
        <span aria-current="page" style={{ minHeight: 44, display: "inline-flex", alignItems: "center", padding: "0 14px", fontSize: TN.text.sm, fontWeight: TN.weight.bold, color: TN.navy900, borderBottom: `2px solid ${TN.navy900}` }}>Post</span>
        <Link href={`/team-norway/spiller/${spillerId}/tester`} style={{ minHeight: 44, display: "inline-flex", alignItems: "center", padding: "0 14px", fontSize: TN.text.sm, fontWeight: TN.weight.semibold, color: TN.textSecondary, borderBottom: "2px solid transparent", textDecoration: "none" }}>Tester</Link>
        <Link href={`/team-norway/spiller/${spillerId}/analyse`} style={{ minHeight: 44, display: "inline-flex", alignItems: "center", padding: "0 14px", fontSize: TN.text.sm, fontWeight: TN.weight.semibold, color: TN.textSecondary, borderBottom: "2px solid transparent", textDecoration: "none" }}>Analyse</Link>
      </nav>

      {erTrenerHer && <TnPostKomponer send={publiserSpillerpost} plassholder={`Skriv en post til ${spiller.name?.split(" ")[0] ?? "spilleren"} …`} />}

      <TnPostTidslinje poster={poster} kvitterVedVisning={!erTrenerHer} />
    </TnShell>
  );
}
