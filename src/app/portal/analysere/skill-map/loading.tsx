import { PlayerHQSkallLaster } from "@/components/precision/PlayerHQSkallLaster";
import { TmLaster } from "@/components/portal/precision/PH17TmLaster";

export default function Loading() {
  return (
    <PlayerHQSkallLaster sti="/portal/analysere/skill-map">
      <TmLaster tekst="Henter skill map" />
    </PlayerHQSkallLaster>
  );
}
