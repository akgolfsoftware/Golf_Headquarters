"use server";

import { z } from "zod";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { osloDagSomDbDato } from "@/lib/portal/ph01-data";
import { hentEffektivNaa } from "@/lib/testing/dato-override";

const Input = z.object({ verdi: z.number().int().min(1).max(5) });

/** Dagsform på I dag: én verdi per Oslo-dag, nytt valg overskriver. Gjelder alltid innlogget spiller. */
export async function lagreDagsform(input: unknown): Promise<{ ok: true } | { ok: false; feil: string }> {
  const parsed = Input.safeParse(input);
  if (!parsed.success) return { ok: false, feil: "Ugyldig dagsform." };
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  const date = osloDagSomDbDato(await hentEffektivNaa(user.email));
  try {
    await prisma.playerDailyForm.upsert({
      where: { userId_date: { userId: user.id, date } },
      create: { userId: user.id, date, value: parsed.data.verdi },
      update: { value: parsed.data.verdi },
    });
    return { ok: true };
  } catch {
    return { ok: false, feil: "Dagsformen ble ikke lagret. Prøv igjen." };
  }
}
