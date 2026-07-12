import { redirect } from "next/navigation";

/**
 * /admin/mer → /admin/agencyos (B7, 2026-07-12).
 * Den gamle mobil-«Mer»-siden er erstattet av Mer-arket i V2Shell-bunnavigasjonen.
 */
export default function MerRedirect(): never {
  redirect("/admin/agencyos");
}
