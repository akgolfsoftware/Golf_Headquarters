/**
 * Talent «Roadmap» utgår (beslutning 28.09.2026, skjermkontrollen 15.10 funn 16).
 * Innholdet finnes i Plan (/portal/planlegge), som viser periodene i årsplanen; gamle lenker sendes dit.
 */
import { redirect } from "next/navigation";

export default function TalentRoadmapRedirect(): never {
  redirect("/portal/planlegge");
}
