"use server";
import { revalidatePath } from "next/cache";
import { requireDataGolfAnalyst } from "@/lib/datagolf/access";
import { lagreUtfordringForBruker } from "@/lib/datagolf/challenge-data";
import { requireCoachActionUser } from "@/lib/auth/action-guards";

export async function lagreDataGolfUtfordring(input: unknown) {
  const actor = await requireCoachActionUser();
  const user = await requireDataGolfAnalyst(actor.id);
  try {
    const result = await lagreUtfordringForBruker(user.id, input);
    if (result.ok) revalidatePath("/portal/analysere/datagolf");
    return result;
  } catch {
    return { ok: false as const, message: "Kunne ikke lagre. Resultatet er fortsatt her. Prøv igjen." };
  }
}
