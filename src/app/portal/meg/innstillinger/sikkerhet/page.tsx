import { redirect } from "next/navigation";

// /portal/meg/innstillinger/sikkerhet er en kategori-link fra Innstillinger-overview.
// Selve sikkerhetssiden ligger på /portal/meg/sikkerhet (med 2FA-flyt etc.).
export default function SikkerhetRedirect() {
  redirect("/portal/meg/sikkerhet");
}
