/**
 * AgencyOS Innboks (/admin/innboks) — v10-design.
 *
 * Rendrer <InnboksListe> (v10-fasit fra ag-innboks) med EKTE data via
 * loadInboxScreen (Prisma — DIRECT-tråder mellom coach og spiller/foresatt).
 * mapInnboksData oversetter loaderens InboxThread[]-shape til InnboksData.
 * Tom-tilstand når ingen tråder finnes — aldri liksom-data.
 *
 * Server component. Auth-guard via requirePortalUser (ADMIN/COACH).
 *
 * Bolk (3. juni): byttet fra InboxScreen (3-kolonne gammelt design) til
 * InnboksListe (v10). Komponenten er design-godkjent — her kobles kun data.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { loadInboxScreen } from "@/lib/admin/innboks-data";
import {
  InnboksListe,
  type InnboksData,
} from "@/components/admin/innboks/innboks-liste";

export const dynamic = "force-dynamic";

/**
 * Oversetter ekte InboxScreenProps.threads → v10 InnboksData.
 * DIRECT-tråder er coach↔spiller-samtaler, så type er alltid "melding".
 * href peker til samtalen via ?thread=. Tom-tilstand bevares ([]).
 */
function mapInnboksData(
  props: Awaited<ReturnType<typeof loadInboxScreen>>,
): InnboksData {
  return {
    items: props.threads.map((t) => ({
      id: t.id,
      initials: t.initials,
      sender: t.name ?? "Ukjent",
      type: "melding" as const,
      typeLabel: "MELDING",
      preview: t.preview,
      when: t.when,
      unread: t.unread,
      href: `/admin/innboks?thread=${t.id}`,
    })),
  };
}

export default async function InnboksPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  const props = await loadInboxScreen({ id: user.id, name: user.name }, null);

  return <InnboksListe data={mapInnboksData(props)} />;
}
