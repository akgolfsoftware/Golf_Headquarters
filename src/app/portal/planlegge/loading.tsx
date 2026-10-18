import { PlayerHQSkallLaster } from "@/components/precision/PlayerHQSkallLaster";
import { PH10PlanLaster } from "@/components/portal/precision/PH10PlanLaster";

export default function Loading() {
  return (
    <PlayerHQSkallLaster sti="/portal/planlegge">
      <PH10PlanLaster />
    </PlayerHQSkallLaster>
  );
}
