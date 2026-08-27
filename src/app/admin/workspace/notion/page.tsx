/**
 * AgencyOS Workspace · Notion-tilkobling — Train-lock (T13-restside,
 * 27.08.2026). Datahenting (ensureNotionConnection/getNotionConnectionForUser)
 * er UENDRET — kun re-skinnet med AdminWorkspaceNotionTrainLock (TL-tokens)
 * i stedet for Paper-inline-JSX.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { ensureNotionConnection } from "@/lib/notion/bootstrap";
import { getNotionConnectionForUser } from "@/lib/notion/client";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TlTilbake } from "@/components/admin/v2/oppsett/tl-kit";
import {
  AdminWorkspaceNotionTrainLock,
  type AdminWorkspaceNotionData,
} from "@/components/admin/v2/workspace/AdminWorkspaceNotionTrainLock";

export const dynamic = "force-dynamic";

export default async function WorkspaceNotionPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string; error?: string }>;
}) {
  const user = await requirePortalUser({ allow: ["ADMIN"] });

  await ensureNotionConnection(user.id, user.role);

  const sp = await searchParams;
  const isAdmin = user.role === "ADMIN";
  const hasInternalToken = Boolean(process.env.NOTION_INTERNAL_TOKEN);
  const connection = isAdmin ? await getNotionConnectionForUser(user.id) : null;

  const realState: "empty" | "connected" = connection ? "connected" : "empty";
  const tilstand =
    process.env.NODE_ENV !== "production" && sp.state ? (sp.state === "connected" ? "connected" : "empty") : realState;

  const data: AdminWorkspaceNotionData = {
    tilstand,
    isAdmin,
    harInternalToken: hasInternalToken,
    feilmelding: sp.error ?? null,
    workspaceName: connection?.workspaceName ?? "Notion workspace",
    tilkobletSiden: connection?.createdAt ?? null,
    sistSynket: connection?.lastSyncAt ?? null,
    databaser: connection?.databases ?? [],
  };

  return (
    <V2Shell bredde="kolonne" aktiv="cockpit" nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TlTilbake href="/admin/workspace">Workspace</TlTilbake>
      <AdminWorkspaceNotionTrainLock data={data} />
    </V2Shell>
  );
}
