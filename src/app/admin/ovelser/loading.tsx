/* Øvelsesbanken i AgencyOS: lastetilstand. Ren serverkomponent (gotchas §Bygg og drift). */
import { OvLaster } from "@/components/portal/precision/PH13OvLaster";

export default function Loading() {
  return <OvLaster dato="Workbench · øvelsesbank" tekst="Henter øvelsene …" />;
}
