"use server";
import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { lagreUtfordringForBruker } from "@/lib/datagolf/challenge-data";

export async function lagreDataGolfUtfordring(input: unknown) {
  const user = await requirePortalUser({ kreverTilgang: "TALENT", allow: ["PLAYER", "ADMIN", "COACH"] });
  try {
    const result = await lagreUtfordringForBruker(user.id, input);
    if (result.ok) revalidatePath("/portal/analysere/datagolf");
    return result;
  } catch {
    return { ok: false as const, message: "Kunne ikke lagre. Resultatet er fortsatt her. Prøv igjen." };
  }
}
