import { PlayerHQSkallLaster } from "@/components/precision/PlayerHQSkallLaster";
import { LasterTilstand } from "@/components/precision/laster-tilstand";

export default function Loading() {
  return (
    <PlayerHQSkallLaster sti="/portal/gjennomfore">
      <div className="pa-side">
        <LasterTilstand text="Henter dagens økter …" />
      </div>
    </PlayerHQSkallLaster>
  );
}
