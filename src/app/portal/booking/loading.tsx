/* Lastetilstand for /portal/booking og undersider, nytt design (pakke 7). */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PHKommunikasjonLaster } from "@/components/portal/precision/PHKommunikasjonLaster";

export default function Loading() {
  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <PHKommunikasjonLaster variant="booking" />
    </PlayerHQSkall>
  );
}
