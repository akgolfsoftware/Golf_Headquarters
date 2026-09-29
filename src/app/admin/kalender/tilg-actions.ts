"use server";

/**
 * Tynn wrapper for AG-05s Tilgjengelighet-fane oppå den eksisterende
 * `addSlot`/`updateSlot` (uendret, ./availability/actions.ts). Ett vindu per
 * ukedag, ingen sted, ingen dato — se tilg-data.ts for omfanget.
 */

import { revalidatePath } from "next/cache";
import { addSlot, updateSlot } from "@/app/admin/(legacy)/availability/actions";

const STANDARD_RANGE = { startTime: "15:00", endTime: "19:00" };

export async function settUkedagAktiv(input: { weekday: number; slotId: string | null; paa: boolean; range: string }) {
  const [startTime, endTime] = input.range === "—" ? [STANDARD_RANGE.startTime, STANDARD_RANGE.endTime] : (input.range.split("–") as [string, string]);
  if (input.slotId) {
    await updateSlot(input.slotId, { weekday: input.weekday, startTime, endTime, active: input.paa });
  } else {
    await addSlot({ weekday: input.weekday, startTime, endTime, active: input.paa });
  }
  revalidatePath("/admin/kalender");
}
