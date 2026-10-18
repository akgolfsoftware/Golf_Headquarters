// Pakke 14 (utkast meg-resten.html, 16.10.2026): avslutning skjer i dialogen «Avslutte …» i Abonnement (cancelPro i actions.ts).
import { redirect } from "next/navigation";

export default function Videresend() {
  redirect("/portal/meg/abonnement");
}
