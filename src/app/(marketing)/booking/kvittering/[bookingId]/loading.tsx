import { LasterTilstand } from "@/components/precision/pa";
import { BookingRamme } from "@/components/booking/precision/BookingRamme";

export default function Loading() {
  return (
    <BookingRamme smal>
      <LasterTilstand text="Henter kvitteringen …" />
    </BookingRamme>
  );
}
