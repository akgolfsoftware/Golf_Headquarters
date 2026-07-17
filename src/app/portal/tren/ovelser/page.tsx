import { redirect } from "next/navigation";

/**
 * /portal/tren/ovelser (gammel adresse) → /portal/drills.
 * Øvelsesbanken er kanonisk på /portal/drills.
 */
export default function OvelserRedirect(): never {
  redirect("/portal/drills");
}
