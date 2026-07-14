/**
 * AgencyOS — Agenter (flermodell AI-chat), v2.
 * Port av `(legacy)/agenter/page.tsx` (2026-07-14, AgencyOS Bølge 3.12) —
 * ren v2-innramming rundt delt `AgentChat` (`src/components/kommando/`,
 * også brukt av `/kommando/agenter` — IKKE endret, kun re-innrammet her).
 */

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { canAccessMissionControl } from "@/lib/auth/canAccessMissionControl";
import { AgentChat } from "@/components/kommando/agent-chat";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { Caps, Tittel, T } from "@/components/v2";

export const dynamic = "force-dynamic";

export default async function AdminAgenterPage() {
  const user = await canAccessMissionControl();
  if (!user) redirect("/admin");

  const conversationId = randomUUID();

  return (
    <V2Shell nav={AGENCYOS_NAV} navn={user.name ?? "Coach"} avatarUrl={user.avatarUrl}>
      <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: T.gap }}>
        <div>
          <Caps size={9}>AgencyOS · Agenter</Caps>
          <Tittel em="med sin rolle">Snakk</Tittel>
          <p style={{ marginTop: 6, fontFamily: T.ui, fontSize: 13, color: T.mut }}>
            Claude, Gemini, Grok eller Ollama — hver med sin rolle.
          </p>
        </div>
        <AgentChat conversationId={conversationId} />
      </div>
    </V2Shell>
  );
}
