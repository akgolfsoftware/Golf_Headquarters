/**
 * Gammel co-agent-rute. Caddie-samtalen bor i Jarvis, fane «Samtale» (AG-19).
 */
import { permanentRedirect } from "next/navigation";

export default function CaddieRedirect() {
  permanentRedirect("/admin/jarvis?fane=samtale");
}
