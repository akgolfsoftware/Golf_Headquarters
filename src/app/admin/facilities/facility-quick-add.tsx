"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import {
  QuickAddSessionModal,
  type FacilityOption,
  type LocationOption,
  type QuickAddSlot,
  type ServiceTypeOption,
  type SpillerOption,
} from "@/components/admin/quick-add-session-modal";

type Props = {
  facility: { id: string; name: string; locationId: string };
  spillere: SpillerOption[];
  serviceTypes: ServiceTypeOption[];
  locations: LocationOption[];
  facilities: FacilityOption[];
};

/**
 * Liten knapp + modal-trigger som lar admin opprette en booking direkte
 * fra et fasilitet-kort på /admin/facilities. Booking-en blir forhåndsutfylt
 * med riktig facility + locationId.
 */
export function FacilityQuickAdd({
  facility,
  spillere,
  serviceTypes,
  locations,
  facilities,
}: Props) {
  const [slot, setSlot] = useState<QuickAddSlot | null>(null);

  function openModal(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    // Default-tid: neste rundede time fra nå
    const start = new Date();
    start.setMinutes(0, 0, 0);
    start.setHours(start.getHours() + 1);
    setSlot({
      startIso: start.toISOString(),
      datoLabel: start.toLocaleDateString("nb-NO", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
      tidLabel: start.toLocaleTimeString("nb-NO", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      ukedag: start.toLocaleDateString("nb-NO", { weekday: "long" }),
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.10em] text-foreground transition-colors hover:border-primary hover:text-primary"
        aria-label={`Legg til booking på ${facility.name}`}
      >
        <Plus className="h-3 w-3" strokeWidth={2} />
        Booking
      </button>
      <QuickAddSessionModal
        slot={slot}
        onClose={() => setSlot(null)}
        spillere={spillere}
        serviceTypes={serviceTypes}
        locations={locations}
        facilities={facilities}
        defaultLocationId={facility.locationId}
        defaultFacilityId={facility.id}
      />
    </>
  );
}
