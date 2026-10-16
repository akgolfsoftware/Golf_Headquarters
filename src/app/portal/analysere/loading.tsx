import { PlayerHQSkallLaster } from "@/components/precision/PlayerHQSkallLaster";
import { LasterTilstand } from "@/components/precision/laster-tilstand";

export default function Loading() {
  return (
    <PlayerHQSkallLaster sti="/portal/analysere">
      <div className="pa-side">
        <LasterTilstand text="Henter analysen …" />
      </div>
    </PlayerHQSkallLaster>
  );
}
