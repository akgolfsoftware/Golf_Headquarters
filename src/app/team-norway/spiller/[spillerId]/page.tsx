import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { hentSpillerpostTidslinje } from "@/lib/domain/tn-post";
import { TN } from "@/lib/v2/team-norway";
import { TnRail, TnAvatarInitialer, TnPille, type TnMenyPunkt } from "@/components/team-norway/core";
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

  const [tidslinje, foresatte] = await Promise.all([
    hentSpillerpostTidslinje(spillerId, bruker.id),
    prisma.parentRelation.findMany({
      where: { childId: spillerId, approved: true },
      select: { parent: { select: { id: true, name: true } } },
    }),
  ]);
  if (!tidslinje) notFound();

  const erTrenerHer = bruker.id !== spillerId && !foresatte.some((f) => f.parent.id === bruker.id);
  const spillerAlder = alder(spiller.dateOfBirth);

  async function publiserSpillerpost(input: { tekst: string; kind: string }) {
    "use server";
    return opprettSpillerpostAction(spillerId, input);
  }

  const punkter: TnMenyPunkt[] = [
    { type: "overskrift", label: "Kommunikasjon" },
    { type: "lenke", label: "Poster til utøver", href: `/team-norway/spiller/${spillerId}`, aktiv: true },
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
      <TnRail punkter={punkter} bruker={{ navn: bruker.name ?? "Ukjent", rolle: erTrenerHer ? "Trener" : "Spiller/foresatt" }} />
      <div style={{ flex: 1, minWidth: 0, padding: "28px 32px", display: "flex", flexDirection: "column", gap: 20, maxWidth: 900 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          <span style={{ width: 4, height: 46, borderRadius: TN.radius.full, background: TN.red600, flexShrink: 0, marginTop: 2 }} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontFamily: TN.font.mono,
                fontSize: TN.text.micro,
                letterSpacing: TN.tracking.eyebrow,
                textTransform: "uppercase",
                color: TN.textSecondary,
              }}
            >
              Denne utøveren
            </div>
            <h1 style={{ fontSize: TN.text.h1, fontWeight: TN.weight.bold, letterSpacing: TN.tracking.heading, color: TN.navy900, margin: "4px 0 0" }}>
              {spiller.name}
            </h1>
          </div>
        </div>

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
          <span style={{ display: "flex", alignItems: "center", gap: 8, background: TN.white, border: `1px solid ${TN.navy100}`, borderRadius: TN.radius.full, padding: "5px 12px 5px 6px" }}>
            <TnAvatarInitialer navn={spiller.name ?? "?"} size={22} />
            <span style={{ fontFamily: TN.font.body, fontSize: TN.text.sm, fontWeight: TN.weight.semibold, color: TN.navy900 }}>{spiller.name}</span>
            <TnPille tone="nøytral">{`UTØVER${spillerAlder ? " · " + spillerAlder : ""}`}</TnPille>
          </span>
          {foresatte.map((f) => (
            <span
              key={f.parent.id}
              style={{ display: "flex", alignItems: "center", gap: 8, background: TN.white, border: `1px solid ${TN.navy100}`, borderRadius: TN.radius.full, padding: "5px 12px 5px 6px" }}
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

        {erTrenerHer && <TnPostKomponer send={publiserSpillerpost} plassholder={`Skriv en post til ${spiller.name?.split(" ")[0] ?? "spilleren"} …`} />}

        <TnPostTidslinje poster={poster} kvitterVedVisning={!erTrenerHer} />
      </div>
    </div>
  );
}
