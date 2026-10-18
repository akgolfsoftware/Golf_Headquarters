import { PlayerHQSkallLaster } from "@/components/precision/PlayerHQSkallLaster";
import { PHKommunikasjonLaster } from "@/components/portal/precision/PHKommunikasjonLaster";

export default function Loading() {
  return (
    <PlayerHQSkallLaster sti="/portal/coach/ai">
      <PHKommunikasjonLaster variant="caddie" />
    </PlayerHQSkallLaster>
  );
}
