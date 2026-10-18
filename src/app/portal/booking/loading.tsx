/* Lastetilstand for /portal/booking og undersider, nytt design (pakke 7). */
import { PlayerHQSkallLaster } from "@/components/precision/PlayerHQSkallLaster";
import { PHKommunikasjonLaster } from "@/components/portal/precision/PHKommunikasjonLaster";

export default function Loading() {
  return (
    <PlayerHQSkallLaster sti="/portal/booking">
      <PHKommunikasjonLaster variant="booking" />
    </PlayerHQSkallLaster>
  );
}
