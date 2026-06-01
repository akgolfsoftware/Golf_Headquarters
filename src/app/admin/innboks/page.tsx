/**
 * AgencyOS Innboks (/admin/innboks) — kommunikasjons-cockpit.
 * Pixel-port av design-prompt skjerm 6 (SKJERMER-RUNDE-4-AGENCYOS-...).
 *
 * 3-kolonne: trådliste / samtale / kontekst. Server Component med live
 * Prisma-data via loadInboxScreen. Aktiv tråd styres av ?thread=.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { InboxScreen } from "@/components/admin/innboks/inbox-screen";
import { loadInboxScreen } from "@/lib/admin/innboks-data";

export const dynamic = "force-dynamic";

type Search = { thread?: string };

export default async function InnboksPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { thread } = await searchParams;
  const props = await loadInboxScreen(
    { id: user.id, name: user.name },
    thread ?? null,
  );
  return <InboxScreen {...props} />;
}
