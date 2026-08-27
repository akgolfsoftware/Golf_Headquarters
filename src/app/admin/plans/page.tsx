import { permanentRedirect } from "next/navigation";

/**
 * Gammel adresse — pensjonert til fordel for AG-06 Plan-hub
 * (`/admin/planlegge`, Train-lock). Se `AGENCYOS_SKALL_TABS` i
 * `src/components/v2/shell.tsx` («Workbench» peker allerede dit).
 */
export default function AdminPlansRedirect() {
  permanentRedirect("/admin/planlegge");
}
