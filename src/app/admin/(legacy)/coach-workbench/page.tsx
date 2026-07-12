import { redirect } from "next/navigation";

/**
 * /admin/coach-workbench → /admin/planlegge (B7, 2026-07-12).
 * Prototypen er erstattet av den ekte coach-workbenchen
 * (/admin/spillere/[id]/workbench); Planlegge er inngangen.
 */
export default function CoachWorkbenchRedirect(): never {
  redirect("/admin/planlegge");
}
