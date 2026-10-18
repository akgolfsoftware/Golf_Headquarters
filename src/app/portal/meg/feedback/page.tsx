// Pakke 15 (utkast hjelp.html, 16.10.2026): tilbakemelding er slått sammen med kontakt til «Skriv til oss».
import { redirect } from "next/navigation";

export default function Videresend() {
  redirect("/portal/meg/help/kontakt?type=forslag");
}
