/**
 * Kø — ÉN adresse (MASTERPLAN 15.1, beslutning 6.9 «én inngang per funksjon»).
 *
 * Slår sammen fem adresser som alle var «noe som venter på Anders»:
 *   /admin/godkjenninger · /admin/agenticos/ko · /admin/agenticos/godkjenn
 *   /admin/tester/foreslatte · /admin/tournaments/dubletter
 * Alle fem er nå redirects hit. Ingen funksjonalitet er fjernet.
 *
 * MASTERPLAN 15.13 (31.08.2026): en sjette fane, «Moderering», flyttet inn —
 * /admin/stats/moderering hadde ingen vei inn (arkitektur-kartlegging 30.08).
 * Den er også «noe som venter på Anders», så den hører hjemme her. Loaderen
 * er flyttet ORDRETT til src/lib/admin/ko/last-moderering.ts; komponent og
 * actions bor fortsatt i den gamle mappen.
 *
 * IKKE her: /admin/queue (oppfølging av spillere). Den er ikke Kø — Kø er det
 * som krever deg i dag; oppfølging hører i Stall (beslutning 6.6).
 *
 * TILGANG — det viktigste i denne fila: sammenslåing skal ALDRI utvide
 * tilgang. Siden har ADMIN/COACH som basisgate (samme som godkjenninger- og
 * dubletter-sidene hadde), og hver fane som krevde mer, krever det fortsatt:
 * agent-fanene USE_AGENTS, testfanen MANAGE_TESTS. Mangler du capability,
 * finnes fanen ikke — verken som pille eller som innhold, og `?fane=` kan
 * ikke åpne den. Låst av src/lib/admin/ko/faner.test.ts.
 *
 * Design: canvas godkjent av Anders 30.08.2026 —
 * designsystem/canvas/ko/ (artboards) og
 * https://claude.ai/code/artifact/4df52812-fa4f-4654-8564-c46353fe430b
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { canUser } from "@/lib/auth/effective-capabilities";
import { Capability } from "@/lib/auth/cbac";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TL } from "@/lib/v2/train-lock";
import { Icon } from "@/components/v2/icon";
import { KoHode } from "@/components/admin/v2/ko/KoHode";
import { synligeFaner, velgFane } from "@/lib/admin/ko/faner";
import { koFaneTellinger } from "@/lib/admin/ko/tellinger";
import { lastGodkjenninger } from "@/lib/admin/ko/last-godkjenninger";
import { lastForeslatteTester } from "@/lib/admin/ko/last-foreslatte-tester";
import { lastDubletter } from "@/lib/admin/ko/last-dubletter";
import { lastModerering } from "@/lib/admin/ko/last-moderering";
import { lastAgenticosKo, lastAgenticosGodkjenn } from "@/lib/agencyos/last-agenticos";
import { AdminGodkjenningerTrainLock } from "@/components/admin/v2/godkjenninger/AdminGodkjenningerTrainLock";
import { AdminAgenticosKo } from "@/components/admin/v2/agenticos/AdminAgenticosKo";
import { AdminAgenticosGodkjenn } from "@/components/admin/v2/agenticos/AdminAgenticosGodkjenn";
import { AdminForeslatteTesterV2 } from "@/components/admin/v2/AdminForeslatteTesterV2";
import { MergeDubletterListe } from "@/app/admin/tournaments/dubletter/merge-liste";
import { ModeringClientV2 } from "@/components/admin/v2/AdminStatsModereringV2";
import { TlRadGruppe, TlTomTilstand } from "@/components/admin/v2/oppsett/tl-kit";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kø · AgencyOS" };

export default async function KoPage({
  searchParams,
}: {
  searchParams: Promise<{ fane?: string }>;
}) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { fane: onsket } = await searchParams;

  // Effektive capabilities (rolle-default ± per-bruker-overrides), samme kilde
  // som requireCapability bruker — ikke rå rolle.
  const [kanAgenter, kanTester] = await Promise.all([
    canUser(user, Capability.USE_AGENTS),
    canUser(user, Capability.MANAGE_TESTS),
  ]);
  const harCapability = (c: Capability) =>
    c === Capability.USE_AGENTS ? kanAgenter : c === Capability.MANAGE_TESTS ? kanTester : false;

  const faner = synligeFaner(harCapability);
  const aktiv = velgFane(onsket, faner);

  if (aktiv === null) {
    // Skal ikke kunne skje (godkjenninger og dubletter krever ingen capability),
    // men en tom fane-liste skal si ifra, ikke krasje.
    return (
      <V2Shell bredde="full" aktiv="innboks" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"} avatarUrl={user.avatarUrl}>
        <TlRadGruppe>
          <TlTomTilstand
            icon="lock"
            title="Ingen kø-visninger tilgjengelig"
            sub="Kontoen din har ikke tilgang til noen av kø-fanene. Ta kontakt med en administrator."
          />
        </TlRadGruppe>
      </V2Shell>
    );
  }

  const antall = await koFaneTellinger(user, faner);
  const hode = <KoHode faner={faner} aktiv={aktiv} antall={antall} />;

  // Kun den aktive fanen lastes — aldri alle fem.
  if (aktiv === "godkjenninger") {
    const data = await lastGodkjenninger(user);
    return (
      <V2Shell bredde="full" aktiv="innboks" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"} avatarUrl={user.avatarUrl}>
        <AdminGodkjenningerTrainLock data={data} hode={hode} />
      </V2Shell>
    );
  }

  const innhold = await (async () => {
    switch (aktiv) {
      case "agentko": {
        const data = await lastAgenticosKo(user);
        return <AdminAgenticosKo data={data} />;
      }
      case "agentgodkjenn": {
        const data = await lastAgenticosGodkjenn(user);
        return <AdminAgenticosGodkjenn data={data} />;
      }
      case "tester": {
        const data = await lastForeslatteTester();
        return <AdminForeslatteTesterV2 data={data} />;
      }
      case "dubletter": {
        const liste = await lastDubletter();
        if (liste.length === 0) {
          return (
            <TlRadGruppe>
              <TlTomTilstand
                icon="check-circle"
                title="Ingen ventende dubletter"
                sub="Når spillere legger til manuelle turneringer som matcher en kjent kilde, vises de her for vurdering."
              />
            </TlRadGruppe>
          );
        }
        return (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                borderRadius: TL.radius.card,
                background: TL.elev,
                padding: "14px 18px",
              }}
            >
              <Icon name="info" size={16} style={{ color: TL.mute, marginTop: 1, flex: "none" }} />
              <p style={{ fontSize: 12.5, color: TL.mute, margin: 0, lineHeight: 1.6 }}>
                <strong style={{ color: TL.text, fontWeight: 600 }}>Slik fungerer sammenslåing: </strong>
                Når du slår sammen en manuell turnering inn i en kanonisk turnering, flyttes alle påmeldinger,
                resultater og deltakerlister automatisk. Manuell-raden markeres som dublett og forsvinner fra
                hovedlista.
              </p>
            </div>
            <MergeDubletterListe liste={liste} />
          </>
        );
      }
      case "moderering": {
        const { saker, historikk, stats, lasteFeil } = await lastModerering();
        return <ModeringClientV2 saker={saker} historikk={historikk} stats={stats} lasteFeil={lasteFeil} />;
      }
    }
  })();

  return (
    <V2Shell bredde="full" aktiv="innboks" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"} avatarUrl={user.avatarUrl}>
      <div style={{ display: "flex", flexDirection: "column", gap: 18, minWidth: 0 }}>
        {hode}
        {innhold}
      </div>
    </V2Shell>
  );
}
