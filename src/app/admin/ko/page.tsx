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

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { innboksHref } from "@/lib/admin/innboks/filter";
import { canUser } from "@/lib/auth/effective-capabilities";
import { Capability } from "@/lib/auth/cbac";
import { Lock, CircleCheck } from "lucide-react";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { TomTilstand } from "@/components/precision/pa";
import { Side } from "@/components/precision/pa-a4";
import { InlineVarsel } from "@/components/precision/pa-a5";
import { TL_SCOPE } from "@/components/workbench/wb-tl-scope";
import { AG04RestHode } from "@/components/admin/precision/AG04RestHode";
import { synligeFaner, velgFane, koHref } from "@/lib/admin/ko/faner";
import { koFaneTellinger } from "@/lib/admin/ko/tellinger";
import { lastForeslatteTester } from "@/lib/admin/ko/last-foreslatte-tester";
import { lastDubletter } from "@/lib/admin/ko/last-dubletter";
import { lastModerering } from "@/lib/admin/ko/last-moderering";
import { lastAgenticosKo, lastAgenticosGodkjenn } from "@/lib/agencyos/last-agenticos";
import { AdminAgenticosKo } from "@/components/admin/v2/agenticos/AdminAgenticosKo";
import { AdminAgenticosGodkjenn } from "@/components/admin/v2/agenticos/AdminAgenticosGodkjenn";
import { AdminForeslatteTesterV2 } from "@/components/admin/v2/AdminForeslatteTesterV2";
import { MergeDubletterListe } from "@/app/admin/tournaments/dubletter/merge-liste";
import { ModeringClientV2 } from "@/components/admin/v2/AdminStatsModereringV2";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kø · AgencyOS" };

export default async function KoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const sp = await searchParams;
  const onsket = Array.isArray(sp.fane) ? sp.fane[0] : sp.fane;

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
      <AgencyOSSkall navn={user.name ?? "Coach"}>
        <Side>
          <TomTilstand icon={Lock} title="Ingen kø-visninger tilgjengelig" text="Kontoen din har ikke tilgang til noen av kø-fanene. Ta kontakt med en administrator." />
        </Side>
      </AgencyOSSkall>
    );
  }

  // Godkjenninger er slått inn i Innboks › Godkjenn (AG-04, «Én innboks»,
  // 28.09.2026): samme laster, samme handlinger, lav risiko samlet,
  // ukesrapport og løste sjekkpunkter. De andre Kø-fanene har ingen tegning i
  // Innboks og står her uendret; Innboks lenker til dem under «Andre køer».
  if (aktiv === "godkjenninger") {
    const { fane: _fane, ...ovrige } = sp;
    void _fane;
    redirect(innboksHref("godkjenn", ovrige));
  }

  const antall = await koFaneTellinger(user, faner);
  const hode = (
    <AG04RestHode
      kicker="Innboks · Kø"
      title="Kø"
      sub="Alt som krever deg i dag. Én adresse — fanene bytter innhold, ikke side."
      faner={faner.map((f) => ({ id: f.id, label: f.label, href: koHref(f.id) }))}
      aktiv={aktiv}
      antall={antall}
    />
  );

  // Kun den aktive fanen lastes — aldri alle fem.

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
            <TomTilstand
              icon={CircleCheck}
              title="Ingen ventende dubletter"
              text="Når spillere legger til manuelle turneringer som matcher en kjent kilde, vises de her for vurdering."
            />
          );
        }
        return (
          <>
            <InlineVarsel tittel="Slik fungerer sammenslåing.">
              Når du slår sammen en manuell turnering inn i en kanonisk turnering, flyttes alle påmeldinger, resultater og
              deltakerlister automatisk. Manuell-raden markeres som dublett og forsvinner fra hovedlista.
            </InlineVarsel>
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

  // Innholdet i fanene er fortsatt Train-lock-komponenter (ingen tegning) og
  // ligger i TL_SCOPE, som i Kalender. Sidehode og faner er Precision.
  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <Side>
        {hode}
        <div style={{ ...TL_SCOPE, display: "flex", flexDirection: "column", gap: 18, minWidth: 0 }}>{innhold}</div>
      </Side>
    </AgencyOSSkall>
  );
}
