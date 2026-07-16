import { redirect } from "next/navigation";

/**
 * /kommando/prosjekter → /admin/agent-team (samme mål som /admin/prosjekter,
 * B4 2026-07-12). Ingen funksjonstap.
 */
export default function KommandoProsjekterRedirect(): never {
  redirect("/admin/agent-team");
}
