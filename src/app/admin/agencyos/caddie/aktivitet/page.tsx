/**
 * T12: Caddie-aktivitet foldet inn i AgenticOS.
 */
import { permanentRedirect } from "next/navigation";

export default function CaddieAktivitetRedirect() {
  permanentRedirect("/admin/agenticos");
}
