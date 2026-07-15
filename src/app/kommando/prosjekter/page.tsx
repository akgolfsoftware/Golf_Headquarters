import { permanentRedirect } from "next/navigation";

/**
 * /kommando/prosjekter → /admin/agent-team (2026-07-15).
 * KommandoProject-styring (opprett/arkiver/slett) er montert der via
 * ProjectList, samme mål som /admin/prosjekter og (legacy)/prosjekter.
 */
export default function KommandoProsjekterRedirect(): never {
  permanentRedirect("/admin/agent-team");
}
