/**
 * T12: «Tildelt meg» samles i godkjenningskøen.
 */
import { permanentRedirect } from "next/navigation";

export default function TildeltMegRedirect() {
  permanentRedirect("/admin/godkjenninger");
}
