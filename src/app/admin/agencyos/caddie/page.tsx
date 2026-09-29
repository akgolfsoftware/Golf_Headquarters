/**
 * Caddie-samtalen bor i Jarvis, fane «Samtale» (AG-19).
 */
import { permanentRedirect } from "next/navigation";

export default function CaddieSamtaleRedirect() {
  permanentRedirect("/admin/jarvis?fane=samtale");
}
