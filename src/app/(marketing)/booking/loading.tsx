import { LasterTilstand } from "@/components/precision/pa";
import { BookingRamme } from "@/components/booking/precision/BookingRamme";

export default function Loading() {
  return (
    <BookingRamme>
      <LasterTilstand text="Henter ledige tider …" />
    </BookingRamme>
  );
}
