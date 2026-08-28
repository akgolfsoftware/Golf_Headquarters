/**
 * Gammel co-agent-rute. T12: inn i AgenticOS.
 */
import { permanentRedirect } from "next/navigation";

export default function CaddieRedirect() {
  permanentRedirect("/admin/agenticos");
}
