"use server";
import { requireCoachActionUser } from "@/lib/auth/action-guards";
import { aksepterTrenerInvitasjon } from "@/lib/deling/navngitt";
export async function aksepterNavngittDelingAction(input: unknown) {
  await requireCoachActionUser();
  return aksepterTrenerInvitasjon(input);
}
