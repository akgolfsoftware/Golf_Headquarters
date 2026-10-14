"use server";
import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { kanSeDataGolf } from "@/lib/auth/datagolf-regel";
import { lagreUtfordringForBruker } from "@/lib/datagolf/challenge-data";

export async function lagreDataGolfUtfordring(input: unknown) {
  // Data Golf er bare for coach og admin (Anders 09.10.2026).
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  if (!kanSeDataGolf(user)) return { ok: false as const, message: "Data Golf er bare tilgjengelig for coacher." };
  try {
    const result = await lagreUtfordringForBruker(user.id, input);
    if (result.ok) revalidatePath("/portal/analysere/datagolf");
    return result;
  } catch {
    return { ok: false as const, message: "Kunne ikke lagre. Resultatet er fortsatt her. Prøv igjen." };
  }
}
