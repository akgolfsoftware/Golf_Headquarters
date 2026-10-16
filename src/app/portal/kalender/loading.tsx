import { PlayerHQSkallLaster } from "@/components/precision/PlayerHQSkallLaster";
import { LasterTilstand } from "@/components/precision/laster-tilstand";

export default function Loading() {
  return (
    <PlayerHQSkallLaster sti="/portal/kalender">
      <div className="pa-side">
        <LasterTilstand text="Henter kalenderen …" />
      </div>
    </PlayerHQSkallLaster>
  );
}
