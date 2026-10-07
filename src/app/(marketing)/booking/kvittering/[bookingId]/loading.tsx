import { BK03Ramme } from "@/components/marketing/precision/BK03Ramme";
import { LasterTilstand } from "@/components/precision/pa";

export default function Laster() {
  return (
    <BK03Ramme>
      <LasterTilstand text="Henter kvitteringen …" />
    </BK03Ramme>
  );
}
