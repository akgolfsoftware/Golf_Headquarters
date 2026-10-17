/* Lastetilstand i nytt design (pakke 16). PH24MegLaster har ingen "use client" (gotchas §Bygg og drift). */
import { PH24MegLaster } from "@/components/portal/precision/PH24MegLaster";

export default function UtfordringerLoading() {
  return <PH24MegLaster tekst="Henter utfordringene …" />;
}
