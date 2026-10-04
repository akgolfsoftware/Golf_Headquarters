/**
 * PH-26 Utenfor banen utgår (IA 28.09.2026, docs/design-handoff/regler/skjermliste.md).
 * Fysisk trening ligger i Plan; venner og utfordringer ligger i Meg.
 * Den gamle adressen sender videre til Meg.
 */

import { redirect } from "next/navigation";

export default function UtenforBanenPage(): never {
  redirect("/portal/meg");
}
