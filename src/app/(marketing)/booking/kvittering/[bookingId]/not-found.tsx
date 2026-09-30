import { CalendarPlus, Receipt } from "lucide-react";
import { KnappLenke, TomTilstand } from "@/components/precision/pa";
import { BookingRamme } from "@/components/booking/precision/BookingRamme";

export default function IngenBooking() {
  return (
    <BookingRamme smal>
      <TomTilstand
        icon={Receipt}
        title="Fant ingen booking"
        text="Lenken peker ikke til en booking. Sjekk e-posten fra oss, eller book på nytt."
        actions={<KnappLenke icon={CalendarPlus} href="/booking">Book time</KnappLenke>}
      />
    </BookingRamme>
  );
}
