import { redirect } from "next/navigation";

/**
 * /admin/organisasjon (hub) → /admin/settings (B7, 2026-07-12).
 * Org-hubben var en lenkeside; Innstillinger har Organisasjon/Team/Tilgang-faner
 * og Mer-menyen dekker resten (Team, Klubb, Integrasjoner).
 */
export default function OrganisasjonRedirect(): never {
  redirect("/admin/settings");
}
