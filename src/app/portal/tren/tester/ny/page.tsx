/**
 * PlayerHQ · Tren · Tester · Ny test (/portal/tren/tester/ny) — v2.
 * v2-port 17. juli 2026 (Team D2): `NyTestV2` erstatter legacy NyTestWizard,
 * ruten flyttet ut av (legacy). Auth, testliste-spørringen og siste-resultat-
 * uttrekket (for delta i bekreft-steget) er uendret; server action `logTest`
 * er flyttet byte-identisk til ./actions.ts. Underruten /ny/egen er utenfor
 * denne porten og ligger fortsatt i (legacy).
 */
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TilbakeLenke, Caps, Tittel, T } from "@/components/v2";
import { NyTestV2 } from "@/components/portal/v2/NyTestV2";

export default async function NyTestPage() {
  const user = await requirePortalUser();

  const tests = await prisma.testDefinition.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      pyramidArea: true,
      description: true,
    },
  });

  // Siste resultat per test for å vise delta i bekreft-steget.
  const sisteResultater = await prisma.testResult.findMany({
    where: { userId: user.id },
    orderBy: { takenAt: "desc" },
    select: { testId: true, score: true, takenAt: true },
  });
  const sistePerTest = new Map<string, { score: number; takenAt: string }>();
  for (const r of sisteResultater) {
    if (!sistePerTest.has(r.testId)) {
      sistePerTest.set(r.testId, {
        score: r.score,
        takenAt: r.takenAt.toISOString(),
      });
    }
  }

  return (
    <V2Shell aktiv="gjor" nav={PLAYERHQ_NAV} navn={user.name ?? undefined} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/tren/tester">Tilbake til tester</TilbakeLenke>
      <div style={{ maxWidth: 720, width: "100%", margin: "0 auto" }}>
        <Caps>Trening · Tester</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="ny test">Logg</Tittel>
        </div>
        <p style={{ fontFamily: T.ui, fontSize: 13, color: T.mut, lineHeight: 1.55, margin: "10px 0 0" }}>
          Gå gjennom de fire stegene — type, detaljer, resultat og bekreft
          {user.name ? `, ${user.name.split(" ")[0]}` : ""}.
        </p>
      </div>
      <NyTestV2
        tests={tests}
        sistePerTest={Object.fromEntries(sistePerTest)}
        spillerNavn={user.name ?? "Spiller"}
      />
    </V2Shell>
  );
}
