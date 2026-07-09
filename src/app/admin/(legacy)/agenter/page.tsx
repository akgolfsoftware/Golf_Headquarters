// AgencyOS · Agenter — flermodell AI-chat (merget inn fra kommandosenteret).
// ADMIN-only; gjenbruker AgentChat-komponenten. Samtale-id genereres på serveren.

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { canAccessMissionControl } from "@/lib/auth/canAccessMissionControl";
import { AgentChat } from "@/components/kommando/agent-chat";

export const dynamic = "force-dynamic";

export default async function AdminAgenterPage() {
  const user = await canAccessMissionControl();
  if (!user) redirect("/admin");

  const conversationId = randomUUID();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-1 font-display text-2xl font-bold tracking-[-0.02em] text-foreground">Agenter</h1>
      <p className="mb-5 text-sm text-muted-foreground">
        Snakk med Claude, Gemini, Grok eller Ollama — hver med sin rolle.
      </p>
      <AgentChat conversationId={conversationId} />
    </div>
  );
}
