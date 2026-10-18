/* Lastetilstand i nytt design (pakke 14). PH24MegLaster har ingen "use client" (gotchas §Bygg og drift). */
import { PH24MegLaster } from "@/components/portal/precision/PH24MegLaster";

export default function Loading() {
  return <PH24MegLaster tekst="Henter turneringsresultatene …" />;
}
