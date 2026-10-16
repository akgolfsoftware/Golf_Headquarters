/**
 * Talent «Min plan» utgår (beslutning 28.09.2026, skjermkontrollen 15.10 funn 16).
 * Innholdet finnes i Målsetninger (/portal/mal); gamle lenker sendes dit.
 */
import { redirect } from "next/navigation";

export default function TalentMinplanRedirect(): never {
  redirect("/portal/mal");
}
