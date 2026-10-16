import { PlayerHQSkallLaster } from "@/components/precision/PlayerHQSkallLaster";
import { LasterTilstand } from "@/components/precision/laster-tilstand";

export default function Loading() {
  return (
    <PlayerHQSkallLaster sti="/portal/tren/feiring/[planId]">
      <div className="pa-side">
        <LasterTilstand text="Henter plan-feiringen …" />
      </div>
    </PlayerHQSkallLaster>
  );
}
