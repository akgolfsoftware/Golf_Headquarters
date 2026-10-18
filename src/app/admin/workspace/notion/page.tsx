/**
 * AgencyOS Workspace · Notion-tilkobling — Train-lock (T13-restside,
 * 27.08.2026). Datahenting (ensureNotionConnection/getNotionConnectionForUser)
 * er UENDRET — kun re-skinnet med AdminWorkspaceNotionTrainLock (TL-tokens)
 * i stedet for Paper-inline-JSX.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { ensureNotionConnection } from "@/lib/notion/bootstrap";
import { getNotionConnectionForUser } from "@/lib/notion/client";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { Topp } from "@/components/admin/agencyos-ny/ny";
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
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <div className="agn-s">
        <Topp tilbake={{ href: "/admin/oppsett?fane=integr", tekst: "Oppsett" }} dato="Oppsett · integrasjoner" tittel="Notion"
          ingress="Oppgaver og prosjekter kommer bare fra Notion. Her ser du hvilke databaser som er koblet, og siste synk." />
        <AdminWorkspaceNotionTrainLock data={data} />
      </div>
    </AgencyOSSkall>
  );
}
