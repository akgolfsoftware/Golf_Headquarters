/* PH-12 Velg treningsplan: lastetilstand i nytt design. Ren serverkomponent (gotchas §Bygg og drift). */
import { OvLaster } from "@/components/portal/precision/PH13OvLaster";

export default function Loading() {
  return <OvLaster dato="Plan · treningsplan" tekst="Henter standardplanene …" />;
}
