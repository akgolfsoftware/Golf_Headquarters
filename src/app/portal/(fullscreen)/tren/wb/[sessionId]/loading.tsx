import { PlayerHQSkallLaster } from "@/components/precision/PlayerHQSkallLaster";
import { LasterTilstand } from "@/components/precision/laster-tilstand";

export default function Laster() {
  return (
    <PlayerHQSkallLaster sti="/portal/tren/wb/[sessionId]">
      <div className="pa-side">
        <LasterTilstand text="Henter økten …" />
      </div>
    </PlayerHQSkallLaster>
  );
}
