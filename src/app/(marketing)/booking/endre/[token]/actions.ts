"use server";

/**
 * Gjest flytter eller avbestiller fra e-postlenken. Ingen innlogging: den signerte
 * lenken er tilgangen (`src/lib/booking/gjest-lenke.ts`), og alle regler sjekkes på
 * nytt i `gjest-endring.ts`, uansett hva siden viste.
 */
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { publicAction } from "@/lib/auth/action-guards";
import { gjestAvbestillTime, gjestFlyttTime } from "@/lib/booking/gjest-endring";

const Token = z.string().min(10).max(1000);
const Start = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/);

export async function gjestFlytt(token: string, startIso: string) {
  publicAction();
  const t = Token.safeParse(token);
  const s = Start.safeParse(startIso);
  if (!t.success || !s.success) return { ok: false, melding: "Ugyldig forespørsel." };
  const svar = await gjestFlyttTime(t.data, new Date(s.data));
  if (svar.ok) {
    revalidatePath("/admin/bookinger");
    revalidatePath("/admin/kalender");
  }
  return svar;
}

export async function gjestAvbestill(token: string) {
  publicAction();
  const t = Token.safeParse(token);
  if (!t.success) return { ok: false, melding: "Ugyldig forespørsel." };
  const svar = await gjestAvbestillTime(t.data);
  if (svar.ok) {
    revalidatePath("/admin/bookinger");
    revalidatePath("/admin/kalender");
  }
  return svar;
}
