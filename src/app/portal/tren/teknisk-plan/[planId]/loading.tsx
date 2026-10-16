/* PH-TP-01: lastetilstand i nytt design. Ren serverkomponent (gotchas §Bygg og drift). */
import { OvLaster } from "@/components/portal/precision/PH13Felles";

export default function Loading() {
  return <OvLaster dato="Plan · teknisk plan" tekst="Henter den tekniske planen …" />;
}
