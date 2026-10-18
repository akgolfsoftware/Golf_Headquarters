"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireCoachActionUser } from "@/lib/auth/action-guards";
import { CoachingDraftInput } from "./coaching-oppfolging-kontrakt";
import { godkjennCoachingUtkast, klargjorCoachingOppfolging, lastCoachingUtkast } from "./coaching-oppfolging-queue";

export async function oppdaterCoachingEpostUtkast() {
  const actor = await requireCoachActionUser();
  const count = await klargjorCoachingOppfolging(actor);
  revalidatePath("/admin/innboks");
  return { ok: true as const, tekst: `${count} nye e-postutkast i godkjenningskøen. Ingenting er sendt.` };
}
export async function lesCoachingEpostUtkast(actionId: unknown) {
  await requireCoachActionUser();
  const id = z.string().min(1).max(128).parse(actionId);
  return lastCoachingUtkast(id);
}
export async function klargjorCoachingEpostUtkast(input: unknown) {
  await requireCoachActionUser();
  const { actionId, body } = CoachingDraftInput.parse(input);
  const result = await godkjennCoachingUtkast(actionId, body);
  revalidatePath("/admin/innboks");
  return result.status === "ACCEPTED" ? { ok: true as const, tekst: result.summary } : { ok: false as const, feil: result.summary };
}
