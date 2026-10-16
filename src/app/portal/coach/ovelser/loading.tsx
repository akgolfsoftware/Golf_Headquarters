/* Lastetilstand i nytt design (pakke 11 og 12). Ingen klientmoduler i importtreet (gotchas §Bygg og drift). */
import { PlayerHQSkallLaster } from "@/components/precision/PlayerHQSkallLaster";
import { PHBookingMeldingerLaster } from "@/components/portal/precision/PHBookingMeldingerLaster";

export default function Loading() {
  return (
    <PlayerHQSkallLaster sti="/portal/coach">
      <PHBookingMeldingerLaster variant="ovelser" />
    </PlayerHQSkallLaster>
  );
}
