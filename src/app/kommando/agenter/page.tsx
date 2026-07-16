import { redirect } from "next/navigation";

/**
 * /kommando/agenter → /admin/agenter (B8, 2026-07-16).
 * Samme AgentChat-komponent, samme /api/kommando/chat-backend — ingen
 * funksjonstap.
 */
export default function KommandoAgenterRedirect(): never {
  redirect("/admin/agenter");
}
