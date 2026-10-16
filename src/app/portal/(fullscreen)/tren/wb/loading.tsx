import { PlayerHQSkallLaster } from "@/components/precision/PlayerHQSkallLaster";
import { LasterTilstand } from "@/components/precision/laster-tilstand";

export default function Laster() {
  return (
    <PlayerHQSkallLaster sti="/portal/tren/wb">
      <div className="pa-side">
        <LasterTilstand text="Henter dagens økter …" />
      </div>
    </PlayerHQSkallLaster>
  );
}
