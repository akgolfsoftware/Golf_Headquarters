import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { LasterTilstand } from "@/components/precision/pa";

export default function Laster() {
  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <div className="pa-side">
        <LasterTilstand text="Henter dagens økter …" />
      </div>
    </PlayerHQSkall>
  );
}
