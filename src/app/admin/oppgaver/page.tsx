/**
 * Oppgaver — ÉN adresse (MASTERPLAN 15.2, beslutning 6.6 + 6.9).
 *
 * Slår sammen tre adresser: `/admin/workspace/prosjekter`,
 * `/admin/handlingssenter` og `/admin/workspace` (huben som pekte på begge).
 * Alle består som redirects.
 *
 * SKILLET MOT KØ ER TID (beslutning 6.6): Kø er alt som krever Anders i dag.
 * Oppgaver er prosjektstyring og faste rutiner — det som går på skinner.
 *
 * TILGANG: siden gater ADMIN/COACH, som handlingssenteret gjorde. Prosjekter
 * gatet på ADMIN ALENE, og fanen arver det — en sammenslåing skal aldri
 * utvide tilgang. En coach ser to faner, ikke tre, og `?fane=prosjekter` kan
 * ikke åpnes. Låst av src/lib/admin/oppgaver/faner.test.ts.
 *
 * IKKE her: `/admin/workspace/notion` er Notion-TILKOBLINGEN — en integrasjon,
 * ikke en oppgave. Den hører i Oppsett (MASTERPLAN 15.3, «Integrasjoner») og
 * beholder adressen sin til den bygges. Å tvinge den inn her ville gitt to
 * steder for integrasjoner, som er nøyaktig det 6.9 skal fjerne.
 *
 * Design: canvas godkjent av Anders 30.08.2026 —
 * `designsystem/canvas/agencyos-ia/Oppgaver.dc.html`.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { OppgaverHode } from "@/components/admin/v2/oppgaver/OppgaverHode";
import { RutinerListe } from "@/components/admin/v2/oppgaver/RutinerListe";
import { AdminWorkspaceProsjekterTrainLock } from "@/components/admin/v2/workspace/AdminWorkspaceProsjekterTrainLock";
import { AdminHandlingssenterV2 } from "@/components/admin/v2/AdminHandlingssenterV2";
import {
  synligeOppgaveFaner,
  velgOppgaveFane,
} from "@/lib/admin/oppgaver/faner";
import {
  erProsjektFilter,
  lastProsjekter,
  lastRutiner,
  lastTildeltMeg,
  oppgaveFaneTellinger,
} from "@/lib/admin/oppgaver/lastere";

export const dynamic = "force-dynamic";
export const metadata = { title: "Oppgaver · AgencyOS" };

export default async function OppgaverPage({
  searchParams,
}: {
  searchParams: Promise<{ fane?: string; filter?: string }>;
}) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { fane: onsket, filter: onsketFilter } = await searchParams;

  const faner = synligeOppgaveFaner(user.role === "ADMIN");
  const aktiv = velgOppgaveFane(onsket, faner);
  const antall = await oppgaveFaneTellinger(user.id, faner);

  const innhold = await (async () => {
    switch (aktiv) {
      case "prosjekter": {
        const prosjekter = await lastProsjekter();
        return (
          <AdminWorkspaceProsjekterTrainLock
            prosjekter={prosjekter}
            filter={erProsjektFilter(onsketFilter) ? onsketFilter : "alle"}
            somFane
          />
        );
      }
      case "rutiner": {
        const rutiner = await lastRutiner(user.id);
        return <RutinerListe rutiner={rutiner} />;
      }
      case "tildelt": {
        const data = await lastTildeltMeg();
        return <AdminHandlingssenterV2 data={data} meg={user.name} somFane />;
      }
    }
  })();

  return (
    <V2Shell
      bredde="full"
      aktiv="cockpit"
      nav={AGENCYOS_NAV}
      navn={user.name ?? "Coach"}
      avatarUrl={user.avatarUrl}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 18, minWidth: 0 }}>
        <OppgaverHode faner={faner} aktiv={aktiv} antall={antall} />
        {innhold}
      </div>
    </V2Shell>
  );
}
