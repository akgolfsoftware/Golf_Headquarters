/**
 * T12: Caddie-chat er nedlagt — foldet inn i Jarvis-fanen (AgenticOS).
 */
import { permanentRedirect } from "next/navigation";

export default function CaddieSamtaleRedirect() {
  permanentRedirect("/admin/agenticos");
}
