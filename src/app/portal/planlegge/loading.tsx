import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH10PlanLaster } from "@/components/portal/precision/PH10PlanLaster";

export default function Loading() {
  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <PH10PlanLaster />
    </PlayerHQSkall>
  );
}
