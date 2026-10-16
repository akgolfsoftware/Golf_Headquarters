import { PlayerHQSkallLaster } from "@/components/precision/PlayerHQSkallLaster";
import { LasterTilstand } from "@/components/precision/laster-tilstand";

export default function Loading() {
  return (
    <PlayerHQSkallLaster sti="/portal/planlegge/workbench">
      <div className="pa-side">
        <LasterTilstand text="Henter Workbench …" />
      </div>
    </PlayerHQSkallLaster>
  );
}
