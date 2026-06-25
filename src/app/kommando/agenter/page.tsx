// Agenter-modul (/kommando/agenter) — chat mot 4 modeller. Gate i layoutet.
// Samtale-id genereres på serveren (én ny samtale per besøk) så klient-
// komponenten holder seg ren (ingen impure-kall i render).

import { randomUUID } from "node:crypto";
import { AgentChat } from "@/components/kommando/agent-chat";

export const dynamic = "force-dynamic";

export default function KommandoAgenterPage() {
  const conversationId = randomUUID();
  return (
    <div className="mx-auto max-w-3xl">
      <AgentChat conversationId={conversationId} />
    </div>
  );
}
