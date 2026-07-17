import { redirect } from "next/navigation";

/**
 * /admin/messages (gammel adresse) → /admin/innboks.
 * Innboksen er kanonisk melding-flate i AgencyOS.
 */
export default function MessagesRedirect(): never {
  redirect("/admin/innboks");
}
